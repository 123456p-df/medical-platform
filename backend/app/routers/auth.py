from fastapi import APIRouter, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.audit import audit

from app.deps import DB, Config, CurrentUser, require_admin
from app.errors import APIError, Envelope, success
from app.models import Doctor, JwtRevocation, Patient, User
from app.schemas import Credentials, DoctorProvisionInput, RegisterInput, TokenOut, UserOut
from app.security import create_token, dummy_hash, hash_password, password_hasher, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


def user_out(user: User):
    return {"user_id": user.id, "username": user.username, "role": user.role}


@router.post("/register", status_code=201, response_model=Envelope[UserOut])
def register(body: RegisterInput, db: DB):
    user = User(username=body.username, password_hash=hash_password(body.password), role=body.role)
    db.add(user)
    try:
        db.flush()
        db.add(Doctor(user_id=user.id) if user.role == "doctor" else Patient(user_id=user.id))
        db.commit()
    except IntegrityError:
        db.rollback()
        raise APIError(409, 40901, "Username already exists") from None
    return success(user_out(user))


@router.post("/logout", response_model=Envelope[None])
def logout(request: Request, db: DB, user: CurrentUser):
    jti = getattr(request.state, "jwt_jti", None)
    expires_at = getattr(request.state, "jwt_expires_at", None)
    if jti and expires_at and db.get(JwtRevocation, jti) is None:
        db.add(JwtRevocation(jti=jti, user_id=user.id, expires_at=expires_at))
        db.commit()
    return success(None)


@router.post("/login", response_model=Envelope[TokenOut])
def login(body: Credentials, db: DB, settings: Config):
    user = db.scalar(select(User).where(User.username == body.username))
    valid = verify_password(body.password, user.password_hash if user else dummy_hash)
    if user is None or not valid:
        raise APIError(401, 40103, "Invalid username or password")
    if password_hasher.check_needs_rehash(user.password_hash):
        user.password_hash = hash_password(body.password)
        db.commit()
    return success(
        {
            "access_token": create_token(user, settings),
            "token_type": "bearer",
            "role": user.role,
            "user_id": user.id,
        }
    )


@router.get("/me", response_model=Envelope[UserOut])
def me(user: CurrentUser, db: DB):
    result = user_out(user)
    result["patient_id"] = db.scalar(select(Patient.id).where(Patient.user_id == user.id))
    return success(result)


@router.post("/admin/doctors", status_code=201, response_model=Envelope[UserOut])
def provision_doctor(body: DoctorProvisionInput, db: DB, user: CurrentUser):
    require_admin(user)
    doctor_user = User(
        username=body.username,
        password_hash=hash_password(body.password),
        role="doctor",
        profile={"department": body.department.strip()},
    )
    db.add(doctor_user)
    try:
        db.flush()
        db.add(Doctor(user_id=doctor_user.id))
        audit(db, user.id, None, "admin.doctor.create", "user", doctor_user.id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise APIError(409, 40901, "Username already exists") from None
    return success(user_out(doctor_user))
