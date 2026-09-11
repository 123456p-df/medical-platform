import os
from pathlib import Path
from uuid import uuid4

import nibabel as nib
import numpy as np
import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.cli import provision_patient, set_access
from app.config import Settings
from app.db import Base, make_engine
from app.main import create_app
from app.services.ai import AIAnswer


class SyntheticAdapter:
    """Deterministic geometry fixture, never used by the real application."""

    image_types = {"CT"}

    def __call__(self, *, image_path, organ_id, output_dir, progress):
        original = nib.load(image_path)
        data = np.zeros(original.shape, dtype=np.uint8)
        data[2:-2, 2:-2, 2:-2] = 1
        output = output_dir / "mask.nii.gz"
        nib.save(nib.Nifti1Image(data, original.affine, original.header), output)
        progress(65)
        return output


class SyntheticBatchAdapter(SyntheticAdapter):
    """All-label fixture used to exercise upload-triggered reconstruction."""

    def __init__(self):
        from app.services.label_catalog import LabelCatalog

        self.catalog = LabelCatalog(None)

    def run_batch(self, *, image_path, output_dir, progress):
        original = nib.load(image_path)
        data = np.zeros(original.shape, dtype=np.uint8)
        data[2:6, 2:8, 2:10] = 1
        data[6:10, 8:13, 10:15] = 3
        one = output_dir / "label_map_1mm.nii.gz"
        native = output_dir / "label_map_native.nii.gz"
        nib.save(nib.Nifti1Image(data, original.affine, original.header), one)
        nib.save(nib.Nifti1Image(data, original.affine, original.header), native)
        progress(100)
        return {"label_map_1mm": one, "label_map_native": native, "labels": [1, 3]}


class SyntheticDetectionAdapter:
    """Deterministic RAS/cccwhd model response used only by API tests."""

    image_types = {"CT"}
    model_name = "synthetic/lung-nodule:1"

    def __call__(self, *, image_path, score_threshold, progress):
        assert image_path.is_file()
        progress(70)
        return {
            "model_name": self.model_name,
            "coordinate_system": "RAS",
            "box_mode": "cccwhd",
            "findings": [
                {
                    "box": [10.0, 18.0, 28.0, 8.0, 9.0, 12.0],
                    "score": 0.93,
                    "label": 0,
                    "lobe": "right_upper_lobe",
                }
            ],
        }


class CapturingAI:
    def __init__(self):
        self.calls = []

    def answer(self, context, question, role):
        self.calls.append((context, question, role))
        ids = [r["record_id"] for r in context["records"]]
        return AIAnswer(answer="测试用病历总结，不是真实医疗回答。", used_record_ids=ids)


@pytest.fixture
def app_env(tmp_path):
    # Optional real PostgreSQL integration run: each test receives a fresh private schema.
    postgres = os.environ.get("TEST_DATABASE_URL")
    cleanup = None
    if postgres:
        schema = "test_" + uuid4().hex
        admin = create_engine(postgres)
        with admin.begin() as connection:
            connection.execute(text(f'CREATE SCHEMA "{schema}"'))
        engine = create_engine(postgres, connect_args={"options": f"-csearch_path={schema}"})

        def cleanup():
            with admin.begin() as connection:
                connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
            admin.dispose()

        url = postgres
    else:
        url = "sqlite:///" + (tmp_path / "test.db").as_posix()
        engine = make_engine(url)
    settings = Settings(
        _env_file=None,
        database_url=url,
        jwt_secret="j" * 48,
        id_hash_key="h" * 48,
        id_encryption_key=Fernet.generate_key().decode(),
        storage_root=tmp_path / "storage",
        allow_registration=True,
        max_upload_bytes=1024 * 1024,
        max_uncompressed_bytes=4 * 1024 * 1024,
        max_volume_voxels=1000000,
        segmentation_callable=None,
        nv_segment_ct_dir=None,
        ai_base_url=None,
        ai_model=None,
    )
    Base.metadata.create_all(engine)
    provider = CapturingAI()
    app = create_app(
        settings,
        engine=engine,
        segmentation_adapter=SyntheticAdapter(),
        analysis_adapter=SyntheticDetectionAdapter(),
        ai_provider=provider,
    )
    try:
        with TestClient(app, raise_server_exceptions=False) as client:
            yield app, client, settings, provider
    finally:
        if cleanup:
            cleanup()


@pytest.fixture
def people(app_env):
    app, client, settings, _ = app_env
    result = {}
    for username, role in [
        ("doctor_a", "doctor"),
        ("doctor_b", "doctor"),
        ("patient_a", "patient"),
        ("patient_b", "patient"),
    ]:
        response = client.post(
            "/api/v1/auth/register",
            json={"username": username, "password": "password-test-123", "role": role},
        )
        assert response.status_code == 201, response.text
        result[username + "_id"] = response.json()["data"]["user_id"]
        token = client.post(
            "/api/v1/auth/login", json={"username": username, "password": "password-test-123"}
        ).json()["data"]["access_token"]
        result[username] = {"Authorization": f"Bearer {token}"}
    with app.state.session_factory() as db:
        for username, name, identity in [
            ("patient_a", "测试患者甲", "TEST-ID-000001"),
            ("patient_b", "测试患者乙", "TEST-ID-000002"),
        ]:
            pid = provision_patient(db, settings, username=username, name=name, id_number=identity)
            result[username + "_pid"] = pid
        set_access(db, "doctor_a", result["patient_a_pid"], "active")
    return result


@pytest.fixture
def nifti_file(tmp_path) -> Path:
    data = np.arange(12 * 14 * 16, dtype=np.float32).reshape(12, 14, 16)
    image = nib.Nifti1Image(data, np.diag([2.0, 3.0, 4.0, 1.0]))
    image.header.set_xyzt_units("mm")
    path = tmp_path / "synthetic.nii.gz"
    nib.save(image, path)
    return path


def upload(client, people, path, image_type="CT", organ_id="lung"):
    with path.open("rb") as file:
        response = client.post(
            f"/api/v1/patients/{people['patient_a_pid']}/medical-images",
            headers=people["doctor_a"],
            files={"file": (path.name, file)},
            data={"organ_id": organ_id, "image_type": image_type},
        )
    assert response.status_code == 201, response.text
    return response.json()["data"]["image_id"]


def record(client, people, **fields):
    data = {
        "organ_id": "lung",
        "diagnosis": "测试记录",
        "description": "仅用于软件测试",
        "record_date": "2026-08-20",
    } | fields
    response = client.post(
        f"/api/v1/patients/{people['patient_a_pid']}/medical-records",
        headers=people["doctor_a"],
        json=data,
    )
    assert response.status_code == 201, response.text
    return response.json()["data"]["record_id"]
