import io

import nibabel as nib
import numpy as np
import pytest
from PIL import Image
from sqlalchemy import select

from app.models import AuditEvent, MedicalImage, RecordOrgan
from app.services import imaging
from app.services.storage import stored_path
from tests.conftest import upload


def test_volume_stream_is_canonical_scoped_and_revocable(app_env, people, nifti_file):
    _, client, _, _ = app_env
    image_id = upload(client, people, nifti_file)
    url = f"/api/v1/medical-images/{image_id}/volume"
    assert client.get(url).status_code == 401
    assert client.get(url, headers=people["doctor_b"]).status_code == 403
    response = client.get(url, headers=people["patient_a"])
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-image-orientation"] == "RAS"
    data = np.load(io.BytesIO(response.content), allow_pickle=False)
    np.testing.assert_array_equal(
        data, nib.as_closest_canonical(nib.load(nifti_file)).get_fdata(dtype=np.float32)
    )
    assert data.dtype == np.dtype("<f4")
    assert data.flags.c_contiguous or data.flags.f_contiguous
    pid = people["patient_a_pid"]
    assert client.delete(f"/api/v1/patients/{pid}", headers=people["doctor_a"]).status_code == 200
    assert client.get(url, headers=people["doctor_a"]).status_code == 404
    assert client.get(url, headers=people["patient_a"]).status_code == 404


def test_multi_organ_record_is_single_source_with_scoped_ai(app_env, people):
    app, client, _, provider = app_env
    pid = people["patient_a_pid"]
    headers = people["doctor_a"]
    payload = {
        "organ_id": "lung",
        "organ_ids": ["lung", "heart", "other"],
        "diagnosis": "多器官测试记录",
        "description": "用于验证跨器官关联",
        "record_date": "2026-09-08",
    }
    response = client.post(f"/api/v1/patients/{pid}/medical-records", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    rid = response.json()["data"]["record_id"]
    for organ in payload["organ_ids"]:
        detail = client.get(f"/api/v1/patients/{pid}/organs/{organ}", headers=headers).json()[
            "data"
        ]
        assert [r["record_id"] for r in detail["records"]] == [rid]
        rows = client.get(
            f"/api/v1/patients/{pid}/organs/{organ}/records", headers=people["patient_a"]
        ).json()["data"]
        assert rows["total"] == 1
        result = client.post(
            "/api/v1/ai/chat",
            headers=headers,
            json={"patient_id": pid, "organ_id": organ, "question": "总结"},
        )
        assert result.status_code == 200
        assert provider.calls[-1][0]["records"][0]["record_id"] == rid
    all_records = client.get(f"/api/v1/patients/{pid}/medical-records", headers=headers).json()[
        "data"
    ]
    assert all_records["total"] == 1
    flags = client.get(f"/api/v1/patients/{pid}/overview", headers=headers).json()["data"]["organs"]
    assert {o["organ_id"] for o in flags if o["has_record"]} == set(payload["organ_ids"])
    assert (
        client.patch(
            f"/api/v1/medical-records/{rid}",
            headers=people["doctor_b"],
            json={"organ_ids": ["eye"]},
        ).status_code
        == 403
    )
    response = client.patch(
        f"/api/v1/medical-records/{rid}",
        headers=headers,
        json={"organ_ids": ["heart", "eye"], "diagnosis": "已更新的共同记录"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["data"]["organ_ids"] == ["heart", "eye"]
    for organ, count in [("heart", 1), ("eye", 1), ("lung", 0), ("other", 0)]:
        data = client.get(f"/api/v1/patients/{pid}/organs/{organ}/records", headers=headers).json()[
            "data"
        ]
        assert data["total"] == count
        if count:
            assert data["items"][0]["diagnosis"] == "已更新的共同记录"
    with app.state.session_factory() as db:
        event = db.scalar(select(AuditEvent).where(AuditEvent.action == "record.update"))
        assert event.before["organ_ids"] == ["lung", "heart", "other"]
        assert event.after["organ_ids"] == ["heart", "eye"]
        assert len(list(db.scalars(select(RecordOrgan)))) == 2
    client.delete(f"/api/v1/medical-records/{rid}", headers=headers)
    assert (
        client.get(f"/api/v1/patients/{pid}/organs/eye/records", headers=headers).json()["data"][
            "total"
        ]
        == 0
    )


@pytest.mark.parametrize("organs", [[], ["lung", "lung"], ["not-an-organ"], ["heart"]])
def test_invalid_associations_rejected(app_env, people, organs):
    _, client, _, _ = app_env
    result = client.post(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-records",
        headers=people["doctor_a"],
        json={
            "organ_id": "lung",
            "organ_ids": organs,
            "diagnosis": "测试",
            "description": "测试",
            "record_date": "2026-09-08",
        },
    )
    assert result.status_code in {404, 422}


def test_uncompressed_cache_survives_memory_clear_without_decoding(
    app_env, people, nifti_file, monkeypatch
):
    app, client, settings, _ = app_env
    image_id = upload(client, people, nifti_file)
    with app.state.session_factory() as db:
        path = stored_path(settings, db.get(MedicalImage, image_id).file_path)
    cache = imaging.slice_cache_path(path)
    assert cache.exists()
    imaging.release_volume_cache(settings.storage_root)

    def no_decode(*args, **kwargs):
        raise AssertionError("Slice reading must not decode the original volume")

    monkeypatch.setattr(imaging, "load_volume", no_decode)
    response = client.get(
        f"/api/v1/medical-images/{image_id}/slice/2?axis=coronal", headers=people["doctor_a"]
    )
    assert response.status_code == 200
    assert Image.open(io.BytesIO(response.content)).size == (12, 16)
    values = imaging.canonical_voxels(path, settings)
    assert isinstance(values, np.memmap) and not values.flags.writeable
    assert (
        client.get(
            f"/api/v1/medical-images/{image_id}/slice/2", headers=people["doctor_b"]
        ).status_code
        == 403
    )


def test_truncated_disk_cache_is_rebuilt(app_env, people, nifti_file):
    app, client, settings, _ = app_env
    image_id = upload(client, people, nifti_file)
    with app.state.session_factory() as db:
        path = stored_path(settings, db.get(MedicalImage, image_id).file_path)
    imaging.slice_cache_path(path).write_bytes(b"truncated")
    response = client.get(f"/api/v1/medical-images/{image_id}/slice/0", headers=people["doctor_a"])
    assert response.status_code == 200
