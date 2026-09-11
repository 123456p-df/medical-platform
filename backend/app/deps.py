from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings
from app.errors import APIError
from app.models import BreakGlassGrant, Doctor, DoctorPatientAccess, JwtRevocation, Patient, User, utcnow
from app.security import decode_token

bearer = HTTPBearer(auto_error=False)


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_db(request: Request):
    with request.app.state.session_factory() as session:
        yield session


DB = Annotated[Session, Depends(get_db)]
Config = Annotated[Settings, Depends(get_settings)]


def current_user(
    request: Request,
    db: DB,
    settings: Config,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise APIError(401, 40101, "Authentication required")
    try:
        user_id, jti, expires_at = decode_token(credentials.credentials, settings)
    except (InvalidTokenError, ValueError, TypeError, OverflowError):
        raise APIError(401, 40102, "Invalid or expired token") from None
    if db.get(JwtRevocation, jti) is not None:
        raise APIError(401, 40102, "Invalid or expired token")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise APIError(401, 40102, "Invalid or expired token")
    request.state.jwt_jti = jti
    request.state.jwt_expires_at = expires_at
    return user


CurrentUser = Annotated[User, Depends(current_user)]


def require_doctor(db: Session, user: User) -> Doctor:
    if user.role not in {"doctor", "admin"}:
        raise APIError(403, 40302, "Doctor role required")
    doctor = db.scalar(select(Doctor).where(Doctor.user_id == user.id))
    if doctor is None:
        raise APIError(403, 40302, "Doctor profile not found")
    return doctor


def require_admin(user: User) -> User:
    if user.role != "admin":
        raise APIError(403, 40303, "Administrator role required")
    return user


def check_patient_access(db: Session, user: User, patient_id: int, *, write=False) -> Patient:
    if write:
        require_doctor(db, user)
    patient = db.get(Patient, patient_id)
    if patient is None or patient.deleted_at is not None:
        raise APIError(404, 40401, "Patient not found")
    if user.role == "patient" and patient.user_id == user.id and not write:
        return patient
    if user.role in {"doctor", "admin"}:
        doctor = require_doctor(db, user)
        access = db.get(DoctorPatientAccess, (doctor.id, patient.id))
        if access and access.status == "active":
            return patient
        # Emergency access is deliberately read-only and time-limited. Every
        # grant is created through the audited break-glass endpoint below.
        if not write:
            grant = db.scalar(
                select(BreakGlassGrant)
                .where(
                    BreakGlassGrant.doctor_id == doctor.id,
                    BreakGlassGrant.patient_id == patient.id,
                    BreakGlassGrant.revoked_at.is_(None),
                    BreakGlassGrant.expires_at > utcnow(),
                )
                .order_by(BreakGlassGrant.expires_at.desc())
                .limit(1)
            )
            if grant is not None:
                return patient
    raise APIError(403, 40301, "No permission to access this patient")
