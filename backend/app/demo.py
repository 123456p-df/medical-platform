"""Explicit demo fixtures for the local database using three real CT samples."""

import os
import shutil
from datetime import date, timedelta
from pathlib import Path

import trimesh
from sqlalchemy import select

from app.cli import install_default, provision_patient, set_access
from app.config import Settings
from app.db import make_engine, make_session_factory
from app.models import Doctor, MedicalImage, MedicalRecord, OrganModel, Patient, User, utcnow
from app.organs import ORGANS
from app.security import hash_password
from app.services.imaging import load_volume, prepare_slice_cache, slice_cache_path
from app.services.storage import relative_path, stored_path


DEMO_PATIENTS = (
    ("demo_patient", "张三（演示）", "0.nii", date(1980, 1, 1), "male", "A"),
    ("demo_patient_2", "李薇（演示）", "1.nii", date(1990, 4, 12), "female", "O"),
    ("demo_patient_3", "陈宇（演示）", "10.nii", date(1972, 9, 3), "male", "B"),
)


def demo_scan_path(filename: str) -> Path:
    root = Path(
        os.environ.get(
            "VMRB_DEMO_SCAN_DIR",
            "/home/zhichun/Documents/NV-Segment-CTMR/test_data/user_scans",
        )
    ).expanduser()
    for candidate in (root / filename, root / f"{filename}.gz"):
        if candidate.is_file():
            return candidate
    raise FileNotFoundError(
        f"Demo scan {filename} was not found in {root}; set VMRB_DEMO_SCAN_DIR to the sample directory"
    )


def install_demo_image(db, settings, patient_id: int, image_id: str, source: Path, day_offset: int):
    target = stored_path(settings, f"medical-images/{image_id}.nii.gz")
    target.parent.mkdir(parents=True, exist_ok=True)
    for suffix in (".nii", ".nii.gz"):
        stale = stored_path(settings, f"medical-images/{image_id}{suffix}")
        stale.unlink(missing_ok=True)
        slice_cache_path(stale).unlink(missing_ok=True)
    shutil.copyfile(source, target)
    volume, data = load_volume(target, settings)
    canonical = prepare_slice_cache(target, volume, data)

    image = db.get(MedicalImage, image_id)
    is_new = image is None
    if image is None:
        image = MedicalImage(id=image_id)
        db.add(image)
    image.patient_id = patient_id
    image.organ_id = "lung"
    image.image_type = "CT"
    image.file_path = relative_path(settings, target)
    image.shape = list(canonical.shape)
    image.spacing = [float(value) for value in canonical.header.get_zooms()[:3]]
    image.size_bytes = target.stat().st_size
    image.study_date = date.today() - timedelta(days=day_offset)
    image.created_at = utcnow() - timedelta(days=day_offset)
    return is_new


def seed(settings):
    scan_paths = [demo_scan_path(scan_name) for _, _, scan_name, _, _, _ in DEMO_PATIENTS]
    engine = make_engine(settings.database_url)
    try:
        with make_session_factory(engine)() as db:
            for username, role, password in (
                ("admin", "doctor", "Admin123!"),
                ("demo_doctor", "doctor", "DemoDoctor123!"),
                ("demo_patient", "patient", "DemoPatient123!"),
                ("demo_patient_2", "patient", "DemoPatient123!"),
                ("demo_patient_3", "patient", "DemoPatient123!"),
            ):
                if db.scalar(select(User).where(User.username == username)):
                    continue
                user = User(username=username, role=role, password_hash=hash_password(password))
                db.add(user)
                db.flush()
                db.add(Doctor(user_id=user.id) if role == "doctor" else Patient(user_id=user.id))
                db.commit()

            doctor = db.scalar(
                select(Doctor)
                .join(User, User.id == Doctor.user_id)
                .where(User.username == "demo_doctor")
            )
            for index, ((username, name, _, born, gender, blood_type), source) in enumerate(
                zip(DEMO_PATIENTS, scan_paths)
            ):
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
                image_id = f"img_demo_{index + 1:04d}"
                is_new = install_demo_image(db, settings, patient_id, image_id, source, index)
                if is_new:
                    for days in (14, 0):
                        db.add(
                            MedicalRecord(
                                patient_id=patient_id,
                                doctor_id=doctor.id,
                                organ_id="lung",
                                diagnosis="演示病历 · 肺部 CT 资料记录",
                                description=(
                                    "仅用于前后端联调的去标识化 CT 样例，不代表临床发现或诊断。"
                                ),
                                record_date=date.today() - timedelta(days=days + index),
                            )
                        )
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
