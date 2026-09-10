"""
Build Complete 70-Anatomy Watertight 0.75mm Isotropic Human Atlas
=================================================================
Fixed:
1. Coordinate conversion: RAS -> GLTF (Superior to Y, Anterior to -Z) -> Navigation (torso alignment)
2. PBR Material baseColorFactor normalized to [0.0, 1.0] floats
3. Double-sided watertight solid meshes with zero boundary cutoffs
"""

import json
import time
from pathlib import Path
import numpy as np
import scipy.ndimage as ndi
import nibabel as nib
import trimesh
from trimesh.visual.material import PBRMaterial
from skimage.measure import marching_cubes
import fast_simplification

ROOT = Path("/home/zhichun/Documents/medical-platform")
PUBLIC_MODELS = ROOT / "medical-platform/Medical/public/models"
PUBLIC_MODELS.mkdir(parents=True, exist_ok=True)

MASK_PATH = Path("/home/zhichun/Documents/NV-Segment-CTMR/output_ct_body/spleen_10/spleen_10_seg.nii.gz")
METADATA_PATH = Path("/home/zhichun/Documents/NV-Segment-CTMR/metadata.json")

print("=" * 65)
print("   70+ 全解剖结构 0.75mm 实心封闭 (Watertight) 高清图谱重构")
print("=" * 65)

# 1. Load data
img = nib.load(str(MASK_PATH))
mask_data = img.get_fdata().astype(np.int32)
affine = img.affine
orig_spacing = np.array(img.header.get_zooms()[:3], dtype=np.float32)
target_spacing = np.array([0.75, 0.75, 0.75], dtype=np.float32)
zoom_factors = orig_spacing / target_spacing

meta = json.load(open(str(METADATA_PATH)))
ct_labels = meta["network_data_format"]["everything_labels"]["CT_BODY"]

unique_labels, counts = np.unique(mask_data, return_counts=True)
label_counts = dict(zip(unique_labels, counts))
valid_labels = [l for l in unique_labels if l > 0 and label_counts[l] >= 30]

print(f"[*] 载入影像数据: 形状={mask_data.shape}, 原始分辨率={orig_spacing}")
print(f"[*] 目标重构分辨率: 0.75mm 等间隔各向同性, 缩放比={np.round(zoom_factors, 2)}")
print(f"[*] 有效解剖结构子项数: {len(valid_labels)} 个")

# 2. Color and Category Palette (Classic Medical Atlas, Normalized RGBA Floats)
COLOR_PALETTE = {
    # Skeletal (Ivory Bone White)
    "bone": ([235/255, 230/255, 218/255, 1.0], 0.65, "OPAQUE"),
    "cartilage": ([185/255, 220/255, 230/255, 0.90], 0.35, "BLEND"),
    "spinal_cord": ([245/255, 235/255, 175/255, 1.0], 0.50, "OPAQUE"),
    # Cardiovascular (Arteries: Bright Red, Veins: Blue, Heart: Myocardium)
    "artery": ([225/255, 45/255, 45/255, 1.0], 0.32, "OPAQUE"),
    "aorta": ([230/255, 40/255, 40/255, 1.0], 0.32, "OPAQUE"),
    "vein": ([35/255, 125/255, 225/255, 1.0], 0.32, "OPAQUE"),
    "heart": ([190/255, 45/255, 55/255, 1.0], 0.35, "OPAQUE"),
    "atrial": ([200/255, 55/255, 65/255, 1.0], 0.35, "OPAQUE"),
    # Respiratory (Aerated Pulmonary Blue-Cyan)
    "lung": ([135/255, 180/255, 200/255, 1.0], 0.50, "OPAQUE"),
    # Digestive (Visceral Natural)
    "liver": ([170/255, 75/255, 65/255, 1.0], 0.38, "OPAQUE"),
    "spleen": ([140/255, 55/255, 110/255, 1.0], 0.35, "OPAQUE"),
    "pancreas": ([230/255, 180/255, 80/255, 1.0], 0.45, "OPAQUE"),
    "gallbladder": ([55/255, 160/255, 75/255, 1.0], 0.28, "OPAQUE"),
    "stomach": ([210/255, 142/255, 115/255, 1.0], 0.42, "OPAQUE"),
    "duodenum": ([200/255, 155/255, 112/255, 1.0], 0.42, "OPAQUE"),
    "small_bowel": ([215/255, 150/255, 118/255, 1.0], 0.42, "OPAQUE"),
    "colon": ([190/255, 132/255, 98/255, 1.0], 0.45, "OPAQUE"),
    "esophagus": ([190/255, 140/255, 150/255, 1.0], 0.42, "OPAQUE"),
    # Urinary & Endocrine
    "kidney": ([155/255, 42/255, 42/255, 1.0], 0.35, "OPAQUE"),
    "adrenal": ([240/255, 195/255, 50/255, 1.0], 0.42, "OPAQUE"),
    "cyst": ([210/255, 225/255, 180/255, 0.85], 0.28, "BLEND"),
    # Muscular (Deep Red Muscle, Semi-transparent)
    "muscle": ([165/255, 68/255, 68/255, 0.55], 0.60, "BLEND"),
}

