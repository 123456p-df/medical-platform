from app.errors import APIError

# Stable IDs shared by the 2D, 3D and record APIs. Extend here when adding an organ.
ORGANS = {
    "lung": "肺",
    "liver": "肝脏",
    "heart": "心脏",
    "kidney": "肾脏",
    "brain": "脑",
    "stomach": "胃",
    "pancreas": "胰腺",
    "spleen": "脾脏",
}


def require_organ(organ_id: str) -> str:
    if organ_id not in ORGANS:
        raise APIError(404, 40402, "Organ not found")
    return organ_id
