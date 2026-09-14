from io import BytesIO
from types import SimpleNamespace

from app.errors import APIError
from app.routers.dicom import _client
from app.routers.profile import decode_image, read_upload


def expect_error(action, code):
    try:
        action()
    except APIError as error:
        assert error.code == code
        return error
    raise AssertionError(f"Expected API error {code}")


empty = SimpleNamespace(file=BytesIO(b""))
empty_error = expect_error(lambda: read_upload(empty, 1024), 40011)
assert empty_error.retryable is False

image_error = expect_error(lambda: decode_image(b"not-an-image"), 40011)
assert image_error.message.startswith("Use a valid")

gateway_error = expect_error(lambda: _client(SimpleNamespace(orthanc_url=None)), 50305)
assert gateway_error.retryable is True
assert gateway_error.phase == "gateway"

service_error = APIError(503, 50304, "Model is not configured")
assert service_error.retryable is True
assert service_error.code != gateway_error.code

validation_error = APIError(
    422,
    42201,
    "Invalid request format",
    field_errors={"record_date": "must be a valid date"},
)
assert validation_error.field_errors == {"record_date": "must be a valid date"}

print("P1 backend error contracts passed")
