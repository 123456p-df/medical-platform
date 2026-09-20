"""
NV-Segment-CTMR Adapter using the official 1.5mm inference scale
================================================================
Pure 1-Stage Global Anatomy Inference (CT and MRI modalities)
- Official 1.5mm isotropic model spacing for full anatomical context
- Configurable Sliding Window (default roi_size=(192, 192, 128), overlap=0.3)
- CPU-buffered accumulator (Zero CUDA OOM)
- Narrow-band Signed Distance Field (SDF) continuous zero-crossing (level=0.0)
- Watertight 2-manifold Lewiner Marching Cubes in unit space
- Single-shot model-grid affine to Patient RAS and glTF 2.0 (meter, Y-Up)
- Linear RGB gamma-corrected PBR materials
"""

import copy
import importlib
import logging
import sys
import time
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

try:
    from monai.apps.vista3d.transforms import VistaPostTransformd
    from monai.data.utils import decollate_batch
    from monai.transforms import Invertd
except ImportError:
    decollate_batch = None
    Invertd = None
    VistaPostTransformd = None
from app.config import Settings
from app.services.geometry_engine import (
    extract_subvoxel_surface_from_mask,
    largest_connected_component_voxels,
)
from app.services.imaging import refine_boundary_native_grid
from app.services.label_catalog import LabelCatalog, keep_detected_label
from app.services.nv_runtime import (
    apply_non_cuda_torch_patches,
    load_vista3d_inner_weights,
    resolve_nv_segment_device,
    wrap_pipeline_for_device,
)
from app.services.organ_metrics import assert_body_label_map_sane

logger = logging.getLogger(__name__)

# Prompt IDs and grouped anatomical parts from the upstream model metadata.
LABELS_BY_TYPE = {
    "CT": {
        "liver": [1],
        "kidney": [5, 14],
        "spleen": [3],
        "pancreas": [4],
        "stomach": [12],
        "lung": [28, 29, 30, 31, 32],
        "brain": [22],
        "heart": [115],
    },
    "MRI": {
        "liver": [1],
        "kidney": [5, 14],
        "spleen": [3],
        "pancreas": [4],
        "stomach": [12],
        "lung": [135, 136],
        "brain": [22],
        "heart": [115],
    },
}
LABELS = LABELS_BY_TYPE["CT"]


def labels_for(organ_id: str, image_type: str = "CT") -> list[int]:
    table = LABELS_BY_TYPE.get(image_type, LABELS_BY_TYPE["CT"])
    if organ_id not in table:
        raise KeyError(organ_id)
    return table[organ_id]


