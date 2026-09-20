from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
VENDOR_ROOT = PROJECT_ROOT / "third_party" / "damo-RadSight"
DEFAULT_MODEL_PATH = Path("/Users/allenyuan/modilify_app/RadSight-8B")
DEFAULT_VISION_ENCODER = Path("/Users/allenyuan/modilify_app/VL3-SigLIP-NaViT")
DEFAULT_QUANT_CACHE = Path.home() / ".cache" / "radsight" / "RadSight-8B-int8"


def _bool_env(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def detect_device() -> str:
    requested = os.environ.get("RADSIGHT_DEVICE", "").strip().lower()
    if requested in {"mps", "cpu", "cuda"}:
        return requested
    try:
        import torch

        if torch.backends.mps.is_available():
            return "mps"
        if torch.cuda.is_available():
            return "cuda"
    except Exception:
        pass
    return "cpu"


@dataclass(frozen=True)
class RadSightSettings:
    model_path: Path
    vision_encoder_path: Path
    quant: str
    quant_cache: Path
    device: str
    dtype_name: str
    attn: str
    max_new_tokens: int
    allow_stub: bool
    port: int
    load_timeout_s: float
    infer_timeout_s: float

    @property
    def stub_requested(self) -> bool:
        return self.allow_stub


def load_settings() -> RadSightSettings:
    quant = os.environ.get("RADSIGHT_QUANT", "int8").strip().lower()
    if quant not in {"none", "bf16", "int8", "int4"}:
        quant = "int8"
    if quant == "bf16":
        quant = "none"
    cache_default = DEFAULT_QUANT_CACHE if quant == "int8" else Path.home() / ".cache" / "radsight" / f"RadSight-8B-{quant}"
    return RadSightSettings(
        model_path=Path(os.environ.get("RADSIGHT_MODEL_PATH", str(DEFAULT_MODEL_PATH))).expanduser(),
        vision_encoder_path=Path(
            os.environ.get("RADSIGHT_VISION_ENCODER_PATH", str(DEFAULT_VISION_ENCODER))
        ).expanduser(),
        quant=quant,
        quant_cache=Path(os.environ.get("RADSIGHT_QUANT_CACHE", str(cache_default))).expanduser(),
        device=detect_device(),
        dtype_name=os.environ.get("RADSIGHT_DTYPE", "bfloat16").strip().lower(),
        attn=os.environ.get("RADSIGHT_ATTN", "sdpa").strip().lower(),
        max_new_tokens=int(os.environ.get("RADSIGHT_MAX_NEW_TOKENS", "2048")),
        allow_stub=_bool_env("RADSIGHT_ALLOW_STUB", False),
        port=int(os.environ.get("RADSIGHT_PORT", "8001")),
        load_timeout_s=float(os.environ.get("RADSIGHT_LOAD_TIMEOUT_S", "600")),
        infer_timeout_s=float(os.environ.get("RADSIGHT_INFER_TIMEOUT_S", "300")),
    )
