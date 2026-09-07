from typing import Any, Generic, TypeVar

from pydantic import BaseModel


class APIError(Exception):
    def __init__(self, status: int, code: int, message: str):
        self.status = status
        self.code = code
        self.message = message


T = TypeVar("T")


class Envelope(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    data: T


def success(data: Any) -> dict:
    return {"code": 0, "message": "success", "data": data}
