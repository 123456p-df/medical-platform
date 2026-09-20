from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, Query
from sqlalchemy import String, cast, func, or_, select

from app.audit import audit
from app.deps import DB, CurrentUser, require_admin
from app.errors import APIError, Envelope, success
from app.models import (
    AnalysisTask,
    AuditEvent,
    Doctor,
    DoctorPatientAccess,
    MedicalImage,
    MedicalRecord,
    Patient,
    ReportTemplate,
    User,
    utcnow,
)
from app.schemas import (
    AdminStatsOut,
    AdminUserOut,
    AdminUserPage,
    PasswordResetInput,
    PatientAccessInput,
    PatientAccessOut,
    PatientAccessPage,
    TemplateUsageOut,
    UserStatusInput,
)
from app.security import hash_password

router = APIRouter(prefix="/admin", tags=["Administration"])


def admin_user_out(user: User) -> dict:
    return {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "is_active": user.is_active and user.deleted_at is None,
        "department": str((user.profile or {}).get("department") or ""),
        "last_login_at": user.last_login_at,
        "created_at": user.created_at,
        "deleted_at": user.deleted_at,
    }


def require_manageable_user(db, user_id: int, actor: User) -> User:
    target = db.get(User, user_id)
    if target is None or target.deleted_at is not None:
        raise APIError(404, 40412, "User not found")
    if target.id == actor.id:
        raise APIError(409, 40920, "You cannot modify the current administrator account")
    return target


