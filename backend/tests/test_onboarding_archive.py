from sqlalchemy import select

from app.models import AuditEvent, Doctor, DoctorPatientAccess, Patient, PatientArchive, User


def login(client, username, password="password-test-123"):
    response = client.post(
        "/api/v1/auth/login", json={"username": username, "password": password}
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['data']['access_token']}"}


def test_self_registration_requires_onboarding_and_identity_is_unique(app_env):
    app, client, _, _ = app_env
    registered = client.post(
        "/api/v1/auth/register",
        json={"username": "onboarding_patient", "password": "password-test-123"},
    )
    assert registered.status_code == 201
    headers = login(client, "onboarding_patient")
    me = client.get("/api/v1/auth/me", headers=headers).json()["data"]
    assert me["account_role"] == "patient"
    assert me["profile_completed"] is False
    assert me["patient_id"] is not None

    payload = {
        "name": "建档患者",
        "id_number": "ONBOARD-IDENTITY-001",
        "birth_date": "1988-04-12",
        "gender": "female",
        "height": 165,
        "weight": 58,
        "blood_type": "A+",
    }
    response = client.patch("/api/v1/patient/onboarding", json=payload, headers=headers)
    assert response.status_code == 200, response.text
    assert response.json()["data"]["profile_completed"] is True
    assert client.get("/api/v1/auth/me", headers=headers).json()["data"]["profile_completed"] is True
    assert (
        client.patch("/api/v1/patient/onboarding", json=payload, headers=headers).status_code
        == 409
    )

    client.post(
        "/api/v1/auth/register",
        json={"username": "duplicate_onboarding", "password": "password-test-123"},
    )
    duplicate = login(client, "duplicate_onboarding")
    conflict = client.patch(
        "/api/v1/patient/onboarding",
        json={**payload, "name": "重复身份"},
        headers=duplicate,
    )
    assert conflict.status_code == 409 and conflict.json()["code"] == 40904
    with app.state.session_factory() as db:
        patient = db.scalar(select(Patient).where(Patient.user_id == me["user_id"]))
        assert patient.profile_completed_at is not None
        assert payload["id_number"] not in patient.id_number_encrypted


def test_invitation_links_doctor_created_patient_and_cleans_empty_profile(app_env, people):
    app, client, _, _ = app_env
    created = client.post(
        "/api/v1/patients",
        json={"name": "待绑定患者", "id_number": "INVITE-IDENTITY-002"},
        headers=people["doctor_a"],
    )
    assert created.status_code == 201, created.text
    patient_id = created.json()["data"]["patient_id"]

    invitation_route = f"/api/v1/doctor/patients/{patient_id}/invitations"
    assert client.post(invitation_route, json={}, headers=people["doctor_b"]).status_code == 403
    invitation = client.post(invitation_route, json={"expires_minutes": 30}, headers=people["doctor_a"])
    assert invitation.status_code == 201, invitation.text
    assert client.post(invitation_route, json={}, headers=people["doctor_a"]).status_code == 409
    code = invitation.json()["data"]["code"]

    client.post(
        "/api/v1/auth/register",
        json={"username": "invited_patient", "password": "password-test-123"},
    )
    invited = login(client, "invited_patient")
    me = client.get("/api/v1/auth/me", headers=invited).json()["data"]
    empty_profile_id = me["patient_id"]

    wrong_identity = client.post(
        "/api/v1/patient/link",
        json={"token": code, "name": "待绑定患者", "id_number": "WRONG-IDENTITY"},
        headers=invited,
    )
    assert wrong_identity.status_code == 403 and wrong_identity.json()["code"] == 40306
    assert (
        client.post(
            "/api/v1/patient/link",
            json={"token": "bad-token" * 6, "name": "待绑定患者", "id_number": "INVITE-IDENTITY-002"},
            headers=invited,
        ).status_code
        == 404
    )
    linked = client.post(
        "/api/v1/patient/link",
        json={"token": code, "name": "待绑定患者", "id_number": "INVITE-IDENTITY-002"},
        headers=invited,
    )
    assert linked.status_code == 200, linked.text
    assert linked.json()["data"]["patient_id"] == patient_id
    refreshed = client.get("/api/v1/auth/me", headers=invited).json()["data"]
    assert refreshed["patient_id"] == patient_id and refreshed["profile_completed"] is True
    assert (
        client.post(
            "/api/v1/patient/link",
            json={"token": code, "name": "待绑定患者", "id_number": "INVITE-IDENTITY-002"},
            headers=invited,
        ).status_code
        == 409
    )
    with app.state.session_factory() as db:
        assert db.get(Patient, empty_profile_id).user_id is None
        assert db.get(Patient, empty_profile_id).deleted_at is not None
        assert db.get(Patient, patient_id).user_id == me["user_id"]
        assert (
            db.scalar(
                select(AuditEvent).where(
                    AuditEvent.action == "patient.link",
                    AuditEvent.patient_id == patient_id,
                )
            )
            is not None
        )


