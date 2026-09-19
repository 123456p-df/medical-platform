import json
import time

import httpx
import pytest
from sqlalchemy import func, select

from app.cli import set_access
from app.errors import APIError
from app.models import AIConversation, AIInvocation, AIMessage, AIProviderConfig
from app.services.ai import AIProvider
from tests.conftest import record, upload


def test_chat_context_is_authorized_referenced_and_persisted(app_env, people, nifti_file):
    app, client, _, provider = app_env
    pid = people["patient_a_pid"]
    rid = record(client, people)
    deleted = record(client, people, diagnosis="DELETED-SECRET", reviewed=False)
    liver = record(client, people, organ_id="liver", diagnosis="OTHER-ORGAN-SECRET")
    client.delete(f"/api/v1/medical-records/{deleted}", headers=people["doctor_a"])
    upload(client, people, nifti_file)
    body = {"patient_id": pid, "organ_id": "lung", "question": "总结最近记录"}
    for who in ["doctor_b", "patient_b"]:
        assert client.post("/api/v1/ai/chat", json=body, headers=people[who]).status_code == 403
    assert not provider.calls
    response = client.post("/api/v1/ai/chat", json=body, headers=people["doctor_a"])
    assert response.status_code == 200, response.text
    assert response.json()["data"]["references"] == [{"record_id": rid, "date": "2026-08-20"}]
    context = provider.calls[0][0]
    serialized = json.dumps(context, ensure_ascii=False)
    assert all(
        secret not in serialized
        for secret in ["TEST-ID", "测试患者甲", "DELETED-SECRET", "OTHER-ORGAN-SECRET"]
    )
    assert context["images"][0]["image_type"] == "CT"
    assert provider.calls[0][2] == "doctor"
    draft = record(client, people, diagnosis="DRAFT-SECRET", reviewed=False)
    assert client.post("/api/v1/ai/chat", json=body, headers=people["patient_a"]).status_code == 200
    assert provider.calls[1][2] == "patient"
    assert draft not in [item["record_id"] for item in provider.calls[1][0]["records"]]
    with app.state.session_factory() as db:
        messages = list(db.scalars(select(AIMessage).order_by(AIMessage.id)))
        assert len(messages) == 4
        assert [m.role for m in messages] == ["user", "assistant", "user", "assistant"]
        assert messages[1].references[0]["record_id"] == rid
        assert liver not in [r["record_id"] for r in messages[1].references]


def test_unconfigured_ai_returns_503_without_persisting(app_env, people):
    app, client, settings, _ = app_env
    app.state.ai_provider = AIProvider(settings)
    body = {"patient_id": people["patient_a_pid"], "organ_id": "lung", "question": "最近情况"}
    response = client.post("/api/v1/ai/chat", json=body, headers=people["patient_a"])
    assert response.status_code == 503
    with app.state.session_factory() as db:
        assert db.scalar(select(func.count()).select_from(AIConversation)) == 0


def mock_http(monkeypatch, handler):
    real_client = httpx.Client
    monkeypatch.setattr(
        "app.services.ai.httpx.Client",
        lambda **kwargs: real_client(transport=httpx.MockTransport(handler), **kwargs),
    )


@pytest.mark.parametrize(
    "payload",
    [
        {"answer": "fabricated reference", "used_record_ids": [999]},
        {"answer": "string reference", "used_record_ids": ["7"]},
        {"answer": " ", "used_record_ids": [7]},
        "not a JSON object",
    ],
)
def test_provider_rejects_invalid_answers(app_env, monkeypatch, payload):
    _, _, settings, _ = app_env
    settings = settings.model_copy(
        update={"ai_base_url": "https://test.invalid/v1", "ai_model": "test-model"}
    )
    mock_http(
        monkeypatch,
        lambda req: httpx.Response(
            200, json={"choices": [{"message": {"content": json.dumps(payload)}}]}
        ),
    )
    with pytest.raises(APIError) as error:
        AIProvider(settings).answer({"records": [{"record_id": 7}]}, "question", "doctor")
    assert error.value.status == 502


def test_provider_allows_general_answer_and_redacts_external_phi(app_env, monkeypatch):
    _, _, settings, _ = app_env
    settings = settings.model_copy(
        update={"ai_base_url": "https://test.invalid/v1", "ai_model": "test-model"}
    )
    requests = []

    def handler(request):
        requests.append(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {"answer": "这是一般医学信息。", "used_record_ids": []}
                            )
                        }
                    }
                ]
            },
        )

    mock_http(monkeypatch, handler)
    context = {
        "records": [
            {
                "record_id": 7,
                "diagnosis": "姓名：张三，身份证号：110101199001011234",
                "description": "联系电话：13800138000，邮箱 test@example.com",
            }
        ]
    }
    answer = AIProvider(settings).answer(context, "常识问题", "patient")
    assert answer.used_record_ids == []
    outbound = requests[0]["messages"][1]["content"]
    assert "张三" not in outbound
    assert "110101199001011234" not in outbound
    assert "13800138000" not in outbound
    assert "test@example.com" not in outbound


