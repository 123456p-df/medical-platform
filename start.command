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

node scripts/start.mjs > /tmp/vmrb-preview.log 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT
trap 'cleanup; exit 129' HUP
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

for _ in {1..600}; do
  if curl -fsS "http://127.0.0.1:4173/" >/dev/null 2>&1; then
    open "http://127.0.0.1:4173"
    echo "网页已启动：http://127.0.0.1:4173"
    echo "关闭此窗口会停止前端；如需停止 Docker 后端，请运行 bash scripts/stop-services.sh。"
    wait "$SERVER_PID"
    exit $?
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "网页启动失败，请查看 /tmp/vmrb-preview.log"
    wait "$SERVER_PID"
    exit $?
  fi
  sleep 1
done

echo "网页启动超时，请查看 /tmp/vmrb-preview.log"
cleanup
wait "$SERVER_PID" 2>/dev/null || true
exit 1
