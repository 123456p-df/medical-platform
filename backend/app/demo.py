"""Explicit demo fixtures for the local database using two sample CT scans."""

import os
import shutil
from datetime import date, timedelta
from pathlib import Path

import trimesh
from sqlalchemy import select

from app.cli import install_default, provision_patient, set_access
from app.config import Settings
from app.db import make_engine, make_session_factory
from app.demo_fixture import fixture_user_profile, is_fixture_user, load_demo_fixture
from app.models import Doctor, MedicalImage, MedicalRecord, OrganModel, Patient, User, utcnow
from app.organs import ORGANS
from app.security import hash_password
from app.services.imaging import load_volume, prepare_slice_cache, slice_cache_path
from app.services.storage import relative_path, stored_path

DEMO_FIXTURE = load_demo_fixture()
DEMO_PATIENTS = DEMO_FIXTURE.patients
DEMO_SCAN_FILENAMES = {
    "patient-001": "0.nii",
    "patient-002": "1.nii",
}
DEMO_PASSWORD = "123456"


def demo_scan_path(filename: str) -> Path | None:
    configured_root = os.environ.get("VMRB_DEMO_SCAN_DIR")
    if not configured_root:
        return None
    root = Path(configured_root).expanduser()
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
    scan_paths = [demo_scan_path(DEMO_SCAN_FILENAMES[item.fixture_id]) for item in DEMO_PATIENTS]
    engine = make_engine(settings.database_url)
    try:
        with make_session_factory(engine)() as db:
            for fixture_user in DEMO_FIXTURE.users:
                existing_user = db.scalar(
                    select(User).where(User.username == fixture_user.username)
                )
                if existing_user:
                    if not is_fixture_user(
                        username=existing_user.username,
                        role=existing_user.role,
                        profile=existing_user.profile,
                    ):
                        raise RuntimeError(
                            f"Refusing to reuse non-demo account {existing_user.username!r}"
                        )
                    existing_user.password_hash = hash_password(DEMO_PASSWORD)
                    existing_user.profile = fixture_user_profile()
                    db.commit()
                    continue
                user = User(
                    username=fixture_user.username,
                    role=fixture_user.role,
                    password_hash=hash_password(DEMO_PASSWORD),
                    profile=fixture_user_profile(),
                )
                db.add(user)
                db.flush()
                db.add(
                    Patient(user_id=user.id)
                    if fixture_user.role == "patient"
                    else Doctor(user_id=user.id)
                )
                db.commit()

            doctor = db.scalar(
                select(Doctor)
                .join(User, User.id == Doctor.user_id)
                .where(User.username == "demo_doctor")
            )
            for index, (fixture_patient, source) in enumerate(
                zip(DEMO_PATIENTS, scan_paths, strict=True)
            ):
                patient_id = provision_patient(
                    db,
                    settings,
                    username=fixture_patient.username,
                    name=fixture_patient.display_name,
                    id_number=(
                        f"DEMO-ID-{int(fixture_patient.fixture_id.removeprefix('patient-')):06d}"
                    ),
                    birth_date=fixture_patient.birth_date,
                    gender=fixture_patient.gender,
                    height=fixture_patient.height_cm,
                    weight=fixture_patient.weight_kg,
                    blood_type=fixture_patient.blood_type,
                )
                patient = db.get(Patient, patient_id)
                patient.deleted_at = None
                for doctor_username in fixture_patient.doctor_access:
                    set_access(db, doctor_username, patient_id, "active")
                if source is not None:
                    image_id = f"img_demo_{index + 1:04d}"
                    is_new = install_demo_image(
                        db, settings, patient_id, image_id, source, index
                    )
                    if is_new:
                        template = DEMO_FIXTURE.record_template
                        for days in template.day_offsets:
                            db.add(
                                MedicalRecord(
                                    patient_id=patient_id,
                                    doctor_id=doctor.id,
                                    organ_id=template.organ_id,
                                    diagnosis=template.diagnosis,
                                    description=template.description,
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
    scan_count = sum(
        demo_scan_path(DEMO_SCAN_FILENAMES[item.fixture_id]) is not None
        for item in DEMO_PATIENTS
    )
    print(f"Demo accounts and patients are ready ({scan_count} CT fixtures configured).")