def test_provider_role_prompts_and_request_shape(app_env, monkeypatch):
    _, _, settings, _ = app_env
    settings = settings.model_copy(
        update={"ai_base_url": "https://test.invalid/v1", "ai_model": "my-model"}
    )
    requests = []

    def handler(request):
        requests.append(json.loads(request.content))
        assert str(request.url) == "https://test.invalid/v1/chat/completions"
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {"answer": "根据测试病历 7 的记录。", "used_record_ids": [7]}
                            )
                        }
                    }
                ]
            },
        )

    mock_http(monkeypatch, handler)
    provider = AIProvider(settings)
    for role in ["doctor", "patient"]:
        assert provider.answer(
            {"records": [{"record_id": 7}]}, "question", role
        ).used_record_ids == [7]
    assert requests[0]["model"] == "my-model"
    assert "面向医生" in requests[0]["messages"][0]["content"]
    assert "不提供新的诊断" in requests[1]["messages"][0]["content"]


def test_provider_tool_calling_loop(app_env, monkeypatch):
    _, _, settings, _ = app_env
    settings = settings.model_copy(
        update={"ai_base_url": "https://test.invalid/v1", "ai_model": "test-model"}
    )
    requests = []
    dispatched = []

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        if len(requests) == 1:
            return httpx.Response(
                200,
                json={
                    "choices": [
                        {
                            "message": {
                                "role": "assistant",
                                "content": None,
                                "tool_calls": [
                                    {
                                        "id": "call_1",
                                        "type": "function",
                                        "function": {
                                            "name": "get_medical_record",
                                            "arguments": json.dumps({"record_id": 9}),
                                        },
                                    }
                                ],
                            },
                            "finish_reason": "tool_calls",
                        }
                    ]
                },
            )
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": json.dumps(
                                {"answer": "根据病历 9 的说明。", "used_record_ids": [9]}
                            ),
                        },
                        "finish_reason": "stop",
                    }
                ]
            },
        )

    mock_http(monkeypatch, handler)

    def dispatcher(name, arguments):
        dispatched.append((name, arguments))
        return {"ok": True, "record": {"record_id": 9, "date": "2026-01-01", "diagnosis": "测试诊断"}}

    answer = AIProvider(settings).answer_with_tools(
        {"records": []}, "详细说明病历 9", "doctor", tool_dispatcher=dispatcher
    )
    assert answer.used_record_ids == [9]
    assert dispatched == [("get_medical_record", {"record_id": 9})]
    assert len(requests) == 2
    assert requests[0]["tools"]
    tool_messages = [m for m in requests[1]["messages"] if m.get("role") == "tool"]
    assert tool_messages and "测试诊断" in tool_messages[0]["content"]


def test_access_revoked_during_ai_call_is_rechecked(app_env, people):
    app, client, _, provider = app_env
    original = provider.answer

    def revoke_then_answer(*args):
        with app.state.session_factory() as db:
            set_access(db, "doctor_a", people["patient_a_pid"], "revoked")
        return original(*args)

    provider.answer = revoke_then_answer
    response = client.post(
        "/api/v1/ai/chat",
        headers=people["doctor_a"],
        json={"patient_id": people["patient_a_pid"], "organ_id": "lung", "question": "test"},
    )
    assert response.status_code == 403
    with app.state.session_factory() as db:
        assert db.scalar(select(func.count()).select_from(AIConversation)) == 0


