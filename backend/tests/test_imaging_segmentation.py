import io
import threading
import time

import nibabel as nib
import numpy as np
import pytest
import trimesh

from app.cli import install_default, set_access
from app.errors import APIError
from app.models import OrganModel, SegmentationTask
from app.services.imaging import load_volume, mask_to_glb
from app.services.storage import stored_path
from tests.conftest import SyntheticAdapter, upload


def wait_task(client, headers, task_id):
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline:
        result = client.get(f"/api/v1/segmentation/tasks/{task_id}", headers=headers).json()["data"]
        if result["status"] in {"completed", "failed"}:
            return result
        time.sleep(0.02)
    raise AssertionError("Segmentation fixture did not finish")


def test_upload_slice_segmentation_glb_permissions(app_env, people, nifti_file):
    app, client, settings, _ = app_env
    image_id = upload(client, people, nifti_file)
    route = f"/api/v1/medical-images/{image_id}"
    metadata = client.get(route, headers=people["patient_a"])
    assert "file_path" not in metadata.text
    assert metadata.json()["data"]["slice_count"] == 16
    png = client.get(route + "/slice/0", headers=people["patient_a"])
    assert png.content.startswith(b"\x89PNG") and png.headers["cache-control"] == "no-store"
    assert client.get(route + "/slice/16", headers=people["doctor_a"]).status_code == 404
    assert (
        client.get(route + "/slice/0?window_center=10", headers=people["doctor_a"]).status_code
        == 400
    )
    assert (
        client.get(route + "/slice/0?window_width=nan", headers=people["doctor_a"]).status_code
        == 422
    )
    for who in ["patient_b", "doctor_b"]:
        assert client.get(route, headers=people[who]).status_code == 403
        assert client.get(route + "/slice/0", headers=people[who]).status_code == 403
    assert (
        client.post(
            route + "/segmentation", headers=people["patient_a"], json={"organ_id": "lung"}
        ).status_code
        == 403
    )
    assert (
        client.post(
            route + "/segmentation", headers=people["doctor_a"], json={"organ_id": "liver"}
        ).status_code
        == 400
    )
    response = client.post(
        route + "/segmentation", headers=people["doctor_a"], json={"organ_id": "lung"}
    )
    assert response.status_code == 201 and response.json()["data"]["status"] == "queued"
    task_id = response.json()["data"]["task_id"]
    result = wait_task(client, people["doctor_a"], task_id)
    assert result["status"] == "completed", result
    assert result["progress"] == 100
    model_id = result["result"]["model_id"]
    model_route = f"/api/v1/organ-models/{model_id}"
    for who in ["doctor_b", "patient_b"]:
        assert (
            client.get(f"/api/v1/segmentation/tasks/{task_id}", headers=people[who]).status_code
            == 403
        )
        assert client.get(model_route, headers=people[who]).status_code == 403
        assert client.get(model_route + "/file", headers=people[who]).status_code == 403
    glb = client.get(model_route + "/file", headers=people["patient_a"])
    assert glb.content.startswith(b"glTF")
    mesh = trimesh.load(io.BytesIO(glb.content), file_type="glb", force="scene")
    np.testing.assert_allclose(mesh.extents, [0.016, 0.048, 0.030], atol=1e-6)
    organ = client.get(
        f"/api/v1/patients/{people['patient_a_pid']}/organs/lung", headers=people["doctor_a"]
    ).json()["data"]
    assert organ["model"]["model_id"] == model_id
    with app.state.session_factory() as db:
        assert stored_path(settings, db.get(OrganModel, model_id).mask_path).is_file()
        set_access(db, "doctor_a", people["patient_a_pid"], "revoked")
    assert client.get(model_route + "/file", headers=people["doctor_a"]).status_code == 403


def test_bad_uploads_and_mri_rejection(app_env, people, nifti_file):
    app, client, settings, _ = app_env
    route = f"/api/v1/patients/{people['patient_a_pid']}/medical-images"
    for name, content, status in [
        ("scan.dcm", b"dicom", 400),
        ("bad.nii", b"garbage", 400),
        ("huge.nii", b"x" * (settings.max_upload_bytes + 1), 413),
    ]:
        response = client.post(
            route,
            headers=people["doctor_a"],
            files={"file": (name, content)},
            data={"organ_id": "lung", "image_type": "CT"},
        )
        assert response.status_code == status, response.text
    assert not list(settings.storage_root.glob("medical-images/*"))
    image_id = upload(client, people, nifti_file, image_type="MRI")
    response = client.post(
        f"/api/v1/medical-images/{image_id}/segmentation",
        headers=people["doctor_a"],
        json={"organ_id": "lung"},
    )
    assert response.status_code == 400
    app.state.segmentation_runner.adapter = None
    image_id = upload(client, people, nifti_file)
    response = client.post(
        f"/api/v1/medical-images/{image_id}/segmentation",
        headers=people["doctor_a"],
        json={"organ_id": "lung"},
    )
    assert response.status_code == 503


def test_patient_can_upload_own_dated_ct_only(app_env, people, nifti_file):
    _, client, _, _ = app_env
    route = f"/api/v1/patients/{people['patient_a_pid']}/medical-images"
    with nifti_file.open("rb") as source:
        response = client.post(
            route,
            headers=people["patient_a"],
            files={"file": (nifti_file.name, source)},
            data={"organ_id": "lung", "image_type": "CT", "study_date": "2026-03-12"},
        )
    assert response.status_code == 201, response.text
    assert response.json()["data"]["study_date"] == "2026-03-12"

    with nifti_file.open("rb") as source:
        forbidden = client.post(
            route,
            headers=people["patient_b"],
            files={"file": (nifti_file.name, source)},
            data={"organ_id": "lung", "image_type": "CT", "study_date": "2026-03-12"},
        )
    assert forbidden.status_code == 403

    with nifti_file.open("rb") as source:
        future = client.post(
            route,
            headers=people["patient_a"],
            files={"file": (nifti_file.name, source)},
            data={"organ_id": "lung", "image_type": "CT", "study_date": "2999-01-01"},
        )
    assert future.status_code == 400


