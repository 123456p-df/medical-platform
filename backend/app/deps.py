from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings
from app.errors import APIError
from app.models import Doctor, DoctorPatientAccess, Patient, User
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
    db: DB,
    settings: Config,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise APIError(401, 40101, "Authentication required")
    try:
        user_id = decode_token(credentials.credentials, settings)
    except (InvalidTokenError, ValueError, TypeError, OverflowError):
        raise APIError(401, 40102, "Invalid or expired token") from None
    user = db.get(User, user_id)
    if user is None:
        raise APIError(401, 40102, "Invalid or expired token")
    return user


CurrentUser = Annotated[User, Depends(current_user)]


def require_doctor(db: Session, user: User) -> Doctor:
    if user.role != "doctor":
        raise APIError(403, 40302, "Doctor role required")
    doctor = db.scalar(select(Doctor).where(Doctor.user_id == user.id))
    if doctor is None:
        raise APIError(403, 40302, "Doctor profile not found")
    return doctor


def check_patient_access(db: Session, user: User, patient_id: int, *, write=False) -> Patient:
    if write:
        require_doctor(db, user)
    patient = db.get(Patient, patient_id)
    if patient is None or patient.deleted_at is not None:
        raise APIError(404, 40401, "Patient not found")
    if user.role == "patient" and patient.user_id == user.id and not write:
        return patient
    if user.role == "doctor":
        doctor = require_doctor(db, user)
        access = db.get(DoctorPatientAccess, (doctor.id, patient.id))
        if access and access.status == "active":
            return patient
    raise APIError(403, 40301, "No permission to access this patient")
