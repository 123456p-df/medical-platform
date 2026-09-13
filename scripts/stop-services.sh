#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREVIEW_DIR="$PROJECT_ROOT/.cache/preview"

cd "$PROJECT_ROOT"

if [[ -f "$PROJECT_ROOT/.env" && -f "$PROJECT_ROOT/backend/.env" ]] \
    && command -v docker >/dev/null 2>&1 \
    && docker compose version >/dev/null 2>&1 \
    && docker info >/dev/null 2>&1; then
    echo "Stopping Docker preview services (data volumes are preserved)..."
    docker compose stop nginx backend db
fi

if [ -f "$PREVIEW_DIR/backend.pid" ]; then
    PID=$(cat "$PREVIEW_DIR/backend.pid")
    echo "Stopping backend (PID: $PID)..."
    kill "$PID" 2>/dev/null || true
    rm -f "$PREVIEW_DIR/backend.pid"
fi
if [ -f "$PREVIEW_DIR/frontend.pid" ]; then
    PID=$(cat "$PREVIEW_DIR/frontend.pid")
    echo "Stopping frontend (PID: $PID)..."
    kill "$PID" 2>/dev/null || true
    rm -f "$PREVIEW_DIR/frontend.pid"
fi
echo "Preview services stopped; database and uploaded data were preserved."
