from datetime import date, datetime
from math import isfinite
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Credentials(Input):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[\w.-]+$")
    password: str = Field(min_length=6, max_length=128)


class RegisterInput(Credentials):
    password: str = Field(min_length=8, max_length=128)
    role: Literal["patient"] = "patient"


class UserOut(BaseModel):
    user_id: int
    username: str
    role: Literal["admin", "doctor", "patient"]
    patient_id: int | None = None
    account_role: Literal["admin", "doctor", "patient"]
    profile_completed: bool = False


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Literal["admin", "doctor", "patient"]
    user_id: int


class DoctorProvisionInput(Credentials):
    password: str = Field(min_length=8, max_length=128)
    department: str = Field(default="", max_length=100)


class AdminUserOut(BaseModel):
    user_id: int
    username: str
    role: Literal["admin", "doctor", "patient"]
    is_active: bool
    department: str = ""
    last_login_at: datetime | None = None
    created_at: datetime
    deleted_at: datetime | None = None


class AdminUserPage(BaseModel):
    items: list[AdminUserOut]
    page: int
    page_size: int
    total: int


class UserStatusInput(Input):
    is_active: bool


class PasswordResetInput(Input):
    new_password: str = Field(min_length=8, max_length=128)


class PatientAccessInput(Input):
    doctor_user_id: int
    patient_id: int
    status: Literal["active", "revoked"] = "active"


class PatientAccessOut(BaseModel):
    doctor_user_id: int
    doctor_username: str
    doctor_name: str
    patient_id: int
    patient_name: str | None
    status: Literal["active", "revoked"]
    created_at: datetime


class PatientAccessPage(BaseModel):
    items: list[PatientAccessOut]
    total: int


class DailyMetric(BaseModel):
    date: date
    count: int


class DoctorActivityMetric(BaseModel):
    user_id: int
    username: str
    display_name: str
    signed_reports: int
    images_uploaded: int
    audit_actions: int


class AdminStatsOut(BaseModel):
    days: int
    new_patients: list[DailyMetric]
    image_uploads: list[DailyMetric]
    ai_tasks: list[DailyMetric]
    signed_reports: list[DailyMetric]
    doctor_activity: list[DoctorActivityMetric]


class TemplateUsageOut(BaseModel):
    template_id: str | None = None
    template_name: str
    doctor_user_id: int
    doctor_name: str
    report_count: int


class BreakGlassInput(Input):
    reason: str = Field(min_length=3, max_length=500)
    duration_minutes: int = Field(default=15, ge=1, le=60)

    @field_validator("reason")
    @classmethod
    def nonblank_reason(cls, value):
        if not value.strip():
            raise ValueError("Reason must not be blank")
        return value.strip()