def test_task_is_nonblocking_and_duplicate_is_rejected(app_env, people, nifti_file):
    app, client, _, _ = app_env
    started, release = threading.Event(), threading.Event()

    def blocking(**kwargs):
        started.set()
        assert release.wait(10)
        return SyntheticAdapter()(**kwargs)

    app.state.segmentation_runner.adapter = blocking
    image_id = upload(client, people, nifti_file)
    route = f"/api/v1/medical-images/{image_id}/segmentation"
    try:
        response = client.post(route, headers=people["doctor_a"], json={"organ_id": "lung"})
        assert response.status_code == 201
        assert started.wait(3)
        assert client.get("/health").status_code == 200
        assert (
            client.post(route, headers=people["doctor_a"], json={"organ_id": "lung"}).status_code
            == 409
        )
    finally:
        release.set()
    assert (
        wait_task(client, people["doctor_a"], response.json()["data"]["task_id"])["status"]
        == "completed"
    )


def test_failed_adapter_error_is_private_and_can_retry(app_env, people, nifti_file):
    app, client, _, _ = app_env

    def broken(**kwargs):
        raise RuntimeError("PRIVATE-ID /data/private-path secret-token")

    app.state.segmentation_runner.adapter = broken
    image_id = upload(client, people, nifti_file)
    route = f"/api/v1/medical-images/{image_id}/segmentation"
    task_id = client.post(route, headers=people["doctor_a"], json={"organ_id": "lung"}).json()[
        "data"
    ]["task_id"]
    task = wait_task(client, people["doctor_a"], task_id)
    assert task["status"] == "failed" and "PRIVATE" not in str(task)
    app.state.segmentation_runner.adapter = SyntheticAdapter()
    assert (
        client.post(route, headers=people["doctor_a"], json={"organ_id": "lung"}).status_code == 201
    )


def test_recovery_marks_interrupted_and_resumes_queued(app_env, people, nifti_file):
    app, client, _, _ = app_env
    image_id = upload(client, people, nifti_file)
    image_id2 = upload(client, people, nifti_file)
    with app.state.session_factory() as db:
        db.add_all(
            [
                SegmentationTask(
                    id="seg_interrupted",
                    image_id=image_id,
                    organ_id="lung",
                    requested_by=people["doctor_a_id"],
                    status="running",
                    progress=60,
                ),
                SegmentationTask(
                    id="seg_queued",
                    image_id=image_id2,
                    organ_id="lung",
                    requested_by=people["doctor_a_id"],
                    status="queued",
                ),
            ]
        )
        db.commit()
    app.state.segmentation_runner.recover()
    assert wait_task(client, people["doctor_a"], "seg_interrupted")["status"] == "failed"
    assert wait_task(client, people["doctor_a"], "seg_queued")["status"] == "completed"


def test_default_model_and_path_confinement(app_env, people, tmp_path):
    app, client, settings, _ = app_env
    route = "/api/v1/organ-models/default_lung"
    missing = client.get(route, headers=people["patient_a"]).json()["data"]
    assert missing["source"] == "default" and missing["url"] is None
    assert client.get(route + "/file", headers=people["patient_a"]).status_code == 404
    source = tmp_path / "fixture.glb"
    trimesh.Scene(trimesh.creation.icosphere()).export(source)
    with app.state.session_factory() as db:
        install_default(db, settings, "lung", source)
    assert client.get(route, headers=people["patient_a"]).json()["data"]["available"] is True
    assert client.get(route + "/file", headers=people["patient_b"]).content.startswith(b"glTF")
    with pytest.raises(APIError):
        stored_path(settings, "../outside")


def test_volume_limits_and_mask_geometry_validation(app_env, nifti_file, tmp_path):
    _, _, settings, _ = app_env
    restricted = settings.model_copy(update={"max_uncompressed_bytes": 1024})
    with pytest.raises(APIError) as error:
        load_volume(nifti_file, restricted)
    assert error.value.status == 413
    source = nib.load(nifti_file)
    mask = tmp_path / "bad-mask.nii.gz"
    nib.save(nib.Nifti1Image(np.zeros(source.shape), source.affine), mask)
    with pytest.raises(ValueError, match="nonempty"):
        mask_to_glb(mask, nifti_file, tmp_path / "out.glb", settings)
    nib.save(nib.Nifti1Image(np.ones(source.shape), np.eye(4)), mask)
    with pytest.raises(ValueError, match="voxel space"):
        mask_to_glb(mask, nifti_file, tmp_path / "out.glb", settings)


def test_axial_preview_has_radiological_left_right(app_env, tmp_path):
    from PIL import Image

    from app.services.imaging import slice_png

    _, _, settings, _ = app_env
    values = np.zeros((4, 5, 6), dtype=np.float32)
    # In canonical RAS, high x is the patient's right. Display it on the viewer's left.
    values[3, :, :] = 100
    path = tmp_path / "orientation.nii"
    nib.save(nib.Nifti1Image(values, np.eye(4)), path)
    output = np.asarray(Image.open(io.BytesIO(slice_png(path, 0, settings, 50, 100))))
    assert np.all(output[:, 0] == 255)
    assert np.all(output[:, -1] == 0)
