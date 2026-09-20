#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
if [[ -x /usr/libexec/path_helper ]]; then
  eval "$(/usr/libexec/path_helper -s 2>/dev/null || true)"
fi

FRONTEND_PORT="${VMRB_FRONTEND_PORT:-4173}"
BACKEND_PORT="${VMRB_BACKEND_PORT:-8000}"
DATABASE_PORT="${VMRB_DATABASE_PORT:-15432}"
RADSIGHT_PORT="${VMRB_RADSIGHT_PORT:-8001}"
POSTGRES_BIN="${VMRB_POSTGRES_BIN:-}"
NV_SEGMENT_DIR="${NV_SEGMENT_CT_DIR:-}"
SKIP_NV_SEGMENT_SETUP="${VMRB_SKIP_NV_SEGMENT_SETUP:-}"
if [[ -z "$NV_SEGMENT_DIR" ]]; then
  for candidate in "$HOME/NV-Segment-CTMR" "$HOME/NV-segment-CTMR" "/Users/allenyuan/NV-Segment-CTMR"; do
    if [[ -d "$candidate" ]]; then
      NV_SEGMENT_DIR="$candidate"
      break
    fi
  done
fi
if [[ -z "$SKIP_NV_SEGMENT_SETUP" ]]; then
  if [[ -n "$NV_SEGMENT_DIR" && -f "$NV_SEGMENT_DIR/hugging_face_pipeline.py" && -f "$NV_SEGMENT_DIR/vista3d_pretrained_model/model.pt" ]]; then
    SKIP_NV_SEGMENT_SETUP="0"
  else
    SKIP_NV_SEGMENT_SETUP="1"
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PREVIEW_ROOT="$PROJECT_ROOT/.cache/preview"
BACKEND_ROOT="$PROJECT_ROOT/backend"
FRONTEND_ROOT="$PROJECT_ROOT"
CLUSTER_ROOT="$PREVIEW_ROOT/postgres"
PYTHON_BIN="$BACKEND_ROOT/.venv/bin/python"
RADSIGHT_PYTHON="${RADSIGHT_PYTHON:-$PROJECT_ROOT/.venv-radsight/bin/python}"
RADSIGHT_MODEL_PATH="${RADSIGHT_MODEL_PATH:-/Users/allenyuan/modilify_app/RadSight-8B}"
RADSIGHT_VISION_ENCODER_PATH="${RADSIGHT_VISION_ENCODER_PATH:-/Users/allenyuan/modilify_app/VL3-SigLIP-NaViT}"
RADSIGHT_QUANT="${RADSIGHT_QUANT:-int8}"
RADSIGHT_DEVICE="${RADSIGHT_DEVICE:-mps}"
RADSIGHT_ALLOW_STUB="${RADSIGHT_ALLOW_STUB:-0}"

mkdir -p "$PREVIEW_ROOT"

# Trap errors/interrupts during startup to prevent leaving orphan background processes
STARTUP_SUCCESS=0
cleanup_on_error() {
  local exit_code=$?
  if (( STARTUP_SUCCESS == 0 )); then
    echo "Startup interrupted or failed (exit code $exit_code); stopping any partial services..." >&2
    bash "$SCRIPT_DIR/stop-preview.sh" >/dev/null 2>&1 || true
  fi
  exit $exit_code
}
trap cleanup_on_error EXIT INT TERM

# Ensure uv / python virtual environment
if [[ ! -x "$PYTHON_BIN" ]]; then
  UV_BIN="$(command -v uv 2>/dev/null || true)"
  if [[ -z "$UV_BIN" ]]; then
    for candidate in "$HOME/.local/bin/uv" "/opt/homebrew/bin/uv" "/usr/local/bin/uv" "$HOME/.cargo/bin/uv"; do
      if [[ -x "$candidate" ]]; then
        UV_BIN="$candidate"
        break
      fi
    done
  fi
  if [[ -z "$UV_BIN" ]] && command -v brew >/dev/null 2>&1; then
    echo "Installing uv via Homebrew..."
    brew install uv
    UV_BIN="$(command -v uv 2>/dev/null || true)"
  fi
  if [[ -z "$UV_BIN" ]]; then
    echo "Error: uv is not installed or not in PATH. Please install uv first."
    exit 1
  fi
  echo "Setting up backend virtual environment with uv..."
  "$UV_BIN" sync --locked --project "$BACKEND_ROOT"
  if [[ ! -x "$PYTHON_BIN" ]]; then
    echo "Error: Backend dependency installation failed ($PYTHON_BIN not found)."
    exit 1
  fi
fi

