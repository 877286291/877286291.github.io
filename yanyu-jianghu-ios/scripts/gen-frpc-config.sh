#!/bin/bash
# 根据 VPS IP 生成 frpc 配置
# 用法: SERVER_IP=47.95.214.75 FRP_TOKEN=你的密码 ./scripts/gen-frpc-config.sh

set -euo pipefail

SERVER_IP="${SERVER_IP:?请设置 SERVER_IP，例如: SERVER_IP=47.95.214.75}"
FRP_TOKEN="${FRP_TOKEN:?请设置 FRP_TOKEN 强密码}"
REMOTE_PORT="${REMOTE_PORT:-8100}"
OUT="${OUT:-$HOME/frpc.toml}"

cat > "$OUT" <<EOF
# 烟雨江湖 WDA 转发 — 家里 Mac 使用
serverAddr = "$SERVER_IP"
serverPort = 7000
auth.token = "$FRP_TOKEN"

[[proxies]]
name = "wda"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8100
remotePort = $REMOTE_PORT
EOF

echo "已写入: $OUT"
echo "外网 WDA 地址: http://$SERVER_IP:$REMOTE_PORT"
