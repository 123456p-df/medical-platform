import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.exceptions import HTTPException

from app.config import Settings
from app.db import make_engine, make_session_factory
from app.errors import APIError, success
from app.routers import (
    ai,
    analysis,
    auth,
    catalog,
    images,
    organ_models,
    patients,
    profile,
    records,
    segmentation,
    workflow,
)
from app.services.ai import AIProvider
from app.services.analysis import AnalysisRunner
from app.services.imaging import release_volume_cache
from app.services.segmentation import SegmentationRunner

logger = logging.getLogger(__name__)
SINGLE_INSTANCE_LOCK = 867421309


class BodyLimitMiddleware:
    def __init__(self, app, max_bytes):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        total = 0
        rejected = False
        limit = self.max_bytes if scope["path"].endswith("/medical-images") else 1024 * 1024
        if scope["path"] in {"/api/v1/auth/profile/files", "/api/v1/auth/profile/avatar"}:
            limit = 11 * 1024 * 1024

        async def reject():
            nonlocal rejected
            rejected = True
            response = JSONResponse(
                {"code": 41301, "message": "Request body exceeds limit", "data": None},
                status_code=413,
                headers={"Cache-Control": "no-store"},
            )
            await response(scope, receive, send)

        headers = dict(scope["headers"])
        try:
            length = int(headers.get(b"content-length", b"0"))
        except ValueError:
            length = 0
        if length > limit:
            return await reject()

        async def limited_receive():
            nonlocal total
            message = await receive()
            if message["type"] == "http.request":
                total += len(message.get("body", b""))
                if total > limit:
                    await reject()
                    # Starlette's multipart parser cleans its temporary files on HTTPException.
                    raise HTTPException(413, "Request body exceeds limit")
            return message

        async def limited_send(message):
            if not rejected:
                await send(message)

        await self.app(scope, limited_receive, limited_send)


def create_app(
    settings: Settings | None = None,
    *,
    engine=None,
    segmentation_adapter=None,
    analysis_adapter=None,
    ai_provider=None,
    recover_tasks=True,
) -> FastAPI:
    settings = settings or Settings()
    engine = engine or make_engine(settings.database_url)
    sessions = make_session_factory(engine)
    runner = SegmentationRunner(settings, sessions, segmentation_adapter)
    analysis_runner = AnalysisRunner(settings, sessions, analysis_adapter)

    @asynccontextmanager
    async def lifespan(app):
        lock_connection = None
        try:
            if engine.dialect.name == "postgresql":
                lock_connection = engine.connect()
                locked = lock_connection.execute(
                    text("SELECT pg_try_advisory_lock(:key)"), {"key": SINGLE_INSTANCE_LOCK}
                ).scalar()
                lock_connection.commit()
                if not locked:
                    raise RuntimeError(
                        "BackgroundTasks deployment supports one API process; use --workers 1"
                    )
            settings.storage_root.mkdir(parents=True, exist_ok=True)
            if recover_tasks:
                runner.recover()
                analysis_runner.recover()
            yield
        finally:
            runner.close()
            analysis_runner.close()
            release_volume_cache(settings.storage_root)
            if lock_connection is not None:
                lock_connection.execute(
                    text("SELECT pg_advisory_unlock(:key)"), {"key": SINGLE_INSTANCE_LOCK}
                )
                lock_connection.commit()
                lock_connection.close()
            engine.dispose()

    app = FastAPI(
        title="VMRB Medical Data API",
        version="1.0.0",
        lifespan=lifespan,
        description="病历数据中心、医学影像分割、器官模型与医疗辅助问答。所有业务 JSON 使用统一 envelope。",
    )
    app.state.settings = settings
    app.state.session_factory = sessions
    app.state.segmentation_runner = runner
    app.state.analysis_runner = analysis_runner
    app.state.ai_provider = ai_provider or AIProvider(settings)
    app.add_middleware(BodyLimitMiddleware, max_bytes=settings.max_upload_bytes + 1024 * 1024)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["X-Image-Orientation", "X-Slice-Axis"],
    )

    @app.middleware("http")
    async def private_responses(request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.exception_handler(APIError)
    async def api_error(request: Request, exc: APIError):
        headers = {"WWW-Authenticate": "Bearer"} if exc.status == 401 else {}
        return JSONResponse(
            {"code": exc.code, "message": exc.message, "data": None},
            status_code=exc.status,
            headers=headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        # Pydantic errors normally echo input (including passwords and identity numbers).
        return JSONResponse(
            {"code": 42201, "message": "Invalid request format", "data": None}, status_code=422
        )

    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException):
        messages = {
            400: "Invalid request",
            401: "Authentication required",
            403: "Forbidden",
            404: "Resource not found",
            405: "Method not allowed",
            413: "Request body exceeds limit",
        }
        return JSONResponse(
            {
                "code": exc.status_code * 100 + 1,
                "message": messages.get(exc.status_code, "Request failed"),
                "data": None,
            },
            status_code=exc.status_code,
            headers=exc.headers,
        )

    @app.exception_handler(Exception)
    async def server_error(request: Request, exc: Exception):
        logger.error("Unhandled API error (%s)", type(exc).__name__)
        return JSONResponse(
            {"code": 50001, "message": "Internal server error", "data": None},
            status_code=500,
            headers={"Cache-Control": "no-store"},
        )

    for router in [
        profile.router,
        workflow.router,
        auth.router,
        catalog.router,
        patients.router,
        records.router,
        images.router,
        segmentation.router,
        analysis.router,
        organ_models.router,
        ai.router,
    ]:
        app.include_router(router, prefix="/api/v1")

    @app.get("/health", tags=["Operations"])
    def health():
        try:
            with sessions() as db:
                db.execute(text("SELECT 1"))
        except Exception:
            raise APIError(503, 50303, "Database unavailable") from None
        return success({"status": "ok"})

    # Add common error envelopes to the generated OpenAPI documentation.
    original_openapi = app.openapi

    def openapi():
        schema = original_openapi()
        for path, operations in schema["paths"].items():
            if not path.startswith("/api/v1"):
                continue
            for operation in operations.values():
                if not isinstance(operation, dict) or "responses" not in operation:
                    continue
                for status in [400, 401, 403, 404, 409, 413, 422, 500, 502, 503]:
                    operation["responses"][str(status)] = {
                        "description": "Error envelope",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["code", "message", "data"],
                                    "properties": {
                                        "code": {"type": "integer"},
                                        "message": {"type": "string"},
                                        "data": {"type": "null"},
                                    },
                                }
                            }
                        },
                    }
        return jsonable_encoder(schema)

    app.openapi = openapi
    return app
