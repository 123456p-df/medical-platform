from datetime import date

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.audit import audit
from app.deps import DB, CurrentUser, check_patient_access, require_doctor
from app.errors import APIError, Envelope, success
from app.models import (
    Doctor,
    MedicalImage,
    MedicalRecord,
    RecordAddendum,
    ReportRevisionEvent,
    ReportTask,
    User,
    utcnow,
)
from app.organs import require_organ
from app.schemas import (
    AddendumCreate,
    AddendumOut,
    ApplyAICandidateInput,
    RecordCreate,
    RecordOut,
    RecordPage,
    RecordPatch,
    RecordTransitionInput,
    ReportEventOut,
    ReportTaskPage,
)

router = APIRouter(tags=["Medical Record"])


def record_out(db, record):
    name = db.scalar(
        select(User.username)
        .join(Doctor, Doctor.user_id == User.id)
        .where(Doctor.id == record.doctor_id)
    )
    signed_by_name = db.scalar(
        select(User.username).where(User.id == record.signed_by_user_id)
    ) if record.signed_by_user_id else None
    return {
        "record_id": record.id,
        "patient_id": record.patient_id,
        "organ_id": record.organ_id,
        "organ_ids": record.organ_ids,
        "examination_id": record.examination_id,
        "diagnosis": record.diagnosis,
        "description": record.description,
        "recommendation": record.recommendation,
        "reviewed": record.reviewed,
        "signed_at": record.signed_at,
        "status": record.status,
        "revision": record.revision,
        "signed_by_user_id": record.signed_by_user_id,
        "signed_by_username": signed_by_name or None,
        "record_date": record.record_date,
        "doctor_name": name,
        "created_at": record.created_at,
        "updated_at": record.updated_at,
        "addenda": [addendum_out(db, item) for item in record.addenda],
    }


def event_out(event: ReportRevisionEvent) -> dict:
    return {
        "event_id": event.id,
        "record_id": event.record_id,
        "revision": event.revision,
        "action": event.action,
        "from_status": event.from_status,
        "to_status": event.to_status,
        "actor_user_id": event.actor_user_id,
        "reason": event.reason,
        "metadata": event.event_metadata or {},
        "created_at": event.created_at,
    }


def task_out(task: ReportTask) -> dict:
    return {
        "task_id": task.id,
        "patient_id": task.patient_id,
        "examination_id": task.examination_id,
        "status": task.status,
        "primary_record_id": task.primary_record_id,
        "assigned_doctor_id": task.assigned_doctor_id,
        "updated_at": task.updated_at,
        "created_at": task.created_at,
    }


def report_task(db, record: MedicalRecord) -> ReportTask | None:
    if record.examination_id is None:
        return None
    task = db.scalar(
        select(ReportTask).where(
            ReportTask.patient_id == record.patient_id,
            ReportTask.examination_id == record.examination_id,
        )
    )
    if task is None:
        task = ReportTask(
            patient_id=record.patient_id,
            examination_id=record.examination_id,
            status="pending_draft",
            primary_record_id=record.id,
        )
        db.add(task)
        db.flush()
    task.assigned_doctor_id = task.assigned_doctor_id or record.doctor_id
    if task.primary_record_id is None or task.status != "signed":
        task.primary_record_id = record.id
    return task


def sync_task_status(db, record: MedicalRecord):
    task = report_task(db, record)
    if task is None:
        return
    status_map = {
        "draft": "drafting",
        "pending_review": "in_review",
        "signed": "signed",
        "cancelled": "cancelled",
    }
    task.status = status_map.get(record.status, "pending_draft")
    task.updated_at = utcnow()


def add_record_event(
    db,
    record: MedicalRecord,
    action: str,
    actor_user_id: int,
    *,
    from_status: str | None = None,
    to_status: str | None = None,
    reason: str | None = None,
    metadata: dict | None = None,
):
    db.add(
        ReportRevisionEvent(
            record_id=record.id,
            revision=record.revision,
            action=action,
            from_status=from_status,
            to_status=to_status,
            actor_user_id=actor_user_id,
            reason=reason,
            metadata=metadata or {},
        )
    )


def addendum_out(db, addendum):
    author_name = db.scalar(select(User.username).where(User.id == addendum.author_user_id))
    return {
        "addendum_id": addendum.id,
        "record_id": addendum.record_id,
        "author_user_id": addendum.author_user_id,
        "author_name": author_name or "Unknown",
        "reason": addendum.reason,
        "content": addendum.content,
        "created_at": addendum.created_at,
    }


