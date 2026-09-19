from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Any, Optional

import numpy as np
import torch
from monai.transforms import Compose, LoadImaged, ScaleIntensityRanged, Spacingd

from .loader import LoadedModel
from .volume import parse_clinical_sections, resolve_volume_path

logger = logging.getLogger("radsight.infer")

REF_SPACING = (1.0, 1.0, 5.0)


def load_volume_tensor(ct_path: str, search_roots: Optional[list[Path]] = None) -> torch.Tensor:
    resolved = resolve_volume_path(ct_path, search_roots=search_roots)
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


def _move_to_device(inputs: dict[str, Any], device: str, dtype: torch.dtype) -> dict[str, Any]:
    moved = {}
    for key, value in inputs.items():
        if isinstance(value, torch.Tensor):
            tensor = value.to(device)
            if key == "pixel_values":
                tensor = tensor.to(dtype)
            moved[key] = tensor
        else:
            moved[key] = value
    return moved


def generate_volume_answer(
    bundle: LoadedModel,
    ct_path: str,
    question: str,
    *,
    max_new_tokens: int = 2048,
    search_roots: Optional[list[Path]] = None,
) -> dict[str, Any]:
    started = time.perf_counter()
    volume = load_volume_tensor(ct_path, search_roots=search_roots)
    conversation = [
        {
            "role": "user",
            "content": [
                {"type": "video", "num_frames": 12},
                {"type": "text", "text": question},
            ],
        }
    ]
    modal = "volume"
    inputs = bundle.processor(
        images=[volume],
        text=conversation,
        merge_size=1,
        modal=modal,
        return_tensors="pt",
    )
    inputs = _move_to_device(dict(inputs), bundle.device, bundle.dtype)
    with torch.inference_mode():
        output_ids = bundle.model.generate(
            **inputs,
            do_sample=False,
            modals=[modal],
            max_new_tokens=max_new_tokens,
            use_cache=True,
            pad_token_id=bundle.tokenizer.eos_token_id,
        )
    raw_text = bundle.tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0].strip()
    analysis = parse_clinical_sections(raw_text)
    latency_ms = int((time.perf_counter() - started) * 1000)
    return {
        "raw_text": raw_text,
        "analysis": analysis,
        "latency_ms": latency_ms,
        "modal": modal,
    }
