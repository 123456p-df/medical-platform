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


class RecordCreate(Input):
    organ_id: str = Field(min_length=1, max_length=64)
    diagnosis: str = Field(min_length=1, max_length=10000)
    description: str = Field(min_length=1, max_length=30000)
    record_date: date

    @field_validator("diagnosis", "description")
    @classmethod
    def not_blank(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank")
        return value.strip()


class RecordPatch(Input):
    organ_id: str | None = Field(default=None, min_length=1, max_length=64)
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
        return self


class RecordOut(BaseModel):
    record_id: int
    patient_id: int
    organ_id: str
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
