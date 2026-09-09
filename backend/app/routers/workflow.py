from fastapi import APIRouter, Query
from sqlalchemy import and_, func, select

from app.audit import audit
from app.deps import DB, CurrentUser, require_doctor
from app.errors import Envelope, success
from app.models import DoctorPatientAccess, ImageReview, MedicalImage, Patient, utcnow
from app.routers.images import accessible_image
from app.schemas import Input

router = APIRouter(tags=["Review workflow"])


class ReviewInput(Input):
    completed: bool


@router.get("/workflow", response_model=Envelope[dict])
def workflow(
    db: DB, user: CurrentUser, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)
):
    doctor = require_doctor(db, user)
    query = (
        select(MedicalImage, Patient, ImageReview.completed_at)
        .join(Patient, Patient.id == MedicalImage.patient_id)
        .join(DoctorPatientAccess, DoctorPatientAccess.patient_id == Patient.id)
        .outerjoin(
            ImageReview,
            and_(ImageReview.image_id == MedicalImage.id, ImageReview.user_id == user.id),
        )
        .where(
            Patient.deleted_at.is_(None),
            DoctorPatientAccess.doctor_id == doctor.id,
            DoctorPatientAccess.status == "active",
        )
    )
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = db.execute(
        query.order_by(MedicalImage.created_at.desc(), MedicalImage.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return success(
        {
            "items": [
                {
                    "image_id": image.id,
                    "patient_id": patient.id,
                    "patient_name": patient.name or "未完成建档",
                    "image_type": image.image_type,
                    "organ_id": image.organ_id,
                    "created_at": image.created_at,
                    "completed_at": completed,
                }
                for image, patient, completed in rows
            ],
            "page": page,
            "page_size": page_size,
            "total": total,
        }
    )


@router.patch("/medical-images/{image_id}/review", response_model=Envelope[dict])
def review(image_id: str, body: ReviewInput, db: DB, user: CurrentUser):
    image = accessible_image(db, user, image_id, write=True)
    # Lock the actor to make the first review idempotent under concurrent submissions.
    db.refresh(user, with_for_update=True)
    row = db.get(ImageReview, (user.id, image_id))
    if row is None:
        row = ImageReview(user_id=user.id, image_id=image_id)
        db.add(row)
    if body.completed and row.completed_at is None:
        row.completed_at = utcnow()
    elif not body.completed:
        row.completed_at = None
    audit(
        db,
        user.id,
        image.patient_id,
        "image.review",
        "medical_image",
        image_id,
        after={"completed": body.completed},
    )
    db.commit()
    return success({"image_id": image_id, "completed_at": row.completed_at})
