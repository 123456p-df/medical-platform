from datetime import date
import logging
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, File, Form, Query, Request, Response, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access
from app.errors import APIError, Envelope, success
from app.models import MedicalImage, OrganModel, SegmentationBatch
from app.organs import require_organ
from app.schemas import ComparisonCandidateOut, ImageOut
from app.services.comparison import compare_studies
from app.services.imaging import (
    acquisition_from_volume,
    canonical_labels,
    canonical_voxels,
    label_cache_path,
    load_volume,
    prepare_slice_cache,
    slice_cache_path,
    slice_png,
)
from app.services.storage import imaging_relative_path, relative_path, stored_path
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Medical Image"])


def accessible_image(db, user, image_id, *, write=False):
    image = db.get(MedicalImage, image_id)
    if image is None:
        raise APIError(404, 40404, "Medical image not found")
    check_patient_access(db, user, image.patient_id, write=write)
    return image


def latest_batch_id(db, image_id):
    return db.scalar(
        select(SegmentationBatch.id)
        .where(SegmentationBatch.image_id == image_id)
        .order_by(SegmentationBatch.created_at.desc())
        .limit(1)
    )


def atlas_model_id(db, image_id):
    return db.scalar(
        select(OrganModel.id).where(OrganModel.image_id == image_id, OrganModel.kind == "atlas")
    )


def native_label_path(db, settings, image_id):
    batch = db.scalar(
        select(SegmentationBatch)
        .where(
            SegmentationBatch.image_id == image_id,
            SegmentationBatch.native_label_map_path.is_not(None),
        )
        .order_by(SegmentationBatch.created_at.desc())
    )
    if batch is None or not batch.native_label_map_path:
        return None
    path = stored_path(settings, batch.native_label_map_path)
    return path if path.is_file() else None


def image_out(image, db=None, segmentation_batch_id=None):
    atlas = None
    if db is not None:
        if segmentation_batch_id is None:
            segmentation_batch_id = latest_batch_id(db, image.id)
        atlas = atlas_model_id(db, image.id)
    return {
        "image_id": image.id,
        "patient_id": image.patient_id,
        "image_type": image.image_type,
        "organ_id": image.organ_id,
        "status": "uploaded",
        "shape": image.shape,
        "spacing": image.spacing,
        "slice_count": image.shape[2],
        "study_date": image.study_date,
        "created_at": image.created_at,
        "segmentation_batch_id": segmentation_batch_id,
        "atlas_model_id": atlas,
        "acquisition": image.acquisition or None,
    }


@router.post(
    "/patients/{patient_id}/medical-images", status_code=201, response_model=Envelope[ImageOut]
)
def upload_image(
    request: Request,
    patient_id: int,
    db: DB,
    user: CurrentUser,
    settings: Config,
    file: UploadFile = File(),
    organ_id: str = Form(max_length=64),
    image_type: Literal["CT", "MRI"] = Form(),
    study_date: date | None = Form(None),
):
    # Doctors need an active assignment; patients may upload only to their own record.
    check_patient_access(db, user, patient_id, write=user.role == "doctor")
    require_organ(organ_id)
    if study_date and study_date > date.today():
        raise APIError(400, 40010, "Study date cannot be in the future")
    filename = (file.filename or "").lower()
    extension = (
        ".nii.gz" if filename.endswith(".nii.gz") else ".nii" if filename.endswith(".nii") else None
    )
    if extension is None:
        raise APIError(400, 40004, "Supported image formats: .nii and .nii.gz")
    image_id = f"img_{uuid4().hex}"
    path = stored_path(settings, imaging_relative_path(patient_id, image_id, extension))
    path.parent.mkdir(parents=True, exist_ok=True)
    size = 0
    try:
        with path.open("xb") as output:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > settings.max_upload_bytes:
                    raise APIError(413, 41301, "Upload exceeds limit")
                output.write(chunk)
        volume, data = load_volume(path, settings)
        # API slice geometry is canonical; the stored original is kept for the model.
        canonical = prepare_slice_cache(path, volume, data)
        record = MedicalImage(
            id=image_id,
            patient_id=patient_id,
            organ_id=organ_id,
            image_type=image_type,
            file_path=relative_path(settings, path),
            shape=list(canonical.shape),
            size_bytes=size,
            spacing=[float(x) for x in canonical.header.get_zooms()[:3]],
            study_date=study_date,
            acquisition=acquisition_from_volume(volume, data),
        )
        db.add(record)
        audit(db, user.id, patient_id, "image.upload", "medical_image", image_id)
        db.commit()
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        slice_cache_path(path).unlink(missing_ok=True)
        raise
    finally:
        file.file.close()
    try:
        batch_id = request.app.state.segmentation_runner.enqueue_batch_for_image(image_id, user.id)
    except Exception as exc:
        logger.error("Unable to enqueue segmentation batch (%s)", type(exc).__name__)
        batch_id = None
    return success(image_out(record, db, batch_id))


