"""
Build high-definition real anatomical atlas from registered CT segmentations.
Replaces synthetic mathematical ellipsoids with authentic human CT geometry.
"""
import json
import time
from pathlib import Path

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

ROOT = Path(__file__).resolve().parents[1]
ORGANS_DIR = Path("/home/zhichun/Downloads/organs_glb")
PUBLIC_MODELS = ROOT / "public/models"
PUBLIC_MODELS.mkdir(parents=True, exist_ok=True)

nav_orig = trimesh.load(PUBLIC_MODELS / "anatomy-navigation.glb")
all_organs = trimesh.load(ORGANS_DIR / "all_organs_combined.glb")

print(f"Loaded all_organs_combined with {len(all_organs.geometry)} components.")

def transform_mesh(mesh):
    v = mesh.vertices.copy()
    x = -(v[:, 0] - (-267.4)) * 0.001
    y = (v[:, 1] - 130.0) * 0.001 + 0.60
    z = -(v[:, 2] - 280.0) * 0.001
    new_mesh = trimesh.Trimesh(vertices=np.column_stack([x, y, z]), faces=mesh.faces.copy(), process=False)
    return new_mesh

def simplify(mesh, target_faces):
    if len(mesh.faces) > target_faces:
        try:
            return mesh.simplify_quadric_decimation(face_count=target_faces)
        except Exception as e:
            print(f"Simplification error: {e}, falling back to original")
    return mesh

scene = trimesh.Scene()

# 1. Add body shell and head structures from navigation model
if "body_shell" in nav_orig.geometry:
    shell = nav_orig.geometry["body_shell"].copy()
    mat = PBRMaterial(name="body_shell", baseColorFactor=[145, 185, 175, 65], roughnessFactor=0.25,
                      metallicFactor=0.0, alphaMode="BLEND", doubleSided=True)
    shell.visual = trimesh.visual.TextureVisuals(material=mat)
    scene.add_geometry(shell, node_name="body_shell", geom_name="body_shell")

if "brain" in nav_orig.geometry:
    brain = nav_orig.geometry["brain"].copy()
    mat = PBRMaterial(name="brain", baseColorFactor=[197, 153, 135, 255], roughnessFactor=0.6,
                      metallicFactor=0.0, alphaMode="OPAQUE")
    brain.visual = trimesh.visual.TextureVisuals(material=mat)
    scene.add_geometry(brain, node_name="brain", geom_name="brain")

for name, geom in nav_orig.geometry.items():
    if name.startswith("eye_"):
        scene.add_geometry(geom.copy(), node_name=name, geom_name=name)

# 2. Extract and simplify real anatomical organs
organ_configs = [
    {
        "name": "liver",
        "keys": ["liver"],
        "color": [165, 70, 65, 255],
        "roughness": 0.45,
        "max_faces": 16000,
    },
    {
        "name": "spleen",
        "keys": ["spleen"],
        "color": [140, 55, 105, 255],
        "roughness": 0.40,
        "max_faces": 12000,
    },
    {
        "name": "pancreas",
        "keys": ["pancreas"],
        "color": [225, 180, 80, 255],
        "roughness": 0.55,
        "max_faces": 8000,
    },
    {
        "name": "stomach",
        "keys": ["stomach"],
        "color": [210, 145, 110, 255],
        "roughness": 0.50,
        "max_faces": 12000,
    },
    {
        "name": "heart",
        "keys": ["heart"],
        "color": [175, 45, 55, 255],
        "roughness": 0.40,
        "max_faces": 12000,
    },
    {
        "name": "gallbladder",
        "keys": ["gallbladder"],
        "color": [60, 160, 70, 255],
        "roughness": 0.35,
        "max_faces": 4000,
    },
    {
        "name": "kidney",
        "keys": ["left_kidney", "right_kidney"],
        "color": [155, 45, 45, 255],
        "roughness": 0.40,
        "max_faces": 16000,
    },
    {
        "name": "lung",
        "keys": [
            "left_lung_upper_lobe", "left_lung_lower_lobe",
            "right_lung_upper_lobe", "right_lung_middle_lobe", "right_lung_lower_lobe"
        ],
        "color": [185, 140, 145, 255],
        "roughness": 0.60,
        "max_faces": 22000,
    },
    {
        "name": "spine",
        "keys": [
            "vertebrae_L5", "vertebrae_L4", "vertebrae_L3", "vertebrae_L2", "vertebrae_L1",
            "vertebrae_T12", "vertebrae_T11", "vertebrae_T10", "vertebrae_T9", "vertebrae_T8", "vertebrae_T7",
            "sternum", "spinal_cord",
            "left_rib_6", "left_rib_7", "left_rib_8", "left_rib_9", "left_rib_10",
            "right_rib_6", "right_rib_7", "right_rib_8", "right_rib_9", "right_rib_10",
        ],
        "color": [225, 222, 205, 255],
        "roughness": 0.70,
        "max_faces": 35000,
    },
]

