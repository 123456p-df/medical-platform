"""Organ volume sanity checks for NV-Segment outputs."""

from __future__ import annotations

import numpy as np

# Adult CT plausibility windows in millilitres (cm^3). Used to catch degenerate masks.
VOLUME_BOUNDS_ML: dict[str, tuple[float, float]] = {
    "liver": (600.0, 2800.0),
    "spleen": (40.0, 450.0),
    "pancreas": (30.0, 180.0),
    "kidney": (80.0, 350.0),
    "lung": (800.0, 4500.0),
    "heart": (200.0, 900.0),
    "stomach": (80.0, 2500.0),
    "brain": (900.0, 1800.0),
    "gallbladder": (10.0, 80.0),
    "bladder": (20.0, 800.0),
    "aorta": (20.0, 400.0),
}


def choose_volume_cm3(metadata: dict | None) -> float | None:
    """Prefer voxel-count volume; mesh volume is kept only when it agrees."""
    if not metadata:
        return None
    voxel = metadata.get("voxel_volume_cm3")
    mesh = metadata.get("volume_cm3")
    voxel_ok = voxel is not None and np.isfinite(voxel) and float(voxel) > 0
    mesh_ok = mesh is not None and np.isfinite(mesh) and float(mesh) > 0
    if voxel_ok and mesh_ok and float(mesh) > 3.0 * float(voxel):
        return float(voxel)
    if voxel_ok:
        return float(voxel)
    if mesh_ok:
        return float(mesh)
    return None


def belongs_to_batch(mask_path: str | None, batch_id: str | None) -> bool:
    if not batch_id:
        return False
    path = mask_path or ""
    return batch_id in path.replace("\\", "/")


def latest_batch_organs(organ_models, batch_id_by_image: dict[str, str | None]):
    """Drop historical organ rows once a newer batch exists for that image."""
    selected = []
    for model in organ_models:
        batch_id = batch_id_by_image.get(model.image_id)
        if not batch_id:
            selected.append(model)
            continue
        if belongs_to_batch(getattr(model, "mask_path", None), batch_id):
            selected.append(model)
    return selected


def volume_status(name: str | None, volume_ml: float | None) -> str:
    if volume_ml is None or not np.isfinite(volume_ml) or volume_ml <= 0:
        return "unknown"
    haystack = (name or "").lower()
    for key, (low, high) in VOLUME_BOUNDS_ML.items():
        if key in haystack:
            return "completed" if low <= float(volume_ml) <= high else "implausible"
    if float(volume_ml) > 20000:
        return "implausible"
    return "completed"


def assert_body_label_map_sane(label_map: np.ndarray, *, modality: str = "CT_BODY") -> None:
    """Reject the all-liver / single-class collapse seen on CPU+CUDA-AMP runs."""
    if label_map.ndim != 3:
        raise ValueError(f"Expected a 3D label map, got shape {label_map.shape}")
    labels, counts = np.unique(label_map, return_counts=True)
    total = int(label_map.size) or 1
    foreground = [
        (int(label), int(count))
        for label, count in zip(labels.tolist(), counts.tolist(), strict=False)
        if int(label) > 0
    ]
    if modality in {"CT_BODY", "MRI_BODY"} and len(foreground) < 3:
        raise RuntimeError(
            "NV-Segment produced a degenerate label map "
            f"({len(foreground)} foreground class(es)); check device/AMP settings"
        )
    for label, count in foreground:
        fraction = count / total
        if fraction >= 0.45:
            raise RuntimeError(
                f"NV-Segment label {label} covers {fraction:.0%} of the FOV; "
                "rejecting collapsed segmentation"
            )
