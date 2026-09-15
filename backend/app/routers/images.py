import logging
from datetime import date
from pathlib import Path
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
from app.schemas import ComparisonCandidateOut, ImageAcquisitionPatch, ImageOut
from app.services.comparison import compare_studies
from app.services.dicom_ingest import collect_dicom_bytes, convert_series, series_from_files
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
from app.services.mri_metadata import (
    SEQUENCES,
    detect_from_nifti,
    mode_warning,
    suggested_mode,
)
from app.services.storage import relative_path, stored_path

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


def image_out(image, db=None, segmentation_batch_id=None, atlas_id=None):
    atlas = atlas_id
    if db is not None:
        if segmentation_batch_id is None:
            segmentation_batch_id = latest_batch_id(db, image.id)
        if atlas_id is None:
            atlas = atlas_model_id(db, image.id)
    acquisition = dict(image.acquisition or {})
    acquisition.setdefault("sequence", image.sequence)
    acquisition.setdefault("contrast", image.contrast)
    acquisition.setdefault("segmentation_mode", image.segmentation_mode)
    acquisition.setdefault("source_format", image.source_format)
    acquisition.setdefault(
        "series_description", (image.acquisition or {}).get("series_description")
    )
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
        "acquisition": acquisition or None,
        "source_format": image.source_format,
        "series_uid": image.series_uid,
        "sequence": image.sequence,
        "contrast": image.contrast,
        "segmentation_mode": image.segmentation_mode,
        "sequence_confidence": image.sequence_confidence,
        "segmentation_warning": mode_warning(image),
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
    sequence: Literal["T1", "T2", "FLAIR", "DWI", "other", "unknown"] | None = Form(
        None
    ),
    contrast: bool | None = Form(None),
    segmentation_mode: Literal["CT_BODY", "MRI_BODY", "MRI_BRAIN"] | None = Form(None),
):
    # Doctors need an active assignment; patients may upload only to their own record.
    check_patient_access(db, user, patient_id, write=user.role in {"doctor", "admin"})
    require_organ(organ_id)
    if study_date and study_date > date.today():
        raise APIError(400, 40010, "Study date cannot be in the future")
    filename = (file.filename or "").lower()
    payload = file.file.read(settings.max_upload_bytes + 1)
    file.file.close()
    if len(payload) > settings.max_upload_bytes:
        raise APIError(413, 41301, "Upload exceeds limit")
    if not payload:
        raise APIError(400, 40004, "Upload is empty")
    image_id = f"img_{uuid4().hex}"
    nifti_path = None
    source_format = "nifti"
    series_uid = None
    detected = {"sequence": "unknown", "contrast": None, "series_description": None}
    try:
        looks_dicom = (
            filename.endswith(".dcm")
            or filename.endswith(".zip")
            or payload[:2] == b"PK"
            or (len(payload) > 132 and payload[128:132] == b"DICM")
        )
        if filename.endswith(".nii.gz"):
            extension = ".nii.gz"
            nifti_path = stored_path(settings, f"medical-images/{image_id}{extension}")
            nifti_path.parent.mkdir(parents=True, exist_ok=True)
            nifti_path.write_bytes(payload)
        elif filename.endswith(".nii"):
            extension = ".nii"
            nifti_path = stored_path(settings, f"medical-images/{image_id}{extension}")
            nifti_path.parent.mkdir(parents=True, exist_ok=True)
            nifti_path.write_bytes(payload)
        elif looks_dicom:
            source_format = "dicom"
            files = collect_dicom_bytes(file.filename or "series.dcm", payload)
            datasets, detected = series_from_files(files)
            detected_type = detected.get("modality")
            if detected_type and detected_type != image_type:
                raise APIError(400, 40004, "DICOM modality does not match the selected image type")
            series_uid = detected.get("series_uid")
            nifti_path = stored_path(settings, f"medical-images/{image_id}.nii.gz")
            convert_series(datasets, nifti_path, dcm2niix=settings.dcm2niix_command)
            dicom_dir = stored_path(settings, f"medical-images/{image_id}/dicom")
            dicom_dir.mkdir(parents=True, exist_ok=True)
            for index, (name, content) in enumerate(files):
                (dicom_dir / f"{index:04d}_{Path(name).name}").write_bytes(content)
        else:
            raise APIError(400, 40004, "Supported image formats: .nii, .nii.gz, .dcm, .zip")
        volume, data = load_volume(nifti_path, settings)
        canonical = prepare_slice_cache(nifti_path, volume, data)
        acquisition = acquisition_from_volume(volume, data)
        if source_format == "nifti":
            detected = detect_from_nifti(nifti_path, volume, original_name=file.filename)
        acquisition.update({key: value for key, value in detected.items() if value is not None})
        chosen_sequence = sequence or detected.get("sequence") or "unknown"
        if chosen_sequence not in SEQUENCES:
            chosen_sequence = "unknown"
        chosen_contrast = contrast if contrast is not None else detected.get("contrast")
        mode = segmentation_mode or suggested_mode(image_type, organ_id, chosen_sequence)
        record = MedicalImage(
            id=image_id,
            patient_id=patient_id,
            organ_id=organ_id,
            image_type=image_type,
            file_path=relative_path(settings, nifti_path),
            shape=list(canonical.shape),
            size_bytes=nifti_path.stat().st_size,
            spacing=[float(x) for x in canonical.header.get_zooms()[:3]],
            study_date=study_date,
            source_format=source_format,
            series_uid=series_uid,
            sequence=chosen_sequence,
            contrast=chosen_contrast,
            segmentation_mode=mode,
            sequence_confidence="manual" if sequence else "auto",
            acquisition=acquisition,
        )
        db.add(record)
        audit(db, user.id, patient_id, "image.upload", "medical_image", image_id)
        db.commit()
    except Exception:
        db.rollback()
        if nifti_path:
            nifti_path.unlink(missing_ok=True)
            slice_cache_path(nifti_path).unlink(missing_ok=True)
        raise
    try:
        batch_id = request.app.state.segmentation_runner.enqueue_batch_for_image(image_id, user.id)
    except Exception as exc:
        logger.error("Unable to enqueue segmentation batch (%s)", type(exc).__name__)
        batch_id = None
    return success(image_out(record, db, batch_id))


