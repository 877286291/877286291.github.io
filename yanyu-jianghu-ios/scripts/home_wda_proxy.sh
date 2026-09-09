#!/bin/bash
# 家里 Mac：启动 WDA 代理 + frpc 转发（供外网远程跑图）
# 前置：iPhone USB 连接，已安装 WDA，~/frpc.toml 已配置

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRPC_CONFIG="${FRPC_CONFIG:-$HOME/frpc.toml}"
WDA_PORT="${WDA_PORT:-8100}"
WDA_BUNDLE="${WDA_BUNDLE:-com.facebook.WebDriverAgentRunner.xctrunner}"
LOG_DIR="${LOG_DIR:-$HOME/.yanyu-wda-proxy}"

mkdir -p "$LOG_DIR"

if ! command -v tidevice &>/dev/null; then
    echo "请先安装: pip install tidevice"
    exit 1
fi

if ! command -v frpc &>/dev/null; then
    echo "请先安装 frpc: brew install frp"
    exit 1
fi

if [[ ! -f "$FRPC_CONFIG" ]]; then
    echo "缺少 frpc 配置: $FRPC_CONFIG"
    echo "参考 docs/remote-frp-wda.md 创建"
    exit 1
fi

# 检查 iPhone 是否连接
if ! tidevice list 2>/dev/null | grep -q "iPhone\|iPad"; then
    echo "未检测到 iPhone，请 USB 连接并信任此 Mac"
    exit 1
fi

cleanup() {
    echo "停止服务…"
    [[ -n "${WDA_PID:-}" ]] && kill "$WDA_PID" 2>/dev/null || true
    [[ -n "${FRPC_PID:-}" ]] && kill "$FRPC_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "启动 tidevice wdaproxy (port $WDA_PORT)…"
tidevice wdaproxy -B "$WDA_BUNDLE" --port "$WDA_PORT" \
    >> "$LOG_DIR/wdaproxy.log" 2>&1 &
WDA_PID=$!

sleep 3

if ! curl -sf "http://127.0.0.1:$WDA_PORT/status" >/dev/null; then
    echo "WDA 未就绪，查看日志: $LOG_DIR/wdaproxy.log"
    exit 1
fi
echo "WDA 就绪: http://127.0.0.1:$WDA_PORT"

echo "启动 frpc…"
frpc -c "$FRPC_CONFIG" >> "$LOG_DIR/frpc.log" 2>&1 &
FRPC_PID=$!

echo ""
echo "=========================================="
echo "  家里代理已启动"
echo "  本地 WDA:  http://127.0.0.1:$WDA_PORT"
echo "  外网用法:  python main.py --wda-url http://VPS_IP:$WDA_PORT run"
echo "  日志目录:  $LOG_DIR"
echo "  Ctrl+C 停止"
echo "=========================================="

wait
