"""Export a reproducible OpenAPI contract for frontend type generation."""

import argparse
import json
from pathlib import Path

from cryptography.fernet import Fernet

from app.config import Settings
from app.db import make_engine
from app.main import create_app

parser = argparse.ArgumentParser()
parser.add_argument("--output", type=Path)
args = parser.parse_args()

root = Path(__file__).resolve().parents[2]
output = args.output or root / "contracts" / "openapi.json"
settings = Settings(
    _env_file=None,
    database_url="sqlite:///:memory:",
    jwt_secret="j" * 48,
    id_hash_key="h" * 48,
    id_encryption_key=Fernet.generate_key().decode(),
    api_docs_enabled=True,
)
app = create_app(
    settings,
    engine=make_engine(settings.database_url),
    recover_tasks=False,
)
schema = app.openapi()
schema["info"]["description"] = (
    "Automatically exported by backend/scripts/export_openapi.py. Do not edit by hand."
)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(schema, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
print(output)
