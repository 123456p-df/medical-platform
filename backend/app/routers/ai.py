import os
from uuid import uuid4

import httpx
from fastapi import APIRouter, BackgroundTasks, Request
from sqlalchemy import select

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access, require_admin
from app.errors import APIError, Envelope, success
from app.models import (
    AIConversation,
    AIInvocation,
    AIInvocationAttempt,
    AIMessage,
    AIProviderConfig,
    MedicalImage,
    utcnow,
)
from app.organs import require_organ
from app.schemas import (
    AICapabilityOut,
    AIInvocationAttemptOut,
    AIInvocationCreate,
    AIInvocationOut,
    AIProviderConfigCreate,
    AIProviderConfigOut,
    AIProviderConfigUpdate,
    AIProviderProbeOut,
    ChatInput,
    ChatOut,
)
from app.services.ai import build_context, run_ai_invocation
from app.services.ai_tools import make_tool_dispatcher

router = APIRouter(prefix="/ai", tags=["AI Chat"])
admin_router = APIRouter(prefix="/admin/ai", tags=["AI Administration"])


def provider_config(db, purpose, organ_id, examination_id=None):
    configs = list(
        db.scalars(
            select(AIProviderConfig)
            .where(AIProviderConfig.status.in_(["connected", "accepted"]))
            .order_by(AIProviderConfig.display_name)
        )
    )
    for config in configs:
        capabilities = config.capabilities or []
        if purpose not in capabilities:
            continue
        if config.organs and organ_id not in config.organs:
            continue
        if examination_id is not None:
            image = db.get(MedicalImage, examination_id)
            if config.modalities and image is not None and image.image_type not in config.modalities:
                continue
        return config
    return None


def capability_out(db, purpose, organ_id, examination_id=None):
    config = provider_config(db, purpose, organ_id, examination_id)
    if config is None:
        return {
            "purpose": purpose,
            "available": False,
            "provider_id": None,
            "model_id": None,
            "reason": "No connected provider is configured for this purpose",
        }
    return {
        "purpose": purpose,
        "available": True,
        "provider_id": config.provider_id,
        "model_id": config.model_id,
        "reason": None,
    }


def invocation_out(invocation: AIInvocation) -> dict:
    return {
        "invocation_id": invocation.id,
        "patient_id": invocation.patient_id,
        "examination_id": invocation.examination_id,
        "organ_id": invocation.organ_id,
        "purpose": invocation.purpose,
        "status": invocation.status,
        "provider_id": invocation.provider_id,
        "model_id": invocation.model_id,
        "base_revision": invocation.base_revision,
        "result": invocation.result,
        "error_code": invocation.error_code,
        "error_message": invocation.error_message,
        "created_at": invocation.created_at,
        "updated_at": invocation.updated_at,
    }


def attempt_out(attempt: AIInvocationAttempt) -> dict:
    return {
        "attempt_id": attempt.id,
        "invocation_id": attempt.invocation_id,
        "attempt_number": attempt.attempt_number,
        "status": attempt.status,
        "provider_id": attempt.provider_id,
        "model_id": attempt.model_id,
        "started_at": attempt.started_at,
        "finished_at": attempt.finished_at,
        "error_code": attempt.error_code,
        "error_message": attempt.error_message,
        "usage": attempt.usage or {},
        "created_at": attempt.created_at,
    }


def provider_out(config: AIProviderConfig) -> dict:
    return {
        "id": config.id,
        "provider_id": config.provider_id,
        "display_name": config.display_name,
        "protocol": config.protocol,
        "base_url": config.base_url,
        "api_key_env": config.api_key_env,
        "model_id": config.model_id,
        "capabilities": config.capabilities or [],
        "modalities": config.modalities or [],
        "organs": config.organs or [],
        "status": config.status,
        "data_scope": config.data_scope or {},
        "timeout_seconds": config.timeout_seconds,
        "max_input_chars": config.max_input_chars,
        "max_output_chars": config.max_output_chars,
        "created_at": config.created_at,
        "updated_at": config.updated_at,
    }


@router.get("/status", response_model=Envelope[dict])
def status(user: CurrentUser, settings: Config):
    return success(
        {
            "configured": bool(settings.ai_base_url and settings.ai_model),
            "capabilities": ["record_summary", "record_questions"],
            "image_analysis": False,
        }
    )


