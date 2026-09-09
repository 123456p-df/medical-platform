from datetime import date

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.audit import audit
from app.deps import DB, CurrentUser, check_patient_access, require_doctor
from app.errors import APIError, Envelope, success
from app.models import Doctor, MedicalRecord, User, utcnow
from app.organs import require_organ
from app.schemas import RecordCreate, RecordOut, RecordPage, RecordPatch

router = APIRouter(tags=["Medical Record"])


def record_out(db, record):
    name = db.scalar(
        select(User.username)
        .join(Doctor, Doctor.user_id == User.id)
        .where(Doctor.id == record.doctor_id)
    )
    return {
        "record_id": record.id,
        "patient_id": record.patient_id,
        "organ_id": record.organ_id,
        "organ_ids": record.organ_ids,
        "diagnosis": record.diagnosis,
        "description": record.description,
        "record_date": record.record_date,
        "doctor_name": name,
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }


def snapshot(record):
    return {
        "organ_id": record.organ_id,
        "organ_ids": record.organ_ids,
        "diagnosis": record.diagnosis,
        "description": record.description,
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
    return record


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
    "/patients/{patient_id}/medical-records", status_code=201, response_model=Envelope[RecordOut]
)
def create_record(patient_id: int, body: RecordCreate, db: DB, user: CurrentUser):
    check_patient_access(db, user, patient_id, write=True)
    doctor = require_doctor(db, user)
    require_organ(body.organ_id)
    for organ_id in body.organ_ids or []:
        require_organ(organ_id)
    record = MedicalRecord(patient_id=patient_id, doctor_id=doctor.id, **body.model_dump())
    db.add(record)
    db.flush()
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
    if body.organ_id is not None:
        require_organ(body.organ_id)
    for organ_id in body.organ_ids or []:
        require_organ(organ_id)
    before = snapshot(record)
    for key, value in body.model_dump(exclude_unset=True, exclude={"organ_ids"}).items():
        setattr(record, key, value)
    if body.organ_ids is not None:
        organ_ids = body.organ_ids
        if body.organ_id:
            organ_ids = [body.organ_id, *[v for v in organ_ids if v != body.organ_id]]
        record.organ_ids = organ_ids
    elif body.organ_id is not None:
        record.organ_ids = [body.organ_id]
    record.updated_at = utcnow()
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
    before = snapshot(record)
    record.deleted_at = record.updated_at = utcnow()
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
