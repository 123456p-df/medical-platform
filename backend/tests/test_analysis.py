import time

import httpx
import numpy as np
import pytest
from pydantic import SecretStr, ValidationError

from app.adapters.lung_nodule import LungNoduleHTTPAdapter, validate_detection_output
from tests.conftest import SyntheticDetectionAdapter, upload


def wait_analysis(client, headers, task_id):
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline:
        response = client.get(f"/api/v1/analysis/tasks/{task_id}", headers=headers)
        assert response.status_code == 200, response.text
        result = response.json()["data"]
        if result["status"] in {"completed", "failed"}:
            return result
        time.sleep(0.02)
    raise AssertionError("Analysis fixture did not finish")


def start_analysis(client, headers, image_id, threshold=0.1):
    response = client.post(
        f"/api/v1/medical-images/{image_id}/analysis",
        headers=headers,
        json={"analysis_type": "lung_nodule_detection", "score_threshold": threshold},
    )
    assert response.status_code == 201, response.text
    task_id = response.json()["data"]["task_id"]
    return task_id, wait_analysis(client, headers, task_id)


def test_lung_nodule_analysis_and_review(app_env, people, nifti_file):
    _, client, _, _ = app_env
    status = client.get("/api/v1/analysis/status", headers=people["doctor_a"])
    assert status.json()["data"] == {
        "configured": True,
        "analysis_type": "lung_nodule_detection",
        "model_name": "synthetic/lung-nodule:1",
        "supported_image_types": ["CT"],
        "supported_organs": ["lung"],
    }
    image_id = upload(client, people, nifti_file)
    route = f"/api/v1/medical-images/{image_id}/analysis"
    assert (
        client.post(route, headers=people["patient_a"], json={"score_threshold": 0.5}).status_code
        == 403
    )
    task_id, task = start_analysis(client, people["doctor_a"], image_id, 0.5)
    assert task["status"] == "completed"
    assert task["result"]["findings_count"] == 1
    assert task["model_name"] == "synthetic/lung-nodule:1"
    assert client.get(f"/api/v1/analysis/tasks/{task_id}", headers=people["doctor_b"]).status_code == 403

    findings_route = f"/api/v1/medical-images/{image_id}/findings"
    findings = client.get(findings_route, headers=people["patient_a"]).json()["data"]
    assert len(findings) == 1
    finding = findings[0]
    assert finding["status"] == "pending" and finding["coordinate_system"] == "RAS"
    assert finding["box_mode"] == "cccwhd"
    np.testing.assert_allclose(finding["center_voxel"], [5.0, 6.0, 7.0])
    np.testing.assert_allclose(finding["box_voxel"], [5.0, 6.0, 7.0, 4.0, 3.0, 3.0])
    assert finding["diameter_mm"] == 12.0 and finding["confidence"] == 0.93
    patient_findings = client.get(
        f"/api/v1/patients/{people['patient_a_pid']}/findings",
        headers=people["doctor_a"],
    ).json()["data"]
    assert [item["finding_id"] for item in patient_findings] == [finding["finding_id"]]

    review_route = f"/api/v1/findings/{finding['finding_id']}"
    assert (
        client.patch(review_route, headers=people["patient_a"], json={"status": "confirmed"}).status_code
        == 403
    )
    reviewed = client.patch(
        review_route,
        headers=people["doctor_a"],
        json={"status": "modified", "description": "医生核对后的测试描述"},
    )
    assert reviewed.status_code == 200
    assert reviewed.json()["data"]["status"] == "modified"
    assert reviewed.json()["data"]["description"] == "医生核对后的测试描述"

    second_id, second = start_analysis(client, people["doctor_a"], image_id, 0.95)
    assert second["result"]["findings_count"] == 0
    assert client.get(findings_route, headers=people["doctor_a"]).json()["data"] == []
    historical = client.get(
        findings_route + f"?task_id={task_id}", headers=people["doctor_a"]
    ).json()["data"]
    assert len(historical) == 1
    assert second_id != task_id


def test_analysis_rejects_wrong_image_and_private_errors(app_env, people, nifti_file):
    app, client, _, _ = app_env
    mri_id = upload(client, people, nifti_file, image_type="MRI")
    assert (
        client.post(
            f"/api/v1/medical-images/{mri_id}/analysis",
            headers=people["doctor_a"],
            json={},
        ).status_code
        == 400
    )
    liver_id = upload(client, people, nifti_file, organ_id="liver")
    assert (
        client.post(
            f"/api/v1/medical-images/{liver_id}/analysis",
            headers=people["doctor_a"],
            json={},
        ).status_code
        == 400
    )

    def broken(**kwargs):
        raise RuntimeError("PRIVATE-ID /data/private-image secret-token")

    app.state.analysis_runner.adapter = broken
    image_id = upload(client, people, nifti_file)
    task_id, task = start_analysis(client, people["doctor_a"], image_id)
    assert task["status"] == "failed" and "PRIVATE" not in str(task)
    app.state.analysis_runner.adapter = None
    assert (
        client.post(
            f"/api/v1/medical-images/{image_id}/analysis",
            headers=people["doctor_a"],
            json={},
        ).status_code
        == 503
    )
    app.state.analysis_runner.adapter = SyntheticDetectionAdapter()


def test_http_adapter_contract(app_env, nifti_file):
    _, _, settings, _ = app_env

    def handler(request):
        assert request.headers["authorization"] == "Bearer test-model-token"
        assert request.url.path == "/v1/lung-nodule/detect"
        return httpx.Response(
            200,
            json={
                "model_name": "MONAI/lung_nodule_ct_detection:0.6.9",
                "coordinate_system": "RAS",
                "box_mode": "cccwhd",
                "findings": [
                    {"box": [10, 18, 28, 8, 9, 12], "score": 0.91, "label": 0},
                    {"box": [4, 6, 8, 2, 2, 2], "score": 0.05, "label": 0},
                ],
            },
        )

    configured = settings.model_copy(
        update={
            "lung_nodule_model_url": "http://model.internal:8001",
            "lung_nodule_model_token": SecretStr("test-model-token"),
        }
    )
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        adapter = LungNoduleHTTPAdapter(configured, client=client)
        output = adapter(
            image_path=nifti_file, score_threshold=0.1, progress=lambda value: None
        )
    assert len(output.findings) == 1 and output.findings[0].score == 0.91

    with pytest.raises(ValidationError):
        validate_detection_output(
            {
                "model_name": "bad",
                "coordinate_system": "voxel",
                "box_mode": "xyzxyz",
                "findings": [],
            },
            score_threshold=0.1,
            max_findings=300,
        )