def test_doctor_link_existing_is_idempotent_and_scoped(app_env, people):
    _, client, _, _ = app_env
    route = "/api/v1/doctor/patients/link-existing"
    payload = {"name": "测试患者甲", "id_number": "TEST-ID-000001"}
    assert client.post(route, json=payload, headers=people["patient_a"]).status_code == 403
    linked = client.post(route, json=payload, headers=people["doctor_b"])
    assert linked.status_code == 200 and linked.json()["data"]["already_linked"] is False
    assert (
        client.get(
            f"/api/v1/patients/{people['patient_a_pid']}/overview", headers=people["doctor_b"]
        ).status_code
        == 200
    )
    repeat = client.post(route, json=payload, headers=people["doctor_b"])
    assert repeat.status_code == 200 and repeat.json()["data"]["already_linked"] is True


def test_access_removal_is_doctor_scoped_and_global_archive_requires_admin(app_env, people):
    app, client, _, _ = app_env
    patient_b_id = people["patient_b_pid"]
    access_route = f"/api/v1/doctor/patients/{patient_b_id}/access"
    assert client.delete(access_route, headers=people["doctor_a"]).status_code == 200
    assert (
        client.get(f"/api/v1/patients/{patient_b_id}/overview", headers=people["doctor_a"]).status_code
        == 403
    )
    assert (
        client.get(f"/api/v1/patients/{patient_b_id}/overview", headers=people["patient_b"]).status_code
        == 200
    )

    archive_route = f"/api/v1/admin/patients/{patient_b_id}/archive"
    assert (
        client.post(archive_route, json={"reason": "无权限测试"}, headers=people["doctor_a"]).status_code
        == 403
    )
    archived = client.post(
        archive_route, json={"reason": "合规归档"}, headers=people["admin"]
    )
    assert archived.status_code == 200, archived.text
    archive_id = archived.json()["data"]["archive_id"]
    assert (
        client.get(f"/api/v1/patients/{patient_b_id}/overview", headers=people["patient_b"]).status_code
        == 404
    )
    assert (
        client.post(
            archive_route, json={"reason": "重复归档"}, headers=people["admin"]
        ).json()["data"]["archive_id"]
        == archive_id
    )

    listing = client.get("/api/v1/admin/patients/archived", headers=people["admin"])
    assert listing.status_code == 200
    assert [item["patient_id"] for item in listing.json()["data"]["items"]] == [patient_b_id]
    assert listing.json()["data"]["items"][0]["archived_by_username"] == "admin"
    assert client.get("/api/v1/admin/patients/archived", headers=people["doctor_a"]).status_code == 403

    restored = client.post(
        f"/api/v1/admin/patients/{patient_b_id}/restore", headers=people["admin"]
    )
    assert restored.status_code == 200, restored.text
    assert restored.json()["data"]["restored_by_username"] == "admin"
    assert (
        client.get(f"/api/v1/patients/{patient_b_id}/overview", headers=people["patient_b"]).status_code
        == 200
    )
    assert client.get("/api/v1/admin/patients/archived", headers=people["admin"]).json()["data"][
        "items"
    ] == []

    with app.state.session_factory() as db:
        doctor = db.scalar(
            select(Doctor).join(User, User.id == Doctor.user_id).where(User.username == "doctor_a")
        )
        access = db.get(DoctorPatientAccess, (doctor.id, patient_b_id))
        assert access is None or access.status == "revoked"
        archive = db.get(PatientArchive, archive_id)
        assert archive.restored_at is not None
        assert archive.restored_by_user_id == people["admin_id"]
