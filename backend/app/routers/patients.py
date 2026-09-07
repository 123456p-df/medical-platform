from fastapi import APIRouter
from sqlalchemy import func, select

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access, require_doctor
from app.errors import APIError, Envelope, success
from app.models import Doctor, MedicalImage, MedicalRecord, OrganModel, Patient, User
from app.organs import ORGANS, require_organ
from app.schemas import OrganOut, OverviewOut, PatientOut, ResolveInput
from app.security import identity_hash
from app.services.storage import stored_path

router = APIRouter(tags=["Patient / Organ"])


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
            OrganModel.organ_id == organ_id,
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
        "available": bool(model and stored_path(settings, model.file_path).is_file()),
    }
    filters = (
        MedicalRecord.patient_id == patient_id,
        MedicalRecord.organ_id == organ_id,
        MedicalRecord.deleted_at.is_(None),
    )
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