# Locate Node.js binary
NODE_BIN="$(command -v node 2>/dev/null || true)"
if [[ -z "$NODE_BIN" ]]; then
  for candidate in "/opt/homebrew/bin/node" "/usr/local/bin/node" "$HOME/.nvm/versions/node/"*"/bin/node"; do
    if [[ -x "$candidate" ]]; then
      NODE_BIN="$candidate"
      break
    fi
  done
fi
if [[ -z "$NODE_BIN" ]]; then
  echo "Error: Node.js is not installed or not in PATH."
  exit 1
fi

# Ensure frontend dependencies and pnpm availability
VITE_ENTRY="$FRONTEND_ROOT/node_modules/vite/bin/vite.js"
if [[ ! -f "$VITE_ENTRY" ]]; then
  echo "Installing frontend dependencies..."
  PNPM_BIN="$(command -v pnpm 2>/dev/null || true)"
  if [[ -z "$PNPM_BIN" ]]; then
    if command -v corepack >/dev/null 2>&1; then
      corepack enable pnpm >/dev/null 2>&1 || corepack enable >/dev/null 2>&1 || true
      PNPM_BIN="$(command -v pnpm 2>/dev/null || true)"
    fi
  fi
  if [[ -z "$PNPM_BIN" ]] && command -v npm >/dev/null 2>&1; then
    npm install -g pnpm >/dev/null 2>&1 || true
    PNPM_BIN="$(command -v pnpm 2>/dev/null || true)"
  fi
  if [[ -n "$PNPM_BIN" ]]; then
    (cd "$FRONTEND_ROOT" && "$PNPM_BIN" install)
  else
    (cd "$FRONTEND_ROOT" && npx -y pnpm install)
  fi
fi

# NV-Segment setup
if [[ "$SKIP_NV_SEGMENT_SETUP" != "1" && -n "$NV_SEGMENT_DIR" && -d "$NV_SEGMENT_DIR" ]]; then
  MODEL_HELPER="$NV_SEGMENT_DIR/hugging_face_pipeline.py"
  MODEL_WEIGHTS="$NV_SEGMENT_DIR/vista3d_pretrained_model/model.pt"
  if [[ -f "$MODEL_HELPER" && -f "$MODEL_WEIGHTS" ]]; then
    if ! "$PYTHON_BIN" -c "import monai, torch, transformers" >/dev/null 2>&1; then
      UV_BIN="$(command -v uv 2>/dev/null || echo "$HOME/.local/bin/uv")"
      echo "Installing NV-Segment-CTMR runtime dependencies (using mirror acceleration)..."
      UV_INDEX_URL="${UV_INDEX_URL:-https://pypi.tuna.tsinghua.edu.cn/simple}" "$UV_BIN" pip install --python "$PYTHON_BIN" -r "$BACKEND_ROOT/requirements-nv.txt"
    fi
    export NV_SEGMENT_CT_DIR="$NV_SEGMENT_DIR"
    if [[ -z "${NV_SEGMENT_DEVICE:-}" ]]; then
      NV_SEGMENT_DEVICE="auto"
    fi
    export NV_SEGMENT_DEVICE
    export NV_SEGMENT_ROI_SIZE="${NV_SEGMENT_ROI_SIZE:-[192,192,128]}"
    export NV_SEGMENT_OVERLAP="${NV_SEGMENT_OVERLAP:-0.3}"
    export PYTORCH_ENABLE_MPS_FALLBACK="${PYTORCH_ENABLE_MPS_FALLBACK:-1}"
    unset VMRB_SKIP_NV_SEGMENT_SETUP || true
    echo "NV-Segment-CTMR connected: $NV_SEGMENT_DIR (device: $NV_SEGMENT_DEVICE)"
  fi
else
  export VMRB_SKIP_NV_SEGMENT_SETUP=1
  echo "Lightweight AI mode enabled (NV-Segment heavy model setup skipped)."
fi

# Locate PostgreSQL binaries
if [[ -z "$POSTGRES_BIN" ]]; then
  if command -v initdb >/dev/null 2>&1; then
    POSTGRES_BIN="$(dirname "$(command -v initdb)")"
  else
    for candidate in \
      "/opt/homebrew/opt/postgresql@16/bin" \
      "/opt/homebrew/opt/postgresql@15/bin" \
      "/opt/homebrew/opt/postgresql@14/bin" \
      "/opt/homebrew/opt/postgresql/bin" \
      /opt/homebrew/Cellar/postgresql@16/*/bin \
      /opt/homebrew/Cellar/postgresql/*/bin \
      "/usr/local/opt/postgresql@16/bin" \
      "/usr/local/opt/postgresql@15/bin" \
      "/usr/local/opt/postgresql/bin"; do
      if [[ -x "$candidate/initdb" ]]; then
        POSTGRES_BIN="$candidate"
        break
      fi
    done
    if [[ -z "$POSTGRES_BIN" ]] && command -v brew >/dev/null 2>&1; then
      for pkg in postgresql@16 postgresql@15 postgresql@14 postgresql; do
        prefix="$(brew --prefix "$pkg" 2>/dev/null || true)"
        if [[ -n "$prefix" && -x "$prefix/bin/initdb" ]]; then
          POSTGRES_BIN="$prefix/bin"
          break
        fi
      done
    fi
  fi