class ResolveInput(Input):
    name: str = Field(min_length=1, max_length=100)
    id_number: str = Field(min_length=6, max_length=32)

    @field_validator("name", "id_number")
    @classmethod
    def trim(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank")
        return value.strip()


class PatientOut(BaseModel):
    patient_id: int
    name: str | None
    gender: str | None
    birth_date: date | None


class PatientCreate(ResolveInput):
    birth_date: date | None = None
    gender: Literal["male", "female", "unknown"] = "unknown"
    height: float | None = Field(None, gt=0, le=300, allow_inf_nan=False)
    weight: float | None = Field(None, gt=0, le=700, allow_inf_nan=False)
    blood_type: str | None = Field(None, pattern=r"^(A|B|AB|O)([+-])?$")

    @field_validator("birth_date")
    @classmethod
    def valid_birth_date(cls, value):
        if value and (value > date.today() or value.year < 1850):
            raise ValueError("Invalid birth date")
        return value


class PatientOnboardingPatch(ResolveInput):
    birth_date: date | None = None
    gender: Literal["male", "female", "unknown"] = "unknown"
    height: float | None = Field(None, gt=0, le=300, allow_inf_nan=False)
    weight: float | None = Field(None, gt=0, le=700, allow_inf_nan=False)
    blood_type: str | None = Field(None, pattern=r"^(A|B|AB|O)([+-])?$")

    @field_validator("birth_date")
    @classmethod
    def valid_birth_date(cls, value):
        if value and (value > date.today() or value.year < 1850):
            raise ValueError("Invalid birth date")
        return value


class InvitationCreate(Input):
    expires_minutes: int = Field(default=30, ge=5, le=1440)


class InvitationOut(BaseModel):
    invitation_id: str
    patient_id: int
    patient_name: str | None
    code: str
    expires_at: datetime


class PatientLinkInput(ResolveInput):
    token: str = Field(min_length=32, max_length=128)


class PatientLinkOut(BaseModel):
    patient_id: int
    account_role: Literal["patient"]
    profile_completed: bool = True


class LinkExistingInput(ResolveInput):
    birth_date: date | None = None

    @field_validator("birth_date")
    @classmethod
    def valid_birth_date(cls, value):
        if value and (value > date.today() or value.year < 1850):
            raise ValueError("Invalid birth date")
        return value


class LinkExistingOut(BaseModel):
    patient_id: int
    name: str | None
    already_linked: bool = False


class PatientArchiveInput(Input):
    reason: str = Field(min_length=3, max_length=500)

    @field_validator("reason")
    @classmethod
    def nonblank_reason(cls, value):
        if not value.strip():
            raise ValueError("Reason must not be blank")
        return value.strip()


class PatientArchiveOut(BaseModel):
    archive_id: int
    patient_id: int
    patient_name: str | None
    reason: str
    archived_by_user_id: int
    archived_by_username: str
    archived_at: datetime
    restored_by_user_id: int | None = None
    restored_by_username: str | None = None
    restored_at: datetime | None = None


class PatientArchivePage(BaseModel):
    items: list[PatientArchiveOut]
    page: int
    page_size: int
    total: int


class DicomConvertInput(Input):
    organ_id: str = Field(min_length=1, max_length=64)


class DicomConvertOut(BaseModel):
    series_id: str
    medical_image_id: str
    status: Literal["ready"]
    already_converted: bool = False


class ProfilePatch(Input):
    display_name: str = Field(min_length=1, max_length=100)
    title: str = Field(default="", max_length=100)
    department: str = Field(default="", max_length=100)
    phone: str = Field(default="", max_length=40)
    email: str = Field(default="", max_length=254)
    bio: str = Field(default="", max_length=2000)

    @field_validator("display_name")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Name must not be blank")
        return value.strip()


class ReportTemplateField(Input):
    key: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z][a-zA-Z0-9_]*$")
    label: str = Field(min_length=1, max_length=160)
    section: str = Field(default="findings", min_length=1, max_length=160)
    type: Literal["text", "textarea", "number", "date", "select", "boolean"]
    required: bool = False
    options: list[str] = Field(default_factory=list, max_length=100)
    unit: str | None = Field(default=None, max_length=40)


class ReportTemplateCreate(Input):
    name: str = Field(min_length=1, max_length=160)
    modality: Literal["CT", "MRI", "X-Ray"] | None = None
    organ_id: str | None = Field(default=None, max_length=64)
    fields: list[ReportTemplateField] = Field(min_length=1, max_length=100)

    @field_validator("name")
    @classmethod
    def nonblank_name(cls, value):
        if not value.strip():
            raise ValueError("Template name must not be blank")
        return value.strip()


class ReportTemplatePatch(Input):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    modality: Literal["CT", "MRI", "X-Ray"] | None = None
    organ_id: str | None = Field(default=None, max_length=64)
    fields: list[ReportTemplateField] | None = Field(default=None, min_length=1, max_length=100)
    is_active: bool | None = None
    is_default: bool | None = None


class ReportTemplateOut(BaseModel):
    template_id: str
    name: str
    modality: Literal["CT", "MRI", "X-Ray"] | None = None
    organ_id: str | None = None
    version: int
    is_active: bool
    is_default: bool = False
    fields: list[ReportTemplateField]
    created_at: datetime
    updated_at: datetime


class ReportTemplateVersionOut(BaseModel):
    version_id: int
    template_id: str
    version: int
    name: str
    modality: Literal["CT", "MRI", "X-Ray"] | None = None
    organ_id: str | None = None
    fields: list[ReportTemplateField]
    is_active: bool
    is_default: bool
    created_at: datetime


class StructuredReportOut(BaseModel):
    record_id: int
    report_template_id: str | None = None
    report_template: ReportTemplateOut | None = None
    structured_data: dict[str, Any] | None = None
    updated_at: datetime


