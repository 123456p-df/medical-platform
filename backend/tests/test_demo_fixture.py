import json
from collections.abc import Mapping, Sequence
from pathlib import Path, PurePosixPath, PureWindowsPath

import pytest

from app import demo, demo_fixture

FIXTURE_PATH = Path(__file__).resolve().parents[1] / "fixtures" / "demo_database.fixture.json"
FORBIDDEN_KEY_PARTS = (
    "password",
    "secret",
    "token",
    "api_key",
    "database_url",
    "encryption_key",
    "hash_key",
    "private_key",
)
FORBIDDEN_KEYS = {
    "audit_events",
    "ai_conversations",
    "ai_messages",
    "id_number_encrypted",
    "id_number_hash",
    "file_path",
    "image_path",
    "scan_filename",
    "scan_path",
    "source_path",
}
FORBIDDEN_FILE_ENDINGS = (
    ".db",
    ".dcm",
    ".nii",
    ".nii.gz",
    ".npy",
    ".npz",
    ".sqlite",
    ".sqlite3",
    ".sql",
)


def _walk(value, path="fixture"):
    if isinstance(value, Mapping):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            yield child_path, key, child
            yield from _walk(child, child_path)
    elif isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
        for index, child in enumerate(value):
            yield from _walk(child, f"{path}[{index}]")


def test_checked_in_demo_fixture_is_loaded_from_the_documented_location():
    assert FIXTURE_PATH.is_file()
    checked_in = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    loaded = demo_fixture.load_demo_fixture()

    assert demo_fixture.FIXTURE_PATH == FIXTURE_PATH
    assert checked_in["schema_version"] == 1
    assert checked_in["data_classification"] == "synthetic-demo-only"
    assert loaded.patients
    assert {patient.username for patient in loaded.patients} == {
        user.username for user in loaded.users if user.role == "patient"
    }


def test_checked_in_demo_fixture_contains_only_explicitly_synthetic_records():
    raw_fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    fixture = demo_fixture.load_demo_fixture()

    for patient in fixture.patients:
        assert patient.username.casefold().startswith("demo_")
        assert patient.display_name.startswith("演示患者")
        assert patient.fixture_id.startswith("patient-")
    assert "演示" in fixture.record_template.diagnosis
    assert "虚构" in fixture.record_template.description

    for path, key, value in _walk(raw_fixture):
        normalized_key = str(key).casefold()
        assert normalized_key not in FORBIDDEN_KEYS, f"forbidden fixture field: {path}"
        assert not any(part in normalized_key for part in FORBIDDEN_KEY_PARTS), (
            f"secret-bearing fixture field: {path}"
        )
        if isinstance(value, str):
            normalized_value = value.casefold()
            assert not PurePosixPath(value).is_absolute(), f"absolute path in {path}"
            assert not PureWindowsPath(value).is_absolute(), f"absolute path in {path}"
            assert not normalized_value.endswith(FORBIDDEN_FILE_ENDINGS), (
                f"database or medical file reference in {path}"
            )


@pytest.mark.parametrize(
    "unsafe_change",
    [
        {"password_hash": "$argon2id$not-for-source-control"},
        {"profile": {"api_token": "not-for-source-control"}},
        {"file_path": "/srv/private/patient.nii.gz"},
    ],
)
def test_fixture_validation_rejects_sensitive_fields(tmp_path, unsafe_change):
    fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    fixture["patients"][0].update(unsafe_change)
    invalid_fixture = tmp_path / "invalid-demo-fixture.json"
    invalid_fixture.write_text(json.dumps(fixture), encoding="utf-8")

    with pytest.raises(ValueError):
        demo_fixture.load_demo_fixture(invalid_fixture)


def test_demo_module_consumes_the_validated_fixture():
    loaded = demo_fixture.load_demo_fixture()

    assert demo.DEMO_FIXTURE == loaded
    assert demo.DEMO_PATIENTS is demo.DEMO_FIXTURE.patients


def test_database_reset_marker_cannot_be_inferred_from_a_username():
    assert not demo_fixture.is_fixture_user(username="admin", role="doctor", profile={})
    assert not demo_fixture.is_fixture_user(
        username="admin",
        role="doctor",
        profile={demo_fixture.PROFILE_MARKER_KEY: "a-different-database"},
    )
    assert demo_fixture.is_fixture_user(
        username="admin",
        role="doctor",
        profile=demo_fixture.fixture_user_profile(),
    )
