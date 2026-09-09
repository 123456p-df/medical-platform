import io

import numpy as np
from PIL import Image
from sqlalchemy import select

from app.models import AuditEvent, Patient
from tests.conftest import upload


def test_patient_create_duplicate_and_archive(app_env, people, nifti_file):
    app, client, settings, _ = app_env
    payload = {
        "name": "新患者",
        "id_number": "NEW-PRIVATE-IDENTITY",
        "birth_date": "1990-01-01",
        "blood_type": "AB-",
    }
    assert (
        client.post("/api/v1/patients", json=payload, headers=people["patient_a"]).status_code
        == 403
    )
    response = client.post("/api/v1/patients", json=payload, headers=people["doctor_a"])
    assert response.status_code == 201, response.text
    pid = response.json()["data"]["patient_id"]
    assert "NEW-PRIVATE-IDENTITY" not in response.text
    assert (
        client.get(f"/api/v1/patients/{pid}/overview", headers=people["doctor_b"]).status_code
        == 403
    )
    assert (
        client.get(f"/api/v1/patients/{pid}/overview", headers=people["doctor_a"]).status_code
        == 200
    )
    assert (
        client.post("/api/v1/patients", json=payload, headers=people["doctor_b"]).status_code == 409
    )
    assert client.delete(f"/api/v1/patients/{pid}", headers=people["doctor_b"]).status_code == 403
    assert client.delete(f"/api/v1/patients/{pid}", headers=people["patient_a"]).status_code == 403
    image_id = upload(client, people, nifti_file)
    archived = people["patient_a_pid"]
    assert (
        client.delete(f"/api/v1/patients/{archived}", headers=people["doctor_a"]).status_code == 200
    )
    for actor in ["doctor_a", "patient_a"]:
        for path in [
            f"/patients/{archived}/overview",
            f"/patients/{archived}/medical-records",
            f"/medical-images/{image_id}",
            f"/medical-images/{image_id}/slice/0",
        ]:
            assert client.get("/api/v1" + path, headers=people[actor]).status_code == 404
        rows = client.get("/api/v1/patients", headers=people[actor]).json()["data"]["items"]
        assert archived not in [row["patient_id"] for row in rows]
    with app.state.session_factory() as db:
        assert db.get(Patient, archived).deleted_at is not None
        assert db.scalar(select(AuditEvent).where(AuditEvent.action == "patient.delete"))
        assert db.get(Patient, pid).id_number_encrypted != payload["id_number"]


def test_patient_input_validation(app_env, people):
    _, client, _, _ = app_env
    for extra in [
        {"birth_date": "2099-01-01"},
        {"height": -3},
        {"blood_type": "banana"},
        {"name": "   "},
    ]:
        response = client.post(
            "/api/v1/patients",
            headers=people["doctor_a"],
            json={"name": "姓名", "id_number": "NEW-ID-0003", **extra},
        )
        assert response.status_code == 422


