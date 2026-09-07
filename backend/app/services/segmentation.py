import importlib
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select, update

from app.adapters.nv_segment_ct import NVSegmentCT
from app.audit import audit
from app.deps import check_patient_access
from app.errors import APIError
from app.models import MedicalImage, OrganModel, SegmentationTask, User, utcnow
from app.services.imaging import mask_to_glb
from app.services.storage import relative_path, stored_path

logger = logging.getLogger(__name__)


class SegmentationRunner:
    """One inference thread per API instance, with durable PostgreSQL task status.

    BackgroundTasks only submits work, avoiding blocked FastAPI worker threads while
    GPU jobs wait. The app's PostgreSQL advisory lock enforces one API instance.
    """

    def __init__(self, settings, session_factory, adapter=None):
        self.settings = settings
        self.sessions = session_factory
        self.adapter = adapter
        self.executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="segmentation")
        self._pending: set[str] = set()
        self._lock = threading.Lock()
        if self.adapter is None and settings.segmentation_callable:
            module_name, function_name = settings.segmentation_callable.split(":", 1)
            self.adapter = getattr(importlib.import_module(module_name), function_name)
        elif self.adapter is None and settings.nv_segment_ct_dir:
            self.adapter = NVSegmentCT(settings)

    def ensure_available(self, image_type):
        if self.adapter is None or (
            hasattr(self.adapter, "available") and not self.adapter.available()
        ):
            raise APIError(503, 50301, "Segmentation model is not configured or installed")
        supported = getattr(self.adapter, "image_types", self.settings.segmentation_image_types)
        if image_type not in supported:
            raise APIError(
                400, 40005, "Configured segmentation model does not support this image type"
            )

    def recover(self):
        with self.sessions() as db:
            db.execute(
                update(SegmentationTask)
                .where(SegmentationTask.status == "running")
                .values(
                    status="failed",
                    error_message="Inference interrupted by server restart; submit a new task",
                    updated_at=utcnow(),
                )
            )
            queued = list(
                db.scalars(
                    select(SegmentationTask.id)
                    .where(SegmentationTask.status == "queued")
                    .order_by(SegmentationTask.created_at)
                )
            )
            db.commit()
        for task_id in queued:
            self.enqueue(task_id)

    def enqueue(self, task_id):
        with self._lock:
            if task_id in self._pending:
                return
            self._pending.add(task_id)
        try:
            future = self.executor.submit(self.run, task_id)
            future.add_done_callback(lambda _: self._remove_pending(task_id))
        except RuntimeError:
            self._remove_pending(task_id)
            # It remains queued in PostgreSQL and will be recovered on startup.

    def _remove_pending(self, task_id):
        with self._lock:
            self._pending.discard(task_id)

    def close(self):
        self.executor.shutdown(wait=True)

    def progress(self, task_id, value):
        value = max(1, min(95, int(value)))
        with self.sessions() as db:
            db.execute(
                update(SegmentationTask)
                .where(
                    SegmentationTask.id == task_id,
                    SegmentationTask.status == "running",
                    SegmentationTask.progress < value,
                )
                .values(progress=value, updated_at=utcnow())
            )
            db.commit()

    def run(self, task_id):
        model_path = None
        try:
            with self.sessions() as db:
                claimed = db.execute(
                    update(SegmentationTask)
                    .where(SegmentationTask.id == task_id, SegmentationTask.status == "queued")
                    .values(status="running", progress=1, updated_at=utcnow())
                )
                db.commit()
                if claimed.rowcount != 1:
                    return
                task = db.get(SegmentationTask, task_id)
                image = db.get(MedicalImage, task.image_id)
                user = db.get(User, task.requested_by)
                if user is None:
                    raise ValueError("Requesting user no longer exists")
                check_patient_access(db, user, image.patient_id, write=True)
                self.ensure_available(image.image_type)
                image_path = stored_path(self.settings, image.file_path)
                patient_id, organ_id, image_id = image.patient_id, task.organ_id, image.id
            output_dir = stored_path(self.settings, f"segmentations/{task_id}")
            output_dir.mkdir(parents=True, exist_ok=True)
            returned = self.adapter(
                image_path=image_path,
                organ_id=organ_id,
                output_dir=output_dir,
                progress=lambda p: self.progress(task_id, p),
            )
            mask_path = Path(returned).resolve()
            if not mask_path.is_relative_to(output_dir.resolve()) or not mask_path.is_file():
                raise ValueError("Adapter output must be a file inside its task output directory")
            self.progress(task_id, 80)
            model_id = f"model_{uuid4().hex}"
            model_path = stored_path(self.settings, f"organ-models/{model_id}.glb")
            model_path.parent.mkdir(parents=True, exist_ok=True)
            mask_to_glb(mask_path, image_path, model_path, self.settings)
            with self.sessions() as db:
                task = db.get(SegmentationTask, task_id)
                db.add(
                    OrganModel(
                        id=model_id,
                        patient_id=patient_id,
                        image_id=image_id,
                        organ_id=organ_id,
                        source="segmentation",
                        format="glb",
                        file_path=relative_path(self.settings, model_path),
                        mask_path=relative_path(self.settings, mask_path),
                    )
                )
                db.flush()
                task.status, task.progress, task.result_model_id = "completed", 100, model_id
                task.updated_at = utcnow()
                audit(
                    db,
                    task.requested_by,
                    patient_id,
                    "segmentation.complete",
                    "segmentation_task",
                    task_id,
                )
                db.commit()
        except Exception as exc:
            # No exception text or traceback: providers can put image paths and patient data in them.
            logger.error("Segmentation task %s failed (%s)", task_id, type(exc).__name__)
            if model_path:
                model_path.unlink(missing_ok=True)
            with self.sessions() as db:
                db.execute(
                    update(SegmentationTask)
                    .where(SegmentationTask.id == task_id)
                    .values(
                        status="failed",
                        error_message="Segmentation failed; verify adapter, image and model runtime",
                        updated_at=utcnow(),
                    )
                )
                db.commit()
