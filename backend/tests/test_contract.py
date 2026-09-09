import asyncio

from app.main import BodyLimitMiddleware


def test_core_and_portal_apis_and_uniform_errors(app_env):
    _, client, _, _ = app_env
    schema = client.get("/openapi.json").json()
    operations = [
        (path, method)
        for path, methods in schema["paths"].items()
        if path.startswith("/api/v1")
        for method in methods
    ]
    assert len(operations) == 35  # Core APIs, patient/profile/workflow and canonical volume.
    assert client.get("/missing").json() == {
        "code": 40401,
        "message": "Resource not found",
        "data": None,
    }
    assert client.get("/api/v1/auth/login").status_code == 405
    invalid = client.post("/api/v1/auth/register", content=b'{"password":"SUPER-SECRET",')
    assert invalid.status_code == 422 and "SUPER-SECRET" not in invalid.text
    for path, method in operations:
        assert schema["paths"][path][method]["responses"]["422"]["content"]["application/json"][
            "schema"
        ]["properties"]["data"] == {"type": "null"}


def test_body_limit_protects_before_handler(app_env):
    _, client, _, _ = app_env
    result = client.post("/api/v1/auth/login", content=b"x" * (1024 * 1024 + 1))
    assert result.status_code == 413
    assert result.json()["data"] is None


def test_streamed_request_limit_emits_only_one_response():
    async def scenario():
        sent = []
        chunks = [
            {"type": "http.request", "body": b"x" * 5, "more_body": True},
            {"type": "http.request", "body": b"x" * 6, "more_body": False},
        ]

        async def receive():
            return chunks.pop(0)

        async def send(message):
            sent.append(message)

        async def downstream(scope, receive, send):
            try:
                await receive()
                await receive()
            except Exception:
                await send({"type": "http.response.start", "status": 500, "headers": []})
                await send({"type": "http.response.body", "body": b"error"})

        middleware = BodyLimitMiddleware(downstream, max_bytes=10)
        await middleware(
            {"type": "http", "path": "/api/v1/patients/1/medical-images", "headers": []},
            receive,
            send,
        )
        assert [m["status"] for m in sent if m["type"] == "http.response.start"] == [413]

    asyncio.run(scenario())
