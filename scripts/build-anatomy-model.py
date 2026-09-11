"""Build the original, schematic anatomy navigation asset (not patient anatomy).

Continuous implicit skin surface, individually selectable organ meshes, no external assets.
Run with the backend Python environment. GLB is shipped with the frontend.
"""
from pathlib import Path

import numpy as np
import trimesh
from scipy.ndimage import gaussian_filter
from skimage.measure import marching_cubes
from trimesh.visual.material import PBRMaterial

OUT = Path(__file__).resolve().parents[1] / "public/models"
scene = trimesh.Scene()
step = 0.012
origin = np.array([-0.85, -1.45, -0.35])
X, Y, Z = np.meshgrid(np.arange(-0.85, 0.85, step), np.arange(-1.45, 1.81, step),
                     np.arange(-0.35, 0.45, step), indexing="ij")


def ellipsoid(center, radii):
    return (np.sqrt(sum(((v-c)/r)**2 for v, c, r in zip((X, Y, Z), center, radii))) - 1) * min(radii)


def union(a, b, smooth=0.045):
    h = np.maximum(smooth - np.abs(a - b), 0) / smooth
    return np.minimum(a, b) - h*h*smooth/4


def surface(name, field, color, alpha=255, mesh_origin=None, mesh_step=None):
    vertices, faces, _, _ = marching_cubes(field.astype(np.float32), 0, spacing=(mesh_step or step,)*3)
    mesh = trimesh.Trimesh(vertices=vertices + (origin if mesh_origin is None else mesh_origin), faces=faces, process=True)
    trimesh.smoothing.filter_taubin(mesh, iterations=5 if name == "brain" else 6)
    mesh.fix_normals()
    material = PBRMaterial(name=name, baseColorFactor=[*color, alpha], roughnessFactor=.86 if name == "brain" else .5,
                           metallicFactor=0, alphaMode="BLEND" if alpha < 255 else "OPAQUE", doubleSided=True)
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    scene.add_geometry(mesh, node_name=name, geom_name=name)
    print(name, len(vertices), "vertices", flush=True)


def merged(shapes, smooth=.04):
    result = ellipsoid(*shapes[0])
    for shape in shapes[1:]:
        result = union(result, ellipsoid(*shape), smooth)
    return result


