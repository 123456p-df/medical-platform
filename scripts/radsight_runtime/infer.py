from __future__ import annotations

import logging
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import numpy as np
import torch
from monai.transforms import Compose, LoadImaged, ScaleIntensityRanged, Spacingd

from .loader import LoadedModel
from .volume import parse_clinical_sections, resolve_volume_path

logger = logging.getLogger("radsight.infer")

REF_SPACING = (1.0, 1.0, 5.0)


@dataclass(frozen=True)
class _VolumeCacheKey:
    path: str
    size: int
    mtime_ns: int


class VolumeTensorCache:
    """Small, file-versioned LRU for expensive CT decompression and resampling."""

    def __init__(self, max_entries: int = 2):
        self.max_entries = max(0, int(max_entries))
        self._items: OrderedDict[_VolumeCacheKey, torch.Tensor] = OrderedDict()
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def get(
        self, ct_path: str, search_roots: Optional[list[Path]] = None
    ) -> tuple[torch.Tensor, bool]:
        resolved = resolve_volume_path(ct_path, search_roots=search_roots)
        stat = resolved.stat()
        key = _VolumeCacheKey(str(resolved), stat.st_size, stat.st_mtime_ns)
        if self.max_entries:
            with self._lock:
                cached = self._items.get(key)
                if cached is not None:
                    self._items.move_to_end(key)
                    self.hits += 1
                    return cached, True

        volume = _load_volume_tensor(resolved)
        with self._lock:
            self.misses += 1
            if self.max_entries:
                # Drop stale versions of the same file before admitting the new tensor.
                for existing in list(self._items):
                    if existing.path == key.path and existing != key:
                        self._items.pop(existing, None)
                self._items[key] = volume
                self._items.move_to_end(key)
                while len(self._items) > self.max_entries:
                    self._items.popitem(last=False)
        return volume, False

    def info(self) -> dict[str, int]:
        with self._lock:
            return {
                "entries": len(self._items),
                "max_entries": self.max_entries,
                "hits": self.hits,
                "misses": self.misses,
            }


def _load_volume_tensor(resolved: Path) -> torch.Tensor:
    try:
        transform = Compose(
            [
                LoadImaged(keys=["image"], image_only=False, ensure_channel_first=True),
                Spacingd(keys=["image"], pixdim=REF_SPACING, mode="bilinear"),
                ScaleIntensityRanged(
                    keys=["image"],
                    a_min=-1000.0,
                    a_max=1000.0,
                    b_min=0.0,
                    b_max=1.0,
                    clip=True,
                ),
            ]
        )
        data = transform({"image": str(resolved)})
    except Exception as exc:
        logger.warning("Full CT preprocess failed (%s); loading volume without resampling", exc)
        data = LoadImaged(keys=["image"], image_only=False, ensure_channel_first=True)(
            {"image": str(resolved)}
        )
    volume = data["image"]
    if not torch.is_tensor(volume):
        volume = torch.as_tensor(np.asarray(volume))
    if volume.ndim == 4 and volume.shape[0] > 1:
        volume = volume[:1]
    return volume


def load_volume_tensor(ct_path: str, search_roots: Optional[list[Path]] = None) -> torch.Tensor:
    resolved = resolve_volume_path(ct_path, search_roots=search_roots)
    return _load_volume_tensor(resolved)


def _move_to_device(inputs: dict[str, Any], device: str, dtype: torch.dtype) -> dict[str, Any]:
    moved = {}
    for key, value in inputs.items():
        if isinstance(value, torch.Tensor):
            target_dtype = dtype if key == "pixel_values" else value.dtype
            tensor = value.to(device=device, dtype=target_dtype)
            moved[key] = tensor
        else:
            moved[key] = value
    return moved


def generate_volume_answer(
    bundle: LoadedModel,
    ct_path: str,
    question: str,
    *,
    max_new_tokens: int = 512,
    num_frames: int = 12,
    search_roots: Optional[list[Path]] = None,
    volume_cache: Optional[VolumeTensorCache] = None,
) -> dict[str, Any]:
    started = time.perf_counter()
    preprocess_started = time.perf_counter()
    if volume_cache is None:
        volume = load_volume_tensor(ct_path, search_roots=search_roots)
        volume_cache_hit = False
    else:
        volume, volume_cache_hit = volume_cache.get(ct_path, search_roots=search_roots)
    volume_ms = int((time.perf_counter() - preprocess_started) * 1000)
    conversation = [
        {
            "role": "user",
            "content": [
                {"type": "video", "num_frames": num_frames},
                {"type": "text", "text": question},
            ],
        }
    ]
    modal = "volume"
    processor_started = time.perf_counter()
    inputs = bundle.processor(
        images=[volume],
        text=conversation,
        merge_size=1,
        modal=modal,
        return_tensors="pt",
    )
    processor_ms = int((time.perf_counter() - processor_started) * 1000)
    transfer_started = time.perf_counter()
    inputs = _move_to_device(dict(inputs), bundle.device, bundle.dtype)
    transfer_ms = int((time.perf_counter() - transfer_started) * 1000)
    generation_started = time.perf_counter()
    with torch.inference_mode():
        output_ids = bundle.model.generate(
            **inputs,
            do_sample=False,
            modals=[modal],
            max_new_tokens=max_new_tokens,
            use_cache=True,
            pad_token_id=bundle.tokenizer.eos_token_id,
        )
    generation_ms = int((time.perf_counter() - generation_started) * 1000)
    decode_started = time.perf_counter()
    raw_text = bundle.tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0].strip()
    decode_ms = int((time.perf_counter() - decode_started) * 1000)
    analysis = parse_clinical_sections(raw_text)
    latency_ms = int((time.perf_counter() - started) * 1000)
    return {
        "raw_text": raw_text,
        "analysis": analysis,
        "latency_ms": latency_ms,
        "modal": modal,
        "volume_cache_hit": volume_cache_hit,
        "timings_ms": {
            "volume": volume_ms,
            "processor": processor_ms,
            "transfer": transfer_ms,
            "generation": generation_ms,
            "decode": decode_ms,
        },
    }