def get_style_for_label(raw_name: str):
    name = raw_name.lower().replace(" ", "_")
    category = "other"
    style = COLOR_PALETTE["bone"]
    
    if any(k in name for k in ["rib", "vertebrae", "sternum", "scapula", "hip", "femur", "bone"]):
        category = "skeletal"
        style = COLOR_PALETTE["bone"]
    elif "cartilage" in name:
        category = "skeletal"
        style = COLOR_PALETTE["cartilage"]
    elif "spinal_cord" in name:
        category = "skeletal"
        style = COLOR_PALETTE["spinal_cord"]
    elif any(k in name for k in ["aorta", "subclavian", "iliac", "artery"]):
        category = "cardiovascular"
        style = COLOR_PALETTE["aorta"] if "aorta" in name else COLOR_PALETTE["artery"]
    elif any(k in name for k in ["vena_cava", "vein", "portal"]):
        category = "cardiovascular"
        style = COLOR_PALETTE["vein"]
    elif "heart" in name or "atrial" in name:
        category = "cardiovascular"
        style = COLOR_PALETTE["heart"]
    elif "lung" in name or "trachea" in name:
        category = "respiratory"
        style = COLOR_PALETTE["lung"]
    elif any(k in name for k in ["liver", "spleen", "pancreas", "gallbladder", "stomach", "duodenum", "bowel", "colon", "esophagus"]):
        category = "digestive"
        for k in ["liver", "spleen", "pancreas", "gallbladder", "stomach", "duodenum", "small_bowel", "colon", "esophagus"]:
            if k in name:
                style = COLOR_PALETTE[k]
                break
    elif "kidney" in name or "adrenal" in name or "cyst" in name:
        category = "urinary_endocrine"
        if "cyst" in name:
            style = COLOR_PALETTE["cyst"]
        elif "adrenal" in name:
            style = COLOR_PALETTE["adrenal"]
        else:
            style = COLOR_PALETTE["kidney"]
    elif any(k in name for k in ["autochthon", "iliopsoas", "gluteus", "muscle"]):
        category = "muscular"
        style = COLOR_PALETTE["muscle"]
        
    return category, style

scene = trimesh.Scene()
nav_orig = trimesh.load(PUBLIC_MODELS / "anatomy-navigation.glb")

# Preserve head and body shell
if "body_shell" in nav_orig.geometry:
    shell = nav_orig.geometry["body_shell"].copy()
    mat = PBRMaterial(name="body_shell", baseColorFactor=[145/255, 185/255, 175/255, 0.22], roughnessFactor=0.22,
                      metallicFactor=0.0, alphaMode="BLEND", doubleSided=True)
    shell.visual = trimesh.visual.TextureVisuals(material=mat)
    scene.add_geometry(shell, node_name="body_shell", geom_name="body_shell")

