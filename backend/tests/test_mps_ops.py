import pytest

from app.services.mps_ops import conv_transpose3d_via_conv3d

torch = pytest.importorskip("torch")
F = pytest.importorskip("torch.nn.functional")


def _cases():
    return [
        dict(n=1, cin=1, cout=1, spatial=(4, 4, 4), k=3, stride=1, padding=1, output_padding=0, bias=False),
        dict(n=2, cin=2, cout=3, spatial=(5, 6, 4), k=3, stride=2, padding=1, output_padding=1, bias=False),
        dict(n=1, cin=4, cout=2, spatial=(6, 6, 6), k=3, stride=2, padding=1, output_padding=1, bias=True),
        dict(n=1, cin=2, cout=2, spatial=(3, 3, 3), k=2, stride=2, padding=0, output_padding=0, bias=False),
    ]


@pytest.mark.parametrize("spec", _cases())
def test_conv_transpose3d_matches_cpu_reference(spec):
    torch.manual_seed(0)
    x = torch.randn(spec["n"], spec["cin"], *spec["spatial"])
    w = torch.randn(spec["cin"], spec["cout"], spec["k"], spec["k"], spec["k"])
    b = torch.randn(spec["cout"]) if spec["bias"] else None
    kwargs = dict(
        stride=spec["stride"],
        padding=spec["padding"],
        output_padding=spec["output_padding"],
        groups=1,
        dilation=1,
    )
    reference = F.conv_transpose3d(x, w, b, **kwargs)
    ours = conv_transpose3d_via_conv3d(x, w, b, **kwargs)
    torch.testing.assert_close(ours, reference, atol=1e-5, rtol=1e-5)


@pytest.mark.skipif(not torch.backends.mps.is_available(), reason="MPS not available")
@pytest.mark.parametrize("spec", _cases()[:3])
def test_conv_transpose3d_mps_matches_cpu(spec):
    from app.services.mps_ops import apply_mps_operator_shims

    apply_mps_operator_shims()
    torch.manual_seed(1)
    x = torch.randn(spec["n"], spec["cin"], *spec["spatial"])
    w = torch.randn(spec["cin"], spec["cout"], spec["k"], spec["k"], spec["k"])
    b = torch.randn(spec["cout"]) if spec["bias"] else None
    kwargs = dict(
        stride=spec["stride"],
        padding=spec["padding"],
        output_padding=spec["output_padding"],
        groups=1,
        dilation=1,
    )
    reference = F.conv_transpose3d(x, w, b, **kwargs)
    mps_out = F.conv_transpose3d(x.to("mps"), w.to("mps"), None if b is None else b.to("mps"), **kwargs)
    torch.testing.assert_close(mps_out.cpu(), reference, atol=1e-4, rtol=1e-4)


@pytest.mark.skipif(not torch.backends.mps.is_available(), reason="MPS not available")
def test_module_conv_transpose3d_on_mps():
    from app.services.mps_ops import apply_mps_operator_shims
    from app.services.nv_runtime import mps_supports_vista3d

    apply_mps_operator_shims()
    assert mps_supports_vista3d()
    layer = torch.nn.ConvTranspose3d(2, 3, kernel_size=3, stride=2, padding=1, output_padding=1, bias=False)
    x = torch.randn(1, 2, 4, 4, 4)
    cpu = layer(x)
    mps = layer.to("mps")(x.to("mps"))
    torch.testing.assert_close(mps.cpu(), cpu, atol=1e-4, rtol=1e-4)


@pytest.mark.skipif(not torch.backends.mps.is_available(), reason="MPS not available")
def test_float64_to_mps_coerces_to_float32():
    from app.services.mps_ops import apply_mps_operator_shims

    apply_mps_operator_shims()
    value = torch.eye(4, dtype=torch.float64)
    moved = value.to(device="mps", dtype=torch.float64)
    assert moved.device.type == "mps"
    assert moved.dtype == torch.float32
    as_t = torch.as_tensor(value, dtype=torch.float64, device="mps")
    assert as_t.device.type == "mps"
    assert as_t.dtype == torch.float32
    recast = as_t.to(torch.float64)
    assert recast.dtype == torch.float32
    cpu = torch.ones(2, dtype=torch.float64)
    assert cpu.dtype == torch.float64
    assert cpu.device.type == "cpu"


@pytest.mark.skipif(not torch.backends.mps.is_available(), reason="MPS not available")
def test_float64_factories_on_mps_coerce_to_float32():
    import numpy as np

    from app.services.mps_ops import apply_mps_operator_shims

    apply_mps_operator_shims()
    device = torch.device("mps")
    ones = torch.ones((1,), dtype=torch.float64, device=device)
    zeros = torch.zeros(2, 2, dtype=torch.float64, device=device)
    empty = torch.empty(3, dtype=torch.float64, device=device)
    full = torch.full((2,), 1.0, dtype=torch.float64, device=device)
    eye = torch.eye(4, dtype=torch.float64, device=device)
    tensor = torch.tensor([1.0, 2.0], dtype=torch.float64, device=device)
    from_numpy = torch.tensor(np.zeros((2, 2), dtype=np.float64), device=device)
    like = torch.ones_like(ones, dtype=torch.float64)
    doubled = torch.ones(2, device=device).double()
    for name, value in {
        "ones": ones,
        "zeros": zeros,
        "empty": empty,
        "full": full,
        "eye": eye,
        "tensor": tensor,
        "from_numpy": from_numpy,
        "like": like,
        "doubled": doubled,
    }.items():
        assert value.device.type == "mps", name
        assert value.dtype == torch.float32, name

    # Exact MONAI normalize_transform allocation that previously crashed.
    hom = torch.diag(torch.cat((torch.ones(3, dtype=torch.float64, device=device), ones)))
    assert hom.shape == (4, 4)
    assert hom.dtype == torch.float32
    assert hom.device.type == "mps"


@pytest.mark.skipif(not torch.backends.mps.is_available(), reason="MPS not available")
def test_monai_normalize_transform_and_spacing_on_mps():
    from monai.data import MetaTensor
    from monai.networks.utils import normalize_transform
    from monai.transforms import Spacingd

    from app.services.mps_ops import apply_mps_operator_shims

    apply_mps_operator_shims()
    device = torch.device("mps")
    affine = normalize_transform((16, 16, 12), device, torch.float64, align_corners=False)
    assert affine.device.type == "mps"
    assert affine.dtype == torch.float32
    assert affine.shape[-2:] == (4, 4)

    image = MetaTensor(torch.randn(1, 8, 8, 6, device=device), affine=torch.eye(4, dtype=torch.float64))
    out = Spacingd(keys="image", pixdim=(1.0, 1.0, 1.0), mode="bilinear")({"image": image})["image"]
    assert out.device.type == "mps"
    assert out.ndim == 4

    # Non-identity spacing forces aten::grid_sampler_3d, which MPS does not implement.
    spaced = torch.diag(torch.tensor([2.0, 2.0, 3.0, 1.0], dtype=torch.float64))
    anisotropic = MetaTensor(torch.randn(1, 16, 16, 8, device=device), affine=spaced)
    resampled = Spacingd(keys="image", pixdim=(1.0, 1.0, 1.0), mode="bilinear")({"image": anisotropic})["image"]
    assert resampled.device.type == "mps"
    assert resampled.shape[1] >= 16
