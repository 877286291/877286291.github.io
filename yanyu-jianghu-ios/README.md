# 烟雨江湖 iOS 跑图脚本

> **M 芯片 Mac 用户请优先使用 [`yanyu-jianghu-macos/`](../yanyu-jianghu-macos/)** — 直接在 Mac 上跑 iOS 版游戏，无需连接 iPhone，更简单。  
> 下文适用于 **iPhone + 电脑 WDA** 方案。

**专为 iPhone / iPad 设计**：游戏和账号始终在 **iOS 端**，不需要安卓、不跨服。

通过 **WebDriverAgent (WDA)** + Python，在 Mac / Windows 电脑上控制 iPhone 完成资源跑图。

```
┌─────────────┐   USB/WiFi    ┌──────────────┐
│ Mac / Win   │ ────────────► │   iPhone     │
│ Python 脚本 │   WDA 8100    │ 烟雨江湖 iOS │
└─────────────┘               └──────────────┘
```

## 与 Android 版对比

| | Android (Auto.js) | **iOS (本脚本)** |
|---|-------------------|------------------|
| 游戏平台 | 安卓客户端 | **iOS 客户端** |
| 账号/区服 | 安卓服 | **iOS 服（你的主号）** |
| 脚本运行位置 | 手机内 | **电脑控制手机** |
| 依赖 | Auto.js + 无障碍 | **WDA + Python** |

## 环境要求

| 项目 | 要求 |
|------|------|
| 设备 | iPhone / iPad（iOS 15+，iOS 16+ 需开启开发者模式） |
| 电脑 | Mac（推荐）或 Windows |
| 数据线 | USB 连接，或同一 WiFi |
| 分辨率 | 建议 iPhone 横屏或 iPad 1920×1080 比例 |
| Apple ID | 免费开发者账号即可签名 WDA（7 天续签） |

## 一、安装 WDA（WebDriverAgent）

WDA 是苹果官方 XCTest 框架的 UI 自动化工具，可在 iPhone 上接收点击/截图指令。

### 方式 A：Mac + Xcode（最稳定）

1. 安装 [Xcode](https://developer.apple.com/xcode/) 和 Command Line Tools
2. 克隆 WDA 项目：
   ```bash
   git clone https://github.com/appium/WebDriverAgent.git
   cd WebDriverAgent
   open WebDriverAgent.xcodeproj
   ```
3. Xcode 中选中 `WebDriverAgentRunner` target → Signing & Capabilities → 选你的 Team
4. iPhone 连接 Mac，选择你的设备，Run `WebDriverAgentRunner`
5. iPhone：**设置 → 通用 → VPN与设备管理** → 信任开发者
6. iOS 16+：**设置 → 隐私与安全性 → 开发者模式** → 开启

WDA 启动后默认监听 `8100` 端口。

### 方式 B：tidevice（Mac / Windows，无需 Xcode 编译）

```bash
pip install tidevice
# 安装 WDA 到手机（首次）
tidevice xctest -B com.facebook.WebDriverAgentRunner.xctrunner
# 或转发端口
tidevice wdaproxy -B com.facebook.WebDriverAgentRunner.xctrunner --port 8100
```

> 若未安装 WDA，需先用 Xcode 或 [预编译 WDA ipa](https://github.com/appium/WebDriverAgent/releases) 装到手机。

## 二、安装 Python 脚本

```bash
cd yanyu-jianghu-ios
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

首次运行 PaddleOCR 会下载模型（约 100MB），请保持网络畅通。

## 三、运行

### 1. 启动 WDA 端口转发

**Mac（Xcode 已 Run WDA 时）**：
```bash
iproxy 8100 8100
```

**或使用 tidevice**：
```bash
tidevice wdaproxy --port 8100
```

### 2. iPhone 打开《烟雨江湖》

进入游戏地图界面，保持屏幕常亮。

### 3. 执行脚本

```bash
# 测试 OCR 能否识别当前位置
python main.py test

# 手动前往坐标
python main.py go 12 34

# 完整资源跑图（默认跳过大雪山）
python main.py run

# 包含大雪山
python main.py run --include-daxueshan
```

## 跑图路线

与 Android 版相同，16 城市 34 采集点环形路线：

```
明月峰 → 双王镇 → 衡山 → 南岭 → 龙泉镇 → 杭州 → 泉州 → 姑苏
→ 泰安镇 → 洛阳 → 落霞镇 → 华山 → 敦煌 → 大雪山 → 南阳渡 → 太乙山
```

坐标见 `map_data.py`。

## 配置

编辑 `config.py`：

- `WDA_URL`：WDA 地址，默认 `http://127.0.0.1:8100`
- `OCR_REGIONS`：右上角城市/坐标 OCR 区域（UI 更新后需重标）
- `STEP_X` / `STEP_Y`：等距地图步长（视角变化时调整）
- `DELAY`：操作间隔

## 常见问题

**Q: 和 ADB 有关系吗？**

没有。ADB 是 Android 专用。iOS 用 **WDA + tidevice/iproxy**，是完全不同的协议。

**Q: 必须一直连着电脑吗？**

是。脚本在电脑上跑，通过 USB/WiFi 控制 iPhone。若需脱离电脑，只能考虑越狱方案或 iOS 第三方辅助 App。

**Q: OCR 识别不准？**

- 确认游戏为横屏，分辨率尽量接近 1920×1080
- 调整 `config.py` 中 `OCR_REGIONS.position` 覆盖右上角城市名和坐标
- 可先用 `python main.py test` 调试

**Q: WDA 7 天过期？**

免费 Apple ID 签名的 WDA 每 7 天需重新 Run 一次。付费开发者账号（$99/年）可延长。

**Q: 会被封号吗？**

使用自动化可能违反游戏用户协议，存在封号风险，请自行承担。

## 项目结构

```
yanyu-jianghu-ios/
├── main.py           # 入口（test / go / run）
├── config.py         # 屏幕/OCR/WDA 配置
├── map_data.py       # 路线与资源坐标
├── wda_client.py     # WDA 截图与点击
├── status.py         # OCR 位置识别
├── walk.py           # 地图行走
├── navigator.py      # 跨地图导航
├── requirements.txt
└── README.md
```

## 参考

- [WebDriverAgent](https://github.com/appium/WebDriverAgent)
- [tidevice](https://github.com/alibaba/taobao-iphone-device)
- [facebook-wda Python 库](https://github.com/openatx/facebook-wda)

## 免责声明

本脚本仅供学习 iOS UI 自动化开发交流。使用自动化工具可能违反《烟雨江湖》用户协议，作者不对任何后果负责。
