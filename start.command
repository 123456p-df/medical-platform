#!/bin/zsh

set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
if [[ -x /usr/libexec/path_helper ]]; then
  eval "$(/usr/libexec/path_helper -s 2>/dev/null || true)"
fi

PROJECT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "请先安装 Node.js 20 或更高版本： https://nodejs.org/"
  read -r "?按回车键退出..."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    echo "检测到 pnpm 未安装，正在尝试通过 corepack 自动启用..."
    corepack enable pnpm >/dev/null 2>&1 || corepack enable >/dev/null 2>&1 || true
  fi
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "检测到 pnpm 未安装，正在尝试通过 npm 自动安装..."
  if command -v npm >/dev/null 2>&1; then
    npm install -g pnpm || true
  fi
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "请先安装 pnpm：corepack enable pnpm 或 npm install --global pnpm"
  read -r "?按回车键退出..."
  exit 1
fi

if [[ ! -f node_modules/vite/bin/vite.js ]]; then
  echo "安装前端依赖..."
  pnpm install --frozen-lockfile || pnpm install
fi

echo "正在启动本地原生全栈（FastAPI + PostgreSQL + Vite）..."

# 后台等待前端就绪后自动在默认浏览器中打开页面
(
  for _ in {1..120}; do
    if curl -fsS "http://127.0.0.1:4173/health" >/dev/null 2>&1; then
      sleep 0.5
      open "http://127.0.0.1:4173" 2>/dev/null || true
      break
    fi
    sleep 0.25
  done
) >/dev/null 2>&1 &

# 启动全栈（通过 exec 将控制权移交给 start.mjs，统一进程生命周期与信号处理）
exec node scripts/start.mjs
