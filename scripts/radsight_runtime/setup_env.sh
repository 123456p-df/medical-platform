#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VENV_DIR="${RADSIGHT_VENV:-$PROJECT_ROOT/.venv-radsight}"
VISION_DIR="${RADSIGHT_VISION_ENCODER_PATH:-/Users/allenyuan/modilify_app/VL3-SigLIP-NaViT}"
PYTHON_BIN="${RADSIGHT_BOOTSTRAP_PYTHON:-}"

if [[ -z "$PYTHON_BIN" ]]; then
  for candidate in python3.12 python3.11 /Users/allenyuan/.local/bin/python3.11 /opt/homebrew/bin/python3.12 /opt/homebrew/bin/python3.11; do
    if command -v "$candidate" >/dev/null 2>&1; then
      PYTHON_BIN="$(command -v "$candidate")"
      break
    elif [[ -x "$candidate" ]]; then
      PYTHON_BIN="$candidate"
      break
    fi
  done
fi

if [[ -z "$PYTHON_BIN" ]]; then
  echo "Error: Python 3.11 or 3.12 is required to create .venv-radsight." >&2
  exit 1
fi

echo "Creating RadSight venv at $VENV_DIR using $PYTHON_BIN"
"$PYTHON_BIN" -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install -r "$SCRIPT_DIR/requirements.txt"

if [[ "${RADSIGHT_DOWNLOAD_VISION:-1}" == "1" && ! -f "$VISION_DIR/config.json" ]]; then
  echo "Downloading VL3-SigLIP-NaViT to $VISION_DIR"
  mkdir -p "$VISION_DIR"
  "$VENV_DIR/bin/python" - <<PY
from huggingface_hub import snapshot_download
snapshot_download(repo_id="DAMO-NLP-SG/VL3-SigLIP-NaViT", local_dir="$VISION_DIR")
print("Vision encoder ready at $VISION_DIR")
PY
fi

echo "RadSight environment ready: $VENV_DIR/bin/python"
