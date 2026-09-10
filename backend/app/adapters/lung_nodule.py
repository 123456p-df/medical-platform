from pathlib import Path
from typing import Literal

import httpx
from pydantic import BaseModel, ConfigDict, Field, field_validator


class DetectionCandidate(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    box: tuple[float, float, float, float, float, float]
    score: float = Field(ge=0, le=1)
    label: int | str = 0
    side: Literal["left", "right"] | None = None
    lobe: str | None = Field(default=None, max_length=64)

    @field_validator("box")
    @classmethod
    def positive_box_size(cls, value):
        if any(size <= 0 for size in value[3:]):
            raise ValueError("Detection box dimensions must be positive")
        return value


class DetectionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    model_name: str = Field(min_length=1, max_length=200)
    coordinate_system: Literal["RAS"]
    box_mode: Literal["cccwhd"]
    findings: list[DetectionCandidate] = Field(max_length=1000)


def validate_detection_output(raw, *, score_threshold: float, max_findings: int):
    payload = raw.model_dump() if isinstance(raw, DetectionResponse) else raw
    if isinstance(payload, dict) and isinstance(payload.get("data"), dict):
        payload = payload["data"]
    parsed = DetectionResponse.model_validate(payload)
    findings = [item for item in parsed.findings if item.score >= score_threshold]
    findings.sort(key=lambda item: item.score, reverse=True)
    if len(findings) > max_findings:
        findings = findings[:max_findings]
    return parsed.model_copy(update={"findings": findings})


class LungNoduleHTTPAdapter:
    """Send a NIfTI CT to an isolated MONAI inference service.

    The model worker returns RAS world-coordinate boxes in MONAI's postprocessed
    ``cccwhd`` format. No patient identifiers or database metadata are transmitted.
    """

    image_types = {"CT"}

    def __init__(self, settings, client: httpx.Client | None = None):
        self.url = (settings.lung_nodule_model_url or "").rstrip("/")
        self.token = (
            settings.lung_nodule_model_token.get_secret_value()
            if settings.lung_nodule_model_token
            else None
        )
        self.timeout = settings.lung_nodule_model_timeout_seconds
        self.model_name = settings.lung_nodule_model_name
        self.max_findings = settings.lung_nodule_max_findings
        self.client = client

    def available(self):
        return bool(self.url)

    def __call__(self, *, image_path: Path, score_threshold: float, progress):
        progress(10)
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        media_type = "application/gzip" if image_path.name.endswith(".nii.gz") else "application/octet-stream"
        owned_client = self.client is None
        client = self.client or httpx.Client(
            timeout=httpx.Timeout(self.timeout, connect=min(10.0, self.timeout))
        )
        try:
            with image_path.open("rb") as source:
                response = client.post(
                    f"{self.url}/v1/lung-nodule/detect",
                    headers=headers,
                    data={"score_threshold": str(score_threshold)},
                    files={"file": (image_path.name, source, media_type)},
                )
            response.raise_for_status()
            if len(response.content) > 5 * 1024 * 1024:
                raise ValueError("Model response exceeds limit")
            progress(85)
            return validate_detection_output(
                response.json(),
                score_threshold=score_threshold,
                max_findings=self.max_findings,
            )
        finally:
            if owned_client:
                client.close()
