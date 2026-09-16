"""Load the reviewed, synthetic database fixture used by the local demo."""

import json
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

FIXTURE_PATH = Path(__file__).resolve().parents[1] / "fixtures" / "demo_database.fixture.json"
EXPECTED_USERS = {
    "admin": "admin",
    "demo_doctor": "doctor",
    "demo_patient": "patient",
    "test_patient": "patient",
}
PROFILE_MARKER_KEY = "_vmrb_demo_fixture"
PROFILE_MARKER_VALUE = "synthetic-demo-v1"
PATIENT_KEYS = {
    "fixture_id",
    "username",
    "display_name",
    "birth_date",
    "gender",
    "height_cm",
    "weight_kg",
    "blood_type",
    "doctor_access",
}


@dataclass(frozen=True)
class DemoUser:
    username: str
    role: str


@dataclass(frozen=True)
class DemoPatient:
    fixture_id: str
    username: str
    display_name: str
    birth_date: date
    gender: str
    height_cm: float
    weight_kg: float
    blood_type: str
    doctor_access: tuple[str, ...]


@dataclass(frozen=True)
class DemoRecordTemplate:
    organ_id: str
    diagnosis: str
    description: str
    day_offsets: tuple[int, ...]


@dataclass(frozen=True)
class DemoDatabaseFixture:
    users: tuple[DemoUser, ...]
    patients: tuple[DemoPatient, ...]
    record_template: DemoRecordTemplate


def fixture_user_profile() -> dict[str, str]:
    return {PROFILE_MARKER_KEY: PROFILE_MARKER_VALUE}


def is_fixture_user(*, username: str, role: str, profile: object) -> bool:
    return (
        EXPECTED_USERS.get(username) == role
        and isinstance(profile, dict)
        and profile.get(PROFILE_MARKER_KEY) == PROFILE_MARKER_VALUE
    )


def _expect_keys(value: dict, expected: set[str], section: str) -> None:
    if set(value) != expected:
        raise ValueError(f"Unexpected fields in {section}")


def load_demo_fixture(path: Path = FIXTURE_PATH) -> DemoDatabaseFixture:
    payload = json.loads(path.read_text(encoding="utf-8"))
    _expect_keys(
        payload,
        {"schema_version", "data_classification", "users", "patients", "record_template"},
        "fixture",
    )
    if payload["schema_version"] != 1:
        raise ValueError("Unsupported demo fixture schema")
    if payload["data_classification"] != "synthetic-demo-only":
        raise ValueError("Demo fixture must be explicitly classified as synthetic")

    users = []
    for raw_user in payload["users"]:
        _expect_keys(raw_user, {"username", "role"}, "users")
        username, role = raw_user["username"], raw_user["role"]
        if EXPECTED_USERS.get(username) != role:
            raise ValueError("Demo fixture contains an unexpected account")
        users.append(DemoUser(username=username, role=role))
    if len(users) != len(EXPECTED_USERS) or {
        user.username: user.role for user in users
    } != EXPECTED_USERS:
        raise ValueError("Demo fixture account list is incomplete or duplicated")

    doctor_usernames = {
        user.username for user in users if user.role in {"admin", "doctor"}
    }
    patient_usernames = {user.username for user in users if user.role == "patient"}
    patients = []
    seen_ids: set[str] = set()
    for raw_patient in payload["patients"]:
        _expect_keys(raw_patient, PATIENT_KEYS, "patients")
        fixture_id = raw_patient["fixture_id"]
        username = raw_patient["username"]
        display_name = raw_patient["display_name"]
        access = tuple(raw_patient["doctor_access"])
        if (
            username not in patient_usernames
            or re.fullmatch(r"patient-\d{3}", fixture_id) is None
            or fixture_id in seen_ids
            or display_name != username
            or not access
            or not set(access) <= doctor_usernames
        ):
            raise ValueError("Demo fixture contains a non-demo or invalid patient")
        seen_ids.add(fixture_id)
        patients.append(
            DemoPatient(
                fixture_id=fixture_id,
                username=username,
                display_name=display_name,
                birth_date=date.fromisoformat(raw_patient["birth_date"]),
                gender=raw_patient["gender"],
                height_cm=float(raw_patient["height_cm"]),
                weight_kg=float(raw_patient["weight_kg"]),
                blood_type=raw_patient["blood_type"],
                doctor_access=access,
            )
        )
    if (
        len(patients) != len(patient_usernames)
        or {patient.username for patient in patients} != patient_usernames
    ):
        raise ValueError("Demo fixture patient list is incomplete or duplicated")

    raw_record = payload["record_template"]
    _expect_keys(raw_record, {"organ_id", "diagnosis", "description", "day_offsets"}, "record")
    offsets = tuple(raw_record["day_offsets"])
    if (
        raw_record["organ_id"] != "lung"
        or "演示" not in raw_record["diagnosis"]
        or "虚构" not in raw_record["description"]
        or not offsets
        or any(type(offset) is not int or offset < 0 for offset in offsets)
    ):
        raise ValueError("Demo fixture contains a non-demo or invalid record template")
    return DemoDatabaseFixture(
        users=tuple(users),
        patients=tuple(patients),
        record_template=DemoRecordTemplate(
            organ_id=raw_record["organ_id"],
            diagnosis=raw_record["diagnosis"],
            description=raw_record["description"],
            day_offsets=offsets,
        ),
    )
