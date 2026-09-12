import pytest

from app.cli import set_access
from tests.conftest import record, upload


def test_patient_collection_never_lists_unauthorized_patients(app_env, people):
    app, client, _, _ = app_env
    assert client.get("/api/v1/patients").status_code == 401
    doctor = client.get("/api/v1/patients", headers=people["doctor_a"]).json()["data"]
    assert [p["patient_id"] for p in doctor["items"]] == [people["patient_a_pid"]]
    assert "id_number" not in str(doctor)
    assert client.get("/api/v1/patients", headers=people["doctor_b"]).json()["data"]["total"] == 0
    own = client.get("/api/v1/patients", headers=people["patient_b"]).json()["data"]["items"]
    assert [p["patient_id"] for p in own] == [people["patient_b_pid"]]
    me = client.get("/api/v1/auth/me", headers=people["patient_a"]).json()["data"]
    assert me["patient_id"] == people["patient_a_pid"]
    with app.state.session_factory() as db:
        set_access(db, "doctor_a", people["patient_a_pid"], "revoked")
    assert client.get("/api/v1/patients", headers=people["doctor_a"]).json()["data"]["items"] == []


@pytest.mark.parametrize("resource", ["medical-images", "medical-records"])
def test_portal_collections_enforce_access_and_pagination(app_env, people, nifti_file, resource):
    _, client, _, _ = app_env
    rid = record(client, people)
    image_id = upload(client, people, nifti_file)
    route = f"/api/v1/patients/{people['patient_a_pid']}/{resource}"
    for who in ["doctor_b", "patient_b"]:
        assert client.get(route, headers=people[who]).status_code == 403
    response = client.get(route, headers=people["patient_a"], params={"page_size": 1})
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total"] == 1
    assert data["items"][0].get("record_id", data["items"][0].get("image_id")) in [rid, image_id]
    assert "file_path" not in response.text
    assert (
        client.get(route, headers=people["doctor_a"], params={"page": 2}).json()["data"]["items"]
        == []
    )
    assert (
        client.get(route, headers=people["doctor_a"], params={"page_size": 101}).status_code == 422
    )
    if resource == "medical-records":
        assert client.delete(f"/api/v1/medical-records/{rid}", headers=people["doctor_a"]).status_code == 409
        assert client.get(route, headers=people["patient_a"]).json()["data"]["total"] == 1
