# 个人 AI 学习网站

一个展示 AI 学习历程的个人网站，基于 Next.js 16 + Tailwind CSS v4 构建，支持 AI 新闻聚合、动态项目管理和学习资料管理。

## 快速开始

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 环境变量

在项目根目录创建 `.env.local`：

```env
# 阿里云 DashScope API（AI 新闻生成 & 问答助手）
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus

# 管理后台密码
ADMIN_PASSWORD=your-password
```

## 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS v4
- **动画**: Framer Motion
- **数据爬取**: Axios + Cheerio
- **AI 接口**: 阿里云 DashScope（通义千问）
- **字体**: Space Grotesk / Noto Sans SC / JetBrains Mono

## 功能特性

### 公开页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | AI 新闻轮播、叙事主线、项目展示 |
| 关于我 | `/about` | 个人介绍、教育背景、工作经历、学习历程 |
| 项目 | `/projects` | 个人项目展示，含 GitHub/Demo 链接 |
| 学习资料 | `/resources` | AI 学习资源分类展示 |

### 管理后台 (`/admin`)

| 页面 | 功能 |
|------|------|
| AI 新闻管理 | 生成、查看、删除 AI 热点新闻缓存 |
| 时间线管理 | 编辑 AI 进化时间线节点 |
| 学习资料管理 | 增删改查资源分类和条目 |
| 项目管理 | 增删改查个人项目，支持置顶 |
| 问答助手设置 | AI 助手开关、简历文件、AI 资料库 |
| 关于我管理 | 个人信息、教育/工作/经历 CRUD |

### AI 新闻模块

支持多源聚合，优先抓取官方来源（OpenAI Blog、Anthropic News、机器之心），社交平台作为补充（搜狗搜索、Bilibili、微博）。

### AI 简历助手

右下角浮动聊天组件，基于简历内容和企业知识库回答访客问题。知识库内容在管理后台手动配置。

## 目录结构

```
src/
├── app/
│   ├── about/           # 关于我页面
│   ├── admin/           # 管理后台（含 6 个子页面）
│   ├── api/             # API 路由
│   │   ├── about/       # 关于我数据 & 聊天 API
│   │   ├── admin/       # 管理端 CRUD
│   │   ├── news/        # AI 新闻
│   │   ├── narrative/   # 叙事主线
│   │   ├── projects/    # 项目
│   │   ├── resources/   # 学习资料
│   │   └── settings/    # 公开设置
│   ├── projects/        # 项目展示页
│   ├── resources/       # 学习资料页
│   └── page.tsx         # 首页
├── components/          # 公共组件
└── lib/agent/           # AI 新闻爬虫和提示词逻辑

data/
├── about.json           # 教育/工作/经历数据
├── narrative.json       # 叙事主线文本
├── news_cache.json      # AI 新闻缓存
├── projects.json        # 项目数据
├── resources.json       # 学习资料数据
├── settings.json        # 全站设置
└── timeline.json        # AI 时间线数据
```

## 数据管理

所有数据存储在 `data/` 目录下的 JSON 文件中，由管理后台动态管理，无需直接编辑文件。

## 部署

```bash
npm run build
npm start
```

推荐部署到 Vercel（Node.js 环境），需要设置环境变量 `ADMIN_PASSWORD`。
