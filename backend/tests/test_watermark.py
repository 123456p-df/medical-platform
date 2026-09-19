import io
import time
from types import SimpleNamespace

import nibabel as nib
import numpy as np
from PIL import Image

from app.services.imaging import slice_png
from app.services.watermark import (
    TOTAL_PAYLOAD_BITS,
    compute_psnr,
    compute_ssim,
    crc16_ccitt,
    dwt2_haar,
    embed_dwt_dct_svd,
    extract_dwt_dct_svd,
    extract_user_from_image,
    idwt2_haar,
    make_user_payload,
    parse_user_payload,
)


def _make_synthetic_slice(size=512) -> np.ndarray:
    """Generate a realistic synthetic 2D medical CT/MR-like slice."""
    y, x = np.ogrid[:size, :size]
    center = size // 2
    r_body = size * 0.4
    r_bone = size * 0.42
    body = (x - center) ** 2 + (y - center) ** 2 < r_body**2
    bone = (x - center) ** 2 + (y - center) ** 2 < r_bone**2
    img = np.zeros((size, size), dtype=np.float64)
    img[bone] = 210
    img[body] = 75
    organ1 = (x - center + 50) ** 2 + (y - center - 30) ** 2 < (size * 0.15) ** 2
    organ2 = (x - center - 60) ** 2 + (y - center + 40) ** 2 < (size * 0.12) ** 2
    img[organ1] = 110
    img[organ2] = 140
    np.random.seed(42)
    noise = np.random.normal(0, 2.0, (size, size))
    img = np.clip(img + noise, 0, 255).astype(np.uint8)
    return img


def test_payload_crc_and_validation():
    user_id = 987654321
    timestamp = 12345
    payload = make_user_payload(user_id=user_id, timestamp=timestamp)
    assert len(payload) == TOTAL_PAYLOAD_BITS

    result = parse_user_payload(payload)
    assert result.valid is True
    assert result.user_id == user_id
    assert result.timestamp == timestamp
    assert result.confidence == 1.0

    corrupted = payload.copy()
    corrupted[30] ^= 1
    tampered_result = parse_user_payload(corrupted)
    assert tampered_result.valid is False


def test_crc16_implementation():
    test_bytes = b"medical-watermark-test-vector"
    crc1 = crc16_ccitt(test_bytes)
    crc2 = crc16_ccitt(test_bytes)
    assert crc1 == crc2
    assert crc1 != crc16_ccitt(test_bytes + b"1")


def test_dwt2_idwt2_exact_reconstruction():
    img = _make_synthetic_slice(512).astype(np.float64)
    bands, shape = dwt2_haar(img)
    recon = idwt2_haar(bands, shape)
    max_error = np.max(np.abs(img - recon))
    assert max_error < 1e-10


def test_blind_watermark_embedding_and_extraction():
    img = _make_synthetic_slice(512)
    user_id = 42
    timestamp = 1000
    payload = make_user_payload(user_id=user_id, timestamp=timestamp)

    watermarked = embed_dwt_dct_svd(img, payload, delta=20.0)
    assert watermarked.shape == img.shape
    assert watermarked.dtype == np.uint8

    extracted_bits = extract_dwt_dct_svd(watermarked, num_bits=TOTAL_PAYLOAD_BITS, delta=20.0)
    bit_errors = np.sum(payload != extracted_bits)
    assert bit_errors == 0

    res = parse_user_payload(extracted_bits)
    assert res.valid is True
    assert res.user_id == user_id
    assert res.timestamp == timestamp


def test_clinical_fidelity_psnr_and_ssim():
    img = _make_synthetic_slice(512)
    payload = make_user_payload(user_id=1001, timestamp=2026)

    watermarked = embed_dwt_dct_svd(img, payload, delta=20.0)
    psnr = compute_psnr(img, watermarked)
    ssim = compute_ssim(img, watermarked)

    assert psnr >= 48.0, f"PSNR ({psnr:.2f} dB) must be >= 48.0 dB"
    assert ssim >= 0.998, f"SSIM ({ssim:.5f}) must be >= 0.998"