def build():
    # Sculpted torso, clavicles, jaw, neck, tapered limbs, wrists, palms and fingers.
    skin = [((0,1.46,0),(.155,.225,.16)), ((0,1.30,.032),(.118,.12,.128)),
            ((0,1.405,.146),(.021,.042,.035)),
            ((0,1.14,0),(.078,.15,.085)), ((0,.89,0),(.29,.29,.163)),
            ((0,.65,-.005),(.253,.27,.155)), ((0,.40,0),(.217,.21,.14)),
            ((0,.22,0),(.265,.19,.177))]
    for sign in [-1,1]:
        skin += [((sign*.30,1.00,0),(.126,.12,.115)),
                 ((sign*.38,.85,0),(.095,.23,.098)),
                 ((sign*.45,.64,0),(.073,.13,.08)),
                 ((sign*.485,.47,.025),(.077,.20,.076)),
                 ((sign*.515,.30,.04),(.048,.105,.05)),
                 ((sign*.53,.19,.045),(.067,.098,.033)),
                 ((sign*.145,-.085,0),(.132,.31,.145)),
                 ((sign*.16,-.39,.015),(.083,.135,.095)),
                 ((sign*.165,-.65,-.015),(.097,.25,.10)),
                 ((sign*.165,-.94,.015),(.052,.16,.06)),
                 ((sign*.165,-1.10,.079),(.072,.067,.16))]
        for i in range(4):
            skin.append(((sign*(.49+i*.026),.075-abs(i-1.4)*.012,.05),(.012,.071,.018)))
        skin.append(((sign*.46,.145,.065),(.018,.065,.024)))
    skin_field = merged(skin)
    for sign in [-1, 1]:
        skin_field = np.maximum(skin_field, -ellipsoid((sign*.062,1.438,.16),(.034,.027,.026)))
    surface("body_shell", skin_field, [145,180,165], 70)
    # Soft organ shapes with anatomical silhouettes; bilateral organs share a selectable name.
    lobes = []
    for sign in [-1, 1]:
        normalized_y = (Y - .86) / .225
        width = .113 * np.clip(1 - .34 * normalized_y, .5, 1.5)
        depth = .098 * np.clip(1 - .18 * normalized_y, .6, 1.4)
        lobe = (np.sqrt(((X-sign*.145)/width)**2 + normalized_y**2 + ((Z-.025)/depth)**2)-1)*.098
        lobe = np.maximum(lobe, .655 + .03*np.exp(-((X-sign*.14)/.09)**2) - Y)
        lobes.append(lobe)
    lung = np.minimum(*lobes)
    # Carve the central mediastinal gap and the left cardiac notch.
    lung = np.maximum(lung, -ellipsoid((.055,.735,.118),(.105,.132,.08)))
    surface("lung", lung, [195,132,126])
    # Low, wide cerebral hemispheres, an occipital contour and a separate cerebellum.
    brain_origin = np.array([-.16,1.335,-.17])
    brain_step = .0025
    bx, by, bz = np.meshgrid(np.arange(-.16,.16,brain_step), np.arange(1.335,1.64,brain_step),
                            np.arange(-.17,.14,brain_step), indexing="ij")
    brain = (np.sqrt((bx/.137)**2 + ((by-1.511)/.107)**2 + ((bz+.015)/.128)**2)-1)*.107
    # Smooth seeded level sets form irregular, branching sulci instead of repeated stripes.
    rng = np.random.default_rng(42)
    noise = rng.normal(size=brain.shape).astype(np.float32)
    fine, broad = gaussian_filter(noise, 2.8), gaussian_filter(noise, 6.5)
    folds = fine / fine.std() + .45 * broad / broad.std()
    brain += .0045 * np.exp(-(folds / .65)**2)
    brain = np.maximum(brain, .0035 - np.abs(bx))
    cerebellum = (np.sqrt((bx/.077)**2 + ((by-1.393)/.038)**2 + ((bz+.071)/.060)**2)-1)*.038
    cerebellum += .0017*np.exp(-(np.sin(by*260 + bz*25 + .35*np.sin(bx*63))/.35)**2)
    brain = np.minimum(brain, cerebellum)
    surface("brain", brain, [197,153,135], mesh_origin=brain_origin, mesh_step=brain_step)
    # Eye parts use smooth UV geometry so the iris and pupil remain round at close zoom.
    for side, sign in [("left", 1), ("right", -1)]:
        for part, center, radii, color in [
            ("sclera", (sign*.062,1.438,.134), (.028,.024,.025), [235,238,221,255]),
            ("iris", (sign*.062,1.438,.157), (.011,.011,.0035), [70,127,116,255]),
            ("pupil", (sign*.062,1.438,.160), (.0048,.005,.0016), [29,48,43,255]),
        ]:
            mesh = trimesh.creation.uv_sphere(radius=1, count=(40,40))
            mesh.apply_scale(radii)
            mesh.apply_translation(center)
            mesh.visual = trimesh.visual.TextureVisuals(material=PBRMaterial(baseColorFactor=color, roughnessFactor=.3))
            name = f"eye_{side}_{part}"
            scene.add_geometry(mesh, node_name=name, geom_name=name)
    surface("heart", merged([((.052,.748,.098),(.072,.108,.071)),
        ((.007,.80,.097),(.062,.06,.052)), ((.085,.81,.085),(.043,.047,.048))],.015), [163,66,78])
    surface("liver", merged([((-.124,.575,.047),(.139,.092,.124)),
        ((.026,.585,.065),(.113,.06,.076))],.035), [145,82,74])
    kidneys = None
    for sign in [-1,1]:
        part = ellipsoid((sign*.145,.43,-.067),(.051,.087,.046))
        part = np.maximum(part, -ellipsoid((sign*.112,.43,-.045),(.028,.043,.035)))
        kidneys = part if kidneys is None else np.minimum(kidneys,part)
    surface("kidney", kidneys, [166,95,104])
    surface("stomach", merged([((.135,.567,.095),(.058,.075,.051)),
        ((.132,.49,.10),(.065,.077,.05)), ((.08,.454,.099),(.071,.034,.034))], .025), [211,162,124])
    surface("pancreas", merged([((.002,.454,.013),(.104,.026,.028)),
        ((-.083,.439,.018),(.036,.048,.034))], .02), [221,181,113])
    surface("spleen", ellipsoid((.221,.577,-.014),(.033,.081,.045)), [144,109,151])
    # A thin vertebral column gives the translucent body a stable internal structure.
    spine = merged([((0,y,-.115),(.025,.021,.023)) for y in np.arange(.26,1.18,.055)], .006)
    surface("spine", spine, [209,209,184], 150)
    OUT.mkdir(parents=True, exist_ok=True)
    scene.metadata.update({"purpose":"schematic navigation; not patient-specific or anatomically validated",
                           "generator":"scripts/build-anatomy-model.py", "license":"project-original"})
    path = OUT / "anatomy-navigation.glb"
    scene.export(path, include_normals=True)
    for name, mesh in scene.geometry.items():
        if name not in {"body_shell", "spine"} and not name.startswith("eye_"):
            organ_scene = trimesh.Scene(mesh)
            organ_scene.metadata["description"] = "Original schematic reference organ; not patient segmentation"
            organ_scene.export(OUT / f"organ-{name}.glb", include_normals=True)
    eye_scene = trimesh.Scene({name: mesh for name, mesh in scene.geometry.items() if name.startswith("eye_")})
    eye_scene.metadata["description"] = "Schematic eye pair; not patient segmentation"
    eye_scene.export(OUT / "organ-eye.glb", include_normals=True)
    print(path, path.stat().st_size, "bytes", flush=True)


if __name__ == "__main__":
    build()