fi

if [[ -z "$POSTGRES_BIN" || ! -x "$POSTGRES_BIN/initdb" ]]; then
  if command -v brew >/dev/null 2>&1; then
    echo "PostgreSQL not found. Attempting to install postgresql@16 via Homebrew..."
    brew install postgresql@16
    for candidate in \
      "$(brew --prefix postgresql@16 2>/dev/null || true)/bin" \
      "/opt/homebrew/opt/postgresql@16/bin" \
      "/usr/local/opt/postgresql@16/bin"; do
      if [[ -n "$candidate" && -x "$candidate/initdb" ]]; then
        POSTGRES_BIN="$candidate"
        break
      fi
    done
  fi
fi

if [[ -z "$POSTGRES_BIN" || ! -x "$POSTGRES_BIN/initdb" ]]; then
  echo "Error: PostgreSQL tools (initdb, pg_ctl) were not found."
  echo "Please install PostgreSQL via: brew install postgresql@16"
  echo "or set VMRB_POSTGRES_BIN to the bin directory containing initdb."
  exit 1
fi

echo "$POSTGRES_BIN" > "$PREVIEW_ROOT/postgres-bin"
export PATH="$POSTGRES_BIN:$PATH"

# Password generation
PASSWORD_FILE="$PREVIEW_ROOT/db-password"
if [[ ! -f "$PASSWORD_FILE" ]]; then
  "$PYTHON_BIN" -c "import secrets, sys; from pathlib import Path; Path(sys.argv[1]).write_text(secrets.token_urlsafe(32))" "$PASSWORD_FILE"
  chmod 600 "$PASSWORD_FILE"
fi

# Initialize cluster if not yet initialized
if [[ ! -f "$CLUSTER_ROOT/PG_VERSION" ]]; then
  if [[ -d "$CLUSTER_ROOT" ]]; then
    rm -rf "$CLUSTER_ROOT"
  fi
  echo "Initializing isolated PostgreSQL cluster in $CLUSTER_ROOT..."
  "$POSTGRES_BIN/initdb" -D "$CLUSTER_ROOT" -U vmrb --auth=scram-sha-256 --pwfile="$PASSWORD_FILE" --encoding=UTF8 --locale=C
fi

# Pre-flight check: ensure ports are not conflicting with unmanaged processes
for entry in "backend.pid:$BACKEND_PORT:FastAPI backend:uvicorn" "frontend.pid:$FRONTEND_PORT:Vite frontend:vite"; do
  pid_file="$PREVIEW_ROOT/${entry%%:*}"
  rest="${entry#*:}"
  port="${rest%%:*}"
  rest="${rest#*:}"
  service_name="${rest%%:*}"
  pattern="${rest##*:}"
  if [[ -f "$pid_file" ]]; then
    old_pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
      cmd="$(ps -p "$old_pid" -o command= 2>/dev/null || true)"
      if [[ "$cmd" == *"$pattern"* ]]; then
        echo "Error: $service_name already running on port $port (PID $old_pid)."
        echo "Use scripts/stop-preview.sh before restarting."
        exit 1
      else
        rm -f "$pid_file"
      fi
    else
      rm -f "$pid_file"
    fi
  fi
  if command -v lsof >/dev/null 2>&1; then
    existing_pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$existing_pids" ]]; then
      echo "Error: Port $port is already in use by process PID $existing_pids."
      echo "Use scripts/stop-preview.sh or stop the process on port $port before restarting."
      exit 1
    fi
  fi
done

# Start PostgreSQL if not already running
if ! "$POSTGRES_BIN/pg_ctl" -D "$CLUSTER_ROOT" status >/dev/null 2>&1; then
  echo "Starting isolated PostgreSQL on port $DATABASE_PORT..."
  "$POSTGRES_BIN/pg_ctl" -D "$CLUSTER_ROOT" \
    -l "$PREVIEW_ROOT/postgres.log" \
    -o "-h 127.0.0.1 -p $DATABASE_PORT" \
    -w start

  database_ready=0
  for _ in {1..40}; do
    if "$POSTGRES_BIN/pg_isready" -h 127.0.0.1 -p "$DATABASE_PORT" -U vmrb >/dev/null 2>&1; then
      database_ready=1
      break
    fi
    sleep 0.25
  done
  if (( database_ready == 0 )); then
    echo "Error: Preview database did not become ready; inspect $PREVIEW_ROOT/postgres.log"
    exit 1
  fi
