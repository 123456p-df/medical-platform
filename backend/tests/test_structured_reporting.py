def test_default_templates_are_seeded_and_listed(app_env, people):
    _, client, _, _ = app_env
    response = client.get("/api/v1/report-templates", headers=people["doctor_a"])
    assert response.status_code == 200, response.text
    templates = response.json()["data"]
    assert {item["template_id"] for item in templates} == {
        "template_chest_ct",
        "template_brain_mri",
        "template_chest_xray",
    }
    assert any(item["modality"] == "CT" and item["organ_id"] == "lung" for item in templates)


def test_structured_record_round_trip(app_env, people):
    _, client, _, _ = app_env
    payload = {
        "organ_id": "lung",
        "diagnosis": "右肺上叶结节",
        "description": "结构化影像报告测试",
        "record_date": "2026-08-20",
        "reviewed": False,
        "report_template_id": "template_chest_ct",
        "structured_data": {
            "technique": "ui.reportTemplate.technique.nonContrast",
            "lung_findings": "右肺上叶见实性结节，边缘光滑。",
            "nodule_long_axis_mm": 12.5,
            "impression": "右肺上叶结节，建议随访。",
        },
    }
    created = client.post(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-records",
        headers=people["doctor_a"],
        json=payload,
    )
    assert created.status_code == 201, created.text
    data = created.json()["data"]
    assert data["report_template_id"] == "template_chest_ct"
    assert data["structured_data"]["nodule_long_axis_mm"] == 12.5
    assert data["report_template"]["fields"]

    fetched = client.get(f"/api/v1/medical-records/{data['record_id']}", headers=people["doctor_a"])
    assert fetched.status_code == 200
    assert fetched.json()["data"]["report_template"]["name"] == "Chest CT Structured Report"

    patched = client.patch(
        f"/api/v1/medical-records/{data['record_id']}",
        headers=people["doctor_a"],
        json={"structured_data": {**payload["structured_data"], "nodule_long_axis_mm": 14.0}},
    )
    assert patched.status_code == 200, patched.text
    assert patched.json()["data"]["structured_data"]["nodule_long_axis_mm"] == 14.0


def test_structured_report_requires_template_and_required_fields(app_env, people):
    _, client, _, _ = app_env
    missing_template = {
        "organ_id": "lung",
        "diagnosis": "测试",
        "description": "缺少模板的结构化数据",
        "record_date": "2026-08-20",
        "reviewed": False,
        "structured_data": {"impression": "无模板"},
    }
    response = client.post(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-records",
        headers=people["doctor_a"],
        json=missing_template,
    )
    assert response.status_code == 422 and response.json()["code"] == 42204

    missing_required = {
        "organ_id": "lung",
        "diagnosis": "测试",
        "description": "缺少必填字段",
        "record_date": "2026-08-20",
        "reviewed": False,
        "report_template_id": "template_chest_ct",
        "structured_data": {"technique": "ui.reportTemplate.technique.contrast"},
    }
    response = client.post(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-records",
        headers=people["doctor_a"],
        json=missing_required,
    )
    assert response.status_code == 422 and response.json()["code"] == 42204
    assert "lung_findings" in response.json()["field_errors"]


def test_template_write_is_admin_only(app_env, people):
    _, client, _, _ = app_env
    payload = {
        "name": "Doctor-created template",
        "modality": "CT",
        "organ_id": "liver",
        "fields": [{"key": "impression", "label": "Impression", "type": "textarea", "required": True}],
    }
    assert client.post("/api/v1/report-templates", json=payload, headers=people["doctor_a"]).status_code == 403
    created = client.post("/api/v1/report-templates", json=payload, headers=people["admin"])
    assert created.status_code == 201, created.text
    assert created.json()["data"]["template_id"].startswith("template_")
