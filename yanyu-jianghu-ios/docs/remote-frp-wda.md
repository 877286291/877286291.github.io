# 家里 Mac 用 frp 暴露 WDA，外网远程跑图

**推荐架构**：游戏跑在 **iPhone** 上，家里 Mac 只负责 WDA 代理 + frp，**Python 脚本在外网任意电脑运行**。

```
外网笔记本                     VPS (frps)                  家里 Mac + iPhone
┌──────────────┐            ┌─────────────┐            ┌─────────────────────┐
│ python       │  HTTP      │  :8100      │  frp隧道   │ tidevice wdaproxy   │
│ main.py run  ├───────────►│  转发       │◄───────────┤      ↓ USB         │
│ --wda-url    │            └─────────────┘            │ iPhone 烟雨江湖+WDA  │
│ http://VPS:8100│                                     └─────────────────────┘
```

**为什么用 WDA 而不是 pyautogui？**

| | pyautogui (Mac 屏幕) | **WDA (iPhone)** |
|---|---------------------|------------------|
| 远程 SSH 触发 | ❌ 需 GUI 会话 | ✅ HTTP API，无需 Mac 桌面 |
| iOS 主号 | Mac iOS 版 | **iPhone iOS 服** |
| 外网 frp | 复杂 | **转发 8100 即可** |

> WDA 控制的是 **iPhone 真机**（USB 连家里 Mac），不是 Mac 上直接运行的 iOS 版 App。请把游戏开在 iPhone 上。

---

## 一、家里 Mac 准备（一次性）

### 1. iPhone 安装并信任 WDA

见 [README.md](../README.md)「安装 WDA」章节（Xcode 或 tidevice）。

### 2. 安装工具

```bash
pip install tidevice facebook-wda
brew install frp   # 或从 GitHub releases 下载 frpc
```

### 3. iPhone 设置

- 开启**开发者模式**（iOS 16+）
- 信任 Mac
- 《烟雨江湖》横屏、中视角，保持屏幕常亮

---

## 二、VPS 配置 frps

```toml
# /etc/frp/frps.toml
bindPort = 7000
auth.token = "改成强随机密码"
```

```bash
frps -c frps.toml
```

防火墙放行：`7000`（frp 控制）、`8100`（WDA 转发，可改）。

---

## 三、家里 Mac 配置 frpc

```toml
# ~/frpc.toml
serverAddr = "你的VPS公网IP"
serverPort = 7000
auth.token = "与 frps 相同"

[[proxies]]
name = "wda"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8100
remotePort = 8100
```

---

## 四、家里 Mac 启动常驻服务

iPhone USB 连接 Mac 后：

```bash
cd yanyu-jianghu-ios
chmod +x scripts/home_wda_proxy.sh
./scripts/home_wda_proxy.sh
```

该脚本会：
1. 启动 `tidevice wdaproxy`（WDA → 本机 8100）
2. 启动 `frpc`（8100 → VPS:8100）

### launchd 开机自启（可选）

```bash
cp scripts/com.yanyu.wda-proxy.plist ~/Library/LaunchAgents/
# 编辑 plist 中的路径
launchctl load ~/Library/LaunchAgents/com.yanyu.wda-proxy.plist
```

---

## 五、外网运行跑图脚本

在**任意电脑**（公司笔记本、云服务器等）：

```bash
git clone <repo>
cd yanyu-jianghu-ios
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# WDA 地址指向 VPS 转发的端口
export WDA_URL=http://你的VPS公网IP:8100

python main.py test
python main.py run
```

或命令行参数：

```bash
python main.py --wda-url http://VPS_IP:8100 run
```

脚本通过 HTTP 调用 WDA，**不需要 SSH 进家里 Mac**，也不需要 Mac 图形界面。

---

## 六、验证连通性

外网执行：

```bash
curl -s http://VPS_IP:8100/status | head
# 或
python -c "import wda; print(wda.Client('http://VPS_IP:8100').status())"
```

返回 JSON 即表示 WDA 隧道正常。

---

## 七、安全建议

1. **frp token** 用长随机串
2. WDA 端口 `8100` 在 VPS 防火墙**仅允许你的 IP**（若 IP 固定）
3. 或使用 frp **stcp**（secret tcp）模式，不公开暴露 8100：

```toml
# frpc.toml — 访客模式，需 secretKey
[[proxies]]
name = "wda-secret"
type = "stcp"
secretKey = "随机密钥"
localIP = "127.0.0.1"
localPort = 8100
```

```toml
# 外网机器 frpc 访客
[[visitors]]
name = "wda-visitor"
type = "stcp"
serverName = "wda-secret"
secretKey = "相同密钥"
bindAddr = "127.0.0.1"
bindPort = 8100
```

外网脚本仍用 `--wda-url http://127.0.0.1:8100`（更安全）。

4. 不建议把 WDA 无鉴权长期暴露公网

---

## 八、常见问题

**Q: Mac 合盖/睡眠怎么办？**

Mac 需保持唤醒以维持 USB 与 frpc。建议接电源，`sudo pmset -c sleep 0 displaysleep 0`。

**Q: iPhone 锁屏？**

跑图期间关闭自动锁定：**设置 → 显示与亮度 → 自动锁定 → 永不**（跑完改回）。

**Q: WDA 7 天过期？**

免费 Apple ID 签名每 7 天需重新 Xcode Run WDA。可设日历提醒。

**Q: 能用 WiFi 代替 USB 吗？**

可以。WDA 支持 WiFi，但家里长期挂机 USB 更稳。WiFi 需 iPhone 与 Mac 同网段，且 Xcode 开启 Connect via network。

**Q: Mac 上的 iOS 版游戏能用 WDA 吗？**

不能。WDA 面向 **iOS 设备/模拟器**，Mac 原生 iOS App 请用 iPhone 真机方案。

---

## 九、与 Tailscale 组合（更简单）

若不想暴露公网端口：

1. 家里 Mac + 外网设备都装 Tailscale
2. 家里 Mac 只跑 `tidevice wdaproxy --port 8100`
3. 外网：`python main.py --wda-url http://家里Mac的TailscaleIP:8100 run`

无需 frp、无需 VPS。
