from typing import Literal
from uuid import uuid4

import nibabel as nib
from fastapi import APIRouter, File, Form, Query, Response, UploadFile

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access
from app.errors import APIError, Envelope, success
from app.models import MedicalImage
from app.organs import require_organ
from app.schemas import ImageOut
from app.services.imaging import load_volume, slice_png
from app.services.storage import relative_path, stored_path

router = APIRouter(tags=["Medical Image"])


def accessible_image(db, user, image_id, *, write=False):
    image = db.get(MedicalImage, image_id)
    if image is None:
        raise APIError(404, 40404, "Medical image not found")
    check_patient_access(db, user, image.patient_id, write=write)
    return image


def image_out(image):
    return {
        "image_id": image.id,
        "patient_id": image.patient_id,
        "image_type": image.image_type,
        "organ_id": image.organ_id,
        "status": "uploaded",
        "shape": image.shape,
        "spacing": image.spacing,
        "slice_count": image.shape[2],
        "created_at": image.created_at,
    }


@router.post(
    "/patients/{patient_id}/medical-images", status_code=201, response_model=Envelope[ImageOut]
)
def upload_image(
    patient_id: int,
    db: DB,
    user: CurrentUser,
    settings: Config,
    file: UploadFile = File(),
    organ_id: str = Form(max_length=64),
    image_type: Literal["CT", "MRI"] = Form(),
):
    check_patient_access(db, user, patient_id, write=True)
    require_organ(organ_id)
    filename = (file.filename or "").lower()
    extension = (
        ".nii.gz" if filename.endswith(".nii.gz") else ".nii" if filename.endswith(".nii") else None
    )
    if extension is None:
        raise APIError(400, 40004, "Supported image formats: .nii and .nii.gz")
    image_id = f"img_{uuid4().hex}"
    path = stored_path(settings, f"medical-images/{image_id}{extension}")
    path.parent.mkdir(parents=True, exist_ok=True)
    size = 0
    try:
        with path.open("xb") as output:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > settings.max_upload_bytes:
                    raise APIError(413, 41301, "Upload exceeds limit")
                output.write(chunk)
        volume, _ = load_volume(path, settings)
        # API slice geometry is canonical; the stored original is kept for the model.
        canonical = nib.as_closest_canonical(volume)
        record = MedicalImage(
            id=image_id,
            patient_id=patient_id,
            organ_id=organ_id,
            image_type=image_type,
            file_path=relative_path(settings, path),
            shape=list(canonical.shape),
            size_bytes=size,
            spacing=[float(x) for x in canonical.header.get_zooms()],
        )
        db.add(record)
        audit(db, user.id, patient_id, "image.upload", "medical_image", image_id)
        db.commit()
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise
    finally:
        file.file.close()
    return success(image_out(record))


@router.get("/medical-images/{image_id}", response_model=Envelope[ImageOut])
def get_image(image_id: str, db: DB, user: CurrentUser):
    return success(image_out(accessible_image(db, user, image_id)))


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
):
    image = accessible_image(db, user, image_id)
    path = stored_path(settings, image.file_path)
    if not path.is_file():
        raise APIError(404, 40404, "Medical image file not found")
    return Response(
        slice_png(path, slice_index, settings, window_center, window_width),
        media_type="image/png",
        headers={"X-Image-Orientation": "RAS", "X-Slice-Axis": "axial"},
    )
