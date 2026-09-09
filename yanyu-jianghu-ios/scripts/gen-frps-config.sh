#!/bin/bash
# 在 VPS (47.x.x.x) 上生成 frps 配置
# 用法: FRP_TOKEN=你的密码 ./scripts/gen-frps-config.sh

set -euo pipefail

FRP_TOKEN="${FRP_TOKEN:?请设置 FRP_TOKEN 强密码}"
WDA_REMOTE_PORT="${WDA_REMOTE_PORT:-8100}"
OUT="${OUT:-./frps.toml}"

cat > "$OUT" <<EOF
bindPort = 7000
auth.token = "$FRP_TOKEN"

# 可选管理面板（建议仅内网或改端口+强密码）
# webServer.addr = "127.0.0.1"
# webServer.port = 7500
# webServer.user = "admin"
# webServer.password = "改密码"
EOF

echo "已写入: $OUT"
echo ""
echo "VPS 防火墙需放行:"
echo "  - 7000/tcp  (frp 控制)"
echo "  - ${WDA_REMOTE_PORT}/tcp (WDA 转发，建议仅允许你的 IP)"
echo ""
echo "启动: frps -c $OUT"
