import os
import sys
from pathlib import Path
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
import fast_simplification

ROOT = Path("/home/zhichun/Documents/medical-platform")
PUBLIC_MODELS = ROOT / "public/models"
DIST_MODELS = ROOT / "dist/models"
PUBLIC_MODELS.mkdir(parents=True, exist_ok=True)
DIST_MODELS.mkdir(parents=True, exist_ok=True)

UPSTREAM_NAV = Path("/tmp/upstream_nav.glb")
HIGHRES_SPLEEN = ROOT / "backend/tests/output_fmrc/highres_surface.glb"

print("=" * 70)
print("  构建完整人体全解剖高精度导航模型 (Full-Body 3D Digital Human Atlas)")
print("=" * 70)

if not UPSTREAM_NAV.is_file():
    print(f"Error: {UPSTREAM_NAV} not found!")
    sys.exit(1)

nav_orig = trimesh.load(str(UPSTREAM_NAV))
scene = trimesh.Scene()

# 1. Body Shell (Full body translucent silhouette from head to feet)
shell = nav_orig.geometry["body_shell"].copy()
mat_shell = PBRMaterial(
    name="body_shell",
    baseColorFactor=[145/255, 185/255, 175/255, 0.20],
    roughnessFactor=0.25,
    metallicFactor=0.0,
    alphaMode="BLEND",
    doubleSided=True
)
shell.visual = trimesh.visual.TextureVisuals(material=mat_shell)
scene.add_geometry(shell, node_name="body_shell", geom_name="body_shell")
print(f"[+] 1. body_shell: {len(shell.vertices)} 顶点, 完整全身 Y: [{shell.bounds[0][1]:.2f}, {shell.bounds[1][1]:.2f}]")

# 2. Brain (Full neural anatomy)
brain = nav_orig.geometry["brain"].copy()
mat_brain = PBRMaterial(
    name="brain",
    baseColorFactor=[210/255, 160/255, 145/255, 1.0],
    roughnessFactor=0.45,
    metallicFactor=0.02,
    alphaMode="OPAQUE",
    doubleSided=True
)
brain.visual = trimesh.visual.TextureVisuals(material=mat_brain)
scene.add_geometry(brain, node_name="brain", geom_name="brain")
print(f"[+] 2. brain: {len(brain.vertices)} 顶点, 头部 Y: [{brain.bounds[0][1]:.2f}, {brain.bounds[1][1]:.2f}]")

# 3. Eyes (Sclera, Iris, Pupil)
eye_colors = {
    "sclera": [240/255, 240/255, 235/255, 1.0],
    "iris": [70/255, 130/255, 120/255, 1.0],
    "pupil": [30/255, 45/255, 40/255, 1.0]
}
for name, geom in nav_orig.geometry.items():
    if name.startswith("eye_"):
        eye_part = geom.copy()
        part_type = name.split("_")[-1]
        col = eye_colors.get(part_type, [200/255, 200/255, 200/255, 1.0])
        mat_eye = PBRMaterial(name=name, baseColorFactor=col, roughnessFactor=0.3, metallicFactor=0.0, alphaMode="OPAQUE", doubleSided=True)
        eye_part.visual = trimesh.visual.TextureVisuals(material=mat_eye)
        scene.add_geometry(eye_part, node_name=name, geom_name=name)
print(f"[+] 3. eyes: 6 个眼球精细部件已挂载")

# 4. Spine (Complete spinal column from cervical to sacral)
spine = nav_orig.geometry["spine"].copy()
spine_sub = spine.subdivide()
trimesh.smoothing.filter_taubin(spine_sub, iterations=8)
mat_spine = PBRMaterial(
    name="spine",
    baseColorFactor=[235/255, 230/255, 218/255, 1.0],
    roughnessFactor=0.55,
    metallicFactor=0.02,
    alphaMode="OPAQUE",
    doubleSided=True
)
spine_sub.visual = trimesh.visual.TextureVisuals(material=mat_spine)
scene.add_geometry(spine_sub, node_name="spine", geom_name="spine")
print(f"[+] 4. spine: {len(spine_sub.vertices)} 顶点, 完整脊柱颈胸腰椎 Y: [{spine_sub.bounds[0][1]:.2f}, {spine_sub.bounds[1][1]:.2f}]")