@router.get("/capabilities", response_model=Envelope[list[AICapabilityOut]])
def capabilities(
    db: DB,
    user: CurrentUser,
    organ_id: str = "lung",
    examination_id: str | None = None,
):
    if examination_id is not None:
        image = db.get(MedicalImage, examination_id)
        if image is None:
            raise APIError(404, 40404, "Medical image not found")
        check_patient_access(db, user, image.patient_id)
    require_organ(organ_id)
    return success(
        [
            capability_out(db, purpose, organ_id, examination_id)
            for purpose in ("record_summary", "report_draft", "report_qa")
        ]
    )


@admin_router.get("/providers", response_model=Envelope[list[AIProviderConfigOut]])
def list_providers(db: DB, user: CurrentUser):
    require_admin(user)
    configs = list(
        db.scalars(select(AIProviderConfig).order_by(AIProviderConfig.display_name))
    )
    return success([provider_out(config) for config in configs])


@admin_router.post(
    "/providers",
    status_code=201,
    response_model=Envelope[AIProviderConfigOut],
)
def create_provider(body: AIProviderConfigCreate, db: DB, user: CurrentUser):
    require_admin(user)
    if db.scalar(select(AIProviderConfig).where(AIProviderConfig.provider_id == body.provider_id)):
        raise APIError(409, 40925, "AI provider_id already exists")
    config = AIProviderConfig(
        id=f"provider_{uuid4().hex}",
        **body.model_dump(),
    )
    db.add(config)
    db.commit()
    return success(provider_out(config))


