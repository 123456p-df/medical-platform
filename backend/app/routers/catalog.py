"""Read-only collections for the web portal; use the same patient access rules."""

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.deps import DB, CurrentUser, check_patient_access, require_doctor
from app.errors import Envelope, success
from app.models import (
    DoctorPatientAccess,
    MedicalImage,
    MedicalRecord,
    OrganModel,
    Patient,
    SegmentationBatch,
)
from app.routers.images import image_out
from app.routers.records import record_out

router = APIRouter(tags=["Portal collections"])


@router.get("/patients", response_model=Envelope[dict])
def patients(
    db: DB, user: CurrentUser, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)
):
    query = select(Patient).where(Patient.deleted_at.is_(None))
    if user.role in {"doctor", "admin"}:
        doctor = require_doctor(db, user)
        query = query.join(DoctorPatientAccess, DoctorPatientAccess.patient_id == Patient.id).where(
            DoctorPatientAccess.doctor_id == doctor.id, DoctorPatientAccess.status == "active"
        )
    else:
        query = query.where(Patient.user_id == user.id)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    patients_page = list(
        db.scalars(query.order_by(Patient.id).offset((page - 1) * page_size).limit(page_size))
    )
    patient_ids = [patient.id for patient in patients_page]
    latest_images = {}
    batch_ids = {}
    atlas_ids = {}
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
    result = []
    for patient in patients_page:
        image = latest_by_patient.get(patient.id)
        result.append(
            {
                "patient_id": patient.id,
                "name": patient.name,
                "birth_date": patient.birth_date,
                "gender": patient.gender,
                "blood_type": patient.blood_type,
                "latest_image": (
                    image_out(
                        image,
                        db,
                        segmentation_batch_id=batch_ids.get(image.id),
                        atlas_id=atlas_ids.get(image.id),
                    )
                    if image
                    else None
                ),
            }
        )
    return success({"items": result, "total": total, "page": page, "page_size": page_size})


@router.get("/patients/{patient_id}/medical-images", response_model=Envelope[dict])
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


@router.get("/patients/{patient_id}/medical-records", response_model=Envelope[dict])
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
