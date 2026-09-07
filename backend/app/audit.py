from sqlalchemy.orm import Session

from app.models import AuditEvent


def audit(
    db: Session,
    actor: int | None,
    patient: int | None,
    action: str,
    resource: str,
    resource_id: str | int,
    *,
    before=None,
    after=None,
):
    # Only record allowlisted snapshots. Never log credentials or identity numbers.
    db.add(
        AuditEvent(
            actor_user_id=actor,
            patient_id=patient,
            action=action,
            resource_type=resource,
            resource_id=str(resource_id),
            before=before,
            after=after,
        )
    )
