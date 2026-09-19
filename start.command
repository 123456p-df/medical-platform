#!/bin/zsh

set -e

PROJECT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "请先安装 Node.js 20 或更高版本： https://nodejs.org/"
  read -r "?按回车键退出..."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "请先安装 pnpm：npm install --global pnpm"
  read -r "?按回车键退出..."
  exit 1
fi

if [[ ! -f node_modules/vite/bin/vite.js ]]; then
  pnpm install --frozen-lockfile
fi

LOG_FILE="${TMPDIR:-/tmp}/pulmolink-vite.log"
VITE_LOCAL_PREVIEW=true node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

for _ in {1..300}; do
  if curl -fsS "http://127.0.0.1:4173/" >/dev/null 2>&1; then
    open "http://127.0.0.1:4173"
    echo "网页已启动：http://127.0.0.1:4173"
    echo "关闭此窗口即可停止开发服务器。"
    wait "$SERVER_PID"
    exit $?
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "网页启动失败，请查看 $LOG_FILE"
    wait "$SERVER_PID"
    exit $?
  fi
  sleep 0.2
done

echo "网页启动超时，请查看 $LOG_FILE"
cleanup
wait "$SERVER_PID" 2>/dev/null || true
exit 1
