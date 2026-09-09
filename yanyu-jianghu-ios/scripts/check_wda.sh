#!/bin/bash
# 检测本机 WDA 是否就绪
# 用法: ./scripts/check_wda.sh [WDA_URL]

set -euo pipefail

WDA_URL="${1:-http://127.0.0.1:8100}"
HOST="${WDA_URL#http://}"
HOST="${HOST#https://}"
PORT="${HOST##*:}"
PORT="${PORT%%/*}"
HOST="${HOST%%:*}"

echo "========== 烟雨江湖 WDA 检测 =========="
echo ""

echo "[1/4] 检查 tidevice…"
if command -v tidevice &>/dev/null; then
    echo "  ✓ tidevice $(tidevice version 2>/dev/null || echo '已安装')"
else
    echo "  ✗ 未安装 tidevice"
    echo "    修复: pip3 install tidevice"
    exit 1
fi

echo ""
echo "[2/4] 检查 iPhone 连接…"
DEVICES=$(tidevice list 2>/dev/null | tail -n +2 || true)
if echo "$DEVICES" | grep -qE "iPhone|iPad"; then
    echo "  ✓ 已连接设备:"
    echo "$DEVICES" | sed 's/^/    /'
else
    echo "  ✗ 未检测到 iPhone/iPad"
    echo "    修复: USB 连接、解锁、信任此 Mac"
    exit 1
fi

echo ""
echo "[3/4] 检查 WDA 服务 $WDA_URL …"
if curl -sf --connect-timeout 5 "$WDA_URL/status" >/tmp/wda_status.json 2>/dev/null; then
    echo "  ✓ WDA 响应正常"
    python3 -c "
import json
d=json.load(open('/tmp/wda_status.json'))
print('    state:', d.get('value',{}).get('state','?'))
" 2>/dev/null || head -c 120 /tmp/wda_status.json | sed 's/^/    /'
else
    echo "  ✗ 无法连接 WDA"
    echo "    修复: 另开终端运行"
    echo "    tidevice wdaproxy -B com.facebook.WebDriverAgentRunner.xctrunner --port ${PORT:-8100}"
    echo "    或 Xcode Run WebDriverAgentRunner"
    exit 1
fi

echo ""
echo "[4/4] 检查 facebook-wda…"
if python3 -c "import wda" 2>/dev/null; then
    echo "  ✓ facebook-wda 可用"
    python3 <<PY
import wda
c = wda.Client("$WDA_URL")
s = c.session()
sz = s.window_size()
print(f"    屏幕: {int(sz.width)}x{int(sz.height)}")
PY
else
    echo "  ✗ 未安装 facebook-wda"
    echo "    修复: pip3 install facebook-wda"
    exit 1
fi

echo ""
echo "=========================================="
echo "  WDA 配置正常，可以运行:"
echo "  python main.py test"
echo "=========================================="
