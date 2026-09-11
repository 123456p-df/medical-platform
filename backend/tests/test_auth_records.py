from datetime import timedelta

import jwt
import pytest
from sqlalchemy import select

from app.cli import set_access
from app.models import AuditEvent, MedicalRecord, Patient, User, utcnow
from tests.conftest import record


def test_registration_roles_passwords_uniqueness(app_env):
    app, client, _, _ = app_env
    body = {"username": "doctor", "password": "very-secret-test", "role": "doctor"}
    first = client.post("/api/v1/auth/register", json=body)
    assert first.status_code == 201
    assert "password" not in first.text
    assert client.post("/api/v1/auth/register", json=body).status_code == 409
    assert client.post("/api/v1/auth/register", json=body | {"role": "admin"}).status_code == 422
    with app.state.session_factory() as db:
        user = db.scalar(select(User))
        assert user.password_hash.startswith("$argon2")
        assert body["password"] not in user.password_hash
    invalid = client.post("/api/v1/auth/register", json=body | {"password": "secret"})
    assert "secret" not in invalid.text and invalid.json()["data"] is None
    assert client.get("/api/v1/auth/me").status_code == 401
    wrong = client.post("/api/v1/auth/login", json={"username": "doctor", "password": "wrong-pass"})
    assert wrong.status_code == 401
    assert wrong.headers["www-authenticate"] == "Bearer"


def test_jwt_rejects_expired_forged_and_incomplete(app_env, people):
    _, client, settings, _ = app_env
    now = utcnow()
    claims = {
        "sub": str(people["doctor_a_id"]),
        "iat": now,
        "nbf": now,
        "exp": now - timedelta(seconds=1),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }
    expired = jwt.encode(claims, settings.jwt_secret.get_secret_value(), algorithm="HS256")
    incomplete = jwt.encode(
        {"sub": claims["sub"]}, settings.jwt_secret.get_secret_value(), algorithm="HS256"
    )
    forged = jwt.encode(claims | {"exp": now + timedelta(hours=1)}, "x" * 48, algorithm="HS256")
    for token in [expired, incomplete, forged, "garbage"]:
        assert (
            client.get("/api/v1/auth/me", headers={"Authorization": "Bearer " + token}).status_code
            == 401
        )
    assert (
        client.get("/api/v1/auth/me", headers=people["doctor_a"]).json()["data"]["role"] == "doctor"
    )


def test_resolve_identity_encryption_and_access(app_env, people):
    app, client, _, _ = app_env
    body = {"name": "测试患者甲", "id_number": "TEST-ID-000001"}
    route = "/api/v1/doctor/patients/resolve"
    assert client.post(route, json=body, headers=people["patient_a"]).status_code == 403
    denied = client.post(route, json=body, headers=people["doctor_b"])
    assert denied.status_code == 403 and denied.json()["code"] == 40301
    found = client.post(route, json=body, headers=people["doctor_a"])
    assert found.status_code == 200
    assert "id_number" not in found.text and body["id_number"] not in found.text
    assert (
        client.post(route, json=body | {"name": "不存在"}, headers=people["doctor_a"]).status_code
        == 404
    )
    with app.state.session_factory() as db:
        patient = db.get(Patient, people["patient_a_pid"])
        assert patient.id_number_encrypted != body["id_number"]
        assert len(patient.id_number_hash) == 64
        set_access(db, "doctor_a", patient.id, "revoked")
    assert client.post(route, json=body, headers=people["doctor_a"]).status_code == 403


def test_record_lifecycle_filters_and_audit(app_env, people):
    app, client, _, _ = app_env
    pid = people["patient_a_pid"]
    rid = record(client, people)
    record(client, people, record_date="2025-01-01")
    route = f"/api/v1/medical-records/{rid}"
    assert client.get(route, headers=people["patient_a"]).status_code == 200
    for who in ["patient_b", "doctor_b"]:
        assert client.get(route, headers=people[who]).status_code == 403
        assert (
            client.patch(route, json={"diagnosis": "攻击"}, headers=people[who]).status_code == 403
        )
        assert client.delete(route, headers=people[who]).status_code == 403
    assert (
        client.patch(route, json={"diagnosis": "患者修改"}, headers=people["patient_a"]).status_code
        == 403
    )
    assert (
        client.patch(route, json={"diagnosis": None}, headers=people["doctor_a"]).status_code == 422
    )
    assert client.patch(route, json={}, headers=people["doctor_a"]).status_code == 422
    history = f"/api/v1/patients/{pid}/organs/lung/records"
    page = client.get(
        history, params={"start_date": "2026-01-01", "page_size": 1}, headers=people["doctor_a"]
    ).json()["data"]
    assert page["total"] == 1 and page["items"][0]["record_id"] == rid
    assert (
        client.get(history, params={"page_size": 101}, headers=people["doctor_a"]).status_code
        == 422
    )
    assert (
        client.get(
            history,
            params={"start_date": "2027-01-01", "end_date": "2026-01-01"},
            headers=people["doctor_a"],
        ).status_code
        == 400
    )
    assert (
        client.patch(route, json={"diagnosis": "已修改"}, headers=people["doctor_a"]).status_code
        == 200
    )
    assert client.delete(route, headers=people["doctor_a"]).json()["data"] is None
    assert client.get(route, headers=people["patient_a"]).status_code == 404
    with app.state.session_factory() as db:
        assert db.get(MedicalRecord, rid).deleted_at is not None
        events = list(
            db.scalars(
                select(AuditEvent)
                .where(
                    AuditEvent.resource_id == str(rid), AuditEvent.resource_type == "medical_record"
                )
                .order_by(AuditEvent.id)
            )
        )
        assert [event.action for event in events] == [
            "record.create",
            "record.update",
            "record.delete",
        ]
        assert events[1].before["diagnosis"] == "测试记录"
        assert events[2].after["deleted_at"] is not None


def test_patient_receives_report_only_after_doctor_signs(app_env, people):
    _, client, _, _ = app_env
    patient_id = people["patient_a_pid"]
    record_id = record(
        client,
        people,
        diagnosis="待签署诊断",
        description="待签署影像所见",
        recommendation="三个月后复查",
        reviewed=False,
    )
    route = f"/api/v1/medical-records/{record_id}"
    collection = f"/api/v1/patients/{patient_id}/medical-records"

    assert client.get(route, headers=people["doctor_a"]).status_code == 200
    assert client.get(route, headers=people["patient_a"]).status_code == 404
    assert record_id not in {
        item["record_id"]
        for item in client.get(collection, headers=people["patient_a"]).json()["data"]["items"]
    }

    signed = client.patch(route, json={"reviewed": True}, headers=people["doctor_a"])
    assert signed.status_code == 200
    assert signed.json()["data"]["signed_at"] is not None

    delivered = client.get(route, headers=people["patient_a"])
    assert delivered.status_code == 200
    assert delivered.json()["data"]["recommendation"] == "三个月后复查"
    assert record_id in {
        item["record_id"]
        for item in client.get(collection, headers=people["patient_a"]).json()["data"]["items"]
    }


@pytest.mark.parametrize("suffix", ["overview", "organs/lung", "organs/lung/records"])
def test_all_patient_read_routes_enforce_access(app_env, people, suffix):
    _, client, _, _ = app_env
    route = f"/api/v1/patients/{people['patient_a_pid']}/{suffix}"
    assert client.get(route).status_code == 401
    assert client.get(route, headers=people["doctor_b"]).status_code == 403
    assert client.get(route, headers=people["patient_b"]).status_code == 403
    assert client.get(route, headers=people["patient_a"]).status_code == 200
