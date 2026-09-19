# Agent Skills

本机所有 AI Agent 应用的自定义技能汇总。**按技能套件分类**（而非按来源 App），共 **65** 个技能、
831 个文件、4.2 MB。由 WorkBuddy 于 2026-09-19 整理。

## 套件总览

| 套件 | 数量 | 说明 |
|---|---:|---|
| [Cloudflare 平台](#01-cloudflare-platform) | 14 | Cloudflare 官方技能包：产品选型、Workers/Durable Objects/Sandbox、Wrangler、Turnstile、Zero Trust、Email、性能审计等。 |
| [Superpowers 开发流程](#02-superpowers-workflow) | 13 | obra/superpowers 一整套软件开发方法论：从头脑风暴、写计划、执行计划、TDD、系统化调试，到代码评审与分支收尾。 |
| [宝玉内容创作](#03-baoyu-content) | 13 | 宝玉（JimLiu）的一套内容生产流水线：抓取网页/字幕 → 翻译/排版 → 配图/信息图/图表/封面 → 转 HTML → 发布到公众号、微博、X。 |
| [前端设计](#04-frontend-design) | 5 | UI 设计方向、版式与视觉质感，含动效引擎（缓动/弹簧/可中断性/性能）与多变体探索。 |
| [技能创作与发现](#05-skill-authoring) | 6 | 元技能：写 skill、装 skill、找 skill、做插件。 |
| [文档与图片处理](#06-document-image) | 2 | PDF 读写/表单/合并拆分，以及图片与扫描版 PDF 的文字提取。 |
| [浏览器自动化](#07-browser-automation) | 2 | 控制真实浏览器：打开页面、填表、点击、截图、抓取、登录态复用与端到端测试。 |
| [音乐与媒体](#08-music-media) | 1 | 音乐批量下载、元数据/歌词/封面内嵌等媒体流水线。 |
| [办公与协作](#09-office-collab) | 3 | 邮件、会议、知识库等日常办公协作能力。 |
| [Codex 系统](#10-codex-system) | 3 | OpenAI Codex 内置的系统级技能：图像生成、官方文档查询、评审代理。 |
| [资讯与学习](#11-news-study) | 2 | AI 资讯日报，以及基于课程资料的易错点整理与考前复习材料生成。 |
| [个人项目](#12-personal-projects) | 1 | 为个人项目定制的技能（如 Star-Chess 棋力流水线）。 |

## 目录结构

```
agent-skills/
├── README.md               本文件（按套件的全量索引）
├── MANIFEST.json           机读清单（套件/来源/路径/描述/体积）
├── suites.json             归类规则 ← 改这里即可调整套件
├── sync.sh                 一键重新同步（调用 tools/build-suites.js）
├── tools/build-suites.js   同步脚本
└── 01-cloudflare-platform/ … 99-inbox/   各套件目录，内容为技能原样
```

「来源」列保留每个技能原本属于哪个 agent 应用（WorkBuddy / Codex / Codex 系统），
方便回溯，但不作为分类维度。同名技能会加 `__<来源>` 后缀区分。

## 已排除

`node_modules`、`.git`、`__pycache__`、`.venv`、`dist`、`build`、`.next`、`.cache`、`target`、`*.pyc`、`.DS_Store`

## 重新同步

```bash
./sync.sh                      # 同步到本目录（默认）
./sync.sh /path/to/other       # 同步到别处
cd . && git add -A && git commit -m sync
```

调整分类：编辑 `suites.json`（把技能名加进对应套件的 `skills` 数组），重跑即可。

## 技能清单

<a id="01-cloudflare-platform"></a>

### 01. Cloudflare 平台（14）

> Cloudflare 官方技能包：产品选型、Workers/Durable Objects/Sandbox、Wrangler、Turnstile、Zero Trust、Email、性能审计等。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `agents-sdk` | Build, debug, or review Cloudflare Agents SDK applications using the agents package. | WorkBuddy | 20 | 45.8 KB |
| `cloudflare` | Discover and choose Cloudflare products for apps, APIs, AI agents, storage, networking, and security. Use for architecture and product selection, including when | WorkBuddy | 289 | 915.2 KB |
| `cloudflare-email-service` | Implement or troubleshoot Cloudflare Email Sending and Email Routing integrations and their delivery configuration. | WorkBuddy | 6 | 30.8 KB |
| `cloudflare-one` | Design, configure, troubleshoot, or review Cloudflare One Zero Trust and SASE deployments. Use cloudflare-one-migrations for migration planning from other vendo | WorkBuddy | 1 | 22.3 KB |
| `cloudflare-one-migrations` | Assess and plan migrations from existing VPN, SWG, or SASE platforms to Cloudflare One, including policy mapping, parity gaps, and rollout. | WorkBuddy | 1 | 12.0 KB |
| `durable-objects` | Build, debug, or review Cloudflare Durable Objects code for persistent state and coordination. | WorkBuddy | 4 | 17.8 KB |
| `nextjs-on-cloudflare` | Build, migrate, and deploy Next.js apps on Cloudflare Workers with vinext. Use when starting a Next.js project on Cloudflare, moving an existing app to Workers, | WorkBuddy | 1 | 2.6 KB |
| `sandbox-migrate-to-next` | Migrate Cloudflare Sandbox apps from stable @cloudflare/sandbox to @cloudflare/sandbox@next (SDK 1.0 preview). Use sandbox-next for apps already on the preview. | WorkBuddy | 1 | 7.8 KB |
| `sandbox-next` | Build or maintain Cloudflare Sandbox apps on @cloudflare/sandbox@next (SDK 1.0 preview). Use sandbox-migrate-to-next when porting a stable app. | WorkBuddy | 3 | 9.6 KB |
| `sandbox-stable` | Build or maintain Cloudflare Sandbox apps on the stable @cloudflare/sandbox package. Use sandbox-next for preview apps and sandbox-migrate-to-next for stable-to | WorkBuddy | 1 | 8.6 KB |
| `turnstile-spin` | Set up, repair, or migrate to Cloudflare Turnstile bot verification in an existing frontend and backend, including server-side Siteverify. | WorkBuddy | 13 | 88.1 KB |
| `web-perf` | Audit, diagnose, or optimize website loading and interaction performance, Core Web Vitals, and Lighthouse performance scores. | WorkBuddy | 1 | 8.1 KB |
| `workers-best-practices` | Cloudflare Workers best practices for production applications. Use when writing, reviewing, or configuring Workers. | WorkBuddy | 4 | 27.9 KB |
| `wrangler` | Run or troubleshoot Wrangler CLI commands and configure Worker projects for local development, deployment, and Cloudflare resource management. | WorkBuddy | 1 | 6.6 KB |

<a id="02-superpowers-workflow"></a>

### 02. Superpowers 开发流程（13）

> obra/superpowers 一整套软件开发方法论：从头脑风暴、写计划、执行计划、TDD、系统化调试，到代码评审与分支收尾。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `brainstorming` | "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, require | WorkBuddy | 8 | 73.1 KB |
| `dispatching-parallel-agents` | Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies | WorkBuddy | 1 | 6.5 KB |
| `executing-plans` | Use when you have a written implementation plan to execute in a separate session with review checkpoints | WorkBuddy | 1 | 2.5 KB |
| `finishing-a-development-branch` | Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting stru | WorkBuddy | 1 | 6.7 KB |
| `receiving-code-review` | Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical  | WorkBuddy | 1 | 6.2 KB |
| `requesting-code-review` | Use when completing tasks, implementing major features, or before merging to verify work meets requirements | WorkBuddy | 2 | 7.9 KB |
| `subagent-driven-development` | Use when executing implementation plans with independent tasks in the current session | WorkBuddy | 6 | 37.5 KB |
| `systematic-debugging` | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes | WorkBuddy | 11 | 39.8 KB |
| `test-driven-development` | Use when implementing any feature or bugfix, before writing implementation code | WorkBuddy | 2 | 17.7 KB |
| `using-git-worktrees` | Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via n | WorkBuddy | 1 | 7.3 KB |
| `using-superpowers` | Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions | WorkBuddy | 4 | 7.2 KB |
| `verification-before-completion` | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output be | WorkBuddy | 1 | 4.1 KB |
| `writing-plans` | Use when you have a spec or requirements for a multi-step task, before touching code | WorkBuddy | 2 | 8.6 KB |

<a id="03-baoyu-content"></a>

### 03. 宝玉内容创作（13）

> 宝玉（JimLiu）的一套内容生产流水线：抓取网页/字幕 → 翻译/排版 → 配图/信息图/图表/封面 → 转 HTML → 发布到公众号、微博、X。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `baoyu-article-illustrator` | Analyzes article structure, identifies positions requiring visual aids, generates illustrations with Type × Style × Palette three-dimension approach. Use when u | Codex | 37 | 133.8 KB |
| `baoyu-compress-image` | Compresses images to WebP (default) or PNG with automatic tool selection. Use when user asks to "compress image", "optimize image", "convert to webp", or reduce | Codex | 2 | 12.2 KB |
| `baoyu-cover-image` | Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 11 color palettes and 7 rendering styles. Supports cinematic ( | Codex | 35 | 103.4 KB |
| `baoyu-diagram` | Create professional, dark-themed SVG diagrams of any type — architecture diagrams, flowcharts, sequence diagrams, structural diagrams, mind maps, timelines, ill | Codex | 6 | 28.1 KB |
| `baoyu-format-markdown` | Formats plain text or markdown files with frontmatter, titles, summaries, headings, bold, lists, and code blocks. Use when user asks to "format markdown", "beau | Codex | 8 | 75.4 KB |
| `baoyu-infographic` | Generate professional infographics with 21 layout types and 22 visual styles. Analyzes content, recommends layout×style combinations, and generates publication- | Codex | 50 | 92.7 KB |
| `baoyu-markdown-to-html` | Converts Markdown to styled HTML with WeChat-compatible themes. Supports code highlighting, math, Mermaid (rendered to PNG via headless Chrome), PlantUML, footn | Codex | 5 | 48.8 KB |
| `baoyu-post-to-wechat` | Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text p | Codex | 29 | 302.8 KB |
| `baoyu-post-to-weibo` | Posts content to Weibo (微博). Supports regular posts with text, images, and videos, and headline articles (头条文章) with Markdown input via Chrome CDP. Use when use | Codex | 9 | 111.7 KB |
| `baoyu-post-to-x` | Posts content and articles to X (Twitter). Supports regular posts with images/videos and X Articles (long-form Markdown). In Codex, honor explicit requests for  | Codex | 16 | 170.5 KB |
| `baoyu-translate` | This skill should be used when the user asks to "translate", "翻译", "精翻", "translate article", "translate to Chinese", "translate to English", "改成中文", "改成英文", "c | Codex | 11 | 45.3 KB |
| `baoyu-url-to-markdown` | Fetch any URL and convert to markdown using baoyu-fetch CLI (Chrome CDP with site-specific adapters). Built-in adapters for X/Twitter, YouTube transcripts, Hack | Codex | 48 | 271.9 KB |
| `baoyu-youtube-transcript` | Downloads YouTube video transcripts/subtitles and cover images by URL or video ID. Supports multiple languages, translation, chapters, and speaker identificatio | Codex | 9 | 68.2 KB |

<a id="04-frontend-design"></a>

### 04. 前端设计（5）

> UI 设计方向、版式与视觉质感，含动效引擎（缓动/弹簧/可中断性/性能）与多变体探索。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `frontend-design` | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making ch | WorkBuddy | 1 | 9.2 KB |
| `frontend-design` | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making ch | Codex | 2 | 18.0 KB |
| `frontend-design-skillhub` | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building web components, pages, or applications. Generate | WorkBuddy | 3 | 9.5 KB |
| `frontend-design-v2` | Expert frontend design guidelines for creating beautiful, modern UIs. Use when building landing pages, dashboards, or any user interface. | WorkBuddy | 2 | 6.2 KB |
| `tri-frontend-design` | 前端设计技能——为构建或重塑前端提供"风格锚点"驱动的可视化方向（静态视觉层），并补齐"时间维度 + 交互物理层"：动效引擎（频率闸门/缓动/弹簧/可中断性/GPU 属性/性能/a11y）、动效评审与全库审计、多变体探索。通过配色/字体/结构/质感锁定具体 CSS 令牌，并要求屏幕内容命名真实信息而非编造。支持独立安装 | WorkBuddy | 15 | 167.5 KB |

<a id="05-skill-authoring"></a>

### 05. 技能创作与发现（6）

> 元技能：写 skill、装 skill、找 skill、做插件。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `find-skill` | Находит и устанавливает Claude Code Skills для проекта. 14 источников, ранжирование по звёздам GitHub. Примеры: "найди скил для Docker", "поищи скилы для тестир | Codex | 1 | 13.6 KB |
| `find-skills` | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express int | WorkBuddy | 1 | 5.3 KB |
| `plugin-creator` | Create and scaffold plugin directories for Codex with a required `.codex-plugin/plugin.json`, optional plugin folders/files, valid manifest defaults, and person | Codex 系统 | 11 | 67.2 KB |
| `skill-creator` | Create or update a Codex skill with appropriately scoped instructions and any needed supporting resources. | Codex 系统 | 9 | 52.1 KB |
| `skill-installer` | Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill | Codex 系统 | 8 | 31.7 KB |
| `writing-skills` | Use when creating new skills, editing existing skills, or verifying skills work before deployment | WorkBuddy | 7 | 104.8 KB |

<a id="06-document-image"></a>

### 06. 文档与图片处理（2）

> PDF 读写/表单/合并拆分，以及图片与扫描版 PDF 的文字提取。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `pdf` | Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to  | Codex | 3 | 8.9 KB |
| `pdf-image-text-extractor__skillhub` | 从图片或 PDF 文档中识别并提取文字内容，支持多种图片格式和 PDF 文件，自动判断是否包含文字并保留原始格式输出结构化结果；v2.1 采用零额外依赖方案：扫描版 PDF 自动渲染为图片交由 AI 视觉识别（无需 tesseract/rapidocr）、表格用 pymupdf 内置 find_tables 结构化提取 | WorkBuddy | 9 | 51.8 KB |

<a id="07-browser-automation"></a>

### 07. 浏览器自动化（2）

> 控制真实浏览器：打开页面、填表、点击、截图、抓取、登录态复用与端到端测试。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `ego-browser` | ego-browser (ego-lite) is a Chromium-based browser designed from the ground up to be friendly to both human users and AI Agents. AI Agents work in their own iso | WorkBuddy | 18 | 41.4 KB |
| `playwright` | "Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction, UI-flow debugging) v | Codex | 9 | 22.3 KB |

<a id="08-music-media"></a>

### 08. 音乐与媒体（1）

> 音乐批量下载、元数据/歌词/封面内嵌等媒体流水线。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `music-processing-skills` | 批量下载高品质FLAC音乐（GD音乐台多音源），自动按音乐风格分文件夹管理， 并为每首歌内嵌完整元数据（歌名、歌手、专辑、风格、年份、歌词）的完整工作流。 当用户要求「下载歌曲」「批量下载音乐」「整理音乐库」「内嵌元数据」「给歌曲加歌词/信息」时使用。 ## 路径约定 下文命令中使用两个变量，执行前先设置（或替换成你的 | WorkBuddy | 14 | 317.2 KB |

<a id="09-office-collab"></a>

### 09. 办公与协作（3）

> 邮件、会议、知识库等日常办公协作能力。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `agently-mail` | 通过 agently-cli 命令行工具操作邮件：发送、回复、转发、搜索、读取、下载附件、管理收件箱。当用户需要进行任何邮件相关操作时使用此 skill。 | WorkBuddy | 1 | 10.1 KB |
| `ima-skills` | "" | WorkBuddy | 6 | 25.4 KB |
| `tencent-meeting-skill` | 腾讯会议：会议管理与音视频协作助手。预约/创建/修改/取消会议、查询会议详情与会议号转换、查看参会成员/受邀人/等候室成员、查询用户会议列表（即将开始/进行中/已结束）、查询录制列表与下载地址、获取转写全文/段落/搜索、获取AI智能纪要（支持多语言翻译）、录制权限申请（预览+提交两步流程）、时间转换与版本检查、Agen | WorkBuddy | 16 | 197.8 KB |

<a id="10-codex-system"></a>

### 10. Codex 系统（3）

> OpenAI Codex 内置的系统级技能：图像生成、官方文档查询、评审代理。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `imagegen` | "Generate or edit raster images when the task benefits from AI-created bitmap visuals such as photos, illustrations, textures, sprites, mockups, or transparent- | Codex 系统 | 12 | 123.9 KB |
| `openai-docs` | "Use for Codex models/pricing, scheduled tasks, skills, settings, setup, troubleshooting, customization, automations, and self-knowledge—including 'you,' 'your, | Codex 系统 | 17 | 99.2 KB |
| `review-agent` | Perform a read-only, defect-first review of a specified code change and return every actionable finding. Use when another agent delegates review of uncommitted  | Codex 系统 | 2 | 2.8 KB |

<a id="11-news-study"></a>

### 11. 资讯与学习（2）

> AI 资讯日报，以及基于课程资料的易错点整理与考前复习材料生成。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `aihot` | 查询 AI HOT 的中文 AI 资讯、精选、当前热点和日报。用户询问今天或最近的 AI 新闻、AI 圈动态、大模型或产品发布、OpenAI／Anthropic／Google 最新消息、AI 论文、AI 日报、AI HOT 精选、当前最热事件，或需要同步当前全部精选时使用。必须通过 aihot.virxact.com  | WorkBuddy | 7 | 26.4 KB |
| `easy-mistake-review` | Create subject review materials focused on exam-prone mistakes, textbook boldface/key statements, and final-review summaries from course files, IMA knowledge-ba | Codex | 4 | 16.2 KB |

<a id="12-personal-projects"></a>

### 12. 个人项目（1）

> 为个人项目定制的技能（如 Star-Chess 棋力流水线）。

| 技能 | 描述 | 来源 | 文件 | 体积 |
|---|---|---|---:|---:|
| `chess-policy-pipeline` | Use when building, training, or improving a chess move-policy neural network that guides alpha-beta search, especially the Rust `my-engine` (STAR / star-ai-boar | WorkBuddy | 1 | 20.0 KB |

## 来源与许可

技能来自不同出处，**版权各自归属原作者**，本仓库仅作本机备份与查阅：

- **Cloudflare 系列**：Cloudflare 官方技能包
- **Superpowers 系列**：obra/superpowers 工作流方法论
- **宝玉 `baoyu-*` 系列**：[宝玉](https://github.com/JimLiu) 的公开内容创作技能集
- **`pdf`**：Anthropic 官方技能（frontmatter 标注 Proprietary，见其 LICENSE.txt）
- **Codex 系统技能**：OpenAI 官方（skill-creator / skill-installer / plugin-creator / imagegen / openai-docs / review-agent）
- **音乐、象棋、腾讯会议、IMA、ego-browser 等**：本机自建或从公开来源整理

如原作者要求移除，请提 Issue。

## 安全说明

- 上传前已做敏感串扫描（GitHub PAT、OpenAI/AWS/Google key、私钥、硬编码密码、Bearer token）：**未发现真实凭据**。
- 但技能里含**个人路径、账号名、业务配置**，本仓库默认 **private**；转公开前请自行复核。
