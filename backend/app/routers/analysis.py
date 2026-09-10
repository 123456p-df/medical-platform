from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.audit import audit
from app.deps import DB, CurrentUser, check_patient_access
from app.errors import APIError, Envelope, success
from app.models import AnalysisTask, Finding, utcnow
from app.routers.images import accessible_image
from app.schemas import (
    AnalysisInput,
    AnalysisStatus,
    AnalysisTaskOut,
    FindingOut,
    FindingPatch,
    TaskCreated,
)

router = APIRouter(tags=["Image Analysis"])


def finding_out(finding, task):
    return {
        "finding_id": finding.id,
        "task_id": finding.task_id,
        "image_id": finding.image_id,
        "patient_id": finding.patient_id,
        "finding_type": finding.finding_type,
        "model_label": finding.model_label,
        "label": finding.label,
        "description": finding.description,
        "confidence": finding.confidence,
        "diameter_mm": finding.diameter_mm,
        "coordinate_system": finding.coordinate_system,
        "box_mode": finding.box_mode,
        "center_world_mm": finding.center_world_mm,
        "box_world_mm": finding.box_world_mm,
        "center_voxel": finding.center_voxel,
        "box_voxel": finding.box_voxel,
        "side": finding.side,
        "lobe": finding.lobe,
        "status": finding.status,
        "model_name": task.model_name,
        "created_at": finding.created_at,
        "updated_at": finding.updated_at,
    }


@router.get("/analysis/status", response_model=Envelope[AnalysisStatus])
def get_status(request: Request, user: CurrentUser):
    runner = request.app.state.analysis_runner
    return success(
        {
            "configured": runner.available(),
            "analysis_type": "lung_nodule_detection",
            "model_name": runner.model_name,
            "supported_image_types": runner.supported_image_types,
            "supported_organs": ["lung"],
        }
    )


@router.post(
    "/medical-images/{image_id}/analysis",
    status_code=201,
    response_model=Envelope[TaskCreated],
)
def create_task(
    image_id: str,
    body: AnalysisInput,
    request: Request,
    background_tasks: BackgroundTasks,
    db: DB,
    user: CurrentUser,
):
    image = accessible_image(db, user, image_id, write=True)
    if image.organ_id != "lung":
        raise APIError(400, 40009, "Lung nodule analysis requires organ_id=lung")
    runner = request.app.state.analysis_runner
    runner.ensure_available(image.image_type)
    task = AnalysisTask(
        id=f"analysis_{uuid4().hex}",
        image_id=image.id,
        patient_id=image.patient_id,
        analysis_type=body.analysis_type,
        requested_by=user.id,
        model_name=runner.model_name,
        score_threshold=body.score_threshold,
    )
    db.add(task)
    try:
        db.flush()
        audit(
            db,
            user.id,
            image.patient_id,
            "analysis.create",
            "analysis_task",
            task.id,
            after={
                "analysis_type": body.analysis_type,
                "score_threshold": body.score_threshold,
            },
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        active = db.scalar(
            select(AnalysisTask).where(
                AnalysisTask.image_id == image_id,
                AnalysisTask.analysis_type == body.analysis_type,
                AnalysisTask.status.in_(["queued", "running"]),
            )
        )
        if active:
            raise APIError(409, 40903, "Analysis task already queued or running") from None
        raise
    background_tasks.add_task(runner.enqueue, task.id)
    return success({"task_id": task.id, "status": "queued"})


@router.get("/analysis/tasks/{task_id}", response_model=Envelope[AnalysisTaskOut])
def get_task(task_id: str, db: DB, user: CurrentUser):
    task = db.get(AnalysisTask, task_id)
    if task is None:
        raise APIError(404, 40408, "Analysis task not found")
    accessible_image(db, user, task.image_id)
    return success(
        {
            "task_id": task.id,
            "status": task.status,
            "analysis_type": task.analysis_type,
            "model_name": task.model_name,
            "score_threshold": task.score_threshold,
            "progress": task.progress,
            "result": (
                {
                    "findings_count": task.result_count,
                    "findings_url": f"/api/v1/medical-images/{task.image_id}/findings?task_id={task.id}",
                }
                if task.status == "completed"
                else None
            ),
            "error_message": task.error_message if task.status == "failed" else None,
        }
    )


@router.get("/medical-images/{image_id}/findings", response_model=Envelope[list[FindingOut]])
def image_findings(
    image_id: str,
    db: DB,
    user: CurrentUser,
    task_id: str | None = Query(None, max_length=64),
):
    accessible_image(db, user, image_id)
    if task_id:
        task = db.get(AnalysisTask, task_id)
        if task is None or task.image_id != image_id or task.status != "completed":
            raise APIError(404, 40408, "Completed analysis task not found")
    else:
        task = db.scalar(
            select(AnalysisTask)
            .where(AnalysisTask.image_id == image_id, AnalysisTask.status == "completed")
            .order_by(AnalysisTask.created_at.desc())
            .limit(1)
        )
    if task is None:
        return success([])
    findings = list(
        db.scalars(
            select(Finding)
            .where(Finding.task_id == task.id)
            .order_by(Finding.confidence.desc(), Finding.created_at)
        )
    )
    return success([finding_out(finding, task) for finding in findings])


@router.get("/patients/{patient_id}/findings", response_model=Envelope[list[FindingOut]])
def patient_findings(patient_id: int, db: DB, user: CurrentUser):
    check_patient_access(db, user, patient_id)
    tasks = list(
        db.scalars(
            select(AnalysisTask)
            .where(AnalysisTask.patient_id == patient_id, AnalysisTask.status == "completed")
            .order_by(AnalysisTask.created_at.desc())
        )
    )
    latest_by_image = {}
    for task in tasks:
        latest_by_image.setdefault(task.image_id, task)
    if not latest_by_image:
        return success([])
    task_by_id = {task.id: task for task in latest_by_image.values()}
    findings = list(
        db.scalars(
            select(Finding)
            .where(Finding.task_id.in_(list(task_by_id)))
            .order_by(Finding.created_at.desc(), Finding.confidence.desc())
        )
    )
    return success([finding_out(finding, task_by_id[finding.task_id]) for finding in findings])


@router.patch("/findings/{finding_id}", response_model=Envelope[FindingOut])
def update_finding(finding_id: str, body: FindingPatch, db: DB, user: CurrentUser):
    finding = db.get(Finding, finding_id)
    if finding is None:
        raise APIError(404, 40409, "Finding not found")
    accessible_image(db, user, finding.image_id, write=True)
    task = db.get(AnalysisTask, finding.task_id)
    before = {"status": finding.status, "label": finding.label}
    values = body.model_dump(exclude_unset=True)
    for field in ("label", "description", "status"):
        if field in values:
            setattr(finding, field, values[field])
    if "status" not in values and ({"label", "description"} & values.keys()):
        finding.status = "modified"
    if finding.status == "pending":
        finding.reviewed_by = None
        finding.reviewed_at = None
    else:
        finding.reviewed_by = user.id
        finding.reviewed_at = utcnow()
    finding.updated_at = utcnow()
    audit(
        db,
        user.id,
        finding.patient_id,
        "finding.review",
        "finding",
        finding.id,
        before=before,
        after={"status": finding.status, "label": finding.label},
    )
    db.commit()
    return success(finding_out(finding, task))
