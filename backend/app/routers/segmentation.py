from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.audit import audit
from app.deps import DB, CurrentUser
from app.errors import APIError, Envelope, success
from app.models import OrganModel, SegmentationBatch, SegmentationTask
from app.organs import require_organ
from app.routers.images import accessible_image
from app.schemas import BatchItemOut, SegmentationBatchOut, SegmentationInput, TaskCreated, TaskOut
from app.services.geometry_engine import overlay_style
from app.services.label_catalog import _group, display_name, group_display_name

router = APIRouter(tags=["Segmentation"])


def batch_payload(batch, db):
    tasks = list(
        db.scalars(
            select(SegmentationTask)
            .where(SegmentationTask.batch_id == batch.id)
            .order_by(SegmentationTask.label_id, SegmentationTask.created_at)
        )
    )
    model_ids = [task.result_model_id for task in tasks if task.result_model_id]
    models = (
        {model.id: model for model in db.scalars(select(OrganModel).where(OrganModel.id.in_(model_ids)))}
        if model_ids
        else {}
    )
    atlas = db.scalar(
        select(OrganModel).where(OrganModel.image_id == batch.image_id, OrganModel.kind == "atlas")
    )
    items = []
    for task in tasks:
        model = models.get(task.result_model_id) if task.result_model_id else None
        name = task.label_name or task.organ_id
        style = overlay_style(name)
        group_id = _group(name)
        items.append(
            {
                "task_id": task.id,
                "label_id": task.label_id,
                "organ_id": task.organ_id,
                "name": name,
                "display_name": display_name(name),
                "group_id": group_id,
                "group_name": group_display_name(group_id),
                "status": task.status,
                "progress": task.progress,
                "model_id": model.id if model else None,
                "mesh_name": f"label_{task.label_id}" if task.label_id is not None else None,
                "face_count": model.face_count if model else None,
                "size_bytes": model.size_bytes if model else None,
                "volume_cm3": model.volume_cm3 if model else None,
                "is_watertight": model.is_watertight if model else None,
                "bounds": model.bounds if model else None,
                "color": style["color"],
                "outline_only": style["outline_only"],
                "error_message": task.error_message,
            }
        )
    return {
        "batch_id": batch.id,
        "image_id": batch.image_id,
        "status": batch.status,
        "progress": batch.progress,
        "total_labels": batch.total_labels,
        "recognized_count": batch.recognized_count,
        "completed_count": batch.completed_count,
        "failed_count": batch.failed_count,
        "atlas_model_id": atlas.id if atlas else None,
        "items": items,
        "error_message": batch.error_message,
    }


@router.get(
    "/medical-images/{image_id}/segmentation-batch", response_model=Envelope[SegmentationBatchOut]
)
def get_batch(image_id: str, db: DB, user: CurrentUser):
    accessible_image(db, user, image_id)
    batch = db.scalar(
        select(SegmentationBatch)
        .where(SegmentationBatch.image_id == image_id)
        .order_by(SegmentationBatch.created_at.desc())
    )
    if batch is None:
        raise APIError(404, 40406, "Segmentation batch not found")
    return success(batch_payload(batch, db))


@router.post(
    "/medical-images/{image_id}/segmentation-batch",
    status_code=201,
    response_model=Envelope[dict],
)
def create_or_retry_batch(
    image_id: str,
    request: Request,
    db: DB,
    user: CurrentUser,
):
    image = accessible_image(db, user, image_id, write=True)
    if image.image_type != "CT":
        raise APIError(400, 40005, "Batch segmentation is only supported for CT images")
    runner = request.app.state.segmentation_runner
    if not runner.batch_capable():
        raise APIError(503, 50301, "Segmentation model is not configured or installed")

    existing = db.scalar(
        select(SegmentationBatch)
        .where(
            SegmentationBatch.image_id == image_id,
            SegmentationBatch.model_fingerprint == runner.settings.segmentation_model_fingerprint,
            SegmentationBatch.status.in_(["queued", "running"]),
        )
        .order_by(SegmentationBatch.created_at.desc())
    )
    if existing:
        return success({"batch_id": existing.id, "status": existing.status})

    batch_id = runner.enqueue_batch_for_image(image_id, user.id)
    if not batch_id:
        raise APIError(500, 50001, "Unable to create or enqueue segmentation batch")
    batch = db.get(SegmentationBatch, batch_id)
    status = batch.status if batch else "queued"
    return success({"batch_id": batch_id, "status": status})


@router.get("/medical-images/{image_id}/organ-models", response_model=Envelope[list[BatchItemOut]])
def get_image_models(image_id: str, db: DB, user: CurrentUser):
    accessible_image(db, user, image_id)
    batch = db.scalar(
        select(SegmentationBatch)
        .where(SegmentationBatch.image_id == image_id)
        .order_by(SegmentationBatch.created_at.desc())
    )
    if batch is None:
        return success([])
    return success(batch_payload(batch, db)["items"])


@router.post(
    "/medical-images/{image_id}/segmentation", status_code=201, response_model=Envelope[TaskCreated]
)
def create_task(
    image_id: str,
    body: SegmentationInput,
    request: Request,
    background_tasks: BackgroundTasks,
    db: DB,
    user: CurrentUser,
):
    image = accessible_image(db, user, image_id, write=True)
    require_organ(body.organ_id)
    if body.organ_id in {"other", "eye"}:
        raise APIError(
            400,
            40007,
            "This category currently supports records and image browsing, not segmentation",
        )
    if image.organ_id != body.organ_id:
        raise APIError(400, 40006, "organ_id must match the uploaded image")
    runner = request.app.state.segmentation_runner
    runner.ensure_available(image.image_type)
    task = SegmentationTask(
        id=f"seg_{uuid4().hex}", image_id=image_id, organ_id=body.organ_id, requested_by=user.id
    )
    db.add(task)
    try:
        db.flush()
        audit(db, user.id, image.patient_id, "segmentation.create", "segmentation_task", task.id)
        db.commit()
    except IntegrityError:
        db.rollback()
        active = db.scalar(
            select(SegmentationTask).where(
                SegmentationTask.image_id == image_id,
                SegmentationTask.organ_id == body.organ_id,
                SegmentationTask.status.in_(["queued", "running"]),
            )
        )
        if active:
            raise APIError(409, 40902, "Segmentation task already queued or running") from None
        raise
    background_tasks.add_task(runner.enqueue, task.id)
    return success({"task_id": task.id, "status": "queued"})


@router.get("/segmentation/tasks/{task_id}", response_model=Envelope[TaskOut])
def get_task(task_id: str, db: DB, user: CurrentUser):
    task = db.get(SegmentationTask, task_id)
    if task is None:
        raise APIError(404, 40406, "Segmentation task not found")
    accessible_image(db, user, task.image_id)
    return success(
        {
            "task_id": task.id,
            "status": task.status,
            "progress": task.progress,
            "result": {"model_id": task.result_model_id} if task.status == "completed" else None,
            "error_message": task.error_message if task.status == "failed" else None,
        }
    )
