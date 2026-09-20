def test_admin_user_lifecycle_and_force_logout(app_env, people):
    _, client, _, _ = app_env
    created = client.post(
        "/api/v1/auth/admin/doctors",
        headers=people["admin"],
        json={"username": "admin_managed_doctor", "password": "Password123!", "department": "Radiology"},
    )
    assert created.status_code == 201, created.text
    user_id = created.json()["data"]["user_id"]

    login = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_managed_doctor", "password": "Password123!"},
    )
    assert login.status_code == 200
    doctor_headers = {
        "Authorization": "Bearer " + login.json()["data"]["access_token"],
    }
    assert client.get("/api/v1/auth/me", headers=doctor_headers).status_code == 200

    forced = client.post(f"/api/v1/admin/users/{user_id}/force-logout", headers=people["admin"])
    assert forced.status_code == 200, forced.text
    assert client.get("/api/v1/auth/me", headers=doctor_headers).status_code == 401

    reset = client.post(
        f"/api/v1/admin/users/{user_id}/reset-password",
        headers=people["admin"],
        json={"new_password": "Password456!"},
    )
    assert reset.status_code == 200, reset.text
    assert (
        client.post(
            "/api/v1/auth/login",
            json={"username": "admin_managed_doctor", "password": "Password123!"},
        ).status_code
        == 401
    )
    assert (
        client.post(
            "/api/v1/auth/login",
            json={"username": "admin_managed_doctor", "password": "Password456!"},
        ).status_code
        == 200
    )

    disabled = client.patch(
        f"/api/v1/admin/users/{user_id}/status",
        headers=people["admin"],
        json={"is_active": False},
    )
    assert disabled.status_code == 200 and disabled.json()["data"]["is_active"] is False
    assert (
        client.post(
            "/api/v1/auth/login",
            json={"username": "admin_managed_doctor", "password": "Password456!"},
        ).status_code
        == 401
    )


def test_admin_template_versions_default_and_usage(app_env, people):
    _, client, _, _ = app_env
    versions = client.get(
        "/api/v1/report-templates/template_chest_ct/versions",
        headers=people["doctor_a"],
    )
    assert versions.status_code == 200
    assert versions.json()["data"][0]["version"] == 1

    updated = client.patch(
        "/api/v1/report-templates/template_chest_ct",
        headers=people["admin"],
        json={"is_default": True},
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["is_default"] is True
    assert (
        client.patch(
            "/api/v1/report-templates/template_chest_ct",
            headers=people["doctor_a"],
            json={"is_default": True},
        ).status_code
        == 403
    )

    usage = client.get("/api/v1/admin/report-template-usage", headers=people["admin"])
    assert usage.status_code == 200 and isinstance(usage.json()["data"], list)


def test_admin_patient_access_and_stats(app_env, people):
    _, client, _, _ = app_env
    revoked = client.put(
        "/api/v1/admin/patient-access",
        headers=people["admin"],
        json={
            "doctor_user_id": people["doctor_a_id"],
            "patient_id": people["patient_a_pid"],
            "status": "revoked",
        },
    )
    assert revoked.status_code == 200
    assert revoked.json()["data"]["status"] == "revoked"
    assert (
        client.get(
            f"/api/v1/patients/{people['patient_a_pid']}/overview",
            headers=people["doctor_a"],
        ).status_code
        == 403
    )

    restored = client.put(
        "/api/v1/admin/patient-access",
        headers=people["admin"],
        json={
            "doctor_user_id": people["doctor_a_id"],
            "patient_id": people["patient_a_pid"],
            "status": "active",
        },
    )
    assert restored.status_code == 200 and restored.json()["data"]["status"] == "active"
    assert (
        client.get(
            f"/api/v1/patients/{people['patient_a_pid']}/overview",
            headers=people["doctor_a"],
        ).status_code
        == 200
    )

    stats = client.get("/api/v1/admin/stats?days=30", headers=people["admin"])
    assert stats.status_code == 200, stats.text
    data = stats.json()["data"]
    assert data["days"] == 30
    assert isinstance(data["doctor_activity"], list)
