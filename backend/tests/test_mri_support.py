import io
import zipfile
from pathlib import Path

import nibabel as nib
import numpy as np
import pytest

from app.services.comparison import compare_studies
from app.services.label_catalog import LabelCatalog
from app.services.mri_metadata import detect_sequence_from_text, suggested_mode
from app.models import MedicalImage
from tests.conftest import SyntheticBatchAdapter, upload


def test_sequence_detection_from_text():
    assert detect_sequence_from_text("brain_t1w.nii.gz")[0] == "T1"
    assert detect_sequence_from_text("AX T2 FLAIR")[0] == "FLAIR"
    assert detect_sequence_from_text("DWI_TRACE")[0] == "DWI"
    assert detect_sequence_from_text("t2_tse_tra")[0] == "T2"
    assert detect_sequence_from_text("synthetic.nii.gz")[0] == "unknown"
    assert detect_sequence_from_text("T1W GD")[1] is True
    assert suggested_mode("MRI", "brain", "T1") == "MRI_BRAIN"
    assert suggested_mode("MRI", "brain", "T2") == "MRI_BODY"
    assert suggested_mode("MRI", "liver", "T1") == "MRI_BODY"


def test_mri_upload_detects_filename_sequence(app_env, people, tmp_path):
    _, client, _, _ = app_env
    data = np.arange(12 * 14 * 16, dtype=np.float32).reshape(12, 14, 16)
    path = tmp_path / "brain_t1w.nii.gz"
    nib.save(nib.Nifti1Image(data, np.diag([2.0, 3.0, 4.0, 1.0])), path)
    image_id = upload(client, people, path, image_type="MRI", organ_id="brain")
    payload = client.get(f"/api/v1/medical-images/{image_id}", headers=people["doctor_a"]).json()["data"]
    assert payload["image_type"] == "MRI"
    assert payload["sequence"] == "T1"
    assert payload["segmentation_mode"] == "MRI_BRAIN"
    patched = client.patch(
        f"/api/v1/medical-images/{image_id}",
        headers=people["doctor_a"],
        json={"sequence": "T2"},
    )
    assert patched.status_code == 200, patched.text
    body = patched.json()["data"]
    assert body["sequence"] == "T2"
    assert body["segmentation_mode"] == "MRI_BODY"
    assert body["sequence_confidence"] == "manual"


def test_mri_mri_comparison_and_cross_modality_rejected(app_env, people, nifti_file):
    app, client, _, _ = app_env
    first = upload(client, people, nifti_file, image_type="MRI")
    second = upload(client, people, nifti_file, image_type="MRI")
    ct_id = upload(client, people, nifti_file, image_type="CT")
    payload = client.get(
        f"/api/v1/medical-images/{first}/comparison-candidates", headers=people["doctor_a"]
    ).json()["data"]
    mri = next(item for item in payload if item["image_id"] == second)
    assert mri["comparable"] is True
    ct = next(item for item in payload if item["image_id"] == ct_id)
    assert ct["comparable"] is False
    with app.state.session_factory() as db:
        left = db.get(MedicalImage, first)
        right = db.get(MedicalImage, second)
        left.sequence = "T1"
        right.sequence = "T2"
        db.commit()
        verdict = compare_studies(left, right)
    assert verdict["comparable"] is True
    assert any("序列" in warning for warning in verdict["warnings"])


def test_mri_batch_segmentation_accepted(app_env, people, nifti_file):
    app, client, _, _ = app_env
    app.state.segmentation_runner.adapter = SyntheticBatchAdapter()
    image_id = upload(client, people, nifti_file, image_type="MRI")
    response = client.post(
        f"/api/v1/medical-images/{image_id}/segmentation-batch",
        headers=people["doctor_a"],
    )
    assert response.status_code == 201, response.text


def test_label_catalog_includes_mri_lungs():
    catalog = LabelCatalog(None)
    assert catalog.labels[135] == "left lung"
    assert catalog.labels[136] == "right lung"


def _mr_bytes(index: int, series_uid: str, description="T1W AX", extra=None) -> bytes:
    pydicom = pytest.importorskip("pydicom")
    from pydicom.dataset import FileDataset, FileMetaDataset
    from pydicom.uid import ExplicitVRLittleEndian, MRImageStorage, generate_uid

    meta = FileMetaDataset()
    meta.TransferSyntaxUID = ExplicitVRLittleEndian
    meta.MediaStorageSOPClassUID = MRImageStorage
    meta.MediaStorageSOPInstanceUID = generate_uid()
    ds = FileDataset(None, {}, file_meta=meta, preamble=b"\0" * 128)
    ds.is_little_endian = True
    ds.is_implicit_VR = False
    ds.SOPClassUID = MRImageStorage
    ds.SOPInstanceUID = meta.MediaStorageSOPInstanceUID
    ds.Modality = "MR"
    ds.SeriesInstanceUID = series_uid
    ds.SeriesDescription = description
    ds.InstanceNumber = index + 1
    ds.Rows = 8
    ds.Columns = 8
    ds.PixelSpacing = [1.0, 1.0]
    ds.SliceThickness = 2.0
    ds.ImageOrientationPatient = [1, 0, 0, 0, 1, 0]
    ds.ImagePositionPatient = [0.0, 0.0, float(index * 2)]
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 0
    ds.PixelData = (np.arange(64, dtype=np.uint16) + index).tobytes()
    if extra:
        for key, value in extra.items():
            setattr(ds, key, value)
    buffer = io.BytesIO()
    ds.save_as(buffer, write_like_original=False)
    return buffer.getvalue()


def test_dicom_series_zip_import(app_env, people):
    pytest.importorskip("pydicom")
    from pydicom.uid import generate_uid

    _, client, _, _ = app_env
    series = generate_uid()
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w") as zipped:
        for index in range(8):
            zipped.writestr(f"im{index}.dcm", _mr_bytes(index, series))
    files = {"file": ("brain_t1.zip", archive.getvalue(), "application/zip")}
    response = client.post(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-images",
        headers=people["doctor_a"],
        files=files,
        data={"organ_id": "brain", "image_type": "MRI"},
    )
    assert response.status_code == 201, response.text
    payload = response.json()["data"]
    assert payload["source_format"] == "dicom"
    assert payload["sequence"] == "T1"
    assert payload["shape"][2] == 8


def test_dicom_mixed_series_rejected(app_env, people):
    pytest.importorskip("pydicom")
    from pydicom.uid import generate_uid

    _, client, _, _ = app_env
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w") as zipped:
        zipped.writestr("a.dcm", _mr_bytes(0, generate_uid()))
        zipped.writestr("b.dcm", _mr_bytes(0, generate_uid(), description="T2W"))
    response = client.post(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-images",
        headers=people["doctor_a"],
        files={"file": ("mixed.zip", archive.getvalue(), "application/zip")},
        data={"organ_id": "brain", "image_type": "MRI"},
    )
    assert response.status_code == 400
