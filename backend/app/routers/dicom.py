"""Authenticated DICOM/Orthanc integration boundary.

The API does not parse or persist DICOM bytes itself. When ORTHANC_URL is configured,
doctors can forward instances to the local Orthanc DIMSE/DICOMweb gateway.
"""

import httpx
from fastapi import APIRouter, File, Form, UploadFile

from app.audit import audit
from app.deps import DB, Config, CurrentUser, check_patient_access, require_doctor
from app.config import Settings
from app.errors import APIError, Envelope, success

router = APIRouter(prefix="/dicom", tags=["DICOM"])


def _client(settings: Settings):
    if not settings.orthanc_url:
        raise APIError(503, 50304, "DICOM gateway is not configured")
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


@router.post("/instances", status_code=201, response_model=Envelope[dict])
def store_instance(
    db: DB,
    user: CurrentUser,
    settings: Config,
    file: UploadFile = File(),
    patient_id: int | None = Form(None),
):
    doctor = require_doctor(db, user)
    if patient_id is not None:
        check_patient_access(db, user, patient_id, write=True)
    data = file.file.read(settings.max_upload_bytes + 1)
    file.file.close()
    if len(data) > settings.max_upload_bytes:
        raise APIError(413, 41301, "Upload exceeds limit")
    if not data:
        raise APIError(400, 40004, "DICOM instance is empty")
    try:
        with _client(settings) as client:
            response = client.post(
                "/instances",
                content=data,
                headers={"Content-Type": "application/dicom"},
            )
            response.raise_for_status()
            payload = response.json()
    except APIError:
        raise
    except (httpx.HTTPError, ValueError, TypeError):
        raise APIError(502, 50204, "DICOM gateway failed") from None
    instance_id = payload.get("ID") or payload.get("ParentSeries") or "unknown"
    audit(db, user.id, patient_id, "dicom.instance.store", "dicom_instance", instance_id)
    db.commit()
    return success({"orthanc": payload, "patient_id": patient_id, "doctor_id": doctor.id})


@router.get("/studies", response_model=Envelope[list])
def list_studies(db: DB, user: CurrentUser, settings: Config):
    require_doctor(db, user)
    try:
        with _client(settings) as client:
            response = client.get("/studies", params={"limit": 100, "short": "true"})
            response.raise_for_status()
            payload = response.json()
    except APIError:
        raise
    except (httpx.HTTPError, ValueError, TypeError):
        raise APIError(502, 50204, "DICOM gateway failed") from None
    return success(payload if isinstance(payload, list) else [])
