#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_SCAN_DIR_HOST="${VMRB_DEMO_SCAN_DIR_HOST:-/home/zhichun/Documents/NV-Segment-CTMR/test_data/user_scans}"

cd "$PROJECT_ROOT"
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
    echo "Resetting the explicitly approved demo database in the Docker volume..."
    docker compose stop backend nginx >/dev/null 2>&1 || true
    docker compose run --rm --no-deps --user root \
        -e VMRB_DEMO_RESET=1 \
        -e VMRB_REFRESH_DEMO_MODELS=1 \
        -e VMRB_DEMO_SCAN_DIR=/demo-scans \
        -v "$PROJECT_ROOT/scripts/reset-demo-data.py:/app/scripts/reset-demo-data.py:ro" \
        -v "$DEMO_SCAN_DIR_HOST:/demo-scans:ro" \
        backend python /app/scripts/reset-demo-data.py
    docker compose run --rm --no-deps --user root backend chown -R 10001:10001 /data
fi

echo "Starting Docker backend and nginx..."
docker compose up -d --build backend nginx

for _ in {1..30}; do
    if curl -fsS http://127.0.0.1:8080/health >/dev/null; then
        echo "Medical Platform is ready at http://127.0.0.1:8080"
        docker compose ps
        exit 0
    fi
    sleep 1
done

echo "Services did not become healthy in time."
docker compose ps
exit 1
