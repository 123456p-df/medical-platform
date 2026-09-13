"""Optional skull-stripping backend for MRI_BRAIN (NVIDIA requires stripped T1)."""

from __future__ import annotations

import logging
import shutil
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)


class SynthStrip:
    def __init__(self, command: str | None = None):
        self.command = command or shutil.which("mri_synthstrip")

    def available(self) -> bool:
        return bool(self.command)

    def __call__(self, image_path: Path, output_path: Path) -> Path:
        if not self.command:
            raise RuntimeError("SynthStrip is not installed")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        result = subprocess.run(
            [self.command, "-i", str(image_path), "-o", str(output_path)],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0 or not output_path.is_file():
            logger.error("SynthStrip failed with status %s", result.returncode)
            raise RuntimeError("Skull stripping failed")
        return output_path
