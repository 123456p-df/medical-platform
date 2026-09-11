from pathlib import Path

from app.config import Settings
from app.errors import APIError


def patient_directory(patient_id: int) -> str:
    if not isinstance(patient_id, int) or patient_id <= 0:
        raise APIError(500, 50002, "Invalid patient storage identifier")
    return f"patient/{patient_id}"


def report_relative_path(patient_id: int, record_id: int, revision: int, digest: str) -> str:
    return (
        f"{patient_directory(patient_id)}/report/{record_id}/"
        f"{revision:06d}-{digest[:12]}.md"
    )


def imaging_relative_path(patient_id: int, image_id: str, extension: str) -> str:
    return f"{patient_directory(patient_id)}/imaging/{image_id}{extension}"


def segmentation_relative_path(patient_id: int, image_id: str, task_id: str) -> str:
    return f"{patient_directory(patient_id)}/segmentation/{image_id}/{task_id}"


def profile_relative_path(user_id: int, identifier: str) -> str:
    return f"account/{user_id}/profile/{identifier}"


def stored_path(settings: Settings, relative_path: str) -> Path:
    root = settings.storage_root.resolve()
    path = (root / relative_path).resolve()
    if not path.is_relative_to(root) or path == root:
        raise APIError(500, 50002, "Invalid stored resource path")
    return path


def relative_path(settings: Settings, path: Path) -> str:
    return path.resolve().relative_to(settings.storage_root.resolve()).as_posix()
