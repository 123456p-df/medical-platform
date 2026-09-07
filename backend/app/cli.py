"""Trusted operator commands; patient identity and access grants are never self-assigned."""

import argparse
import getpass
import secrets
import shutil
from datetime import date
from pathlib import Path
from uuid import uuid4

import trimesh
from cryptography.fernet import Fernet
from sqlalchemy import select

from app.audit import audit
from app.config import Settings
from app.db import make_engine, make_session_factory
from app.models import Doctor, DoctorPatientAccess, OrganModel, Patient, User
from app.organs import ORGANS
from app.security import encrypt_identity, identity_hash
from app.services.storage import relative_path, stored_path


def init_config():
    template = Path(__file__).resolve().parents[1] / ".env.example"
    content = template.read_text(encoding="utf-8")
    content = content.replace("JWT_SECRET=\n", f"JWT_SECRET={secrets.token_urlsafe(48)}\n")
    content = content.replace(
        "ID_ENCRYPTION_KEY=\n", f"ID_ENCRYPTION_KEY={Fernet.generate_key().decode()}\n"
    )
    content = content.replace("ID_HASH_KEY=\n", f"ID_HASH_KEY={secrets.token_urlsafe(48)}\n")
    with Path(".env").open("x", encoding="utf-8", newline="\n") as output:
        output.write(content)
    Path(".env").chmod(0o600)
    print("Created .env; fill DATABASE_URL and optional inference / AI settings.")


def provision_patient(
    db,
    settings,
    *,
    username,
    name,
    id_number,
    birth_date=None,
    gender=None,
    height=None,
    weight=None,
    blood_type=None,
):
    user = db.scalar(select(User).where(User.username == username, User.role == "patient"))
    if not user:
        raise ValueError("Register the patient account first")
    patient = db.scalar(select(Patient).where(Patient.user_id == user.id))
    patient.name = name.strip()
    patient.id_number_encrypted = encrypt_identity(id_number, settings)
    patient.id_number_hash = identity_hash(id_number, settings)
    patient.birth_date, patient.gender = birth_date, gender
    patient.height, patient.weight, patient.blood_type = height, weight, blood_type
    audit(db, None, patient.id, "patient.provision", "patient", patient.id)
    db.commit()
    return patient.id


def set_access(db, doctor_username, patient_id, status):
    doctor = db.scalar(
        select(Doctor)
        .join(User, User.id == Doctor.user_id)
        .where(User.username == doctor_username, User.role == "doctor")
    )
    if not doctor or not db.get(Patient, patient_id):
        raise ValueError("Doctor or patient not found")
    access = db.get(DoctorPatientAccess, (doctor.id, patient_id))
    before = {"status": access.status} if access else None
    if access is None:
        access = DoctorPatientAccess(doctor_id=doctor.id, patient_id=patient_id, status=status)
        db.add(access)
    else:
        access.status = status
    audit(
        db,
        None,
        patient_id,
        "access." + status,
        "doctor_patient_access",
        doctor.id,
        before=before,
        after={"status": status},
    )
    db.commit()


def install_default(db, settings, organ_id, source: Path):
    # Parse GLB without resolving any external URIs. Only self-contained local assets are accepted.
    from app.services.glb import validate_glb

    validate_glb(source)
    scene = trimesh.load(source, file_type="glb", force="scene")
    if not scene.geometry:
        raise ValueError("GLB must contain geometry")
    path = stored_path(settings, f"defaults/{organ_id}_{uuid4().hex}.glb")
    path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, path)
    model_id = f"default_{organ_id}"
    try:
        model = db.get(OrganModel, model_id)
        if model:
            model.file_path = relative_path(settings, path)
        else:
            db.add(
                OrganModel(
                    id=model_id,
                    organ_id=organ_id,
                    source="default",
                    format="glb",
                    file_path=relative_path(settings, path),
                )
            )
        audit(db, None, None, "model.install_default", "organ_model", model_id)
        db.commit()
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("init-config", help="Create .env; refuse to overwrite")
    patient = commands.add_parser(
        "provision-patient", help="Verify and fill an existing patient account"
    )
    patient.add_argument("--username", required=True)
    patient.add_argument("--name", required=True)
    patient.add_argument("--birth-date", type=date.fromisoformat)
    patient.add_argument("--gender", choices=["male", "female", "other", "unknown"])
    patient.add_argument("--height", type=float)
    patient.add_argument("--weight", type=float)
    patient.add_argument("--blood-type", choices=["A", "B", "AB", "O", "unknown"])
    for verb in ["grant-access", "revoke-access"]:
        access = commands.add_parser(
            verb, help="Operate only after obtaining the patient's authorization"
        )
        access.add_argument("--doctor", required=True)
        access.add_argument("--patient-id", type=int, required=True)
    default = commands.add_parser(
        "install-default", help="Install an existing default anatomical GLB"
    )
    default.add_argument("--organ", choices=list(ORGANS), required=True)
    default.add_argument("--file", type=Path, required=True)
    args = parser.parse_args()
    if args.command == "init-config":
        init_config()
        return
    settings = Settings()
    engine = make_engine(settings.database_url)
    try:
        with make_session_factory(engine)() as db:
            if args.command == "provision-patient":
                identity = getpass.getpass(
                    "ID number (hidden; never a command-line argument): "
                ).strip()
                if not 6 <= len(identity) <= 32 or not args.name.strip():
                    parser.error("Invalid patient name or ID length")
                patient_id = provision_patient(
                    db,
                    settings,
                    username=args.username,
                    name=args.name,
                    id_number=identity,
                    birth_date=args.birth_date,
                    gender=args.gender,
                    height=args.height,
                    weight=args.weight,
                    blood_type=args.blood_type,
                )
                print(f"Patient profile updated: patient_id={patient_id}")
            elif args.command in {"grant-access", "revoke-access"}:
                set_access(
                    db,
                    args.doctor,
                    args.patient_id,
                    "active" if args.command == "grant-access" else "revoked",
                )
                print("Access updated")
            else:
                install_default(db, settings, args.organ, args.file)
                print(f"Installed default_{args.organ}")
    except Exception as exc:
        # SQLAlchemy exception details can contain plaintext/encrypted identity parameters.
        parser.exit(
            1,
            f"Operation failed ({type(exc).__name__}); verify input and database configuration.\n",
        )
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
