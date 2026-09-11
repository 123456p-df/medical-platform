"""Explicit synthetic fixtures for the isolated vmrb_preview database only."""

import os
from datetime import date, timedelta
from pathlib import Path

import nibabel as nib
import numpy as np
import trimesh
from sqlalchemy import select
from sqlalchemy.engine import make_url

from app.cli import install_default, provision_patient, set_access
from app.config import Settings
from app.db import make_engine, make_session_factory
from app.models import Doctor, MedicalImage, MedicalRecord, Patient, User, utcnow
from app.organs import ORGANS
from app.security import hash_password
from app.services.storage import relative_path, stored_path


def seed(settings):
    engine = make_engine(settings.database_url)
    with make_session_factory(engine)() as db:
        for username, role, password in [
            ("admin", "doctor", "Admin123!"),
            ("demo_doctor", "doctor", "DemoDoctor123!"),
            ("demo_patient", "patient", "DemoPatient123!"),
            ("demo_patient_2", "patient", "DemoPatient123!"),
            ("demo_patient_3", "patient", "DemoPatient123!"),
        ]:
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
        for index, (username, name, organ, modality, born, gender) in enumerate(
            [
                ("demo_patient", "张三（演示）", "lung", "CT", date(1980, 1, 1), "male"),
                ("demo_patient_2", "李薇（演示）", "kidney", "CT", date(1990, 4, 12), "female"),
                ("demo_patient_3", "陈宇（演示）", "brain", "MRI", date(1972, 9, 3), "male"),
            ]
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
                blood_type=["A", "O", "B"][index],
            )
            set_access(db, "demo_doctor", patient_id, "active")
            image_id = f"img_demo_{index + 1:04d}"
            if db.get(MedicalImage, image_id):
                continue
            x, y, z = np.mgrid[-1:1:96j, -1:1:96j, -1:1:48j]
            body = x * x / 0.8**2 + y * y / 0.7**2 < 1
            values = np.full(x.shape, -1000, dtype=np.float32)
            values[body] = 40
            if organ == "lung":
                lungs = (((x - 0.3) / 0.22) ** 2 + (y / 0.43) ** 2 + (z / 0.9) ** 2 < 1) | (
                    ((x + 0.3) / 0.22) ** 2 + (y / 0.43) ** 2 + (z / 0.9) ** 2 < 1
                )
                values[lungs] = -750
                spine = (x / 0.09) ** 2 + ((y + 0.4) / 0.1) ** 2 < 1
                values[spine] = 500
            else:
                values[body] = 40 + 65 * np.cos(12 * x[body]) * np.sin(8 * y[body]) * np.cos(
                    z[body]
                )
            if modality == "MRI":
                values = np.clip(values + 100, 0, 255)
            path = stored_path(settings, f"medical-images/{image_id}.nii.gz")
            path.parent.mkdir(parents=True, exist_ok=True)
            image = nib.Nifti1Image(values, np.diag([2.0, 2.0, 3.0, 1.0]))
            image.header.set_xyzt_units("mm")
            image.header["descrip"] = b"SYNTHETIC DEMO PHANTOM - NOT CLINICAL"
            nib.save(image, path)
            db.add(
                MedicalImage(
                    id=image_id,
                    patient_id=patient_id,
                    organ_id=organ,
                    image_type=modality,
                    file_path=relative_path(settings, path),
                    shape=list(values.shape),
                    spacing=[2.0, 2.0, 3.0],
                    size_bytes=path.stat().st_size,
                    created_at=utcnow() - timedelta(days=index),
                )
            )
            for days in [14, 0]:
                db.add(
                    MedicalRecord(
                        patient_id=patient_id,
                        doctor_id=doctor.id,
                        organ_id=organ,
                        diagnosis=f"演示病历 · {ORGANS[organ]}资料记录",
                        description="仅用于前后端联调的合成样例。可在此查看时间线、编辑记录和浏览影像。\n"
                        "影像为数学模型生成的演示体数据，不包含真实患者信息，也不表示检查发现或诊断。",
                        record_date=date.today() - timedelta(days=days + index),
                    )
                )
            db.commit()
        for organ in ORGANS:
            if organ == "other":
                continue
            # Only reference assets: never mark synthetic geometry as model inference.
            from app.models import OrganModel

            if (
                db.get(OrganModel, f"default_{organ}")
                and os.environ.get("VMRB_REFRESH_DEMO_MODELS") != "1"
            ):
                continue
            asset = (
                Path(__file__).resolve().parents[2]
                / "medical-platform/Medical/public/models"
                / f"organ-{organ}.glb"
            )
            if asset.is_file():
                install_default(db, settings, organ, asset)
                continue
            scene = trimesh.Scene()
            if organ == "lung":
                for offset in [-0.065, 0.065]:
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
            scene.metadata["description"] = (
                "Schematic demo geometry; not patient anatomy or segmentation"
            )
            path = stored_path(settings, f"demo-assets/{organ}.glb")
            path.parent.mkdir(parents=True, exist_ok=True)
            scene.export(path)
            install_default(db, settings, organ, path)
    engine.dispose()


if __name__ == "__main__":
    settings = Settings()
    if (
        os.environ.get("VMRB_DEMO_SEED") != "1"
        or make_url(settings.database_url).database != "vmrb_preview"
    ):
        raise SystemExit("Demo seed is restricted to the explicitly enabled vmrb_preview database")
    seed(settings)
    print("Synthetic preview fixtures are ready.")
