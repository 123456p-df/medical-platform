from fastapi import APIRouter
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access, require_doctor
from app.errors import APIError, Envelope, success
from app.models import (
    Doctor,
    DoctorPatientAccess,
    MedicalImage,
    MedicalRecord,
    OrganModel,
    Patient,
    RecordOrgan,
    User,
    utcnow,
)
from app.organs import ORGANS, require_organ
from app.schemas import OrganOut, OverviewOut, PatientCreate, PatientOut, ResolveInput
from app.security import encrypt_identity, identity_hash
from app.services.glb import model_available

router = APIRouter(tags=["Patient / Organ"])


@router.post("/patients", status_code=201, response_model=Envelope[PatientOut])
def create_patient(body: PatientCreate, db: DB, user: CurrentUser, settings: Config):
    doctor = require_doctor(db, user)
    patient = Patient(
        **body.model_dump(exclude={"id_number"}),
        id_number_hash=identity_hash(body.id_number, settings),
        id_number_encrypted=encrypt_identity(body.id_number, settings),
    )
    db.add(patient)
    try:
        db.flush()
        db.add(DoctorPatientAccess(doctor_id=doctor.id, patient_id=patient.id, status="active"))
        audit(db, user.id, patient.id, "patient.create", "patient", patient.id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise APIError(
            409, 40904, "Patient identity already registered; contact the records administrator"
        ) from None
    return success(
        {
            "patient_id": patient.id,
            "name": patient.name,
            "gender": patient.gender,
            "birth_date": patient.birth_date,
        }
    )


@router.delete("/patients/{patient_id}", response_model=Envelope[None])
def delete_patient(patient_id: int, db: DB, user: CurrentUser):
    patient = check_patient_access(db, user, patient_id, write=True)
    patient.deleted_at = utcnow()
    audit(
        db,
        user.id,
        patient.id,
        "patient.delete",
        "patient",
        patient.id,
        before={"deleted": False},
        after={"deleted": True},
    )
    db.commit()
    return success(None)


@router.post("/doctor/patients/resolve", response_model=Envelope[PatientOut])
def resolve(body: ResolveInput, db: DB, user: CurrentUser, settings: Config):
    require_doctor(db, user)
    patient = db.scalar(
        select(Patient).where(
            Patient.name == body.name,
            Patient.id_number_hash == identity_hash(body.id_number, settings),
        )
    )
    if patient is None:
        raise APIError(404, 40401, "Patient not found")
    check_patient_access(db, user, patient.id)
    audit(db, user.id, patient.id, "patient.resolve", "patient", patient.id)
    db.commit()
    return success(
        {
            "patient_id": patient.id,
            "name": patient.name,
            "gender": patient.gender,
            "birth_date": patient.birth_date,
        }
    )


@router.get("/patients/{patient_id}/overview", response_model=Envelope[OverviewOut])
def overview(patient_id: int, db: DB, user: CurrentUser):
    patient = check_patient_access(db, user, patient_id)
    record_organs = set(
        db.scalars(
            select(MedicalRecord.organ_id)
            .where(MedicalRecord.patient_id == patient_id, MedicalRecord.deleted_at.is_(None))
            .distinct()
        )
    )
    record_organs.update(
        db.scalars(
            select(RecordOrgan.organ_id)
            .join(MedicalRecord)
            .where(MedicalRecord.patient_id == patient_id, MedicalRecord.deleted_at.is_(None))
        )
    )
    image_organs = set(
        db.scalars(
            select(MedicalImage.organ_id).where(MedicalImage.patient_id == patient_id).distinct()
        )
    )
    return success(
        {
            "patient_id": patient.id,
            "name": patient.name,
            "summary": {
                "height": patient.height,
                "weight": patient.weight,
                "blood_type": patient.blood_type,
            },
            "organs": [
                {
                    "organ_id": key,
                    "name": name,
                    "has_record": key in record_organs,
                    "has_medical_image": key in image_organs,
                }
                for key, name in ORGANS.items()
            ],
        }
    )


@router.get("/patients/{patient_id}/organs/{organ_id}", response_model=Envelope[OrganOut])
def organ(patient_id: int, organ_id: str, db: DB, user: CurrentUser, settings: Config):
    check_patient_access(db, user, patient_id)
    require_organ(organ_id)
    model = db.scalar(
        select(OrganModel)
        .where(
            OrganModel.patient_id == patient_id,
            or_(OrganModel.organ_id == organ_id, OrganModel.group_id == organ_id),
            OrganModel.source == "segmentation",
        )
        .order_by(OrganModel.created_at.desc(), OrganModel.id.desc())
        .limit(1)
    )
    if model is None:
        model = db.get(OrganModel, f"default_{organ_id}")
    selection = {
        "source": model.source if model else "default",
        "model_id": model.id if model else f"default_{organ_id}",
        "available": model_available(db, model, settings),
        "label_id": model.label_id if model else None,
        "label_name": model.label_name if model else None,
        "group_id": model.group_id if model else None,
        "face_count": model.face_count if model else None,
        "size_bytes": model.size_bytes if model else None,
        "volume_cm3": model.volume_cm3 if model else None,
        "is_watertight": model.is_watertight if model else None,
        "bounds": model.bounds if model else None,
    }
    filters = [
        MedicalRecord.patient_id == patient_id,
        MedicalRecord.has_organ(organ_id),
        MedicalRecord.deleted_at.is_(None),
    ]
    if user.role == "patient":
        filters.append(MedicalRecord.reviewed.is_(True))
    total = db.scalar(select(func.count()).select_from(MedicalRecord).where(*filters))
    rows = db.execute(
        select(MedicalRecord, User.username)
        .join(Doctor, Doctor.id == MedicalRecord.doctor_id)
        .join(User, User.id == Doctor.user_id)
        .where(*filters)
        .order_by(MedicalRecord.record_date.desc(), MedicalRecord.id.desc())
        .limit(20)
    )
    records = [
        {
            "record_id": r.id,
            "organ_ids": r.organ_ids,
            "date": r.record_date,
            "diagnosis": r.diagnosis,
            "description": r.description,
            "doctor_name": name,
        }
        for r, name in rows
    ]
    return success(
        {
            "organ_id": organ_id,
            "name": ORGANS[organ_id],
            "model": selection,
            "records": records,
            "records_total": total,
        }
    )
