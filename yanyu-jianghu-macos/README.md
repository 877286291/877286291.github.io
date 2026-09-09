# 烟雨江湖 — M 芯片 Mac 跑图脚本

**最适合你的方案**：M1/M2/M3 Mac 直接运行 **iOS 版**《烟雨江湖》，脚本在本机用 Python 控制鼠标，**登录 iOS 主号**，无需 iPhone、无需 WDA、无需安卓。

```
M 芯片 Mac
├── 《烟雨江湖》iOS 版（App Store / PlayCover）
└── Python 脚本（截图 + OCR + 鼠标点击）
```

## 为什么选 Mac 而不是其他方案？

| 方案 | iOS 主号 | 难度 |
|------|---------|------|
| **Mac iOS 版 + 本脚本** | ✅ | ⭐⭐ |
| iPhone + WDA | ✅ | ⭐⭐⭐⭐ |
| 安卓模拟器 / 云手机 | ❌ 安卓服 | ⭐⭐ |
| Auto.js（Android） | ❌ | ⭐⭐ |

## 安装游戏（二选一）

### 方式 A：Mac App Store（推荐）

App Store 搜索「烟雨江湖」，页面注明支持 **M1 或更高芯片 Mac**。直接安装，用 Apple ID 登录，**与 iPhone 同 iOS 服**（需同一 Apple ID / 游戏账号）。

### 方式 B：PlayCover

若 App Store 版不可用，可用 [PlayCover](https://playcover.com.cn/) 侧载 iOS IPA，同样走 iOS 客户端。

## 脚本安装

```bash
cd yanyu-jianghu-macos
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Mac 权限设置

**系统设置 → 隐私与安全性 → 辅助功能** → 开启你用的终端（Terminal / iTerm / Cursor）

**系统设置 → 隐私与安全性 → 屏幕录制** → 同上（macOS 10.15+ 截图可能需要）

## 使用

1. 打开《烟雨江湖》，进入地图，**窗口尽量最大化**
2. 游戏设为**横屏**，视角为**中视角**
3. 运行：

```bash
# 测试 OCR（先确认能读到右上角城市/坐标）
python main.py test

# 前往指定坐标
python main.py go 12 34

# 完整资源跑图（默认跳过大雪山）
python main.py run
```

启动后有 **3 秒倒计时**，请立即用鼠标点击游戏窗口使其获得焦点。

**紧急停止**：把鼠标快速移到屏幕**左上角**（pyautogui FAILSAFE）。

## 跑图路线

34 个采集点环形路线，详见 `map_data.py`：

明月峰 → 双王镇 → … → 太乙山

## 常见问题

**Q: 和 iPhone 上的是同一个号吗？**

是。Mac 上运行的是 **iOS 客户端**，区服与 iPhone 一致（同一游戏账号登录即可，与安卓不互通）。

**Q: OCR 识别失败？**

- 确认游戏窗口在前台且右上角城市/坐标未被遮挡
- Mac 窗口若比 1920×1080 小，脚本会按比例缩放 OCR 区域
- 运行 `python main.py test` 调试

**Q: 点击位置不对？**

- 调整 `config.py` 中 `STEP_X` / `STEP_Y`
- 确认游戏中视角为「中视角」

**Q: PlayCover 键位映射会冲突吗？**

跑图脚本用**鼠标点击**地图，与 WASD 键位映射不冲突。建议跑图时勿移动鼠标。

## 项目结构

```
yanyu-jianghu-macos/
├── main.py
├── mac_client.py    # 截图 + 鼠标
├── status.py        # OCR
├── walk.py
├── navigator.py
├── map_data.py
├── config.py
└── requirements.txt
```

## 免责声明

仅供学习 macOS 自动化开发。使用脚本可能违反游戏用户协议，存在封号风险。
