"""Import downloaded public Slicer samples into the explicitly enabled local preview.

VMRB_DEMO_SEED=1 backend/.venv/Scripts/python.exe scripts/seed-public-imaging-preview.py
"""
import os
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]


def main():
    if os.environ.get("VMRB_DEMO_SEED") != "1":
        raise SystemExit("Explicitly set VMRB_DEMO_SEED=1 for this local preview import")
    with httpx.Client(base_url="http://127.0.0.1:8000/api/v1", timeout=180) as client:
        token = client.post("/auth/login", json={"username": "demo_doctor", "password": "123456"})
        token.raise_for_status()
        client.headers["Authorization"] = "Bearer " + token.json()["data"]["access_token"]
        rows = []
        for page in range(1, 1000):
            response = client.get("/patients", params={"page": page, "page_size": 100})
            response.raise_for_status()
            data = response.json()["data"]
            rows.extend(data["items"])
            if len(rows) >= data["total"]:
                break
        for source, modality, organ in [("CT-chest", "CT", "lung"), ("MR-head", "MRI", "brain")]:
            name = "Slicer 公开样本 · " + source
            patient = next((p for p in rows if p["name"] == name), None)
            if patient is None:
                response = client.post("/patients", json={"name": name, "id_number": "PUBLIC-SLICER-" + source})
                response.raise_for_status()
                patient = response.json()["data"]
            pid = patient["patient_id"]
            images = client.get(f"/patients/{pid}/medical-images").json()["data"]["items"]
            if not images:
                path = ROOT / ".cache/real-imaging" / (source + ".nii.gz")
                with path.open("rb") as file:
                    response = client.post(f"/patients/{pid}/medical-images", files={"file": (path.name, file)},
                        data={"organ_id": organ, "image_type": modality})
                response.raise_for_status()
                response = client.post(f"/patients/{pid}/medical-records", json={"organ_id": organ,
                    "diagnosis": "公开样本来源说明（软件测试）", "record_date": "2026-09-08",
                    "description": "此档案仅存放 3D Slicer 官方公开的 " + source + " 数据，用于切片显示与软件验证。\n"
                        "来源：https://github.com/Slicer/Slicer/blob/main/Modules/Scripted/SampleData/SampleData.py\n"
                        "原始 NRRD 经 SHA-256 校验后转换为 NIfTI，保留空间方向及体素间距。无自动诊断或分割结果。"})
                response.raise_for_status()
            print(f"{source}: http://127.0.0.1:4173/doctor/patients/{pid}/imaging", flush=True)


if __name__ == "__main__":
    main()
