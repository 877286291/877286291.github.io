#!/bin/bash
# Mac 本地 WDA 环境准备（不替代 Xcode 签名步骤）
set -euo pipefail

echo "=== 烟雨江湖 WDA 本地环境准备 ==="

# Xcode CLI
if ! xcode-select -p &>/dev/null; then
    echo "请先安装 Xcode 命令行工具…"
    xcode-select --install
    exit 1
fi
echo "✓ Xcode CLI"

# tidevice + wda
pip3 install -U tidevice facebook-wda
echo "✓ tidevice / facebook-wda"

# 克隆 WDA
WDA_DIR="${WDA_DIR:-$HOME/WebDriverAgent}"
if [[ ! -d "$WDA_DIR/.git" ]]; then
    git clone https://github.com/appium/WebDriverAgent.git "$WDA_DIR"
    echo "✓ 已克隆 WebDriverAgent -> $WDA_DIR"
else
    echo "✓ WebDriverAgent 已存在: $WDA_DIR"
fi

echo ""
echo "=========================================="
echo "  接下来请手动完成（只需一次）:"
echo ""
echo "  1. open $WDA_DIR/WebDriverAgent.xcodeproj"
echo "  2. WebDriverAgentRunner → Signing 选 Apple ID"
echo "  3. 选 iPhone → Run ▶"
echo "  4. iPhone 信任证书 + 开启开发者模式"
echo ""
echo "  完成后运行:"
echo "  tidevice wdaproxy --port 8100"
echo "  ./scripts/check_wda.sh"
echo "=========================================="

open "$WDA_DIR/WebDriverAgent.xcodeproj" 2>/dev/null || true
