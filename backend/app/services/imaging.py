import gzip
import io
import math
import os
import tempfile
from collections import OrderedDict
from pathlib import Path
from threading import RLock

import nibabel as nib
import numpy as np
import trimesh
from PIL import Image
from skimage.measure import marching_cubes

from app.config import Settings
from app.errors import APIError

# The source is retained for inference. A local uncompressed, canonical float32 sidecar is
# prepared on upload and memory-mapped for slicing, including after process restarts.
# The OS only pages in the portions being read; viewports never decompress the source again.
_volume_cache = OrderedDict()
_volume_lock = RLock()
_cache_limit = 256 * 1024 * 1024


def slice_cache_path(path: Path):
    return path.with_name(path.name + ".slices.npy")


def release_volume_cache(root: Path):
    with _volume_lock:
        for key in list(_volume_cache):
            if Path(key[0]).is_relative_to(root.resolve()):
                del _volume_cache[key]


def prepare_slice_cache(path: Path, volume, data):
    canonical = nib.as_closest_canonical(nib.Nifti1Image(data, volume.affine))
    target = slice_cache_path(path)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=path.parent, prefix=".slice-", suffix=".tmp", delete=False
        ) as output:
            temporary = Path(output.name)
            np.save(output, np.asarray(canonical.dataobj, dtype=np.float32), allow_pickle=False)
        os.replace(temporary, target)
    finally:
        if temporary:
            temporary.unlink(missing_ok=True)
    return canonical


def canonical_voxels(path: Path, settings: Settings):
    stat = path.stat()
    key = (
        str(path.resolve()),
        stat.st_mtime_ns,
        stat.st_size,
        settings.max_uncompressed_bytes,
        settings.max_volume_voxels,
    )
    with _volume_lock:
        if key in _volume_cache:
            _volume_cache.move_to_end(key)
            return _volume_cache[key]
        target = slice_cache_path(path)
        voxels = None
        if target.is_file() and target.stat().st_mtime_ns >= stat.st_mtime_ns:
            try:
                voxels = np.load(target, mmap_mode="r", allow_pickle=False)
                if (
                    voxels.dtype != np.float32
                    or voxels.ndim != 3
                    or min(voxels.shape) < 2
                    or voxels.size > settings.max_volume_voxels
                    or voxels.nbytes > settings.max_uncompressed_bytes
                ):
                    voxels = None
            except (OSError, ValueError, EOFError):
                voxels = None
        if voxels is None:
            volume, data = load_volume(path, settings)
            prepare_slice_cache(path, volume, data)
            voxels = np.load(target, mmap_mode="r", allow_pickle=False)
        if voxels.nbytes <= _cache_limit:
            while (
                _volume_cache
                and sum(v.nbytes for v in _volume_cache.values()) + voxels.nbytes > _cache_limit
            ):
                _volume_cache.popitem(last=False)
            _volume_cache[key] = voxels
        return voxels


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
            math.prod(image.shape) * max(4, image.get_data_dtype().itemsize)
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


def slice_png(
    path: Path, index: int, settings: Settings, window_center=None, window_width=None, axis="axial"
):
    # Authorization is checked by the route on every request, including cache hits.
    canonical = canonical_voxels(path, settings)
    axes = {"axial": 2, "coronal": 1, "sagittal": 0}
    if axis not in axes:
        raise APIError(400, 40003, "Invalid slice axis")
    if index < 0 or index >= canonical.shape[axes[axis]]:
        raise APIError(404, 40405, "Slice index out of range")
    selector = [slice(None)] * 3
    selector[axes[axis]] = index
    plane = canonical[tuple(selector)]
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