def snapshot(record):
    return {
        "organ_id": record.organ_id,
        "organ_ids": record.organ_ids,
        "examination_id": record.examination_id,
        "diagnosis": record.diagnosis,
        "description": record.description,
        "recommendation": record.recommendation,
        "reviewed": record.reviewed,
        "signed_at": record.signed_at.isoformat() if record.signed_at else None,
        "status": record.status,
        "revision": record.revision,
        "signed_by_user_id": record.signed_by_user_id,
        "record_date": record.record_date.isoformat(),
        "deleted_at": record.deleted_at.isoformat() if record.deleted_at else None,
    }


def accessible_record(db, user, record_id, *, write=False):
    record = db.get(MedicalRecord, record_id)
    if record is None:
        raise APIError(404, 40403, "Medical record not found")
    check_patient_access(db, user, record.patient_id, write=write)
    if record.deleted_at is not None:
        raise APIError(404, 40403, "Medical record not found")
    if user.role == "patient" and not record.reviewed:
        raise APIError(404, 40403, "Medical record not found")
    return record


def ensure_draft(record):
    if record.status != "draft":
        action = "append an addendum" if record.status == "signed" else "use a report transition"
        raise APIError(
            409,
            40906,
            f"Only draft reports can be edited directly; {action} instead",
        )


def validate_examination(db, patient_id, examination_id):
    if examination_id is None:
        return
    image = db.get(MedicalImage, examination_id)
    if image is None or image.patient_id != patient_id:
        raise APIError(422, 42202, "Examination does not belong to this patient")