@router.get("/medical-images/{image_id}", response_model=Envelope[ImageOut])
def get_image(image_id: str, db: DB, user: CurrentUser):
    return success(image_out(accessible_image(db, user, image_id), db))


@router.get(
    "/medical-images/{image_id}/comparison-candidates",
    response_model=Envelope[list[ComparisonCandidateOut]],
)
def comparison_candidates(image_id: str, db: DB, user: CurrentUser):
    image = accessible_image(db, user, image_id)
    others = db.scalars(
        select(MedicalImage)
        .where(MedicalImage.patient_id == image.patient_id, MedicalImage.id != image.id)
        .order_by(
            MedicalImage.study_date.desc().nullslast(),
            MedicalImage.created_at.desc(),
        )
    )
    return success([compare_studies(image, other) for other in others])


@router.get("/medical-images/{image_id}/volume", response_class=FileResponse)
def get_volume(image_id: str, db: DB, user: CurrentUser, settings: Config):
    image = accessible_image(db, user, image_id)
    path = stored_path(settings, image.file_path)
    if not path.is_file():
        raise APIError(404, 40404, "Medical image file not found")
    # Prepare legacy uploads once; FileResponse streams the existing uncompressed file.
    canonical_voxels(path, settings)
    return FileResponse(
        slice_cache_path(path),
        media_type="application/octet-stream",
        headers={"X-Image-Orientation": "RAS"},
    )


@router.get("/medical-images/{image_id}/label-volume", response_class=FileResponse)
def get_label_volume(image_id: str, db: DB, user: CurrentUser, settings: Config):
    accessible_image(db, user, image_id)
    path = native_label_path(db, settings, image_id)
    if path is None:
        raise APIError(404, 40409, "Segmentation label map is not available")
    canonical_labels(path, settings)
    return FileResponse(
        label_cache_path(path),
        media_type="application/octet-stream",
        headers={"X-Image-Orientation": "RAS", "X-Volume-Kind": "labels"},
    )


@router.get(
    "/medical-images/{image_id}/slice/{slice_index}",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}},
)
def get_slice(
    image_id: str,
    slice_index: int,
    db: DB,
    user: CurrentUser,
    settings: Config,
    window_center: float | None = Query(None, allow_inf_nan=False),
    window_width: float | None = Query(None, gt=0, allow_inf_nan=False),
    axis: Literal["axial", "coronal", "sagittal"] = Query("axial"),
):
    image = accessible_image(db, user, image_id)
    path = stored_path(settings, image.file_path)
    if not path.is_file():
        raise APIError(404, 40404, "Medical image file not found")
    return Response(
        slice_png(path, slice_index, settings, window_center, window_width, axis),
        media_type="image/png",
        headers={"X-Image-Orientation": "RAS", "X-Slice-Axis": axis},
    )
