FROM ghcr.io/astral-sh/uv:0.12.5 AS uv
FROM python:3.12-slim AS base
COPY --from=uv /uv /uvx /bin/
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_LINK_MODE=copy
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY app ./app
COPY migrations ./migrations
COPY alembic.ini .env.example ./
RUN uv sync --frozen --no-dev && useradd --uid 10001 --create-home appuser \
    && mkdir -p /data && chown -R appuser:appuser /data /app
ENV PATH="/app/.venv/bin:$PATH"
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:create_app --factory --host 0.0.0.0 --port 8000 --workers 1 --no-access-log"]

# Optional runtime: built only with compose.gpu.yaml. The source model remains mounted read-only.
FROM base AS gpu
USER root
COPY requirements-nv.txt ./
RUN uv pip install --python /app/.venv/bin/python -r requirements-nv.txt
USER appuser
