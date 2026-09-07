import json
import struct
from pathlib import Path


def validate_glb(path: Path):
    if path.stat().st_size > 100 * 1024 * 1024:
        raise ValueError("Default GLB exceeds limit")
    with path.open("rb") as source:
        magic, version, length = struct.unpack("<4sII", source.read(12))
        if magic != b"glTF" or version != 2 or length != path.stat().st_size:
            raise ValueError("Invalid GLB header")
        chunk_length, chunk_type = struct.unpack("<II", source.read(8))
        if chunk_type != 0x4E4F534A or chunk_length > length - 20:
            raise ValueError("Invalid GLB JSON chunk")
        metadata = json.loads(source.read(chunk_length))
    for resource in metadata.get("buffers", []) + metadata.get("images", []):
        if resource.get("uri"):
            raise ValueError("GLB must embed buffers and textures; external URIs are not supported")
