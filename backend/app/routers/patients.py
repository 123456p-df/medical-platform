import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, Query
from sqlalchemy import String, cast, exists, func, or_, select
from sqlalchemy.exc import IntegrityError

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access, require_admin, require_doctor
from app.errors import APIError, Envelope, success
from app.models import (
    BreakGlassGrant,
    Doctor,
    DoctorPatientAccess,
    ImageReview,
    MedicalImage,
    MedicalRecord,
    OrganModel,
    Patient,
    PatientArchive,
    PatientLinkInvitation,
    RecordOrgan,
    SegmentationBatch,
    User,
    utcnow,
)
from app.organs import ORGANS, require_organ
from app.routers.images import image_out
from app.schemas import (
    BreakGlassInput,
    InvitationCreate,
    InvitationOut,
    LinkExistingInput,
    LinkExistingOut,
    OrganOut,
    OverviewOut,
    PatientArchiveInput,
    PatientArchiveOut,
    PatientArchivePage,
    PatientCreate,
    PatientLinkInput,
    PatientLinkOut,
    PatientOnboardingPatch,
    PatientOut,
    PatientRosterPage,
    ResolveInput,
)
from app.security import encrypt_identity, identity_hash
from app.services.glb import model_available

router = APIRouter(tags=["Patient / Organ"])


@router.get("/patients", response_model=Envelope[PatientRosterPage])
def patients(
    db: DB,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=100),
    modality: str | None = Query(None, max_length=16),
    organ_id: str | None = Query(None, max_length=64),
    review_status: str | None = Query(None, pattern="^(reviewed|pending|unassessed)$"),
    sort: str = Query("id", pattern="^(id|name)$"),
    direction: str = Query("asc", pattern="^(asc|desc)$"),
):
    query = select(Patient).where(Patient.deleted_at.is_(None))
    if user.role in {"doctor", "admin"}:
        doctor = require_doctor(db, user)
        query = query.join(DoctorPatientAccess, DoctorPatientAccess.patient_id == Patient.id).where(
            DoctorPatientAccess.doctor_id == doctor.id, DoctorPatientAccess.status == "active"
        )
    else:
        query = query.where(Patient.user_id == user.id)
    if search and search.strip():
        needle = f"%{search.strip()}%"
        query = query.where(or_(Patient.name.ilike(needle), cast(Patient.id, String).ilike(needle)))
    if modality or organ_id:
        image_filter = select(MedicalImage.id).where(MedicalImage.patient_id == Patient.id)
        if modality:
            image_filter = image_filter.where(MedicalImage.image_type == modality)
        if organ_id:
            image_filter = image_filter.where(MedicalImage.organ_id == organ_id)
        query = query.where(exists(image_filter))
    latest_image_id = (
        select(MedicalImage.id)
        .where(MedicalImage.patient_id == Patient.id)
        .order_by(
            MedicalImage.study_date.desc().nullslast(),
            MedicalImage.created_at.desc(),
            MedicalImage.id.desc(),
        )
        .limit(1)
        .correlate(Patient)
        .scalar_subquery()
    )
    reviewed_latest = exists(
        select(ImageReview.image_id).where(
            ImageReview.image_id == latest_image_id,
            ImageReview.user_id == user.id,
            ImageReview.completed_at.is_not(None),
        )
    )
    has_image = exists(select(MedicalImage.id).where(MedicalImage.patient_id == Patient.id))
    if review_status == "reviewed":
        query = query.where(reviewed_latest)
    elif review_status == "pending":
        query = query.where(has_image, ~reviewed_latest)
    elif review_status == "unassessed":
        query = query.where(~has_image)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    order = Patient.name if sort == "name" else Patient.id
    order = order.desc() if direction == "desc" else order.asc()
    patients_page = list(
        db.scalars(query.order_by(order, Patient.id).offset((page - 1) * page_size).limit(page_size))
    )
    patient_ids = [patient.id for patient in patients_page]
    latest_images = {}
    batch_ids = {}
    atlas_ids = {}
    latest_ids = []
    if patient_ids:
        image_rank = (
            func.row_number()
            .over(
                partition_by=MedicalImage.patient_id,
                order_by=(
                    MedicalImage.study_date.desc().nullslast(),
                    MedicalImage.created_at.desc(),
                    MedicalImage.id.desc(),
                ),
            )
            .label("image_rank")
        )
        ranked = (
            select(MedicalImage.id.label("image_id"), image_rank)
            .where(MedicalImage.patient_id.in_(patient_ids))
            .subquery()
        )
        latest_ids = list(
            db.scalars(select(ranked.c.image_id).where(ranked.c.image_rank == 1))
        )
        if latest_ids:
            latest_images = {
                image.id: image
                for image in db.scalars(select(MedicalImage).where(MedicalImage.id.in_(latest_ids)))
            }
            batches = db.scalars(
                select(SegmentationBatch)
                .where(SegmentationBatch.image_id.in_(latest_ids))
                .order_by(SegmentationBatch.created_at.desc(), SegmentationBatch.id.desc())
            )
            for batch in batches:
                batch_ids.setdefault(batch.image_id, batch.id)
            atlas_ids = dict(
                db.execute(
                    select(OrganModel.image_id, OrganModel.id).where(
                        OrganModel.image_id.in_(latest_ids), OrganModel.kind == "atlas"
                    )
                ).all()
            )
    latest_by_patient = {image.patient_id: image for image in latest_images.values()}
    reviewed_image_ids = set()
    if latest_ids:
        reviewed_image_ids = set(
            db.scalars(
                select(ImageReview.image_id).where(
                    ImageReview.image_id.in_(latest_ids),
                    ImageReview.user_id == user.id,
                    ImageReview.completed_at.is_not(None),
                )
            )
        )
    result = []
    for patient in patients_page:
        image = latest_by_patient.get(patient.id)
        latest_image = (
            image_out(
                image,
                db,
                segmentation_batch_id=batch_ids.get(image.id),
                atlas_id=atlas_ids.get(image.id),
            )
            if image
            else None
        )
        if latest_image is not None and image.id in reviewed_image_ids:
            latest_image["status"] = "reviewed"
        result.append(
            {
                "patient_id": patient.id,
                "name": patient.name,
                "birth_date": patient.birth_date,
                "gender": patient.gender,
                "blood_type": patient.blood_type,
                "latest_image": latest_image,
            }
        )
    return success({"items": result, "total": total, "page": page, "page_size": page_size})


