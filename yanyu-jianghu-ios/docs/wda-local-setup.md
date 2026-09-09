# 本地 WDA 配置指南（Mac + iPhone）

不涉及外网 frp，只在 **Mac 本机** 连 **iPhone** 跑通 WDA。

---

## 你需要准备

| 项目 | 要求 |
|------|------|
| Mac | macOS 12+，已装 **Xcode**（App Store 下载） |
| iPhone | iOS 15+（16+ 需开开发者模式） |
| 数据线 | USB 连接（首次必须） |
| Apple ID | 免费账号即可（每 7 天重签 WDA） |

---

## 一、Mac 安装基础工具

打开 **终端**，依次执行：

```bash
# 1. 确认 Xcode 命令行工具
xcode-select --install   # 若已安装会提示

# 2. Python 与 tidevice（WDA 代理）
python3 -m pip install --upgrade pip
pip3 install tidevice facebook-wda

# 3. 克隆 WebDriverAgent
cd ~
git clone https://github.com/appium/WebDriverAgent.git
cd WebDriverAgent
open WebDriverAgent.xcodeproj
```

---

## 二、Xcode 签名并安装到 iPhone

Xcode 打开后：

### 1. 登录 Apple ID

**Xcode → Settings → Accounts → + → Apple ID**

### 2. 配置签名

左侧选 **`WebDriverAgent`** 工程 → TARGETS 里分别设置：

- `WebDriverAgentLib`
- `WebDriverAgentRunner`

每个 target：**Signing & Capabilities**

- ✅ Automatically manage signing
- **Team** 选你的 Apple ID
- Bundle Identifier 若冲突，改成唯一的，例如：
  - `com.你的名字.WebDriverAgentRunner`

### 3. 选择 iPhone 并运行

1. iPhone **USB 连接** Mac，点「信任此电脑」
2. Xcode 顶部设备选你的 **iPhone**（不是 Simulator）
3. TARGET 选 **`WebDriverAgentRunner`**
4. 点 **▶ Run**（或 `Cmd + R`）

首次会在 iPhone 安装 `WebDriverAgentRunner`，可能报错需处理：

| 报错 | 处理 |
|------|------|
| untrusted developer | iPhone：设置 → 通用 → VPN与设备管理 → 信任 |
| Developer Mode required | 设置 → 隐私与安全性 → 开发者模式 → 开 → 重启 |
| signing failed | 改 Bundle ID，确认 Team 已选 |

### 4. 确认 WDA 在跑

Xcode 底部出现类似日志即成功：

```
ServerURLHere->http://169.254.x.x:8100<-ServerURLHere
```

**保持 Xcode Run 不要停**，或进入下一步用 tidevice 接管。

---

## 三、用 tidevice 启动 WDA（日常推荐）

**可以关掉 Xcode Run**，改用终端：

```bash
# 查看是否识别 iPhone
tidevice list

# 启动 WDA 代理（本机 8100 端口）
tidevice wdaproxy -B com.facebook.WebDriverAgentRunner.xctrunner --port 8100
```

另开一个终端测试：

```bash
curl http://127.0.0.1:8100/status
```

返回 JSON（含 `"state":"success"`）即 **WDA 配置成功**。

> 若 Bundle ID 改过，把 `-B` 后面换成你 Xcode 里的 ID。

---

## 四、跑图脚本联通测试

```bash
cd /path/to/yanyu-jianghu-ios
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# iPhone 打开《烟雨江湖》→ 进入地图横屏
python main.py test
python main.py go 12 34   # 可选：测试移动
```

---

## 五、一键检测脚本

Mac 上在项目目录执行：

```bash
chmod +x scripts/check_wda.sh
./scripts/check_wda.sh
```

---

## 常见问题

**Q: `tidevice list` 为空？**

- 换数据线 / USB 口
- iPhone 解锁并点信任
- 执行 `sudo killall -STOP -c usbd` 后重插（部分 Mac 偶发）

**Q: wdaproxy 报 not found bundle？**

- 先用 Xcode Run 一次 `WebDriverAgentRunner` 装到手机
- 或：`tidevice applist | grep -i webdriver`

**Q: curl status 连不上？**

- 确认 wdaproxy 终端在跑
- 端口是否被占用：`lsof -i :8100`

**Q: 7 天后失效？**

- 免费 Apple ID 签名过期，重新 Xcode Run 一次即可

**Q: 能用 WiFi 吗？**

- Xcode → Window → Devices and Simulators → 选 iPhone → ✅ Connect via network  
- 配对成功后可在同 WiFi 下 wdaproxy，无需插线

---

## 配置完成标志

```
✅ tidevice list 能看到 iPhone
✅ curl http://127.0.0.1:8100/status 返回 success
✅ python main.py test 能 OCR 出城市坐标
```

完成后如需外网，再参考 [remote-frp-wda.md](remote-frp-wda.md)。

---

## 从 Python 虚拟环境开始（WDA 已跑通后）

前提：另一个终端里 **WDA 已在运行**：

```bash
tidevice wdaproxy -B com.facebook.WebDriverAgentRunner.xctrunner --port 8100
# 验证: curl http://127.0.0.1:8100/status
```

### 1. 进入项目目录

```bash
cd ~/path/to/yanyu-jianghu-ios
# 若从 GitHub 拉取:
# git clone https://github.com/877286291/877286291.github.io.git
# cd 877286291.github.io/yanyu-jianghu-ios
```

### 2. 创建并激活虚拟环境

```bash
python3 -m venv venv
source venv/bin/activate
```

激活成功后，终端提示符前会出现 `(venv)`。

> 以后每次新开终端都要先：`cd yanyu-jianghu-ios && source venv/bin/activate`

### 3. 安装依赖

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

首次安装 PaddleOCR 会下载模型（约 100MB），需要几分钟。

**M 芯片 Mac 若 paddlepaddle 安装失败**，可改用 EasyOCR：

```bash
pip install facebook-wda Pillow numpy easyocr
```

### 4. 检测 WDA 连通

```bash
chmod +x scripts/check_wda.sh
./scripts/check_wda.sh
```

四项全 ✓ 再继续。

### 5. iPhone 准备

- 打开《烟雨江湖》→ 进入**地图界面**
- **横屏**、**中视角**
- 屏幕常亮（设置 → 自动锁定 → 暂时设「永不」）

### 6. 运行脚本

```bash
# 测试 OCR 能否识别右上角城市/坐标
python main.py test

# 测试移动到指定坐标
python main.py go 12 34

# 完整资源跑图（默认跳过大雪山）
python main.py run
```

### 7. 常用命令速查

```bash
source venv/bin/activate          # 激活环境
deactivate                        # 退出环境
python main.py test               # 测位置
python main.py run                # 跑图
python main.py run --include-daxueshan   # 含大雪山
```

### 依赖清单（requirements.txt）

| 包 | 作用 |
|----|------|
| facebook-wda | 连接 WDA，截图、点击 |
| Pillow | 图像处理 |
| paddleocr | 识别城市名、坐标文字 |
| paddlepaddle | PaddleOCR 后端 |
| numpy | 数组运算 |

