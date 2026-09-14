import gzip

import nibabel as nib
import numpy as np

from app.cli import set_access
from app.models import DicomInstance, DicomSeries, DicomStudy
from app.routers import dicom
from app.services import dicom_conversion


class Response:
    def __init__(self, payload, content=b""):
        self.payload = payload
        self.content = content

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


class Orthanc:
    def __enter__(self):
        return self

    def __exit__(self, *_):
        return None

    def post(self, *_args, **_kwargs):
        return Response({"ID": "orthanc-instance-1", "ParentSeries": "orthanc-series-1", "ParentStudy": "orthanc-study-1"})

    def get(self, path, **_kwargs):
        if path == "/series/orthanc-series-1/nifti":
            data = np.zeros((6, 7, 8), dtype=np.float32)
            image = nib.Nifti1Image(data, np.diag([1.0, 1.0, 2.5, 1.0]))
            return Response({}, gzip.compress(image.to_bytes()))
        assert path == "/instances/orthanc-instance-1/simplified-tags"
        return Response({
            "PatientID": "DICOM-PATIENT-1", "StudyInstanceUID": "1.2.3",
            "SeriesInstanceUID": "1.2.3.4", "SOPInstanceUID": "1.2.3.4.5",
            "StudyDate": "20260912", "Modality": "CT", "StudyDescription": "Chest CT",
            "SeriesDescription": "Thin slices", "Rows": "512", "Columns": "512",
            "NumberOfFrames": "2", "InstanceNumber": "1", "TransferSyntaxUID": "1.2.840.10008.1.2.1",
        })


def test_dicom_instance_creates_patient_study_series_links(app_env, people, monkeypatch):
    app, client, _settings, _provider = app_env
    monkeypatch.setattr(dicom, "_client", lambda _settings: Orthanc())
    route = "/api/v1/dicom/instances"
    data = {"patient_id": str(people["patient_a_pid"])}
    first = client.post(route, headers=people["doctor_a"], data=data, files={"file": ("slice.dcm", b"DICM")})
    assert first.status_code == 201, first.text
    linked = first.json()["data"]["business"]
    assert linked["status"] == "archived"
    assert linked["instance_count"] == 1

    second = client.post(route, headers=people["doctor_a"], data=data, files={"file": ("slice.dcm", b"DICM")})
    assert second.status_code == 201, second.text
    assert second.json()["data"]["business"]["instance_count"] == 1

    listing = client.get(f"/api/v1/dicom/patients/{people['patient_a_pid']}/studies", headers=people["doctor_a"])
    assert listing.status_code == 200
    study = listing.json()["data"][0]
    assert study["study_instance_uid"] == "1.2.3"
    assert study["series"][0]["frame_count"] == 2
    with app.state.session_factory() as db:
        assert db.query(DicomStudy).count() == 1
        assert db.query(DicomSeries).count() == 1
        assert db.query(DicomInstance).count() == 1


def test_dicom_study_cannot_be_reassigned_to_another_patient(app_env, people, monkeypatch):
    app, client, _settings, _provider = app_env
    monkeypatch.setattr(dicom, "_client", lambda _settings: Orthanc())
    route = "/api/v1/dicom/instances"
    first = client.post(route, headers=people["doctor_a"], data={"patient_id": people["patient_a_pid"]}, files={"file": ("slice.dcm", b"DICM")})
    assert first.status_code == 201
    with app.state.session_factory() as db:
        set_access(db, "doctor_a", people["patient_b_pid"], "active")
    conflict = client.post(route, headers=people["doctor_a"], data={"patient_id": people["patient_b_pid"]}, files={"file": ("slice.dcm", b"DICM")})
    assert conflict.status_code == 409
    assert conflict.json()["code"] == 40909


def test_dicom_series_converts_to_examination_and_backfills_link(app_env, people, monkeypatch):
    app, client, _settings, _provider = app_env
    monkeypatch.setattr(dicom, "_client", lambda _settings: Orthanc())
    monkeypatch.setattr(dicom_conversion, "gateway_client", lambda _settings: Orthanc())
    first = client.post(
        "/api/v1/dicom/instances",
        headers=people["doctor_a"],
        data={"patient_id": people["patient_a_pid"]},
        files={"file": ("slice.dcm", b"DICM")},
    )
    assert first.status_code == 201
    series_id = first.json()["data"]["business"]["series_id"]
    route = f"/api/v1/dicom/series/{series_id}/convert"
    assert client.post(route, json={"organ_id": "lung"}, headers=people["doctor_b"]).status_code == 403
    converted = client.post(route, json={"organ_id": "lung"}, headers=people["doctor_a"])
    assert converted.status_code == 200, converted.text
    image_id = converted.json()["data"]["medical_image_id"]
    assert converted.json()["data"]["already_converted"] is False
    assert client.get(f"/api/v1/medical-images/{image_id}", headers=people["doctor_a"]).status_code == 200
    assert client.get(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-images",
        headers=people["doctor_a"],
    ).json()["data"]["items"][0]["image_id"] == image_id
    repeat = client.post(route, json={"organ_id": "lung"}, headers=people["doctor_a"])
    assert repeat.status_code == 200 and repeat.json()["data"]["already_converted"] is True
    with app.state.session_factory() as db:
        series = db.get(DicomSeries, series_id)
        assert series.medical_image_id == image_id
        assert db.get(DicomStudy, series.study_id).status == "ready"
