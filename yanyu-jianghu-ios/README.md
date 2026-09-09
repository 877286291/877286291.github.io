# 烟雨江湖 iOS 跑图脚本（WebDriverAgent）

通过 **WDA + Python** 控制 iPhone 跑图，支持 **frp 外网远程**（家里 Mac 转发 WDA，外网跑脚本）。

```
外网任意电脑                    家里 Mac + iPhone (USB)
python main.py run      HTTP    tidevice wdaproxy → frpc → VPS:8100
--wda-url http://VPS:8100              iPhone 上运行《烟雨江湖》+ WDA
```

## 适用场景

| 场景 | 方案 |
|------|------|
| 本地 Mac 连 iPhone | `--wda-url http://127.0.0.1:8100` |
| **Mac 在家、人在外** | 家里跑 `scripts/home_wda_proxy.sh`，外网 `--wda-url http://VPS:8100` |
| 无 VPS | Tailscale + 家里 Mac Tailscale IP:8100 |

> **WDA 控制 iPhone 真机**，不是 Mac 屏幕上的 iOS 版 App。游戏请开在 **iPhone** 上（iOS 主号）。

## 快速开始

### 1. iPhone 安装 WDA

**Mac + Xcode**（推荐）：

1. 克隆 [WebDriverAgent](https://github.com/appium/WebDriverAgent)，Xcode 签名 Run `WebDriverAgentRunner`
2. iPhone 信任开发者，开启**开发者模式**（iOS 16+）

**或 tidevice**：

```bash
pip install tidevice
tidevice xctest -B com.facebook.WebDriverAgentRunner.xctrunner
```

### 2. 安装 Python 依赖

```bash
cd yanyu-jianghu-ios
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### 3. 本地运行

```bash
# 终端 1：WDA 代理（iPhone USB 连接 Mac）
tidevice wdaproxy --port 8100

# 终端 2：iPhone 打开游戏地图界面
python main.py test
python main.py run
```

---

## 外网 frp 远程（Mac 在家）

完整文档：**[docs/remote-frp-wda.md](docs/remote-frp-wda.md)**

### 家里 Mac（iPhone USB 连接）

```bash
cp scripts/frpc.toml.example ~/frpc.toml   # 改成你的 VPS IP
./scripts/home_wda_proxy.sh              # WDA + frpc 一起启动
```

### 外网任意电脑

```bash
python main.py --wda-url http://你的VPS_IP:8100 test
python main.py --wda-url http://你的VPS_IP:8100 run
```

**优势**：外网脚本只连 WDA HTTP 接口，**不需要 SSH 进 Mac**，Mac 也**不需要图形界面**。

---

## 命令

```bash
python main.py test                          # 测试 OCR
python main.py go 12 34                      # 前往坐标
python main.py run                           # 资源跑图（跳过大雪山）
python main.py run --include-daxueshan       # 含大雪山
python main.py --wda-url http://IP:8100 run  # 指定 WDA 地址
export WDA_URL=http://IP:8100                # 或用环境变量
```

## 配置

`config.py`：`OCR_REGIONS`、`STEP_X/Y`、`DELAY`、`WDA_URL`

## 项目结构

```
yanyu-jianghu-ios/
├── main.py
├── wda_client.py          # WDA 截图/点击
├── status.py / walk.py / navigator.py
├── docs/
│   └── remote-frp-wda.md  # frp 外网远程详解
└── scripts/
    ├── home_wda_proxy.sh  # 家里 Mac 一键启动
    └── frpc.toml.example
```

## 常见问题

**Q: 和 pyautogui Mac 版区别？**

| | WDA（本目录） | pyautogui（yanyu-jianghu-macos） |
|---|--------------|----------------------------------|
| 控制对象 | iPhone | Mac 屏幕 |
| 外网 frp | ✅ 转发 8100 | ❌ 需 GUI |
| iOS 主号 | ✅ iPhone | Mac iOS 版 |

**Q: WDA 7 天过期？** 免费 Apple ID 每 7 天 Xcode 重签一次。

**Q: 会被封号吗？** 存在风险，自行承担。

## 免责声明

仅供学习 iOS 自动化开发交流。