# 5. Lungs (Bilateral aerated pulmonary lobes)
lung = nav_orig.geometry["lung"].copy()
lung_sub = lung.subdivide()
trimesh.smoothing.filter_taubin(lung_sub, iterations=10)
mat_lung = PBRMaterial(
    name="lung",
    baseColorFactor=[135/255, 180/255, 205/255, 1.0],
    roughnessFactor=0.40,
    metallicFactor=0.02,
    alphaMode="OPAQUE",
    doubleSided=True
)
lung_sub.visual = trimesh.visual.TextureVisuals(material=mat_lung)
scene.add_geometry(lung_sub, node_name="lung", geom_name="lung")
print(f"[+] 5. lung: {len(lung_sub.vertices)} 顶点, 胸腔双肺 Y: [{lung_sub.bounds[0][1]:.2f}, {lung_sub.bounds[1][1]:.2f}]")

# 6. Heart (Myocardium & cardiac chamber)
heart = nav_orig.geometry["heart"].copy()
heart_sub = heart.subdivide().subdivide()
trimesh.smoothing.filter_taubin(heart_sub, iterations=12)
mat_heart = PBRMaterial(
    name="heart",
    baseColorFactor=[195/255, 45/255, 55/255, 1.0],
    roughnessFactor=0.35,
    metallicFactor=0.05,
    alphaMode="OPAQUE",
    doubleSided=True
)
heart_sub.visual = trimesh.visual.TextureVisuals(material=mat_heart)
scene.add_geometry(heart_sub, node_name="heart", geom_name="heart")
print(f"[+] 6. heart: {len(heart_sub.vertices)} 顶点, 心脏大血管 Y: [{heart_sub.bounds[0][1]:.2f}, {heart_sub.bounds[1][1]:.2f}]")

# 7. Liver (Hepatic parenchyma)
liver = nav_orig.geometry["liver"].copy()
liver_sub = liver.subdivide().subdivide()
trimesh.smoothing.filter_taubin(liver_sub, iterations=12)
mat_liver = PBRMaterial(
    name="liver",
    baseColorFactor=[175/255, 75/255, 65/255, 1.0],
    roughnessFactor=0.38,
    metallicFactor=0.04,
    alphaMode="OPAQUE",
    doubleSided=True
)
liver_sub.visual = trimesh.visual.TextureVisuals(material=mat_liver)
scene.add_geometry(liver_sub, node_name="liver", geom_name="liver")
print(f"[+] 7. liver: {len(liver_sub.vertices)} 顶点, 肝实质 Y: [{liver_sub.bounds[0][1]:.2f}, {liver_sub.bounds[1][1]:.2f}]")

# 8. Kidneys (Bilateral renal parenchyma)
kidney = nav_orig.geometry["kidney"].copy()
kidney_sub = kidney.subdivide().subdivide()
trimesh.smoothing.filter_taubin(kidney_sub, iterations=12)
mat_kidney = PBRMaterial(
    name="kidney",
    baseColorFactor=[160/255, 45/255, 45/255, 1.0],
    roughnessFactor=0.36,
    metallicFactor=0.04,
    alphaMode="OPAQUE",
    doubleSided=True
)
kidney_sub.visual = trimesh.visual.TextureVisuals(material=mat_kidney)
scene.add_geometry(kidney_sub, node_name="kidney", geom_name="kidney")
print(f"[+] 8. kidney: {len(kidney_sub.vertices)} 顶点, 双肾 Y: [{kidney_sub.bounds[0][1]:.2f}, {kidney_sub.bounds[1][1]:.2f}]")