fi

PREVIEW_PASSWORD="$(tr -d '\r\n' < "$PASSWORD_FILE")"
export DATABASE_URL="postgresql+psycopg://vmrb:${PREVIEW_PASSWORD}@127.0.0.1:${DATABASE_PORT}/postgres"

# Create vmrb_preview database if not exists
"$PYTHON_BIN" -c "import os; from sqlalchemy import create_engine, text; e=create_engine(os.environ['DATABASE_URL'], isolation_level='AUTOCOMMIT'); c=e.connect(); exists=c.execute(text('SELECT 1 FROM pg_database WHERE datname=:name'), {'name':'vmrb_preview'}).scalar(); c.execute(text('CREATE DATABASE vmrb_preview')) if not exists else None; c.close(); e.dispose()"

export DATABASE_URL="postgresql+psycopg://vmrb:${PREVIEW_PASSWORD}@127.0.0.1:${DATABASE_PORT}/vmrb_preview"
export STORAGE_ROOT="$PREVIEW_ROOT/medical-data"
mkdir -p "$STORAGE_ROOT"

# Ensure local environment files (.env and backend/.env) exist
if [[ -f "$PROJECT_ROOT/scripts/prepare-preview-env.mjs" ]]; then
  "$NODE_BIN" "$PROJECT_ROOT/scripts/prepare-preview-env.mjs" >/dev/null 2>&1 || true
fi

