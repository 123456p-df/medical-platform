#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREVIEW_DIR="$PROJECT_ROOT/.cache/preview"
mkdir -p "$PREVIEW_DIR"

echo "Killing any stale processes on 8000 and 4173..."
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 4173/tcp 2>/dev/null || true
sleep 1

echo "Refreshing database models and fixtures..."
cd "$PROJECT_ROOT/backend"
VMRB_REFRESH_DEMO_MODELS=1 VMRB_DEMO_SEED=1 PYTHONPATH=. /home/zhichun/Documents/NV-Segment-CTMR/.venv/bin/python3 -m app.demo

echo "Starting backend on 0.0.0.0:8000..."
cd "$PROJECT_ROOT/backend"
nohup env PYTHONPATH=. /home/zhichun/Documents/NV-Segment-CTMR/.venv/bin/python3 -m uvicorn app.main:create_app --factory --host 0.0.0.0 --port 8000 --workers 1 > "$PREVIEW_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$PREVIEW_DIR/backend.pid"

echo "Starting frontend on 0.0.0.0:4173..."
cd "$PROJECT_ROOT/medical-platform/Medical"
export PATH="$HOME/.local/bin:$PATH"
nohup env VITE_PREVIEW=true VMRB_BACKEND_URL=http://127.0.0.1:8000 npx vite --host 0.0.0.0 --port 4173 > "$PREVIEW_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$PREVIEW_DIR/frontend.pid"

echo "Waiting for services to become healthy..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/health | grep -q "ok"; then
        echo "Backend is ready!"
        break
    fi
    sleep 1
done

for i in {1..30}; do
    if curl -s http://127.0.0.1:4173/health | grep -q "ok"; then
        echo "Frontend and proxy are ready!"
        break
    fi
    sleep 1
done

echo "=============================================="
echo "  Medical Platform Demo Services are RUNNING! "
echo "  Frontend URL: http://192.168.14.164:4173    "
echo "  Backend API:  http://192.168.14.164:8000/docs"
echo "=============================================="
