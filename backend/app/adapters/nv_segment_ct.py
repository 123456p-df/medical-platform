"""
NV-Segment-CTMR Adapter with Pure 1-Stage Native 1.0mm Isotropic Architecture
=============================================================================
Pure 1-Stage Global Anatomy Inference (modality="CT_BODY")
- Native 1.0mm Isotropic Spacing (1.0, 1.0, 1.0) mm
- Native 0.5 Sliding Window Overlap (roi_size=(288, 288, 192), gaussian blending)
- CPU-buffered accumulator (Zero CUDA OOM)
- Narrow-band Signed Distance Field (SDF) continuous zero-crossing (level=0.0)
- Watertight 2-manifold Lewiner Marching Cubes in unit space
- Single-shot 1.0mm Affine to Patient RAS and glTF 2.0 (meter, Y-Up)
- Linear RGB gamma-corrected PBR materials
"""

import importlib
import logging
import shutil
import sys
from pathlib import Path

import nibabel as nib
import numpy as np
import scipy.ndimage as ndi
try:
    import torch
except ImportError:
    torch = None

try:
    import trimesh
except ImportError:
    trimesh = None

from monai.data.utils import decollate_batch
from monai.apps.vista3d.transforms import VistaPostTransformd
from app.config import Settings
from app.services.imaging import get_organ_color, refine_boundary_native_grid
from app.services.geometry_engine import extract_subvoxel_surface_from_mask

logger = logging.getLogger(__name__)

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

    def _ensure_pipelines(self):
        if self.pipeline is None:
            folder = self.settings.nv_segment_ct_dir.resolve()
            if str(folder) not in sys.path:
                sys.path.insert(0, str(folder))
            helper_cls = importlib.import_module("hugging_face_pipeline").HuggingFacePipelineHelper
            device = torch.device(self.settings.nv_segment_device)

            logger.info("Initializing NV-Segment-CTMR Pure 1-Stage Pipeline (1.0mm isotropic, overlap=0.5)...")
            self.pipeline = helper_cls("vista3d").init_pipeline(
                str(folder / "vista3d_pretrained_model"),
                resample_spacing=(1.0, 1.0, 1.0),
                roi_size=(288, 288, 192),
                overlap=0.5,
                device=device,
            )

    def __call__(self, *, image_path: Path, organ_id: str, output_dir: Path, progress):
        self._ensure_pipelines()
        progress(15)

        raw_dir = output_dir / "raw"
        raw_dir.mkdir(exist_ok=True, parents=True)
        labels = LABELS[organ_id]

        native_img = nib.load(str(image_path))
        native_data = native_img.get_fdata(dtype=np.float32)
        native_shape = native_img.shape
        voxel_spacing = native_img.header.get_zooms()[:3]

        # 1. Preprocess to 1.0mm isotropic
        logger.info(f"[Pure 1-Stage] Preprocessing {image_path.name} for {organ_id} (labels {labels})...")
        prep = self.pipeline.preprocess({"image": str(image_path), "label_prompt": labels})
        affine_1mm = prep["image"].affine[0].cpu().numpy()
        progress(35)

        # 2. Global Sliding-Window Forward Pass (overlap=0.5)
        logger.info(f"[Pure 1-Stage] Running 1.0mm global sliding-window inference on RTX 5090...")
        outputs = self.pipeline._forward(prep)
        progress(70)

        # 3. Postprocess multi-class field on 1.0mm grid
        decol_data = decollate_batch(outputs)[0]
        post_res = VistaPostTransformd(keys="pred")(decol_data)
        pred_labels = post_res["pred"][0].cpu().numpy()
        mask_1mm = np.isin(pred_labels, labels)

        if not np.any(mask_1mm):
            logger.warning(f"[Pure 1-Stage] Organ {organ_id} not detected in scan.")
            empty_mask = np.zeros(native_shape, dtype=np.uint8)
            out_path = output_dir / "mask.nii.gz"
            header = native_img.header.copy()
            header.set_data_dtype(np.uint8)
            nib.save(nib.Nifti1Image(empty_mask, native_img.affine, header), str(out_path))
            progress(100)
            return out_path

        # 4. Extract continuous SDF sub-voxel 3D surface mesh
        logger.info(f"[Pure 1-Stage] Extracting SDF sub-voxel 3D surface mesh for {organ_id}...")
        safe_name = organ_id.replace(" ", "_")
        target_faces = 40000 if organ_id in ["liver", "lung"] else 30000

        try:
            mesh, meta = extract_subvoxel_surface_from_mask(
                mask=mask_1mm,
                affine=affine_1mm,
                target_faces=target_faces,
                organ_id=safe_name,
                min_component_voxels=30,
                smooth_iterations=0,
            )
            highres_glb = output_dir / "highres_surface.glb"
            mesh.export(str(highres_glb), file_type="glb")
            logger.info(
                f"[Pure 1-Stage] Successfully generated 1.0mm SDF GLB "
                f"({meta['vertices']} verts, {meta['faces']} faces, vol={meta['volume_cm3']:.1f} cm3) at {highres_glb}"
            )
        except Exception as e:
            logger.error(f"[Pure 1-Stage] Surface mesh extraction error: {e}", exc_info=True)

        progress(85)

        # 5. Invert to Native Grid for 2D DICOM viewer
        logger.info(f"[Pure 1-Stage] Inverting prediction to native grid for 2D slice viewer...")
        post_dir = raw_dir / "post"
        post_dir.mkdir(exist_ok=True)
        self.pipeline.postprocess(outputs, output_dir=str(post_dir), separate_folder=False)

        post_files = list(post_dir.rglob("*.nii.gz")) + list(post_dir.rglob("*.nii"))
        if post_files:
            inverted_nii = nib.load(str(post_files[0]))
            inverted_mask = np.isin(inverted_nii.get_fdata(), labels)
        else:
            inverted_mask = ndi.zoom(
                mask_1mm.astype(float),
                [s_nat / s_1mm for s_nat, s_1mm in zip(native_shape, mask_1mm.shape)],
                order=1,
            ) > 0.5

        # Native boundary refinement
        refined_mask = refine_boundary_native_grid(
            inverted_mask.astype(np.uint8),
            native_data,
            organ_id=organ_id,
            spacing=voxel_spacing,
            band_mm=4.0,
        )
        progress(95)

        out_path = output_dir / "mask.nii.gz"
        header = native_img.header.copy()
        header.set_data_dtype(np.uint8)
        nib.save(nib.Nifti1Image(refined_mask.astype(np.uint8), native_img.affine, header), str(out_path))

        # Cleanup temporary files
        try:
            shutil.rmtree(str(raw_dir))
        except Exception:
            pass

        progress(100)
        logger.info(f"[Pure 1-Stage Complete] Generated high-definition mask at {out_path}")
        return out_path