@router.post("/patients", status_code=201, response_model=Envelope[PatientOut])
def create_patient(body: PatientCreate, db: DB, user: CurrentUser, settings: Config):
    doctor = require_doctor(db, user)
    patient = Patient(
        **body.model_dump(exclude={"id_number"}),
        id_number_hash=identity_hash(body.id_number, settings),
        id_number_encrypted=encrypt_identity(body.id_number, settings),
        profile_completed_at=utcnow(),
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


def patient_out(patient: Patient) -> dict:
    return {
        "patient_id": patient.id,
        "name": patient.name,
        "gender": patient.gender,
        "birth_date": patient.birth_date,
    }


def invitation_hash(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def as_utc(value) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def archive_out(db, archive: PatientArchive) -> dict:
    archived_by = db.get(User, archive.archived_by_user_id)
    restored_by = db.get(User, archive.restored_by_user_id) if archive.restored_by_user_id else None
    patient = db.get(Patient, archive.patient_id)
    return {
        "archive_id": archive.id,
        "patient_id": archive.patient_id,
        "patient_name": patient.name if patient else None,
        "reason": archive.reason,
        "archived_by_user_id": archive.archived_by_user_id,
        "archived_by_username": archived_by.username if archived_by else "unknown",
        "archived_at": archive.archived_at,
        "restored_by_user_id": archive.restored_by_user_id,
        "restored_by_username": restored_by.username if restored_by else None,
        "restored_at": archive.restored_at,
    }


@router.patch("/patient/onboarding", response_model=Envelope[dict])
def complete_onboarding(body: PatientOnboardingPatch, db: DB, user: CurrentUser, settings: Config):
    if user.role != "patient":
        raise APIError(403, 40305, "Patient role required")
    patient = db.scalar(
        select(Patient).where(Patient.user_id == user.id, Patient.deleted_at.is_(None))
    )
    if patient is None:
        patient = Patient(user_id=user.id)
        db.add(patient)
        db.flush()
    if patient.profile_completed_at is not None:
        raise APIError(409, 40910, "Patient profile is already complete")
    incoming_hash = identity_hash(body.id_number, settings)
    if patient.id_number_hash and patient.id_number_hash != incoming_hash:
        raise APIError(409, 40911, "Identity cannot be changed after onboarding starts")
    duplicate = db.scalar(
        select(Patient.id).where(
            Patient.id_number_hash == incoming_hash,
            Patient.id != patient.id,
        )
    )
    if duplicate is not None:
        raise APIError(
            409, 40904, "Patient identity already registered; contact the records administrator"
        )
    patient.name = body.name
    patient.id_number_encrypted = encrypt_identity(body.id_number, settings)
    patient.id_number_hash = incoming_hash
    patient.birth_date = body.birth_date
    patient.gender = body.gender
    patient.height = body.height
    patient.weight = body.weight
    patient.blood_type = body.blood_type
    patient.profile_completed_at = utcnow()
    audit(
        db,
        user.id,
        patient.id,
        "patient.onboarding.complete",
        "patient",
        patient.id,
        after={"profile_completed": True},
    )
    db.commit()
    return success(
        {
            "user_id": user.id,
            "username": user.username,
            "role": "patient",
            "account_role": "patient",
            "patient_id": patient.id,
            "profile_completed": True,
        }
    )


@router.post(
    "/doctor/patients/{patient_id}/invitations",
    status_code=201,
    response_model=Envelope[InvitationOut],
)
def create_patient_invitation(
    patient_id: int, body: InvitationCreate, db: DB, user: CurrentUser
):
    patient = check_patient_access(db, user, patient_id, write=True)
    if patient.profile_completed_at is None or not patient.id_number_hash:
        raise APIError(409, 40912, "Complete the patient profile before creating an invitation")
    existing = db.scalar(
        select(PatientLinkInvitation).where(
            PatientLinkInvitation.patient_id == patient.id,
            PatientLinkInvitation.used_at.is_(None),
            PatientLinkInvitation.revoked_at.is_(None),
        )
    )
    if existing is not None:
        raise APIError(409, 40913, "An active invitation already exists for this patient")
    code = secrets.token_urlsafe(32)
    invitation = PatientLinkInvitation(
        id=f"inv_{uuid4().hex}",
        patient_id=patient.id,
        created_by_user_id=user.id,
        token_hash=invitation_hash(code),
        expires_at=utcnow() + timedelta(minutes=body.expires_minutes),
    )
    db.add(invitation)
    audit(
        db,
        user.id,
        patient.id,
        "patient.invitation.create",
        "patient_link_invitation",
        invitation.id,
        after={"expires_at": invitation.expires_at.isoformat()},
    )
    db.commit()
    return success(
        {
            "invitation_id": invitation.id,
            "patient_id": patient.id,
            "patient_name": patient.name,
            "code": code,
            "expires_at": invitation.expires_at,
        }
    )


@router.post("/patient/link", response_model=Envelope[PatientLinkOut])
def link_patient_account(body: PatientLinkInput, db: DB, user: CurrentUser, settings: Config):
    if user.role != "patient":
        raise APIError(403, 40305, "Patient role required")
    invitation = db.scalar(
        select(PatientLinkInvitation).where(
            PatientLinkInvitation.token_hash == invitation_hash(body.token)
        )
    )
    if invitation is None or invitation.revoked_at is not None:
        raise APIError(404, 40405, "Invitation not found or revoked")
    if invitation.used_at is not None:
        raise APIError(409, 40914, "Invitation has already been used")
    if as_utc(invitation.expires_at) <= utcnow():
        raise APIError(409, 40915, "Invitation has expired")
    patient = db.get(Patient, invitation.patient_id)
    if patient is None or patient.deleted_at is not None:
        raise APIError(404, 40401, "Patient not found")
    if patient.name != body.name or patient.id_number_hash != identity_hash(body.id_number, settings):
        raise APIError(403, 40306, "Identity verification failed")
    if patient.user_id not in {None, user.id}:
        raise APIError(409, 40916, "Patient profile is already linked to another account")

    current = db.scalar(
        select(Patient).where(Patient.user_id == user.id, Patient.id != patient.id)
    )
    if current is not None:
        if current.profile_completed_at is not None or current.id_number_hash is not None:
            raise APIError(
                409, 40917, "The account already has a completed profile; contact the administrator"
            )
        current.user_id = None
        current.deleted_at = utcnow()
        db.flush()

    patient.user_id = user.id
    patient.profile_completed_at = patient.profile_completed_at or utcnow()
    invitation.used_by_user_id = user.id
    invitation.used_at = utcnow()
    audit(
        db,
        user.id,
        patient.id,
        "patient.link",
        "patient_link_invitation",
        invitation.id,
        after={"patient_id": patient.id},
    )
    db.commit()
    return success(
        {
            "patient_id": patient.id,
            "account_role": "patient",
            "profile_completed": True,
        }
    )


@router.post("/doctor/patients/link-existing", response_model=Envelope[LinkExistingOut])
def link_existing_patient(
    body: LinkExistingInput, db: DB, user: CurrentUser, settings: Config
):
    doctor = require_doctor(db, user)
    patient = db.scalar(
        select(Patient).where(
            Patient.name == body.name,
            Patient.id_number_hash == identity_hash(body.id_number, settings),
            Patient.deleted_at.is_(None),
        )
    )
    if patient is None:
        raise APIError(404, 40401, "Patient not found")
    if (
        body.birth_date is not None
        and patient.birth_date is not None
        and body.birth_date != patient.birth_date
    ):
        raise APIError(403, 40306, "Identity verification failed")
    access = db.get(DoctorPatientAccess, (doctor.id, patient.id))
    already_linked = access is not None and access.status == "active"
    if access is None:
        access = DoctorPatientAccess(doctor_id=doctor.id, patient_id=patient.id, status="active")
        db.add(access)
    else:
        access.status = "active"
    audit(
        db,
        user.id,
        patient.id,
        "patient.link_existing",
        "doctor_patient_access",
        doctor.id,
        after={"status": "active", "already_linked": already_linked},
    )
    db.commit()
    return success(
        {
            "patient_id": patient.id,
            "name": patient.name,
            "already_linked": already_linked,
        }
    )


@router.delete("/doctor/patients/{patient_id}/access", response_model=Envelope[dict])
def revoke_doctor_access(patient_id: int, db: DB, user: CurrentUser):
    doctor = require_doctor(db, user)
    patient = db.get(Patient, patient_id)
    if patient is None or patient.deleted_at is not None:
        raise APIError(404, 40401, "Patient not found")
    access = db.get(DoctorPatientAccess, (doctor.id, patient.id))
    if access is None or access.status == "revoked":
        return success({"patient_id": patient.id, "already_revoked": True})
    access.status = "revoked"
    audit(
        db,
        user.id,
        patient.id,
        "doctor_patient_access.remove",
        "doctor_patient_access",
        doctor.id,
        before={"status": "active"},
        after={"status": "revoked"},
    )
    db.commit()
    return success({"patient_id": patient.id, "already_revoked": False})


@router.delete("/patients/{patient_id}", response_model=Envelope[PatientArchiveOut])
def delete_patient(patient_id: int, db: DB, user: CurrentUser):
    require_admin(user)
    return _archive_patient(patient_id, "Legacy archive request", db, user)


@router.post(
    "/admin/patients/{patient_id}/archive",
    response_model=Envelope[PatientArchiveOut],
)
def archive_patient(patient_id: int, body: PatientArchiveInput, db: DB, user: CurrentUser):
    require_admin(user)
    return _archive_patient(patient_id, body.reason, db, user)


def _archive_patient(patient_id: int, reason: str, db, user: User) -> dict:
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise APIError(404, 40401, "Patient not found")
    existing = db.scalar(
        select(PatientArchive).where(
            PatientArchive.patient_id == patient_id,
            PatientArchive.restored_at.is_(None),
        )
    )
    if existing is not None:
        return success(archive_out(db, existing))
    patient.deleted_at = utcnow()
    archive = PatientArchive(
        patient_id=patient.id,
        reason=reason,
        archived_by_user_id=user.id,
        archived_at=patient.deleted_at,
    )
    db.add(archive)
    audit(
        db,
        user.id,
        patient.id,
        "patient.archive",
        "patient_archive",
        archive.id,
        before={"deleted": False},
        after={"deleted": True, "reason": reason},
    )
    db.commit()
    return success(archive_out(db, archive))


@router.get("/admin/patients/archived", response_model=Envelope[PatientArchivePage])
def archived_patients(
    db: DB,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=100),
):
    require_admin(user)
    query = (
        select(PatientArchive)
        .join(Patient, Patient.id == PatientArchive.patient_id)
        .where(Patient.deleted_at.is_not(None), PatientArchive.restored_at.is_(None))
        .order_by(PatientArchive.archived_at.desc(), PatientArchive.id.desc())
    )
    if search and search.strip():
        needle = f"%{search.strip()}%"
        query = query.where(or_(Patient.name.ilike(needle), cast(Patient.id, String).ilike(needle)))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = list(db.scalars(query.offset((page - 1) * page_size).limit(page_size)))
    return success(
        {
            "items": [archive_out(db, row) for row in rows],
            "page": page,
            "page_size": page_size,
            "total": total,
        }
    )


@router.post("/admin/patients/{patient_id}/restore", response_model=Envelope[PatientArchiveOut])
def restore_patient(patient_id: int, db: DB, user: CurrentUser):
    require_admin(user)
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise APIError(404, 40401, "Patient not found")
    archive = db.scalar(
        select(PatientArchive)
        .where(
            PatientArchive.patient_id == patient_id,
            PatientArchive.restored_at.is_(None),
        )
        .order_by(PatientArchive.id.desc())
        .limit(1)
    )
    if archive is None:
        raise APIError(409, 40918, "Patient is not currently archived")
    patient.deleted_at = None
    archive.restored_by_user_id = user.id
    archive.restored_at = utcnow()
    audit(
        db,
        user.id,
        patient.id,
        "patient.restore",
        "patient_archive",
        archive.id,
        before={"deleted": True},
        after={"deleted": False},
    )
    db.commit()
    return success(archive_out(db, archive))


@router.post("/doctor/patients/{patient_id}/break-glass", status_code=201, response_model=Envelope[dict])
def create_break_glass(patient_id: int, body: BreakGlassInput, db: DB, user: CurrentUser):
    doctor = require_doctor(db, user)
    patient = db.get(Patient, patient_id)
    if patient is None or patient.deleted_at is not None:
        raise APIError(404, 40401, "Patient not found")
    grant = BreakGlassGrant(
        id=f"bg_{uuid4().hex}",
        doctor_id=doctor.id,
        patient_id=patient.id,
        reason=body.reason,
        expires_at=utcnow() + timedelta(minutes=body.duration_minutes),
    )
    db.add(grant)
    db.flush()
    audit(
        db,
        user.id,
        patient.id,
        "patient.break_glass",
        "break_glass_grant",
        grant.id,
        after={"reason": body.reason, "expires_at": grant.expires_at.isoformat()},
    )
    db.commit()
    return success(
        {
            "grant_id": grant.id,
            "patient_id": patient.id,
            "expires_at": grant.expires_at,
            "read_only": True,
        }
    )


@router.delete("/doctor/break-glass/{grant_id}", response_model=Envelope[None])
def revoke_break_glass(grant_id: str, db: DB, user: CurrentUser):
    doctor = require_doctor(db, user)
    grant = db.get(BreakGlassGrant, grant_id)
    if grant is None:
        raise APIError(404, 40404, "Break-glass grant not found")
    if user.role != "admin" and grant.doctor_id != doctor.id:
        raise APIError(403, 40301, "No permission to revoke this grant")
    if grant.revoked_at is None:
        grant.revoked_at = utcnow()
        audit(db, user.id, grant.patient_id, "patient.break_glass.revoke", "break_glass_grant", grant.id)
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
