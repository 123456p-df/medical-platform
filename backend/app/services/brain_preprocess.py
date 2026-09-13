"""Skull-strip and intensity-normalize T1 volumes for MRI_BRAIN."""

from __future__ import annotations

from pathlib import Path

import nibabel as nib
import numpy as np

from app.adapters.synthstrip import SynthStrip


def normalize_foreground(image_path: Path, output_path: Path) -> Path:
    volume = nib.load(str(image_path))
    data = np.asarray(volume.get_fdata(dtype=np.float32))
    mask = data > 0
    if not np.any(mask):
        scaled = np.zeros_like(data, dtype=np.float32)
    else:
        low, high = np.percentile(data[mask], [0.5, 99.5])
        span = max(float(high - low), 1e-6)
        scaled = np.clip((data - low) / span, 0.0, 1.0).astype(np.float32)
    header = volume.header.copy()
    header.set_data_dtype(np.float32)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    nib.save(nib.Nifti1Image(scaled, volume.affine, header), str(output_path))
    return output_path


def preprocess_brain_t1(
    image_path: Path,
    output_dir: Path,
    *,
    already_stripped: bool = False,
    stripper: SynthStrip | None = None,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    stripped = output_dir / "brain_stripped.nii.gz"
    if already_stripped:
        volume = nib.load(str(image_path))
        nib.save(volume, str(stripped))
    else:
        worker = stripper or SynthStrip()
        worker(image_path, stripped)
    return normalize_foreground(stripped, output_dir / "brain_preprocessed.nii.gz")
