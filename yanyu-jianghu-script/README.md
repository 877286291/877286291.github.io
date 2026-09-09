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
| 运行平台 | Auto.js Pro（推荐）或 Auto.js 4.1.1+ |
| 分辨率 | 1920×1080（其他分辨率会自动缩放，建议模拟器固定此分辨率） |
| 权限 | 无障碍服务、截图权限 |
| OCR | Auto.js Pro 内置 Paddle OCR，或安装 gmlkit OCR 插件 |

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

## 免责声明

- 本脚本仅供 **学习 Auto.js 自动化开发** 交流使用
- 使用游戏自动化脚本可能违反《烟雨江湖》用户协议，存在 **封号风险**
- 作者不对因使用本脚本导致的任何后果负责

## 参考

- [game-yanyujianghu-script](https://github.com/lulululu1024/game-yanyujianghu-script) — Lua 版烟雨江湖脚本
- [Auto.js 官方文档](https://pro.autojs.org/docs/)