@router.get("/medical-images/{image_id}", response_model=Envelope[ImageOut])
def get_image(image_id: str, db: DB, user: CurrentUser):
    return success(image_out(accessible_image(db, user, image_id), db))


@router.patch("/medical-images/{image_id}", response_model=Envelope[ImageOut])
def patch_image(image_id: str, body: ImageAcquisitionPatch, db: DB, user: CurrentUser):
    image = accessible_image(db, user, image_id, write=True)
    values = body.model_dump(exclude_unset=True)
    if "already_skull_stripped" in values:
        acquisition = dict(image.acquisition or {})
        acquisition["already_skull_stripped"] = bool(values.pop("already_skull_stripped"))
        image.acquisition = acquisition
    if "sequence" in values or "segmentation_mode" in values:
        running = db.scalar(
            select(SegmentationBatch.id).where(
                SegmentationBatch.image_id == image_id,
                SegmentationBatch.status.in_(["queued", "running"]),
            )
        )
        if running:
            raise APIError(409, 40904, "Cannot change segmentation settings while a job is running")
        image.sequence_confidence = "manual"
    if "sequence" in values:
        image.sequence = values["sequence"]
        if "segmentation_mode" not in values:
            image.segmentation_mode = suggested_mode(image.image_type, image.organ_id, image.sequence)
    if "contrast" in values:
        image.contrast = values["contrast"]
    if "segmentation_mode" in values:
        image.segmentation_mode = values["segmentation_mode"]
    audit(db, user.id, image.patient_id, "image.patch", "medical_image", image_id)
    db.commit()
    return success(image_out(image, db))


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
