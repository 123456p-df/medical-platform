from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Credentials(Input):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[\w.-]+$")
    password: str = Field(min_length=8, max_length=128)


class RegisterInput(Credentials):
    role: Literal["doctor", "patient"]


class UserOut(BaseModel):
    user_id: int
    username: str
    role: Literal["doctor", "patient"]
    patient_id: int | None = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Literal["doctor", "patient"]
    user_id: int


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


class RecordCreate(Input):
    organ_id: str = Field(min_length=1, max_length=64)
    organ_ids: list[str] | None = Field(None, min_length=1, max_length=10)
    diagnosis: str = Field(min_length=1, max_length=10000)
    description: str = Field(min_length=1, max_length=30000)
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
    diagnosis: str | None = Field(default=None, min_length=1, max_length=10000)
    description: str | None = Field(default=None, min_length=1, max_length=30000)
    record_date: date | None = None

    @model_validator(mode="after")
    def nonempty(self):
        values = self.model_dump(exclude_unset=True)
        if not values or any(
            v is None or (isinstance(v, str) and not v.strip()) for v in values.values()
        ):
            raise ValueError("Provide at least one non-null, non-blank field")
        if self.organ_ids is not None:
            if len(set(self.organ_ids)) != len(self.organ_ids):
                raise ValueError("Organ list must be unique")
            if self.organ_id is not None and self.organ_id not in self.organ_ids:
                raise ValueError("Primary organ must be included")
        return self


class RecordOut(BaseModel):
    record_id: int
    patient_id: int
    organ_id: str
    organ_ids: list[str]
    diagnosis: str
    description: str
    record_date: date
    doctor_name: str
    created_at: datetime
    updated_at: datetime


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


class FindingPatch(Input):
    status: Literal["pending", "confirmed", "modified", "dismissed"] | None = None
    label: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=4000)

    @model_validator(mode="after")
    def nonempty(self):
        values = self.model_dump(exclude_unset=True)
        if not values or any(value is None for value in values.values()):
            raise ValueError("Provide at least one non-null field")
        if self.label is not None:
            self.label = self.label.strip()
            if not self.label:
                raise ValueError("Finding label must not be blank")
        if self.description is not None:
            self.description = self.description.strip()
            if not self.description:
                raise ValueError("Finding description must not be blank")
        return self


class ModelOut(BaseModel):
    model_id: str
    format: Literal["glb"] = "glb"
    source: Literal["default", "segmentation"]
    available: bool
    url: str | None


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
