"""Read-only collections for the web portal; use the same patient access rules."""

from fastapi import APIRouter, Query
from sqlalchemy import String, cast, exists, func, or_, select

from app.deps import DB, CurrentUser, check_patient_access, require_doctor
from app.errors import Envelope, success
from app.models import (
    DoctorPatientAccess,
    ImageReview,
    MedicalImage,
    MedicalRecord,
    OrganModel,
    Patient,
    SegmentationBatch,
)
from app.routers.images import image_out
from app.routers.records import record_out
from app.schemas import ImagePage, PatientRosterPage, RecordPage

router = APIRouter(tags=["Portal collections"])


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


@router.get("/patients/{patient_id}/medical-images", response_model=Envelope[ImagePage])
def images(
    patient_id: int,
    db: DB,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    check_patient_access(db, user, patient_id)
    query = select(MedicalImage).where(MedicalImage.patient_id == patient_id)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = db.scalars(
        query.order_by(
            MedicalImage.study_date.desc().nullslast(),
            MedicalImage.created_at.desc(),
            MedicalImage.id.desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return success(
        {
            "items": [image_out(row, db) for row in rows],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@router.get("/patients/{patient_id}/medical-records", response_model=Envelope[RecordPage])
def records(
    patient_id: int,
    db: DB,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    check_patient_access(db, user, patient_id)
    query = select(MedicalRecord).where(
        MedicalRecord.patient_id == patient_id, MedicalRecord.deleted_at.is_(None)
    )
    if user.role == "patient":
        query = query.where(MedicalRecord.reviewed.is_(True))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = db.scalars(
        query.order_by(MedicalRecord.record_date.desc(), MedicalRecord.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return success(
        {
            "items": [record_out(db, row) for row in rows],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )
