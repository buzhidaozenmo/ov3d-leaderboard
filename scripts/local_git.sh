#!/usr/bin/env bash
# 在 github.com 直连不通、但 api.github.com 可用的网络里，通过本地 CONNECT 代理执行 git。
# 仅本地开发需要；GitHub Actions 不需要。
#
# 用法：bash scripts/local_git.sh pull --rebase
#       bash scripts/local_git.sh push
set -euo pipefail
PORT="${OV3D_PROXY_PORT:-8899}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! nc -z 127.0.0.1 "$PORT" >/dev/null 2>&1; then
  nohup python3 "$ROOT/scripts/github_proxy.py" >/tmp/ov3d_github_proxy.log 2>&1 &
  sleep 1
fi

git -C "$ROOT" -c "http.proxy=http://127.0.0.1:$PORT" -c http.version=HTTP/1.1 "$@"
