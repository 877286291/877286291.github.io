# 光匣 LightBox

为 Aurora 打造的独立流媒体观影 Web 应用，通过后端代理接入茅台资源站（MacCMS V10 provide API），不向前端暴露采集域名。

## 快速开始

```bash
cd lightbox
npm install
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)

生产构建：

```bash
npm run build
npm start
```

## 架构概览

```
浏览器 (React)
    │
    ▼
Next.js API Routes (/api/*)
    │
    ├── 速率限制 (≥1s/请求)
    ├── 内存缓存 (分类/列表/搜索索引)
    └── 播放地址解析
    │
    ▼
茅台资源 API (caiji.maotai999.vip)
```

### 后端 API

| 端点 | 说明 |
|------|------|
| `GET /api/categories` | 获取分类列表 |
| `GET /api/list?page=&typeId=` | 分页影片列表 |
| `GET /api/detail?id=` | 影片详情 + 解析播放源 |
| `GET /api/search?q=` | 本地关键词搜索（非上游 wd=） |
| `GET /api/play?url=&parser=` | 返回播放 URL，可选茅台解析器 |

### 播放源解析

- `vod_play_from` / `vod_play_url` 按 MacCMS 规则解析（`$$$` 分线路，`#` 分集，`集名$URL`）
- 默认优先 `mtm3u8` 线路
- 非 m3u8 源可通过 `https://maotai888.vip:966/?url=` 解析

### 前端页面

- `/` — 首页：分类 Tab + 分页网格
- `/detail/[id]` — 详情：简介、选集、HLS 播放器
- `/search?q=` — 搜索结果

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **播放**: hls.js (m3u8)

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MAOTAI_API_BASE` | `https://caiji.maotai999.vip/api.php/provide/vod/at/josn/` | 上游 API 地址 |

## 注意事项

- 上游禁用 `wd=` 关键词搜索，本应用使用内存索引做本地搜索
- 采集请求间隔 ≥1 秒，避免被限流
- 封面图片来自第三方图床，可能失效
- MVP 阶段无用户认证与媒资持久化

## 合规

请支持购买正版。本应用仅供个人学习与技术验证使用。
