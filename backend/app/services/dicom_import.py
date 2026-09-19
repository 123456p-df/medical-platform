"""Convert a small uploaded DICOM series into a NIfTI volume for local testing."""

from datetime import date

import numpy as np


def dicom_date(value: str | None) -> date | None:
    if not value or len(value) != 8 or not value.isdigit():
        return None
    year, month, day = int(value[:4]), int(value[4:6]), int(value[6:8])
    try:
        return date(year, month, day)
    except ValueError:
        return None


def sorted_dicom_slices(datasets):
    if len(datasets) < 2:
        return datasets, 1.0

    first = datasets[0]
    orientation = [float(value) for value in first.ImageOrientationPatient]
    row_direction = np.asarray(orientation[:3], dtype=float)
    col_direction = np.asarray(orientation[3:], dtype=float)
    normal = np.cross(row_direction, col_direction)
    normal_norm = np.linalg.norm(normal)
    if normal_norm <= 1e-6:
        raise ValueError("DICOM image orientation is degenerate")
    normal /= normal_norm

    def slice_position(item):
        position = [float(value) for value in item.ImagePositionPatient]
        return float(np.dot(normal, position[:3]))

    ordered = sorted(datasets, key=slice_position)
    positions = [slice_position(item) for item in ordered]
    diffs = np.abs(np.diff(positions))
    slice_spacing = float(np.median(diffs[diffs > 1e-6])) if np.any(diffs > 1e-6) else 1.0
    return ordered, max(slice_spacing, 1e-6)


def dicom_affine(datasets, slice_spacing: float):
    first = datasets[0]
    orientation = [float(value) for value in first.ImageOrientationPatient]
    pixel_spacing = [float(value) for value in first.PixelSpacing]
    row_direction = np.asarray(orientation[:3], dtype=float)
    col_direction = np.asarray(orientation[3:], dtype=float)
    normal = np.cross(row_direction, col_direction)
    normal_norm = np.linalg.norm(normal)
    if normal_norm <= 1e-6:
        raise ValueError("DICOM image orientation is degenerate")
    normal /= normal_norm
    position = [float(value) for value in first.ImagePositionPatient]
    affine = np.eye(4, dtype=float)
    affine[:3, 0] = row_direction * pixel_spacing[0]
    affine[:3, 1] = col_direction * pixel_spacing[1]
    affine[:3, 2] = normal * slice_spacing
    affine[:3, 3] = position[:3]
    return affine


def dicom_series_to_volume(datasets):
    """Return data, affine, spacing and DICOM study date."""
    ordered, slice_spacing = sorted_dicom_slices(datasets)
    rows = ordered[0].Rows
    cols = ordered[0].Columns
    if any(item.Rows != rows or item.Columns != cols for item in ordered):
        raise ValueError("All DICOM slices must share the same rows and columns")
    volume = np.stack([item.pixel_array for item in ordered], axis=0)
    affine = dicom_affine(ordered, slice_spacing)
    spacing = [
        float(ordered[0].PixelSpacing[0]),
        float(ordered[0].PixelSpacing[1]),
        float(slice_spacing),
    ]
    study_date = dicom_date(getattr(ordered[0], "StudyDate", None))
    return volume, affine, spacing, study_date
