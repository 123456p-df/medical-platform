"""Convert a single DICOM series (files or zip) into a 3D NIfTI volume."""

from __future__ import annotations

import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

import numpy as np

from app.errors import APIError
from app.services.mri_metadata import detect_from_dicom_tags

try:
    import pydicom
    from pydicom.pixel_data_handlers.util import apply_modality_lut
except ImportError:
    pydicom = None
    apply_modality_lut = None


def _require_pydicom():
    if pydicom is None:
        raise APIError(503, 50305, "DICOM support requires pydicom")


def collect_dicom_bytes(file_name: str, payload: bytes, extras: list[tuple[str, bytes]] | None = None):
    items = [(file_name, payload), *(extras or [])]
    lower = (file_name or "").lower()
    if lower.endswith(".zip") or payload[:2] == b"PK":
        items = _unzip(payload)
    return items


def _unzip(payload: bytes) -> list[tuple[str, bytes]]:
    files: list[tuple[str, bytes]] = []
    try:
        with zipfile.ZipFile(io_bytes(payload)) as archive:
            names = [name for name in archive.namelist() if not name.endswith("/")]
            if len(names) > 4096:
                raise APIError(400, 40004, "DICOM zip contains too many files")
            for name in names:
                path = Path(name)
                if ".." in path.parts:
                    raise APIError(400, 40004, "Invalid path in DICOM zip")
                files.append((path.name or name, archive.read(name)))
    except APIError:
        raise
    except (zipfile.BadZipFile, OSError, ValueError):
        raise APIError(400, 40004, "Invalid DICOM zip archive") from None
    if not files:
        raise APIError(400, 40004, "DICOM zip is empty")
    return files


def io_bytes(payload: bytes):
    import io

    return io.BytesIO(payload)


def _read_dataset(payload: bytes):
    _require_pydicom()
    try:
        return pydicom.dcmread(io_bytes(payload), force=True)
    except Exception:
        raise APIError(400, 40004, "Unable to parse DICOM instance") from None


def series_from_files(files: list[tuple[str, bytes]]) -> tuple[list, dict]:
    datasets = []
    series_uids = set()
    modalities = set()
    for _name, payload in files:
        if len(payload) < 128:
            continue
        ds = _read_dataset(payload)
        if not hasattr(ds, "pixel_array"):
            continue
        datasets.append(ds)
        series_uids.add(str(getattr(ds, "SeriesInstanceUID", "") or ""))
        modalities.add(str(getattr(ds, "Modality", "") or "").upper())
    if not datasets:
        raise APIError(400, 40004, "No readable DICOM slices found")
    series_uids.discard("")
    if len(series_uids) > 1:
        raise APIError(400, 40004, "Mixed DICOM series. Import one series at a time")
    modalities.discard("")
    if len(modalities) > 1:
        raise APIError(400, 40004, "Mixed imaging types in one upload")
    modality = next(iter(modalities), "")
    if modality not in {"CT", "MR"}:
        raise APIError(400, 40004, "Only CT and MR DICOM series can be imported")
    first = datasets[0]
    tags = {
        "modality": "MRI" if modality == "MR" else "CT",
        "series_uid": str(getattr(first, "SeriesInstanceUID", "") or "") or None,
        "series_description": str(getattr(first, "SeriesDescription", "") or "") or None,
        "protocol_name": str(getattr(first, "ProtocolName", "") or "") or None,
        "sequence_name": str(getattr(first, "SequenceName", "") or "") or None,
        "image_type": "\\".join(str(v) for v in getattr(first, "ImageType", [])),
        "scanning_sequence": str(getattr(first, "ScanningSequence", "") or ""),
        "contrast_agent": str(getattr(first, "ContrastBolusAgent", "") or "") or None,
        "echo_time": _float(getattr(first, "EchoTime", None)),
        "repetition_time": _float(getattr(first, "RepetitionTime", None)),
        "device": str(getattr(first, "ManufacturerModelName", "") or getattr(first, "Manufacturer", "") or "")
        or None,
    }
    if int(getattr(first, "NumberOfTemporalPositions", 1) or 1) > 1:
        raise APIError(400, 40004, "Only single 3D DICOM series are supported")
    return datasets, {**tags, **detect_from_dicom_tags(tags)}