class RecordCreate(Input):
    organ_id: str = Field(min_length=1, max_length=64)
    organ_ids: list[str] | None = Field(None, min_length=1, max_length=10)
    examination_id: str | None = Field(default=None, max_length=64)
    diagnosis: str = Field(min_length=1, max_length=10000)
    description: str = Field(min_length=1, max_length=30000)
    recommendation: str = Field(default="", max_length=10000)
    report_template_id: str | None = Field(default=None, max_length=64)
    structured_data: dict[str, Any] | None = None
    reviewed: bool = False
    record_date: date

    @field_validator("diagnosis", "description")
    @classmethod
    def not_blank(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank")
        return value.strip()

    @model_validator(mode="after")
    def matching_organs(self):
        if self.organ_ids is not None:
            if (
                len(set(self.organ_ids)) != len(self.organ_ids)
                or self.organ_id not in self.organ_ids
            ):
                raise ValueError("Organ list must be unique and include the primary organ")
            self.organ_ids = [self.organ_id, *[v for v in self.organ_ids if v != self.organ_id]]
        return self


class RecordPatch(Input):
    organ_id: str | None = Field(default=None, min_length=1, max_length=64)
    organ_ids: list[str] | None = Field(None, min_length=1, max_length=10)
    examination_id: str | None = Field(default=None, max_length=64)
    diagnosis: str | None = Field(default=None, min_length=1, max_length=10000)
    description: str | None = Field(default=None, min_length=1, max_length=30000)
    recommendation: str | None = Field(default=None, max_length=10000)
    report_template_id: str | None = Field(default=None, max_length=64)
    structured_data: dict[str, Any] | None = None
    reviewed: bool | None = None
    record_date: date | None = None

    @model_validator(mode="after")
    def nonempty(self):
        values = self.model_dump(exclude_unset=True)
        meaningful = {
            key: value
            for key, value in values.items()
            if key not in {"report_template_id", "structured_data"}
        }
        has_structured_change = any(
            key in values and values[key] is not None
            for key in {"report_template_id", "structured_data"}
        )
        if (not meaningful and not has_structured_change) or any(
            v is None or (isinstance(v, str) and not v.strip()) for v in meaningful.values()
        ):
            raise ValueError("Provide at least one non-null, non-blank field")
        if self.organ_ids is not None:
            if len(set(self.organ_ids)) != len(self.organ_ids):
                raise ValueError("Organ list must be unique")
            if self.organ_id is not None and self.organ_id not in self.organ_ids:
                raise ValueError("Primary organ must be included")
        return self


class AddendumCreate(Input):
    reason: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=20000)

    @field_validator("reason", "content")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank")
        return value.strip()


class AddendumOut(BaseModel):
    addendum_id: int
    record_id: int
    author_user_id: int
    author_name: str
    reason: str
    content: str
    created_at: datetime


class RecordOut(BaseModel):
    record_id: int
    patient_id: int
    organ_id: str
    organ_ids: list[str]
    examination_id: str | None
    diagnosis: str
    description: str
    recommendation: str
    report_template_id: str | None = None
    structured_data: dict[str, Any] | None = None
    report_template: ReportTemplateOut | None = None
    reviewed: bool
    signed_at: datetime | None
    record_date: date
    doctor_name: str
    created_at: datetime
    updated_at: datetime
    addenda: list[AddendumOut] = Field(default_factory=list)


class RecordPage(BaseModel):
    items: list[RecordOut]
    page: int
    page_size: int
    total: int


class Summary(BaseModel):
    height: float | None
    weight: float | None
    blood_type: str | None


class OrganFlag(BaseModel):
    organ_id: str
    name: str
    has_record: bool
    has_medical_image: bool


class OverviewOut(BaseModel):
    patient_id: int
    name: str | None
    summary: Summary
    organs: list[OrganFlag]


class ModelSelection(BaseModel):
    source: Literal["default", "segmentation"]
    model_id: str
    available: bool
    label_id: int | None = None
    label_name: str | None = None
    group_id: str | None = None
    face_count: int | None = None
    size_bytes: int | None = None
    volume_cm3: float | None = None
    is_watertight: bool | None = None
    bounds: dict | None = None


class OrganRecord(BaseModel):
    record_id: int
    organ_ids: list[str]
    date: date
    diagnosis: str
    description: str
    doctor_name: str