if "brain" in nav_orig.geometry:
    brain = nav_orig.geometry["brain"].copy()
    mat = PBRMaterial(name="brain", baseColorFactor=[197/255, 153/255, 135/255, 1.0], roughnessFactor=0.55,
                      metallicFactor=0.0, alphaMode="OPAQUE", doubleSided=True)
    brain.visual = trimesh.visual.TextureVisuals(material=mat)
    scene.add_geometry(brain, node_name="brain", geom_name="brain")

for name, geom in nav_orig.geometry.items():
    if name.startswith("eye_"):
        scene.add_geometry(geom.copy(), node_name=name, geom_name=name)

print("[*] 开始全量 70 个解剖结构 0.75mm 亚体素重构 (已修正三维坐标系与 PBR 材质)...")
t_start = time.time()
processed_count = 0
total_vertices = 0
total_faces = 0

for label_id in valid_labels:
    raw_name = ct_labels.get(str(label_id), f"label_{label_id}")
    safe_name = raw_name.replace(" ", "_").replace("/", "_")
    category, (color, roughness, alpha_mode) = get_style_for_label(raw_name)
    
    mask = (mask_data == label_id).astype(np.int32)
    bbox = ndi.find_objects(mask)[0]
    if bbox is None:
        continue
        
    sl = [slice(max(0, s.start - 2), min(dim, s.stop + 2)) for s, dim in zip(bbox, mask_data.shape)]
    starts = [s.start for s in sl]
    cropped = mask[tuple(sl)]
    
    # 3D Morphological hole fill to ensure internal solidness
    filled = ndi.binary_fill_holes(cropped > 0)
    
    # 0.75mm Isotropic Resampling
    resampled = ndi.zoom(filled.astype(np.float32), zoom_factors, order=1)
    
    # 6-directional zero-padding ensures 100% Watertight sealed caps across CT boundaries
    padded = np.pad(resampled, 2, mode="constant", constant_values=0)
    
    # Sub-voxel Gaussian field smoothing (sigma=0.8)
    smoothed = ndi.gaussian_filter(padded, sigma=0.8)
    
    try:
        verts, faces, normals, _ = marching_cubes(smoothed, level=0.5, spacing=target_spacing)
    except Exception as e:
        print(f"  [!] Marching cubes error on {safe_name}: {e}")
        continue
        
    if len(verts) == 0:
        continue
        
    # Map back from padded 0.75mm grid to original voxel space
    vx = (verts[:, 0] / target_spacing[0] - 2.0) / zoom_factors[0] + starts[0]
    vy = (verts[:, 1] / target_spacing[1] - 2.0) / zoom_factors[1] + starts[1]
    vz = (verts[:, 2] / target_spacing[2] - 2.0) / zoom_factors[2] + starts[2]
    
    # Map to Patient RAS (mm)
    pts = np.column_stack([vx, vy, vz, np.ones(len(verts))])
    ras = (affine @ pts.T).T[:, :3]
    
    # Correct coordinate transformation:
    # RAS: X is Right, Y is Anterior, Z is Superior (Head)
    # GLTF: X is Right, Y is Superior (Up), Z is -Anterior (Front is +Z in navigation)
    vx_gltf = ras[:, 0]
    vy_gltf = ras[:, 2]   # Superior is UP!
    vz_gltf = -ras[:, 1]  # Anterior is -Z!
    
    # Map to Digital Human Navigation meter coordinates inside body_shell
    x_nav = -(vx_gltf - (-267.4)) * 0.001
    y_nav = (vy_gltf - 130.0) * 0.001 + 0.60
    z_nav = -(vz_gltf - 280.0) * 0.001
    nav_verts = np.column_stack([x_nav, y_nav, z_nav])
    
    # Simplify mesh to maintain smooth 60 FPS in browser
    if category in ["digestive", "respiratory", "cardiovascular"] and len(faces) > 20000:
        target_f = 16000
    elif category == "skeletal" and len(faces) > 10000:
        target_f = 8000
    elif category == "muscular" and len(faces) > 12000:
        target_f = 10000
    else:
        target_f = max(3000, int(len(faces) * 0.6))
        
    if len(faces) > target_f:
        reduction = 1.0 - (target_f / len(faces))
        try:
            nav_verts, faces = fast_simplification.simplify(nav_verts, faces, target_reduction=reduction)
        except Exception:
            pass
            
    mesh = trimesh.Trimesh(vertices=nav_verts, faces=faces, process=True)
    mesh.fix_normals()
    trimesh.smoothing.filter_taubin(mesh, iterations=6)
    
    # Standard PBR Material with Normalized Float Colors
    mat = PBRMaterial(
        name=safe_name,
        baseColorFactor=color,
        roughnessFactor=roughness,
        metallicFactor=0.0,
        alphaMode=alpha_mode,
        doubleSided=True
    )
    mesh.visual = trimesh.visual.TextureVisuals(material=mat)
    mesh.metadata["category"] = category
    mesh.metadata["label_id"] = int(label_id)
    mesh.metadata["display_name"] = raw_name
    
    scene.add_geometry(mesh, node_name=safe_name, geom_name=safe_name)
    processed_count += 1
    total_vertices += len(mesh.vertices)
    total_faces += len(mesh.faces)
    
    if processed_count % 10 == 0 or processed_count == len(valid_labels):
        print(f"  [{processed_count:2d}/{len(valid_labels)}] {safe_name:28s} ({category}) | 面数: {len(mesh.faces):6d}")

