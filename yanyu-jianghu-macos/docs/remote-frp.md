# 通过 frp 远程控制家里 Mac 跑图

Mac 在家、人在外时，可以用 **frp** 把家里的 SSH 映射到公网 VPS，再 SSH 回去触发跑图脚本。

```
你（外网）                    VPS（公网 IP）              家里 Mac
   │                              │                         │
   │  ssh -p 6000 user@vps         │                         │
   ├─────────────────────────────►│◄──── frpc 长连接 ────────┤
   │                              │      转发 :22 → :6000     │
   │                              │                         游戏+脚本
```

## 前提

| 项目 | 要求 |
|------|------|
| 公网 VPS | 有固定 IP，安装 **frps**（服务端） |
| 家里 Mac | 安装 **frpc**（客户端），常开、已登录、未睡眠 |
| Mac 游戏 | 《烟雨江湖》iOS 版已打开并在地图界面 |
| 权限 | 辅助功能 + 屏幕录制已授权给 Terminal/Python |

> pyautogui 必须在 **已登录的图形界面** 下运行，纯 SSH 后台进程无法控制鼠标。本仓库的 `scripts/remote_run.sh` 会尝试在 GUI 会话中启动脚本。

---

## 一、VPS 安装 frps

```bash
# 以 Linux VPS 为例
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz
tar xf frp_*.tar.gz && cd frp_*_linux_amd64

cat > frps.toml <<'EOF'
bindPort = 7000
auth.token = "请改成强密码"

# 可选：Web 控制台
webServer.addr = "0.0.0.0"
webServer.port = 7500
webServer.user = "admin"
webServer.password = "请改成强密码"
EOF

./frps -c frps.toml
# 生产环境建议 systemd 托管
```

防火墙放行：`7000`（frp 控制）、`6000`（SSH 转发端口，自定义）。

---

## 二、家里 Mac 安装 frpc

```bash
# Apple Silicon
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_darwin_arm64.tar.gz
tar xf frp_*.tar.gz && cd frp_*_darwin_arm64
sudo cp frpc /usr/local/bin/
```

### Mac 开启远程登录

**系统设置 → 通用 → 共享 → 远程登录** → 开启

### frpc 配置

```toml
# ~/frpc.toml
serverAddr = "你的VPS公网IP"
serverPort = 7000
auth.token = "与 frps 相同的 token"

[[proxies]]
name = "mac-ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000

# 可选：VNC 屏幕共享（外网远程查看游戏画面）
[[proxies]]
name = "mac-vnc"
type = "tcp"
localIP = "127.0.0.1"
localPort = 5900
remotePort = 5901
```

> VNC 需先在 Mac 开启 **屏幕共享**（系统设置 → 共享 → 屏幕共享）。`5900` 为默认 VNC 端口。

### 启动 frpc（常驻）

```bash
frpc -c ~/frpc.toml
```

建议用 **launchd** 或 `brew services` 开机自启（见文末）。

---

## 三、外网 SSH 连回家 Mac

```bash
# 在你当前所在网络（公司/手机热点等）
ssh -p 6000 你的Mac用户名@你的VPS公网IP
```

首次建议在内网测试 frp 是否正常，再在外网验证。

---

## 四、远程触发跑图

SSH 登录 Mac 后：

```bash
cd ~/path/to/yanyu-jianghu-macos
chmod +x scripts/remote_run.sh

# 测试 OCR
./scripts/remote_run.sh test

# 开始跑图（caffeinate 防止睡眠）
./scripts/remote_run.sh run
```

`remote_run.sh` 会通过 `launchctl asuser` 在 **控制台用户的 GUI 会话** 里执行 Python，否则 pyautogui 无法控制鼠标。

### 远程一键命令（不交互 SSH）

```bash
ssh -p 6000 macuser@VPS_IP 'cd ~/yanyu-jianghu-macos && ./scripts/remote_run.sh run'
```

---

## 五、防止 Mac 睡眠

外出挂机时建议：

```bash
# 方式 1：脚本内已带 caffeinate -dims
./scripts/remote_run.sh run

# 方式 2：系统设置 → 锁定屏幕 / 显示器 → 永不（插电时）

# 方式 3：单独保持唤醒
caffeinate -dims &
```

---

## 六、可选：VNC 远程查看

```bash
# Mac 上开启屏幕共享后，外网连接：
open vnc://VPS_IP:5901
# 或用 RealVNC / TigerVNC 连接 VPS_IP:5901
```

适合远程确认游戏是否卡死、OCR 是否正常。

---

## 七、安全建议

1. **frp token** 使用长随机字符串，不要泄露
2. SSH 使用 **密钥登录**，关闭密码登录
3. `remotePort` 不要用 22/6000 等常见端口，可改为如 `52222`
4. VPS 防火墙限制 SSH 转发端口仅允许你的 IP（若 IP 固定）
5. 不建议把 HTTP 控制面板无鉴权暴露到公网
6. 游戏自动化有封号风险，自行承担

---

## 八、frpc 开机自启（launchd）

```xml
<!-- ~/Library/LaunchAgents/com.frpc.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.frpc</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/frpc</string>
    <string>-c</string>
    <string>/Users/你的用户名/frpc.toml</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.frpc.plist
```

---

## 更简单的替代：Tailscale

若不想维护 frp + VPS，可用 [Tailscale](https://tailscale.com/) 组虚拟局域网：

1. Mac 和外出设备都装 Tailscale
2. 外网直接 `ssh 你的Mac名`（Tailscale 内网 IP）
3. 同样执行 `./scripts/remote_run.sh run`

无需公网 IP、无需 frp，配置更简单，安全性更好（WireGuard 加密）。

---

## 常见问题

**Q: SSH 上去运行 `python main.py run` 没反应？**

SSH 默认不在 GUI 会话，pyautogui 无法点击。请用 `./scripts/remote_run.sh`。

**Q: frpc 连不上？**

检查 VPS 防火墙、token 是否一致、Mac 是否联网。

**Q: 游戏窗口被挡住怎么办？**

远程 VNC 查看，或跑图前让游戏窗口最大化并保持最前。

**Q: Mac 合盖可以吗？**

合盖通常睡眠，脚本会停。需接显示器+电源「 clamshell 模式」，或 `caffeinate` + 系统防睡眠设置。
