from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any, Optional

import numpy as np

REF_SPACING_MM = (1.0, 1.0, 5.0)
TARGET_SIZE = (96, 256, 384)
HU_MIN = -1000.0
HU_MAX = 1000.0

TEMPLATE_FINGERPRINTS = ("4.2mm", "LU-RADS 2")


def default_search_roots() -> list[Path]:
    project = Path(__file__).resolve().parent.parent.parent
    roots = [
        Path.cwd(),
        project,
        project / ".cache" / "preview" / "medical-data",
        project / "backend" / "data",
    ]
    for key in ("STORAGE_ROOT", "RADSIGHT_STORAGE_ROOT"):
        raw = os.environ.get(key)
        if raw:
            roots.append(Path(raw).expanduser())
    return roots


def resolve_volume_path(file_path: str, search_roots: Optional[list[Path]] = None) -> Path:
    resolved = Path(file_path).expanduser()
    if resolved.exists():
        return resolved.resolve()
    name = resolved.name
    roots = search_roots if search_roots is not None else default_search_roots()
    candidates: list[Path] = []
    for root in roots:
        candidates.extend(
            [
                root / file_path,
                root / name,
                root / "medical-images" / name,
            ]
        )
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    raise FileNotFoundError(f"CT volume file not found: {file_path}")


def inspect_nifti_volume(file_path: str, search_roots: Optional[list[Path]] = None) -> dict[str, Any]:
    import nibabel as nib

    resolved_path = resolve_volume_path(file_path, search_roots=search_roots)
    img = nib.load(str(resolved_path))
    data = img.get_fdata(dtype=np.float32)
    header = img.header
    zooms = [float(z) for z in header.get_zooms()[:3]]
    dims = [int(d) for d in data.shape]
    min_hu = float(np.min(data))
    max_hu = float(np.max(data))
    mean_hu = float(np.mean(data))
    lung_voxels = int(np.sum((data >= -950) & (data <= -400)))
    soft_tissue_voxels = int(np.sum((data >= 20) & (data <= 80)))
    bone_voxels = int(np.sum(data > 300))
    voxel_volume_ml = (zooms[0] * zooms[1] * zooms[2]) / 1000.0
    return {
        "resolved_path": str(resolved_path),
        "filename": resolved_path.name,
        "dimensions": dims,
        "spacing": zooms,
        "slice_count": dims[2] if len(dims) >= 3 else 1,
        "hu_range": [round(min_hu, 1), round(max_hu, 1)],
        "mean_hu": round(mean_hu, 1),
        "estimated_volumes_ml": {
            "lung_volume_ml": round(lung_voxels * voxel_volume_ml, 2),
            "soft_tissue_ml": round(soft_tissue_voxels * voxel_volume_ml, 2),
            "bone_ml": round(bone_voxels * voxel_volume_ml, 2),
        },
    }


def normalize_hu(volume: np.ndarray, hu_min: float = HU_MIN, hu_max: float = HU_MAX) -> np.ndarray:
    clipped = np.clip(volume.astype(np.float32), hu_min, hu_max)
    return (clipped - hu_min) / (hu_max - hu_min)


def parse_clinical_sections(raw_text: str) -> dict[str, str]:
    text = (raw_text or "").strip()
    if not text:
        return {"findings": "", "impression": "", "recommendations": "", "raw_text": ""}

    patterns = {
        "findings": r"(?:影像征象|所见|Findings)\s*[:：)]*\s*(.*?)(?=(?:诊断|印象|Impression|临床建议|建议|Recommendations)\b|$)",
        "impression": r"(?:诊断鉴别印象|诊断印象|印象|Impression)\s*[:：)]*\s*(.*?)(?=(?:临床建议|建议|Recommendations)\b|$)",
        "recommendations": r"(?:临床建议|建议|Recommendations)\s*[:：)]*\s*(.*)$",
    }
    parsed: dict[str, str] = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
        parsed[key] = match.group(1).strip() if match else ""
    if not parsed["findings"]:
        parsed["findings"] = text
    parsed["raw_text"] = text
    return parsed


def looks_like_stub_template(text: str) -> bool:
    return all(token in (text or "") for token in TEMPLATE_FINGERPRINTS)