@router.get("/users", response_model=Envelope[AdminUserPage])
def list_users(
    db: DB,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=100),
    role: str | None = Query(None, pattern="^(admin|doctor|patient)$"),
    active_only: bool = Query(False),
):
    require_admin(user)
    query = select(User).where(User.deleted_at.is_(None))
    if role:
        query = query.where(User.role == role)
    if active_only:
        query = query.where(User.is_active.is_(True))
    if search and search.strip():
        needle = f"%{search.strip()}%"
        query = query.where(or_(User.username.ilike(needle), cast(User.id, String).ilike(needle)))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = db.scalars(
        query.order_by(User.role, User.username, User.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return success(
        {
            "items": [admin_user_out(row) for row in rows],
            "page": page,
            "page_size": page_size,
            "total": total,
        }
    )


@router.patch("/users/{user_id}/status", response_model=Envelope[AdminUserOut])
def set_user_status(user_id: int, body: UserStatusInput, db: DB, user: CurrentUser):
    require_admin(user)
    target = require_manageable_user(db, user_id, user)
    target.is_active = body.is_active
    if not body.is_active:
        target.token_version += 1
    audit(
        db,
        user.id,
        None,
        "admin.user.status",
        "user",
        target.id,
        after={"is_active": body.is_active},
    )
    db.commit()
    return success(admin_user_out(target))


@router.post("/users/{user_id}/reset-password", response_model=Envelope[None])
def reset_user_password(user_id: int, body: PasswordResetInput, db: DB, user: CurrentUser):
    require_admin(user)
    target = require_manageable_user(db, user_id, user)
    target.password_hash = hash_password(body.new_password)
    target.token_version += 1
    audit(db, user.id, None, "admin.user.password_reset", "user", target.id)
    db.commit()
    return success(None)


@router.post("/users/{user_id}/force-logout", response_model=Envelope[None])
def force_user_logout(user_id: int, db: DB, user: CurrentUser):
    require_admin(user)
    target = require_manageable_user(db, user_id, user)
    target.token_version += 1
    audit(db, user.id, None, "admin.user.force_logout", "user", target.id)
    db.commit()
    return success(None)


@router.delete("/users/{user_id}", response_model=Envelope[None])
def delete_user(user_id: int, db: DB, user: CurrentUser):
    require_admin(user)
    target = require_manageable_user(db, user_id, user)
    target.is_active = False
    target.deleted_at = utcnow()
    target.token_version += 1
    audit(db, user.id, None, "admin.user.delete", "user", target.id)
    db.commit()
    return success(None)


def access_out(db, access: DoctorPatientAccess) -> dict:
    doctor = db.get(Doctor, access.doctor_id)
    doctor_user = db.get(User, doctor.user_id) if doctor else None
    patient = db.get(Patient, access.patient_id)
    return {
        "doctor_user_id": doctor_user.id if doctor_user else 0,
        "doctor_username": doctor_user.username if doctor_user else "unknown",
        "doctor_name": str((doctor_user.profile or {}).get("display_name") or doctor_user.username) if doctor_user else "unknown",
        "patient_id": access.patient_id,
        "patient_name": patient.name if patient else None,
        "status": access.status,
        "created_at": access.created_at,
    }


@router.get("/users/{user_id}/patients", response_model=Envelope[PatientAccessPage])
def user_patients(user_id: int, db: DB, user: CurrentUser):
    require_admin(user)
    doctor = db.scalar(select(Doctor).where(Doctor.user_id == user_id))
    if doctor is None:
        raise APIError(404, 40412, "Doctor not found")
    rows = db.scalars(
        select(DoctorPatientAccess)
        .where(DoctorPatientAccess.doctor_id == doctor.id)
        .order_by(DoctorPatientAccess.created_at.desc())
    )
    items = [access_out(db, row) for row in rows]
    return success({"items": items, "total": len(items)})


@router.put("/patient-access", response_model=Envelope[PatientAccessOut])
def set_patient_access(body: PatientAccessInput, db: DB, user: CurrentUser):
    require_admin(user)
    doctor = db.scalar(select(Doctor).where(Doctor.user_id == body.doctor_user_id))
    patient = db.get(Patient, body.patient_id)
    if doctor is None or patient is None or patient.deleted_at is not None:
        raise APIError(404, 40412, "Doctor or patient not found")
    access = db.get(DoctorPatientAccess, (doctor.id, patient.id))
    if access is None:
        access = DoctorPatientAccess(
            doctor_id=doctor.id,
            patient_id=patient.id,
            status=body.status,
        )
        db.add(access)
    else:
        access.status = body.status
    audit(
        db,
        user.id,
        patient.id,
        "admin.patient_access.set",
        "doctor_patient_access",
        f"{doctor.id}:{patient.id}",
        after={"status": body.status},
    )
    db.commit()
    return success(access_out(db, access))


def daily_counts(rows, since: datetime) -> list[dict]:
    counts: dict[date, int] = {}
    for value in rows:
        if value is None:
            continue
        current = value.astimezone(UTC).date() if value.tzinfo else value.date()
        if current >= since.date():
            counts[current] = counts.get(current, 0) + 1
    return [{"date": key, "count": counts[key]} for key in sorted(counts)]


@router.get("/stats", response_model=Envelope[AdminStatsOut])
def stats(
    db: DB,
    user: CurrentUser,
    days: int = Query(30, ge=1, le=365),
):
    require_admin(user)
    since = utcnow() - timedelta(days=days - 1)
    new_patients = list(db.scalars(select(Patient.created_at).where(Patient.created_at >= since)))
    image_uploads = list(db.scalars(select(MedicalImage.created_at).where(MedicalImage.created_at >= since)))
    ai_tasks = list(db.scalars(select(AnalysisTask.created_at).where(AnalysisTask.created_at >= since)))
    signed_reports = list(
        db.scalars(
            select(MedicalRecord.signed_at).where(
                MedicalRecord.signed_at.is_not(None),
                MedicalRecord.signed_at >= since,
                MedicalRecord.deleted_at.is_(None),
            )
        )
    )
    doctor_rows = db.execute(
        select(User, Doctor)
        .join(Doctor, Doctor.user_id == User.id)
        .where(User.deleted_at.is_(None))
        .order_by(User.username)
    )
    activity = []
    for doctor_user, doctor in doctor_rows:
        signed = db.scalar(
            select(func.count()).select_from(MedicalRecord).where(
                MedicalRecord.doctor_id == doctor.id,
                MedicalRecord.signed_at.is_not(None),
                MedicalRecord.signed_at >= since,
                MedicalRecord.deleted_at.is_(None),
            )
        ) or 0
        uploaded = db.scalar(
            select(func.count()).select_from(AuditEvent).where(
                AuditEvent.actor_user_id == doctor_user.id,
                AuditEvent.action == "image.upload",
                AuditEvent.created_at >= since,
            )
        ) or 0
        actions = db.scalar(
            select(func.count()).select_from(AuditEvent).where(
                AuditEvent.actor_user_id == doctor_user.id,
                AuditEvent.created_at >= since,
            )
        ) or 0
        activity.append(
            {
                "user_id": doctor_user.id,
                "username": doctor_user.username,
                "display_name": str((doctor_user.profile or {}).get("display_name") or doctor_user.username),
                "signed_reports": signed,
                "images_uploaded": uploaded,
                "audit_actions": actions,
            }
        )
    return success(
        {
            "days": days,
            "new_patients": daily_counts(new_patients, since),
            "image_uploads": daily_counts(image_uploads, since),
            "ai_tasks": daily_counts(ai_tasks, since),
            "signed_reports": daily_counts(signed_reports, since),
            "doctor_activity": activity,
        }
    )


@router.get("/report-template-usage", response_model=Envelope[list[TemplateUsageOut]])
def report_template_usage(db: DB, user: CurrentUser):
    require_admin(user)
    rows = db.execute(
        select(
            MedicalRecord.report_template_id,
            ReportTemplate.name,
            User.id,
            User.username,
            User.profile,
        )
        .join(Doctor, Doctor.id == MedicalRecord.doctor_id)
        .join(User, User.id == Doctor.user_id)
        .outerjoin(ReportTemplate, ReportTemplate.id == MedicalRecord.report_template_id)
        .where(MedicalRecord.deleted_at.is_(None), MedicalRecord.report_template_id.is_not(None))
    )
    aggregate: dict[tuple[str, int], dict] = {}
    for template_id, template_name, user_id, username, profile in rows:
        key = (template_id, user_id)
        item = aggregate.setdefault(
            key,
            {
                "template_id": template_id,
                "template_name": template_name or template_id,
                "doctor_user_id": user_id,
                "doctor_name": str((profile or {}).get("display_name") or username),
                "report_count": 0,
            },
        )
        item["report_count"] += 1
    return success(
        sorted(aggregate.values(), key=lambda item: item["report_count"], reverse=True)
    )
