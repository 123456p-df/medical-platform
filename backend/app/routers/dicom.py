"""Authenticated DICOM/Orthanc integration boundary.

The API does not parse or persist DICOM bytes itself. When ORTHANC_URL is configured,
doctors can forward instances to the local Orthanc DIMSE/DICOMweb gateway.
"""

from datetime import date
from uuid import uuid4

import httpx
from fastapi import APIRouter, File, Form, UploadFile
from sqlalchemy import func, select

from app.audit import audit
from app.config import Settings
from app.deps import DB, Config, CurrentUser, check_patient_access, require_doctor
from app.errors import APIError, Envelope, success
from app.models import DicomInstance, DicomSeries, DicomStudy
from app.organs import require_organ
from app.schemas import DicomConvertInput, DicomConvertOut
from app.services.dicom_conversion import convert_series

router = APIRouter(prefix="/dicom", tags=["DICOM"])


def _integer(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _study_date(value):
    try:
        return date.fromisoformat(str(value).replace(".", "-") if "-" in str(value) else f"{value[:4]}-{value[4:6]}-{value[6:8]}")
    except (TypeError, ValueError, IndexError):
        return None


def _archive_link(db, patient_id, payload, tags):
    orthanc_instance_id = str(payload.get("ID") or "")
    orthanc_series_id = str(payload.get("ParentSeries") or tags.get("SeriesInstanceUID") or "")
    orthanc_study_id = str(payload.get("ParentStudy") or tags.get("StudyInstanceUID") or "")
    if not orthanc_instance_id or not orthanc_series_id or not orthanc_study_id:
        raise APIError(502, 50205, "DICOM gateway response lacks study/series identifiers", phase="archive")

    study = db.scalar(select(DicomStudy).where(DicomStudy.orthanc_study_id == orthanc_study_id))
    if study and study.patient_id != patient_id:
        raise APIError(409, 40909, "DICOM study is already linked to another patient", phase="association")
    if study is None:
        study = DicomStudy(
            id=f"dst_{uuid4().hex}", patient_id=patient_id, orthanc_study_id=orthanc_study_id,
            study_instance_uid=tags.get("StudyInstanceUID") or None,
        )
        db.add(study)
    study.dicom_patient_id = tags.get("PatientID") or study.dicom_patient_id
    study.modality = tags.get("Modality") or study.modality
    study.study_date = _study_date(tags.get("StudyDate")) or study.study_date
    study.description = tags.get("StudyDescription") or study.description
    study.status = "archived"

    series = db.scalar(select(DicomSeries).where(DicomSeries.orthanc_series_id == orthanc_series_id))
    if series is None:
        series = DicomSeries(
            id=f"dse_{uuid4().hex}", study_id=study.id, orthanc_series_id=orthanc_series_id,
            series_instance_uid=tags.get("SeriesInstanceUID") or None,
        )
        db.add(series)
    elif series.study_id != study.id:
        raise APIError(409, 40910, "DICOM series is already linked to another study", phase="association")
    series.modality = tags.get("Modality") or series.modality
    series.description = tags.get("SeriesDescription") or series.description
    series.rows = _integer(tags.get("Rows"), series.rows)
    series.columns = _integer(tags.get("Columns"), series.columns)

    instance = db.scalar(select(DicomInstance).where(DicomInstance.orthanc_instance_id == orthanc_instance_id))
    if instance is None:
        frames = max(1, _integer(tags.get("NumberOfFrames"), 1))
        instance = DicomInstance(
            id=f"din_{uuid4().hex}", series_id=series.id,
            orthanc_instance_id=orthanc_instance_id,
            sop_instance_uid=tags.get("SOPInstanceUID") or None,
            instance_number=_integer(tags.get("InstanceNumber")), number_of_frames=frames,
            transfer_syntax_uid=tags.get("TransferSyntaxUID") or None,
        )
        db.add(instance)
    elif instance.series_id != series.id:
        raise APIError(409, 40911, "DICOM instance is already linked to another series", phase="association")
    db.flush()
    series.instance_count = db.scalar(select(func.count()).select_from(DicomInstance).where(DicomInstance.series_id == series.id)) or 0
    series.frame_count = db.scalar(select(func.coalesce(func.sum(DicomInstance.number_of_frames), 0)).where(DicomInstance.series_id == series.id)) or 0
    study.instance_count = db.scalar(select(func.count()).select_from(DicomInstance).join(DicomSeries, DicomSeries.id == DicomInstance.series_id).where(DicomSeries.study_id == study.id)) or 0
    return study, series, instance


def _client(settings: Settings):
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
            tags = {}
            if patient_id is not None and payload.get("ID"):
                tag_response = client.get(f"/instances/{payload['ID']}/simplified-tags")
                tag_response.raise_for_status()
                tags = tag_response.json()
    except APIError:
        raise
    except (httpx.HTTPError, ValueError, TypeError):
        raise APIError(502, 50204, "DICOM gateway failed") from None
    instance_id = payload.get("ID") or payload.get("ParentSeries") or "unknown"
    business = None
    if patient_id is not None:
        study, series, instance = _archive_link(db, patient_id, payload, tags)
        business = {
            "study_id": study.id, "series_id": series.id, "instance_id": instance.id,
            "status": study.status, "instance_count": study.instance_count,
            "medical_image_id": series.medical_image_id,
        }
    audit(db, user.id, patient_id, "dicom.instance.store", "dicom_instance", instance_id)
    db.commit()
    return success({"orthanc": payload, "business": business, "patient_id": patient_id, "doctor_id": doctor.id})


@router.get("/patients/{patient_id}/studies", response_model=Envelope[list])
def patient_studies(patient_id: int, db: DB, user: CurrentUser):
    check_patient_access(db, user, patient_id)
    studies = db.scalars(
        select(DicomStudy).where(DicomStudy.patient_id == patient_id).order_by(
            DicomStudy.study_date.desc().nullslast(), DicomStudy.created_at.desc()
        )
    ).all()
    data = []
    for study in studies:
        series = db.scalars(select(DicomSeries).where(DicomSeries.study_id == study.id)).all()
        data.append({
            "study_id": study.id, "orthanc_study_id": study.orthanc_study_id,
            "study_instance_uid": study.study_instance_uid, "dicom_patient_id": study.dicom_patient_id,
            "modality": study.modality, "study_date": study.study_date,
            "description": study.description, "status": study.status,
            "instance_count": study.instance_count,
            "series": [{
                "series_id": item.id, "orthanc_series_id": item.orthanc_series_id,
                "series_instance_uid": item.series_instance_uid, "modality": item.modality,
                "description": item.description, "rows": item.rows, "columns": item.columns,
                "instance_count": item.instance_count, "frame_count": item.frame_count,
                "medical_image_id": item.medical_image_id,
            } for item in series],
        })
    return success(data)


@router.post(
    "/series/{series_id}/convert",
    response_model=Envelope[DicomConvertOut],
)
def convert_dicom_series(series_id: str, body: DicomConvertInput, db: DB, user: CurrentUser, settings: Config):
    series = db.get(DicomSeries, series_id)
    if series is None:
        raise APIError(404, 40406, "DICOM series not found")
    study = db.get(DicomStudy, series.study_id)
    if study is None:
        raise APIError(404, 40406, "DICOM series not found")
    check_patient_access(db, user, study.patient_id, write=True)
    require_organ(body.organ_id)
    return success(
        convert_series(db, settings, series.id, body.organ_id, user.id)
    )


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
