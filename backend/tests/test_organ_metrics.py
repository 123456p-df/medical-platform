import numpy as np
import pytest

from app.models import OrganModel
from app.services.nv_runtime import amp_enabled_for, resolve_nv_segment_device
from app.services.organ_metrics import (
    assert_body_label_map_sane,
    choose_volume_cm3,
    volume_status,
)


def test_vista3d_inner_state_dict_strips_network_prefix():
    from app.services.nv_runtime import inner_vista3d_state_dict

    assert inner_vista3d_state_dict({"network.encoder.w": 1, "class_head.w": 2}) == {
        "encoder.w": 1,
        "class_head.w": 2,
    }


def test_resolve_device_rejects_missing_cuda():
    resolved = resolve_nv_segment_device("cuda:0")
    assert resolved in {"cpu", "mps", "cuda:0"}
    assert resolve_nv_segment_device("auto") in {"cpu", "mps", "cuda:0"}
    assert amp_enabled_for("cpu") is False
    assert amp_enabled_for("mps") is False
    # Explicit mps must not crash; it may fall back to CPU when ConvTranspose3d is missing.
    assert resolve_nv_segment_device("mps") in {"cpu", "mps"}


def test_degenerate_all_liver_label_map_is_rejected():
    collapsed = np.ones((8, 8, 8), dtype=np.uint8)
    with pytest.raises(RuntimeError, match="degenerate|45%"):
        assert_body_label_map_sane(collapsed)
    healthy = np.zeros((16, 16, 16), dtype=np.uint8)
    healthy[1:3, 1:3, 1:3] = 1
    healthy[4:6, 4:6, 4:6] = 3
    healthy[8:10, 8:10, 8:10] = 5
    assert_body_label_map_sane(healthy)


def test_choose_volume_prefers_voxel_when_mesh_explodes():
    assert choose_volume_cm3({"voxel_volume_cm3": 1400.0, "volume_cm3": 50106.0}) == 1400.0
    assert choose_volume_cm3({"volume_cm3": 1400.0}) == 1400.0


def test_latest_batch_organs_drops_historical_collapsed_rows():
    from types import SimpleNamespace

    from app.services.organ_metrics import latest_batch_organs

    old = SimpleNamespace(
        image_id="img_demo_0001",
        mask_path="segmentations/batch_old/label_map_native.nii.gz",
        volume_cm3=50106.13,
    )
    new = SimpleNamespace(
        image_id="img_demo_0001",
        mask_path="segmentations/batch_new/label_map_native.nii.gz",
        volume_cm3=1420.0,
    )
    kept = latest_batch_organs([old, new], {"img_demo_0001": "batch_new"})
    assert kept == [new]


def test_volume_status_flags_implausible_liver():
    assert volume_status("liver", 1420.0) == "completed"
    assert volume_status("肝脏", 50106.13) == "implausible"
    assert volume_status("anatomy atlas", 450.0) == "completed"


def test_segmentation_qc_skips_atlas_and_flags_collapsed_liver(app_env, people, nifti_file):
    from sqlalchemy import select

    from app.models import MedicalImage
    from tests.conftest import upload

    app, client, _, _ = app_env
    pid = people["patient_a_pid"]
    image_id = upload(client, people, nifti_file)
    with app.state.session_factory() as db:
        image = db.scalar(select(MedicalImage).where(MedicalImage.id == image_id))
        assert image is not None
        db.add(
            OrganModel(
                id="model_atlas_qc",
                patient_id=pid,
                image_id=image_id,
                organ_id="atlas",
                source="segmentation",
                format="glb",
                kind="atlas",
                label_name="anatomy atlas",
                volume_cm3=450.0,
            )
        )
        db.add(
            OrganModel(
                id="model_liver_qc",
                patient_id=pid,
                image_id=image_id,
                organ_id="liver",
                source="segmentation",
                format="glb",
                kind="organ",
                label_name="liver",
                volume_cm3=50106.13,
            )
        )
        db.commit()

    res = client.get(
        f"/api/v1/agent/internal/patients/{pid}/segmentation_qc?study_id=study_{image_id}",
        headers=people["doctor_a"],
    )
    assert res.status_code == 200
    data = res.json()
    names = [o["name"] for o in data["organs"]]
    assert "anatomy atlas" not in names
    assert data["qc_status"] == "failed"
    liver = next(o for o in data["organs"] if o["organ_id"] == "liver")
    assert liver["status"] == "implausible"
    assert liver["volume_ml"] == 50106.13
