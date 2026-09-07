import gzip
import io
import math
from pathlib import Path

import nibabel as nib
import numpy as np
import trimesh
from PIL import Image
from skimage.measure import marching_cubes

from app.config import Settings
from app.errors import APIError


def load_volume(path: Path, settings: Settings):
    """Validate before decoding. A compressed upload cannot bypass the memory limit."""
    try:
        if path.name.endswith(".gz"):
            total = 0
            with gzip.open(path, "rb") as stream:
                while block := stream.read(1024 * 1024):
                    total += len(block)
                    if total > settings.max_uncompressed_bytes:
                        raise APIError(413, 41302, "Uncompressed image exceeds limit")
        elif path.stat().st_size > settings.max_uncompressed_bytes:
            raise APIError(413, 41302, "Uncompressed image exceeds limit")
        image = nib.load(path)
        if not isinstance(image, (nib.Nifti1Image, nib.Nifti2Image)) or len(image.shape) != 3:
            raise ValueError("Expected a 3D NIfTI volume")
        if min(image.shape) < 2 or math.prod(image.shape) > settings.max_volume_voxels:
            raise APIError(413, 41303, "Volume dimensions exceed supported limits")
        if image.get_data_dtype().kind not in "iuf":
            raise ValueError("Expected real scalar voxels")
        if (
            math.prod(image.shape) * image.get_data_dtype().itemsize
            > settings.max_uncompressed_bytes
        ):
            raise APIError(413, 41302, "Decoded image exceeds limit")
        if not np.isfinite(image.affine).all() or abs(np.linalg.det(image.affine[:3, :3])) < 1e-12:
            raise ValueError("Invalid spatial transform")
        if not np.isfinite(image.header.get_zooms()).all() or min(image.header.get_zooms()) <= 0:
            raise ValueError("Invalid voxel spacing")
        # Read all voxels once to detect truncated files; do not persist this array in memory.
        data = image.get_fdata(dtype=np.float32)
        if not np.isfinite(data).all():
            raise ValueError("Non-finite voxels")
        return image, data
    except APIError:
        raise
    except Exception:
        raise APIError(400, 40002, "Invalid or unsupported 3D NIfTI image") from None


def slice_png(path: Path, index: int, settings: Settings, window_center=None, window_width=None):
    volume, data = load_volume(path, settings)
    # Canonical RAS axes: slice index always follows inferior -> superior.
    canonical = nib.as_closest_canonical(nib.Nifti1Image(data, volume.affine))
    if index < 0 or index >= canonical.shape[2]:
        raise APIError(404, 40405, "Slice index out of range")
    plane = np.asarray(canonical.dataobj[:, :, index], dtype=np.float32)
    if (window_center is None) != (window_width is None):
        raise APIError(400, 40003, "window_center and window_width must be provided together")
    if window_width is not None:
        if not math.isfinite(window_width) or window_width <= 0 or not math.isfinite(window_center):
            raise APIError(400, 40003, "Invalid window parameters")
        low, high = window_center - window_width / 2, window_center + window_width / 2
    else:
        low, high = np.percentile(plane, [1, 99])
    pixels = np.zeros(plane.shape, dtype=np.uint8)
    if high > low:
        pixels = (np.clip((plane - low) / (high - low), 0, 1) * 255).astype(np.uint8)
    # Anterior at top, patient right on the viewer's left; no text overlays containing PHI.
    pixels = np.flip(pixels.T, axis=(0, 1))
    buffer = io.BytesIO()
    Image.fromarray(pixels).save(buffer, format="PNG")
    return buffer.getvalue()


def mask_to_glb(mask_path: Path, image_path: Path, output_path: Path, settings: Settings):
    mask_image, data = load_volume(mask_path, settings)
    source = nib.load(image_path)
    if mask_image.shape != source.shape or not np.allclose(
        mask_image.affine, source.affine, atol=1e-3
    ):
        raise ValueError("Mask must be in the input image voxel space")
    if not np.isin(data, [0, 1]).all() or not np.any(data == 1):
        raise ValueError("Adapter must return a nonempty binary mask")
    # Padding closes surfaces that touch a volume edge; remove padding in voxel coordinates.
    vertices, faces, _, _ = marching_cubes(np.pad(data, 1), level=0.5)
    vertices = nib.affines.apply_affine(mask_image.affine, vertices - 1)
    unit = source.header.get_xyzt_units()[0]
    scales = {"meter": 1.0, "mm": 0.001, "micron": 0.000001, "unknown": 0.001}
    vertices *= scales[unit]
    # NIfTI RAS -> glTF right-handed Y-up, preserving the patient-world origin.
    vertices = vertices[:, [0, 2, 1]] * [1, 1, -1]
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=True)
    mesh.fix_normals()
    mesh.visual.vertex_colors = [99, 166, 225, 255]
    scene = trimesh.Scene(mesh)
    scene.metadata.update(
        {
            "units": "meters",
            "coordinates": "RAS to glTF: x,z,-y",
            "source_spatial_unit": unit,
            "unknown_unit_assumption": "mm",
        }
    )
    scene.export(output_path, file_type="glb")
