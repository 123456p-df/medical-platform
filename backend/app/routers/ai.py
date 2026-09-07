from uuid import uuid4

from fastapi import APIRouter, Request

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access
from app.errors import Envelope, success
from app.models import AIConversation, AIMessage
from app.organs import require_organ
from app.schemas import ChatInput, ChatOut
from app.services.ai import build_context

router = APIRouter(prefix="/ai", tags=["AI Chat"])


@router.post("/chat", response_model=Envelope[ChatOut])
def chat(body: ChatInput, request: Request, db: DB, user: CurrentUser, settings: Config):
    patient = check_patient_access(db, user, body.patient_id)
    require_organ(body.organ_id)
    context, truncated = build_context(db, patient, body.organ_id, settings)
    user_id, role = user.id, user.role
    # Release the database transaction before waiting on the external AI service.
    db.commit()
    answer = request.app.state.ai_provider.answer(context, body.question, role)
    db.expire_all()
    check_patient_access(db, user, body.patient_id)
    known = {r["record_id"]: r["date"] for r in context["records"]}
    references = [
        {"record_id": rid, "date": known[rid]} for rid in dict.fromkeys(answer.used_record_ids)
    ]
    conversation_id = f"chat_{uuid4().hex}"
    db.add(
        AIConversation(
            id=conversation_id, patient_id=body.patient_id, organ_id=body.organ_id, user_id=user_id
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