class OrganOut(BaseModel):
    organ_id: str
    name: str
    model: ModelSelection
    records: list[OrganRecord]
    records_total: int


class ImageOut(BaseModel):
    image_id: str
    patient_id: int
    image_type: Literal["CT", "MRI"]
    organ_id: str
    status: str = "uploaded"
    shape: list[int]
    spacing: list[float]
    slice_count: int
    study_date: date | None
    created_at: datetime
    segmentation_batch_id: str | None = None
    atlas_model_id: str | None = None
    acquisition: dict | None = None
    source_format: Literal["nifti", "dicom"] = "nifti"
    series_uid: str | None = None
    sequence: Literal["T1", "T2", "FLAIR", "DWI", "other", "unknown"] = "unknown"
    contrast: bool | None = None
    segmentation_mode: Literal["CT_BODY", "MRI_BODY", "MRI_BRAIN"] | None = None
    sequence_confidence: Literal["auto", "manual"] = "auto"
    segmentation_warning: str | None = None


class ImageAcquisitionPatch(Input):
    sequence: Literal["T1", "T2", "FLAIR", "DWI", "other", "unknown"] | None = None
    contrast: bool | None = None
    segmentation_mode: Literal["CT_BODY", "MRI_BODY", "MRI_BRAIN"] | None = None
    already_skull_stripped: bool | None = None

    @model_validator(mode="after")
    def nonempty(self):
        if not self.model_dump(exclude_unset=True):
            raise ValueError("Provide at least one field")
        return self


class ImagePage(BaseModel):
    items: list[ImageOut]
    page: int
    page_size: int
    total: int


class PatientRosterItem(BaseModel):
    patient_id: int
    name: str | None
    birth_date: date | None
    gender: str | None
    blood_type: str | None
    latest_image: ImageOut | None


class PatientRosterPage(BaseModel):
    items: list[PatientRosterItem]
    page: int
    page_size: int
    total: int


class SegmentationInput(Input):
    organ_id: str = Field(min_length=1, max_length=64)


class TaskCreated(BaseModel):
    task_id: str
    status: Literal["queued", "running", "completed", "failed"]


class TaskResult(BaseModel):
    model_id: str


class TaskOut(TaskCreated):
    progress: int
    result: TaskResult | None = None
    error_message: str | None = None


class BatchItemOut(BaseModel):
    task_id: str
    label_id: int | None = None
    organ_id: str
    name: str
    display_name: str | None = None
    group_id: str | None = None
    group_name: str | None = None
    status: Literal["queued", "running", "completed", "failed"]
    progress: int
    model_id: str | None = None
    mesh_name: str | None = None
    face_count: int | None = None
    size_bytes: int | None = None
    volume_cm3: float | None = None
    is_watertight: bool | None = None
    bounds: dict | None = None
    color: list[int] | None = None
    outline_only: bool | None = None
    error_message: str | None = None


class SegmentationBatchOut(BaseModel):
    batch_id: str
    image_id: str
    status: Literal["queued", "running", "completed", "partial", "failed", "unavailable"]
    progress: int
    total_labels: int
    recognized_count: int
    completed_count: int
    failed_count: int
    atlas_model_id: str | None = None
    items: list[BatchItemOut] = Field(default_factory=list)
    error_message: str | None = None


class ComparisonCandidateOut(BaseModel):
    image_id: str
    patient_id: int
    image_type: Literal["CT", "MRI"]
    organ_id: str
    study_date: date | None
    sequence: str | None = None
    shape: list | None = None
    spacing: list | None = None
    comparable: bool
    reasons: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    device: str | None = None
    world_matrix: list[list[float]] | None = None


class LabelColorOut(BaseModel):
    label_id: int | None = None
    organ_id: str
    name: str
    display_name: str
    color: list[int]
    luminance: float
    outline_only: bool


class AnalysisInput(Input):
    analysis_type: Literal["lung_nodule_detection"] = "lung_nodule_detection"
    score_threshold: float = Field(default=0.1, ge=0, le=1, allow_inf_nan=False)


class AnalysisStatus(BaseModel):
    configured: bool
    analysis_type: Literal["lung_nodule_detection"] = "lung_nodule_detection"
    model_name: str
    supported_image_types: list[str]
    supported_organs: list[str] = Field(default_factory=lambda: ["lung"])


class AnalysisTaskResult(BaseModel):
    findings_count: int
    findings_url: str


