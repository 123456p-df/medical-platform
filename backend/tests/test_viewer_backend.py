import io
import time

import nibabel as nib
import numpy as np
import trimesh

from app.models import MedicalImage, OrganModel, OrganModelBlob
from app.services.comparison import compare_studies
from app.services.geometry_engine import overlay_style
from tests.conftest import SyntheticBatchAdapter, upload


def wait_batch(client, headers, image_id, timeout=30):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        response = client.get(
            f"/api/v1/medical-images/{image_id}/segmentation-batch", headers=headers
        )
        if response.status_code == 200:
            payload = response.json()["data"]
            if payload["status"] in {"completed", "partial", "failed"}:
                return payload
        time.sleep(0.05)
    raise AssertionError("segmentation batch did not finish")


def test_segmentation_batch_routes_are_registered(app_env):
    _, client, _, _ = app_env
    paths = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/medical-images/{image_id}/segmentation-batch" in paths
    assert "/api/v1/medical-images/{image_id}/organ-models" in paths
    assert "/api/v1/medical-images/{image_id}/comparison-candidates" in paths
    assert "/api/v1/medical-images/{image_id}/label-volume" in paths
    assert "/api/v1/catalog/label-colors" in paths


def test_upload_batch_stores_glb_blobs_and_label_volume(app_env, people, nifti_file):
    app, client, settings, _ = app_env
    app.state.segmentation_runner.adapter = SyntheticBatchAdapter()
    image_id = upload(client, people, nifti_file)
    created = client.get(f"/api/v1/medical-images/{image_id}", headers=people["doctor_a"]).json()[
        "data"
    ]
    assert created["segmentation_batch_id"]
    assert created["acquisition"]["orientation"] == "RAS"
    batch = wait_batch(client, people["doctor_a"], image_id)
    assert batch["status"] == "completed", batch
    assert batch["recognized_count"] == 2
    assert batch["atlas_model_id"]
    names = {item["name"] for item in batch["items"]}
    assert "liver" in names and "spleen" in names
    models = client.get(
        f"/api/v1/medical-images/{image_id}/organ-models", headers=people["doctor_a"]
    ).json()["data"]
    assert all(item["status"] == "completed" for item in models)
    atlas = client.get(
        f"/api/v1/organ-models/{batch['atlas_model_id']}/file", headers=people["doctor_a"]
    )
    assert atlas.status_code == 200
    assert atlas.content.startswith(b"glTF")
    organ = client.get(
        f"/api/v1/organ-models/{models[0]['model_id']}/file", headers=people["patient_a"]
    )
    assert organ.content.startswith(b"glTF")
    scene = trimesh.load(io.BytesIO(atlas.content), file_type="glb", force="scene")
    assert len(scene.geometry) >= 1
    labels = client.get(
        f"/api/v1/medical-images/{image_id}/label-volume", headers=people["doctor_a"]
    )
    assert labels.status_code == 200
    volume = np.load(io.BytesIO(labels.content), allow_pickle=False)
    assert volume.dtype == np.uint16
    assert set(np.unique(volume)) <= {0, 1, 3}
    with app.state.session_factory() as db:
        blob = db.get(OrganModelBlob, models[0]["model_id"])
        assert blob is not None and blob.size_bytes == len(blob.data)
        model = db.get(OrganModel, models[0]["model_id"])
        assert model.file_path is None
        assert model.kind == "organ"


def test_comparison_candidates_respect_geometry_and_device(app_env, people, nifti_file, tmp_path):
    app, client, _, _ = app_env
    first = upload(client, people, nifti_file)
    second = upload(client, people, nifti_file)
    payload = client.get(
        f"/api/v1/medical-images/{first}/comparison-candidates", headers=people["doctor_a"]
    ).json()["data"]
    match = next(item for item in payload if item["image_id"] == second)
    assert match["comparable"] is True
    other = np.arange(12 * 14 * 16, dtype=np.float32).reshape(12, 14, 16)
    mismatched = tmp_path / "wide.nii.gz"
    image = nib.Nifti1Image(other, np.diag([8.0, 3.0, 4.0, 1.0]))
    image.header.set_xyzt_units("mm")
    nib.save(image, mismatched)
    wide_id = upload(client, people, mismatched)
    blocked = client.get(
        f"/api/v1/medical-images/{first}/comparison-candidates", headers=people["doctor_a"]
    ).json()["data"]
    wide = next(item for item in blocked if item["image_id"] == wide_id)
    assert wide["comparable"] is True
    assert any("间距" in warning for warning in wide["warnings"])
    with app.state.session_factory() as db:
        left = db.get(MedicalImage, first)
        right = db.get(MedicalImage, second)
        left.acquisition = {**(left.acquisition or {}), "device": "ScannerA"}
        right.acquisition = {**(right.acquisition or {}), "device": "ScannerB"}
        db.commit()
        verdict = compare_studies(left, right)
    assert verdict["comparable"] is True
    assert any("设备" in warning for warning in verdict["warnings"])


def test_overlay_style_marks_near_black_as_outline():
    from app.services.geometry_engine import is_near_black

    vein = overlay_style("vein")
    assert vein["color"] == [35, 110, 220]
    assert overlay_style("aorta")["outline_only"] is False
    assert overlay_style("liver")["outline_only"] is False
    assert is_near_black([8, 8, 8]) is True
    assert is_near_black([225, 35, 35]) is False


def test_create_or_retry_segmentation_batch(app_env, people, nifti_file):
    app, client, _, _ = app_env
    app.state.segmentation_runner.adapter = SyntheticBatchAdapter()
    image_id = upload(client, people, nifti_file)
    response = client.post(
        f"/api/v1/medical-images/{image_id}/segmentation-batch",
        headers=people["doctor_a"],
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert "batch_id" in data
    assert data["status"] in {"queued", "running", "completed"}
