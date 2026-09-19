# Agent Skills

本机所有 AI Agent 应用的自定义技能（skill）汇总镜像。由 WorkBuddy 于 2026-09-19 自动整理。

## 统计

| 来源 | 数量 | 说明 |
|---|---:|---|
| [WorkBuddy](https://www.workbuddy.cn) 用户级技能 | 41 | `~/.workbuddy/skills/`（其中 15 个是指向 `~/.agents/skills/` 的符号链接，**已解析为真实内容**） |
| Codex 用户技能 | 18 | `~/.codex/skills/` |
| Codex 系统技能 | 6 | `~/.codex/skills/.system/` |
| **合计** | **65** | 831 个文件 / 4.2 MB |

> 注：`~/.claude/skills/` 下的 14 个技能（Cloudflare 系列）与 WorkBuddy 侧是同一批，未重复收录。

## 目录结构

```
agent-skills/
├── README.md              ← 本文件（全量索引）
├── MANIFEST.json          ← 机读清单：名称/来源/路径/描述/文件数/体积
├── sync.sh                ← 从本机各 agent 目录重新同步
├── workbuddy/             ← WorkBuddy 用户级技能
├── codex/                 ← Codex 用户技能
└── codex-system/          ← Codex 系统技能
```

每个技能目录里是它的原始内容：`SKILL.md`（含 `name`/`description` frontmatter）+ `scripts/` / `references/` / `assets/` 等。

## 已排除的内容

`node_modules`、`.git`、`__pycache__`、`.venv`、`dist`、`build`、`.next`、`.cache`、`target`、
`*.pyc`、`.DS_Store` —— 都是可重建的依赖或构建产物。

未收录：WorkBuddy 应用**内置**的打包技能（在 App 包内，非用户技能）、Codex 的 vendor curated 下载缓存。

## 重新同步

```bash
# 从本机三个目录重新拉一遍（会覆盖目标目录）
./sync.sh ~/Documents/agent-skills

# 然后提交
cd ~/Documents/agent-skills && git add -A && git commit -m "sync skills"
```

## 技能清单

### WorkBuddy 用户级技能（41）

| 技能 | 描述（取自 SKILL.md frontmatter） | 文件 | 体积 |
|---|---|---:|---:|
| `agently-mail` | 通过 agently-cli 命令行工具操作邮件：发送、回复、转发、搜索、读取、下载附件、管理收件箱。当用户需要进行任何邮件相关操作时使用此 skill。 | 1 | 10.1 KB |
| `agents-sdk` | Build, debug, or review Cloudflare Agents SDK applications using the agents package. | 20 | 45.8 KB |
| `aihot` | 查询 AI HOT 的中文 AI 资讯、精选、当前热点和日报。用户询问今天或最近的 AI 新闻、AI 圈动态、大模型或产品发布、OpenAI／Anthropic／Google 最新消息、AI 论文、AI 日报、AI HOT 精选、当前最热事件，或需要同步当前全部精选时使用。必须通过 aihot.vi | 7 | 26.4 KB |
| `brainstorming` | "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user inten | 8 | 73.1 KB |
| `chess-policy-pipeline` | Use when building, training, or improving a chess move-policy neural network that guides alpha-beta search, especially the Rust `my-engine` (STAR / st | 1 | 20.0 KB |
| `cloudflare` | Discover and choose Cloudflare products for apps, APIs, AI agents, storage, networking, and security. Use for architecture and product selection, incl | 289 | 915.2 KB |
| `cloudflare-email-service` | Implement or troubleshoot Cloudflare Email Sending and Email Routing integrations and their delivery configuration. | 6 | 30.8 KB |
| `cloudflare-one` | Design, configure, troubleshoot, or review Cloudflare One Zero Trust and SASE deployments. Use cloudflare-one-migrations for migration planning from o | 1 | 22.3 KB |
| `cloudflare-one-migrations` | Assess and plan migrations from existing VPN, SWG, or SASE platforms to Cloudflare One, including policy mapping, parity gaps, and rollout. | 1 | 12.0 KB |
| `dispatching-parallel-agents` | Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies | 1 | 6.5 KB |
| `durable-objects` | Build, debug, or review Cloudflare Durable Objects code for persistent state and coordination. | 4 | 17.8 KB |
| `ego-browser` | ego-browser (ego-lite) is a Chromium-based browser designed from the ground up to be friendly to both human users and AI Agents. AI Agents work in the | 18 | 41.4 KB |
| `executing-plans` | Use when you have a written implementation plan to execute in a separate session with review checkpoints | 1 | 2.5 KB |
| `find-skills` | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or e | 1 | 5.3 KB |
| `finishing-a-development-branch` | Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by prese | 1 | 6.7 KB |
| `frontend-design` | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and | 1 | 9.2 KB |
| `frontend-design-skillhub` | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building web components, pages, or applications | 3 | 9.5 KB |
| `frontend-design-v2` | Expert frontend design guidelines for creating beautiful, modern UIs. Use when building landing pages, dashboards, or any user interface. | 2 | 6.2 KB |
| `ima-skills` | "" | 6 | 25.4 KB |
| `music-processing-skills` | 批量下载高品质FLAC音乐（GD音乐台多音源），自动按音乐风格分文件夹管理， 并为每首歌内嵌完整元数据（歌名、歌手、专辑、风格、年份、歌词）的完整工作流。 当用户要求「下载歌曲」「批量下载音乐」「整理音乐库」「内嵌元数据」「给歌曲加歌词/信息」时使用。 ## 路径约定 下文命令中使用两个变量，执行前 | 14 | 317.2 KB |
| `nextjs-on-cloudflare` | Build, migrate, and deploy Next.js apps on Cloudflare Workers with vinext. Use when starting a Next.js project on Cloudflare, moving an existing app t | 1 | 2.6 KB |
| `pdf-image-text-extractor__skillhub` | 从图片或 PDF 文档中识别并提取文字内容，支持多种图片格式和 PDF 文件，自动判断是否包含文字并保留原始格式输出结构化结果；v2.1 采用零额外依赖方案：扫描版 PDF 自动渲染为图片交由 AI 视觉识别（无需 tesseract/rapidocr）、表格用 pymupdf 内置 find_ta | 9 | 51.8 KB |
| `receiving-code-review` | Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires  | 1 | 6.2 KB |
| `requesting-code-review` | Use when completing tasks, implementing major features, or before merging to verify work meets requirements | 2 | 7.9 KB |
| `sandbox-migrate-to-next` | Migrate Cloudflare Sandbox apps from stable @cloudflare/sandbox to @cloudflare/sandbox@next (SDK 1.0 preview). Use sandbox-next for apps already on th | 1 | 7.8 KB |
| `sandbox-next` | Build or maintain Cloudflare Sandbox apps on @cloudflare/sandbox@next (SDK 1.0 preview). Use sandbox-migrate-to-next when porting a stable app. | 3 | 9.6 KB |
| `sandbox-stable` | Build or maintain Cloudflare Sandbox apps on the stable @cloudflare/sandbox package. Use sandbox-next for preview apps and sandbox-migrate-to-next for | 1 | 8.6 KB |
| `subagent-driven-development` | Use when executing implementation plans with independent tasks in the current session | 6 | 37.5 KB |
| `systematic-debugging` | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes | 11 | 39.8 KB |
| `tencent-meeting-skill` | 腾讯会议：会议管理与音视频协作助手。预约/创建/修改/取消会议、查询会议详情与会议号转换、查看参会成员/受邀人/等候室成员、查询用户会议列表（即将开始/进行中/已结束）、查询录制列表与下载地址、获取转写全文/段落/搜索、获取AI智能纪要（支持多语言翻译）、录制权限申请（预览+提交两步流程）、时间转换 | 16 | 197.8 KB |
| `test-driven-development` | Use when implementing any feature or bugfix, before writing implementation code | 2 | 17.7 KB |
| `tri-frontend-design` | 前端设计技能——为构建或重塑前端提供"风格锚点"驱动的可视化方向（静态视觉层），并补齐"时间维度 + 交互物理层"：动效引擎（频率闸门/缓动/弹簧/可中断性/GPU 属性/性能/a11y）、动效评审与全库审计、多变体探索。通过配色/字体/结构/质感锁定具体 CSS 令牌，并要求屏幕内容命名真实信息而 | 15 | 167.5 KB |
| `turnstile-spin` | Set up, repair, or migrate to Cloudflare Turnstile bot verification in an existing frontend and backend, including server-side Siteverify. | 13 | 88.1 KB |
| `using-git-worktrees` | Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace ex | 1 | 7.3 KB |
| `using-superpowers` | Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying quest | 4 | 7.2 KB |
| `verification-before-completion` | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming | 1 | 4.1 KB |
| `web-perf` | Audit, diagnose, or optimize website loading and interaction performance, Core Web Vitals, and Lighthouse performance scores. | 1 | 8.1 KB |
| `workers-best-practices` | Cloudflare Workers best practices for production applications. Use when writing, reviewing, or configuring Workers. | 4 | 27.9 KB |
| `wrangler` | Run or troubleshoot Wrangler CLI commands and configure Worker projects for local development, deployment, and Cloudflare resource management. | 1 | 6.6 KB |
| `writing-plans` | Use when you have a spec or requirements for a multi-step task, before touching code | 2 | 8.6 KB |
| `writing-skills` | Use when creating new skills, editing existing skills, or verifying skills work before deployment | 7 | 104.8 KB |

### Codex 用户技能（18）

| 技能 | 描述（取自 SKILL.md frontmatter） | 文件 | 体积 |
|---|---|---:|---:|
| `baoyu-article-illustrator` | Analyzes article structure, identifies positions requiring visual aids, generates illustrations with Type × Style × Palette three-dimension approach.  | 37 | 133.8 KB |
| `baoyu-compress-image` | Compresses images to WebP (default) or PNG with automatic tool selection. Use when user asks to "compress image", "optimize image", "convert to webp", | 2 | 12.2 KB |
| `baoyu-cover-image` | Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 11 color palettes and 7 rendering styles. Supports c | 35 | 103.4 KB |
| `baoyu-diagram` | Create professional, dark-themed SVG diagrams of any type — architecture diagrams, flowcharts, sequence diagrams, structural diagrams, mind maps, time | 6 | 28.1 KB |
| `baoyu-format-markdown` | Formats plain text or markdown files with frontmatter, titles, summaries, headings, bold, lists, and code blocks. Use when user asks to "format markdo | 8 | 75.4 KB |
| `baoyu-infographic` | Generate professional infographics with 21 layout types and 22 visual styles. Analyzes content, recommends layout×style combinations, and generates pu | 50 | 92.7 KB |
| `baoyu-markdown-to-html` | Converts Markdown to styled HTML with WeChat-compatible themes. Supports code highlighting, math, Mermaid (rendered to PNG via headless Chrome), Plant | 5 | 48.8 KB |
| `baoyu-post-to-wechat` | Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and im | 29 | 302.8 KB |
| `baoyu-post-to-weibo` | Posts content to Weibo (微博). Supports regular posts with text, images, and videos, and headline articles (头条文章) with Markdown input via Chrome CDP. Us | 9 | 111.7 KB |
| `baoyu-post-to-x` | Posts content and articles to X (Twitter). Supports regular posts with images/videos and X Articles (long-form Markdown). In Codex, honor explicit req | 16 | 170.5 KB |
| `baoyu-translate` | This skill should be used when the user asks to "translate", "翻译", "精翻", "translate article", "translate to Chinese", "translate to English", "改成中文",  | 11 | 45.3 KB |
| `baoyu-url-to-markdown` | Fetch any URL and convert to markdown using baoyu-fetch CLI (Chrome CDP with site-specific adapters). Built-in adapters for X/Twitter, YouTube transcr | 48 | 271.9 KB |
| `baoyu-youtube-transcript` | Downloads YouTube video transcripts/subtitles and cover images by URL or video ID. Supports multiple languages, translation, chapters, and speaker ide | 9 | 68.2 KB |
| `easy-mistake-review` | Create subject review materials focused on exam-prone mistakes, textbook boldface/key statements, and final-review summaries from course files, IMA kn | 4 | 16.2 KB |
| `find-skill` | Находит и устанавливает Claude Code Skills для проекта. 14 источников, ранжирование по звёздам GitHub. Примеры: "найди скил для Docker", "поищи скилы  | 1 | 13.6 KB |
| `frontend-design` | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and | 2 | 18.0 KB |
| `pdf` | Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude | 3 | 8.9 KB |
| `playwright` | "Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction, UI-flow de | 9 | 22.3 KB |

### Codex 系统技能（6）

| 技能 | 描述（取自 SKILL.md frontmatter） | 文件 | 体积 |
|---|---|---:|---:|
| `imagegen` | "Generate or edit raster images when the task benefits from AI-created bitmap visuals such as photos, illustrations, textures, sprites, mockups, or tr | 12 | 123.9 KB |
| `openai-docs` | "Use for Codex models/pricing, scheduled tasks, skills, settings, setup, troubleshooting, customization, automations, and self-knowledge—including 'yo | 17 | 99.2 KB |
| `plugin-creator` | Create and scaffold plugin directories for Codex with a required `.codex-plugin/plugin.json`, optional plugin folders/files, valid manifest defaults,  | 11 | 67.2 KB |
| `review-agent` | Perform a read-only, defect-first review of a specified code change and return every actionable finding. Use when another agent delegates review of un | 2 | 2.8 KB |
| `skill-creator` | Create or update a Codex skill with appropriately scoped instructions and any needed supporting resources. | 9 | 52.1 KB |
| `skill-installer` | Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a cur | 8 | 31.7 KB |

## 来源与许可

这些技能来自不同出处，**版权各自归属原作者**，本仓库仅作本机备份与查阅之用：

- Cloudflare 系列（`cloudflare`、`wrangler`、`workers-best-practices`、`durable-objects`、`sandbox-*` 等）：Cloudflare 官方
- `baoyu-*` 系列：来自 [宝玉](https://github.com/JimLiu) 的公开技能集
- `superpowers` / `brainstorming` / `writing-plans` / `test-driven-development` 等：来自 superpowers 系列
- 其余为本机自建或从公开来源整理

如原作者要求移除，请提 Issue。

## 安全说明

- 上传前已做敏感串扫描（GitHub PAT、OpenAI/AWS key、私钥、硬编码密码、Bearer token），**未发现真实凭据**
  （唯一命中是 `baoyu-post-to-wechat` 单元测试里的假占位符 `"stale-secret-from-process-env"`）。
- 但技能里可能含**个人路径、账号名、业务配置**。本仓库默认设为 **private**；若要转公开，请先自行复核
  `sync.sh` 里三个来源目录下的全部内容。