@router.get("/patients/{patient_id}/organs/{organ_id}/records", response_model=Envelope[RecordPage])
def list_records(
    patient_id: int,
    organ_id: str,
    db: DB,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    start_date: date | None = None,
    end_date: date | None = None,
):
    check_patient_access(db, user, patient_id)
    require_organ(organ_id)
    if start_date and end_date and start_date > end_date:
        raise APIError(400, 40001, "start_date must not be after end_date")
    filters = [
        MedicalRecord.patient_id == patient_id,
        MedicalRecord.has_organ(organ_id),
        MedicalRecord.deleted_at.is_(None),
    ]
    if user.role == "patient":
        filters.append(MedicalRecord.reviewed.is_(True))
    if start_date:
        filters.append(MedicalRecord.record_date >= start_date)
    if end_date:
        filters.append(MedicalRecord.record_date <= end_date)
    total = db.scalar(select(func.count()).select_from(MedicalRecord).where(*filters))
    records = db.scalars(
        select(MedicalRecord)
        .where(*filters)
        .order_by(MedicalRecord.record_date.desc(), MedicalRecord.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return success(
        {
            "items": [record_out(db, r) for r in records],
            "page": page,
            "page_size": page_size,
            "total": total,
        }
    )


@router.get("/medical-records/{record_id}", response_model=Envelope[RecordOut])
def get_record(record_id: int, db: DB, user: CurrentUser):
    return success(record_out(db, accessible_record(db, user, record_id)))


@router.post(
    "/medical-records/{record_id}/addenda",
    status_code=201,
    response_model=Envelope[AddendumOut],
)
def add_addendum(record_id: int, body: AddendumCreate, db: DB, user: CurrentUser):
    record = accessible_record(db, user, record_id, write=True)
    if record.signed_at is None:
        raise APIError(409, 40907, "Addenda require a signed report")
    addendum = RecordAddendum(
        record_id=record.id,
        author_user_id=user.id,
        reason=body.reason,
        content=body.content,
    )
    db.add(addendum)
    db.flush()
    audit(
        db,
        user.id,
        record.patient_id,
        "record.addendum",
        "medical_record",
        record.id,
        after={"reason": body.reason, "content": body.content},
    )
    db.commit()
    return success(addendum_out(db, addendum))


@router.get(
    "/medical-records/{record_id}/addenda",
    response_model=Envelope[list[AddendumOut]],
)
def list_addenda(record_id: int, db: DB, user: CurrentUser):
    record = accessible_record(db, user, record_id)
    if record.signed_at is None:
        return success([])
    items = db.scalars(
        select(RecordAddendum)
        .where(RecordAddendum.record_id == record.id)
        .order_by(RecordAddendum.created_at, RecordAddendum.id)
    )
    return success([addendum_out(db, item) for item in items])


@router.get(
    "/medical-records/{record_id}/events",
    response_model=Envelope[list[ReportEventOut]],
)
def list_record_events(record_id: int, db: DB, user: CurrentUser):
    record = accessible_record(db, user, record_id)
    events = db.scalars(
        select(ReportRevisionEvent)
        .where(ReportRevisionEvent.record_id == record.id)
        .order_by(ReportRevisionEvent.revision, ReportRevisionEvent.id)
    )
    return success([event_out(event) for event in events])


@router.get(
    "/patients/{patient_id}/report-tasks",
    response_model=Envelope[ReportTaskPage],
)
def list_report_tasks(
    patient_id: int,
    db: DB,
    user: CurrentUser,
    status: str | None = Query(default=None),
):
    check_patient_access(db, user, patient_id)
    if status and status not in {"pending_draft", "drafting", "in_review", "signed", "cancelled"}:
        raise APIError(422, 42201, "Unknown report task status")
    filters = [ReportTask.patient_id == patient_id]
    if status:
        filters.append(ReportTask.status == status)
    tasks = list(
        db.scalars(
            select(ReportTask)
            .where(*filters)
            .order_by(ReportTask.updated_at.desc(), ReportTask.id.desc())
        )
    )
    return success({"items": [task_out(task) for task in tasks], "total": len(tasks)})


@router.post(
    "/medical-records/{record_id}/transition",
    response_model=Envelope[RecordOut],
)
def transition_record(
    record_id: int,
    body: RecordTransitionInput,
    db: DB,
    user: CurrentUser,
):
    record = accessible_record(db, user, record_id, write=True)
    if body.expected_revision != record.revision:
        raise APIError(409, 40908, "Report revision is stale; reload before continuing")

    from_status = record.status
    action = body.action
    if action == "submit":
        if record.status != "draft":
            raise APIError(409, 40921, "Only draft reports can be submitted for review")
        if not record.diagnosis.strip() or not record.description.strip():
            raise APIError(422, 42203, "Diagnosis and description are required before review")
        record.status = "pending_review"
        record.reviewed = False
    elif action == "sign":
        if record.status not in {"draft", "pending_review"}:
            raise APIError(409, 40906, "Signed reports are immutable; append an addendum instead")
        if not record.diagnosis.strip() or not record.description.strip():
            raise APIError(422, 42203, "Signed reports require a diagnosis and description")
        record.status = "signed"
        record.reviewed = True
        record.signed_at = utcnow()
        record.signed_by_user_id = user.id
    elif action == "reopen":
        if record.status != "pending_review":
            raise APIError(409, 40922, "Only reports awaiting review can be returned to draft")
        record.status = "draft"
        record.reviewed = False
        record.signed_at = None
        record.signed_by_user_id = None
    elif action == "cancel":
        if record.status not in {"draft", "pending_review"}:
            raise APIError(409, 40923, "Only draft or review reports can be cancelled")
        if not body.reason:
            raise APIError(422, 42201, "Cancellation requires a reason")
        record.status = "cancelled"
        record.reviewed = False
        record.signed_at = None
        record.signed_by_user_id = None

    record.revision += 1
    record.updated_at = utcnow()
    add_record_event(
        db,
        record,
        {
            "submit": "submitted",
            "sign": "signed",
            "reopen": "reopened",
            "cancel": "cancelled",
        }[action],
        user.id,
        from_status=from_status,
        to_status=record.status,
        reason=body.reason,
    )
    sync_task_status(db, record)
    audit(
        db,
        user.id,
        record.patient_id,
        f"record.{action}",
        "medical_record",
        record.id,
        before={"status": from_status, "revision": body.expected_revision},
        after={"status": record.status, "revision": record.revision, "reason": body.reason},
    )
    db.commit()
    return success(record_out(db, record))


@router.post(
    "/medical-records/{record_id}/apply-ai-candidate",
    response_model=Envelope[RecordOut],
)
def apply_ai_candidate(record_id: int, body: ApplyAICandidateInput, db: DB, user: CurrentUser):
    record = accessible_record(db, user, record_id, write=True)
    ensure_draft(record)
    if body.expected_revision != record.revision:
        raise APIError(409, 40908, "Report revision is stale; reload before applying AI text")
    before = snapshot(record)
    for field, value in body.candidate_fields.items():
        current = getattr(record, field) or ""
        setattr(record, field, value if body.replace else "\n\n".join(filter(None, [current, value])))
    record.revision += 1
    record.updated_at = utcnow()
    add_record_event(
        db,
        record,
        "draft_saved",
        user.id,
        to_status=record.status,
        metadata={"source": "ai_candidate", "replace": body.replace},
    )
    audit(
        db,
        user.id,
        record.patient_id,
        "record.ai_candidate",
        "medical_record",
        record.id,
        before=before,
        after=snapshot(record),
    )
    db.commit()
    return success(record_out(db, record))


@router.post(
    "/patients/{patient_id}/medical-records", status_code=201, response_model=Envelope[RecordOut]
)
def create_record(patient_id: int, body: RecordCreate, db: DB, user: CurrentUser):
    check_patient_access(db, user, patient_id, write=True)
    doctor = require_doctor(db, user)
    require_organ(body.organ_id)
    for organ_id in body.organ_ids or []:
        require_organ(organ_id)
    validate_examination(db, patient_id, body.examination_id)
    record = MedicalRecord(patient_id=patient_id, doctor_id=doctor.id, **body.model_dump())
    record.revision = 1
    if record.reviewed:
        record.status = "signed"
        record.signed_at = utcnow()
        record.signed_by_user_id = user.id
    else:
        record.status = "draft"
        record.signed_at = None
    db.add(record)
    db.flush()
    add_record_event(
        db,
        record,
        "created",
        user.id,
        to_status=record.status,
        metadata={"reviewed": record.reviewed},
    )
    sync_task_status(db, record)
    audit(
        db,
        user.id,
        patient_id,
        "record.create",
        "medical_record",
        record.id,
        after=snapshot(record),
    )
    db.commit()
    return success(record_out(db, record))


@router.patch("/medical-records/{record_id}", response_model=Envelope[RecordOut])
def update_record(record_id: int, body: RecordPatch, db: DB, user: CurrentUser):
    record = accessible_record(db, user, record_id, write=True)
    ensure_draft(record)
    if body.expected_revision is not None and body.expected_revision != record.revision:
        raise APIError(409, 40908, "Report revision is stale; reload before editing")
    if body.organ_id is not None:
        require_organ(body.organ_id)
    for organ_id in body.organ_ids or []:
        require_organ(organ_id)
    if "examination_id" in body.model_fields_set:
        validate_examination(db, record.patient_id, body.examination_id)
    before = snapshot(record)
    for key, value in body.model_dump(
        exclude_unset=True,
        exclude={"organ_ids", "expected_revision"},
    ).items():
        setattr(record, key, value)
    if body.organ_ids is not None:
        organ_ids = body.organ_ids
        if body.organ_id:
            organ_ids = [body.organ_id, *[v for v in organ_ids if v != body.organ_id]]
        record.organ_ids = organ_ids
    elif body.organ_id is not None:
        record.organ_ids = [body.organ_id]
    if "reviewed" in body.model_fields_set:
        if record.reviewed:
            record.status = "signed"
            record.signed_at = utcnow()
            record.signed_by_user_id = user.id
        else:
            record.status = "draft"
            record.signed_at = None
            record.signed_by_user_id = None
    if record.reviewed and (not record.diagnosis.strip() or not record.description.strip()):
        raise APIError(422, 42203, "Signed reports require a diagnosis and description")
    record.revision += 1
    record.updated_at = utcnow()
    add_record_event(
        db,
        record,
        "draft_saved" if not record.reviewed else "signed",
        user.id,
        to_status=record.status,
    )
    sync_task_status(db, record)
    audit(
        db,
        user.id,
        record.patient_id,
        "record.update",
        "medical_record",
        record.id,
        before=before,
        after=snapshot(record),
    )
    db.commit()
    return success(record_out(db, record))


@router.delete("/medical-records/{record_id}", response_model=Envelope[None])
def delete_record(record_id: int, db: DB, user: CurrentUser):
    record = accessible_record(db, user, record_id, write=True)
    ensure_draft(record)
    before = snapshot(record)
    record.deleted_at = record.updated_at = utcnow()
    task = report_task(db, record)
    if task is not None and task.primary_record_id == record.id:
        task.primary_record_id = None
        task.status = "pending_draft"
        task.updated_at = utcnow()
    audit(
        db,
        user.id,
        record.patient_id,
        "record.delete",
        "medical_record",
        record.id,
        before=before,
        after=snapshot(record),
    )
    db.commit()
    return success(None)
