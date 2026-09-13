#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_SCAN_PATH_HOST="${VMRB_DEMO_SCAN_PATH_HOST:-$PROJECT_ROOT/.cache/real-imaging/CT-chest.nii.gz}"
if [[ -n "${VMRB_DEMO_SCAN_PATH_HOST:-}" && -f "$DEMO_SCAN_PATH_HOST" ]]; then
    DEMO_SCAN_PATH_HOST="$(cd "$(dirname "$DEMO_SCAN_PATH_HOST")" && pwd -P)/$(basename "$DEMO_SCAN_PATH_HOST")"
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
    if [[ ! -f "$DEMO_SCAN_PATH_HOST" ]]; then
        echo "Demo CT not found at $DEMO_SCAN_PATH_HOST"
        echo "Set VMRB_DEMO_SCAN_PATH_HOST to a de-identified NIfTI CT file."
        exit 1
    fi
    echo "Resetting the explicitly approved demo database in the Docker volume..."
    docker compose stop backend nginx >/dev/null 2>&1 || true
    docker compose run --rm --no-deps --user root \
        -e VMRB_DEMO_RESET=1 \
        -e VMRB_REFRESH_DEMO_MODELS=1 \
        -e VMRB_DEMO_SCAN_PATH=/demo-scan.nii.gz \
        -v "$PROJECT_ROOT/scripts:/app/scripts:ro" \
        -v "$DEMO_SCAN_PATH_HOST:/demo-scan.nii.gz:ro" \
        -v "$PROJECT_ROOT/public/models:/public/models:ro" \
        backend python /app/scripts/reset-demo-data.py
    docker compose run --rm --no-deps --user root backend chown -R 10001:10001 /dataset
fi

echo "Starting Docker backend and nginx..."
docker compose up -d --build backend nginx

services_ready=0
for _ in {1..30}; do
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

# Match the Windows preview: seed a new database, or finish an interrupted seed
# containing only known demo accounts. Any other existing data is left untouched.
account_counts="$(docker compose exec -T db psql -U vmrb -d vmrb -tAc \
    "SELECT COUNT(*) || '|' || COUNT(*) FILTER (WHERE username IN ('admin','demo_doctor','demo_patient_full','demo_patient_test','demo_patient','demo_patient_2','demo_patient_3')) || '|' || COUNT(*) FILTER (WHERE username IN ('admin','demo_doctor','demo_patient_full','demo_patient_test')) || '|' || (SELECT COUNT(*) FROM medical_images WHERE id = 'img_demo_real_ct') || '|' || (SELECT COUNT(*) FROM medical_records WHERE examination_id = 'img_demo_real_ct') FROM users" \
    | tr -d '[:space:]')"
IFS='|' read -r user_count known_demo_count fixed_account_count demo_image_count demo_record_count <<< "$account_counts"
if [[ ! "$user_count" =~ ^[0-9]+$ \
    || ! "$known_demo_count" =~ ^[0-9]+$ \
    || ! "$fixed_account_count" =~ ^[0-9]+$ \
    || ! "$demo_image_count" =~ ^[0-9]+$ \
    || ! "$demo_record_count" =~ ^[0-9]+$ ]]; then
    echo "Could not determine whether the preview database needs initial data."
    exit 1
fi
demo_complete=0
if [[ "$fixed_account_count" == "4" && "$demo_image_count" -ge 1 && "$demo_record_count" -ge 1 ]]; then
    demo_complete=1
fi
if [[ "$user_count" == "$known_demo_count" && "$demo_complete" == "0" ]]; then
    if [[ ! -f "$DEMO_SCAN_PATH_HOST" ]]; then
        if [[ -n "${VMRB_DEMO_SCAN_PATH_HOST:-}" ]]; then
            echo "Demo CT not found at $DEMO_SCAN_PATH_HOST"
            exit 1
        fi
        echo "Downloading checksum-pinned public 3D Slicer demo images..."
        mkdir -p "$PROJECT_ROOT/.cache/real-imaging"
        docker compose run --rm --no-deps --user "$(id -u):$(id -g)" \
            -v "$PROJECT_ROOT/scripts:/app/scripts:ro" \
            -v "$PROJECT_ROOT/.cache/real-imaging:/app/.cache/real-imaging" \
            backend python /app/scripts/real-imaging-samples.py
    fi
    echo "Creating the four fixed preview accounts and the demo CT record..."
    docker compose run --rm --no-deps \
        -e VMRB_DEMO_SCAN_PATH=/demo-scan.nii.gz \
        -v "$DEMO_SCAN_PATH_HOST:/demo-scan.nii.gz:ro" \
        -v "$PROJECT_ROOT/public/models:/public/models:ro" \
        backend python -c 'from app.config import Settings; from app.demo import seed; seed(Settings())'
fi

echo "Medical Platform is ready at http://127.0.0.1:8080"
docker compose ps
