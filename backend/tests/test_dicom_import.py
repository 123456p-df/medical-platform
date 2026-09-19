import numpy as np
import pydicom

from app.services.dicom_import import dicom_series_to_volume


def make_slice(z, value):
    ds = pydicom.Dataset()
    ds.Rows = 4
    ds.Columns = 5
    ds.PixelSpacing = [2.0, 3.0]
    ds.ImageOrientationPatient = [1, 0, 0, 0, 1, 0]
    ds.ImagePositionPatient = [0, 0, z]
    ds.Modality = "CT"
    ds.StudyDate = "20260918"
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 0
    ds.file_meta = pydicom.Dataset()
    ds.file_meta.TransferSyntaxUID = "1.2.840.10008.1.2.1"
    ds.PixelData = (np.full((4, 5), value, dtype=np.uint16).tobytes())
    return ds


def test_dicom_series_to_volume():
    datasets = [make_slice(z, value) for z, value in [(0, 10), (4, 20), (8, 30)]]
    volume, affine, spacing, study_date = dicom_series_to_volume(datasets)
    assert volume.shape == (3, 4, 5)
    assert spacing == [2.0, 3.0, 4.0]
    assert study_date.isoformat() == "2026-09-18"
    assert np.allclose(np.diag(affine)[:3], spacing)
