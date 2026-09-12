"""Optional Celery entrypoint for GPU segmentation jobs.

The API remains on the durable local runner unless TASK_QUEUE_ENABLED=true.
"""

from celery import Celery

from app.config import Settings
from app.db import make_engine, make_session_factory
from app.services.segmentation import SegmentationRunner

settings = Settings()
if not settings.task_queue_url:
    raise RuntimeError("TASK_QUEUE_URL must be configured for the Celery worker")

celery_app = Celery(
    "medical-platform",
    broker=settings.task_queue_url,
    backend=settings.task_queue_url,
)


@celery_app.task(name="medical_platform.segmentation")
def run_segmentation(job_id: str, batch: bool = False):
    engine = make_engine(settings.database_url)
    sessions = make_session_factory(engine)
    runner = SegmentationRunner(settings, sessions)
    try:
        if batch:
            runner.run_batch(job_id)
        else:
            runner.run(job_id)
        return {"job_id": job_id, "batch": batch}
    finally:
        runner.close()
        engine.dispose()


def dispatch_segmentation(job_id: str, *, batch: bool):
    return celery_app.send_task(
        "medical_platform.segmentation",
        args=[job_id],
        kwargs={"batch": batch},
    )
