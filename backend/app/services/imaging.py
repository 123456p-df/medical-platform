import gzip
import io
import math
import os
import shutil
import tempfile
from collections import OrderedDict
from pathlib import Path
from threading import RLock

import nibabel as nib
import numpy as np
import scipy.ndimage as ndi
import trimesh
from PIL import Image
from skimage.measure import marching_cubes
from skimage.segmentation import random_walker

from app.config import Settings
from app.errors import APIError

ORGAN_COLORS = {
    "liver": [180, 82, 82, 255],
    "spleen": [140, 60, 110, 255],
    "pancreas": [230, 180, 80, 255],
    "kidney": [160, 40, 40, 255],
    "gallbladder": [60, 160, 70, 255],
    "stomach": [210, 140, 100, 255],
    "duodenum": [200, 160, 120, 255],
    "colon": [190, 130, 90, 255],
    "lung": [120, 180, 200, 255],
    "heart": [190, 40, 50, 255],
    "brain": [220, 180, 190, 255],
    "aorta": [220, 30, 30, 255],
}


def get_organ_color(organ_id: str):
    lower = (organ_id or "").lower()
    for key, col in ORGAN_COLORS.items():
        if key in lower:
            return col
    return [99, 166, 225, 255]


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


def _header_text(header, key: str) -> str:
    value = header.get(key, b"")
    if isinstance(value, bytes):
        return value.decode("utf-8", "ignore").strip("\x00 ").strip()
    return str(value or "").strip()


def acquisition_from_volume(volume, data) -> dict:
    canonical = nib.as_closest_canonical(nib.Nifti1Image(data, volume.affine))
    shape = [int(size) for size in canonical.shape[:3]]
    spacing = [float(value) for value in canonical.header.get_zooms()[:3]]
    device = _header_text(volume.header, "descrip") or _header_text(volume.header, "db_name") or None
    return {
        "shape": shape,
        "spacing_mm": spacing,
        "fov_mm": [shape[index] * spacing[index] for index in range(3)],
        "orientation": "RAS",
        "affine": [[float(value) for value in row] for row in canonical.affine.tolist()],
        "device": device,
    }


def label_cache_path(path: Path):
    return path.with_name(path.name + ".labels.npy")


def prepare_label_cache(path: Path, settings: Settings):
    image, data = load_volume(path, settings)
    labels = np.rint(data).astype(np.uint16, copy=False)
    canonical = nib.as_closest_canonical(nib.Nifti1Image(labels, image.affine))
    target = label_cache_path(path)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=path.parent, prefix=".labels-", suffix=".tmp", delete=False
        ) as output:
            temporary = Path(output.name)
            np.save(output, np.asarray(canonical.dataobj, dtype=np.uint16), allow_pickle=False)
        os.replace(temporary, target)
    finally:
        if temporary:
            temporary.unlink(missing_ok=True)
    return target


def canonical_labels(path: Path, settings: Settings):
    target = label_cache_path(path)
    source_mtime = path.stat().st_mtime_ns
    if not target.is_file() or target.stat().st_mtime_ns < source_mtime:
        prepare_label_cache(path, settings)
    labels = np.load(target, mmap_mode="r", allow_pickle=False)
    if labels.dtype != np.uint16 or labels.ndim != 3:
        prepare_label_cache(path, settings)
        labels = np.load(target, mmap_mode="r", allow_pickle=False)
    return labels


def label_slice_plane(path: Path, index: int, settings: Settings, axis="axial"):
    labels = canonical_labels(path, settings)
    axes = {"axial": 2, "coronal": 1, "sagittal": 0}
    if axis not in axes:
        raise APIError(400, 40003, "Invalid slice axis")
    if index < 0 or index >= labels.shape[axes[axis]]:
        raise APIError(404, 40405, "Slice index out of range")
    selector = [slice(None)] * 3
    selector[axes[axis]] = index
    plane = np.asarray(labels[tuple(selector)])
    return np.flip(plane.T, axis=(0, 1))


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
    pixels = np.flip(pixels.T, axis=(0, 1))
    buffer = io.BytesIO()
    Image.fromarray(pixels).save(buffer, format="PNG")
    return buffer.getvalue()


