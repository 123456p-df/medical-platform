"""Exercise real public CT/MRI volumes through upload, metadata, and MPR HTTP APIs.

Uses an isolated temporary database and no live patient records or segmentation model.
Run after real-imaging-samples.py with the backend Python environment.
"""
import io
import json
import sys
import tempfile
import time
from pathlib import Path

import nibabel as nib
import numpy as np
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.config import Settings  # noqa: E402
from app.db import Base, make_engine  # noqa: E402
from app.main import create_app  # noqa: E402


def main():
    output = ROOT / ".cache/real-imaging/validation"
    output.mkdir(parents=True, exist_ok=True)
    results = []
    with tempfile.TemporaryDirectory(dir=ROOT / ".cache") as temporary:
        settings = Settings(_env_file=None, database_url="sqlite:///" + Path(temporary).as_posix() + "/test.db",
            jwt_secret="j" * 48, id_hash_key="h" * 48, id_encryption_key=Fernet.generate_key().decode(),
            storage_root=Path(temporary) / "images", ai_base_url=None, ai_model=None,
            nv_segment_ct_dir=None, segmentation_callable=None)
        engine = make_engine(settings.database_url)
        Base.metadata.create_all(engine)
        with TestClient(create_app(settings, engine=engine)) as client:
            credentials = {"username": "sample_doctor", "password": "SampleTesting123!"}
            client.post("/api/v1/auth/register", json={**credentials, "role": "doctor"}).raise_for_status()
            token = client.post("/api/v1/auth/login", json=credentials).json()["data"]["access_token"]
            auth = {"Authorization": "Bearer " + token}
            for name, modality, organ in [("CT-chest", "CT", "lung"), ("MR-head", "MRI", "brain")]:
                patient = client.post("/api/v1/patients", headers=auth,
                    json={"name": "Public sample " + name, "id_number": "SLICER-PUBLIC-" + name})
                patient.raise_for_status()
                pid = patient.json()["data"]["patient_id"]
                path = ROOT / ".cache/real-imaging" / (name + ".nii.gz")
                with path.open("rb") as file:
                    response = client.post(f"/api/v1/patients/{pid}/medical-images", headers=auth,
                        files={"file": (path.name, file)}, data={"organ_id": organ, "image_type": modality})
                response.raise_for_status()
                metadata = response.json()["data"]
                canonical = nib.as_closest_canonical(nib.load(path))
                source = canonical.get_fdata(dtype=np.float32)
                assert metadata["shape"] == list(source.shape)
                np.testing.assert_allclose(metadata["spacing"], canonical.header.get_zooms())
                # Save the authenticated NPY response for the browser renderer's pixel/performance checks.
                volume_response = client.get(f"/api/v1/medical-images/{metadata['image_id']}/volume", headers=auth)
                volume_response.raise_for_status()
                np.testing.assert_array_equal(np.load(io.BytesIO(volume_response.content), allow_pickle=False), source)
                (output / f"{name}.npy").write_bytes(volume_response.content)
                checks = []
                for axis, dimension in [("axial", 2), ("coronal", 1), ("sagittal", 0)]:
                    for index in [0, source.shape[dimension] // 2, source.shape[dimension] - 1]:
                        query = f"?axis={axis}"
                        if modality == "CT":
                            query += "&window_center=-600&window_width=1500"
                        start = time.perf_counter()
                        response = client.get(f"/api/v1/medical-images/{metadata['image_id']}/slice/{index}{query}", headers=auth)
                        response.raise_for_status()
                        elapsed = round(time.perf_counter() - start, 3)
                        actual = np.array(Image.open(io.BytesIO(response.content)))
                        plane = np.take(source, index, axis=dimension)
                        low, high = (-1350, 150) if modality == "CT" else np.percentile(plane, [1, 99])
                        expected = np.zeros(plane.shape, dtype=np.uint8) if high <= low else (np.clip((plane-low)/(high-low), 0, 1)*255).astype(np.uint8)
                        np.testing.assert_array_equal(actual, np.flip(expected.T, axis=(0, 1)))
                        (output / f"{name}-{axis}-{index}.gray").write_bytes(actual.tobytes())
                        assert response.headers["x-slice-axis"] == axis
                        if index == source.shape[dimension] // 2:
                            (output / f"{name}-{axis}.png").write_bytes(response.content)
                        checks.append({"axis": axis, "index": index, "pixels_match": True, "seconds": elapsed})
                results.append({"sample": name, "modality": modality, "shape": metadata["shape"],
                    "spacing": metadata["spacing"], "checks": checks})
                print(name, "upload + metadata + 9 MPR slices passed", flush=True)
    (output / "results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(output / "results.json")


if __name__ == "__main__":
    main()
