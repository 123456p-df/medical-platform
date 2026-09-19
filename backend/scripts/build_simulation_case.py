"""Build browser simulation assets from an NV-Segment-CTMR all-label result.

This is an offline preprocessing command. It reuses the project's segmentation
adapter and geometry engine; no model inference code is duplicated here.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path

import nibabel as nib
import numpy as np
import scipy.ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.adapters.nv_segment_ct import NVSegmentCT  # noqa: E402
from app.services.geometry_engine import (  # noqa: E402
    extract_subvoxel_surface_from_mask,
    get_srgb_for_organ,
)
from app.services.glb import export_mesh_glb  # noqa: E402
from app.services.label_catalog import LabelCatalog  # noqa: E402


@dataclass(slots=True)
class RuntimeSettings:
    nv_segment_ct_dir: Path
    nv_segment_device: str
    nv_segment_roi_size: tuple[int, int, int]
    nv_segment_overlap: float
    segmentation_min_component_voxels: int


def slug(value: str) -> str:
    normalized = "".join(character.lower() if character.isalnum() else "_" for character in value)
    return "_".join(part for part in normalized.split("_") if part) or "structure"


def hex_color(label_name: str) -> str:
    red, green, blue, *_ = get_srgb_for_organ(label_name)
    return f"#{red:02x}{green:02x}{blue:02x}"


def structure_type(group_id: str, label_name: str) -> str:
    value = f"{group_id} {label_name}".lower()
    if any(token in value for token in ("rib", "vertebra", "bone", "skull", "sternum", "sacrum", "femur", "hip")):
        return "bone"
    return "organ"


def largest_body_mask(image: nib.Nifti1Image) -> np.ndarray:
    values = np.asanyarray(image.dataobj, dtype=np.float32)
    mask = values > -500.0
    mask = ndi.binary_closing(mask, iterations=2)
    labels, count = ndi.label(mask)
    if not count:
        raise ValueError("CT body-envelope threshold produced an empty mask")
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    body = labels == int(np.argmax(sizes))
    del labels, values
    return ndi.binary_fill_holes(body)


def export_structure(
    *,
    mask: np.ndarray,
    affine: np.ndarray,
    output_root: Path,
    asset_prefix: str,
    structure_id: str,
    name: str,
    type_name: str,
    label_id: int | None,
    target_faces: int,
    min_voxels: int,
) -> dict:
    mesh, metadata = extract_subvoxel_surface_from_mask(
        mask=mask,
        affine=affine,
        target_faces=target_faces,
        organ_id=name,
        min_component_voxels=min_voxels,
        smooth_iterations=2 if type_name == "body" else 1,
        sdf_sigma=1.2,
    )
    folder = output_root / structure_id
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "visual.glb").write_bytes(export_mesh_glb(mesh))
    deformable = type_name != "bone"
    return {
        "id": structure_id,
        "name": name,
        "labelId": label_id,
        "type": type_name,
        "visualMesh": f"{asset_prefix.rstrip('/')}/{structure_id}/visual.glb",
        "physicsMesh": None,
        "binding": None,
        "deformable": deformable,
        "visible": True,
        "physicsMode": "KINEMATIC" if deformable else "STATIC",
        "material": {
            "color": "#d9ab92" if type_name == "body" else hex_color(name),
            "opacity": 1.0,
            "roughness": 0.62 if type_name == "body" else 0.42,
            "doubleSided": True,
        },
        "metadata": {
            "source": "NV-Segment-CTMR" if label_id is not None else "CT body-envelope threshold",
            "cuttableThicknessMm": 18 if type_name == "body" else 30,
            "faces": int(metadata["faces"]),
            "isWatertight": bool(metadata["is_watertight"]),
            "volumeCm3": float(metadata["volume_cm3"]),
        },
    }


def build(args: argparse.Namespace) -> Path:
    image_path = args.image.resolve()
    model_root = args.model_root.resolve()
    work_dir = args.work_dir.resolve()
    output_root = args.output.resolve()
    work_dir.mkdir(parents=True, exist_ok=True)
    output_root.mkdir(parents=True, exist_ok=True)
    settings = RuntimeSettings(
        nv_segment_ct_dir=model_root,
        nv_segment_device=args.device,
        nv_segment_roi_size=tuple(args.roi),
        nv_segment_overlap=args.overlap,
        segmentation_min_component_voxels=args.min_voxels,
    )
    adapter = NVSegmentCT(settings)  # type: ignore[arg-type]
    label_path = work_dir / "label_map_1mm.nii.gz"
    if not label_path.is_file():
        if not adapter.available():
            raise RuntimeError("NV-Segment-CTMR model/runtime is not available in the selected Python environment")
        result = adapter.run_batch(
            image_path=image_path,
            output_dir=work_dir,
            progress=lambda value: print(f"segmentation={value}%", flush=True),
            modality="CT_BODY",
        )
        label_path = Path(result["label_map_1mm"])

    label_image = nib.load(str(label_path))
    label_values = np.asanyarray(label_image.dataobj)
    labels, counts = np.unique(label_values, return_counts=True)
    catalog = LabelCatalog(model_root)
    detected = [
        (int(label), int(count))
        for label, count in zip(labels, counts, strict=False)
        if int(label) > 0 and int(count) >= args.min_voxels
    ]
    structures: list[dict] = []
    ct_image = nib.load(str(image_path))
    print("meshing=body", flush=True)
    structures.append(export_structure(
        mask=largest_body_mask(ct_image), affine=ct_image.affine, output_root=output_root,
        asset_prefix=args.asset_prefix, structure_id="body", name="Body / Skin", type_name="body",
        label_id=None, target_faces=args.body_faces, min_voxels=args.min_voxels,
    ))
    used_ids = {"body"}
    for index, (label_id, count) in enumerate(detected, start=1):
        description = catalog.describe(label_id)
        base_id = slug(str(description["group_id"] or description["organ_id"]))
        structure_id = base_id if base_id not in used_ids else f"{base_id}_{label_id}"
        used_ids.add(structure_id)
        label_name = str(description["name"])
        type_name = structure_type(str(description["group_id"]), label_name)
        print(f"meshing={index}/{len(detected)} label={label_id} name={label_name} voxels={count}", flush=True)
        try:
            structures.append(export_structure(
                mask=label_values == label_id, affine=label_image.affine, output_root=output_root,
                asset_prefix=args.asset_prefix, structure_id=structure_id,
                name=str(description["display_name"] or label_name), type_name=type_name,
                label_id=label_id, target_faces=args.organ_faces, min_voxels=args.min_voxels,
            ))
        except ValueError as error:
            print(f"skipped label={label_id}: {error}", flush=True)

    manifest = {
        "schemaVersion": "1.0",
        "id": args.case_id,
        "caseId": args.case_id,
        "name": f"NV-Segment-CTMR case {args.case_id}",
        "coordinateSystem": "GLTF_Y_UP",
        "units": "meter",
        "sourceToSimulation": [
            -0.001, 0, 0, 0,
            0, 0, 0.001, 0,
            0, 0.001, 0, 0,
            0, 0, 0, 1,
        ],
        "metadata": {
            "purpose": "research-and-teaching-only",
            "segmentationProvider": "NV-Segment-CTMR",
            "sourceImage": image_path.name,
            "sourceShape": list(ct_image.shape),
            "sourceSpacingMm": [float(value) for value in ct_image.header.get_zooms()[:3]],
            "sourceOrientation": "".join(nib.aff2axcodes(ct_image.affine)),
        },
        "structures": structures,
    }
    manifest_path = output_root / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"manifest={manifest_path} structures={len(structures)}", flush=True)
    return manifest_path


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser()
    command.add_argument("--image", type=Path, required=True)
    command.add_argument("--model-root", type=Path, default=Path(r"D:\NV-Segment-CTMR"))
    command.add_argument("--work-dir", type=Path, required=True)
    command.add_argument("--output", type=Path, required=True)
    command.add_argument("--asset-prefix", default="/simulation/tcga-zf-aa5n")
    command.add_argument("--case-id", default="tcga-zf-aa5n")
    command.add_argument("--device", default="cuda:0")
    command.add_argument("--roi", nargs=3, type=int, default=(192, 192, 128))
    command.add_argument("--overlap", type=float, default=0.3)
    command.add_argument("--min-voxels", type=int, default=5000)
    command.add_argument("--body-faces", type=int, default=60000)
    command.add_argument("--organ-faces", type=int, default=40000)
    return command


if __name__ == "__main__":
    build(parser().parse_args())
