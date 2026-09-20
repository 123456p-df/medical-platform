"""
Tests for the AI Copilot Agent system, Pi bridge, and RadSight integration.
"""

import sys
from pathlib import Path

import numpy as np
from sqlalchemy import select

from app.models import AgentConversation

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from radsight_runtime.infer import VolumeTensorCache  # noqa: E402
from radsight_runtime.volume import (  # noqa: E402
    inspect_nifti_volume,
    looks_like_stub_template,
    normalize_hu,
    parse_clinical_sections,
)


def test_radsight_nifti_volume_inspect(tmp_path):
    import nibabel as nib

    data = np.zeros((8, 8, 6), dtype=np.float32)
    data[2:5, 2:5, 1:4] = 40
    data[0, 0, 0] = -900
    path = tmp_path / "ct.nii.gz"
    nib.save(nib.Nifti1Image(data, np.eye(4)), path)

    meta = inspect_nifti_volume(str(path))
    assert meta["filename"] == "ct.nii.gz"
    assert meta["dimensions"] == [8, 8, 6]
    assert meta["slice_count"] == 6
    assert "lung_volume_ml" in meta["estimated_volumes_ml"]


def test_radsight_section_parser_does_not_invent_template():
    raw = "双肺纹理增多，右肺上叶见磨玻璃密度影。建议结合临床随访。"
    parsed = parse_clinical_sections(raw)
    assert parsed["raw_text"] == raw
    assert parsed["findings"] == raw
    assert "LU-RADS" not in parsed["impression"]
    assert not looks_like_stub_template(raw)

    templated = "最大径约 4.2mm，考虑良性钙化。LU-RADS 2 类"
    assert looks_like_stub_template(templated)


def test_radsight_hu_normalization():
    volume = np.array([-2000.0, -1000.0, 0.0, 1000.0, 2000.0], dtype=np.float32)
    normalized = normalize_hu(volume)
    assert float(normalized.min()) == 0.0
    assert float(normalized.max()) == 1.0
    assert abs(float(normalized[2]) - 0.5) < 1e-6


def test_radsight_volume_cache_hits_and_invalidates(tmp_path, monkeypatch):
    import radsight_runtime.infer as infer
    import torch

    path = tmp_path / "ct.nii.gz"
    path.write_bytes(b"first")
    calls = []

    def load(resolved):
        calls.append(resolved.stat().st_size)
        return torch.tensor([len(calls)], dtype=torch.float32)

    monkeypatch.setattr(infer, "_load_volume_tensor", load)
    cache = VolumeTensorCache(max_entries=1)
    first, first_hit = cache.get(str(path))
    second, second_hit = cache.get(str(path))
    path.write_bytes(b"second-version")
    third, third_hit = cache.get(str(path))

    assert not first_hit and second_hit and not third_hit
    assert first is second
    assert third is not first
    assert calls == [5, 14]
    assert cache.info() == {"entries": 1, "max_entries": 1, "hits": 1, "misses": 2}


def test_agent_status_endpoint(app_env, people):
    _, client, _, _ = app_env
    res = client.get("/api/v1/agent/status", headers=people["doctor_a"])
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["pi_framework"]["available"] is True
    assert data["pi_framework"]["mode"] == "rpc"
    assert "llm_provider" in data
    assert "radsight_microservice" in data


def test_internal_agent_tools_endpoints(app_env, people):
    _, client, _, _ = app_env
    pid = people["patient_a_pid"]

    ct_res = client.get(f"/api/v1/agent/internal/patients/{pid}/ct_scans", headers=people["doctor_a"])
    assert ct_res.status_code == 200
    scans = ct_res.json()
    assert isinstance(scans, list)
    assert len(scans) >= 1
    assert "file_path" in scans[0]

    rec_res = client.get(f"/api/v1/agent/internal/patients/{pid}/records", headers=people["doctor_a"])
    assert rec_res.status_code == 200
    r_data = rec_res.json()
    assert "patient" in r_data
    assert "records" in r_data

    qc_res = client.get(f"/api/v1/agent/internal/patients/{pid}/segmentation_qc", headers=people["doctor_a"])
    assert qc_res.status_code == 200
    qc_data = qc_res.json()
    assert "organs" in qc_data
    assert qc_data["qc_status"] in {"passed", "failed", "missing"}


def test_treatment_plan_extension_is_registered():
    extension = (Path(__file__).resolve().parents[1] / "app/services/agent/medical_extension.mjs").read_text()
    bridge = (Path(__file__).resolve().parents[1] / "app/services/agent/pi_bridge.py").read_text()
    assert 'name: "draft_treatment_plan"' in extension
    assert "TREATMENT_PLAN_START" in extension
    assert "draft_treatment_plan" in bridge
    assert "needs_plan" in bridge


def test_agent_conversation_creation_and_persistence(app_env, people):
    app, client, _, _ = app_env
    pid = people["patient_a_pid"]

    create_res = client.post(
        "/api/v1/agent/conversations",
        json={"patient_id": pid, "title": "胸部结节会诊讨论"},
        headers=people["doctor_a"],
    )
    assert create_res.status_code == 200
    conv_id = create_res.json()["data"]["id"]

    list_res = client.get(f"/api/v1/agent/conversations?patient_id={pid}", headers=people["doctor_a"])
    assert list_res.status_code == 200
    convs = list_res.json()["data"]
    assert any(c["id"] == conv_id for c in convs)

    with app.state.session_factory() as db:
        db_conv = db.scalar(select(AgentConversation).where(AgentConversation.id == conv_id))
        assert db_conv is not None
        assert db_conv.patient_id == pid
        assert db_conv.title == "胸部结节会诊讨论"