@admin_router.patch(
    "/providers/{config_id}",
    response_model=Envelope[AIProviderConfigOut],
)
def update_provider(config_id: str, body: AIProviderConfigUpdate, db: DB, user: CurrentUser):
    require_admin(user)
    config = db.get(AIProviderConfig, config_id)
    if config is None:
        raise APIError(404, 40411, "AI provider not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(config, key, value)
    config.updated_at = utcnow()
    db.commit()
    return success(provider_out(config))


@admin_router.post(
    "/providers/{config_id}/probe",
    response_model=Envelope[AIProviderProbeOut],
)
def probe_provider(config_id: str, db: DB, user: CurrentUser):
    require_admin(user)
    config = db.get(AIProviderConfig, config_id)
    if config is None:
        raise APIError(404, 40411, "AI provider not found")
    api_key = os.environ.get(config.api_key_env or "")
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    try:
        with httpx.Client(
            timeout=min(config.timeout_seconds, 30),
            follow_redirects=False,
            trust_env=False,
        ) as client:
            response = client.get(config.base_url.rstrip("/") + "/models", headers=headers)
        reachable = response.status_code < 500
        message = response.text[:200] if not reachable else "Provider endpoint responded"
    except httpx.HTTPError as exc:
        reachable = False
        message = type(exc).__name__
    if reachable:
        config.status = "connected"
        config.updated_at = utcnow()
        db.commit()
    return success(
        {
            "provider_id": config.provider_id,
            "checked": True,
            "reachable": reachable,
            "message": message,
        }
    )


@router.post("/invocations", status_code=201, response_model=Envelope[AIInvocationOut])
def create_invocation(
    body: AIInvocationCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: DB,
    user: CurrentUser,
):
    patient = check_patient_access(db, user, body.patient_id)
    require_organ(body.organ_id)
    if body.examination_id is not None:
        image = db.get(MedicalImage, body.examination_id)
        if image is None or image.patient_id != patient.id:
            raise APIError(404, 40404, "Medical image not found")
    config = provider_config(db, body.purpose, body.organ_id, body.examination_id)
    if config is None:
        raise APIError(503, 50302, "AI service is not configured for this purpose")
    if body.idempotency_key:
        existing = db.scalar(
            select(AIInvocation).where(
                AIInvocation.idempotency_key == body.idempotency_key,
                AIInvocation.patient_id == patient.id,
            )
        )
        if existing is not None:
            return success(invocation_out(existing))
    invocation = AIInvocation(
        id=f"inv_{uuid4().hex}",
        patient_id=patient.id,
        examination_id=body.examination_id,
        organ_id=body.organ_id,
        purpose=body.purpose,
        status="queued",
        provider_id=config.provider_id,
        model_id=config.model_id,
        base_revision=body.base_revision,
        input_snapshot={
            "question": body.question,
            "role": user.role,
            "examination_id": body.examination_id,
            "base_revision": body.base_revision,
        },
        idempotency_key=body.idempotency_key,
    )
    db.add(invocation)
    db.flush()
    audit(
        db,
        user.id,
        patient.id,
        "ai.invocation.create",
        "ai_invocation",
        invocation.id,
        after={"purpose": body.purpose, "provider_id": config.provider_id},
    )
    db.commit()
    background_tasks.add_task(
        run_ai_invocation,
        invocation.id,
        request.app.state.session_factory,
        request.app.state.settings,
        request.app.state.ai_provider,
    )
    return success(invocation_out(invocation))


@router.get("/invocations/{invocation_id}", response_model=Envelope[AIInvocationOut])
def get_invocation(invocation_id: str, db: DB, user: CurrentUser):
    invocation = db.get(AIInvocation, invocation_id)
    if invocation is None:
        raise APIError(404, 40408, "AI invocation not found")
    check_patient_access(db, user, invocation.patient_id)
    return success(invocation_out(invocation))


@router.get(
    "/invocations/{invocation_id}/attempts",
    response_model=Envelope[list[AIInvocationAttemptOut]],
)
def list_attempts(invocation_id: str, db: DB, user: CurrentUser):
    invocation = db.get(AIInvocation, invocation_id)
    if invocation is None:
        raise APIError(404, 40408, "AI invocation not found")
    check_patient_access(db, user, invocation.patient_id)
    attempts = list(
        db.scalars(
            select(AIInvocationAttempt)
            .where(AIInvocationAttempt.invocation_id == invocation_id)
            .order_by(AIInvocationAttempt.attempt_number)
        )
    )
    return success([attempt_out(attempt) for attempt in attempts])


@router.post("/invocations/{invocation_id}/cancel", response_model=Envelope[AIInvocationOut])
def cancel_invocation(invocation_id: str, db: DB, user: CurrentUser):
    invocation = db.get(AIInvocation, invocation_id)
    if invocation is None:
        raise APIError(404, 40408, "AI invocation not found")
    check_patient_access(db, user, invocation.patient_id, write=True)
    if invocation.status not in {"queued", "running"}:
        raise APIError(409, 40924, "Only queued or running invocations can be cancelled")
    invocation.status = "cancelled"
    invocation.updated_at = utcnow()
    audit(
        db,
        user.id,
        invocation.patient_id,
        "ai.invocation.cancel",
        "ai_invocation",
        invocation.id,
    )
    db.commit()
    return success(invocation_out(invocation))


@router.post("/chat", response_model=Envelope[ChatOut])
def chat(body: ChatInput, request: Request, db: DB, user: CurrentUser, settings: Config):
    patient = check_patient_access(db, user, body.patient_id)
    require_organ(body.organ_id)
    if body.examination_id is not None:
        image = db.scalar(select(MedicalImage).where(MedicalImage.id == body.examination_id))
        if image is None or image.patient_id != patient.id:
            raise APIError(404, 40404, "Medical image not found")
    context, truncated = build_context(
        db,
        patient,
        body.organ_id,
        settings,
        include_drafts=user.role in {"doctor", "admin"},
        examination_id=body.examination_id,
    )
    user_id, role = user.id, user.role
    # Release the database transaction before waiting on the external AI service.
    db.commit()
    dispatcher = make_tool_dispatcher(
        request.app.state.session_factory,
        patient.id,
        role,
        body.organ_id,
        body.examination_id,
    )
    answer = request.app.state.ai_provider.answer_with_tools(
        context, body.question, role, tool_dispatcher=dispatcher
    )
    db.expire_all()
    check_patient_access(db, user, body.patient_id)
    known = {r["record_id"]: r["date"] for r in context["records"]}
    references = [
        {"record_id": rid, "date": known[rid]} for rid in dict.fromkeys(answer.used_record_ids)
        if rid in known
    ]
    conversation_id = f"chat_{uuid4().hex}"
    db.add(
        AIConversation(
            id=conversation_id,
            patient_id=body.patient_id,
            examination_id=body.examination_id,
            organ_id=body.organ_id,
            user_id=user_id,
        )
    )
    db.flush()
    db.add_all(
        [
            AIMessage(conversation_id=conversation_id, role="user", content=body.question),
            AIMessage(
                conversation_id=conversation_id,
                role="assistant",
                content=answer.answer,
                references=references,
            ),
        ]
    )
    audit(db, user_id, body.patient_id, "ai.chat", "ai_conversation", conversation_id)
    db.commit()
    return success(
        {
            "conversation_id": conversation_id,
            "answer": answer.answer,
            "references": references,
            "context_truncated": truncated,
            "purpose": "medical_decision_support",
        }
    )