def refine_boundary_native_grid(
    binary_mask: np.ndarray,
    ct_data: np.ndarray,
    organ_id: str,
    spacing: tuple,
    band_mm: float = 4.0,
) -> np.ndarray:
    if not np.any(binary_mask):
        return binary_mask

    struct = ndi.generate_binary_structure(3, 1)
    rx = max(1, int(round(band_mm / max(spacing[0], 0.1))))
    ry = max(1, int(round(band_mm / max(spacing[1], 0.1))))
    iter_cnt = max(1, int(round((rx + ry) / 2)))

    dilated = ndi.binary_dilation(binary_mask, structure=struct, iterations=iter_cnt)
    eroded = ndi.binary_erosion(binary_mask, structure=struct, iterations=iter_cnt)
    narrow_band = dilated & ~eroded

    if not np.any(narrow_band) or not np.any(eroded):
        return binary_mask

    high_contrast_organs = {"lung", "bone", "vertebrae", "rib", "aorta", "heart"}
    is_high_contrast = any(k in organ_id.lower() for k in high_contrast_organs)

    if is_high_contrast:
        slices = ndi.find_objects(dilated)[0]
        sub_ct = ct_data[slices]
        sub_dilated = dilated[slices]
        sub_eroded = eroded[slices]
        sub_band = narrow_band[slices]

        ct_min, ct_max = (
            np.percentile(sub_ct[sub_dilated], [1, 99])
            if np.any(sub_dilated)
            else (sub_ct.min(), sub_ct.max())
        )
        if ct_max > ct_min:
            norm_ct = np.clip((sub_ct - ct_min) / (ct_max - ct_min), 0.0, 1.0)
        else:
            norm_ct = np.zeros_like(sub_ct, dtype=np.float32)

        markers = np.zeros(sub_ct.shape, dtype=np.int32)
        markers[sub_eroded] = 1
        markers[~sub_dilated] = 2

        try:
            rw_labels = random_walker(norm_ct, markers, beta=25.0, mode="cg_j", tol=1e-3)
            refined_sub = rw_labels == 1
            refined_mask = binary_mask.copy()
            refined_mask[slices][sub_band] = refined_sub[sub_band]
            return refined_mask.astype(np.uint8)
        except Exception:
            return binary_mask.astype(np.uint8)
    else:
        labeled, num_features = ndi.label(binary_mask)
        if num_features > 1:
            sizes = ndi.sum(binary_mask, labeled, range(1, num_features + 1))
            main_label = np.argmax(sizes) + 1
            cleaned_mask = labeled == main_label
        else:
            cleaned_mask = binary_mask.copy()

        smoothed = ndi.binary_closing(cleaned_mask, structure=struct, iterations=1)
        smoothed = ndi.binary_opening(smoothed, structure=struct, iterations=1)
        return smoothed.astype(np.uint8)


def mask_to_glb(
    mask_path: Path, image_path: Path, output_path: Path, settings: Settings, organ_id: str = ""
):
    mask_image, data = load_volume(mask_path, settings)
    source = nib.load(image_path)
    if mask_image.shape != source.shape or not np.allclose(
        mask_image.affine, source.affine, atol=1e-3
    ):
        raise ValueError("Mask must be in the input image voxel space")
    if not np.isin(data, [0, 1]).all() or not np.any(data == 1):
        raise ValueError("Adapter must return a nonempty binary mask")

    # If high-resolution continuous surface mesh was precomputed by FMRC adapter, preserve it!
    highres_glb = mask_path.parent / "highres_surface.glb"
    if highres_glb.is_file() and highres_glb.stat().st_size > 1024:
        shutil.copyfile(highres_glb, output_path)
        return

    vertices, faces, _, _ = marching_cubes(np.pad(data, 1), level=0.5)
    vertices = nib.affines.apply_affine(mask_image.affine, vertices - 1)
    unit = source.header.get_xyzt_units()[0]
    scales = {"meter": 1.0, "mm": 0.001, "micron": 0.000001, "unknown": 0.001}
    vertices *= scales[unit]
    vertices = vertices[:, [0, 2, 1]] * [1, 1, -1]
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=True)

    if len(mesh.vertices) > 40:
        try:
            trimesh.smoothing.filter_taubin(mesh, iterations=8)
        except Exception:
            pass

    mesh.fix_normals()
    mesh.visual.vertex_colors = get_organ_color(organ_id)
    scene = trimesh.Scene(mesh)
    scene.metadata.update(
        {
            "units": "meters",
            "coordinates": "RAS to glTF: x,z,-y",
            "source_spatial_unit": unit,
            "unknown_unit_assumption": "mm",
            "organ_id": organ_id,
        }
    )
    scene.export(output_path, file_type="glb")