class AnalysisTaskOut(TaskCreated):
    analysis_type: Literal["lung_nodule_detection"]
    model_name: str
    score_threshold: float
    progress: int
    result: AnalysisTaskResult | None = None
    error_message: str | None = None


class FindingOut(BaseModel):
    finding_id: str
    task_id: str
    image_id: str
    patient_id: int
    finding_type: Literal["lung_nodule"]
    model_label: str
    label: str
    description: str
    confidence: float
    diameter_mm: float
    coordinate_system: Literal["RAS"]
    box_mode: Literal["cccwhd"]
    center_world_mm: list[float] = Field(min_length=3, max_length=3)
    box_world_mm: list[float] = Field(min_length=6, max_length=6)
    center_voxel: list[float] = Field(min_length=3, max_length=3)
    box_voxel: list[float] = Field(min_length=6, max_length=6)
    side: Literal["left", "right"] | None
    lobe: str | None
    status: Literal["pending", "confirmed", "modified", "dismissed"]
    model_name: str
    created_at: datetime
    updated_at: datetime
    revision: int


class FindingPatch(Input):
    status: Literal["pending", "confirmed", "modified", "dismissed"] | None = None
    label: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=4000)
    diameter_mm: float | None = Field(default=None, gt=0, allow_inf_nan=False)
    center_world_mm: list[float] | None = Field(default=None, min_length=3, max_length=3)
    box_world_mm: list[float] | None = Field(default=None, min_length=6, max_length=6)
    center_voxel: list[float] | None = Field(default=None, min_length=3, max_length=3)
    box_voxel: list[float] | None = Field(default=None, min_length=6, max_length=6)
    modification_reason: str | None = Field(default=None, min_length=1, max_length=500)
    expected_revision: int | None = Field(default=None, ge=1)

    @model_validator(mode="after")
    def nonempty(self):
        values = self.model_dump(exclude_unset=True)
        if not values or any(value is None for value in values.values()):
            raise ValueError("Provide at least one non-null field")
        if not (values.keys() - {"expected_revision", "modification_reason"}):
            raise ValueError("Provide a finding field to update")
        if self.label is not None:
            self.label = self.label.strip()
            if not self.label:
                raise ValueError("Finding label must not be blank")
        if self.description is not None:
            self.description = self.description.strip()
            if not self.description:
                raise ValueError("Finding description must not be blank")
        geometry_fields = {
            "diameter_mm", "center_world_mm", "box_world_mm", "center_voxel", "box_voxel"
        }
        supplied = geometry_fields & values.keys()
        if supplied and supplied != geometry_fields:
            raise ValueError("Finding geometry must be updated as one complete coordinate set")
        if supplied:
            vectors = [self.center_world_mm, self.box_world_mm, self.center_voxel, self.box_voxel]
            if any(not isfinite(value) for vector in vectors for value in vector or []):
                raise ValueError("Finding geometry must contain only finite numbers")
            if any(value <= 0 for value in (self.box_world_mm or [])[3:]):
                raise ValueError("World-space box dimensions must be positive")
            if any(value <= 0 for value in (self.box_voxel or [])[3:]):
                raise ValueError("Voxel-space box dimensions must be positive")
            if not self.modification_reason:
                raise ValueError("Geometry changes require a modification reason")
        elif self.modification_reason is not None:
            raise ValueError("A modification reason requires a geometry change")
        return self


class ModelOut(BaseModel):
    model_id: str
    format: Literal["glb"] = "glb"
    source: Literal["default", "segmentation"]
    kind: Literal["organ", "atlas"] | None = None
    available: bool
    url: str | None
    label_id: int | None = None
    label_name: str | None = None
    group_id: str | None = None
    face_count: int | None = None
    size_bytes: int | None = None
    volume_cm3: float | None = None
    is_watertight: bool | None = None
    bounds: dict | None = None


class ChatInput(Input):
    patient_id: int = Field(gt=0)
    organ_id: str = Field(min_length=1, max_length=64)
    question: str = Field(min_length=1, max_length=4000)

    @field_validator("question")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Question must not be blank")
        return value.strip()


class Reference(BaseModel):
    record_id: int
    date: date


class ChatOut(BaseModel):
    conversation_id: str
    answer: str
    references: list[Reference]
    context_truncated: bool
    purpose: str = "medical_decision_support"
