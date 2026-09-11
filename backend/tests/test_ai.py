import json

import httpx
import pytest
from sqlalchemy import func, select

from app.cli import set_access
from app.errors import APIError
from app.models import AIConversation, AIMessage
from app.services.ai import AIProvider
from tests.conftest import record, upload


def test_chat_context_is_authorized_referenced_and_persisted(app_env, people, nifti_file):
    app, client, _, provider = app_env
    pid = people["patient_a_pid"]
    rid = record(client, people)
    deleted = record(client, people, diagnosis="DELETED-SECRET")
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
        {"answer": "uncited answer", "used_record_ids": []},
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