class NVSegmentCT:
    image_types = {"CT", "MRI"}

    def __init__(self, settings: Settings):
        self.settings = settings
        self.pipeline = None
        self._inverse_prediction = None
        self.catalog = LabelCatalog(settings.nv_segment_ct_dir)

    def available(self) -> bool:
        folder = self.settings.nv_segment_ct_dir
        return bool(
            folder
            and torch is not None
            and decollate_batch is not None
            and Invertd is not None
            and VistaPostTransformd is not None
            and (folder / "vista3d_config.py").is_file()
            and (folder / "vista3d_model.py").is_file()
            and (folder / "vista3d_pipeline.py").is_file()
            and (folder / "vista3d_pretrained_model" / "model.pt").is_file()
        )

    def _ensure_pipelines(self):
        if self.pipeline is None:
            if not self.available():
                raise RuntimeError(
                    "NV-Segment-CTMR model files or runtime dependencies are unavailable"
                )
            folder = self.settings.nv_segment_ct_dir.resolve()
            if str(folder) not in sys.path:
                sys.path.insert(0, str(folder))
            config_cls = importlib.import_module("vista3d_config").VISTA3DConfig
            model_cls = importlib.import_module("vista3d_model").VISTA3DModel
            pipeline_cls = importlib.import_module("vista3d_pipeline").VISTA3DPipeline
            apply_non_cuda_torch_patches()
            device_name = resolve_nv_segment_device(self.settings.nv_segment_device)
            init_device = torch.device(device_name)

            logger.info(
                "Initializing NV-Segment-CTMR pipeline (device=%s, spacing=%s, roi=%s, overlap=%s, sw_batch=%s)",
                device_name,
                self.settings.nv_segment_spacing,
                self.settings.nv_segment_roi_size,
                self.settings.nv_segment_overlap,
                self.settings.nv_segment_sw_batch_size,
            )
            weights_dir = folder / "vista3d_pretrained_model"
            # The published checkpoint uses inner network keys. Loading it through
            # HuggingFace first reads the entire file but discards every tensor due
            # to the missing ``network.`` prefix. Construct directly and load once.
            model = model_cls(config_cls())
            loaded = load_vista3d_inner_weights(model, weights_dir)
            pipeline = pipeline_cls(
                model,
                resample_spacing=self.settings.nv_segment_spacing,
                roi_size=self.settings.nv_segment_roi_size,
                overlap=self.settings.nv_segment_overlap,
                sw_batch_size=self.settings.nv_segment_sw_batch_size,
                device=init_device,
            )
            logger.info("Loaded %s VISTA3D tensors in one checkpoint pass", loaded)
            self.pipeline = wrap_pipeline_for_device(pipeline, device_name)
            self._inverse_prediction = Invertd(
                keys="pred",
                transform=copy.deepcopy(pipeline.preprocessing_transforms),
                orig_keys="image",
                nearest_interp=True,
                to_tensor=True,
            )
            self._resolved_device = device_name

    @staticmethod
    def _tensors_to_cpu(record):
        return {
            key: value.detach().cpu() if torch is not None and torch.is_tensor(value) else value
            for key, value in record.items()
        }

    @staticmethod
    def _discretize_prediction(record):
        """Vectorized equivalent of VISTA's per-class full-volume remapping."""
        pred = record.get("pred")
        prompt = record.get("label_prompt")
        points = record.get("points")
        if not torch.is_tensor(pred) or not torch.is_tensor(prompt) or points is not None:
            return VistaPostTransformd(keys="pred")(record)

        object_count = pred.shape[0]
        prompt_lut = prompt.reshape(-1)
        if len(prompt_lut) != object_count:
            return VistaPostTransformd(keys="pred")(record)

        positive = pred.clamp_min_(0)
        background = torch.all(positive <= 0, dim=0)
        class_indexes = positive.argmax(dim=0)
        mapped = prompt_lut.to(pred.device)[class_indexes].to(pred.dtype).unsqueeze(0)
        mapped.masked_fill_(background.unsqueeze(0), 0)
        if object_count == 1:
            mapped.masked_fill_(torch.isnan(pred), float("nan"))
        record["pred"] = mapped
        return record

    def _postprocess_prediction(self, outputs):
        """Discretize once on-device, then invert the compact label map on CPU."""
        with torch.inference_mode():
            decol_data = decollate_batch(outputs)[0]
            try:
                post_res = self._discretize_prediction(decol_data)
            except RuntimeError:
                # Some MPS releases lack an indexing kernel used by VistaPostTransformd.
                post_res = self._discretize_prediction(self._tensors_to_cpu(decol_data))

            label_map = np.asarray(post_res["pred"].detach().cpu().numpy()).squeeze()
            if label_map.ndim != 3:
                raise ValueError(f"Expected a 3D all-label prediction, got shape {label_map.shape}")

            if self._inverse_prediction is None:
                raise RuntimeError("NV-Segment inverse transform is not initialized")
            native_record = self._inverse_prediction(self._tensors_to_cpu(post_res))
            native_tensor = torch.nan_to_num(native_record["pred"], nan=255).detach().cpu()
            native_map = np.asarray(native_tensor.numpy()).squeeze()
            if native_map.ndim != 3:
                raise ValueError(f"Expected a native 3D prediction, got shape {native_map.shape}")
            return label_map, native_map

    def run_batch(
        self,
        *,
        image_path: Path,
        output_dir: Path,
        progress,
        modality="CT_BODY",
        **_kwargs,
    ):
        """Run one modality-aware all-label inference and persist one shared label map."""
        self._ensure_pipelines()
        if not hasattr(self.pipeline, "preprocess"):
            raise RuntimeError("All-label batch mode requires the modern NVIDIA pipeline")

        output_dir.mkdir(exist_ok=True, parents=True)
        started = time.perf_counter()
        native_img = nib.load(str(image_path))
        prep = self.pipeline.preprocess({"image": str(image_path), "modality": modality})
        model_affine = prep["image"].affine[0].cpu().numpy()
        preprocess_s = time.perf_counter() - started
        progress(25)
        forward_started = time.perf_counter()
        outputs = self.pipeline._forward(prep)
        forward_s = time.perf_counter() - forward_started
        progress(60)
        post_started = time.perf_counter()
        label_map, native_values = self._postprocess_prediction(outputs)
        postprocess_s = time.perf_counter() - post_started
        assert_body_label_map_sane(label_map, modality=modality)

        max_label = int(label_map.max()) if label_map.size else 0
        dtype = np.uint8 if max_label <= np.iinfo(np.uint8).max else np.uint16
        label_map = np.rint(label_map).astype(dtype, copy=False)
        min_voxels = self.settings.segmentation_min_component_voxels
        recognized = []
        counts = np.bincount(label_map.ravel())
        label_bounds = ndi.find_objects(label_map)
        for label, count in enumerate(counts):
            if not keep_detected_label(label, int(count), min_voxels):
                continue
            # A high total voxel count can be made entirely of repeated sliding-
            # window islands. Require one anatomically coherent component.
            bounds = label_bounds[label - 1] if label <= len(label_bounds) else None
            if bounds is None:
                continue
            if largest_connected_component_voxels(label_map[bounds] == label) >= min_voxels:
                recognized.append(label)
        label_map_path = output_dir / "label_map_1mm.nii.gz"
        one_header = native_img.header.copy()
        one_header.set_data_dtype(dtype)
        nib.save(nib.Nifti1Image(label_map, model_affine, one_header), str(label_map_path))

        native_path = output_dir / "label_map_native.nii.gz"
        native_values = np.rint(native_values).astype(dtype, copy=False)
        native_affine = native_img.affine
        native_header = native_img.header.copy()
        native_header.set_data_dtype(dtype)
        nib.save(nib.Nifti1Image(native_values, native_affine, native_header), str(native_path))
        logger.info(
            "NV-Segment batch timings preprocess=%.2fs forward=%.2fs postprocess=%.2fs total=%.2fs",
            preprocess_s,
            forward_s,
            postprocess_s,
            time.perf_counter() - started,
        )
        progress(100)
        return {
            "label_map_1mm": label_map_path,
            "label_map_native": native_path,
            "labels": recognized,
        }

    def __call__(
        self,
        *,
        image_path: Path,
        organ_id: str,
        output_dir: Path,
        progress,
        image_type="CT",
        **_kwargs,
    ):
        self._ensure_pipelines()
        labels = labels_for(organ_id, image_type)

        if not hasattr(self.pipeline, "preprocess"):
            raw_dir = output_dir / "raw"
            raw_dir.mkdir(exist_ok=True, parents=True)
            progress(20)
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
            from app.services.imaging import load_volume

            prediction, values = load_volume(outputs[0], self.settings)
            mask = np.isin(values, labels).astype(np.uint8)
            path = output_dir / "mask.nii.gz"
            header = prediction.header.copy()
            header.set_data_dtype(np.uint8)
            nib.save(nib.Nifti1Image(mask, prediction.affine, header), path)
            return path

        progress(15)

        native_img = nib.load(str(image_path))
        native_shape = native_img.shape
        voxel_spacing = native_img.header.get_zooms()[:3]

        # 1. Preprocess at the official model spacing.
        logger.info(
            f"[Pure 1-Stage] Preprocessing {image_path.name} for {organ_id} (labels {labels})..."
        )
        prep = self.pipeline.preprocess({"image": str(image_path), "label_prompt": labels})
        model_affine = prep["image"].affine[0].cpu().numpy()
        progress(35)

        # 2. Global sliding-window forward pass using configured device and memory budget.
        logger.info(
            "[Pure 1-Stage] Running %s mm inference on %s (roi=%s, overlap=%s)...",
            self.settings.nv_segment_spacing,
            getattr(self, "_resolved_device", self.settings.nv_segment_device),
            self.settings.nv_segment_roi_size,
            self.settings.nv_segment_overlap,
        )
        outputs = self.pipeline._forward(prep)
        progress(70)

        # 3. Postprocess multi-class field on the model grid.
        pred_labels, native_labels = self._postprocess_prediction(outputs)
        model_mask = np.isin(pred_labels, labels)

        if not np.any(model_mask):
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

        bone_keywords = [
            "vertebra",
            "rib",
            "sternum",
            "clavicle",
            "scapula",
            "pelvis",
            "femur",
            "humerus",
            "spine",
            "bone",
        ]
        is_bone = any(kw in organ_id.lower() for kw in bone_keywords)
        sdf_sigma = 0.6 if is_bone else 1.2

        try:
            mesh, meta = extract_subvoxel_surface_from_mask(
                mask=model_mask,
                affine=model_affine,
                target_faces=target_faces,
                organ_id=safe_name,
                min_component_voxels=30,
                smooth_iterations=0,
                sdf_sigma=sdf_sigma,
            )
            highres_glb = output_dir / "highres_surface.glb"
            mesh.export(str(highres_glb), file_type="glb")
            logger.info(
                f"[Pure 1-Stage] Successfully generated model-grid SDF GLB "
                f"({meta['vertices']} verts, {meta['faces']} faces, vol={meta['volume_cm3']:.1f} cm3) at {highres_glb}"
            )
        except Exception as e:
            logger.error(f"[Pure 1-Stage] Surface mesh extraction error: {e}", exc_info=True)

        progress(85)

        # 5. Invert to Native Grid for 2D DICOM viewer
        logger.info("[Pure 1-Stage] Inverting prediction to native grid for 2D slice viewer...")
        inverted_mask = np.isin(native_labels, labels)

        # Native boundary refinement
        native_data = native_img.get_fdata(dtype=np.float32)
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
        nib.save(
            nib.Nifti1Image(refined_mask.astype(np.uint8), native_img.affine, header), str(out_path)
        )

        progress(100)
        logger.info(f"[Pure 1-Stage Complete] Generated high-definition mask at {out_path}")
        return out_path