def test_png_encode_decode_resilience():
    img = _make_synthetic_slice(512)
    user_id = 8888
    payload = make_user_payload(user_id=user_id, timestamp=5555)

    watermarked = embed_dwt_dct_svd(img, payload, delta=20.0)

    buf = io.BytesIO()
    Image.fromarray(watermarked).save(buf, format="PNG")
    png_bytes = buf.getvalue()

    result = extract_user_from_image(png_bytes, delta=20.0)
    assert result.valid is True
    assert result.user_id == user_id
    assert result.timestamp == 5555


def test_jpeg_compression_resilience():
    img = _make_synthetic_slice(512)
    user_id = 12345
    payload = make_user_payload(user_id=user_id, timestamp=6789)

    watermarked = embed_dwt_dct_svd(img, payload, delta=20.0)

    buf = io.BytesIO()
    Image.fromarray(watermarked).save(buf, format="JPEG", quality=90)
    jpg_bytes = buf.getvalue()

    result = extract_user_from_image(jpg_bytes, delta=20.0)
    assert result.valid is True
    assert result.user_id == user_id
    assert result.timestamp == 6789


def test_slice_png_integration_and_caching(app_env, tmp_path):
    _, _, settings, _ = app_env

    volume = np.zeros((128, 128, 10), dtype=np.float32)
    for z in range(10):
        volume[32:96, 32:96, z] = 100.0 + z * 5.0
    path = tmp_path / "test_patient_scan.nii"
    nib.save(nib.Nifti1Image(volume, np.eye(4)), path)

    mock_user = SimpleNamespace(id=999, username="dr_smith")

    t0 = time.perf_counter()
    png1 = slice_png(path, 5, settings, window_center=125.0, window_width=50.0, user=mock_user)
    t1 = time.perf_counter()
    duration_compute = t1 - t0

    assert isinstance(png1, bytes)
    assert len(png1) > 100

    extracted = extract_user_from_image(png1, delta=settings.watermark_delta)
    assert extracted.valid is True
    assert extracted.user_id == 999

    t2 = time.perf_counter()
    png2 = slice_png(path, 5, settings, window_center=125.0, window_width=50.0, user=mock_user)
    t3 = time.perf_counter()
    duration_cache = t3 - t2

    assert png1 == png2
    assert duration_cache < duration_compute


def test_watermark_disabled_setting(app_env, tmp_path):
    _, _, settings, _ = app_env
    settings.watermark_enabled = False

    volume = np.zeros((128, 128, 5), dtype=np.float32)
    volume[40:88, 40:88, :] = 150.0
    path = tmp_path / "test_disabled.nii"
    nib.save(nib.Nifti1Image(volume, np.eye(4)), path)

    mock_user = SimpleNamespace(id=777)
    png = slice_png(path, 2, settings, window_center=150.0, window_width=100.0, user=mock_user)
    assert isinstance(png, bytes)

    res = extract_user_from_image(png, delta=settings.watermark_delta)
    assert res.valid is False


def test_get_slice_api_watermark_end_to_end(app_env, people, tmp_path):
    _, client, settings, _ = app_env

    vol = np.zeros((128, 128, 8), dtype=np.float32)
    vol[32:96, 32:96, :] = 100.0
    path = tmp_path / "e2e_scan.nii.gz"
    img = nib.Nifti1Image(vol, np.diag([1.0, 1.0, 1.0, 1.0]))
    img.header.set_xyzt_units("mm")
    nib.save(img, path)

    pid = people["patient_a_pid"]
    with path.open("rb") as f:
        res = client.post(
            f"/api/v1/patients/{pid}/medical-images",
            headers=people["doctor_a"],
            files={"file": (path.name, f)},
            data={"organ_id": "lung", "image_type": "CT"},
        )
    assert res.status_code == 201
    image_id = res.json()["data"]["image_id"]

    slice_res = client.get(
        f"/api/v1/medical-images/{image_id}/slice/0?format=png&window_center=100&window_width=100",
        headers=people["doctor_a"],
    )
    assert slice_res.status_code == 200
    assert slice_res.headers["content-type"] == "image/png"

    extracted = extract_user_from_image(slice_res.content, delta=settings.watermark_delta)
    assert extracted.valid is True
    assert extracted.user_id == people["doctor_a_id"]