def test_profile_persistence_and_file_isolation(app_env, people):
    _, client, _, _ = app_env
    doctor, other = people["doctor_a"], people["doctor_b"]
    response = client.patch(
        "/api/v1/auth/profile",
        headers=doctor,
        json={"display_name": "周医生", "department": "影像科", "bio": "个人简介"},
    )
    assert response.status_code == 200
    assert (
        client.get("/api/v1/auth/profile", headers=doctor).json()["data"]["display_name"]
        == "周医生"
    )
    assert (
        client.get("/api/v1/auth/profile", headers=other).json()["data"]["display_name"]
        == "doctor_b"
    )
    assert (
        client.patch(
            "/api/v1/auth/profile", headers=doctor, json={"display_name": "A", "role": "patient"}
        ).status_code
        == 422
    )
    png = io.BytesIO()
    Image.new("RGB", (400, 300), "#31857d").save(png, "PNG")
    avatar = client.post(
        "/api/v1/auth/profile/avatar",
        headers=doctor,
        files={"file": ("face.png", png.getvalue(), "image/png")},
    )
    assert avatar.status_code == 200
    assert avatar.json()["data"]["avatar_url"].startswith("data:image/jpeg;base64,")
    assert (
        client.post(
            "/api/v1/auth/profile/avatar",
            headers=doctor,
            files={"file": ("bad.png", b"not an image", "image/png")},
        ).status_code
        == 400
    )
    response = client.post(
        "/api/v1/auth/profile/files",
        headers=doctor,
        files={"file": ("photo.png", png.getvalue(), "image/png")},
    )
    assert response.status_code == 201, response.text
    file_id = response.json()["data"]["id"]
    url = f"/api/v1/auth/profile/files/{file_id}"
    assert client.get(url, headers=doctor).headers["content-type"] == "image/jpeg"
    assert client.get(url, headers=other).status_code == 404
    assert client.delete(url, headers=other).status_code == 404
    assert client.get(url).status_code == 401
    assert client.delete(url, headers=doctor).status_code == 200
    assert client.get(url, headers=doctor).status_code == 404
    assert client.delete("/api/v1/auth/profile/avatar", headers=doctor).status_code == 200
    assert "avatar_url" not in client.get("/api/v1/auth/profile", headers=doctor).json()["data"]


def test_review_persists_reopens_and_is_scoped(app_env, people, nifti_file):
    _, client, _, _ = app_env
    image_id = upload(client, people, nifti_file)
    url = f"/api/v1/medical-images/{image_id}/review"
    for actor in ["patient_a", "doctor_b"]:
        assert client.patch(url, json={"completed": True}, headers=people[actor]).status_code == 403
    assert client.get("/api/v1/workflow", headers=people["patient_a"]).status_code == 403
    assert client.get("/api/v1/workflow", headers=people["doctor_b"]).json()["data"]["items"] == []
    assert (
        client.patch(url, json={"completed": True}, headers=people["doctor_a"]).status_code == 200
    )
    item = client.get("/api/v1/workflow", headers=people["doctor_a"]).json()["data"]["items"][0]
    assert item["completed_at"]
    # Idempotency retains the original confirmation time.
    assert (
        client.patch(url, json={"completed": True}, headers=people["doctor_a"]).json()["data"][
            "completed_at"
        ]
        == item["completed_at"]
    )
    client.patch(url, json={"completed": False}, headers=people["doctor_a"])
    assert (
        client.get("/api/v1/workflow", headers=people["doctor_a"]).json()["data"]["items"][0][
            "completed_at"
        ]
        is None
    )


def test_mpr_axes_window_and_bounds(app_env, people, nifti_file):
    _, client, _, _ = app_env
    image_id = upload(client, people, nifti_file)
    source = np.arange(12 * 14 * 16, dtype=np.float32).reshape(12, 14, 16)
    for axis, dimension in [("axial", 2), ("coronal", 1), ("sagittal", 0)]:
        for index in [0, source.shape[dimension] // 2, source.shape[dimension] - 1]:
            url = f"/api/v1/medical-images/{image_id}/slice/{index}?axis={axis}&window_center=1400&window_width=2800"
            response = client.get(url, headers=people["doctor_a"])
            assert response.status_code == 200
            assert response.headers["x-slice-axis"] == axis
            actual = np.asarray(Image.open(io.BytesIO(response.content)))
            plane = np.take(source, index, axis=dimension)
            expected = np.flip((np.clip(plane / 2800, 0, 1) * 255).astype(np.uint8).T, axis=(0, 1))
            np.testing.assert_array_equal(actual, expected)
        assert (
            client.get(
                f"/api/v1/medical-images/{image_id}/slice/{source.shape[dimension]}?axis={axis}",
                headers=people["doctor_a"],
            ).status_code
            == 404
        )
    assert (
        client.get(
            f"/api/v1/medical-images/{image_id}/slice/0?axis=wrong", headers=people["doctor_a"]
        ).status_code
        == 422
    )
