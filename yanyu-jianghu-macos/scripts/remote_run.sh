#!/bin/bash
# 在 Mac 图形界面会话中启动跑图（供 SSH 远程调用）
# 用法: ./scripts/remote_run.sh [test|run|go X Y]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CMD="${1:-run}"
GUI_USER="${GUI_USER:-$(stat -f%Su /dev/console 2>/dev/null || echo "$USER")}"
GUI_UID="$(id -u "$GUI_USER" 2>/dev/null || id -u)"

run_in_gui() {
    local inner="$1"
    launchctl asuser "$GUI_UID" sudo -u "$GUI_USER" /bin/bash -lc "$inner"
}

case "$CMD" in
    test)
        INNER="cd '$SCRIPT_DIR' && source venv/bin/activate && python main.py test"
        ;;
    run)
        INNER="cd '$SCRIPT_DIR' && source venv/bin/activate && caffeinate -dims python main.py run"
        ;;
    go)
        INNER="cd '$SCRIPT_DIR' && source venv/bin/activate && python main.py go ${2:?} ${3:?}"
        ;;
    *)
        echo "用法: $0 [test|run|go X Y]"
        exit 1
        ;;
esac

# 优先在控制台用户的 GUI 会话执行（pyautogui 需要）
if launchctl print "gui/$GUI_UID" &>/dev/null; then
    echo "在 GUI 会话 ($GUI_USER) 中启动: $CMD"
    run_in_gui "$INNER"
else
    echo "警告: 未检测到 GUI 会话，尝试 osascript 打开 Terminal…"
    osascript <<EOF
tell application "Terminal"
    activate
    do script "$INNER"
end tell
EOF
fi
