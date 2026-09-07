from datetime import UTC, date, datetime

from sqlalchemy import JSON, CheckConstraint, DateTime, ForeignKey, Index, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class CreatedMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class User(CreatedMixin, Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint("role IN ('doctor', 'patient')", name="ck_users_role"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16))


class Patient(CreatedMixin, Base):
    __tablename__ = "patients"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), unique=True)
    name: Mapped[str | None] = mapped_column(String(100))
    id_number_encrypted: Mapped[str | None] = mapped_column(Text)
    id_number_hash: Mapped[str | None] = mapped_column(String(64), unique=True)
    birth_date: Mapped[date | None]
    gender: Mapped[str | None] = mapped_column(String(16))
    height: Mapped[float | None]
    weight: Mapped[float | None]
    blood_type: Mapped[str | None] = mapped_column(String(16))


class Doctor(CreatedMixin, Base):
    __tablename__ = "doctors"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)


class DoctorPatientAccess(CreatedMixin, Base):
    __tablename__ = "doctor_patient_access"
    __table_args__ = (CheckConstraint("status IN ('active', 'revoked')", name="ck_access_status"),)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), primary_key=True)
    status: Mapped[str] = mapped_column(String(16), default="active")


class MedicalRecord(CreatedMixin, Base):
    __tablename__ = "medical_records"
    __table_args__ = (
        Index("ix_records_patient_organ_date", "patient_id", "organ_id", "record_date"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))
    organ_id: Mapped[str] = mapped_column(String(64))
    diagnosis: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    record_date: Mapped[date]
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class MedicalImage(CreatedMixin, Base):
    __tablename__ = "medical_images"
    __table_args__ = (
        CheckConstraint("image_type IN ('CT', 'MRI')", name="ck_image_type"),
        Index("ix_images_patient_organ", "patient_id", "organ_id"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    organ_id: Mapped[str] = mapped_column(String(64))
    image_type: Mapped[str] = mapped_column(String(8))
    file_path: Mapped[str] = mapped_column(Text)
    shape: Mapped[list] = mapped_column(JSON)
    spacing: Mapped[list] = mapped_column(JSON)
    size_bytes: Mapped[int]


class OrganModel(CreatedMixin, Base):
    __tablename__ = "organ_models"
    __table_args__ = (
        CheckConstraint("source IN ('segmentation', 'default')", name="ck_model_source"),
        CheckConstraint("format = 'glb'", name="ck_model_format"),
        CheckConstraint(
            "(source = 'default' AND patient_id IS NULL) OR (source = 'segmentation' AND patient_id IS NOT NULL AND image_id IS NOT NULL)",
            name="ck_model_owner",
        ),
        Index("ix_models_patient_organ", "patient_id", "organ_id"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id"))
    image_id: Mapped[str | None] = mapped_column(ForeignKey("medical_images.id"))
    organ_id: Mapped[str] = mapped_column(String(64))
    source: Mapped[str] = mapped_column(String(16))
    format: Mapped[str] = mapped_column(String(16), default="glb")
    file_path: Mapped[str] = mapped_column(Text)
    mask_path: Mapped[str | None] = mapped_column(Text)


class SegmentationTask(CreatedMixin, Base):
    __tablename__ = "segmentation_tasks"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed')", name="ck_task_status"
        ),
        CheckConstraint("progress >= 0 AND progress <= 100", name="ck_task_progress"),
        Index(
            "uq_active_segmentation",
            "image_id",
            "organ_id",
            unique=True,
            postgresql_where=text("status IN ('queued', 'running')"),
            sqlite_where=text("status IN ('queued', 'running')"),
        ),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    image_id: Mapped[str] = mapped_column(ForeignKey("medical_images.id"))
    organ_id: Mapped[str] = mapped_column(String(64))
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(16), default="queued")
    progress: Mapped[int] = mapped_column(default=0)
    result_model_id: Mapped[str | None] = mapped_column(ForeignKey("organ_models.id"))
    error_message: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AIConversation(CreatedMixin, Base):
    __tablename__ = "ai_conversations"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    organ_id: Mapped[str] = mapped_column(String(64))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))


class AIMessage(CreatedMixin, Base):
    __tablename__ = "ai_messages"
    __table_args__ = (CheckConstraint("role IN ('user', 'assistant')", name="ck_message_role"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("ai_conversations.id"), index=True)
    role: Mapped[str] = mapped_column(String(16))
    content: Mapped[str] = mapped_column(Text)
    references: Mapped[list] = mapped_column(JSON, default=list)


class AuditEvent(CreatedMixin, Base):
    __tablename__ = "audit_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id"), index=True)
    action: Mapped[str] = mapped_column(String(64))
    resource_type: Mapped[str] = mapped_column(String(64))
    resource_id: Mapped[str] = mapped_column(String(64))
    before: Mapped[dict | None] = mapped_column(JSON)
    after: Mapped[dict | None] = mapped_column(JSON)