out_nav = PUBLIC_MODELS / "anatomy-navigation.glb"
scene.metadata.update({
    "generator": "scripts/build-full-70-atlas.py",
    "source": "70-Anatomy 0.75mm Watertight Clinical CT Reconstruction",
    "units": "meters",
    "items_count": processed_count,
})
scene.export(str(out_nav))
size_mb = out_nav.stat().st_size / (1024 * 1024)

print("=" * 65)
print(f"[+] 🎉 70 项全解剖大图谱重构完成！耗时: {time.time() - t_start:.2f} 秒")
print(f"[+] 总体素点/面数: {total_vertices:,} 顶点, {total_faces:,} 三角面")
print(f"[+] 生成导航模型: {out_nav} ({size_mb:.2f} MB)")
print("=" * 65)

# 4. Export Standalone 0.75mm Watertight Single Organ Models
single_organs = {
    "liver": ["liver"],
    "spleen": ["spleen"],
    "pancreas": ["pancreas"],
    "stomach": ["stomach"],
    "heart": ["heart"],
    "kidney": ["left_kidney", "right_kidney"],
    "lung": ["left_lung_upper_lobe", "left_lung_lower_lobe", "right_lung_upper_lobe", "right_lung_middle_lobe", "right_lung_lower_lobe"],
}

print("[*] 导出 7 大独立高清器官 GLB 模型 (用于 OrganModelViewer)...")
for organ_id, keys in single_organs.items():
    submeshes = [scene.geometry[k] for k in keys if k in scene.geometry]
    if not submeshes:
        continue
    combined = trimesh.util.concatenate(submeshes) if len(submeshes) > 1 else submeshes[0].copy()
    v = combined.vertices.copy()
    center = (v.min(axis=0) + v.max(axis=0)) / 2.0
    v_centered = v - center
    single_mesh = trimesh.Trimesh(vertices=v_centered, faces=combined.faces.copy(), process=True)
    single_mesh.fix_normals()
    single_mesh.visual = combined.visual.copy()
    out_single = PUBLIC_MODELS / f"organ-{organ_id}.glb"
    single_mesh.export(str(out_single))
    print(f"  [+] 独立器官: {out_single.name:18s} ({out_single.stat().st_size / 1024:.1f} KB)")
