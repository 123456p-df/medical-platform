from fastapi import APIRouter
from fastapi.responses import Response

from app.deps import DB, Config, CurrentUser, check_patient_access
from app.errors import APIError, Envelope, success
from app.models import OrganModel
from app.organs import ORGANS
from app.schemas import LabelColorOut, ModelOut
from app.services.geometry_engine import overlay_style
from app.services.glb import glb_bytes_for, model_available
from app.services.label_catalog import LabelCatalog, display_name

router = APIRouter(tags=["Organ Model"])


def accessible_model(db, user, model_id):
    model = db.get(OrganModel, model_id)
    if model is None:
        if model_id.removeprefix("default_") in ORGANS and model_id.startswith("default_"):
            return None
        raise APIError(404, 40407, "Organ model not found")
    if model.patient_id is not None:
        check_patient_access(db, user, model.patient_id)
    return model


@router.get("/organ-models/{model_id}", response_model=Envelope[ModelOut])
def get_model(model_id: str, db: DB, user: CurrentUser, settings: Config):
    model = accessible_model(db, user, model_id)
    available = model_available(db, model, settings)
    return success(
        {
            "model_id": model_id,
            "format": "glb",
            "source": model.source if model else "default",
            "kind": model.kind if model else "organ",
            "available": available,
            "url": f"/api/v1/organ-models/{model_id}/file" if available else None,
            "label_id": model.label_id if model else None,
            "label_name": model.label_name if model else None,
            "group_id": model.group_id if model else None,
            "face_count": model.face_count if model else None,
            "size_bytes": model.size_bytes if model else None,
            "volume_cm3": model.volume_cm3 if model else None,
            "is_watertight": model.is_watertight if model else None,
            "bounds": model.bounds if model else None,
        }
    )


@router.get(
    "/organ-models/{model_id}/file",
    responses={200: {"content": {"model/gltf-binary": {}}}},
)
def model_file(model_id: str, db: DB, user: CurrentUser, settings: Config):
    model = accessible_model(db, user, model_id)
    if model is None:
        raise APIError(404, 40408, "Default organ asset is not installed")
    data = glb_bytes_for(db, model, settings)
    if not data:
        raise APIError(404, 40407, "Organ model file not found")
    return Response(
        content=data,
        media_type="model/gltf-binary",
        headers={"Content-Disposition": f'inline; filename="{model.id}.glb"'},
    )


@router.get("/catalog/label-colors", response_model=Envelope[list[LabelColorOut]])
def label_colors(db: DB, user: CurrentUser, settings: Config):
    catalog = LabelCatalog(settings.nv_segment_ct_dir)
    items = []
    for label_id, name in sorted(catalog.labels.items()):
        style = overlay_style(name)
        items.append(
            {
                "label_id": label_id,
                "organ_id": f"label_{label_id}",
                "name": name,
                "display_name": display_name(name),
                "color": style["color"],
                "luminance": style["luminance"],
                "outline_only": style["outline_only"],
            }
        )
    return success(items)
