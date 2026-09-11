import importlib
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import uuid4

from sqlalchemy.exc import IntegrityError
import nibabel as nib
import numpy as np
import trimesh
from sqlalchemy import select, update

from app.adapters.nv_segment_ct import NVSegmentCT
from app.audit import audit
from app.deps import check_patient_access
from app.errors import APIError
from app.models import (
    MedicalImage, OrganModel, SegmentationBatch, SegmentationTask, User, utcnow
)
from app.services.geometry_engine import extract_subvoxel_surface_from_mask
from app.services.glb import (
    build_atlas_glb,
    export_mesh_glb,
    load_mesh_from_glb,
    mesh_name_for_label,
    store_model_blob,
)
from app.services.imaging import mask_to_glb, prepare_label_cache
from app.services.label_catalog import LabelCatalog
from app.services.storage import relative_path, stored_path

logger = logging.getLogger(__name__)


class SegmentationRunner:
    """One inference thread per API instance, with durable PostgreSQL task status.

    BackgroundTasks only submits work, avoiding blocked FastAPI worker threads while
    GPU jobs wait. The app's PostgreSQL advisory lock enforces one API instance.
    """

    def __init__(self, settings, session_factory, adapter=None):
        self.settings = settings
        self.catalog = LabelCatalog(settings.nv_segment_ct_dir)
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
        self.dispatcher = None
        if settings.task_queue_enabled and settings.task_queue_url:
            try:
                from app.worker import dispatch_segmentation

                self.dispatcher = dispatch_segmentation
            except Exception:
                logger.warning("Task queue is enabled but Celery is unavailable; using local runner")

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
                update(SegmentationBatch)
                .where(SegmentationBatch.status == "running")
                .values(status="queued", progress=0, updated_at=utcnow())
            )
            db.execute(
                update(SegmentationTask)
                .where(SegmentationTask.status == "running", SegmentationTask.batch_id.is_not(None))
                .values(status="queued", progress=0, updated_at=utcnow())
            )
            db.execute(
                update(SegmentationTask)
                .where(SegmentationTask.status == "running", SegmentationTask.batch_id.is_(None))
                .values(
                    status="failed",
                    error_message="Inference interrupted by server restart; submit a new task",
                    updated_at=utcnow(),
                )
            )
            queued_batches = list(
                db.scalars(
                    select(SegmentationBatch.id)
                    .where(SegmentationBatch.status == "queued")
                    .order_by(SegmentationBatch.created_at)
                )
            )
            queued_tasks = list(
                db.scalars(
                    select(SegmentationTask.id)
                    .where(SegmentationTask.status == "queued", SegmentationTask.batch_id.is_(None))
                    .order_by(SegmentationTask.created_at)
                )
            )
            db.commit()
        for batch_id in queued_batches:
            self.enqueue_batch(batch_id)
        for task_id in queued_tasks:
            self.enqueue(task_id)

    def enqueue(self, task_id):
        if self.dispatcher is not None:
            try:
                self.dispatcher(task_id, batch=False)
                return
            except Exception as exc:
                logger.error("Celery dispatch failed (%s); falling back to local runner", type(exc).__name__)
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

    def cleanup_label_maps(self):
        days = getattr(self.settings, "segmentation_label_map_retention_days", 0)
        if not days:
            return
        from datetime import timedelta

        cutoff = utcnow() - timedelta(days=days)
        with self.sessions() as db:
            stale = list(
                db.scalars(
                    select(SegmentationBatch).where(SegmentationBatch.updated_at < cutoff)
                )
            )
            for batch in stale:
                for relative in (batch.label_map_path, batch.native_label_map_path):
                    if not relative:
                        continue
                    try:
                        stored_path(self.settings, relative).unlink(missing_ok=True)
                    except Exception:
                        logger.exception("Unable to remove stale label map %s", relative)

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
            mask_to_glb(mask_path, image_path, model_path, self.settings, organ_id=task.organ_id)
            highres_glb = mask_path.parent / "highres_surface.glb"
            if highres_glb != model_path:
                highres_glb.unlink(missing_ok=True)
            glb_data = model_path.read_bytes()
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
                        kind="organ",
                        file_path=None,
                        mask_path=relative_path(self.settings, mask_path),
                        size_bytes=len(glb_data),
                    )
                )
                db.flush()
                store_model_blob(db, model_id, glb_data)
                model_path.unlink(missing_ok=True)
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

    def batch_capable(self):
        return callable(getattr(self.adapter, "run_batch", None))

    def enqueue_batch_for_image(self, image_id, requested_by):
        """Create one deduplicated all-label batch after a CT upload."""
        if not self.batch_capable():
            return None
        with self.sessions() as db:
            image = db.get(MedicalImage, image_id)
            if image is None or image.image_type != "CT":
                return None
            active = db.scalar(
                select(SegmentationBatch)
                .where(
                    SegmentationBatch.image_id == image_id,
                    SegmentationBatch.model_fingerprint == self.settings.segmentation_model_fingerprint,
                    SegmentationBatch.status.in_(["queued", "running"]),
                )
                .order_by(SegmentationBatch.created_at.desc())
            )
            if active:
                return active.id
            batch = SegmentationBatch(
                id=f"batch_{uuid4().hex}",
                image_id=image_id,
                requested_by=requested_by,
                model_fingerprint=self.settings.segmentation_model_fingerprint,
            )
            db.add(batch)
            try:
                db.flush()
                audit(db, requested_by, image.patient_id, "segmentation.batch.create", "segmentation_batch", batch.id)
                db.commit()
            except IntegrityError:
                db.rollback()
                active = db.scalar(
                    select(SegmentationBatch)
                    .where(
                        SegmentationBatch.image_id == image_id,
                        SegmentationBatch.model_fingerprint == self.settings.segmentation_model_fingerprint,
                        SegmentationBatch.status.in_(["queued", "running"]),
                    )
                    .order_by(SegmentationBatch.created_at.desc())
                )
                return active.id if active else None
        self.enqueue_batch(batch.id)
        return batch.id

    def enqueue_batch(self, batch_id):
        if self.dispatcher is not None:
            try:
                self.dispatcher(batch_id, batch=True)
                return
            except Exception as exc:
                logger.error("Celery batch dispatch failed (%s); falling back to local runner", type(exc).__name__)
        with self._lock:
            if batch_id in self._pending:
                return
            self._pending.add(batch_id)
        try:
            future = self.executor.submit(self.run_batch, batch_id)
            future.add_done_callback(lambda _: self._remove_pending(batch_id))
        except RuntimeError:
            self._remove_pending(batch_id)

    def progress_batch(self, batch_id, value):
        value = max(1, min(95, int(value)))
        with self.sessions() as db:
            db.execute(
                update(SegmentationBatch)
                .where(SegmentationBatch.id == batch_id, SegmentationBatch.status == "running")
                .values(progress=value, updated_at=utcnow())
            )
            db.commit()

    @staticmethod
    def _inside(path: Path, root: Path):
        resolved = path.resolve()
        if not resolved.is_relative_to(root.resolve()) or not resolved.is_file():
            raise ValueError("Batch adapter output must be a file inside its task output directory")
        return resolved

    def run_batch(self, batch_id):
        try:
            with self.sessions() as db:
                claimed = db.execute(
                    update(SegmentationBatch)
                    .where(SegmentationBatch.id == batch_id, SegmentationBatch.status == "queued")
                    .values(status="running", progress=1, updated_at=utcnow())
                )
                db.commit()
                if claimed.rowcount != 1:
                    return
                batch = db.get(SegmentationBatch, batch_id)
                image = db.get(MedicalImage, batch.image_id)
                user = db.get(User, batch.requested_by)
                if image is None or user is None:
                    raise ValueError("Batch owner or image no longer exists")
                check_patient_access(db, user, image.patient_id, write=True)
                self.ensure_available(image.image_type)
                image_path = stored_path(self.settings, image.file_path)
                patient_id, image_id = image.patient_id, image.id
            output_dir = stored_path(self.settings, f"segmentations/{batch_id}")
            output_dir.mkdir(parents=True, exist_ok=True)
            result = self.adapter.run_batch(
                image_path=image_path,
                output_dir=output_dir,
                progress=lambda value: self.progress_batch(batch_id, value),
            )
            label_path = self._inside(Path(result["label_map_1mm"]), output_dir)
            native_path = self._inside(Path(result["label_map_native"]), output_dir)
            label_image = nib.load(str(label_path))
            label_values = np.asarray(label_image.dataobj)
            label_ids = sorted(set(int(value) for value in result.get("labels", [])))
            catalog = getattr(self.adapter, "catalog", self.catalog)
            specs = [catalog.describe(label_id) for label_id in label_ids]
            with self.sessions() as db:
                batch = db.get(SegmentationBatch, batch_id)
                existing = {task.label_id: task for task in db.scalars(select(SegmentationTask).where(SegmentationTask.batch_id == batch_id))}
                for spec in specs:
                    if spec["label_id"] not in existing:
                        db.add(
                            SegmentationTask(
                                id=f"seg_{uuid4().hex}",
                                image_id=image_id,
                                batch_id=batch_id,
                                organ_id=spec["organ_id"],
                                label_id=spec["label_id"],
                                label_name=spec["name"],
                                group_id=spec["group_id"],
                                requested_by=batch.requested_by,
                            )
                        )
                batch.total_labels = len(specs)
                batch.recognized_count = len(specs)
                batch.label_map_path = relative_path(self.settings, label_path)
                batch.native_label_map_path = relative_path(self.settings, native_path)
                batch.updated_at = utcnow()
                db.commit()
            task_specs = []
            with self.sessions() as db:
                for task in db.scalars(select(SegmentationTask).where(SegmentationTask.batch_id == batch_id).order_by(SegmentationTask.label_id)):
                    task_specs.append((task.id, task.label_id, task.organ_id, task.label_name, task.group_id, task.requested_by))
            for spec in task_specs:
                try:
                    self._run_batch_label(batch_id, image_id, patient_id, label_values, label_image.affine, native_path, spec)
                except Exception as exc:
                    logger.error("Segmentation batch label %s failed (%s)", spec[0], type(exc).__name__)
            with self.sessions() as db:
                batch = db.get(SegmentationBatch, batch_id)
                tasks = list(db.scalars(select(SegmentationTask).where(SegmentationTask.batch_id == batch_id)))
                completed = sum(task.status == "completed" for task in tasks)
                failed = sum(task.status == "failed" for task in tasks)
                batch.completed_count = completed
                batch.failed_count = failed
                batch.progress = 100
                batch.status = "completed" if not failed else "partial" if completed else "failed"
                batch.error_message = None if not failed else "Some recognized labels failed to generate"
                batch.updated_at = utcnow()
                db.commit()
            if completed:
                try:
                    prepare_label_cache(native_path, self.settings)
                except Exception:
                    logger.error("Label cache for batch %s failed", batch_id)
                try:
                    self._store_atlas(batch_id, image_id, patient_id)
                except Exception:
                    logger.error("Atlas GLB for batch %s failed", batch_id)
        except Exception as exc:
            logger.error("Segmentation batch %s failed (%s)", batch_id, type(exc).__name__)
            with self.sessions() as db:
                db.execute(
                    update(SegmentationBatch)
                    .where(SegmentationBatch.id == batch_id)
                    .values(status="failed", progress=100, error_message="Segmentation batch failed; verify adapter, image and model runtime", updated_at=utcnow())
                )
                db.commit()

    def _store_atlas(self, batch_id, image_id, patient_id):
        with self.sessions() as db:
            models = list(
                db.scalars(
                    select(OrganModel)
                    .where(
                        OrganModel.image_id == image_id,
                        OrganModel.kind == "organ",
                        OrganModel.source == "segmentation",
                    )
                    .order_by(OrganModel.label_id, OrganModel.id)
                )
            )
            named = []
            for model in models:
                blob = model.blob
                if blob is None or not blob.data:
                    continue
                mesh = load_mesh_from_glb(bytes(blob.data))
                face_budget = 4000
                if len(mesh.faces) > face_budget:
                    try:
                        import fast_simplification

                        reduction = 1.0 - (face_budget / len(mesh.faces))
                        vertices, faces = fast_simplification.simplify(
                            mesh.vertices, mesh.faces, target_reduction=reduction
                        )
                        mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
                    except Exception:
                        logger.exception("Display atlas decimation failed for %s", model.label_name)
                named.append((mesh_name_for_label(model.label_id, model.label_name), mesh))
            if not named:
                return
            data = build_atlas_glb(named)
            existing = db.scalar(
                select(OrganModel).where(OrganModel.image_id == image_id, OrganModel.kind == "atlas")
            )
            model_id = existing.id if existing else f"model_{uuid4().hex}"
            if existing is None:
                db.add(
                    OrganModel(
                        id=model_id,
                        patient_id=patient_id,
                        image_id=image_id,
                        organ_id="atlas",
                        source="segmentation",
                        format="glb",
                        kind="atlas",
                        file_path=None,
                        label_name="anatomy atlas",
                        size_bytes=len(data),
                    )
                )
                db.flush()
            else:
                existing.size_bytes = len(data)
            store_model_blob(db, model_id, data)
            db.commit()

    def _run_batch_label(self, batch_id, image_id, patient_id, label_values, affine, native_path, spec):
        task_id, label_id, organ_id, label_name, group_id, requested_by = spec
        try:
            with self.sessions() as db:
                claimed = db.execute(
                    update(SegmentationTask)
                    .where(SegmentationTask.id == task_id, SegmentationTask.status == "queued")
                    .values(status="running", progress=5, updated_at=utcnow())
                )
                db.commit()
                if claimed.rowcount != 1:
                    return
            mask = label_values == label_id
            if not np.any(mask):
                raise ValueError("Label contains no foreground voxels")
            mesh, metadata = extract_subvoxel_surface_from_mask(
                mask=mask,
                affine=affine,
                target_faces=self.settings.segmentation_target_faces,
                organ_id=label_name or organ_id,
                min_component_voxels=self.settings.segmentation_min_component_voxels,
                smooth_iterations=0,
                sdf_sigma=1.2,
            )
            model_id = f"model_{uuid4().hex}"
            glb_data = export_mesh_glb(mesh)
            volume = metadata.get("volume_cm3")
            volume = float(volume) if volume is not None and np.isfinite(volume) else None
            centroid = metadata.get("centroid_m")
            bounds = {
                "min_m": metadata.get("bounds_min_m"),
                "max_m": metadata.get("bounds_max_m"),
                "centroid_m": centroid,
            }
            with self.sessions() as db:
                task = db.get(SegmentationTask, task_id)
                db.add(
                    OrganModel(
                        id=model_id, patient_id=patient_id, image_id=image_id,
                        organ_id=organ_id, label_id=label_id, label_name=label_name, group_id=group_id,
                        source="segmentation", format="glb", kind="organ", file_path=None,
                        mask_path=relative_path(self.settings, native_path), face_count=int(metadata["faces"]),
                        size_bytes=len(glb_data), volume_cm3=volume, is_watertight=bool(metadata["is_watertight"]),
                        bounds=bounds,
                    )
                )
                db.flush()
                store_model_blob(db, model_id, glb_data)
                task.status, task.progress, task.result_model_id = "completed", 100, model_id
                task.updated_at = utcnow()
                audit(db, requested_by, patient_id, "segmentation.complete", "segmentation_task", task_id)
                db.commit()
            with self.sessions() as db:
                batch = db.get(SegmentationBatch, batch_id)
                tasks = list(db.scalars(select(SegmentationTask).where(SegmentationTask.batch_id == batch_id)))
                batch.completed_count = sum(item.status == "completed" for item in tasks)
                batch.failed_count = sum(item.status == "failed" for item in tasks)
                batch.progress = min(99, 60 + int(40 * batch.completed_count / max(batch.total_labels, 1)))
                batch.updated_at = utcnow()
                db.commit()
        except Exception as exc:
            logger.error(
                "Segmentation batch label %s failed (%s: %s)",
                task_id,
                type(exc).__name__,
                exc,
            )
            with self.sessions() as db:
                db.execute(
                    update(SegmentationTask)
                    .where(SegmentationTask.id == task_id)
                    .values(status="failed", progress=100, error_message="This label failed to generate; verify the segmentation output", updated_at=utcnow())
                )
                db.commit()
            raise
