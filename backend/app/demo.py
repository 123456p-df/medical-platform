"""Fixed demo accounts plus one public, de-identified real CT example."""

import os
import shutil
from datetime import date
from pathlib import Path

import trimesh
from sqlalchemy import select

from app.cli import install_default, provision_patient, set_access
from app.config import Settings
from app.db import make_engine, make_session_factory
from app.accounts import ACCOUNT_PROFILES, DEMO_PASSWORD
from app.models import Doctor, MedicalImage, MedicalRecord, OrganModel, Patient, User, utcnow
from app.organs import ORGANS
from app.security import hash_password, verify_password
from app.services.imaging import (
    acquisition_from_volume,
    load_volume,
    prepare_slice_cache,
    slice_cache_path,
)
from app.services.reports import rollback_report_document, write_report_document
from app.services.storage import imaging_relative_path, relative_path, stored_path


DEMO_PATIENTS = (
    ("demo_patient_full", "完整示例患者", date(1980, 1, 1), "male", "A"),
    ("demo_patient_test", "报告联调患者", date(1990, 4, 12), "female", "O"),
)


def demo_scan_path() -> tuple[Path, str]:
    project = Path(__file__).resolve().parents[2]
    configured = os.environ.get("VMRB_DEMO_SCAN_PATH")
    candidates = [
        (Path(configured).expanduser(), "lung") if configured else None,
        (project / ".cache/real-imaging/CT-chest.nii.gz", "lung"),
        (project / "datasets/medical_dataset/imagesTr/spleen_10.nii.gz", "spleen"),
    ]
    for item in candidates:
        if item is None:
            continue
        candidate, organ_id = item
        if candidate.is_file():
            return candidate, organ_id
    raise FileNotFoundError(
        "Real demo CT is missing; run scripts/real-imaging-samples.py or set "
        "VMRB_DEMO_SCAN_PATH to a de-identified NIfTI CT"
    )


def install_demo_image(
    db, settings, patient_id: int, image_id: str, source: Path, organ_id: str
):
    target = stored_path(settings, imaging_relative_path(patient_id, image_id, ".nii.gz"))
    target.parent.mkdir(parents=True, exist_ok=True)
    image = db.get(MedicalImage, image_id)
    is_new = image is None
    if not is_new and target.is_file() and slice_cache_path(target).is_file():
        return False
    shutil.copyfile(source, target)
    volume, data = load_volume(target, settings)
    canonical = prepare_slice_cache(target, volume, data)
    if image is None:
        image = MedicalImage(id=image_id)
        db.add(image)
    image.patient_id = patient_id
    image.organ_id = organ_id
    image.image_type = "CT"
    image.file_path = relative_path(settings, target)
    image.shape = list(canonical.shape)
    image.spacing = [float(value) for value in canonical.header.get_zooms()[:3]]
    image.size_bytes = target.stat().st_size
    image.study_date = date.today()
    image.created_at = utcnow()
    image.acquisition = acquisition_from_volume(volume, data)
    return is_new


