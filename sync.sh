#!/usr/bin/env bash
# 从本机各 agent 技能目录同步到本仓库
# 用法: ./sync.sh [目标目录]   默认 ~/Documents/agent-skills
set -euo pipefail

DEST="${1:-$HOME/Documents/agent-skills}"
H="$HOME"

EXCLUDES=(--exclude node_modules --exclude .git --exclude __pycache__ --exclude .venv \
  --exclude venv --exclude dist --exclude build --exclude .next --exclude .cache \
  --exclude .pytest_cache --exclude target --exclude .DS_Store --exclude '*.pyc' --exclude '*.pyo')

sync_group() {   # $1=子目录名  $2=源目录
  local out="$DEST/$1" src="$2"
  [ -d "$src" ] || { echo "跳过（不存在）: $src"; return; }
  mkdir -p "$out"
  for d in "$src"/*/; do
    local name; name="$(basename "$d")"
    case "$name" in .*) continue;; esac
    # -L：把符号链接解析成真实内容（~/.workbuddy/skills 有 15 个指向 ~/.agents/skills 的链接）
    rsync -aL --delete "${EXCLUDES[@]}" "$d" "$out/$name/"
  done
  echo "$1: $(find "$out" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ') 个技能"
}

sync_group workbuddy    "$H/.workbuddy/skills"
sync_group codex        "$H/.codex/skills"
sync_group codex-system "$H/.codex/skills/.system"

echo "完成。清单可参考 MANIFEST.json（需手动重跑生成脚本更新）"
