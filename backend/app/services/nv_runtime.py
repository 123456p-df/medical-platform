"""Apple Silicon / CPU-safe runtime helpers for NV-Segment-CTMR (VISTA3D)."""

from __future__ import annotations

import logging
from contextlib import nullcontext
from functools import wraps
from pathlib import Path

from app.services.mps_ops import apply_mps_operator_shims

logger = logging.getLogger(__name__)

try:
    import torch
except ImportError:
    torch = None


def mps_supports_vista3d() -> bool:
    """True when native or shimmed conv_transpose3d runs on MPS."""
    if torch is None or not (getattr(torch.backends, "mps", None) and torch.backends.mps.is_available()):
        return False
    apply_mps_operator_shims()
    try:
        dummy = torch.zeros(1, 1, 4, 4, 4, device="mps")
        weight = torch.zeros(1, 1, 3, 3, 3, device="mps")
        torch.nn.functional.conv_transpose3d(dummy, weight)
        return True
    except Exception:
        return False


def resolve_nv_segment_device(requested: str | None) -> str:
    """Map config (`auto` / `cuda:0` / `mps` / `cpu`) onto a device that exists here."""
    name = (requested or "auto").strip().lower()
    mps_ok = mps_supports_vista3d()
    cuda_ok = bool(torch is not None and torch.cuda.is_available())

    if name in {"auto", ""}:
        if cuda_ok:
            return "cuda:0"
        if mps_ok:
            return "mps"
        if torch is not None and getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
            logger.warning(
                "MPS is available but ConvTranspose3d is not implemented; NV-Segment will use CPU"
            )
        return "cpu"
    if name.startswith("mps"):
        if mps_ok:
            return "mps"
        logger.warning("NV_SEGMENT_DEVICE=mps is not usable for VISTA3D (ConvTranspose3d); using CPU")
        return "cpu"
    if name.startswith("cuda"):
        if cuda_ok:
            return name
        if mps_ok:
            logger.warning("NV_SEGMENT_DEVICE=%s but CUDA is unavailable; using MPS", requested)
            return "mps"
        logger.warning("NV_SEGMENT_DEVICE=%s but CUDA is unavailable; using CPU", requested)
        return "cpu"
    if name == "cpu":
        return "cpu"
    logger.warning("Unknown NV_SEGMENT_DEVICE=%s; using auto", requested)
    return resolve_nv_segment_device("auto")


def amp_enabled_for(device_name: str) -> bool:
    return resolve_nv_segment_device(device_name).startswith("cuda")


def apply_non_cuda_torch_patches() -> None:
    """VISTA3D hardcodes CUDA autocast and empty_cache; neutralize those on MPS/CPU."""
    if torch is None:
        return
    apply_mps_operator_shims()
    if torch.cuda.is_available():
        return

    original_autocast = torch.autocast

    def _autocast(device_type=None, *args, **kwargs):
        if device_type in {None, "cuda", "cuda:0"}:
            return nullcontext()
        try:
            return original_autocast(device_type, *args, **kwargs)
        except (TypeError, RuntimeError, ValueError):
            return nullcontext()

    torch.autocast = _autocast  # type: ignore[method-assign]
    torch.cuda.empty_cache = lambda: None  # type: ignore[method-assign]
    logger.info("Patched torch.autocast/empty_cache for non-CUDA NV-Segment inference")


def inner_vista3d_state_dict(state: dict) -> dict:
    """Map a HF or inner checkpoint onto ``VISTA3DModel.network`` keys.

    Published NV-Segment snapshots store ``image_encoder.*`` / ``class_head.*`` /
    ``point_head.*``. HuggingFace ``VISTA3DModel.from_pretrained`` looks for
    ``network.*`` and otherwise leaves the SegResNet randomly initialized.
    """
    remapped = {}
    for key, value in state.items():
        remapped[key[len("network.") :] if key.startswith("network.") else key] = value
    return remapped


def load_vista3d_inner_weights(model, model_dir: Path | str) -> int:
    """Overwrite ``model.network`` with the NV-Segment snapshot (inner keys)."""
    if torch is None:
        raise RuntimeError("PyTorch is required")
    network = getattr(model, "network", None)
    if network is None:
        raise RuntimeError("VISTA3D model has no .network to load weights into")
    folder = Path(model_dir)
    safetensors = folder / "model.safetensors"
    pt_file = folder / "model.pt"
    if safetensors.is_file():
        from safetensors.torch import load_file

        state = load_file(str(safetensors))
    elif pt_file.is_file():
        state = torch.load(pt_file, map_location="cpu", weights_only=True)
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
    else:
        raise FileNotFoundError(f"No VISTA3D weights under {folder}")
    if not isinstance(state, dict) or not state:
        raise RuntimeError(f"VISTA3D checkpoint at {folder} is empty")
    remapped = inner_vista3d_state_dict(state)
    missing, unexpected = network.load_state_dict(remapped, strict=True)
    if missing or unexpected:
        raise RuntimeError(
            f"VISTA3D weight remap mismatch missing={list(missing)[:8]} unexpected={list(unexpected)[:8]}"
        )
    logger.info("Loaded %s tensors into VISTA3D model.network from %s", len(remapped), folder)
    return len(remapped)


def wrap_pipeline_for_device(pipeline, device_name: str):
    """Force amp off on MPS/CPU and keep sliding-window inference on the resolved device."""
    if pipeline is None or not hasattr(pipeline, "_forward"):
        return pipeline
    if torch is None:
        return pipeline
    use_amp = amp_enabled_for(device_name)
    original = pipeline._forward
    original_post = getattr(pipeline, "postprocess", None)
    infer_device = torch.device(device_name)
    network = getattr(getattr(pipeline, "model", None), "network", None)
    if network is not None:
        network.to(infer_device)
        network.eval()

    @wraps(original)
    def _forward(inputs, mode=None, amp=True, hyper_kwargs=None, **kwargs):
        call_kwargs = dict(kwargs)
        if mode is not None:
            call_kwargs["mode"] = mode
        call_kwargs["amp"] = bool(use_amp and amp)
        if hyper_kwargs is not None:
            call_kwargs["hyper_kwargs"] = hyper_kwargs
        pipeline.device = infer_device
        with torch.inference_mode():
            return original(inputs, **call_kwargs)

    pipeline._forward = _forward
    if original_post is not None and device_name == "mps":

        @wraps(original_post)
        def _postprocess(outputs, **kwargs):
            saved = pipeline.device
            pipeline.device = torch.device("cpu")
            try:
                if isinstance(outputs, dict):
                    cpu_out = {
                        key: value.detach().cpu() if torch.is_tensor(value) else value
                        for key, value in outputs.items()
                    }
                else:
                    cpu_out = outputs
                return original_post(cpu_out, **kwargs)
            finally:
                pipeline.device = saved

        pipeline.postprocess = _postprocess
    pipeline._vmrb_amp = use_amp
    pipeline._vmrb_device = device_name
    return pipeline