if [[ -z "${VMRB_DEMO_SCAN_DIR:-}" ]]; then
  if ls "$HOME/Downloads"/*.nii* >/dev/null 2>&1; then
    export VMRB_DEMO_SCAN_DIR="$HOME/Downloads"
    echo "Auto-detected sample scans in Downloads: $VMRB_DEMO_SCAN_DIR"
  fi
fi

# Run migrations and seed demo data
echo "Applying Alembic database migrations..."
(
  cd "$BACKEND_ROOT"
  "$PYTHON_BIN" -m alembic upgrade head
  echo "Seeding demo fixtures and accounts..."
  VMRB_DEMO_SEED=1 "$PYTHON_BIN" -m app.demo
)

# Start backend
echo "Starting FastAPI backend on port $BACKEND_PORT..."
"$PYTHON_BIN" -c "
import os, subprocess, sys
out = open('$PREVIEW_ROOT/backend.log', 'w')
err = open('$PREVIEW_ROOT/backend-error.log', 'w')
env = dict(os.environ, DATABASE_URL='$DATABASE_URL', STORAGE_ROOT='$STORAGE_ROOT')
if os.environ.get('VMRB_SKIP_NV_SEGMENT_SETUP') == '1':
    env['VMRB_SKIP_NV_SEGMENT_SETUP'] = '1'
else:
    env.pop('VMRB_SKIP_NV_SEGMENT_SETUP', None)
p = subprocess.Popen(
    [sys.executable, '-m', 'uvicorn', 'app.main:create_app', '--factory', '--host', '127.0.0.1', '--port', '$BACKEND_PORT', '--workers', '1', '--no-access-log'],
    cwd='$BACKEND_ROOT',
    start_new_session=True,
    stdin=subprocess.DEVNULL,
    stdout=out,
    stderr=err,
    env=env,
)
with open('$PREVIEW_ROOT/backend.pid', 'w') as f:
    f.write(str(p.pid))
"

# Wait for backend to be ready
echo "Waiting for FastAPI backend to be ready..."
backend_ready=0
for _ in {1..40}; do
  if curl -fsS "http://127.0.0.1:$BACKEND_PORT/health" 2>/dev/null | grep -q '"status":"ok"'; then
    backend_ready=1
    break
  fi
  sleep 0.25
done

if (( backend_ready == 0 )); then
  echo "Error: Backend failed to start; inspect $PREVIEW_ROOT/backend-error.log"
  exit 1
fi

# Start RadSight-8B multimodal microservice
if [[ ! -x "$RADSIGHT_PYTHON" ]]; then
  echo "RadSight venv missing at $RADSIGHT_PYTHON"
  echo "Creating Apple Silicon inference environment (first run can take several minutes)..."
  bash "$SCRIPT_DIR/radsight_runtime/setup_env.sh"
fi
if [[ ! -x "$RADSIGHT_PYTHON" ]]; then
  echo "Error: RadSight Python interpreter not found ($RADSIGHT_PYTHON)."
  echo "Run scripts/radsight_runtime/setup_env.sh first."
  exit 1
fi

echo "Starting RadSight-8B multimodal microservice on port $RADSIGHT_PORT..."
"$PYTHON_BIN" -c "
import os, subprocess
out = open('$PREVIEW_ROOT/radsight.log', 'w')
err = open('$PREVIEW_ROOT/radsight-error.log', 'w')
env = dict(os.environ)
env.update({
    'RADSIGHT_PORT': '$RADSIGHT_PORT',
    'RADSIGHT_MODEL_PATH': '$RADSIGHT_MODEL_PATH',
    'RADSIGHT_VISION_ENCODER_PATH': '$RADSIGHT_VISION_ENCODER_PATH',
    'RADSIGHT_QUANT': '$RADSIGHT_QUANT',
    'RADSIGHT_DEVICE': '$RADSIGHT_DEVICE',
    'RADSIGHT_ALLOW_STUB': '$RADSIGHT_ALLOW_STUB',
})
p = subprocess.Popen(
    ['$RADSIGHT_PYTHON', '$PROJECT_ROOT/scripts/radsight_service.py'],
    cwd='$PROJECT_ROOT',
    start_new_session=True,
    stdin=subprocess.DEVNULL,
    stdout=out,
    stderr=err,
    env=env,
)
with open('$PREVIEW_ROOT/radsight.pid', 'w') as f:
    f.write(str(p.pid))
"

radsight_up=0
for _ in {1..50}; do
  health="$(curl -fsS "http://127.0.0.1:$RADSIGHT_PORT/health" 2>/dev/null || true)"
  if echo "$health" | grep -Eq '"status":"(loading|ready)"'; then
    radsight_up=1
    if echo "$health" | grep -q '"status":"ready"'; then
      echo "RadSight-8B microservice is ready on port $RADSIGHT_PORT."
    else
      echo "RadSight-8B microservice is loading weights on port $RADSIGHT_PORT."
    fi
    break
  fi
  sleep 0.2
done
if (( radsight_up == 0 )); then
  echo "Warning: RadSight health endpoint did not respond; inspect $PREVIEW_ROOT/radsight-error.log"
fi

# Start frontend
echo "Starting Vite frontend on port $FRONTEND_PORT..."
export VITE_LOCAL_PREVIEW=false
export VITE_PREVIEW=true
export VMRB_BACKEND_URL="http://127.0.0.1:$BACKEND_PORT"
export CI=true

"$PYTHON_BIN" -c "
import os, subprocess, sys
out = open('$PREVIEW_ROOT/frontend.log', 'w')
err = open('$PREVIEW_ROOT/frontend-error.log', 'w')
env = dict(os.environ, CI='true', VMRB_BACKEND_URL='http://127.0.0.1:$BACKEND_PORT', VITE_LOCAL_PREVIEW='false', VITE_PREVIEW='true')
p = subprocess.Popen(
    ['$NODE_BIN', '$VITE_ENTRY', '--host', '127.0.0.1', '--port', '$FRONTEND_PORT'],
    cwd='$FRONTEND_ROOT',
    start_new_session=True,
    stdin=subprocess.DEVNULL,
    stdout=out,
    stderr=err,
    env=env,
)
with open('$PREVIEW_ROOT/frontend.pid', 'w') as f:
    f.write(str(p.pid))
"

# Wait for frontend preview to be ready
frontend_ready=0
for _ in {1..40}; do
  if curl -fsS "http://127.0.0.1:$FRONTEND_PORT/health" 2>/dev/null | grep -q '"status":"ok"'; then
    frontend_ready=1
    break
  fi
  sleep 0.25
done

if (( frontend_ready == 0 )); then
  echo "Error: Preview startup failed; inspect logs in $PREVIEW_ROOT and run scripts/stop-preview.sh."
  exit 1
fi

# Disarm error cleanup trap now that startup succeeded
STARTUP_SUCCESS=1
trap - EXIT INT TERM

echo "Preview ready: http://127.0.0.1:$FRONTEND_PORT"
echo "Backend docs: http://127.0.0.1:$BACKEND_PORT/docs"
echo "Demo accounts: admin, demo_doctor, demo_patient, test_patient / 123456"
if [[ -z "${VMRB_DEMO_SCAN_DIR:-}" ]]; then
  echo "Note: No demo scans configured; upload a CT or set VMRB_DEMO_SCAN_DIR for seeded imaging."
fi
