import hashlib
import io
import json
import struct
from pathlib import Path

import trimesh

from app.models import OrganModel, OrganModelBlob
from app.services.storage import stored_path


def validate_glb(path: Path):
    validate_glb_bytes(path.read_bytes(), limit=100 * 1024 * 1024)


def validate_glb_bytes(data: bytes, *, limit: int = 512 * 1024 * 1024):
    if len(data) > limit:
        raise ValueError("GLB exceeds limit")
    if len(data) < 20:
        raise ValueError("Invalid GLB header")
    magic, version, length = struct.unpack("<4sII", data[:12])
    if magic != b"glTF" or version != 2 or length > len(data) or length < 20:
        raise ValueError("Invalid GLB header")
    chunk_length, chunk_type = struct.unpack("<II", data[12:20])
    if chunk_type != 0x4E4F534A or chunk_length > length - 20:
        raise ValueError("Invalid GLB JSON chunk")
    metadata = json.loads(data[20 : 20 + chunk_length])
    for resource in metadata.get("buffers", []) + metadata.get("images", []):
        if resource.get("uri"):
            raise ValueError("GLB must embed buffers and textures; external URIs are not supported")
    return data


def mesh_name_for_label(label_id: int | None, label_name: str | None = None) -> str:
    if label_id is not None:
        return f"label_{int(label_id)}"
    return (label_name or "organ").replace(" ", "_")


def store_model_blob(db, model_id: str, data: bytes) -> OrganModelBlob:
    payload = validate_glb_bytes(data)
    digest = hashlib.sha256(payload).hexdigest()
    blob = db.get(OrganModelBlob, model_id)
    if blob is None:
        blob = OrganModelBlob(
            model_id=model_id,
            data=payload,
            sha256=digest,
            size_bytes=len(payload),
            content_type="model/gltf-binary",
        )
        db.add(blob)
    else:
        blob.data = payload
        blob.sha256 = digest
        blob.size_bytes = len(payload)
    return blob


def glb_bytes_for(db, model: OrganModel | None, settings) -> bytes | None:
    if model is None:
        return None
    blob = db.get(OrganModelBlob, model.id)
    if blob and blob.data:
        return bytes(blob.data)
    if model.file_path:
        path = stored_path(settings, model.file_path)
        if path.is_file():
            return path.read_bytes()
    return None


def model_available(db, model: OrganModel | None, settings) -> bool:
    return glb_bytes_for(db, model, settings) is not None


def export_mesh_glb(mesh) -> bytes:
    exported = mesh.export(file_type="glb")
    if isinstance(exported, bytes):
        return validate_glb_bytes(exported)
    buffer = io.BytesIO()
    mesh.export(buffer, file_type="glb")
    return validate_glb_bytes(buffer.getvalue())


def build_atlas_glb(named_meshes: list[tuple[str, trimesh.Trimesh]]) -> bytes:
    scene = trimesh.Scene()
    for name, mesh in named_meshes:
        scene.add_geometry(mesh, geom_name=name)
    exported = scene.export(file_type="glb")
    if isinstance(exported, bytes):
        return validate_glb_bytes(exported)
    buffer = io.BytesIO()
    scene.export(buffer, file_type="glb")
    return validate_glb_bytes(buffer.getvalue())


def load_mesh_from_glb(data: bytes) -> trimesh.Trimesh:
    loaded = trimesh.load(io.BytesIO(data), file_type="glb", force="mesh")
    if isinstance(loaded, trimesh.Scene):
        geometries = list(loaded.geometry.values())
        if not geometries:
            raise ValueError("Empty GLB scene")
        loaded = (
            trimesh.util.concatenate(geometries) if len(geometries) > 1 else geometries[0]
        )
    return loaded
