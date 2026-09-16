#!/usr/bin/env bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREVIEW_DIR="$PROJECT_ROOT/.cache/preview"

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
echo "All services stopped."