# 9. Stomach (Gastric volume)
stomach = nav_orig.geometry["stomach"].copy()
stomach_sub = stomach.subdivide().subdivide()
trimesh.smoothing.filter_taubin(stomach_sub, iterations=12)
mat_stomach = PBRMaterial(
    name="stomach",
    baseColorFactor=[215/255, 145/255, 115/255, 1.0],
    roughnessFactor=0.40,
    metallicFactor=0.02,
    alphaMode="OPAQUE",
    doubleSided=True
)
stomach_sub.visual = trimesh.visual.TextureVisuals(material=mat_stomach)
scene.add_geometry(stomach_sub, node_name="stomach", geom_name="stomach")
print(f"[+] 9. stomach: {len(stomach_sub.vertices)} 顶点, 胃囊 Y: [{stomach_sub.bounds[0][1]:.2f}, {stomach_sub.bounds[1][1]:.2f}]")

# 10. Pancreas (Pancreatic parenchyma)
pancreas = nav_orig.geometry["pancreas"].copy()
pancreas_sub = pancreas.subdivide().subdivide()
trimesh.smoothing.filter_taubin(pancreas_sub, iterations=12)
mat_pancreas = PBRMaterial(
    name="pancreas",
    baseColorFactor=[235/255, 185/255, 80/255, 1.0],
    roughnessFactor=0.42,
    metallicFactor=0.03,
    alphaMode="OPAQUE",
    doubleSided=True
)
pancreas_sub.visual = trimesh.visual.TextureVisuals(material=mat_pancreas)
scene.add_geometry(pancreas_sub, node_name="pancreas", geom_name="pancreas")
print(f"[+] 10. pancreas: {len(pancreas_sub.vertices)} 顶点, 胰腺 Y: [{pancreas_sub.bounds[0][1]:.2f}, {pancreas_sub.bounds[1][1]:.2f}]")

# 11. Spleen: INJECT TRUE 0.75mm FMRC HIGH-RESOLUTION ORGANIC MESH!
spleen_high = trimesh.load(str(HIGHRES_SPLEEN), force="mesh")
spleen_orig = nav_orig.geometry["spleen"]
c_nav = spleen_orig.centroid
ext_nav = spleen_orig.extents
c_high = spleen_high.centroid
ext_high = spleen_high.extents

spleen_fitted = spleen_high.copy()
spleen_fitted.vertices -= c_high
# Scale along major anatomical axis
scale = ext_nav[1] / ext_high[2]
spleen_fitted.vertices *= scale
spleen_fitted.vertices += c_nav

# Simplify slightly for 60fps browser navigation while keeping 22,000 smooth vertices
if len(spleen_fitted.faces) > 40000:
    spleen_verts, spleen_faces = fast_simplification.simplify(
        spleen_fitted.vertices, spleen_fitted.faces, target_reduction=0.65
    )
    spleen_nav_mesh = trimesh.Trimesh(vertices=spleen_verts, faces=spleen_faces, process=True)
else:
    spleen_nav_mesh = spleen_fitted

trimesh.smoothing.filter_taubin(spleen_nav_mesh, iterations=4)
mat_spleen = PBRMaterial(
    name="spleen",
    baseColorFactor=[145/255, 55/255, 115/255, 1.0],
    roughnessFactor=0.35,
    metallicFactor=0.04,
    alphaMode="OPAQUE",
    doubleSided=True
)
spleen_nav_mesh.visual = trimesh.visual.TextureVisuals(material=mat_spleen)
scene.add_geometry(spleen_nav_mesh, node_name="spleen", geom_name="spleen")
print(f"[+] 11. spleen: {len(spleen_nav_mesh.vertices)} 顶点 (来源于 0.75mm FMRC 连续场重构!), Y: [{spleen_nav_mesh.bounds[0][1]:.2f}, {spleen_nav_mesh.bounds[1][1]:.2f}]")

# Export to both public and dist
out_public = PUBLIC_MODELS / "anatomy-navigation.glb"
out_dist = DIST_MODELS / "anatomy-navigation.glb"
scene.export(str(out_public), file_type="glb")
scene.export(str(out_dist), file_type="glb")

print("=" * 70)
print(f"[+] 成功导出全解剖数字人图谱到:")
print(f"    - {out_public} ({out_public.stat().st_size / (1024*1024):.2f} MB)")
print(f"    - {out_dist} ({out_dist.stat().st_size / (1024*1024):.2f} MB)")
print("=" * 70)