def test_invocation_capabilities_and_attempt_lifecycle(app_env, people):
    app, client, _, _ = app_env
    record(client, people)
    with app.state.session_factory() as db:
        db.add(
            AIProviderConfig(
                id="provider_test",
                provider_id="openai",
                display_name="Test OpenAI",
                base_url="https://test.invalid/v1",
                model_id="test-model",
                capabilities=["record_summary", "report_draft"],
                organs=["lung"],
                status="accepted",
            )
        )
        db.commit()

    capabilities = client.get(
        "/api/v1/ai/capabilities",
        headers=people["doctor_a"],
        params={"organ_id": "lung"},
    ).json()["data"]
    summary = next(item for item in capabilities if item["purpose"] == "record_summary")
    assert summary["available"] is True
    assert summary["provider_id"] == "openai"

    body = {
        "patient_id": people["patient_a_pid"],
        "organ_id": "lung",
        "purpose": "record_summary",
        "question": "总结最近记录",
        "idempotency_key": "invocation-test-1",
    }
    created = client.post(
        "/api/v1/ai/invocations",
        headers=people["doctor_a"],
        json=body,
    )
    assert created.status_code == 201, created.text
    invocation_id = created.json()["data"]["invocation_id"]

    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        result = client.get(
            f"/api/v1/ai/invocations/{invocation_id}",
            headers=people["doctor_a"],
        ).json()["data"]
        if result["status"] in {"completed", "failed"}:
            break
        time.sleep(0.02)
    assert result["status"] == "completed"
    assert result["provider_id"] == "openai"
    assert result["result"]["answer"]
    attempts = client.get(
        f"/api/v1/ai/invocations/{invocation_id}/attempts",
        headers=people["doctor_a"],
    ).json()["data"]
    assert len(attempts) == 1 and attempts[0]["status"] == "completed"

    duplicate = client.post(
        "/api/v1/ai/invocations",
        headers=people["doctor_a"],
        json=body,
    )
    assert duplicate.status_code == 201
    assert duplicate.json()["data"]["invocation_id"] == invocation_id

    report_body = {
        "patient_id": people["patient_a_pid"],
        "organ_id": "lung",
        "purpose": "report_draft",
        "base_revision": 1,
    }
    report_created = client.post(
        "/api/v1/ai/invocations",
        headers=people["doctor_a"],
        json=report_body,
    )
    assert report_created.status_code == 201, report_created.text
    report_id = report_created.json()["data"]["invocation_id"]
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        report = client.get(
            f"/api/v1/ai/invocations/{report_id}",
            headers=people["doctor_a"],
        ).json()["data"]
        if report["status"] in {"completed", "failed"}:
            break
        time.sleep(0.02)
    assert report["status"] == "completed"
    assert report["result"]["candidate_fields"]["findings"][0]["text"]

    with app.state.session_factory() as db:
        assert db.scalar(select(func.count()).select_from(AIInvocation)) == 2


def test_admin_provider_crud_and_probe(app_env, people, monkeypatch):
    _, client, _, _ = app_env
    create = {
        "provider_id": "test_admin_provider",
        "display_name": "Test Admin Provider",
        "protocol": "chat_completions",
        "base_url": "https://provider.test/v1",
        "model_id": "test-model",
        "capabilities": ["record_summary"],
        "organs": ["lung"],
        "status": "configured",
    }
    assert client.post(
        "/api/v1/admin/ai/providers",
        headers=people["doctor_a"],
        json=create,
    ).status_code == 403

    created = client.post(
        "/api/v1/admin/ai/providers",
        headers=people["admin"],
        json=create,
    )
    assert created.status_code == 201, created.text
    provider_id = created.json()["data"]["id"]

    listed = client.get(
        "/api/v1/admin/ai/providers",
        headers=people["admin"],
    ).json()["data"]
    assert any(item["provider_id"] == "test_admin_provider" for item in listed)

    class FakeResponse:
        status_code = 200
        text = "ok"

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return None

        def get(self, *args, **kwargs):
            return FakeResponse()

    monkeypatch.setattr("app.routers.ai.httpx.Client", FakeClient)
    probed = client.post(
        f"/api/v1/admin/ai/providers/{provider_id}/probe",
        headers=people["admin"],
    )
    assert probed.status_code == 200
    assert probed.json()["data"]["reachable"] is True

    disabled = client.patch(
        f"/api/v1/admin/ai/providers/{provider_id}",
        headers=people["admin"],
        json={"status": "disabled"},
    )
    assert disabled.json()["data"]["status"] == "disabled"


def test_chat_examination_scope_is_validated_and_persisted(app_env, people, nifti_file):
    app, client, _, provider = app_env
    pid = people["patient_a_pid"]
    unlinked = record(client, people, diagnosis="UNLINKED-RECORD")
    image_id = upload(client, people, nifti_file)
    linked = record(client, people, examination_id=image_id, diagnosis="LINKED-RECORD")

    body = {
        "patient_id": pid,
        "organ_id": "lung",
        "examination_id": image_id,
        "question": "只总结本次检查",
    }
    response = client.post("/api/v1/ai/chat", json=body, headers=people["doctor_a"])
    assert response.status_code == 200, response.text
    context = provider.calls[-1][0]
    assert linked in [item["record_id"] for item in context["records"]]
    assert unlinked not in [item["record_id"] for item in context["records"]]
    assert [item["image_id"] for item in context["images"]] == [image_id]

    invalid = {**body, "examination_id": "missing-image"}
    response = client.post("/api/v1/ai/chat", json=invalid, headers=people["doctor_a"])
    assert response.status_code == 404
    with app.state.session_factory() as db:
        conversations = list(db.scalars(select(AIConversation).order_by(AIConversation.created_at)))
        assert conversations[-1].examination_id == image_id
