#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_SCAN_DIR_HOST="${VMRB_DEMO_SCAN_DIR_HOST:-}"
if [[ -n "$DEMO_SCAN_DIR_HOST" && -d "$DEMO_SCAN_DIR_HOST" ]]; then
    DEMO_SCAN_DIR_HOST="$(cd "$DEMO_SCAN_DIR_HOST" && pwd -P)"
fi

cd "$PROJECT_ROOT"

for command in node docker curl; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Required command '$command' was not found."
        exit 1
    fi
done
if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose is unavailable. Install and start Docker Desktop first."
    exit 1
fi
if ! docker info >/dev/null 2>&1; then
    echo "Docker is not running. Start Docker Desktop and try again."
    exit 1
fi

# Fresh clones do not contain ignored secret files. Generate only missing or blank
# local-preview values; existing database, model and AI settings are preserved.
node "$PROJECT_ROOT/scripts/prepare-preview-env.mjs"
docker compose up -d db

db_ready=0
for _ in {1..30}; do
    if docker compose exec -T db pg_isready -U vmrb -d vmrb >/dev/null 2>&1; then
        db_ready=1
        break
    fi
    sleep 1
done
if (( db_ready == 0 )); then
    echo "Database did not become ready in time."
    docker compose ps
    exit 1
fi

if [[ "${VMRB_RESET_DEMO:-0}" == "1" ]]; then
    if [[ -z "$DEMO_SCAN_DIR_HOST" || ! -d "$DEMO_SCAN_DIR_HOST" ]]; then
        echo "Set VMRB_DEMO_SCAN_DIR_HOST to the directory containing 0.nii, 1.nii and 10.nii."
        exit 1
    fi
    echo "Resetting the explicitly approved demo database in the Docker volume..."
    docker compose stop backend nginx >/dev/null 2>&1 || true
    docker compose run --rm --no-deps --user root \
        -e VMRB_DEMO_RESET=1 \
        -e VMRB_REFRESH_DEMO_MODELS=1 \
        -e VMRB_DEMO_SCAN_DIR=/demo-scans \
        -v "$PROJECT_ROOT/scripts:/app/scripts:ro" \
        -v "$DEMO_SCAN_DIR_HOST:/demo-scans:ro" \
        -v "$PROJECT_ROOT/public/models:/public/models:ro" \
        backend python /app/scripts/reset-demo-data.py
    docker compose run --rm --no-deps --user root backend chown -R 10001:10001 /data
fi

echo "Starting Docker backend and nginx..."
docker compose up -d --build backend nginx

services_ready=0
for _ in {1..120}; do
    if curl -fsS http://127.0.0.1:8080/health >/dev/null; then
        services_ready=1
        break
    fi
    sleep 1
done

if (( services_ready == 0 )); then
    echo "Services did not become healthy in time."
    docker compose ps
    exit 1
fi

echo "Medical Platform is ready at http://127.0.0.1:8080"
docker compose ps
