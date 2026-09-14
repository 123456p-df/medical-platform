from typing import Any, Generic, TypeVar

from pydantic import BaseModel


class APIError(Exception):
    def __init__(
        self,
        status: int,
        code: int,
        message: str,
        *,
        field_errors: dict[str, str] | None = None,
        retryable: bool | None = None,
        phase: str | None = None,
    ):
        self.status = status
        self.code = code
        self.message = message
        self.field_errors = field_errors
        self.retryable = status >= 500 if retryable is None else retryable
        self.phase = phase


T = TypeVar("T")


class Envelope(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    data: T


def success(data: Any) -> dict:
    return {"code": 0, "message": "success", "data": data}
