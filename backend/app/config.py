from pathlib import Path

from cryptography.fernet import Fernet
from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", hide_input_in_errors=True)

    database_url: str = "postgresql+psycopg://vmrb:vmrb@localhost:5432/vmrb"
    jwt_secret: SecretStr
    id_encryption_key: SecretStr
    id_hash_key: SecretStr
    jwt_issuer: str = "vmrb"
    jwt_audience: str = "vmrb-api"
    access_token_minutes: int = Field(default=60, ge=1, le=1440)
    storage_root: Path = Path("data")
    cors_origins: list[str] = ["http://localhost:5173"]
    max_upload_bytes: int = Field(default=512 * 1024 * 1024, ge=1024)
    max_volume_voxels: int = Field(default=64_000_000, ge=8)
    max_uncompressed_bytes: int = Field(default=768 * 1024 * 1024, ge=1024)
    segmentation_callable: str | None = None
    segmentation_image_types: list[str] = ["CT"]
    nv_segment_ct_dir: Path | None = None
    nv_segment_device: str = "cuda:0"
    lung_nodule_callable: str | None = None
    lung_nodule_model_url: str | None = None
    lung_nodule_model_token: SecretStr | None = None
    lung_nodule_model_name: str = "MONAI/lung_nodule_ct_detection:0.6.9"
    lung_nodule_model_timeout_seconds: float = Field(default=300, gt=0, le=1800)
    lung_nodule_max_findings: int = Field(default=300, ge=1, le=1000)
    ai_base_url: str | None = None
    ai_api_key: SecretStr | None = None
    ai_model: str | None = None
    ai_timeout_seconds: float = Field(default=60, gt=0, le=300)
    ai_max_context_records: int = Field(default=30, ge=1, le=100)
    ai_max_context_chars: int = Field(default=30000, ge=1000, le=100000)
    ai_max_answer_chars: int = Field(default=16000, ge=100, le=50000)

    @model_validator(mode="after")
    def validate_secrets(self):
        jwt_key = self.jwt_secret.get_secret_value()
        hash_key = self.id_hash_key.get_secret_value()
        if min(len(jwt_key), len(hash_key)) < 32:
            raise ValueError("JWT_SECRET and ID_HASH_KEY must each contain at least 32 characters")
        if jwt_key == hash_key:
            raise ValueError("JWT_SECRET and ID_HASH_KEY must be independent")
        Fernet(self.id_encryption_key.get_secret_value().encode())
        if "*" in self.cors_origins:
            raise ValueError("CORS_ORIGINS must list explicit origins")
        self.storage_root = self.storage_root.resolve()
        if self.nv_segment_ct_dir is not None:
            self.nv_segment_ct_dir = self.nv_segment_ct_dir.resolve()
        return self
