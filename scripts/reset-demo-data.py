"""Replace the explicitly approved demo database with four accounts and one real CT fixture."""

import os
import shutil
import sys
from pathlib import Path

from sqlalchemy import select, text
from sqlalchemy.engine import make_url


ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = ROOT / "backend"
if not (BACKEND_ROOT / "app").is_dir() and (ROOT / "app").is_dir():
    BACKEND_ROOT = ROOT
sys.path.insert(0, str(BACKEND_ROOT))

from app.config import Settings  # noqa: E402
from app.db import make_engine, make_session_factory  # noqa: E402
from app.accounts import FIXED_ACCOUNT_USERNAMES  # noqa: E402
from app.demo import seed  # noqa: E402
from app.models import OrganModel, User  # noqa: E402


ALLOWED_USERNAMES = set(FIXED_ACCOUNT_USERNAMES) | {
    "demo_patient",
    "demo_patient_2",
    "demo_patient_3",
}


def assert_demo_only(db):
    usernames = set(db.scalars(select(User.username)))
    unexpected = usernames - ALLOWED_USERNAMES
    if unexpected:
        names = ", ".join(sorted(unexpected))
        raise SystemExit(f"Refusing to clear non-demo users: {names}")


def clear_demo_rows(db):
    # Delete children first so the default organ catalog can remain available.
    for statement in (
        "DELETE FROM ai_messages",
        "DELETE FROM ai_conversations",
        "DELETE FROM findings",
        "DELETE FROM analysis_tasks",
        "DELETE FROM image_reviews",
        "DELETE FROM segmentation_tasks",
        "DELETE FROM organ_models WHERE source = 'segmentation'",
        "DELETE FROM record_organs",
        "DELETE FROM medical_records",
        "DELETE FROM medical_images",
        "DELETE FROM audit_events",
        "DELETE FROM profile_files",
        "DELETE FROM doctor_patient_access",
    ):
        db.execute(text(statement))
    db.execute(text("TRUNCATE TABLE users, doctors, patients RESTART IDENTITY CASCADE"))
    db.commit()


def clear_image_storage(settings):
    image_root = settings.storage_root / "medical-images"
    if not image_root.is_dir():
        return
    for path in image_root.rglob("*"):
        if path.is_file():
            path.unlink()


def clear_patient_storage(settings):
    storage_root = settings.storage_root.resolve()
    patient_root = (storage_root / "patient").resolve()
    if patient_root.parent != storage_root:
        raise SystemExit(f"Refusing to clear storage outside {storage_root}")
    if patient_root.is_dir():
        shutil.rmtree(patient_root)


def prune_orphan_default_assets(settings):
    engine = make_engine(settings.database_url)
    try:
        with make_session_factory(engine)() as db:
            referenced = {
                (settings.storage_root / model.file_path).resolve()
                for model in db.scalars(select(OrganModel))
                if model.file_path
            }
        for asset_root in (
            settings.storage_root / "defaults",
            settings.storage_root / "demo-assets",
        ):
            if asset_root.is_dir():
                for path in asset_root.glob("*.glb"):
                    if path.resolve() not in referenced:
                        path.unlink()
    finally:
        engine.dispose()


def main():
    if os.environ.get("VMRB_DEMO_RESET") != "1":
        raise SystemExit("Set VMRB_DEMO_RESET=1 to confirm replacing the demo database")
    os.chdir(ROOT / "backend" if (ROOT / "backend").is_dir() else ROOT)
    settings = Settings()
    database = make_url(settings.database_url).database
    if database not in {"vmrb", "vmrb_preview"}:
        raise SystemExit(f"Refusing to clear database {database!r}")

    engine = make_engine(settings.database_url)
    try:
        with make_session_factory(engine)() as db:
            assert_demo_only(db)
            clear_demo_rows(db)
    finally:
        engine.dispose()

    clear_image_storage(settings)
    clear_patient_storage(settings)
    seed(settings)
    prune_orphan_default_assets(settings)
    print("Demo database reset: four fixed accounts and one real CT example seeded.")


if __name__ == "__main__":
    main()
