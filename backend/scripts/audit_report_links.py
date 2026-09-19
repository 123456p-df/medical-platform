"""Read-only audit for examination/report linkage before report workflow migration."""

import json
from collections import defaultdict

from sqlalchemy import func, select

from app.config import Settings
from app.db import make_engine, make_session_factory
from app.models import MedicalImage, MedicalRecord, ReportTask


def main():
    settings = Settings()
    engine = make_engine(settings.database_url)
    session_factory = make_session_factory(engine)
    with session_factory() as db:
        image_total = db.scalar(select(func.count()).select_from(MedicalImage))
        report_total = db.scalar(
            select(func.count())
            .select_from(MedicalRecord)
            .where(MedicalRecord.deleted_at.is_(None))
        )
        unlinked_report_ids = list(
            db.scalars(
                select(MedicalRecord.id)
                .where(
                    MedicalRecord.examination_id.is_(None),
                    MedicalRecord.deleted_at.is_(None),
                )
                .order_by(MedicalRecord.id)
            )
        )
        exam_with_report_total = db.scalar(
            select(func.count(func.distinct(MedicalRecord.examination_id)))
            .where(
                MedicalRecord.examination_id.is_not(None),
                MedicalRecord.deleted_at.is_(None),
            )
        )
        groups = defaultdict(list)
        for record_id, examination_id, patient_id in db.execute(
            select(
                MedicalRecord.id,
                MedicalRecord.examination_id,
                MedicalRecord.patient_id,
            ).where(
                MedicalRecord.examination_id.is_not(None),
                MedicalRecord.deleted_at.is_(None),
            )
        ):
            groups[examination_id].append((record_id, patient_id))
        multi_report_exams = sorted(
            (
                {
                    "examination_id": examination_id,
                    "record_ids": sorted(record_id for record_id, _ in items),
                    "count": len(items),
                }
                for examination_id, items in groups.items()
                if len(items) > 1
            ),
            key=lambda item: item["examination_id"],
        )
        mismatched_rows = list(
            db.execute(
                select(
                    MedicalRecord.id,
                    MedicalRecord.examination_id,
                    MedicalRecord.patient_id,
                    MedicalImage.patient_id,
                )
                .join(MedicalImage, MedicalImage.id == MedicalRecord.examination_id)
                .where(
                    MedicalRecord.patient_id != MedicalImage.patient_id,
                    MedicalRecord.deleted_at.is_(None),
                )
            )
        )
        task_total = db.scalar(select(func.count()).select_from(ReportTask))

    result = {
        "images_total": image_total,
        "reports_total": report_total,
        "unlinked_report_ids": unlinked_report_ids,
        "examinations_with_report": exam_with_report_total,
        "examinations_without_report": (image_total or 0) - (exam_with_report_total or 0),
        "multi_report_exams": multi_report_exams,
        "cross_patient_mismatches": [
            {
                "record_id": record_id,
                "examination_id": examination_id,
                "record_patient_id": record_patient_id,
                "image_patient_id": image_patient_id,
            }
            for record_id, examination_id, record_patient_id, image_patient_id in mismatched_rows
        ],
        "report_tasks_total": task_total,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
