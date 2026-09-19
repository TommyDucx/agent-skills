#!/usr/bin/env node
/**
 * 把本机各 agent 的技能目录按「套件」汇总到本仓库。
 * 用法: node tools/build-suites.js [输出目录]   默认 ~/Documents/agent-skills
 *
 * - 归类规则见 suites.json（按技能名匹配套件）
 * - 未匹配到的技能落到 99-inbox/
 * - 同名技能冲突时自动加 __<来源> 后缀
 * - ~/.workbuddy/skills 里有 15 个指向 ~/.agents/skills 的符号链接，用 rsync -L 解析
 */
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const HERE = path.resolve(__dirname, "..");
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, "suites.json"), "utf8"));
const DEST = process.argv[2] ? path.resolve(process.argv[2]) : path.join(os.homedir(), "Documents/agent-skills");
const H = os.homedir();

const SOURCES = [
  { id: "workbuddy", label: "WorkBuddy", dir: path.join(H, ".workbuddy/skills") },
  { id: "codex", label: "Codex", dir: path.join(H, ".codex/skills") },
  { id: "codex-system", label: "Codex 系统", dir: path.join(H, ".codex/skills/.system") },
];

const EXCLUDES = ["node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build", ".next", ".cache", ".pytest_cache", "target", ".DS_Store", "*.pyc", "*.pyo"];
const INBOX = "99-inbox";

function suiteOf(name) {
  for (const s of CFG.suites) if (s.skills.includes(name)) return s;
  return null;
}

function parseFrontmatter(file) {
  try {
    const txt = fs.readFileSync(file, "utf8").slice(0, 6000);
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return {};
    const out = {};
    let key = null;
    for (const line of m[1].split(/\r?\n/)) {
      const km = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
      if (km) { key = km[1]; out[key] = km[2].replace(/^[>-]+\s*$/, "").trim(); }
      else if (key && line.trim()) out[key] = ((out[key] || "") + " " + line.trim()).trim();
    }
    return out;
  } catch { return {}; }
}

function dirStats(dir) {
  let files = 0, bytes = 0;
  const walk = (d, depth) => {
    if (depth > 8) return;
    for (const it of fs.readdirSync(d, { withFileTypes: true })) {
      if (EXCLUDES.includes(it.name)) continue;
      const p = path.join(d, it.name);
      let st; try { st = fs.statSync(p); } catch { continue; }
      if (st.isDirectory()) walk(p, depth + 1); else { files++; bytes += st.size; }
    }
  };
  walk(dir, 0);
  return { files, bytes };
}

// ---------- 清理旧的输出目录 ----------
for (const e of fs.readdirSync(DEST, { withFileTypes: true })) {
  if (!e.isDirectory()) continue;
  if (e.name === "tools" || e.name === ".git") continue;
  fs.rmSync(path.join(DEST, e.name), { recursive: true, force: true });
}

// ---------- 扫描来源 ----------
const found = [];
for (const src of SOURCES) {
  if (!fs.existsSync(src.dir)) { console.log(`[!] 跳过（不存在）: ${src.dir}`); continue; }
  for (const e of fs.readdirSync(src.dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    if (!e.isDirectory() && !e.isSymbolicLink()) continue;
    const p = path.join(src.dir, e.name);
    let real; try { real = fs.realpathSync(p); } catch { continue; }
    if (!fs.existsSync(real)) continue;
    found.push({ name: e.name, origin: src.id, originLabel: src.label, real, isLink: fs.lstatSync(p).isSymbolicLink() });
  }
}
console.log(`来源共发现 ${found.length} 个技能`);

// ---------- 分配套件 + 处理同名 ----------
const taken = new Set();
const placed = [];
for (const f of found) {
  const suite = suiteOf(f.name);
  const suiteId = suite ? suite.id : INBOX;
  let dir = f.name;
  if (taken.has(suiteId + "/" + dir)) dir = `${f.name}__${f.origin}`;   // 同名冲突
  taken.add(suiteId + "/" + dir);
  const outDir = path.join(DEST, suiteId, dir);
  fs.mkdirSync(path.dirname(outDir), { recursive: true });
  try {
    execFileSync("rsync", ["-aL", "--quiet", ...EXCLUDES.flatMap((x) => ["--exclude", x]), `${f.real.replace(/\/$/, "")}/`, `${outDir}/`], { stdio: "pipe" });
  } catch (err) { console.log(`  [!] rsync 失败 ${f.name}: ${err.message}`); continue; }
  const st = dirStats(outDir);
  const fm = parseFrontmatter(path.join(outDir, "SKILL.md"));
  placed.push({
    name: f.name, dir, suite: suiteId, suiteTitle: suite ? suite.title : "未归类",
    origin: f.origin, originLabel: f.originLabel,
    path: `${suiteId}/${dir}`, files: st.files, bytes: st.bytes,
    description: (fm.description || "").replace(/\s+/g, " ").trim(),
    sourcePath: f.real.replace(H, "~"),
  });
}

// ---------- MANIFEST ----------
const suitesOut = [];
for (const s of CFG.suites) suitesOut.push({ id: s.id, title: s.title, desc: s.desc, count: placed.filter((p) => p.suite === s.id).length });
const inboxCount = placed.filter((p) => p.suite === INBOX).length;
if (inboxCount) suitesOut.push({ id: INBOX, title: "未归类（待整理）", desc: "未匹配 suites.json 的规则", count: inboxCount });

fs.writeFileSync(path.join(DEST, "MANIFEST.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalSkills: placed.length,
  totalFiles: placed.reduce((s, p) => s + p.files, 0),
  totalBytes: placed.reduce((s, p) => s + p.bytes, 0),
  suites: suitesOut,
  skills: placed.sort((a, b) => (a.suite + a.name).localeCompare(b.suite + b.name)),
}, null, 2));

