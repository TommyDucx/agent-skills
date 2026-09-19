#!/usr/bin/env bash
# 按套件重新汇总本机技能 -> 本仓库
# 用法: ./sync.sh [目标目录]    默认与本脚本同目录
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-$HERE}"
command -v node >/dev/null || { echo "需要 node（脚本零第三方依赖）"; exit 1; }
node "$HERE/tools/build-suites.js" "$DEST"
echo "已更新 $DEST —— 记得 git add -A && git commit"
