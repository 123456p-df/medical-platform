from __future__ import annotations

import logging
from pathlib import Path
from typing import Callable

import torch
import torch.nn as nn

logger = logging.getLogger("radsight.quantize")

_SKIP_FRAGMENTS = (
    "vision_encoder",
    "vision_encoder_3d",
    "mm_projector",
    "visual",
    "vision_tower",
)


def llm_linear_filter(module: nn.Module, fqn: str) -> bool:
    name = fqn.lower()
    if any(fragment in name for fragment in _SKIP_FRAGMENTS):
        return False
    return isinstance(module, nn.Linear)


def _quantize_int8(model: nn.Module, filter_fn: Callable) -> None:
    try:
        from torchao.quantization import Int8WeightOnlyConfig, quantize_
    except ImportError:
        from torchao.quantization.quant_api import int8_weight_only, quantize_

        quantize_(model, int8_weight_only(), filter_fn=filter_fn)
        return
    quantize_(model, Int8WeightOnlyConfig(), filter_fn=filter_fn)


def _quantize_int4(model: nn.Module, filter_fn: Callable) -> None:
    try:
        from torchao.quantization import Int4WeightOnlyConfig, quantize_
    except ImportError:
        from torchao.quantization.quant_api import int4_weight_only, quantize_

        quantize_(model, int4_weight_only(group_size=128), filter_fn=filter_fn)
        return
    quantize_(model, Int4WeightOnlyConfig(group_size=128), filter_fn=filter_fn)


def apply_weight_only_quant(model: nn.Module, quant: str) -> str:
    if quant in {"none", "bf16", ""}:
        return "none"
    if quant == "int4":
        _quantize_int4(model, llm_linear_filter)
        return "int4"
    _quantize_int8(model, llm_linear_filter)
    return "int8"


def save_quantized_snapshot(model: nn.Module, cache_path: Path, quant: str) -> None:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "quant": quant,
        "state_dict": {k: v.cpu() for k, v in model.state_dict().items()},
    }
    torch.save(payload, cache_path)
    logger.info("Wrote quantized snapshot to %s", cache_path)


def load_quantized_snapshot(model: nn.Module, cache_path: Path, quant: str) -> bool:
    if not cache_path.exists():
        return False
    try:
        payload = torch.load(cache_path, map_location="cpu", weights_only=False)
        if not isinstance(payload, dict) or payload.get("quant") != quant:
            logger.warning("Ignoring quant cache with mismatched metadata: %s", cache_path)
            return False
        apply_weight_only_quant(model, quant)
        missing, unexpected = model.load_state_dict(payload["state_dict"], strict=False)
        logger.info(
            "Loaded quantized snapshot %s (missing=%s unexpected=%s)",
            cache_path,
            len(missing),
            len(unexpected),
        )
        return True
    except Exception as exc:
        logger.warning("Failed to load quant cache %s: %s", cache_path, exc)
        return False
