from __future__ import annotations

import importlib.machinery
import sys
import types
from pathlib import Path

from .env import VENDOR_ROOT


def _dummy_module(name: str) -> types.ModuleType:
    mod = types.ModuleType(name)
    mod.__spec__ = importlib.machinery.ModuleSpec(name, loader=None)
    return mod


def shim_optional_video_deps() -> None:
    """Official mm_utils imports video stacks we do not need for 3D CT."""
    if "decord" not in sys.modules:
        try:
            import decord  # noqa: F401
        except Exception:
            mod = _dummy_module("decord")

            class _VideoReader:
                def __init__(self, *args, **kwargs):
                    raise RuntimeError("decord is unavailable; 2D video inference is not enabled")

            mod.VideoReader = _VideoReader
            mod.cpu = lambda *args, **kwargs: None
            sys.modules["decord"] = mod
    if "ffmpeg" not in sys.modules:
        try:
            import ffmpeg  # noqa: F401
        except Exception:
            sys.modules["ffmpeg"] = _dummy_module("ffmpeg")


def ensure_vendor_on_path() -> Path:
    if not VENDOR_ROOT.exists():
        raise FileNotFoundError(f"Vendored damo-RadSight is missing: {VENDOR_ROOT}")
    vendor = str(VENDOR_ROOT)
    if vendor not in sys.path:
        sys.path.insert(0, vendor)
    encoder_dir = VENDOR_ROOT / "radsight" / "model" / "radsight_encoder"
    encoder_path = str(encoder_dir)
    if encoder_path not in sys.path:
        sys.path.insert(0, encoder_path)
    return VENDOR_ROOT
