#!/bin/bash
# 在 Mac 上创建目录并拉取烟雨江湖 iOS 跑图项目
# 用法: bash install-on-mac.sh
# 或:   curl -fsSL .../install-on-mac.sh | bash

set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-$HOME/Projects/yanyu-jianghu-ios}"
REPO_URL="https://github.com/877286291/877286291.github.io.git"
BRANCH="cursor/yanyu-jianghu-map-script-ec91"
SUBDIR="yanyu-jianghu-ios"

echo "=========================================="
echo "  烟雨江湖 iOS 跑图 — 本地安装"
echo "  目标目录: $INSTALL_DIR"
echo "=========================================="

mkdir -p "$(dirname "$INSTALL_DIR")"

if [[ -d "$INSTALL_DIR/.git" ]]; then
    echo "目录已存在，拉取最新…"
    cd "$INSTALL_DIR"
    git fetch origin "$BRANCH"
    git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH" "origin/$BRANCH"
    git pull origin "$BRANCH"
elif [[ -d "$INSTALL_DIR" ]]; then
    echo "目录已存在但非 git 仓库，改为克隆到临时目录再同步…"
    TMP=$(mktemp -d)
    git clone -b "$BRANCH" --depth 1 "$REPO_URL" "$TMP/repo"
    mkdir -p "$INSTALL_DIR"
    rsync -a "$TMP/repo/$SUBDIR/" "$INSTALL_DIR/"
    rm -rf "$TMP"
else
    echo "克隆仓库…"
    TMP=$(mktemp -d)
    git clone -b "$BRANCH" --depth 1 "$REPO_URL" "$TMP/repo"
    mv "$TMP/repo/$SUBDIR" "$INSTALL_DIR"
    rm -rf "$TMP"
fi

cd "$INSTALL_DIR"
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "创建 Python 虚拟环境…"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q

echo "安装依赖（首次较慢）…"
if ! pip install -r requirements.txt; then
    echo "Paddle 安装失败，尝试 EasyOCR 方案…"
    pip install facebook-wda Pillow numpy easyocr
fi

echo ""
echo "=========================================="
echo "  安装完成"
echo "=========================================="
echo ""
echo "  项目路径: $INSTALL_DIR"
echo ""
echo "  每次使用前:"
echo "    cd $INSTALL_DIR"
echo "    source venv/bin/activate"
echo ""
echo "  终端 A — 启动 WDA（iPhone USB 连接）:"
echo "    tidevice wdaproxy -B com.facebook.WebDriverAgentRunner.xctrunner --port 8100"
echo ""
echo "  终端 B — 跑图:"
echo "    cd $INSTALL_DIR && source venv/bin/activate"
echo "    ./scripts/check_wda.sh"
echo "    python main.py test"
echo "    python main.py run"
echo ""
echo "  WDA 尚未配置? 见 docs/wda-local-setup.md"
echo "=========================================="
