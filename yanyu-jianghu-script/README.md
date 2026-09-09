# 烟雨江湖跑图脚本

基于 **Auto.js** 的《烟雨江湖》资源采集自动化脚本，支持环形跑图路线、跨地图导航与 OCR 位置识别。

## 功能

- **环形资源跑图**：覆盖明月峰、双王镇、衡山、南岭、龙泉镇、杭州、泉州、姑苏、泰安镇、洛阳、落霞镇、华山、敦煌、大雪山、南阳渡、太乙山等 16 个城市
- **自动跨地图导航**：根据预设城市路径自动寻路至出口并切换地图
- **坐标采集**：到达资源点后自动识别并点击「采集」选项
- **手动坐标移动**：支持输入任意 (x, y) 坐标前往
- **可选跳过大雪山**：避免 80 级守矿怪

## 环境要求

| 项目 | 要求 |
|------|------|
| 运行平台 | **仅 Android** — Auto.js Pro（推荐）或 Auto.js 4.1.1+ |
| 分辨率 | 1920×1080（其他分辨率会自动缩放，建议模拟器固定此分辨率） |
| 权限 | 无障碍服务、截图权限 |
| OCR | Auto.js Pro 内置 Paddle OCR，或安装 gmlkit OCR 插件 |

> **iOS 用户请注意**：Auto.js 不支持 iPhone/iPad，本脚本无法直接在 iOS 上运行。  
> **请使用 [`yanyu-jianghu-ios/`](../yanyu-jianghu-ios/)** — 基于 WebDriverAgent 的 Python 版，可在 iOS 主号上跑图。  
> 下文为 Android 版说明。

## 快速开始

### 1. 安装 Auto.js

下载 [Auto.js Pro](https://pro.autojs.org/) 或 Auto.js 4.1.1，在手机上/模拟器安装并开启无障碍服务。

### 2. 导入项目

将整个 `yanyu-jianghu-script` 文件夹复制到手机 Auto.js 脚本目录，或通过 VS Code + Auto.js 插件连接设备后 `Save Project`。

### 3. VS Code 调试（推荐）

1. 安装 VS Code 插件 `Auto.js-Pro-Ext` 或 `Auto.js-VSCodeExt`
2. 命令面板 → `Auto.js: Start Server`
3. 手机 Auto.js → 连接电脑
4. 打开 `main.js` → `Auto.js: Run On Device`

### 4. 运行

1. 打开《烟雨江湖》并进入游戏主界面
2. 运行 `main.js`
3. 点击「开始跑图」

## 项目结构

```
yanyu-jianghu-script/
├── main.js              # 入口 + UI 控制面板
├── project.json         # Auto.js 项目配置
├── modules/
│   ├── config.js        # 屏幕/OCR/延迟配置
│   ├── mapData.js       # 地图路线与资源坐标
│   ├── status.js        # OCR 位置与交互识别
│   ├── walk.js          # 地图内行走与采集
│   └── navigator.js     # 跨地图导航
└── README.md
```

## 跑图路线

默认路线（逆时针环形，节省车马费）：

```
明月峰 → 双王镇 → 衡山 → 南岭 → 龙泉镇 → 杭州 → 泉州 → 姑苏
→ 泰安镇 → 洛阳 → 落霞镇 → 华山 → 敦煌 → 大雪山 → 南阳渡 → 太乙山
```

各采集点坐标可在 `modules/mapData.js` 的 `RESOURCE_ROUTE` 中查看和修改。

## 配置说明

编辑 `modules/config.js` 可调整：

- `STEP_X` / `STEP_Y`：等距地图像素步长（视角变化时需调整）
- `OCR_REGIONS`：OCR 识别区域（游戏 UI 更新后可能需重新标定）
- `DELAY`：各操作间延迟（网络慢时可增大）
- `GAME_PACKAGE`：游戏包名（用于自动启动）

## 常见问题

**Q: OCR 识别位置失败？**

- 确认分辨率为 1920×1080
- 检查 `config.js` 中 `OCR_REGIONS.position` 是否覆盖右上角城市/坐标文字
- 确保 Auto.js Pro OCR 插件已启用

**Q: 点击位置偏移？**

- 调整 `STEP_X`、`STEP_Y` 或 `LEFT_OFFSET` 等偏移参数
- 确认游戏为「中视角」（非近/远视角）

**Q: 跨地图失败？**

- 城市路径在 `mapData.js` 的 `CITY_ROUTES` 中维护，可按实际游戏更新
- 部分出口名称可能与城市名不同，需在 `CITY_EXITS` 中修正

**Q: 与 shute 脚本的区别？**

本脚本为开源 Auto.js 实现，核心逻辑参考 [game-yanyujianghu-script](https://github.com/lulululu1024/game-yanyujianghu-script)（Lua/懒人精灵版），功能相对精简，适合二次开发。

## iOS 用户方案

苹果系统不允许第三方 App 像 Auto.js 那样全局模拟点击、截图 OCR，因此**完整跑图脚本无法在普通 iOS 设备上直接运行**。可选方案如下：

### 方案一：云手机 / 安卓模拟器（推荐）

在 **安卓环境** 中运行本脚本，iOS 只负责远程查看：

| 方式 | 说明 |
|------|------|
| 电脑模拟器 | 雷电 / MuMu / 夜神，分辨率设 1920×1080，安装 Auto.js + 本脚本 |
| 云手机 | 红手指、多多云等安卓云机，24 小时后台跑图，iOS 端 App 遥控 |
| 旧安卓机 | 若有闲置安卓手机，直接装 Auto.js 运行 |

这是**唯一能完整使用本仓库脚本**的方式，路线与坐标数据可直接复用。

### 方案二：iOS 内置「切换控制」（功能有限）

路径：**设置 → 辅助功能 → 切换控制 → 方案**

适合**固定位置重复点击**（如梅花桩、木人训练），**无法**做 OCR 识别、跨地图导航、资源跑图。

1. 新建方案，添加「轻点」手势，设好坐标与间隔（如 1.05 秒）
2. 进游戏后连按三次侧边键启动切换控制
3. 只能重复同一位置，每次游戏更新 UI 后需重新标定

### 方案三：越狱 + XXTouch / AutoTouch

越狱后可安装 XXTouch、AutoTouch 等，用 Lua 重写逻辑。门槛高、系统升级后易失效，且存在安全风险，**不推荐普通用户**。

### 方案四：第三方 iOS 辅助 App

市面有宣称「iOS 免越狱」的烟雨江湖辅助（如鸟人助手等），本质是云端安卓执行或内置脚本。**非本仓库项目**，存在封号与隐私风险，请自行甄别。

### 总结

| 需求 | iOS 可行？ | 建议 |
|------|-----------|------|
| 完整资源跑图 | ❌ 原生不可 | 云手机 / 电脑模拟器 + 本脚本 |
| 固定连点（梅花桩等） | ✅ 切换控制 | 系统自带，无需脚本 |
| 日常任务全自动 | ⚠️ 仅第三方 | 云手机或 shute 类脚本（Android 端） |

## 免责声明

- 本脚本仅供 **学习 Auto.js 自动化开发** 交流使用
- 使用游戏自动化脚本可能违反《烟雨江湖》用户协议，存在 **封号风险**
- 作者不对因使用本脚本导致的任何后果负责

## 参考

- [game-yanyujianghu-script](https://github.com/lulululu1024/game-yanyujianghu-script) — Lua 版烟雨江湖脚本
- [Auto.js 官方文档](https://pro.autojs.org/docs/)
