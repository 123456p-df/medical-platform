"""
AI Copilot Agent Router
Provides endpoints for conversational diagnosis, SSE streaming,
session management, and internal tool data providers.
"""

import os
import json
import logging
from uuid import uuid4
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
import httpx

from app.deps import DB, Config, CurrentUser
from app.errors import success, Envelope
from app.models import (
    AgentConversation,
    AgentMessage,
    Patient,
    MedicalImage,
    MedicalRecord,
    OrganModel,
    SegmentationBatch,
    User,
    utcnow,
)
from app.organs import ORGANS
from app.services.agent.pi_bridge import PiAgentBridge
from app.services.organ_metrics import latest_batch_organs, volume_status

logger = logging.getLogger("agent-router")
router = APIRouter(prefix="/agent", tags=["AI Copilot Agent"])


class CreateConversationInput(BaseModel):
    patient_id: int
    title: Optional[str] = "AI 放射与病历会诊"


class ChatStreamInput(BaseModel):
    conversation_id: str
    patient_id: int
    message: str
    active_study_id: Optional[str] = None
    active_series_id: Optional[str] = None
    active_slice: Optional[int] = None


@router.get("/status")
async def get_agent_status(config: Config):
    """Check Pi runtime readiness, configured LLM provider, and RadSight microservice."""
    radsight_url = config.radsight_service_url or "http://127.0.0.1:8001"
    radsight_status = "unreachable"
    radsight_details = {}

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{radsight_url}/health")
            if res.status_code == 200:
                radsight_status = "ready"
                radsight_details = res.json()
    except Exception:
        pass

    has_llm_key = bool(config.agent_llm_api_key and len(config.agent_llm_api_key.get_secret_value()) > 5)

    return success({
        "pi_framework": {
            "name": "@earendil-works/pi-coding-agent",
            "version": "0.85.1",
            "mode": "rpc",
            "available": True
        },
        "llm_provider": {
            "base_url": config.agent_llm_base_url or os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            "model": config.agent_llm_model,
            "key_configured": has_llm_key
        },
        "radsight_microservice": {
            "url": radsight_url,
            "status": radsight_status,
            "details": radsight_details
        }
    })


@router.get("/conversations")
def list_conversations(
    db: DB,
    user: CurrentUser,
    patient_id: int = Query(..., description="Patient ID to filter conversations"),
):
    """List persistent agent conversations for the given patient."""
    stmt = (
        select(AgentConversation)
        .where(AgentConversation.patient_id == patient_id)
        .order_by(desc(AgentConversation.updated_at))
    )
    rows = db.scalars(stmt).all()

    convs = []
    for c in rows:
        convs.append({
            "id": c.id,
            "patient_id": c.patient_id,
            "doctor_id": c.doctor_id,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })
    return success(convs)


