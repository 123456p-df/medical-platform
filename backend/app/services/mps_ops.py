"""Missing PyTorch MPS operators used by NV-Segment / VISTA3D.

Current macOS PyTorch builds reject ``conv_transpose3d`` and ``float64`` on
MPS. This module implements transposed 3D convolution with ``conv3d`` (which
MPS does support) and coerces float64 tensors to float32 when they are created
on or moved to MPS. MONAI Spacingd / AffineTransform allocate float64 affines
via ``torch.ones`` / ``torch.tensor`` / ``Tensor.double``, not only ``Tensor.to``.
"""

from __future__ import annotations

import logging
from functools import wraps
from typing import Sequence

logger = logging.getLogger(__name__)

try:
    import torch
    import torch.nn.functional as F
except ImportError:
    torch = None
    F = None

_PATCHED = False
_orig_conv_transpose3d = None
_orig_tensor_to = None
_orig_as_tensor = None
_orig_grid_sample = None
_orig_factories: dict[str, object] = {}
_orig_tensor_methods: dict[str, object] = {}

_FACTORY_NAMES = (
    "ones",
    "zeros",
    "empty",
    "full",
    "tensor",
    "eye",
    "arange",
    "linspace",
    "logspace",
    "range",
    "empty_strided",
)
_LIKE_FACTORY_NAMES = (
    "ones_like",
    "zeros_like",
    "empty_like",
    "full_like",
    "rand_like",
    "randn_like",
    "randint_like",
)
_TENSOR_NEW_NAMES = ("new_empty", "new_zeros", "new_ones", "new_full", "new_tensor")


def _triple(value) -> tuple[int, int, int]:
    if isinstance(value, int):
        return (value, value, value)
    if len(value) != 3:
        raise ValueError(f"expected a 3-tuple, got {value}")
    return (int(value[0]), int(value[1]), int(value[2]))


def _unstride_3d(tensor, stride: tuple[int, int, int]):
    sd, sh, sw = stride
    if sd == sh == sw == 1:
        return tensor
    batch, channels, depth, height, width = tensor.shape
    dilated = tensor.new_zeros(
        batch,
        channels,
        (depth - 1) * sd + 1,
        (height - 1) * sh + 1,
        (width - 1) * sw + 1,
    )
    dilated[:, :, ::sd, ::sh, ::sw] = tensor
    return dilated