for cfg in organ_configs:
    submeshes = []
    for k in cfg["keys"]:
        if k in all_organs.geometry:
            submeshes.append(all_organs.geometry[k])
    if not submeshes:
        print(f"Warning: No submeshes found for {cfg['name']}")
        continue

    combined = trimesh.util.concatenate(submeshes) if len(submeshes) > 1 else submeshes[0]
    t_mesh = transform_mesh(combined)
    s_mesh = simplify(t_mesh, cfg["max_faces"])
    s_mesh.fix_normals()
    mat = PBRMaterial(name=cfg["name"], baseColorFactor=cfg["color"], roughnessFactor=cfg["roughness"],
                      metallicFactor=0.0, alphaMode="OPAQUE")
    s_mesh.visual = trimesh.visual.TextureVisuals(material=mat)
    scene.add_geometry(s_mesh, node_name=cfg["name"], geom_name=cfg["name"])
    print(f"Added real organ '{cfg['name']}': {len(s_mesh.vertices)} vertices, {len(s_mesh.faces)} faces")

out_nav = PUBLIC_MODELS / "anatomy-navigation.glb"
scene.metadata.update({
    "generator": "scripts/build-real-anatomy-atlas.py",
    "source": "Clinical CT multi-organ segmentations (FMRC/TotalSegmentator registered)",
    "units": "meters",
})
scene.export(str(out_nav))
print(f"[+] Successfully exported real anatomy navigation model: {out_nav} ({out_nav.stat().st_size / 1024 / 1024:.2f} MB)")

# 3. Export standalone single organ reference models for OrganModelViewer
single_organs = {
    "liver": ["liver"],
    "spleen": ["spleen"],
    "pancreas": ["pancreas"],
    "stomach": ["stomach"],
    "heart": ["heart"],
    "kidney": ["left_kidney", "right_kidney"],
    "lung": ["left_lung_upper_lobe", "left_lung_lower_lobe", "right_lung_upper_lobe", "right_lung_middle_lobe", "right_lung_lower_lobe"],
}

for organ_id, keys in single_organs.items():
    submeshes = [all_organs.geometry[k] for k in keys if k in all_organs.geometry]
    if not submeshes:
        continue
    combined = trimesh.util.concatenate(submeshes) if len(submeshes) > 1 else submeshes[0]
    v = combined.vertices.copy()
    center = v.mean(axis=0)
    v_centered = (v - center) * 0.001
    v_centered = v_centered[:, [0, 2, 1]] * [1, 1, -1]
    single_mesh = trimesh.Trimesh(vertices=v_centered, faces=combined.faces.copy(), process=True)
    single_mesh = simplify(single_mesh, 25000)
    single_mesh.fix_normals()
    out_single = PUBLIC_MODELS / f"organ-{organ_id}.glb"
    single_mesh.export(str(out_single))
    print(f"[+] Exported single organ: {out_single} ({out_single.stat().st_size / 1024:.1f} KB)")
