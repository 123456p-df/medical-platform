"""MRI sequence detection and NV-Segment-CTMR modality routing."""

from __future__ import annotations

from pathlib import Path

SEQUENCES = ("T1", "T2", "FLAIR", "DWI", "other", "unknown")
MODES = ("CT_BODY", "MRI_BODY", "MRI_BRAIN")
_FLAIR = ("FLAIR", "T2FLAIR", "T2-FLAIR")
_DWI = ("DWI", "DIFFUSION", "DIFF", "ADC")
_T1 = ("T1W", "T1-W", "T1WI", "MPRAGE", "SPGR", "BRAVO", "T1")
_T2 = ("T2W", "T2-W", "T2WI", "T2")
_CONTRAST = ("GD", "GAD", "CONTRAST", "+C", "CE-", "C+", "增强")


def _norm(value) -> str:
    return str(value or "").upper().replace(" ", "").replace("_", "-")


def detect_sequence_from_text(*parts: str) -> tuple[str, bool | None]:
    blob = " ".join(_norm(part) for part in parts if part)
    hits: list[str] = []
    if any(token in blob for token in _FLAIR):
        hits.append("FLAIR")
    if any(token in blob for token in _DWI):
        hits.append("DWI")
    if any(token in blob for token in _T1) and "T1" not in hits:
        # Avoid matching T10 / T12 vertebra-style tokens by requiring T1 as a unit.
        if any(token in blob for token in ("T1W", "T1-W", "T1WI", "MPRAGE", "SPGR", "BRAVO")) or "T1" in blob.split(
            "-"
        ) or blob.endswith("T1") or "-T1" in blob or "T1-" in blob:
            hits.append("T1")
    if any(token in blob for token in ("T2W", "T2-W", "T2WI")) or (
        "T2" in blob and "T2FLAIR" not in blob and "FLAIR" not in hits
    ):
        if "T2" not in hits:
            hits.append("T2")
    unique = list(dict.fromkeys(hits))
    if len(unique) == 1:
        sequence = unique[0]
    elif not unique:
        sequence = "unknown"
    else:
        sequence = "unknown"
    contrast = True if any(token in blob for token in _CONTRAST) else None
    return sequence, contrast


def detect_from_nifti(path: Path, volume=None, original_name: str | None = None) -> dict:
    name = original_name or path.name
    descrip = ""
    db_name = ""
    if volume is not None:
        header = volume.header
        for key in ("descrip", "db_name"):
            value = header.get(key, b"")
            if isinstance(value, bytes):
                value = value.decode("utf-8", "ignore").strip("\x00 ").strip()
            if key == "descrip":
                descrip = str(value or "")
            else:
                db_name = str(value or "")
    sidecar = None
    for candidate in (path.with_suffix(".json"), Path(str(path).replace(".nii.gz", ".json"))):
        if candidate.is_file():
            sidecar = candidate
            break
    sidecar_text = ""
    if sidecar:
        try:
            sidecar_text = sidecar.read_text(encoding="utf-8")
        except OSError:
            sidecar_text = ""
    sequence, contrast = detect_sequence_from_text(name, descrip, db_name, sidecar_text)
    return {
        "sequence": sequence,
        "contrast": contrast,
        "series_description": descrip or None,
        "source": "nifti",
    }


def detect_from_dicom_tags(tags: dict) -> dict:
    image_type = _norm(tags.get("image_type") or "")
    sequence, contrast = detect_sequence_from_text(
        tags.get("series_description") or "",
        tags.get("protocol_name") or "",
        tags.get("sequence_name") or "",
        image_type,
        tags.get("scanning_sequence") or "",
    )
    if "DIFFUSION" in image_type:
        sequence = "DWI"
    if tags.get("contrast_agent"):
        contrast = True
    tr = tags.get("repetition_time")
    te = tags.get("echo_time")
    if sequence == "unknown" and isinstance(tr, (int, float)) and isinstance(te, (int, float)):
        if tr < 1000 and te < 30:
            sequence = "T1"
        elif tr >= 2000 and te >= 80:
            sequence = "T2"
    return {
        "sequence": sequence,
        "contrast": contrast,
        "series_description": tags.get("series_description"),
        "echo_time_ms": tags.get("echo_time"),
        "repetition_time_ms": tags.get("repetition_time"),
        "source": "dicom",
    }


def suggested_mode(image_type: str, organ_id: str, sequence: str | None) -> str:
    if image_type == "CT":
        return "CT_BODY"
    if organ_id == "brain" and sequence == "T1":
        return "MRI_BRAIN"
    return "MRI_BODY"


def resolve_segmentation_mode(image) -> str:
    stored = (getattr(image, "segmentation_mode", None) or "").strip()
    if stored in MODES:
        return stored
    return suggested_mode(image.image_type, image.organ_id, getattr(image, "sequence", None))


def mode_warning(image) -> str | None:
    mode = resolve_segmentation_mode(image)
    if image.image_type != "MRI":
        return None
    if image.organ_id == "brain" and (image.sequence or "unknown") != "T1" and mode != "MRI_BRAIN":
        return "精细脑区分割需要去颅后的 T1；当前按全身 MRI_BODY 分割整脑。"
    return None
