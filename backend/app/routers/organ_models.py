from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.deps import DB, Config, CurrentUser, check_patient_access
from app.errors import APIError, Envelope, success
from app.models import OrganModel
from app.organs import ORGANS
from app.schemas import ModelOut
from app.services.storage import stored_path

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
    available = bool(model and stored_path(settings, model.file_path).is_file())
    return success(
        {
            "model_id": model_id,
            "format": "glb",
            "source": model.source if model else "default",
            "available": available,
            "url": f"/api/v1/organ-models/{model_id}/file" if available else None,
        }
    )


@router.get(
    "/organ-models/{model_id}/file",
    response_class=FileResponse,
    responses={200: {"content": {"model/gltf-binary": {}}}},
)
def model_file(model_id: str, db: DB, user: CurrentUser, settings: Config):
    model = accessible_model(db, user, model_id)
    if model is None:
        raise APIError(404, 40408, "Default organ asset is not installed")
    path = stored_path(settings, model.file_path)
    if not path.is_file():
        raise APIError(404, 40407, "Organ model file not found")
    return FileResponse(path, media_type="model/gltf-binary", filename=f"{model.id}.glb")
