"""Read-only tools exposed to the AI provider for agentic queries.

Each tool is a thin, permission-scoped wrapper around existing domain queries.
The model never supplies ``patient_id``; it is injected from the already
authorized conversation so a provider cannot widen data access through a tool.
"""

import logging
from datetime import date, datetime

from sqlalchemy import select

from app.models import (
    Finding,
    MedicalImage,
    MedicalRecord,
    OrganModel,
    Patient,
    ReportRevisionEvent,
    ReportTask,
    SegmentationTask,
)
from app.services.comparison import compare_studies

logger = logging.getLogger(__name__)

MAX_RECORDS = 50
MAX_IMAGES = 20
MAX_FINDINGS = 200


def _iso(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def _trim(value, limit=4000):
    if not isinstance(value, str):
        return value
    if len(value) <= limit:
        return value
    return value[:limit] + "…"


def _record_dict(record: MedicalRecord, *, full=False) -> dict:
    item = {
        "record_id": record.id,
        "date": record.record_date.isoformat(),
        "organ_ids": record.organ_ids,
        "status": record.status,
        "reviewed": record.reviewed,
        "diagnosis": record.diagnosis if full else _trim(record.diagnosis),
        "description": record.description if full else _trim(record.description),
        "recommendation": record.recommendation if full else _trim(record.recommendation),
        "revision": record.revision,
    }
    return item


def _list_records(db, patient_id, organ_id, examination_id, limit, include_drafts):
    filters = [
        MedicalRecord.patient_id == patient_id,
        MedicalRecord.deleted_at.is_(None),
    ]
    if organ_id:
        filters.append(MedicalRecord.has_organ(organ_id))
    if not include_drafts:
        filters.append(MedicalRecord.reviewed.is_(True))
    if examination_id:
        filters.append(MedicalRecord.examination_id == examination_id)
    rows = db.scalars(
        select(MedicalRecord)
        .where(*filters)
        .order_by(MedicalRecord.record_date.desc(), MedicalRecord.id.desc())
        .limit(limit)
    ).all()
    return [_record_dict(row) for row in rows]


def _get_record(db, patient_id, record_id):
    record = db.get(MedicalRecord, record_id)
    if record is None or record.patient_id != patient_id or record.deleted_at is not None:
        return {"ok": False, "error": "record not found in patient scope"}
    events = db.scalars(
        select(ReportRevisionEvent)
        .where(ReportRevisionEvent.record_id == record.id)
        .order_by(ReportRevisionEvent.id)
    ).all()
    return {
        "ok": True,
        "record": _record_dict(record, full=True),
        "addenda": [
            {
                "id": addendum.id,
                "reason": addendum.reason,
                "content": _trim(addendum.content),
                "created_at": addendum.created_at.isoformat(),
            }
            for addendum in record.addenda
        ],
        "events": [
            {
                "id": event.id,
                "revision": event.revision,
                "action": event.action,
                "from_status": event.from_status,
                "to_status": event.to_status,
                "reason": event.reason,
                "created_at": event.created_at.isoformat(),
            }
            for event in events
        ],
    }


def _list_images(db, patient_id, organ_id, examination_id, limit):
    filters = [MedicalImage.patient_id == patient_id]
    if organ_id:
        filters.append(MedicalImage.organ_id == organ_id)
    if examination_id:
        filters.append(MedicalImage.id == examination_id)
    rows = db.scalars(
        select(MedicalImage)
        .where(*filters)
        .order_by(MedicalImage.created_at.desc(), MedicalImage.id.desc())
        .limit(limit)
    ).all()
    items = []
    for image in rows:
        task = db.scalar(
            select(SegmentationTask)
            .where(SegmentationTask.image_id == image.id)
            .order_by(SegmentationTask.created_at.desc(), SegmentationTask.id.desc())
            .limit(1)
        )
        model = db.scalar(select(OrganModel.id).where(OrganModel.image_id == image.id).limit(1))
        items.append(
            {
                "image_id": image.id,
                "image_type": image.image_type,
                "organ_id": image.organ_id,
                "study_date": image.study_date.isoformat() if image.study_date else None,
                "shape": image.shape,
                "spacing": image.spacing,
                "segmentation_status": task.status if task else None,
                "has_3d_model": model is not None,
            }
        )
    return items


def _list_findings(db, patient_id, image_id, limit):
    filters = [Finding.patient_id == patient_id]
    if image_id:
        filters.append(Finding.image_id == image_id)
    rows = db.scalars(
        select(Finding)
        .where(*filters)
        .order_by(Finding.created_at.desc(), Finding.id.desc())
        .limit(limit)
    ).all()
    return [
        {
            "finding_id": finding.id,
            "image_id": finding.image_id,
            "label": finding.label,
            "finding_type": finding.finding_type,
            "description": _trim(finding.description),
            "confidence": finding.confidence,
            "diameter_mm": finding.diameter_mm,
            "measurement_mm": finding.measurement_mm,
            "measurement_status": finding.measurement_status,
            "status": finding.status,
            "side": finding.side,
            "lobe": finding.lobe,
        }
        for finding in rows
    ]


def _list_report_tasks(db, patient_id, examination_id):
    filters = [ReportTask.patient_id == patient_id]
    if examination_id:
        filters.append(ReportTask.examination_id == examination_id)
    rows = db.scalars(
        select(ReportTask).where(*filters).order_by(ReportTask.updated_at.desc())
    ).all()
    return [
        {
            "task_id": task.id,
            "examination_id": task.examination_id,
            "status": task.status,
            "primary_record_id": task.primary_record_id,
            "updated_at": task.updated_at.isoformat(),
        }
        for task in rows
    ]


def _compare(db, patient_id, primary_id, candidate_id):
    primary = db.get(MedicalImage, primary_id)
    candidate = db.get(MedicalImage, candidate_id)
    if primary is None or candidate is None:
        return {"ok": False, "error": "image not found"}
    if primary.patient_id != patient_id or candidate.patient_id != patient_id:
        return {"ok": False, "error": "image not in patient scope"}
    result = compare_studies(primary, candidate)
    result["study_date"] = result["study_date"].isoformat() if result.get("study_date") else None
    return {"ok": True, "comparison": result}


def _examination_scope(db, patient_id, conversation_exam, requested_exam):
    if conversation_exam:
        return conversation_exam
    if not requested_exam:
        return None
    image = db.get(MedicalImage, requested_exam)
    if image is None or image.patient_id != patient_id:
        raise ValueError("examination_id is not in patient scope")
    return requested_exam


def execute_tool(db, *, patient_id, role, organ_id, examination_id, tool_name, arguments):
    include_drafts = role in {"doctor", "admin"}
    if tool_name == "list_medical_records":
        exam = _examination_scope(db, patient_id, examination_id, arguments.get("examination_id"))
        limit = min(max(int(arguments.get("limit") or 20), 1), MAX_RECORDS)
        return {
            "ok": True,
            "records": _list_records(
                db,
                patient_id,
                organ_id,
                exam,
                limit,
                arguments.get("include_drafts", include_drafts),
            ),
        }
    if tool_name == "get_medical_record":
        record_id = arguments.get("record_id")
        if not isinstance(record_id, int):
            raise ValueError("record_id must be an integer")
        return _get_record(db, patient_id, record_id)
    if tool_name == "list_images":
        exam = _examination_scope(db, patient_id, examination_id, arguments.get("examination_id"))
        limit = min(max(int(arguments.get("limit") or 10), 1), MAX_IMAGES)
        return {
            "ok": True,
            "images": _list_images(db, patient_id, organ_id, exam, limit),
        }
    if tool_name == "list_findings":
        image_id = arguments.get("image_id")
        if image_id is not None:
            image = db.get(MedicalImage, image_id)
            if image is None or image.patient_id != patient_id:
                raise ValueError("image_id is not in patient scope")
        limit = min(max(int(arguments.get("limit") or 50), 1), MAX_FINDINGS)
        return {
            "ok": True,
            "findings": _list_findings(db, patient_id, image_id, limit),
        }
    if tool_name == "list_report_tasks":
        exam = _examination_scope(db, patient_id, examination_id, arguments.get("examination_id"))
        return {
            "ok": True,
            "report_tasks": _list_report_tasks(db, patient_id, exam),
        }
    if tool_name == "compare_studies":
        primary_id = arguments.get("primary_image_id")
        candidate_id = arguments.get("candidate_image_id")
        if not primary_id or not candidate_id:
            raise ValueError("primary_image_id and candidate_image_id are required")
        return _compare(db, patient_id, primary_id, candidate_id)
    raise ValueError(f"unknown tool: {tool_name}")


def make_tool_dispatcher(session_factory, patient_id, role, organ_id, examination_id):
    """Return a callable the provider can invoke without holding a transaction."""

    def dispatch(tool_name, arguments):
        with session_factory() as db:
            patient = db.get(Patient, patient_id)
            if patient is None or patient.deleted_at is not None:
                return {"ok": False, "error": "patient not available"}
            try:
                return execute_tool(
                    db,
                    patient_id=patient_id,
                    role=role,
                    organ_id=organ_id,
                    examination_id=examination_id,
                    tool_name=tool_name,
                    arguments=arguments or {},
                )
            except Exception as exc:  # noqa: BLE001 - return a structured tool error
                logger.warning("AI tool %s failed: %s", tool_name, type(exc).__name__)
                return {"ok": False, "error": f"{type(exc).__name__}: {exc}"}

    return dispatch


TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "list_medical_records",
            "description": "列出当前患者（限定到当前器官范围）的病历记录，返回记录 ID、日期、状态、诊断与描述摘要。",
            "parameters": {
                "type": "object",
                "properties": {
                    "examination_id": {"type": "string"},
                    "include_drafts": {"type": "boolean"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 50},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_medical_record",
            "description": "读取单条病历的完整内容，包含补充说明与修订事件。",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_id": {"type": "integer"},
                },
                "required": ["record_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_images",
            "description": "列出当前患者的影像检查及分割任务状态。",
            "parameters": {
                "type": "object",
                "properties": {
                    "examination_id": {"type": "string"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 20},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_findings",
            "description": "列出当前患者的影像 AI 发现（如肺结节），可按影像过滤。",
            "parameters": {
                "type": "object",
                "properties": {
                    "image_id": {"type": "string"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 200},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_report_tasks",
            "description": "列出当前患者的报告流转任务状态。",
            "parameters": {
                "type": "object",
                "properties": {
                    "examination_id": {"type": "string"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_studies",
            "description": "对比同一患者两次影像检查的几何可比性。",
            "parameters": {
                "type": "object",
                "properties": {
                    "primary_image_id": {"type": "string"},
                    "candidate_image_id": {"type": "string"},
                },
                "required": ["primary_image_id", "candidate_image_id"],
            },
        },
    },
]
