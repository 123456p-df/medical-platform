from pathlib import Path

from app.config import Settings
from app.errors import APIError


def stored_path(settings: Settings, relative_path: str) -> Path:
    root = settings.storage_root.resolve()
    path = (root / relative_path).resolve()
    if not path.is_relative_to(root) or path == root:
        raise APIError(500, 50002, "Invalid stored resource path")
    return path


def relative_path(settings: Settings, path: Path) -> str:
    return path.resolve().relative_to(settings.storage_root.resolve()).as_posix()
