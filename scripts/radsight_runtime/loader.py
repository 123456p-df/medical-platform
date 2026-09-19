from __future__ import annotations

import json
import logging
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch

from .bootstrap import ensure_vendor_on_path, shim_optional_video_deps
from .env import RadSightSettings
from .quantize import apply_weight_only_quant, load_quantized_snapshot, save_quantized_snapshot

logger = logging.getLogger("radsight.loader")


@dataclass
class LoadedModel:
    tokenizer: Any
    model: Any
    processor: Any
    device: str
    dtype: torch.dtype
    quant: str
    attn: str
    quant_cache_hit: bool
    vision_encoder_path: str
    weights_path: str


def _torch_dtype(name: str) -> torch.dtype:
    if name in {"float16", "fp16"}:
        return torch.float16
    if name in {"float32", "fp32"}:
        return torch.float32
    return torch.bfloat16


def _prepare_runtime_checkpoint(settings: RadSightSettings) -> Path:
    model_path = settings.model_path
    if not model_path.exists():
        raise FileNotFoundError(f"RadSight weights not found: {model_path}")
    if not settings.vision_encoder_path.exists():
        raise FileNotFoundError(
            "SigLIP-NaViT vision encoder is missing at "
            f"{settings.vision_encoder_path}. Download DAMO-NLP-SG/VL3-SigLIP-NaViT first."
        )

    runtime_dir = Path.home() / ".cache" / "radsight" / "runtime-checkpoint"
    if runtime_dir.exists():
        shutil.rmtree(runtime_dir)
    runtime_dir.mkdir(parents=True, exist_ok=True)
    for item in model_path.iterdir():
        dest = runtime_dir / item.name
        if item.name == "config.json":
            config = json.loads(item.read_text())
            config["vision_encoder"] = str(settings.vision_encoder_path)
            config["mm_attn_implementation"] = settings.attn
            dest.write_text(json.dumps(config, indent=2))
            continue
        if item.is_dir():
            dest.symlink_to(item, target_is_directory=True)
        else:
            dest.symlink_to(item)
    return runtime_dir


def load_radsight(settings: RadSightSettings) -> LoadedModel:
    import transformers  # noqa: F401  # import before video shims so find_spec("decord") is safe

    shim_optional_video_deps()
    ensure_vendor_on_path()

    from radsight.model import load_pretrained_model
    from radsight.mm_utils import get_model_name_from_path
    from radsight.model.processor import RadSightProcessor

    runtime_dir = _prepare_runtime_checkpoint(settings)
    dtype = _torch_dtype(settings.dtype_name)
    device = settings.device
    model_name = get_model_name_from_path(str(settings.model_path))
    quant_applied = "none"
    cache_hit = False
    cache_file = settings.quant_cache / "quantized.pt"
    load_kwargs = {
        "load_4bit": False,
        "load_8bit": False,
        "attn_implementation": settings.attn,
        "torch_dtype": dtype,
    }
    try:
        tokenizer, model, image_processor, _context_len = load_pretrained_model(
            str(runtime_dir),
            None,
            model_name,
            device_map={"": device} if device != "cpu" else "cpu",
            **load_kwargs,
        )
    except Exception as exc:
        logger.warning("device_map=%s failed (%s); loading on CPU then moving", device, exc)
        tokenizer, model, image_processor, _context_len = load_pretrained_model(
            str(runtime_dir),
            None,
            model_name,
            device_map="cpu",
            **load_kwargs,
        )

    model.config.use_token_compression = False
    model.config.mm_attn_implementation = settings.attn
    model.eval()

    if settings.quant != "none":
        if load_quantized_snapshot(model, cache_file, settings.quant):
            cache_hit = True
            quant_applied = settings.quant
        else:
            try:
                quant_applied = apply_weight_only_quant(model, settings.quant)
                try:
                    save_quantized_snapshot(model, cache_file, quant_applied)
                except Exception as exc:
                    logger.warning("Could not persist quant cache: %s", exc)
            except Exception as exc:
                logger.warning("Quantization %s failed, staying on BF16: %s", settings.quant, exc)
                quant_applied = "none"

    try:
        model.to(device)
    except Exception as exc:
        logger.warning("model.to(%s) failed (%s); leaving device_map placement", device, exc)

    processor = RadSightProcessor(image_processor, tokenizer)
    return LoadedModel(
        tokenizer=tokenizer,
        model=model,
        processor=processor,
        device=device,
        dtype=dtype,
        quant=quant_applied,
        attn=settings.attn,
        quant_cache_hit=cache_hit,
        vision_encoder_path=str(settings.vision_encoder_path),
        weights_path=str(settings.model_path),
    )
