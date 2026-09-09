from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.audit import audit
from app.deps import DB, CurrentUser
from app.errors import APIError, Envelope, success
from app.models import SegmentationTask
from app.organs import require_organ
from app.routers.images import accessible_image
from app.schemas import SegmentationInput, TaskCreated, TaskOut

router = APIRouter(tags=["Segmentation"])


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
