"""Convert an Orthanc DICOM series into a viewable MedicalImage."""

from uuid import uuid4

import httpx
import nibabel as nib
import numpy as np

from app.audit import audit
from app.config import Settings
from app.errors import APIError
from app.models import DicomSeries, DicomStudy, MedicalImage, utcnow
from app.services.storage import stored_path


def gateway_client(settings: Settings) -> httpx.Client:
    if not settings.orthanc_url:
        raise APIError(503, 50305, "DICOM gateway is not configured", phase="gateway")
    auth = None
    if settings.orthanc_username:
        password = settings.orthanc_password.get_secret_value() if settings.orthanc_password else ""
        auth = (settings.orthanc_username, password)
    return httpx.Client(
        base_url=settings.orthanc_url.rstrip("/"),
        auth=auth,
        timeout=settings.dicom_timeout_seconds,
        follow_redirects=False,
        trust_env=False,
    )


def convert_series(db, settings: Settings, series_id: str, organ_id: str, actor_user_id: int) -> dict:
    series = db.get(DicomSeries, series_id)
    if series is None:
        raise APIError(404, 40406, "DICOM series not found")
    if series.medical_image_id is not None:
        return {
            "series_id": series.id,
            "medical_image_id": series.medical_image_id,
            "status": "ready",
            "already_converted": True,
        }
    study = db.get(DicomStudy, series.study_id)
    if study is None:
        raise APIError(404, 40406, "DICOM series not found")
    if study.status == "converting":
        raise APIError(409, 40919, "A conversion is already running for this DICOM series")
    if study.modality not in {"CT", "MRI"}:
        raise APIError(400, 40012, "Only CT and MRI series can become examination images")

    study.status = "converting"
    study.updated_at = utcnow()
    audit(
        db,
        actor_user_id,
        study.patient_id,
        "dicom.series.convert.start",
        "dicom_series",
        series.id,
        after={"organ_id": organ_id},
    )
    db.commit()
    relative = f"dicom/{study.id}/{series.id}.nii.gz"
    try:
        with gateway_client(settings) as client:
            response = client.get(f"/series/{series.orthanc_series_id}/nifti", params={"compress": "false"})
            response.raise_for_status()
            data = response.content
        if not data:
            raise APIError(502, 50206, "DICOM gateway returned an empty NIfTI volume", phase="convert")
        path = stored_path(settings, relative)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        volume = nib.load(path)
        shape = [int(value) for value in volume.shape]
        affine = np.asarray(volume.affine, dtype=float)
        spacing = np.abs(np.diag(affine)[:3]).tolist()
        image = MedicalImage(
            id=f"dcm_{uuid4().hex}",
            patient_id=study.patient_id,
            organ_id=organ_id,
            image_type=study.modality,
            file_path=relative,
            shape=shape,
            spacing=spacing,
            size_bytes=len(data),
            study_date=study.study_date,
            acquisition={
                "affine": affine.tolist(),
                "spacing_mm": spacing,
                "orientation": "RAS",
            },
        )
        db.add(image)
        db.flush()
        series.medical_image_id = image.id
        study.status = "ready"
        study.updated_at = utcnow()
        audit(
            db,
            actor_user_id,
            study.patient_id,
            "dicom.series.convert.complete",
            "dicom_series",
            series.id,
            after={"medical_image_id": image.id},
        )
        db.commit()
        return {
            "series_id": series.id,
            "medical_image_id": image.id,
            "status": "ready",
            "already_converted": False,
        }
    except APIError:
        db.rollback()
        study = db.get(DicomStudy, series.study_id)
        if study is not None:
            study.status = "failed"
            study.updated_at = utcnow()
            db.commit()
        raise
    except (httpx.HTTPError, ValueError, TypeError):
        db.rollback()
        study = db.get(DicomStudy, series.study_id)
        if study is not None:
            study.status = "failed"
            study.updated_at = utcnow()
            db.commit()
        raise APIError(502, 50206, "DICOM volume conversion failed", phase="convert") from None
