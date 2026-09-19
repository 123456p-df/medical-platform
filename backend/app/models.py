from datetime import UTC, date, datetime

from sqlalchemy import (
    JSON,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class CreatedMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class User(CreatedMixin, Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint("role IN ('admin', 'doctor', 'patient')", name="ck_users_role"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16))
    profile: Mapped[dict] = mapped_column(JSON, default=dict, server_default=text("'{}'"))
    is_active: Mapped[bool] = mapped_column(default=True, server_default=text("true"))


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
    profile_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ProfileFile(CreatedMixin, Base):
    __tablename__ = "profile_files"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    media_type: Mapped[str] = mapped_column(String(64))
    size_bytes: Mapped[int]
    file_path: Mapped[str] = mapped_column(Text)


class ImageReview(Base):
    __tablename__ = "image_reviews"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    image_id: Mapped[str] = mapped_column(ForeignKey("medical_images.id"), primary_key=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


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


class PatientLinkInvitation(CreatedMixin, Base):
    __tablename__ = "patient_link_invitations"
    __table_args__ = (
        Index("ix_patient_link_invitations_patient", "patient_id", "created_at"),
        Index(
            "uq_active_patient_link_invitation",
            "patient_id",
            unique=True,
            postgresql_where=text("used_at IS NULL AND revoked_at IS NULL"),
            sqlite_where=text("used_at IS NULL AND revoked_at IS NULL"),
        ),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class PatientArchive(CreatedMixin, Base):
    __tablename__ = "patient_archives"
    __table_args__ = (
        Index(
            "uq_active_patient_archive",
            "patient_id",
            unique=True,
            postgresql_where=text("restored_at IS NULL"),
            sqlite_where=text("restored_at IS NULL"),
        ),
        Index("ix_patient_archives_archived_at", "archived_at"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    reason: Mapped[str] = mapped_column(String(500))
    archived_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    archived_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    restored_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    restored_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class BreakGlassGrant(CreatedMixin, Base):
    __tablename__ = "break_glass_grants"
    __table_args__ = (
        Index("ix_break_glass_doctor_patient", "doctor_id", "patient_id", "expires_at"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    reason: Mapped[str] = mapped_column(String(500))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class MedicalRecord(CreatedMixin, Base):
    __tablename__ = "medical_records"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'pending_review', 'signed', 'cancelled')",
            name="ck_medical_record_status",
        ),
        Index("ix_records_patient_organ_date", "patient_id", "organ_id", "record_date"),
        Index("ix_records_doctor_id", "doctor_id"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))
    examination_id: Mapped[str | None] = mapped_column(ForeignKey("medical_images.id"))
    organ_id: Mapped[str] = mapped_column(String(64))
    diagnosis: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    recommendation: Mapped[str] = mapped_column(Text, default="", server_default=text("''"))
    reviewed: Mapped[bool] = mapped_column(default=False, server_default=text("false"))
    signed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(24), default="draft", server_default=text("'draft'"))
    revision: Mapped[int] = mapped_column(default=1, server_default=text("1"))
    signed_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    record_date: Mapped[date]
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    organ_links: Mapped[list["RecordOrgan"]] = relationship(
        cascade="all, delete-orphan", lazy="selectin"
    )
    addenda: Mapped[list["RecordAddendum"]] = relationship(
        back_populates="record", cascade="all, delete-orphan", lazy="selectin"
    )

    @property
    def organ_ids(self):
        return [
            self.organ_id,
            *sorted(link.organ_id for link in self.organ_links if link.organ_id != self.organ_id),
        ]

    @organ_ids.setter
    def organ_ids(self, values):
        values = list(dict.fromkeys(values or [self.organ_id]))
        self.organ_id = values[0]
        existing = {link.organ_id: link for link in self.organ_links}
        self.organ_links = [existing.get(value) or RecordOrgan(organ_id=value) for value in values]

    @classmethod
    def has_organ(cls, organ_id):
        # The primary field keeps old imports/clients compatible; EXISTS avoids duplicate rows.
        return (cls.organ_id == organ_id) | cls.organ_links.any(RecordOrgan.organ_id == organ_id)


class ReportTask(CreatedMixin, Base):
    __tablename__ = "report_tasks"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending_draft', 'drafting', 'in_review', 'signed', 'cancelled')",
            name="ck_report_task_status",
        ),
        UniqueConstraint(
            "patient_id",
            "examination_id",
            name="uq_report_task_examination",
        ),
        Index("ix_report_tasks_patient_status", "patient_id", "status"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    examination_id: Mapped[str] = mapped_column(ForeignKey("medical_images.id"))
    status: Mapped[str] = mapped_column(String(24), default="pending_draft")
    assigned_doctor_id: Mapped[int | None] = mapped_column(ForeignKey("doctors.id"))
    primary_record_id: Mapped[int | None] = mapped_column(ForeignKey("medical_records.id"))
    idempotency_key: Mapped[str | None] = mapped_column(String(128), unique=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )


class ReportRevisionEvent(CreatedMixin, Base):
    __tablename__ = "report_revision_events"
    __table_args__ = (
        CheckConstraint(
            "action IN ('created', 'draft_saved', 'submitted', 'signed', 'reopened', 'cancelled')",
            name="ck_report_event_action",
        ),
        Index("ix_report_events_record_revision", "record_id", "revision"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("medical_records.id"))
    revision: Mapped[int]
    action: Mapped[str] = mapped_column(String(32))
    from_status: Mapped[str | None] = mapped_column(String(24))
    to_status: Mapped[str | None] = mapped_column(String(24))
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    reason: Mapped[str | None] = mapped_column(String(500))
    event_metadata: Mapped[dict] = mapped_column(
        "metadata",
        JSON,
        default=dict,
        server_default=text("'{}'"),
    )


class RecordOrgan(Base):
    __tablename__ = "record_organs"
    record_id: Mapped[int] = mapped_column(
        ForeignKey("medical_records.id", ondelete="CASCADE"), primary_key=True
    )
    organ_id: Mapped[str] = mapped_column(String(64), primary_key=True)


class RecordAddendum(CreatedMixin, Base):
    __tablename__ = "record_addenda"
    id: Mapped[int] = mapped_column(primary_key=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("medical_records.id"), index=True)
    author_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    reason: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    record: Mapped["MedicalRecord"] = relationship(back_populates="addenda")


class MedicalImage(CreatedMixin, Base):
    __tablename__ = "medical_images"
    __table_args__ = (
        CheckConstraint("image_type IN ('CT', 'MRI')", name="ck_image_type"),
        CheckConstraint("source_format IN ('nifti', 'dicom')", name="ck_image_source_format"),
        CheckConstraint(
            "sequence IN ('T1', 'T2', 'FLAIR', 'DWI', 'other', 'unknown')",
            name="ck_image_sequence",
        ),
        CheckConstraint(
            "segmentation_mode IS NULL OR segmentation_mode IN ('CT_BODY', 'MRI_BODY', 'MRI_BRAIN')",
            name="ck_image_segmentation_mode",
        ),
        CheckConstraint(
            "sequence_confidence IN ('auto', 'manual')",
            name="ck_image_sequence_confidence",
        ),
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
    study_date: Mapped[date | None]
    source_format: Mapped[str] = mapped_column(
        String(16), default="nifti", server_default=text("'nifti'")
    )
    series_uid: Mapped[str | None] = mapped_column(String(64))
    sequence: Mapped[str] = mapped_column(
        String(16), default="unknown", server_default=text("'unknown'")
    )
    contrast: Mapped[bool | None]
    segmentation_mode: Mapped[str | None] = mapped_column(String(16))
    sequence_confidence: Mapped[str] = mapped_column(
        String(16), default="auto", server_default=text("'auto'")
    )
    acquisition: Mapped[dict] = mapped_column(JSON, default=dict, server_default=text("'{}'"))


class DicomStudy(CreatedMixin, Base):
    __tablename__ = "dicom_studies"
    __table_args__ = (
        CheckConstraint(
            "status IN ('receiving', 'archived', 'converting', 'ready', 'failed')",
            name="ck_dicom_study_status",
        ),
        Index("ix_dicom_study_patient_date", "patient_id", "study_date"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    orthanc_study_id: Mapped[str] = mapped_column(String(128), unique=True)
    study_instance_uid: Mapped[str | None] = mapped_column(String(128), unique=True)
    dicom_patient_id: Mapped[str | None] = mapped_column(String(128))
    modality: Mapped[str | None] = mapped_column(String(16))
    study_date: Mapped[date | None]
    description: Mapped[str | None] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(16), default="receiving")
    instance_count: Mapped[int] = mapped_column(default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class DicomSeries(CreatedMixin, Base):
    __tablename__ = "dicom_series"
    __table_args__ = (Index("ix_dicom_series_study", "study_id"),)
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    study_id: Mapped[str] = mapped_column(ForeignKey("dicom_studies.id"))
    orthanc_series_id: Mapped[str] = mapped_column(String(128), unique=True)
    series_instance_uid: Mapped[str | None] = mapped_column(String(128), unique=True)
    modality: Mapped[str | None] = mapped_column(String(16))
    description: Mapped[str | None] = mapped_column(String(300))
    rows: Mapped[int | None]
    columns: Mapped[int | None]
    frame_count: Mapped[int] = mapped_column(default=0)
    instance_count: Mapped[int] = mapped_column(default=0)
    medical_image_id: Mapped[str | None] = mapped_column(ForeignKey("medical_images.id"))


class DicomInstance(CreatedMixin, Base):
    __tablename__ = "dicom_instances"
    __table_args__ = (Index("ix_dicom_instance_series", "series_id"),)
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    series_id: Mapped[str] = mapped_column(ForeignKey("dicom_series.id"))
    orthanc_instance_id: Mapped[str] = mapped_column(String(128), unique=True)
    sop_instance_uid: Mapped[str | None] = mapped_column(String(128), unique=True)
    instance_number: Mapped[int | None]
    number_of_frames: Mapped[int] = mapped_column(default=1)
    transfer_syntax_uid: Mapped[str | None] = mapped_column(String(128))


class OrganModel(CreatedMixin, Base):
    __tablename__ = "organ_models"
    __table_args__ = (
        CheckConstraint("source IN ('segmentation', 'default')", name="ck_model_source"),
        CheckConstraint("format = 'glb'", name="ck_model_format"),
        CheckConstraint("kind IN ('organ', 'atlas')", name="ck_model_kind"),
        CheckConstraint(
            "(source = 'default' AND patient_id IS NULL) OR (source = 'segmentation' AND patient_id IS NOT NULL AND image_id IS NOT NULL)",
            name="ck_model_owner",
        ),
        Index("ix_models_patient_organ", "patient_id", "organ_id"),
        Index("ix_models_image_label", "image_id", "label_id"),
        Index(
            "uq_image_atlas",
            "image_id",
            unique=True,
            postgresql_where=text("kind = 'atlas'"),
            sqlite_where=text("kind = 'atlas'"),
        ),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id"))
    image_id: Mapped[str | None] = mapped_column(ForeignKey("medical_images.id"))
    organ_id: Mapped[str] = mapped_column(String(64))
    source: Mapped[str] = mapped_column(String(16))
    format: Mapped[str] = mapped_column(String(16), default="glb")
    kind: Mapped[str] = mapped_column(String(16), default="organ")
    file_path: Mapped[str | None] = mapped_column(Text)
    label_id: Mapped[int | None]
    label_name: Mapped[str | None] = mapped_column(String(200))
    group_id: Mapped[str | None] = mapped_column(String(64), index=True)
    face_count: Mapped[int | None]
    size_bytes: Mapped[int | None]
    volume_cm3: Mapped[float | None]
    is_watertight: Mapped[bool | None]
    bounds: Mapped[dict | None] = mapped_column(JSON)
    mask_path: Mapped[str | None] = mapped_column(Text)
    blob: Mapped["OrganModelBlob | None"] = relationship(uselist=False, cascade="all, delete-orphan")


class OrganModelBlob(Base):
    __tablename__ = "organ_model_blobs"
    model_id: Mapped[str] = mapped_column(
        ForeignKey("organ_models.id", ondelete="CASCADE"), primary_key=True
    )
    data: Mapped[bytes] = mapped_column(LargeBinary)
    sha256: Mapped[str] = mapped_column(String(64))
    size_bytes: Mapped[int]
    content_type: Mapped[str] = mapped_column(String(64), default="model/gltf-binary")


class SegmentationBatch(CreatedMixin, Base):
    __tablename__ = "segmentation_batches"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'partial', 'failed', 'unavailable')",
            name="ck_batch_status",
        ),
        CheckConstraint("progress >= 0 AND progress <= 100", name="ck_batch_progress"),
        Index(
            "uq_active_segmentation_batch",
            "image_id",
            "model_fingerprint",
            unique=True,
            postgresql_where=text("status IN ('queued', 'running')"),
            sqlite_where=text("status IN ('queued', 'running')"),
        ),
        Index("ix_batches_image_created", "image_id", "created_at"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    image_id: Mapped[str] = mapped_column(ForeignKey("medical_images.id"))
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    model_fingerprint: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(16), default="queued")
    progress: Mapped[int] = mapped_column(default=0)
    total_labels: Mapped[int] = mapped_column(default=0)
    recognized_count: Mapped[int] = mapped_column(default=0)
    completed_count: Mapped[int] = mapped_column(default=0)
    failed_count: Mapped[int] = mapped_column(default=0)
    label_map_path: Mapped[str | None] = mapped_column(Text)
    native_label_map_path: Mapped[str | None] = mapped_column(Text)
    error_message: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


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
    batch_id: Mapped[str | None] = mapped_column(ForeignKey("segmentation_batches.id"), index=True)
    organ_id: Mapped[str] = mapped_column(String(64))
    label_id: Mapped[int | None]
    label_name: Mapped[str | None] = mapped_column(String(200))
    group_id: Mapped[str | None] = mapped_column(String(64))
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(16), default="queued")
    progress: Mapped[int] = mapped_column(default=0)
    result_model_id: Mapped[str | None] = mapped_column(ForeignKey("organ_models.id"))
    error_message: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AnalysisTask(CreatedMixin, Base):
    __tablename__ = "analysis_tasks"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed')",
            name="ck_analysis_task_status",
        ),
        CheckConstraint("progress >= 0 AND progress <= 100", name="ck_analysis_task_progress"),
        CheckConstraint(
            "score_threshold >= 0 AND score_threshold <= 1",
            name="ck_analysis_score_threshold",
        ),
        Index(
            "uq_active_analysis",
            "image_id",
            "analysis_type",
            unique=True,
            postgresql_where=text("status IN ('queued', 'running')"),
            sqlite_where=text("status IN ('queued', 'running')"),
        ),
        Index("ix_analysis_patient_created", "patient_id", "created_at"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    image_id: Mapped[str] = mapped_column(ForeignKey("medical_images.id"))
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    analysis_type: Mapped[str] = mapped_column(String(64), default="lung_nodule_detection")
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    model_name: Mapped[str] = mapped_column(String(200))
    score_threshold: Mapped[float] = mapped_column(default=0.1)
    status: Mapped[str] = mapped_column(String(16), default="queued")
    progress: Mapped[int] = mapped_column(default=0)
    result_count: Mapped[int] = mapped_column(default=0)
    error_message: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Finding(CreatedMixin, Base):
    __tablename__ = "findings"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'confirmed', 'modified', 'dismissed')",
            name="ck_finding_status",
        ),
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_finding_confidence"),
        CheckConstraint("diameter_mm > 0", name="ck_finding_diameter"),
        CheckConstraint(
            "measurement_mm IS NULL OR measurement_mm > 0",
            name="ck_finding_measurement",
        ),
        CheckConstraint("coordinate_system = 'RAS'", name="ck_finding_coordinate_system"),
        CheckConstraint("box_mode = 'cccwhd'", name="ck_finding_box_mode"),
        Index("ix_findings_image_status", "image_id", "status"),
        Index("ix_findings_patient_created", "patient_id", "created_at"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    task_id: Mapped[str] = mapped_column(ForeignKey("analysis_tasks.id"), index=True)
    image_id: Mapped[str] = mapped_column(ForeignKey("medical_images.id"))
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    finding_type: Mapped[str] = mapped_column(String(64), default="lung_nodule")
    model_label: Mapped[str] = mapped_column(String(100), default="0")
    label: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float]
    diameter_mm: Mapped[float]
    box_extent_mm: Mapped[float | None]
    measurement_mm: Mapped[float | None]
    measurement_method: Mapped[str | None] = mapped_column(String(64))
    measurement_status: Mapped[str] = mapped_column(
        String(24), default="candidate", server_default=text("'candidate'")
    )
    side_evidence: Mapped[str | None] = mapped_column(String(64))
    coordinate_system: Mapped[str] = mapped_column(String(8), default="RAS")
    box_mode: Mapped[str] = mapped_column(String(16), default="cccwhd")
    center_world_mm: Mapped[list] = mapped_column(JSON)
    box_world_mm: Mapped[list] = mapped_column(JSON)
    center_voxel: Mapped[list] = mapped_column(JSON)
    box_voxel: Mapped[list] = mapped_column(JSON)
    side: Mapped[str | None] = mapped_column(String(16))
    lobe: Mapped[str | None] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(16), default="pending")
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    revision: Mapped[int] = mapped_column(default=1, server_default=text("1"))


class AIConversation(CreatedMixin, Base):
    __tablename__ = "ai_conversations"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    examination_id: Mapped[str | None] = mapped_column(
        ForeignKey("medical_images.id"), nullable=True, index=True
    )
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


class AIProviderConfig(CreatedMixin, Base):
    __tablename__ = "ai_provider_configs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('configured', 'connected', 'accepted', 'disabled')",
            name="ck_ai_provider_status",
        ),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    provider_id: Mapped[str] = mapped_column(String(64), unique=True)
    display_name: Mapped[str] = mapped_column(String(120))
    protocol: Mapped[str] = mapped_column(String(32), default="chat_completions")
    base_url: Mapped[str] = mapped_column(String(500))
    api_key_env: Mapped[str | None] = mapped_column(String(120))
    model_id: Mapped[str] = mapped_column(String(160))
    capabilities: Mapped[list] = mapped_column(JSON, default=list)
    modalities: Mapped[list] = mapped_column(JSON, default=list)
    organs: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(24), default="configured")
    data_scope: Mapped[dict] = mapped_column(JSON, default=dict)
    timeout_seconds: Mapped[int] = mapped_column(default=60)
    max_input_chars: Mapped[int] = mapped_column(default=30000)
    max_output_chars: Mapped[int] = mapped_column(default=16000)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )


class AIInvocation(CreatedMixin, Base):
    __tablename__ = "ai_invocations"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed', 'cancelled')",
            name="ck_ai_invocation_status",
        ),
        Index("ix_ai_invocations_patient_status", "patient_id", "status"),
    )
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    examination_id: Mapped[str | None] = mapped_column(ForeignKey("medical_images.id"))
    organ_id: Mapped[str] = mapped_column(String(64))
    purpose: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(24), default="queued")
    provider_id: Mapped[str | None] = mapped_column(String(64))
    model_id: Mapped[str | None] = mapped_column(String(160))
    base_revision: Mapped[int | None]
    input_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    result: Mapped[dict | None] = mapped_column(JSON)
    error_code: Mapped[int | None]
    error_message: Mapped[str | None] = mapped_column(Text)
    idempotency_key: Mapped[str | None] = mapped_column(String(128), unique=True)
    lease_owner: Mapped[str | None] = mapped_column(String(128))
    lease_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )


class AIInvocationAttempt(CreatedMixin, Base):
    __tablename__ = "ai_invocation_attempts"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed', 'cancelled')",
            name="ck_ai_attempt_status",
        ),
        Index("ix_ai_attempts_invocation", "invocation_id", "attempt_number"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    invocation_id: Mapped[str] = mapped_column(ForeignKey("ai_invocations.id"))
    attempt_number: Mapped[int]
    status: Mapped[str] = mapped_column(String(24))
    provider_id: Mapped[str | None] = mapped_column(String(64))
    model_id: Mapped[str | None] = mapped_column(String(160))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_code: Mapped[int | None]
    error_message: Mapped[str | None] = mapped_column(Text)
    usage: Mapped[dict] = mapped_column(JSON, default=dict)


class AuditEvent(CreatedMixin, Base):
    __tablename__ = "audit_events"
    __table_args__ = (Index("ix_audit_events_actor_user_id", "actor_user_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id"), index=True)
    action: Mapped[str] = mapped_column(String(64))
    resource_type: Mapped[str] = mapped_column(String(64))
    resource_id: Mapped[str] = mapped_column(String(64))
    before: Mapped[dict | None] = mapped_column(JSON)
    after: Mapped[dict | None] = mapped_column(JSON)
    request_id: Mapped[str | None] = mapped_column(String(64), index=True)
    ip_address: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(String(512))


class JwtRevocation(Base):
    __tablename__ = "jwt_revocations"
    jti: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