def seed(settings):
    scan_path, sample_organ = demo_scan_path()
    engine = make_engine(settings.database_url)
    try:
        with make_session_factory(engine)() as db:
            aliases = {
                "demo_patient_full": "demo_patient",
                "demo_patient_test": "demo_patient_2",
            }
            for target, legacy in aliases.items():
                existing = db.scalar(select(User).where(User.username == target))
                old = db.scalar(select(User).where(User.username == legacy))
                if existing is None and old is not None:
                    old.username = target
                    db.commit()

            for username, role in (
                ("admin", "doctor"),
                ("demo_doctor", "doctor"),
                ("demo_patient_full", "patient"),
                ("demo_patient_test", "patient"),
            ):
                user = db.scalar(select(User).where(User.username == username))
                if user is None:
                    user = User(username=username, role=role, password_hash=hash_password(DEMO_PASSWORD))
                    db.add(user)
                    db.flush()
                elif user.role != role:
                    raise ValueError(f"Demo account role mismatch: {username}")
                elif not verify_password(DEMO_PASSWORD, user.password_hash):
                    user.password_hash = hash_password(DEMO_PASSWORD)
                user.profile = {**user.profile, **ACCOUNT_PROFILES[username]}
                linked_model = Doctor if role == "doctor" else Patient
                linked = db.scalar(select(linked_model).where(linked_model.user_id == user.id))
                if linked is None:
                    db.add(Doctor(user_id=user.id) if role == "doctor" else Patient(user_id=user.id))
                db.commit()

            doctor = db.scalar(
                select(Doctor)
                .join(User, User.id == Doctor.user_id)
                .where(User.username == "demo_doctor")
            )
            for index, (username, name, born, gender, blood_type) in enumerate(DEMO_PATIENTS):
                patient_id = provision_patient(
                    db,
                    settings,
                    username=username,
                    name=name,
                    id_number=f"DEMO-ID-{index + 1:06d}",
                    birth_date=born,
                    gender=gender,
                    height=170 + index,
                    weight=65 + index,
                    blood_type=blood_type,
                )
                patient = db.get(Patient, patient_id)
                patient.deleted_at = None
                set_access(db, "demo_doctor", patient_id, "active")
                set_access(db, "admin", patient_id, "active")
                if username != "demo_patient_full":
                    continue
                image_id = "img_demo_real_ct"
                is_new = install_demo_image(
                    db, settings, patient_id, image_id, scan_path, sample_organ
                )
                if is_new:
                    record = MedicalRecord(
                        patient_id=patient_id,
                        doctor_id=doctor.id,
                        examination_id=image_id,
                        organ_id=sample_organ,
                        diagnosis="去标识化真实 CT 示例",
                        description=(
                            "该影像仅用于系统演示和前后端联调，不代表患者临床发现或诊断。"
                        ),
                        recommendation="仅作技术演示，不用于医疗决策。",
                        reviewed=True,
                        signed_at=utcnow(),
                        record_date=date.today(),
                    )
                    db.add(record)
                    db.flush()
                    change = None
                    try:
                        change = write_report_document(settings, record)
                        db.commit()
                    except Exception:
                        db.rollback()
                        rollback_report_document(change)
                        raise
                else:
                    db.commit()

            for organ in ORGANS:
                if organ == "other":
                    continue
                if (
                    db.get(OrganModel, f"default_{organ}")
                    and os.environ.get("VMRB_REFRESH_DEMO_MODELS") != "1"
                ):
                    continue
                asset = (
                    Path(__file__).resolve().parents[2]
                    / "public/models"
                    / f"organ-{organ}.glb"
                )
                if asset.is_file():
                    install_default(db, settings, organ, asset)
                    continue
                scene = trimesh.Scene()
                if organ == "lung":
                    for offset in (-0.065, 0.065):
                        mesh = trimesh.creation.icosphere(subdivisions=3)
                        mesh.apply_scale([0.052, 0.11, 0.055])
                        mesh.apply_translation([offset, 0, 0])
                        mesh.visual.vertex_colors = [224, 134, 149, 255]
                        scene.add_geometry(mesh)
                else:
                    mesh = trimesh.creation.icosphere(subdivisions=3)
                    mesh.apply_scale([0.09, 0.065, 0.055])
                    mesh.visual.vertex_colors = [106, 171, 170, 255]
                    scene.add_geometry(mesh)
                scene.metadata["description"] = "Schematic demo geometry; not patient anatomy or segmentation"
                path = stored_path(settings, f"demo-assets/{organ}.glb")
                path.parent.mkdir(parents=True, exist_ok=True)
                scene.export(path)
                install_default(db, settings, organ, path)
    finally:
        engine.dispose()


if __name__ == "__main__":
    from sqlalchemy.engine import make_url

    settings = Settings()
    if (
        os.environ.get("VMRB_DEMO_SEED") != "1"
        or make_url(settings.database_url).database != "vmrb_preview"
    ):
        raise SystemExit("Demo seed is restricted to the explicitly enabled vmrb_preview database")
    seed(settings)
    print("Real demo CT fixtures are ready.")