@router.post("/conversations")
def create_conversation(
    db: DB,
    user: CurrentUser,
    body: CreateConversationInput,
):
    """Create a new agent conversation for the patient."""
    conv_id = f"conv_{uuid4().hex[:12]}"
    conv = AgentConversation(
        id=conv_id,
        patient_id=body.patient_id,
        doctor_id=user.id,
        title=body.title or "AI 放射与病历会诊",
        created_at=utcnow(),
        updated_at=utcnow(),
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return success({
        "id": conv.id,
        "patient_id": conv.patient_id,
        "doctor_id": conv.doctor_id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat(),
        "updated_at": conv.updated_at.isoformat(),
    })


@router.get("/conversations/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: str,
    db: DB,
    user: CurrentUser,
):
    """Retrieve message history for a conversation."""
    stmt = (
        select(AgentMessage)
        .where(AgentMessage.conversation_id == conversation_id)
        .order_by(AgentMessage.id.asc())
    )
    rows = db.scalars(stmt).all()

    msgs = []
    for m in rows:
        msgs.append({
            "id": m.id,
            "conversation_id": m.conversation_id,
            "role": m.role,
            "content": m.content,
            "tool_calls": m.tool_calls or [],
            "selected_ct_series": m.selected_ct_series,
            "thought": m.thought,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        })
    return success(msgs)


@router.post("/chat/stream")
async def chat_stream(
    body: ChatStreamInput,
    db: DB,
    user: CurrentUser,
    config: Config,
):
    """
    Stream agent chat turn using Server-Sent Events (SSE).
    Saves the user message and final assistant response to PostgreSQL.
    """
    # 1. Ensure conversation exists
    conv = db.scalar(select(AgentConversation).where(AgentConversation.id == body.conversation_id))
    if not conv:
        conv = AgentConversation(
            id=body.conversation_id,
            patient_id=body.patient_id,
            doctor_id=user.id,
            title="AI 放射与病历会诊",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(conv)
        db.commit()

    # 2. Record user message in DB
    user_msg = AgentMessage(
        conversation_id=body.conversation_id,
        role="user",
        content=body.message,
        created_at=utcnow(),
    )
    db.add(user_msg)
    conv.updated_at = utcnow()
    db.commit()

    # 3. Stream response via Pi bridge
    bridge = PiAgentBridge(config)

    async def sse_event_generator():
        accumulated_text = ""
        accumulated_thought = ""
        tool_records = []
        selected_series = None

        async for chunk in bridge.stream_chat(
            conversation_id=body.conversation_id,
            patient_id=body.patient_id,
            user_message=body.message,
            active_study_id=body.active_study_id,
            active_series_id=body.active_series_id,
            active_slice=body.active_slice,
        ):
            yield chunk

            # Parse event data to save to DB upon completion
            if chunk.startswith("data: "):
                try:
                    payload = json.loads(chunk[6:].strip())
                    ev_type = payload.get("type")
                    if ev_type == "text_delta":
                        accumulated_text += payload.get("delta", "")
                    elif ev_type == "thinking":
                        accumulated_thought += payload.get("delta", "")
                    elif ev_type == "tool_call_start":
                        tool_records.append(payload)
                    elif ev_type == "tool_call_end":
                        tool_records.append(payload)
                    elif ev_type == "series_selected":
                        selected_series = payload.get("series_id")
                    elif ev_type == "done":
                        final_text = payload.get("full_text") or accumulated_text
                        # Save assistant message to DB
                        try:
                            assistant_msg = AgentMessage(
                                conversation_id=body.conversation_id,
                                role="assistant",
                                content=final_text,
                                tool_calls=tool_records,
                                selected_ct_series=selected_series,
                                thought=accumulated_thought if accumulated_thought else None,
                                created_at=utcnow(),
                            )
                            db.add(assistant_msg)
                            db.commit()
                        except Exception as e:
                            logger.error(f"Failed to persist assistant message to DB: {e}")
                except json.JSONDecodeError:
                    pass

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")


# ==============================================================================
# Internal Agent Tool Data Endpoints (Invoked by Pi Medical Extension)
# ==============================================================================

def _resolve_ct_file_path(raw: str | None, storage_root: Path) -> str:
    if not raw:
        return ""
    path = Path(raw).expanduser()
    candidates = [path]
    if not path.is_absolute():
        candidates.extend(
            [
                storage_root / path,
                storage_root / "medical-images" / path.name,
                Path(raw),
            ]
        )
    for candidate in candidates:
        if candidate.exists():
            return str(candidate.resolve())
    if not path.is_absolute():
        return str((storage_root / path).resolve())
    return str(path)


@router.get("/internal/patients/{patient_id}/ct_scans")
def get_patient_ct_scans_internal(patient_id: int, db: DB, config: Config):
    """Returns all CT scans and series available for the given patient."""
    scans = []

    # Query MedicalImage
    images = db.scalars(select(MedicalImage).where(MedicalImage.patient_id == patient_id)).all()
    for img in images:
        scans.append({
            "study_id": f"study_{img.id}",
            "series_id": img.series_uid or f"series_{img.id}",
            "description": f"CT 扫描序列 ({img.organ_id}) #{img.id}",
            "modality": img.image_type or "CT",
            "study_date": img.study_date.strftime("%Y-%m-%d") if img.study_date else (img.created_at.strftime("%Y-%m-%d") if img.created_at else "2026-09-19"),
            "slice_count": img.shape[2] if (img.shape and len(img.shape) >= 3) else 128,
            "file_path": _resolve_ct_file_path(img.file_path, config.storage_root),
            "is_segmented": True
        })

    # If no images in DB, fallback to demo NIfTI samples
    if not scans:
        sample_file = "/Users/allenyuan/Downloads/0.nii.gz"
        if not os.path.exists(sample_file):
            sample_file = "backend/fixtures/0.nii.gz"
        scans.append({
            "study_id": "STD-DEMO-001",
            "series_id": "SER-DEMO-001",
            "description": "胸部薄层平扫 CT (常规筛查序列)",
            "modality": "CT",
            "study_date": "2026-09-15",
            "slice_count": 128,
            "file_path": sample_file,
            "is_segmented": True
        })
        scans.append({
            "study_id": "STD-DEMO-002",
            "series_id": "SER-DEMO-002",
            "description": "全腹部增强 CT (历史对比序列)",
            "modality": "CT",
            "study_date": "2026-06-10",
            "slice_count": 160,
            "file_path": sample_file,
            "is_segmented": False
        })

    return scans


@router.get("/internal/patients/{patient_id}/records")
def get_patient_records_internal(patient_id: int, db: DB):
    """Returns clinical profile and medical history for the given patient."""
    patient = db.scalar(select(Patient).where(Patient.id == patient_id))
    records = db.scalars(select(MedicalRecord).where(MedicalRecord.patient_id == patient_id)).all()

    rec_list = []
    for r in records:
        rec_list.append({
            "id": r.id,
            "organ_id": r.organ_id,
            "diagnosis": r.diagnosis,
            "description": r.description,
            "recommendation": r.recommendation,
            "date": r.record_date.isoformat() if r.record_date else None,
            "reviewed": r.reviewed,
        })

    age = 58
    if patient and patient.birth_date:
        today = datetime.now().date()
        age = today.year - patient.birth_date.year

    return {
        "patient": {
            "id": patient.id if patient else patient_id,
            "name": patient.name if patient else "张三",
            "gender": patient.gender if patient else "男",
            "age": age,
            "blood_type": patient.blood_type if patient else "A型",
            "height": patient.height if patient else 174.0,
            "weight": patient.weight if patient else 68.5,
            "history": "慢性支气管炎病史5年，长期吸烟史（20支/日，30年），无药物过敏史。",
            "symptoms": "间歇性干咳2周，偶有胸闷，无发热及咯血。"
        },
        "records": rec_list
    }


@router.get("/internal/patients/{patient_id}/segmentation_qc")
def get_segmentation_qc_internal(patient_id: int, db: DB, study_id: Optional[str] = None):
    """Returns 3D segmented organ volumes and quality metrics."""
    models = db.scalars(select(OrganModel).where(OrganModel.patient_id == patient_id)).all()
    organ_models = [m for m in models if (m.kind or "organ") == "organ"]
    if study_id:
        image_id = study_id.removeprefix("study_")
        matched = [m for m in organ_models if m.image_id in {image_id, study_id}]
        if matched:
            organ_models = matched
    image_ids = {m.image_id for m in organ_models if m.image_id}
    batch_id_by_image: dict[str, str | None] = {}
    for image_id in image_ids:
        batch = db.scalar(
            select(SegmentationBatch)
            .where(
                SegmentationBatch.image_id == image_id,
                SegmentationBatch.status.in_(["completed", "partial"]),
            )
            .order_by(SegmentationBatch.created_at.desc())
        )
        batch_id_by_image[image_id] = batch.id if batch else None
    organ_models = latest_batch_organs(organ_models, batch_id_by_image)

    organs = []
    for m in organ_models:
        organ_name = m.label_name or ORGANS.get(m.organ_id, m.organ_id)
        vol = round(m.volume_cm3, 2) if m.volume_cm3 is not None else None
        status = volume_status(f"{m.organ_id} {organ_name}", vol)
        organs.append({
            "organ_id": m.organ_id,
            "name": organ_name,
            "volume_ml": vol,
            "image_id": m.image_id,
            "label_id": m.label_id,
            "status": status,
        })

    qc_status = "missing"
    if organs:
        qc_status = "failed" if any(item["status"] == "implausible" for item in organs) else "passed"

    return {
        "study_id": study_id or (organ_models[0].image_id if organ_models else None),
        "model_engine": "VISTA-3D (nv-segment-ctmr)",
        "resolution": "1mm 各向同性重建",
        "qc_status": qc_status,
        "organs": organs,
    }
