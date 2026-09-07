"""Inference-only wrapper of NVIDIA's unchanged local Hugging Face pipeline.

Official source: https://huggingface.co/nvidia/NV-Segment-CT
Download the repository separately. No weights are downloaded during API requests.
"""

import importlib
import sys
from pathlib import Path

import nibabel as nib
import numpy as np

from app.config import Settings

# Prompt IDs and grouped anatomical parts from the upstream model metadata.
LABELS = {
    "liver": [1],
    "kidney": [5, 14],
    "spleen": [3],
    "pancreas": [4],
    "stomach": [12],
    "lung": [28, 29, 30, 31, 32],
    "brain": [22],
    "heart": [115],
}


class NVSegmentCT:
    image_types = {"CT"}

    def __init__(self, settings: Settings):
        self.settings = settings
        self.pipeline = None

    def available(self) -> bool:
        folder = self.settings.nv_segment_ct_dir
        return bool(
            folder
            and (folder / "hugging_face_pipeline.py").is_file()
            and (folder / "vista3d_pretrained_model").is_dir()
        )

    def __call__(self, *, image_path: Path, organ_id: str, output_dir: Path, progress):
        # The job runner serializes calls, so the cached pipeline is never used concurrently.
        if self.pipeline is None:
            folder = self.settings.nv_segment_ct_dir.resolve()
            if str(folder) not in sys.path:
                sys.path.insert(0, str(folder))
            torch = importlib.import_module("torch")
            helper = importlib.import_module("hugging_face_pipeline").HuggingFacePipelineHelper
            self.pipeline = helper("vista3d").init_pipeline(
                str(folder / "vista3d_pretrained_model"),
                device=torch.device(self.settings.nv_segment_device),
            )
        progress(20)
        raw_dir = output_dir / "raw"
        raw_dir.mkdir(exist_ok=True)
        labels = LABELS[organ_id]
        self.pipeline(
            {"image": str(image_path), "label_prompt": labels},
            output_dir=str(raw_dir),
            output_postfix="seg",
            separate_folder=False,
        )
        progress(75)
        outputs = list(raw_dir.rglob("*.nii.gz")) + list(raw_dir.rglob("*.nii"))
        if len(outputs) != 1:
            raise ValueError("Expected one NIfTI prediction from NVIDIA pipeline")
        prediction, values = self._read_prediction(outputs[0])
        # VistaPostTransformd emits global class IDs, not channel indices. Never include 255
        # (the upstream unknown/NaN sentinel) in the foreground mask.
        mask = np.isin(values, labels).astype(np.uint8)
        path = output_dir / "mask.nii.gz"
        header = prediction.header.copy()
        header.set_data_dtype(np.uint8)
        nib.save(nib.Nifti1Image(mask, prediction.affine, header), path)
        return path

    def _read_prediction(self, path):
        from app.services.imaging import load_volume

        return load_volume(path, self.settings)
