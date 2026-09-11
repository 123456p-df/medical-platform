from contextvars import ContextVar
from uuid import uuid4
from sqlalchemy.orm import Session

from app.models import AuditEvent

_audit_context: ContextVar[dict] = ContextVar("audit_context", default={})


def set_request_context(request_id: str | None, ip_address: str | None, user_agent: str | None):
    return _audit_context.set(
        {
            "request_id": request_id or uuid4().hex,
            "ip_address": ip_address,
            "user_agent": user_agent,
        }
    )


def reset_request_context(token):
    _audit_context.reset(token)


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
    context = _audit_context.get()
    db.add(
        AuditEvent(
            actor_user_id=actor,
            patient_id=patient,
            action=action,
            resource_type=resource,
            resource_id=str(resource_id),
            before=before,
            after=after,
            request_id=context.get("request_id"),
            ip_address=context.get("ip_address"),
            user_agent=context.get("user_agent"),
        )
    )