def _float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def convert_series(datasets: list, dest: Path, *, dcm2niix: str | None = None) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    command = None
    if dcm2niix:
        path = Path(dcm2niix)
        command = dcm2niix if path.is_file() or shutil.which(dcm2niix) else None
    if command:
        converted = _convert_with_dcm2niix(datasets, dest, command)
        if converted:
            return converted
    return _stack_to_nifti(datasets, dest)


def _convert_with_dcm2niix(datasets: list, dest: Path, command: str) -> Path | None:
    with tempfile.TemporaryDirectory() as raw:
        raw_path = Path(raw)
        for index, ds in enumerate(datasets):
            ds.save_as(raw_path / f"{index:04d}.dcm", write_like_original=False)
        result = subprocess.run(
            [command, "-z", "y", "-f", "series", "-o", str(raw_path), str(raw_path)],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            return None
        outputs = list(raw_path.glob("*.nii.gz")) + list(raw_path.glob("*.nii"))
        if len(outputs) != 1:
            return None
        shutil.copy(outputs[0], dest)
        return dest


def _orientation(ds) -> np.ndarray:
    iop = np.array([float(v) for v in getattr(ds, "ImageOrientationPatient", [1, 0, 0, 0, 1, 0])], dtype=np.float64)
    row, col = iop[:3], iop[3:]
    normal = np.cross(row, col)
    return np.stack([row, col, normal], axis=1)


def _stack_to_nifti(datasets: list, dest: Path) -> Path:
    import nibabel as nib

    def position(ds):
        ipp = np.array([float(v) for v in getattr(ds, "ImagePositionPatient", [0, 0, 0])], dtype=np.float64)
        return float(ipp @ _orientation(ds)[:, 2])

    ordered = sorted(datasets, key=lambda ds: (position(ds), int(getattr(ds, "InstanceNumber", 0) or 0)))
    planes = []
    for ds in ordered:
        try:
            pixels = apply_modality_lut(ds.pixel_array, ds) if apply_modality_lut else ds.pixel_array
        except Exception:
            raise APIError(400, 40004, "Unable to decode DICOM pixel data") from None
        planes.append(np.asarray(pixels, dtype=np.float32))
    if len({plane.shape for plane in planes}) != 1:
        raise APIError(400, 40004, "DICOM slices have different dimensions")
    volume = np.stack(planes, axis=-1)
    first = ordered[0]
    spacing = [float(v) for v in getattr(first, "PixelSpacing", [1.0, 1.0])]
    if len(ordered) > 1:
        slice_spacing = abs(position(ordered[1]) - position(ordered[0])) or float(
            getattr(first, "SliceThickness", 1.0) or 1.0
        )
    else:
        slice_spacing = float(getattr(first, "SliceThickness", 1.0) or 1.0)
    affine = np.eye(4)
    orientation = _orientation(first)
    ipp = np.array([float(v) for v in getattr(first, "ImagePositionPatient", [0, 0, 0])], dtype=np.float64)
    affine[:3, 0] = orientation[:, 0] * spacing[1]
    affine[:3, 1] = orientation[:, 1] * spacing[0]
    affine[:3, 2] = orientation[:, 2] * slice_spacing
    affine[:3, 3] = ipp
    header = nib.Nifti1Header()
    header.set_data_dtype(np.float32)
    header.set_xyzt_units("mm")
    dest.parent.mkdir(parents=True, exist_ok=True)
    nib.save(nib.Nifti1Image(volume, affine, header), str(dest))
    return dest
