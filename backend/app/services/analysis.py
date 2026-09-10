import importlib
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import nibabel as nib
import numpy as np
from sqlalchemy import select, update

from app.adapters.lung_nodule import LungNoduleHTTPAdapter, validate_detection_output
from app.audit import audit
from app.deps import check_patient_access
from app.errors import APIError
from app.models import AnalysisTask, Finding, MedicalImage, User, utcnow
from app.services.storage import stored_path

logger = logging.getLogger(__name__)


class AnalysisRunner:
    """Durable, single-threaded lung nodule inference queue for each API instance."""

    def __init__(self, settings, session_factory, adapter=None):
        self.settings = settings
        self.sessions = session_factory
        self.adapter = adapter
        self.executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="analysis")
        self._pending: set[str] = set()
        self._lock = threading.Lock()
        if self.adapter is None and settings.lung_nodule_callable:
            module_name, function_name = settings.lung_nodule_callable.split(":", 1)
            self.adapter = getattr(importlib.import_module(module_name), function_name)
        elif self.adapter is None and settings.lung_nodule_model_url:
            self.adapter = LungNoduleHTTPAdapter(settings)

    @property
    def model_name(self):
        return getattr(self.adapter, "model_name", self.settings.lung_nodule_model_name)

    @property
    def supported_image_types(self):
        return sorted(getattr(self.adapter, "image_types", {"CT"}))

    def available(self):
        return self.adapter is not None and (
            not hasattr(self.adapter, "available") or self.adapter.available()
        )

    def ensure_available(self, image_type):
        if not self.available():
            raise APIError(503, 50304, "Lung nodule analysis model is not configured")
        if image_type not in self.supported_image_types:
            raise APIError(400, 40008, "Lung nodule analysis supports CT images only")

    def recover(self):
        with self.sessions() as db:
            db.execute(
                update(AnalysisTask)
                .where(AnalysisTask.status == "running")
                .values(
                    status="failed",
                    error_message="Inference interrupted by server restart; submit a new task",
                    updated_at=utcnow(),
                )
            )
            queued = list(
                db.scalars(
                    select(AnalysisTask.id)
                    .where(AnalysisTask.status == "queued")
                    .order_by(AnalysisTask.created_at)
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

    def _remove_pending(self, task_id):
        with self._lock:
            self._pending.discard(task_id)

    def close(self):
        self.executor.shutdown(wait=True)

    def progress(self, task_id, value):
        value = max(1, min(95, int(value)))
        with self.sessions() as db:
            db.execute(
                update(AnalysisTask)
                .where(
                    AnalysisTask.id == task_id,
                    AnalysisTask.status == "running",
                    AnalysisTask.progress < value,
                )
                .values(progress=value, updated_at=utcnow())
            )
            db.commit()

    @staticmethod
    def _voxel_box(image_path, box_world):
        image = nib.as_closest_canonical(nib.load(image_path))
        center_world = np.asarray(box_world[:3], dtype=float)
        center_voxel = nib.affines.apply_affine(np.linalg.inv(image.affine), center_world)
        shape = np.asarray(image.shape[:3], dtype=float)
        if np.any(center_voxel < -1) or np.any(center_voxel > shape):
            raise ValueError("Detection center is outside the source image")
        spacing = np.asarray(image.header.get_zooms()[:3], dtype=float)
        size_voxel = np.asarray(box_world[3:], dtype=float) / spacing
        return center_voxel.tolist(), [*center_voxel.tolist(), *size_voxel.tolist()]

    def run(self, task_id):
        try:
            with self.sessions() as db:
                claimed = db.execute(
                    update(AnalysisTask)
                    .where(AnalysisTask.id == task_id, AnalysisTask.status == "queued")
                    .values(status="running", progress=1, updated_at=utcnow())
                )
                db.commit()
                if claimed.rowcount != 1:
                    return
                task = db.get(AnalysisTask, task_id)
                image = db.get(MedicalImage, task.image_id)
                user = db.get(User, task.requested_by)
                if user is None or image is None:
                    raise ValueError("Analysis owner or image no longer exists")
                check_patient_access(db, user, image.patient_id, write=True)
                self.ensure_available(image.image_type)
                if image.organ_id != "lung":
                    raise ValueError("Lung nodule analysis requires a lung image")
                image_path = stored_path(self.settings, image.file_path)
                patient_id = image.patient_id
                score_threshold = task.score_threshold

            raw = self.adapter(
                image_path=image_path,
                score_threshold=score_threshold,
                progress=lambda value: self.progress(task_id, value),
            )
            result = validate_detection_output(
                raw,
                score_threshold=score_threshold,
                max_findings=self.settings.lung_nodule_max_findings,
            )
            findings = []
            for candidate in result.findings:
                box_world = list(candidate.box)
                center_voxel, box_voxel = self._voxel_box(image_path, box_world)
                diameter = max(box_world[3:])
                side = candidate.side or ("right" if box_world[0] >= 0 else "left")
                findings.append(
                    Finding(
                        id=f"finding_{uuid4().hex}",
                        task_id=task_id,
                        image_id=image.id,
                        patient_id=patient_id,
                        finding_type="lung_nodule",
                        model_label=str(candidate.label),
                        label="Pulmonary nodule candidate",
                        description=(
                            f"Model-detected pulmonary nodule candidate measuring "
                            f"approximately {diameter:.1f} mm; clinical review required."
                        ),
                        confidence=candidate.score,
                        diameter_mm=diameter,
                        coordinate_system="RAS",
                        box_mode="cccwhd",
                        center_world_mm=box_world[:3],
                        box_world_mm=box_world,
                        center_voxel=center_voxel,
                        box_voxel=box_voxel,
                        side=side,
                        lobe=candidate.lobe,
                        status="pending",
                    )
                )
            with self.sessions() as db:
                task = db.get(AnalysisTask, task_id)
                if task is None:
                    return
                db.add_all(findings)
                task.status = "completed"
                task.progress = 100
                task.result_count = len(findings)
                task.model_name = result.model_name
                task.updated_at = utcnow()
                audit(
                    db,
                    task.requested_by,
                    patient_id,
                    "analysis.complete",
                    "analysis_task",
                    task_id,
                    after={"analysis_type": task.analysis_type, "findings_count": len(findings)},
                )
                db.commit()
        except Exception as exc:
            # Provider errors can contain paths or image metadata; never expose their text.
            logger.error("Analysis task %s failed (%s)", task_id, type(exc).__name__)
            with self.sessions() as db:
                db.execute(
                    update(AnalysisTask)
                    .where(AnalysisTask.id == task_id)
                    .values(
                        status="failed",
                        error_message="Lung nodule analysis failed; verify image and model service",
                        updated_at=utcnow(),
                    )
                )
                db.commit()
