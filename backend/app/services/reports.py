"""Agent-readable report documents backed by database metadata.

The database remains the source for ownership, authorization, filtering and audit
history. Narrative fields are mirrored to a predictable Markdown file and are read
from that file whenever a report is returned or sent to the AI context builder.
"""

import json
import hashlib
import logging
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import select

from app.errors import APIError
from app.models import MedicalRecord
from app.services.storage import report_relative_path, stored_path

logger = logging.getLogger(__name__)

_FIELDS = ("diagnosis", "description", "recommendation")


def _marker(field: str, boundary: str) -> str:
    return f"<!-- vmrb:{field}:{boundary} -->"


def render_report_document(record: MedicalRecord, revision: int) -> str:
    metadata = {
        "format": "vmrb-report-v1",
        "record_id": record.id,
        "patient_id": record.patient_id,
        "doctor_id": record.doctor_id,
        "examination_id": record.examination_id,
        "record_date": record.record_date.isoformat(),
        "organ_ids": record.organ_ids,
        "reviewed": bool(record.reviewed),
        "signed_at": record.signed_at.isoformat() if record.signed_at else None,
        "content_revision": revision,
    }
    sections = []
    headings = {
        "diagnosis": "Diagnosis",
        "description": "Findings",
        "recommendation": "Recommendation",
    }
    for field in _FIELDS:
        sections.extend(
            [
                f"## {headings[field]}",
                "",
                _marker(field, "start"),
                str(getattr(record, field) or "").strip(),
                _marker(field, "end"),
                "",
            ]
        )
    return "\n".join(
        [
            "---",
            "vmrb: " + json.dumps(metadata, ensure_ascii=False, separators=(",", ":")),
            "---",
            "",
            "# Clinical report",
            "",
            *sections,
        ]
    ).rstrip() + "\n"


def parse_report_document(text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for field in _FIELDS:
        start = _marker(field, "start")
        end = _marker(field, "end")
        if text.count(start) != 1 or text.count(end) != 1:
            raise ValueError("Invalid report document markers")
        value = text.split(start, 1)[1].split(end, 1)[0]
        values[field] = value.strip("\r\n")
    return values


def report_content(settings, record: MedicalRecord) -> dict[str, str]:
    fallback = {field: str(getattr(record, field) or "") for field in _FIELDS}
    if not record.content_path:
        return fallback
    try:
        path = stored_path(settings, record.content_path)
        payload = path.read_bytes()
        if record.content_size is not None and len(payload) != record.content_size:
            raise ValueError("Report document size mismatch")
        digest = hashlib.sha256(payload).hexdigest()
        if record.content_sha256 and digest != record.content_sha256:
            raise ValueError("Report document checksum mismatch")
        return parse_report_document(payload.decode("utf-8"))
    except (OSError, UnicodeError, ValueError):
        logger.error("Report document unavailable or invalid for record %s", record.id)
        raise APIError(500, 50003, "Report document is unavailable") from None


@dataclass
class ReportFileChange:
    new_path: Path
    old_path: Path | None


def _atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=path.parent, prefix=".report-", suffix=".tmp", delete=False
        ) as output:
            temporary = Path(output.name)
            output.write(content)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, path)
    finally:
        if temporary:
            temporary.unlink(missing_ok=True)


def write_report_document(settings, record: MedicalRecord) -> ReportFileChange:
    revision = (record.content_revision or 0) + 1
    payload = render_report_document(record, revision).encode("utf-8")
    digest = hashlib.sha256(payload).hexdigest()
    relative = report_relative_path(record.patient_id, record.id, revision, digest)
    path = stored_path(settings, relative)
    old_path = stored_path(settings, record.content_path) if record.content_path else None
    _atomic_write(path, payload)
    record.content_path = relative
    record.content_sha256 = digest
    record.content_size = len(payload)
    record.content_revision = revision
    return ReportFileChange(new_path=path, old_path=old_path)


def rollback_report_document(change: ReportFileChange | None) -> None:
    if change is None:
        return
    change.new_path.unlink(missing_ok=True)


def finalize_report_document(change: ReportFileChange | None) -> None:
    # Report files are immutable revisions.  Keeping the previous document makes
    # clinical/audit history inspectable by humans and future diagnostic agents.
    # The database pointer always selects the active revision.
    return None


def backfill_report_documents(settings, sessions) -> None:
    """Materialize a bounded batch of legacy rows.

    Startup runs this repeatedly, so large installations migrate incrementally
    instead of scanning every historical report before the API becomes ready.
    """
    with sessions() as db:
        changed = False
        rows = db.scalars(
            select(MedicalRecord)
            .where(MedicalRecord.content_path.is_(None))
            .order_by(MedicalRecord.id)
            .limit(200)
        ).yield_per(200)
        for record in rows:
            write_report_document(settings, record)
            changed = True
        if changed:
            db.commit()