def _rearrange_weight(weight, groups: int):
    """Map conv_transpose3d weight layout onto conv3d layout and flip the kernel."""
    in_channels, out_per_group, kernel_d, kernel_h, kernel_w = weight.shape
    weight = weight.view(groups, in_channels // groups, out_per_group, kernel_d, kernel_h, kernel_w)
    weight = weight.permute(0, 2, 1, 3, 4, 5).contiguous()
    weight = weight.view(groups * out_per_group, in_channels // groups, kernel_d, kernel_h, kernel_w)
    return weight.flip(dims=(2, 3, 4)).contiguous()


def conv_transpose3d_via_conv3d(
    input,
    weight,
    bias=None,
    stride: int | Sequence[int] = 1,
    padding: int | Sequence[int] = 0,
    output_padding: int | Sequence[int] = 0,
    groups: int = 1,
    dilation: int | Sequence[int] = 1,
):
    """Exact ``conv_transpose3d`` using ``conv3d`` + zero insertion.

    Matches PyTorch's output size
    ``(i - 1) * stride - 2 * padding + dilation * (k - 1) + output_padding + 1``.
    """
    if torch is None:
        raise RuntimeError("PyTorch is required")
    stride_t = _triple(stride)
    padding_t = _triple(padding)
    output_padding_t = _triple(output_padding)
    dilation_t = _triple(dilation)
    kernel = weight.shape[2:]

    expanded = _unstride_3d(input, stride_t)
    if any(output_padding_t):
        # Trailing zeros on the dilated input produce the extra output_padding voxels.
        expanded = F.pad(
            expanded,
            (0, output_padding_t[2], 0, output_padding_t[1], 0, output_padding_t[0]),
        )
    conv_weight = _rearrange_weight(weight, groups)
    conv_padding = []
    crops = []
    for axis in range(3):
        pad = dilation_t[axis] * (kernel[axis] - 1) - padding_t[axis]
        conv_padding.append(max(pad, 0))
        crops.append(max(-pad, 0))

    output = F.conv3d(
        expanded,
        conv_weight,
        bias=None,
        stride=1,
        padding=tuple(conv_padding),
        dilation=dilation_t,
        groups=groups,
    )
    if any(crops):
        d0, d1, d2 = crops
        output = output[
            :,
            :,
            d0 : (output.shape[2] - d0 if d0 else None),
            d1 : (output.shape[3] - d1 if d1 else None),
            d2 : (output.shape[4] - d2 if d2 else None),
        ]
    if bias is not None:
        output = output + bias.view(1, -1, 1, 1, 1)
    return output


def _patched_conv_transpose3d(
    input,
    weight,
    bias=None,
    stride=1,
    padding=0,
    output_padding=0,
    groups=1,
    dilation=1,
):
    if input.device.type == "mps":
        return conv_transpose3d_via_conv3d(
            input, weight, bias, stride, padding, output_padding, groups, dilation
        )
    return _orig_conv_transpose3d(
        input, weight, bias, stride, padding, output_padding, groups, dilation
    )


def _mps_device(device) -> bool:
    if device is None:
        return False
    try:
        return torch.device(device).type == "mps"
    except (RuntimeError, TypeError, ValueError):
        return False


def _is_mps_tensor(value) -> bool:
    return torch is not None and torch.is_tensor(value) and value.device.type == "mps"


def _is_float64(dtype) -> bool:
    if dtype is None or torch is None:
        return False
    if dtype in {torch.float64, torch.double}:
        return True
    name = getattr(dtype, "name", None) or str(dtype)
    return name in {"float64", "double", "torch.float64", "torch.double"}


def _mps_float64_error(exc: BaseException) -> bool:
    message = str(exc)
    return "MPS" in message and "float64" in message


def _coerce_factory_kwargs(kwargs: dict, *, like=None, data=None) -> dict:
    """Force float32 when a factory would otherwise allocate float64 on MPS."""
    dtype = kwargs.get("dtype")
    device = kwargs.get("device")
    target_mps = _mps_device(device) or (device is None and _is_mps_tensor(like))
    if not target_mps:
        return kwargs
    inferred = dtype
    if inferred is None:
        inferred = getattr(like, "dtype", None)
    if inferred is None:
        inferred = getattr(data, "dtype", None)
    if not _is_float64(inferred):
        return kwargs
    rewritten = dict(kwargs)
    rewritten["dtype"] = torch.float32
    return rewritten


def _retry_mps_float64(orig, args, kwargs):
    try:
        return orig(*args, **kwargs)
    except TypeError as exc:
        if not _mps_float64_error(exc):
            raise
        rewritten = dict(kwargs)
        rewritten["dtype"] = torch.float32
        return orig(*args, **rewritten)


def _wrap_factory(orig, *, like_from_first: bool = False, data_from_first: bool = False):
    @wraps(orig)
    def wrapped(*args, **kwargs):
        like = args[0] if like_from_first and args else None
        data = args[0] if data_from_first and args else None
        kwargs = _coerce_factory_kwargs(kwargs, like=like, data=data)
        return _retry_mps_float64(orig, args, kwargs)

    return wrapped


def _wrap_tensor_new(orig):
    @wraps(orig)
    def wrapped(self, *args, **kwargs):
        kwargs = _coerce_factory_kwargs(kwargs, like=self, data=args[0] if args else None)
        return _retry_mps_float64(orig, (self, *args), kwargs)

    return wrapped


def _patched_tensor_to(self, *args, **kwargs):
    try:
        return _orig_tensor_to(self, *args, **kwargs)
    except TypeError as exc:
        if not _mps_float64_error(exc):
            raise
        rewritten_args = tuple(
            torch.float32 if item in {torch.float64, torch.double} else item for item in args
        )
        rewritten_kwargs = dict(kwargs)
        if _is_float64(rewritten_kwargs.get("dtype")):
            rewritten_kwargs["dtype"] = torch.float32
        if any(isinstance(item, torch.dtype) for item in rewritten_args):
            rewritten_kwargs.pop("dtype", None)
        elif "dtype" not in rewritten_kwargs:
            rewritten_kwargs["dtype"] = torch.float32
        return _orig_tensor_to(self, *rewritten_args, **rewritten_kwargs)


def _patched_grid_sample(input, grid, mode="bilinear", padding_mode="zeros", align_corners=None):
    """MPS has no ``aten::grid_sampler_3d``; run 5D sampling on CPU and copy back."""
    if input is not None and getattr(input, "device", None) is not None and input.device.type == "mps" and input.dim() == 5:
        sampled = _orig_grid_sample(
            input.cpu(),
            grid.cpu() if torch.is_tensor(grid) else grid,
            mode=mode,
            padding_mode=padding_mode,
            align_corners=align_corners,
        )
        return sampled.to(input.device)
    return _orig_grid_sample(
        input, grid, mode=mode, padding_mode=padding_mode, align_corners=align_corners
    )


def _patched_as_tensor(data, dtype=None, device=None):
    kwargs = _coerce_factory_kwargs({"dtype": dtype, "device": device}, data=data)
    dtype = kwargs.get("dtype")
    device = kwargs.get("device")
    try:
        return _orig_as_tensor(data, dtype=dtype, device=device)
    except TypeError as exc:
        if _mps_float64_error(exc):
            return _orig_as_tensor(data, dtype=torch.float32, device=device)
        raise


def _patched_double(self, *args, **kwargs):
    if self.device.type == "mps":
        return self.to(dtype=torch.float32)
    return _orig_tensor_methods["double"](self, *args, **kwargs)


def _patched_tensor_type(self, *args, **kwargs):
    orig = _orig_tensor_methods["type"]
    if not args and not kwargs:
        return orig(self)
    rewritten_args = tuple(
        torch.float32
        if _is_float64(item) or item in {"torch.Float64Tensor", "torch.DoubleTensor", "torch.cuda.DoubleTensor"}
        else item
        for item in args
    )
    rewritten_kwargs = _coerce_factory_kwargs(kwargs, like=self)
    try:
        return orig(self, *rewritten_args, **rewritten_kwargs)
    except TypeError as exc:
        if _mps_float64_error(exc):
            return self.to(dtype=torch.float32)
        raise


def apply_mps_operator_shims() -> None:
    """Install MPS implementations for operators VISTA3D needs."""
    global _PATCHED, _orig_conv_transpose3d, _orig_tensor_to, _orig_as_tensor, _orig_grid_sample
    if torch is None or F is None:
        return
    if _PATCHED:
        return
    if not (getattr(torch.backends, "mps", None) and torch.backends.mps.is_available()):
        return

    _orig_conv_transpose3d = F.conv_transpose3d
    _orig_tensor_to = torch.Tensor.to
    _orig_as_tensor = torch.as_tensor
    F.conv_transpose3d = _patched_conv_transpose3d  # type: ignore[assignment]
    torch.nn.functional.conv_transpose3d = _patched_conv_transpose3d  # type: ignore[assignment]
    if hasattr(torch, "conv_transpose3d"):
        torch.conv_transpose3d = _patched_conv_transpose3d  # type: ignore[assignment]
    torch.Tensor.to = _patched_tensor_to  # type: ignore[method-assign]
    torch.as_tensor = _patched_as_tensor  # type: ignore[assignment]
    _orig_grid_sample = F.grid_sample
    F.grid_sample = _patched_grid_sample  # type: ignore[assignment]
    torch.nn.functional.grid_sample = _patched_grid_sample  # type: ignore[assignment]

    for name in _FACTORY_NAMES:
        orig = getattr(torch, name, None)
        if orig is None:
            continue
        _orig_factories[name] = orig
        setattr(torch, name, _wrap_factory(orig, data_from_first=(name == "tensor")))
    for name in _LIKE_FACTORY_NAMES:
        orig = getattr(torch, name, None)
        if orig is None:
            continue
        _orig_factories[name] = orig
        setattr(torch, name, _wrap_factory(orig, like_from_first=True))

    for name in _TENSOR_NEW_NAMES:
        orig = getattr(torch.Tensor, name, None)
        if orig is None:
            continue
        _orig_tensor_methods[name] = orig
        setattr(torch.Tensor, name, _wrap_tensor_new(orig))

    if hasattr(torch.Tensor, "double"):
        _orig_tensor_methods["double"] = torch.Tensor.double
        torch.Tensor.double = _patched_double  # type: ignore[method-assign]
    if hasattr(torch.Tensor, "type"):
        _orig_tensor_methods["type"] = torch.Tensor.type
        torch.Tensor.type = _patched_tensor_type  # type: ignore[method-assign]

    _PATCHED = True
    logger.info(
        "Installed MPS shims for conv_transpose3d, grid_sample 3D, and float64 factories"
    )
