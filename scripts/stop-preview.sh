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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PREVIEW_ROOT="$PROJECT_ROOT/.cache/preview"

# Mutex to ensure idempotent sequential cleanup across concurrent traps/watchdogs
LOCK_DIR="$PREVIEW_ROOT/.stop-lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  for _ in {1..40}; do
    if [[ ! -d "$LOCK_DIR" ]]; then
      exit 0
    fi
    sleep 0.1
  done
  exit 0
fi
trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM

stop_process_by_pid_file() {
  local name="$1"
  local expected_pattern="$2"
  local pid_file="$PREVIEW_ROOT/${name}.pid"

  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      local cmd
      cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
      if [[ "$cmd" == *"$expected_pattern"* ]]; then
        echo "Stopping $name (PID $pid)..."
        kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
        for _ in {1..30}; do
          if ! kill -0 "$pid" 2>/dev/null; then
            break
          fi
          sleep 0.1
        done
        if kill -0 "$pid" 2>/dev/null; then
          echo "Force killing $name (PID $pid)..."
          kill -9 -"$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
        fi
      else
        echo "PID $pid does not match expected pattern '$expected_pattern'; leaving alone."
      fi
    fi
    rm -f "$pid_file"
  fi
}

stop_process_on_port() {
  local name="$1"
  local port="$2"
  local pattern="$3"

  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
          local cmd
          cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
          if [[ -z "$pattern" || "$cmd" == *"$pattern"* ]]; then
            echo "Stopping residual $name on port $port (PID $pid)..."
            kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
            for _ in {1..20}; do
              if ! kill -0 "$pid" 2>/dev/null; then
                break
              fi
              sleep 0.1
            done
            if kill -0 "$pid" 2>/dev/null; then
              kill -9 -"$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
            fi
          fi
        fi
      done
    fi
  fi
}

# 1. Stop tracked frontend, backend, and radsight
stop_process_by_pid_file "frontend" "vite"
stop_process_by_pid_file "backend" "app.main:create_app"
stop_process_by_pid_file "radsight" "radsight_service.py"

# 2. Sweep listening ports for residual preview instances (e.g. if PID file was deleted/lost)
stop_process_on_port "frontend" "$FRONTEND_PORT" "vite"
stop_process_on_port "backend" "$BACKEND_PORT" "uvicorn"
stop_process_on_port "radsight" "$RADSIGHT_PORT" "radsight_service"

# 3. Stop PostgreSQL cluster
CLUSTER_ROOT="$PREVIEW_ROOT/postgres"
POSTGRES_BIN_FILE="$PREVIEW_ROOT/postgres-bin"
POSTGRES_BIN=""
if [[ -f "$POSTGRES_BIN_FILE" ]]; then
  POSTGRES_BIN="$(cat "$POSTGRES_BIN_FILE" 2>/dev/null || true)"
fi
if [[ -z "$POSTGRES_BIN" || ! -x "$POSTGRES_BIN/pg_ctl" ]]; then
  if command -v pg_ctl >/dev/null 2>&1; then
    POSTGRES_BIN="$(dirname "$(command -v pg_ctl)")"
  else
    for candidate in \
      "/opt/homebrew/opt/postgresql@16/bin" \
      "/opt/homebrew/opt/postgresql@15/bin" \
      "/opt/homebrew/opt/postgresql/bin" \
      /opt/homebrew/Cellar/postgresql@16/*/bin \
      /opt/homebrew/Cellar/postgresql/*/bin \
      "/usr/local/opt/postgresql@16/bin" \
      "/usr/local/opt/postgresql/bin"; do
      if [[ -x "$candidate/pg_ctl" ]]; then
        POSTGRES_BIN="$candidate"
        break
      fi
    done
    if [[ -z "$POSTGRES_BIN" ]] && command -v brew >/dev/null 2>&1; then
      for pkg in postgresql@16 postgresql@15 postgresql@14 postgresql; do
        prefix="$(brew --prefix "$pkg" 2>/dev/null || true)"
        if [[ -n "$prefix" && -x "$prefix/bin/pg_ctl" ]]; then
          POSTGRES_BIN="$prefix/bin"
          break
        fi
      done
    fi
  fi
fi

if [[ -f "$CLUSTER_ROOT/postmaster.pid" ]] || ( [[ -n "$POSTGRES_BIN" && -x "$POSTGRES_BIN/pg_ctl" ]] && "$POSTGRES_BIN/pg_ctl" -D "$CLUSTER_ROOT" status >/dev/null 2>&1 ); then
  if [[ -n "$POSTGRES_BIN" && -x "$POSTGRES_BIN/pg_ctl" ]]; then
    echo "Stopping PostgreSQL cluster at $CLUSTER_ROOT..."
    "$POSTGRES_BIN/pg_ctl" -D "$CLUSTER_ROOT" -m fast -w stop || true
  else
    PG_PID="$(head -n 1 "$CLUSTER_ROOT/postmaster.pid" 2>/dev/null || true)"
    if [[ -n "$PG_PID" ]] && kill -0 "$PG_PID" 2>/dev/null; then
      echo "Stopping PostgreSQL postmaster (PID $PG_PID)..."
      kill -TERM "$PG_PID" 2>/dev/null || true
    fi
  fi
fi

# If postmaster is dead but postmaster.pid was left behind, clean it up
if [[ -f "$CLUSTER_ROOT/postmaster.pid" ]]; then
  PG_PID="$(head -n 1 "$CLUSTER_ROOT/postmaster.pid" 2>/dev/null || true)"
  if [[ -z "$PG_PID" ]] || ! kill -0 "$PG_PID" 2>/dev/null; then
    rm -f "$CLUSTER_ROOT/postmaster.pid"
  fi
fi

# Clean up port 15432 if an orphan postgres from this cluster remains
stop_process_on_port "postgres" "$DATABASE_PORT" "postgres"

rm -f "$PREVIEW_ROOT/frontend.pid" "$PREVIEW_ROOT/backend.pid"

echo "Preview stopped; database and uploaded files have been retained."