// ---------- README ----------
const totalFiles = placed.reduce((s, p) => s + p.files, 0);
const totalBytes = placed.reduce((s, p) => s + p.bytes, 0);
const kb = (b) => (b / 1048576 >= 1 ? (b / 1048576).toFixed(1) + " MB" : (b / 1024).toFixed(1) + " KB");
const ORIGIN_LABEL = { workbuddy: "WorkBuddy", codex: "Codex", "codex-system": "Codex 系统" };

const section = (suite) => {
  const rows = placed.filter((p) => p.suite === suite.id).sort((a, b) => a.name.localeCompare(b.name));
  if (!rows.length) return "";
  const body = rows.map((r) => `| \`${r.name}\` | ${(r.description || "—").replace(/\|/g, "\\|").slice(0, 160)} | ${ORIGIN_LABEL[r.origin] || r.origin} | ${r.files} | ${kb(r.bytes)} |`).join("\n");
  const num = (suite.id.match(/^(\d+)/) || [, ""])[1];
  return `<a id="${suite.id}"></a>\n\n### ${num}. ${suite.title}（${rows.length}）\n\n${suite.desc ? "> " + suite.desc + "\n\n" : ""}| 技能 | 描述 | 来源 | 文件 | 体积 |\n|---|---|---|---:|---:|\n${body}\n`;
};

const toc = suitesOut.map((s) => `- [${s.title}](#${s.id}) — ${s.count} 个`).join("\n");
const readme = `# Agent Skills

本机所有 AI Agent 应用的自定义技能汇总。**按技能套件分类**（而非按来源 App），共 **${placed.length}** 个技能、
${totalFiles} 个文件、${(totalBytes / 1048576).toFixed(1)} MB。由 WorkBuddy 于 ${new Date().toISOString().slice(0, 10)} 整理。

## 套件总览

${suitesOut.map((s) => `| [${s.title}](#${s.id}) | ${s.count} | ${s.desc || ""} |`).join("\n").replace(/^\|/, "| 套件 | 数量 | 说明 |\n|---|---:|---|\n|")}

## 目录结构

\`\`\`
agent-skills/
├── README.md               本文件（按套件的全量索引）
├── MANIFEST.json           机读清单（套件/来源/路径/描述/体积）
├── suites.json             归类规则 ← 改这里即可调整套件
├── sync.sh                 一键重新同步（调用 tools/build-suites.js）
├── tools/build-suites.js   同步脚本
└── 01-cloudflare-platform/ … 99-inbox/   各套件目录，内容为技能原样
\`\`\`

「来源」列保留每个技能原本属于哪个 agent 应用（WorkBuddy / Codex / Codex 系统），
方便回溯，但不作为分类维度。同名技能会加 \`__<来源>\` 后缀区分。

## 已排除

\`node_modules\`、\`.git\`、\`__pycache__\`、\`.venv\`、\`dist\`、\`build\`、\`.next\`、\`.cache\`、\`target\`、\`*.pyc\`、\`.DS_Store\`

## 重新同步

\`\`\`bash
./sync.sh                      # 同步到本目录（默认）
./sync.sh /path/to/other       # 同步到别处
cd . && git add -A && git commit -m sync
\`\`\`

调整分类：编辑 \`suites.json\`（把技能名加进对应套件的 \`skills\` 数组），重跑即可。

## 技能清单

${suitesOut.map((s) => section(s)).join("\n")}
## 来源与许可

技能来自不同出处，**版权各自归属原作者**，本仓库仅作本机备份与查阅：

- **Cloudflare 系列**：Cloudflare 官方技能包
- **Superpowers 系列**：obra/superpowers 工作流方法论
- **宝玉 \`baoyu-*\` 系列**：[宝玉](https://github.com/JimLiu) 的公开内容创作技能集
- **\`pdf\`**：Anthropic 官方技能（frontmatter 标注 Proprietary，见其 LICENSE.txt）
- **Codex 系统技能**：OpenAI 官方（skill-creator / skill-installer / plugin-creator / imagegen / openai-docs / review-agent）
- **音乐、象棋、腾讯会议、IMA、ego-browser 等**：本机自建或从公开来源整理

如原作者要求移除，请提 Issue。

## 安全说明

- 上传前已做敏感串扫描（GitHub PAT、OpenAI/AWS/Google key、私钥、硬编码密码、Bearer token）：**未发现真实凭据**。
- 但技能里含**个人路径、账号名、业务配置**，本仓库默认 **private**；转公开前请自行复核。
`;
fs.writeFileSync(path.join(DEST, "README.md"), readme);

// ---------- sync.sh ----------
const sync = `#!/usr/bin/env bash
# 按套件重新汇总本机技能 -> 本仓库
# 用法: ./sync.sh [目标目录]    默认与本脚本同目录
set -euo pipefail
HERE="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
DEST="\${1:-$HERE}"
command -v node >/dev/null || { echo "需要 node（脚本零第三方依赖）"; exit 1; }
node "$HERE/tools/build-suites.js" "$DEST"
echo "已更新 $DEST —— 记得 git add -A && git commit"
`;
fs.writeFileSync(path.join(DEST, "sync.sh"), sync, { mode: 0o755 });

console.log(`\n===== 写入 ${placed.length} 个技能 =====`);
for (const s of suitesOut) console.log(`  ${s.id.padEnd(26)} ${String(s.count).padStart(3)}  ${s.title}`);
console.log(`\n合计 ${totalFiles} 文件 / ${(totalBytes / 1048576).toFixed(1)} MB`);
