# Oribos 营销站 SPEC（交接就绪）

> **状态**：交接就绪。本文是 Oribos 营销站的唯一构建依据——后续构建会话只读本文件（不读 issue tracker），据此把站点建出来。
> **日期**：2026-10-02
> **范围**：只交付 spec；不含建站、不初始化工程、不部署。建站是下一个会话。
> **来源（provenance）**：Wayfinder 地图 [#1](https://github.com/0xnicholas/oribos-website/issues/1)（其 "Decisions so far" 是全量决策索引，并定义取代规则）+ tickets [#2](https://github.com/0xnicholas/oribos-website/issues/2) – [#16](https://github.com/0xnicholas/oribos-website/issues/16) + 技术调研报告（`docs/research/astro-tech.md` @ `research/astro-tech` `d8ff13e`）+ 域名调研报告（`docs/research/domain-and-handles.md` @ `research/domain-and-handles` `4ff64e5` + 附记 `bfe7310`）+ 三个原型（`prototype/brand-direction` @ `fd4f11b`、`prototype/hero` @ `301f3b7`、`prototype/code-samples` @ `7524499`）+ oribos-docs 品牌规范 `docs/spec/brand-visual.md`。逐条见 §12。
> **取代规则摘要**（来源冲突时按此读）：npm scope 一律 `@oribos/*`（旧 scope 作废）；单一 apex = **`oribos.dev`**（营销站 `https://oribos.dev`、文档站 `https://docs.oribos.dev`，覆盖 [#9](https://github.com/0xnicholas/oribos-website/issues/9) 的推荐序）；仓库现行名 = `0xnicholas/oribos-framework` / `oribos-docs`（旧名经 301，站面写现行名）；[#15](https://github.com/0xnicholas/oribos-website/issues/15) 取代 [#12](https://github.com/0xnicholas/oribos-website/issues/12) 的 Newsletter 槽 → footer Project = `About · GitHub`，全站无表单、无 email 收集面、无社区/社交外链；票面 corpus 为中文，站面文案一律英文。

### 写作时事实核验（2026-10-02 晚 / 2026-10-03 更名 oribos，构建前必须处理）

本 SPEC 写作期间，框架侧出现两条**晚于票据语料**的公开面变化（第 1 条仍需构建前与 owner 确认；第 2 条已由 owner 拍定），另有一条读法规则与一条基础约束（见下）。

1. **0.5.0 已发布**。核验：`npm view @balsats/core version` → `0.5.0`（2026-10-02；框架 README / ROADMAP 已翻转「已发布」口径，commit `6a1dbc7`）。**首发 scope = `@balsats/*`（七包同为 0.5.0）**，更名后 `@oribos/*` 自下一版起——切换命令的面包名以届时已上线的 scope 为准（§6.4）。而 §6 的 CTA 切换信号正是「registry 可见」——**该信号已触发**，但网站侧切换方案（install 命令 / Copy agent prompt 模式）仍未拍。构建前先拍切换与否；双版文案已备在 §6.2。
2. **品牌字面 = `Oribos`（owner 已拍「传播」，2026-10-03）**。框架侧先落品牌 / npm scope / 仓库全换（ADR-0013 末次修订「更名 oribos」+ 改名清扫 `81483bd`，仓库 = `0xnicholas/oribos-framework`），**2026-10-02 的 `balsats` 命名（原 ticket [#17](https://github.com/0xnicholas/oribos-website/issues/17)）由本条作废**；`oribos-docs` / `oribos-website` 随各自仓库动线改名（本站 = 2026-10-03，仓库原地改名 `0xnicholas/oribos-website`）。全站站面字面统一 **`Oribos`**（wordmark / H1 / hero sub / FAQ 题干与答案 / `/about` / 法务页 / footer `©` 行 / 页面 title 后缀 / OG 文本；possessive 写作 `Oribos's`）；本 SPEC 与 `CONTEXT.md` 已按此扫毕。npm 0.5.0 tarball 内的 README / description / 包名（`@balsats/*`）不可回改（新旧并存窗口 = 既有事实，不构成站面回退）。
3. **旧名/旧域一律按现行名读**：票面中的 `github.com/0xnicholas/balsa-framework` / `.../balsats-framework` → `.../oribos-framework`；`docs.balsajs.dev` / `docs.balsats.com` → `docs.oribos.dev`；旧 scope `@balsa/*` / `@balsats/*` → `@oribos/*`；旧仓库名 `balsa-website` / `balsats-website` → `oribos-website`。链接表（§2.4）已按现行名写好。
4. **基础设施约束（owner 定，2026-10-02）**：**本期不使用 Cloudflare**（owner 原话「先不要使用」）；**部署目标 = 腾讯云**（同日 owner 定）——托管形态与节点选择见 §10.1②；域名票 [#16](https://github.com/0xnicholas/oribos-website/issues/16) 已按此路径改写。
5. **域名裁决更新（owner 定，2026-10-03）**：**apex = `oribos.dev`**（营销站 `https://oribos.dev`、文档站 `https://docs.oribos.dev`）——取代 2026-10-02 的 `balsats.com`（该域从未注册，票 [#16](https://github.com/0xnicholas/oribos-website/issues/16) 未执行即作废）；`oribos.com` 已被占（NameBright 持有），不采用；marketing 与 docs 两站同根。本机实测（2026-10-03，NS 空 + RDAP 404）`oribos.dev` 可注册，下单前应以注册商复核为准。

### 标记约定

- `【终稿·勿改】`：票据锁定的英文原文，逐字照抄（含标点、em dash、大小写、换行）。
- `【可润色】`：票据授权「SPEC/构建只许润色措辞」的文案；语义、结构、题目数量不许动。
- `【SPEC 起草】`：票据没给英文、由本 SPEC 起草的初稿；可润色，但必须守所在节的铁律。
- 中文为内部结构与工程说明；站面文案一律英文（`<html lang="en">`）。

---

## 1. 一页速览

**站点是什么**：Oribos——ultralight TypeScript AI agent 框架（core 零运行时依赖）——的营销站。英文优先；IA 以 mastra.ai 为内部参照（站上永不点名）；主 CTA = GitHub + `coming soon`；社会证明只留占位；不点名竞品；数据口径 = 架构事实 + 绝对值。

**交付物**：11 个页面（首页 + `/about` + 2 法务页 + 3 用例页 + 4 关键词页）+ Astro 默认 404。技术形态固定为：Astro 静态站、`output: 'static'`、**不装任何 adapter**、产物 = 可移植的 `dist/` 静态目录（部署目标 = 腾讯云，2026-10-02 owner 定；具体托管形态与节点选择待定，见 §10.1②）。

**本 SPEC 的边界**：只出 spec，不建站。构建会话按本文件施工；本文件没写的东西 → 见 §10 fog，不许自行发明（尤其不许补文案、补数字、补链接）。

**红线速查**（构建期硬约束，逐条在正文展开）：

- **install 红线**：默认发布口径 = 0.5.0 发布前；站面不出现任何 install 类命令（`npm install` / `pnpm add` / `bun add` / `yarn add` / `npx` / `git clone` 均不可）。发布切换未拍前一直有效（§6）。
- **不点名竞品**：站面不出现任何竞品/参照站真名；所有对比只作绝对值声明。
- **数字口径**：不写 KB 数、测试数、计数式表述；可用 `0 runtime dependencies`、CI byte budget 机制（§9）。
- **RAG / evals**：不得作为「已实现」出现——全站只有两处例外（全局 FAQ 第 7 题的如实回答；Agents tab 的 processor 用例词 `evals`），关键词页正文与页内 FAQ 中两词不出现（§9）。
- **包名与链接**：包名一律 `@oribos/*`；GitHub 链接一律 `0xnicholas/oribos-*`（不写未来 org `github.com/oribos/...` 占位）。
- **无收集面**：全站无表单、无 email 收集、无社区/社交外链；无 promo 条、无站内搜索、无手动主题切换。
- **许可**：全站不得出现 `MIT`（许可 = Apache-2.0；原型里的 MIT 字样是过期占位，弃用）。

---

## 2. 全站 IA

### 2.1 页面清单（11 页 + 404；无 `/newsletter`）

| 路径 | 页面 | 依据 |
| --- | --- | --- |
| `/` | 首页 | #2 |
| `/about` | About（4 段） | #2 #13 |
| `/privacy-policy` | Privacy policy（一屏 stub） | #2 #13 |
| `/terms-of-service` | Terms of service（一屏 stub） | #2 #13 |
| `/in-product-agents` | 用例页 ×1 | #8 |
| `/operations-agents` | 用例页 ×2 | #8 |
| `/developer-infrastructure` | 用例页 ×3（H1 = `Platform & developer infra`） | #8 |
| `/ai-agent-framework` | 关键词页 ×1 | #2 #14 |
| `/ai-agents` | 关键词页 ×2 | #2 #14 |
| `/ai-workflows` | 关键词页 ×3 | #2 #14 |
| `/ai-agent-observability` | 关键词页 ×4 | #2 #14 |
| `404` | Astro 默认 404 + 一条回首页链 | #2 #12 |

### 2.2 Header（全站统一，同一组件）

组成（顺序固定）【#12 §1】：

```
Oribos（文字 wordmark，链 /） · Use cases ▾ · Docs · GitHub · coming soon pill
```

- **`Use cases ▾`** 下拉三项（标题 = 用例页 H1，逐字；描述文案【SPEC 起草·可润色】）：

| 项 | 描述（下拉内） | 目标 |
| --- | --- | --- |
| `In-product agents` | `An assistant inside the app you already run.` | `/in-product-agents` |
| `Operations agents` | `Busywork handled — with a human on the risky steps.` | `/operations-agents` |
| `Platform & developer infra` | `Primitives your product teams compose.` | `/developer-infrastructure` |

- **`coming soon` pill**【本 SPEC 定稿】：纯状态徽标，**非链接**、不带版本号，全小写（与 final CTA 的 coming soon 同口径，见 §3.1 注）；发布后版本 = fog（§10 未决①）。这是三个 CTA 切换点之三（§6.2）。
- **裁掉且不得出现**：`Pricing` / `Customers`（无页面）、`Product ▾`（只有一个产品）、`Resources ▾`（与 `Docs` 重复、上线前同指 GitHub）；关键词页 ×4 **不进 header**（只进 footer）。
- **无页内锚点导航**；**不设 promo 条**；**不做站内搜索**。
- 交互：`Use cases ▾` 桌面端为可键盘操作的下拉（`aria-expanded`、Esc 关闭、点击外部关闭）；移动端收进 hamburger（`Use cases` 折叠组 + `Docs` / `GitHub` 平铺 + pill）。
- 行为：sticky；滚动超过 **8px** 后加半透明底 + `backdrop-filter: blur(12px)`（阈值与模糊半径归 SPEC，本 SPEC 拍板；`prefers-reduced-transparency: reduce` 时退化为不透明纯色底）；不做入场动画。

### 2.3 Footer（四栏 + 左品牌块 + 法务行）

- **左品牌块**：wordmark `Oribos`（链 `/`）+ 公开 tagline（逐字，【终稿·勿改】）：

```
Ultralight TypeScript agent framework. Compose only what you use — run anywhere, no runtime baggage.
```

  排版【SPEC 起草·可润色】：第一句独立一行、字重略高；第二句换行缩进（或同段折行），两行共用 footer 文本色（非 accent）。

- **四栏**（栏名与条目逐字）：

| 栏 | 条目 | 目标 |
| --- | --- | --- |
| `Framework` | `Agent framework` | `/ai-agent-framework` |
| | `Agents` | `/ai-agents` |
| | `Workflows` | `/ai-workflows` |
| | `Observability` | `/ai-agent-observability` |
| `Use cases` | `In-product agents` / `Operations agents` / `Platform & developer infra` | 三个用例页（同 §2.2 标题） |
| `Developers` | `Docs` / `Examples` / `Architecture` | §2.4 链接表 |
| `Project` | `About` / `GitHub` | `/about` / `links.github` |

- **法务行**：`© 2026 Oribos · Apache-2.0`（逐字，【终稿·勿改】；**静态字符串**，不用构建期动态年份）+ `Privacy`（`/privacy-policy`）· `Terms`（`/terms-of-service`）。
- **不设** status/trust 行；`llms.txt` / `llms-manifest.json` **不进 footer**；footer **不写个人名义**（署名与主体信息归 `/about` 与法务页）。
- **Newsletter 槽已删除且不渲染**（#15 取代 #12）：Project 栏只有 `About · GitHub`；全站无表单、无 email 收集面。
- **launch updates 通道 = GitHub Releases**（#15）：站点侧不新增任何承接面（无 section / 表单带 / footer 槽）；「Watch → Releases only」是留给访客的动作。
- **无 Connect / 社交栏**（无 X / Discord / LinkedIn / YouTube 等任何站外社区入口）。

### 2.4 外链与「原位换链」（全站唯一常量 `src/lib/links.ts`）

所有外链只此一处派生；**切换点 = docs 站线上验收通过（#16 完成）**。切换时只改常量值，页面不改。

| 入口 | 现在（docs 站未上线） | 切换后 |
| --- | --- | --- |
| `Docs`（header + footer Developers + 首页 Resources 细带 + 各页 Learn more 的 docs 目标） | `https://github.com/0xnicholas/oribos-framework`（README 即当前文档主入口） | 原位换 `https://docs.oribos.dev` |
| `Examples` | `https://github.com/0xnicholas/oribos-framework/tree/main/examples` | 不变（上线后是否改指 docs 站 = fog，§10 未决⑥） |
| `Architecture` | `https://github.com/0xnicholas/oribos-framework/tree/main/docs/architecture` | 同上 |
| `GitHub`（header / footer / 全站 CTA） | `https://github.com/0xnicholas/oribos-framework` | 不变（org 迁移 = 发布后另起 effort；**不写** `github.com/oribos/...` 占位） |
| `Issues`（/about 与法务页的联系渠道） | `https://github.com/0xnicholas/oribos-framework/issues` | 不变 |

```ts
// src/lib/links.ts —— 全站唯一外链常量。docs 类链接在 #16 线上验收后原位换链。
export const SITE = { origin: 'https://oribos.dev' } as const;
export const LINKS = {
  github: 'https://github.com/0xnicholas/oribos-framework',
  issues: 'https://github.com/0xnicholas/oribos-framework/issues',
  docs: 'https://github.com/0xnicholas/oribos-framework',                          // → https://docs.oribos.dev
  examples: 'https://github.com/0xnicholas/oribos-framework/tree/main/examples',
  architecture: 'https://github.com/0xnicholas/oribos-framework/tree/main/docs/architecture',
} as const;
```

关键词页 `Learn more` 的四个语义深链目标 = 同一常量的扩展（映射表见 §4.4），未上线期与上线后双值都写在同一文件里。

### 2.5 互链与锚点

- **首页锚点**（供全站引用）：`#features`（feature tabs 区）、tab 锚 `#agents` `#workflows` `#harness` `#memory` `#mcp`（hash 直达并**激活对应 tab**）、`#observability`、`#social-proof`、`#use-cases`、`#resources`、`#faq`、`#get-started`。
- **首页 use-case 卡**：整卡可点、卡标题为链 → 对应用例页。
- **用例页底部** → `/#use-cases`（回首页卡片区）+ GitHub CTA。
- **关键词页** → 首页对应锚回出（映射见 §4.4）；**首页正文不反链关键词页**（入口 = footer `Framework` 栏，site-wide）。
- **`/about`** 唯一入口 = footer `Project` 栏（首页正文不放入口）；回首页 = wordmark + 一条 back-to-home 链。
- **不做面包屑**（营销页）。

### 2.6 页面 title 与 meta description

title 后缀统一 `— Oribos`；关键词页 title 为票据锁定口径（`<Keyword> for TypeScript — Oribos`）。其余为【SPEC 起草·可润色】：

| 页面 | title | meta description |
| --- | --- | --- |
| `/` | `Oribos — ultralight TypeScript AI agent framework` | `Oribos is an ultralight TypeScript agent framework: compose only what you use, run anywhere, with zero runtime dependencies.` |
| `/about` | `About — Oribos` | `About Oribos — why the project exists, who maintains it, and how code and content are licensed.` |
| `/privacy-policy` | `Privacy policy — Oribos` | `Privacy policy for the Oribos marketing site: a static site with no accounts, no cookies and no tracking.` |
| `/terms-of-service` | `Terms of service — Oribos` | `Terms of service for the Oribos website and project: pre-1.0, provided as-is, code under Apache-2.0.` |
| `/in-product-agents` | `In-product agents — Oribos` | `Embed an assistant in the app you already run — streaming, tool calls and human handoff, with no second service to operate.` |
| `/operations-agents` | `Operations agents — Oribos` | `Agents that handle the busywork around your team — MCP tools, approval gates and schedules, with a human on the risky steps.` |
| `/developer-infrastructure` | `Platform & developer infra — Oribos` | `Shared agent primitives your product teams compose — subpath imports, capability packages added one at a time, OTLP observability.` |
| `/ai-agent-framework` | `AI agent framework for TypeScript — Oribos` 【终稿】 | `An AI agent framework for TypeScript: a library, not infrastructure you operate — zero runtime dependencies, nothing new to run.` |
| `/ai-agents` | `AI agents for TypeScript — Oribos` 【终稿】 | `AI agents in TypeScript: a handful of fields, a built-in tool loop, streaming runs, and memory named per call — no hidden state.` |
| `/ai-workflows` | `AI workflows for TypeScript — Oribos` 【终稿】 | `AI workflows in TypeScript: typed steps, validated boundaries, and JSON snapshots that resume a run in another process.` |
| `/ai-agent-observability` | `AI agent observability for TypeScript — Oribos` 【终稿】 | `AI agent observability for TypeScript: spans for runs, model steps, tool calls and memory — exported to your collector over OTLP.` |

- `canonical` / `og:url` / sitemap / robots 全部从 `SITE.origin` 单点派生；`og:image` = `https://oribos.dev/og.png`（1200×630 单张静态，§5.3）；`og:title` / `og:description` 复用本表。
- 除 `og:site_name` 外不新增社交 meta（无 Twitter card 定制——不新增未锁内容）。

### 2.7 全站行为与页面壳

- `BaseLayout.astro`（`<html lang="en">`、head/meta/OG/canonical/sitemap 引用）+ `MarketingLayout.astro`（header + main + footer）。
- 亮/暗双主题均为验收面；**只随 `prefers-color-scheme`**，无手动切换按钮、无主题 cookie/localStorage（§5.4）。
- 无搜索、无 promo 条、无 cookie 横幅（因为没有 cookie）、无同意弹窗。
- 零外域请求：字体系统栈、图标内联 SVG、无第三方脚本/像素/嵌入。
- 键盘可达：header 下拉、hamburger、file tabs、copy 按钮均有可见 focus 态；`prefers-reduced-motion` 下不做平滑滚动或淡入。

### 2.8 404

Astro 默认 `404.astro` 结构 + 一条回首页链（文案【SPEC 起草·可润色】：`This page doesn't exist. Head back home.`，链 `/`）。不加入口到 docs / GitHub（默认页保持最小）。

---

## 3. 首页 section-by-section

序列（固定，照 #2，不设独立 Why-lightweight 区）：

```
Hero → Feature tabs ×5（Agents / Workflows / Harness / Memory / MCP）→ Observability
→ Social proof（占位）→ Use-case cards ×3 → Resources 细带 → FAQ ×9 → Final CTA
```

### 3.1 Hero

**文案**【终稿·勿改】：

```
H1:  Build ultralight AI agents.
Sub: Build, compose, and ship agents with zero runtime dependencies — Oribos,
     the ultralight TypeScript agent framework.
```

**CTA**：主 = `GitHub`（星形图标 + 文本，无星数；→ `links.github`）；次 = `⧉ Copy quick start`（点击复制 §7.2 hero 代码段**逐字**，复制成功态 `✓ copied`，1.2s 后复原）。CTA 不带版本号、不含 install 命令。hero 内**不另设** `coming soon` 控件——`coming soon` 由 header pill、final CTA 与 FAQ 第 2 题承担（#4/#6 锁定 hero CTA 只此两枚；#12 所称「hero 的 coming soon CTA」按站级口径读）。

**版式**【#4 D 复刻 Mastra】：

- 居中堆叠：kicker 不设（原型 kicker「TypeScript · MIT · 0 runtime dependencies」含过期许可值，**弃用**，站面不得出现 MIT）；H1 → Sub → CTA 行 → 产品窗。
- **产品窗**（宽幅卡片，位于 CTA 下方居中）：
  - 顶栏：三个窗点 + 左栏文件名（file tab 形态，标签 = `agent.ts`）+ 右侧 `trace` 徽标；**不写**「assistant — weather.ts」这类会话标题（原型时代产物，与 #6 的 `agent.ts` 命名冲突，以后者为准）。
  - 左栏：hero 代码段（§7.2，Shiki 高亮；显式行数例外——票面记 17 行，以 §7.2 代码块为准，**不许压缩**）+ copy 按钮。
  - 右栏：trace waterfall（§7.5 的真实 run 数据）。
  - 窄屏：两栏纵向堆叠（代码在上、trace 在下），窗内各自保持横向滚动。

### 3.2 Feature tabs ×5

- 区容器 id `#features`；kicker `What's in the box`【可润色，原型渲染稿】。
- tab 顺序固定：`Agents` / `Workflows` / `Harness` / `Memory` / `MCP`（MCP 占参照站 Server 位；Factory 无对应）。
- 每个 panel = claim（H3）+ 支撑项（粗体短语 + 一行）+ 1 张代码卡（§7.3，含 file tabs 与逐卡 copy）。
- 交互：一次显示一个 panel；点击 tab 切换；URL hash `#agents` / `#workflows` / `#harness` / `#memory` / `#mcp` 直达并激活对应 tab（关键词页从这些锚进入）；无 JS 时显示首个 panel（Agents），tab 按钮不报错。
- panel 内容不再重复正文（`claim` 只出现一次/panel）。

**1 · Agents**【claim 终稿；支撑项为原型渲染稿，逐条对应 #5 要点】

```
A minimal agent surface with a built-in tool loop.
```

- **A handful of fields** — name, instructions, model, tools — plus optional memory and processors.
- **One run, two consumption styles** — generate() and stream() share one output object; the tool loop is built in.
- **Structured output & dynamic arguments** — every field takes a value or a function of the request context.
- **Processors** — the one cross-cutting extension point — processInput / processOutputStep / processError.

artifact = `agent.ts`（processors 段，§7.3-1）。**不上站**：as-tool composition（进阶模型留 docs）；计数式「五字段」表述（统一用 "a handful of fields"）。M5 织入注记：`@oribos/ai-sdk` 的站面落点 = `/in-product-agents` 场景卡 1（#8 锁定）；本 tab 内容以 #5 锁定项为准，不再额外添加。

**2 · Workflows**

```
Multi-step runs that suspend, snapshot, and resume — anywhere.
```

- **A fluent builder** — foreach, parallel, branch, then — an agent is an ordinary step.
- **Suspend & resume** — a run stops at a step boundary as a JSON snapshot, resumable from another process.
- **Lifecycle events** — run-start, step-start, step-end, run-end — streamed as they happen.
- **Schema at every boundary** — start input, step input and resume data are all validated.

artifact = `workflow.ts` / `resume.ts` 双 file tab（§7.3-2）。**不上站**：非 DAG 叙事。

**3 · Harness**

```
Durable execution for humans and time.
```

- **Durable agents** — a listed tool call suspends the run; resume({ approved }) continues it.
- **Signals** — inject into a live run, wake an idle thread, or queue in order.
- **Schedules** — tick() fires what is due — storage is JSON, the occurrence function is injected.
- **@oribos/croner** — cron expressions as that injected next() fragment.

artifact = `gate.ts` / `schedule.ts` 双 file tab（§7.3-3）。术语守卫：Harness 是文档分类名，**不写** "the Harness module"。

**4 · Memory**

```
Threads, resources, and history — persistent where you choose.
```

- **Thread / resource identity** — the conversation is named per call, so one agent serves every one.
- **Message history, on by default** — the recent window is recalled into the prompt; recall() reads the rest.
- **Working memory** — an opt-in, resource-scoped record injected as a system message.
- **Storage ports** — in-memory defaults; @oribos/sqlite covers all of them.

artifact = `memory.ts` / `sqlite.ts` 双 file tab（§7.3-4）。术语守卫：不用 session / short-term / long-term memory。

**5 · MCP**

```
Serve your tools over MCP — and bring MCP tools in.
```

- **@oribos/mcp-server** — your tools served over MCP, HTTP or stdio.
- **@oribos/mcp-client** — another server's tools become ordinary Oribos tools.
- **Tools stay plain objects** — no registry — a tool's name is its key in the container.

artifact = `server.ts` / `client.ts` 双 file tab（§7.3-5）。

### 3.3 Observability（独立 section，id `#observability`）

- kicker`Observability`；H2 claim【终稿·勿改】：

```
Every run traced. OTLP when you want it.
```

- lead【终稿·勿改】：

```
Agent runs, model steps, tool calls, workflow steps, memory recall and save — traced by default.
Built-in console and memory exporters; @oribos/otlp maps Oribos spans to the GenAI semantic
conventions. A standalone agent with no tracer stays zero-overhead.
```

- 代码卡 claim【终稿·勿改】：`One tracer, distributed by the composition root.` + `app.ts`（§7.4，单文件）。
- 版式：整段横幅（band），markdown 型两栏或单栏均可，代码卡通栏展示；不配 mock 图。
- 润色注记：lead 中 "traced by default" 与 "standalone agent … zero-overhead" 的关系按 §5/FAQ 口径在润色时对齐（**保留票面原文**；不得新增「默认全部导出」类表述）。

### 3.4 Social proof（占位带，id `#social-proof`）

本 SPEC 拍板【SPEC 起草·可润色·**owner 可改判**】：

- 保留该 section 的结构位（IA 对齐），渲染为一条安静的横幅：kicker `In the open` + 一行 muted 文案：

```
No logos, no quotes, no numbers yet — Oribos is new. When there are real stories to tell,
they will live here.
```

- **硬约束**：不得伪造 logo 墙 / 引语 / 星级 / 用户数 / 案例；将来有真实素材时整带替换或并列。除此之外不新增任何 CTA。

### 3.5 Use-case cards ×3（id `#use-cases`）

- 引言【终稿·勿改】：

```
In your product. Around your team. Under your platform.
One small framework, three shapes — and nothing new to stand up.
```

- 三张卡（标题与 claim 逐字【终稿·勿改】；整卡可点、卡标题为链）：

| # | 标题 | claim（卡上英文） | 目标 |
| --- | --- | --- | --- |
| 1 | `In-product agents` | `Add an assistant to the app you already run — no second service to operate.` | `/in-product-agents` |
| 2 | `Operations agents` | `Agents that handle the busywork around your team — with a human on the risky steps.` | `/operations-agents` |
| 3 | `Platform & developer infra` | `Shared agent primitives your product teams compose.` | `/developer-infrastructure` |

- **配图 = 宿主界面 mock**（三卡各一张，通用界面、抽象化；沿用 hero 产品窗的组件语言 + 品牌 token；**不出现任何第三方名与 logo**）。内容 brief（构建期实现）：

  1. **聊天窗**：应用内嵌聊天面板 —— 用户提问气泡 + 助手回复（带流式光标感）+ 一条工具调用小签（如 `lookupOrder`）+ 顶部一个中性的应用窗点栏；无真实产品名。
  2. **团队线程 + 审批键**：团队频道线程 —— 一条来自 `@agent` 的消息 + 一张审批卡（`Refund order A-4471` + `Approve` / `Reject` 两键 + `suspended` 徽标）；成员用中性标签，不写真实姓名。
  3. **trace / 日志控制台**：简易控制台 —— 若干 span 行（run / step / tool-call / memory-recall）配状态与时长列、整体 trace 头；数据为装饰性、非对外数字口径（不放 KB / 测试数 / 星数）。

### 3.6 Resources 细带（`#resources`）

- 形态：一条细横带，三个链接（标签逐字【终稿】）：`Docs` / `Examples` / `Architecture`，目标 = §2.4 链接表（docs 站上线前同指 GitHub）。
- 引导词【SPEC 起草·可润色】：`Go deeper`（kicker），不加第二句文案。

### 3.7 全局 FAQ ×9（id `#faq`）

- 呈现：语义 `<details><summary>` 列表；**答案内不嵌任何外链**；九题顺序即页面顺序；不增删题。
- 标题【SPEC 起草·可润色】：`Frequently asked questions`。
- 铁律（九题共用）：答案 1–3 句、自包含（LLM 抽取友好）；无 install 类命令；不点名竞品；不写数字（KB / 测试数 / 计数）；包名 `@oribos/*`；术语守 `CONTEXT.md`。
- 第 2 题是 CTA 切换点之二（双版见 §6.2）。`FAQPage` JSON-LD 归 fog（§10 未决④）。

**1. `What is Oribos?`**（定义题不背发布状态）
要点：ultralight TypeScript agent framework；心智表面 = agents / tools / memory / workflows / durable execution（+ capability packages）；轻量两义 = compose only what you use（逐子路径导出、core 零运行时依赖）+ no runtime burden（不要求 DB / 队列 / 长驻进程，嵌入宿主应用）。
EN 初稿【SPEC 起草·可润色】：

```
Oribos is an ultralight TypeScript agent framework. Its surface is agents, tools, memory,
workflows and durable execution, with capability packages you add as you need them. It is
lightweight in two precise senses: you compose only what you use, and it asks for no runtime
of its own — no database, no queue, no long-running process; it embeds in the app you already run.
```

**2. `Is Oribos on npm yet?`**（CTA 切换点之二）
要点（发布前）：尚未发布；首个公开版本 = 0.5.0 单发（全框架 + 能力包一次性上架）；在此之前走 GitHub 仓库（star / watch 拿发布通知）；**答案不含任何 install 命令**。
EN 初稿（发布前）【SPEC 起草·可润色】：

```
Not yet. The first public release will be 0.5.0, with the framework and its capability
packages shipping together. Until then, the repository on GitHub is where to follow along —
star or watch it for release updates.
```

发布后版本（草案，**未拍**；随 CTA 切换方案落地）：`Yes — 0.5.0 is on npm, and every @oribos/* package ships under it.` + install 命令/下一步（**未拍前不得写入**）。

**3. `Why another TypeScript agent framework?`**
要点：只答自家轴（Lightweight 两义）；可提 CI 字节预算是「被检查的属性」的机制；不点名竞品、不做相对化或生态对比、不写任何数字。
EN 初稿【SPEC 起草·可润色】：

```
Because the useful parts of a framework should behave like a library, not a platform. Every
subsystem ships behind its own subpath export and the core carries zero runtime dependencies,
so what you don't import costs you nothing — not in the dependency tree, not in concept space.
Nothing here needs a database, a queue or a long-running process, and a CI byte budget keeps
size a checked property rather than a promise.
```

**4. `What models and providers can I use with Oribos?`**
要点：任何 AI SDK provider 生态的模型；模型实例直接从 provider 包传入（如 `@ai-sdk/openai`），无 adapter、无 registry、无 magic string；core 零依赖靠最小结构性模型契约；UI 流式互操作归 `@oribos/ai-sdk`（AI SDK UI message stream 互操作 + `useChat` 兼容 route）。
EN 初稿【SPEC 起草·可润色】：

```
Any model from the AI SDK provider ecosystem: you pass a model instance straight from a
provider package, with no adapter, no registry and no magic strings. The core stays
dependency-free by keeping a minimal structural model contract. For streaming into an AI SDK
UI, @oribos/ai-sdk provides the message-stream interop and a useChat-compatible route.
```

**5. `Does Oribos run on edge and serverless?`**
要点：架构断言（不点名平台）：无 DB / 队列 / 长驻进程要求、core 零运行时依赖、嵌入宿主应用；serverless / edge 是一等形态而非降级（平台 cron 打 endpoint 调 `tick()` 是 schedules 的规范形态）；边界句：能力包各自携带运行时要求（SQLite adapter 面向 Node；core `engines` = Node ≥ 22.13）；Bun / Deno / Workers 不承诺的立场如实传达。
EN 初稿【SPEC 起草·可润色】：

```
Yes — nothing in the architecture requires a database, a queue or a long-running process, and
the core has zero runtime dependencies. Serverless and edge deployments are a first-class
shape rather than a downgrade: a platform cron calling tick() on an endpoint is the canonical
way to run schedules. Capability packages carry their own runtime requirements — the SQLite
adapter targets Node — and the core's declared runtime is Node 22.13 or newer; Bun, Deno and
Workers are not promised.
```

**6. `Does Oribos support MCP?`**
要点：支持；`@oribos/mcp-server`（工具经 HTTP / stdio 对外）+ `@oribos/mcp-client`（他人 MCP server 的工具成为普通 Oribos tools —— 普通对象、无注册表）；随首个发布交付。
EN 初稿【SPEC 起草·可润色】：

```
Yes. @oribos/mcp-server serves your tools over MCP through HTTP or stdio, and
@oribos/mcp-client brings another server's tools in as ordinary Oribos tools — plain objects,
no registry. Both ship with the first release.
```

**7. `Does Oribos support RAG or evals?`**
要点：均未内建，如实答「没有」；两者都在框架延后清单，按真实用例信号重开（RAG 触发 = 跨会话语义检索的真实诉求；evals 触发 = CI / 线上断言式评估的真实诉求），不承诺排期；今天 eval 类断言可挂 processor；observability 已内建（tracer + span，`@oribos/otlp` 导出 GenAI semconv）。
EN 初稿【SPEC 起草·可润色】：

```
No — neither is built in. Both sit on the framework's deferred list and will be reopened
against real use-case signals, with no schedule promised. Eval-style assertions can already
hang off processors, and observability is built in: a tracer with spans, exportable to any
OTLP collector with GenAI semantic conventions.
```

**8. `Is Oribos production-ready?`**
要点：pre-1.0；站点描述的全部子系统已实现并核验，但 0.x 保留破坏性变更；1.0 不排期（自 1.0 起 storage port 走 additive-only）；给「锁定版本 + 跟 release」的务实建议——不劝退、不承诺。
EN 初稿【SPEC 起草·可润色】：

```
Pre-1.0: everything this site describes is implemented and verified, but 0.x releases reserve
the right to make breaking changes, and 1.0 is not scheduled. Pin the version you build
against and follow releases — storage ports become additive-only from 1.0.
```

**9. `What's the license?`**
要点：Apache-2.0。
EN 初稿【SPEC 起草·可润色】：

```
Apache-2.0. Code and examples are licensed under it; the license covers code, not the name.
```

### 3.8 Final CTA（id `#get-started`）

【SPEC 起草·可润色】；硬约束：不带版本号、不含 install 命令、不用对比性表述。

```
H2:  Build ultralight AI agents.
Sub: The repository is open today — star or watch it to follow releases. The first public
     version is coming soon.
CTA: ★ GitHub（主） + `coming soon` pill（纯状态徽标，非链接）
```

发布后版本（草案，**未拍**）：主 CTA 与文案随 §6.2 的切换方案整体替换。用例页/关键词页复用本组件的**同一份文案与结构**（组件名建议 `FinalCta.astro`）。

---

## 4. 逐页大纲

### 4.1 `/about`

结构（4 段，借参照站段位）：

```
H1: About Oribos
sub: <公开 tagline 逐字复用 footer 品牌块那一行>
## Our story
## Who's behind it
→ 收尾邀请带（GitHub · Issues）
```

**`## Our story`**【终稿·勿改】（两段的英文原文；段落折行按阅读排版，词句逐字；原词源首句已于 2026-10-03 更名时删除——Oribos 无词源、不发明）：

```
The project exists for one bet — that an agent framework should be a library inside your
application, not a platform your application moves into. So every subsystem ships behind its
own entry point, the core carries no runtime dependencies, and nothing here needs a database,
a queue or a long-running process.

Oribos is the umbrella brand. The framework came first, the documentation site is next, and
future subprojects live alongside them — under one package scope and one domain.
```

**`## Who's behind it`**【终稿·勿改】：

```
Oribos is built in the open on GitHub and maintained by [@0xnicholas](https://github.com/0xnicholas).
There is no company behind it and no team page to read: the repository's issues are where
questions, bug reports and disagreement land.

Code and examples are licensed Apache-2.0 — that license covers code, not the name. Site copy
and graphics are © 2026 Oribos, all rights reserved.
```

**收尾邀请带**【终稿·勿改】（替参照站的 careers CTA；带 GitHub 与 Issues 两个链接）：

```
Read the code, open an issue.
Star or watch the repository to follow releases.
```

**页面规则**：

- `/about` 只吃「项目自身面」（故事 / 谁在做 / 治理 / 许可）；技术两轴（compose only what you use / no runtime burden）、发布状态与 `pre-1.0` 叙事**不复述**——单一真相源 = docs Introduction + hero 的 `coming soon` pill + 全局 FAQ 第 2 题。
- 不出现 ADR 编号/链接、issue 号、内部术语；故事只作立场重述。
- 无年份、版本号、计数（`pre-1.0` 是状态词可写；`© 2026` 是法务行不受影响）。
- 署名到 handle `@0xnicholas`（链 GitHub 主页）；不写实名与邮箱；footer `©` 行保持项目名义。
- 伞形品牌段只讲已有事实（framework + docs 站），不承诺第三个子项目。
- **裁掉**：Team grid、融资/城市、careers CTA、「本网站仓库是干嘛的」自述、迁移叙事（竞品红线）。
- 入口 = footer `Project` 栏；回首页 = wordmark + 一条 back-to-home 链。

### 4.2 `/privacy-policy` 与 `/terms-of-service`

两页共同口径（一屏级「最小诚实 stub」）：

- 只借结构位、不借 SaaS 合同内容：**不写**管辖地 / 责任限额 / 终止条款（无托管服务、无账号时写进去是虚构）。
- **不点名托管平台**（部署目标 TBD），统一泛指 `our hosting provider`。
- 联系渠道**只承诺 GitHub Issues**（无 SECURITY.md、私有漏洞报送未开，不得承诺安全报送流程）。
- 生效日期写法【本 SPEC 拍板】：静态字符串，格式 `Last updated: <Month D, YYYY>`，构建时写入**站点上线日**；不得用构建期动态日期（避免页面自称更新过）。
- 许可分工（同 `/about`）：代码与示例 = Apache-2.0；站点文案与图形 = 版权保留（`© 2026 Oribos, all rights reserved`）。

**`/privacy-policy`**【终稿·勿改】（`<生效日期>` 按上面的静态字符串落值；链接目标按现行仓库名）：

```
# Privacy policy
Last updated: <生效日期>

Oribos's marketing site is a static site. It has no accounts, sets no cookies and runs no
tracking, and we do not collect or store personal information about you.

Our hosting provider serves the site and may keep standard server logs — IP address, user
agent, requested URL — for security and operations, under its own policies. We do not sell or
share personal data, so there is nothing here to opt out of.

If you reach us through GitHub, what you send is handled by GitHub under GitHub's terms.
Questions and requests: open an issue in the
[repository](https://github.com/0xnicholas/oribos-framework/issues).

If analytics or an email subscription is added later, this page will say exactly what is
collected and by whom before it goes live.
```

> 注：末段的 "or an email subscription" 分支已被 #15 关闭（不做 email 订阅）；为守「只许润色」锁，**原文照抄**。若要删去该分支，需 owner 一句确认（§10.2 ⑥）。

**`/terms-of-service`**【终稿·勿改】：

```
# Terms of service
Last updated: <生效日期>

This site is provided as-is, without warranties of any kind. It describes an open-source
project that is pre-1.0: what you read here can change.

Code and examples in the Oribos project are licensed under Apache-2.0 — that license covers
code, and does not grant rights to the Oribos name or logo. Site copy and graphics are
© 2026 Oribos, all rights reserved.

Links to third-party sites are here for convenience; those sites are governed by their own
terms. Questions: open an issue in the
[repository](https://github.com/0xnicholas/oribos-framework/issues).
```

**Privacy 触发清单**（analytics / 任何收集面落地后必须补，SPEC 记成 checklist、**不预写空架**）：

- 新版本必须补：**收集什么**（即使匿名 / 无 cookie 也照写）+ **处理者**（统计服务 / 第三方）+ **保留期** + **opt-out 形态** + **联系渠道** + 更新生效日期；若引入第三方表单，加「第三方处理者」一节。
- **Terms 只在出现托管服务或账号时才动**——纯统计不触发（email 订阅已排除）。
- 该清单同时是部署 / analytics fog 的下游验收点（§10 未决③）。

### 4.3 用例页 ×3

**统一骨架**（照参照站，客户故事槽 → 场景卡）：

```
H1（= 首页卡片标题）+ tagline（1–2 行）
→ 场景卡 ×3（场景名 + 2–3 句「用 Oribos 怎么搭」+ 用到的子系统/包名）
→ GitHub CTA 带（替 Contact sales 位；复用 §3.8 `FinalCta` 组件）
→ 全局 FAQ ×9（逐字复用 §3.7，不增删）
→ final CTA
```

- 页头图 = **一张三页共用的抽象图**（照参照站三页同图）：暖纸底 + 琥珀几何的「轨道 / span」意象，含品牌 token 配色；**无文案、无 logo、无第三方名**；1600×600 左右的横幅（构建期实现）。
- **不置代码段**；**不另设社会证明占位带**（页面级案例槽由场景卡占据）。
- 场景卡 = 卡片单元：场景名 + 2–3 句 + 包名行（`→` + 内联 code 风格的包名列表，用 `·` 分隔）。
- 页底：`← All use cases`【SPEC 起草·可润色】→ `/#use-cases`。

#### `/in-product-agents`

H1：`In-product agents`【终稿·勿改】
tagline【终稿·勿改】：`Answer your users, act inside your product, hand off to a human.`

**场景卡 1 · `Answer, streamed into your UI`**【终稿·勿改】

```
agent.stream() on the server, the AI SDK message-stream route on the client, thread /
resource memory so each user picks up where they left off.
→ @oribos/core/agent · @oribos/core/memory · @oribos/ai-sdk
```

**场景卡 2 · `Act, through your own APIs`**【终稿·勿改】

```
Your endpoints become tools — plain objects with schemas — and multi-step flows compose as
workflows where every boundary is validated.
→ @oribos/core/tools · @oribos/core/workflows
```

**场景卡 3 · `Hand off, with the run on hold`**【终稿·勿改】

```
Approval-listed tool calls never execute: the run suspends, and resume({ approved })
continues it — even from another process.
→ @oribos/core/durable-agent · @oribos/sqlite
```

#### `/operations-agents`

H1：`Operations agents`【终稿·勿改】
tagline【终稿·勿改】：`Bring your tools in over MCP, gate risky actions on approval, wake the agent on a schedule.`

**场景卡 1 · `Bring your tools in, unchanged`**【终稿·勿改】

```
MCP servers you already run stay where they are; their tools arrive as ordinary Oribos tools —
plain objects, no registry.
→ @oribos/mcp-client
```

**场景卡 2 · `A human on the risky step`**【终稿·勿改】

```
Approval-listed calls suspend instead of executing — approve to continue, reject and the model
replans; the snapshot is JSON and survives the process.
→ @oribos/core/durable-agent · @oribos/sqlite
```

**场景卡 3 · `Wake it on a schedule, not a worker`**【终稿·勿改】

```
tick() fired by a platform cron is the first-class shape; @oribos/croner supplies the cron
expressions, signals wake or inject into a thread.
→ @oribos/core/schedules · @oribos/core/signals · @oribos/croner
```

#### `/developer-infrastructure`

H1：`Platform & developer infra`【终稿·勿改】
tagline【终稿·勿改】：`Ship primitives other teams build on — each team installs only what it uses.`

**场景卡 1 · `Primitives, not a platform`**【终稿·勿改】

```
Teams import only the subpaths they need and add capability packages one at a time; the
composition root is optional and a bare new Agent() stays first-class.
→ @oribos/core/* · capability packages added one at a time
```

**场景卡 2 · `Into the observability you already run`**【终稿·勿改】

```
Oribos traces its own minimal spans; @oribos/otlp exports them with GenAI semantic conventions
to your collector — one tracer handed down by the app.
→ @oribos/core/observability · @oribos/otlp
```

**场景卡 3 · `Publish agents as shared infrastructure`**【终稿·勿改】

```
Serve an MCP endpoint other teams and systems call — and compose one team's agent as a tool on
another's.
→ @oribos/mcp-server · as-tool composition
```

> 包名行说明：票面为中文的片段（`capability packages 逐个装` / `as-tool 组合`）按站面英文渲染为 `capability packages added one at a time` / `as-tool composition`【可润色】；其余包名行逐字。

### 4.4 关键词页 ×4

**统一骨架**（四页一致）：

```
title: <Keyword> for TypeScript — Oribos      （【终稿】口径；各页字符串见下）
H1:    <词面 + 主张>                          （各页逐字锁定）
→ 2–4 段论证（小标题 + 1–3 句）
→ 一条 `Learn more` 文字链【标签逐字 `Learn more`】
→ 页内 FAQ 4–5 题（与全局 9 题零重叠；答案 1–3 句自包含、无外链）
→ 共用 final CTA（§3.8 组件）
```

- 目标词 = slug 词面 + `TypeScript` 限定；**不写 Platform 类词**；四轴互不重复：framework = 构成与边界 / agents = 一个 agent 的解剖 / workflows = 确定性编排与恢复 / observability = 一次运行里发生了什么。
- **不置代码段**（锚指首页 tab）；四页**不互链**（入口 = footer `Framework` 栏）。
- 正文约 500–700 词（篇幅由论证需要决定）。
- **铁律复核**：不点名竞品；不写数字（含计数式）；无 install 命令；**RAG / evals 一词不出现**；页内 FAQ 与全局零重叠。
- 回首页锚【SPEC 判定·owner 可改判】：`/ai-agent-framework` → `/#features`；`/ai-agents` → `/#agents`；`/ai-workflows` → `/#workflows`；`/ai-agent-observability` → `/#observability`。链接文案【SPEC 起草·可润色】：`See how it works →`。

**`Learn more` 映射**（收在 `links.ts`；切换点 = docs 站线上验收 #16）：

> **已知窗口（2026-10-03）**：框架仓的改名 commit（`81483bd`）已裁未推——`oribos-framework` 的 live `main` 仍是旧 scope/旧 README 字面，因此 §Agents / §Workflows 两个 README 锚在该 commit 推送前会落在 README 顶部（旧拼写已被退役名单门禁，不能回指）；推送后按 live README 复核一次。

| 页 | 上线后 | 未上线期 |
| --- | --- | --- |
| `/ai-agent-framework` | `https://docs.oribos.dev/docs`（Introduction） | framework README = `https://github.com/0xnicholas/oribos-framework` |
| `/ai-agents` | `https://docs.oribos.dev/docs/concepts/agents` | README §Agents（锚按现行 README 标题派生；构建时读 live README 复核） |
| `/ai-workflows` | `https://docs.oribos.dev/docs/concepts/workflows` | README §Workflows（同上） |
| `/ai-agent-observability` | `https://docs.oribos.dev/docs/concepts/observability`（docs P1，未落地则指 docs 根） | `https://github.com/0xnicholas/oribos-framework/blob/main/docs/architecture/observability.md` |

#### `/ai-agent-framework`

`title: AI agent framework for TypeScript — Oribos`【终稿】
H1【终稿·勿改】：`AI agent framework — everything you need, nothing you have to run.`

**A library, not infrastructure you operate**
> Oribos is a library you call from the app you already run. No database, queue, or long-running process is required: storage ports default to in-memory implementations, and adapters are a deliberate choice rather than a prerequisite.

**Compose only what you use**
> Every subsystem ships behind its own subpath export — agents, tools, memory, workflows, observability, durable execution, signals, schedules — and the core carries zero runtime dependencies. Capability packages such as @oribos/mcp-server, @oribos/sqlite and @oribos/otlp are added one at a time, only when a job calls for them.

**A small surface you can hold in your head**
> An agent is a handful of fields, a tool is a plain object, and processors are the framework's single cross-cutting extension point. Model instances come straight from the AI SDK provider ecosystem — no adapters, no registries — and multi-agent systems are built by wrapping one agent as a tool on another, with no supervisor protocol to learn.

**页内 FAQ**

**1. `What does "zero runtime dependencies" actually mean?`**
> The core package ships with no third-party runtime dependencies; model instances arrive from AI SDK provider packages you already chose, and schemas stay in the library you already use. Your dependency tree gains Oribos and nothing hidden behind it.

**2. `Do I have to run anything alongside my app?`**
> No. There is no database, queue, or long-running process to operate; storage ports default to in-memory implementations and swap to adapters only when you want persistence.

**3. `Can I adopt Oribos one piece at a time?`**
> Yes. Each subsystem is its own subpath export and capability packages are installed individually, so a first agent can be a single import. What you don't import costs nothing — not in the dependency tree, not in concept space.

**4. `How do multiple agents fit together?`**
> By composition: wrap one agent as a tool on another, and delegation becomes an ordinary tool call. The core has no supervisor protocol and no sub-agent concept to adopt.

**5. `Can one agent behave differently per user or request?`**
> Every configuration field is a dynamic argument — either a value or a function resolved per execution against the request context — so per-user behavior doesn't fork your agent code.

#### `/ai-agents`

`title: AI agents for TypeScript — Oribos`【终稿】
H1【终稿·勿改】：`AI agents — a handful of fields, a built-in loop, and no hidden state.`

**An agent is a small object**
> Name, instructions, model, tools — plus optional memory and processors. The model instance comes straight from an AI SDK provider package, so there is no adapter or registry between your code and the provider.

**The loop is built in, and it streams**
> When the model answers with a tool call, the loop executes the tool and feeds the result back to the model; a failing tool returns an error result the model can recover from. stream() yields the run's chunks as they happen, and generate() is the same run collapsed to its terminal values — one code path, so the two always agree.

**Tools are plain objects you already know how to write**
> A tool is described by its fields and found by its key; schemas are Standard Schema dual interfaces, so Oribos validates the model's arguments with the schemas you already use and sends the corresponding JSON Schema to the provider.

**Memory is identity you name per call**
> Thread and resource are passed per call and the agent itself carries no conversation state, so one agent serves every conversation. Message history is on by default; working memory is an opt-in, resource-scoped record the model updates through a framework-attached tool.

**页内 FAQ**

**1. `Do I need to write my own agent loop?`**
> No. generate() and stream() run a built-in loop that executes tool calls and feeds results back, up to a configurable step cap; a tool failure comes back as an error result the model can recover from.

**2. `How does streaming work?`**
> The run is an async iterable of chunks you can consume as they arrive, and the same object carries the terminal values. generate() is that run collapsed to its result.

**3. `Can one agent serve many users and conversations?`**
> Yes — thread and resource are named per call and the agent holds no conversation state. Memory storage goes through a port with an in-memory default.

**4. `How is tool input validated?`**
> Schemas are Standard Schema dual interfaces: Oribos validates the model's arguments with them and sends the corresponding JSON Schema to the provider.

**5. `How do I add guardrails, redaction, or rate limiting?`**
> Processors: ordered hooks (processInput, processOutputStep, processError) are the framework's single cross-cutting extension point and run in declaration order.

#### `/ai-workflows`

`title: AI workflows for TypeScript — Oribos`【终稿】
H1【终稿·勿改】：`AI workflows — typed steps, validated boundaries, and runs that survive a restart.`

**Steps that promise what they take and what they give back**
> A step declares its input and output schemas; the builder composes steps with then, parallel, branch and foreach. Every boundary — start input, step input, resume data — is validated before your code runs.

**Agents join as steps, not instead of them**
> A step can call an agent, run deterministic code, or both: use a model where you need reasoning, and a plain function where you don't. The workflow is what turns a multi-step process into something repeatable.

**Suspend, resume, and move the run to another process**
> ctx.suspend() unwinds a run with a JSON snapshot at a step boundary; resuming later — even from another process — continues from that snapshot. Snapshots go through a storage port that defaults to memory and takes adapters when persistence matters.

**Runs you can watch while they happen**
> start() yields lifecycle events at run and step boundaries, and the run settles to success, failed or suspended — progress is legible without inspecting internal state.

**页内 FAQ**

**1. `When should I use a workflow instead of an agent?`**
> Use a workflow when the process is defined up front and order, data flow, or validation matters; use an agent when the task is open-ended and the model should choose the next step. They compose: a workflow step can call an agent.

**2. `Do workflows need a database or a queue?`**
> No. The snapshot store defaults to an in-memory implementation and is swapped for an adapter — such as @oribos/sqlite — only when you want snapshots to outlive the process.

**3. `What happens if my process restarts mid-run?`**
> Runs suspend at step boundaries with a JSON snapshot, so with a persistent store you can resume the run from another process.

**4. `Can steps run in parallel?`**
> Yes: parallel runs steps together and foreach maps over a collection with controlled concurrency, while branch routes between paths.

**5. `How do I pass data between steps?`**
> Each step's output is the next step's typed input, and every boundary is validated against its schema before your code runs — a malformed value fails at the boundary, not deep inside a step.

#### `/ai-agent-observability`

`title: AI agent observability for TypeScript — Oribos`【终稿】
H1【终稿·勿改】：`AI agent observability — see what actually ran, in the stack you already use.`

**Spans for the things that actually ran**
> Every agent run, model step, tool call, workflow run and step, and memory recall or save opens a span. The span model is Oribos's own minimal one — the framework doesn't require an OpenTelemetry SDK in order to trace.

**A tracer you hand down once**
> Assemble a tracer at the composition root and every agent built through the app traces with no per-agent wiring. A standalone agent with no tracer stays fully first-class: zero overhead, no span objects.

**Export to where your telemetry already lives**
> Console and memory exporters are built in; @oribos/otlp maps Oribos spans to GenAI semantic conventions and exports them to any OTLP-compatible collector. A resumed run opens a new span in the same trace, so one human interaction stays one story.

**页内 FAQ**

**1. `What gets traced in a Oribos run?`**
> Agent runs, model steps, tool calls, workflow runs and steps, and memory recalls and saves each open a span, with parent-child structure that keeps a run readable.

**2. `Can I send traces to my existing OpenTelemetry backend?`**
> Yes — @oribos/otlp exports Oribos spans with GenAI semantic conventions to any OTLP-compatible collector.

**3. `Where do traces go if I don't configure anything?`**
> Oribos ships console and memory exporters, so spans can be watched during development without running a collector; nothing is exported unless you assemble a tracer with an exporter.

**4. `Does tracing cost anything when I don't want it?`**
> No: a standalone new Agent() with no tracer opens no span objects, so an untraced run stays as small as it looks.

**5. `Does Oribos ship a dashboard or a hosted observability service?`**
> No. Oribos produces spans and exports them to the stack you operate; there is no Oribos-side service in the loop.

---

## 5. 品牌与视觉

**总原则**（#3 裁决 A「继承暖纸」）：landing 与 docs 站同族一体，**逐字继承** oribos-docs `docs/spec/brand-visual.md` §2.2 的 token 集；伞形品牌沿占位策略首发（文字 wordmark + 单字形 favicon + 单张静态 OG）；真相源 = docs 规范，SPEC 不另立 token 表。

### 5.1 权威 token 集（值须与 docs §2.2 **逐字节一致**）

命名沿用 docs 的 `--sl-*`（landing 不用 Starlight，这些就是普通 CSS 变量；**不重命名**——两站对比才能机械化）。定义在 `src/styles/global.css`，亮/暗两套：

```css
/* dark（prefers-color-scheme: dark） */
--sl-color-white: hsl(35, 15%, 97%);
--sl-color-gray-1: hsl(35, 12%, 92%);
--sl-color-gray-2: hsl(35, 8%, 77%);
--sl-color-gray-3: hsl(35, 7%, 58%);
--sl-color-gray-4: hsl(35, 7%, 38%);
--sl-color-gray-5: hsl(35, 8%, 24%);
--sl-color-gray-6: hsl(35, 10%, 16%);
--sl-color-black: hsl(30, 12%, 10%);
--sl-color-accent-low: hsl(36, 45%, 20%);
--sl-color-accent: hsl(36, 82%, 55%);
--sl-color-accent-high: hsl(38, 72%, 78%);

/* light（默认） */
--sl-color-white: hsl(30, 14%, 12%);
--sl-color-gray-1: hsl(35, 15%, 16%);
--sl-color-gray-2: hsl(35, 12%, 24%);
--sl-color-gray-3: hsl(35, 10%, 38%);
--sl-color-gray-4: hsl(35, 10%, 55%);
--sl-color-gray-5: hsl(35, 15%, 80%);
--sl-color-gray-6: hsl(35, 20%, 93%);
--sl-color-gray-7: hsl(35, 30%, 98%);
--sl-color-black: hsl(36, 40%, 99%);
--sl-color-accent-low: hsl(38, 85%, 90%);
--sl-color-accent: hsl(36, 88%, 33%);
--sl-color-accent-high: hsl(36, 84%, 23%);
```

- 关键实测值：亮 accent = `#9e630a`（hsl 36, 88%, 33%；对暖纸底 4.86:1）；暗 accent-high = `#efd29f`（hsl 38, 72%, 78%；11.88:1）。
- **贴线理由连同数值一起锁**：亮色 accent 刻意贴 WCAG AA 线（4.6–5.0:1），**不是待优化项**——实施/维护中不得「顺手」调深或调浅；数值变更须先动 docs 规范。
- **派生量不手写**：`--sl-color-text-accent`（暗 = accent-high、亮 = accent）、`--sl-color-text-invert`、`--sl-color-bg-accent` 沿 Starlight 原映射在 landing 复刻（landing 无 Starlight，按同一语义手写映射）。
- `--sl-color-gray-7` 仅亮色语义（暗色无此槽，省略）。
- Tailwind v4 接入：品牌 token 只定义一次；`@theme inline` 里以 `var(--sl-color-*)` 建立工具类别名（如 `--color-accent: var(--sl-color-accent)`），**不得出现第二份字面色值**。

### 5.2 字体与图标（D①）

- **字体 = 系统字体栈，零字体文件**（与 docs 一致；禁外部 CDN 字体、不引入自托管字体）：
  - 正文：`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  - 代码：`ui-monospace, "SF Mono", Menlo, Consolas, monospace`
  - `--sl-font` / `--sl-font-mono` 槽位保留，供品牌字体一次替换（伞形品牌 effort 的接入点）。
- **图标 = 手挑内联 SVG**（无图标库、无 sprite）：星形（GitHub CTA）、copy、chevron（下拉）、hamburger、返回箭头。`fill/stroke: currentColor`、随文本色；装饰性图标 `aria-hidden="true"`，语义按钮配 `aria-label`。

### 5.3 favicon / OG / theme-color（占位策略首发）

- **favicon**：`public/favicon.svg`，单字形「b」，透明底，亮暗双值随 `prefers-color-scheme` 切换（亮 `#9e630a` / 暗 `#efd29f`）；无发明图形。替换来源 = 伞形品牌 effort（替换成本 = 换资产、不改结构）。
- **OG**：单张静态 `public/og.png`，1200×630，文字 wordmark + 公开 tagline、暖中性底（沿 docs §3.1 的占位形态）；**全站通用，不做逐页生成**（C①）。`og:image:width/height` = 1200/630。
- **`theme-color` meta**：亮 / 暗双值 = 各自主题 `--sl-color-black` 的解析值（亮 `#fdfdfb` / 暗 `#1d1a16`），用 `<meta name="theme-color" media="(prefers-color-scheme: …)">` 两条输出。
- 三个占位资产（favicon / og / theme-color）随构建产出，是验收对象。

### 5.4 暗色模式

- **只随 `prefers-color-scheme`**：亮 / 暗两套均为验收面（沿 docs §3.3 精神）；**不引入手动切换按钮**、无 `.dark` class、无 localStorage/cookie 主题状态（照 #10 报告 §5——少一个可访问性与状态持久化问题）。
- 代码高亮保留 Shiki 双主题对（§8.5）；语法色不随品牌色板走，仅代码块外框吃 token（沿 docs §3.3 的代码面口径）。

### 5.5 防漂移与验收（CI 门）

- **对比度门（WCAG AA）**：移植 docs 的 16 项对比度审计（亮暗 × 八对：正文、标题、链接 × 页面底，正文与链接 × nav 面，accent-low chip，按钮反字，muted meta；docs 原表的「侧栏面」在 landing 映射为 nav/footer 面），落 `scripts/check-contrast.mjs` 进 CI；**退出码作硬门**，非人工声明。
- **两站色值对比防漂移**：CI 里把 landing 解析出的 token 值逐项对比 oribos-docs 的权威集（docs `brand-visual.md` §2.2 / 其 `src/styles/global.css`），**任一漂移即红**。真相源在 docs；docs 若变更，landing 跟随（机制实现归构建会话，要求锁在这里）。
- 无 CLS；**零外域请求**（无字体/脚本/像素/嵌入的第三方子资源，`form action` 同样视为外链——本项目无表单）。

---

## 6. CTA 与发布口径

### 6.1 CTA 语义总表

| 位置 | 形态/文案 | 行为或目标 |
| --- | --- | --- |
| header `GitHub` | 文字链 | `links.github` |
| header `coming soon` | 纯状态 pill，**非链接** | 无行为（切换点之三） |
| hero 主 CTA | `GitHub`（星形图标 + 文本，**无星数**） | `links.github`（切换点之一） |
| hero 次 CTA | `⧉ Copy quick start` | 复制 hero 代码段**逐字**（§7.2） |
| feature / observability 代码卡 | `⧉ copy` | 复制**当前可见文件**逐字（§7.1） |
| resources 细带 | `Docs` / `Examples` / `Architecture` | §2.4 链接表 |
| final CTA（首页 + 用例页 + 关键词页共用） | `★ GitHub`（主）+ `coming soon` pill | `links.github` |
| 用例页底部 | `← All use cases` + GitHub CTA 带 | `/#use-cases` / `links.github` |
| `/about` 收尾带 | GitHub · Issues | `links.github` / `links.issues` |
| 法务页 | `open an issue in the repository` | `links.issues` |

**「Copy quick start」语义（锁定）**：复制内容 = hero 代码段逐字（含空行；票面记 17 行的显式例外）；不是 install 命令、不是 README 全文；点击后按钮短暂显示 `✓ copied`。发布后的模式（如「Copy agent prompt」）维持在 fog（§10 未决①）。

### 6.2 三个切换点 × 双版文案

切换机制（框架侧定义）：**切换信号 = registry 可见**（更名前核验命令 = `npm view @balsats/core version` 得 `0.5.0`；`@oribos/*` 自下一版起），不是 tag 落地、也不是 Release notes 写好。**该信号在 2026-10-02 已触发**（见文首「写作时事实核验」第 1 条）。

| # | 位置 | 发布前（**默认口径，票面锁定**） | 发布后（草案，**未拍**，切换时替换） |
| --- | --- | --- | --- |
| 1 | hero 主 CTA | `★ GitHub`（次 CTA 保持 `Copy quick start`） | 主 CTA 可换为 install 类命令 或「Copy agent prompt」模式（候选；GitHub 保留为入口之一）；命令/措辞随切换方案拍板，**未拍前不得写入任何 install 命令** |
| 2 | 全局 FAQ 第 2 题答案 | `Not yet. The first public release will be 0.5.0, with the framework and its capability packages shipping together. Until then, the repository on GitHub is where to follow along — star or watch it for release updates.`（§3.7 第 2 题） | `Yes — 0.5.0 is on npm. It shipped as `@balsats/*`; `@oribos/*` starts with the next release.` + 下一步（install 命令 **未拍前不得写入**；命令面包名以届时已上线的 scope 为准） |
| 3 | header `coming soon` pill | `coming soon`（全小写、非链接、不带版本号） | 候选：版本徽标（如 `v0.5.0`）/ 移除徽标——**未拍** |

- 三处之外的任何文案**不得**顺手带发布状态（避免出现第四、第五个切换点）；meta description 等已按此原则写成无状态文案（§2.6）。
- 发布后仍不得出现：星数、下载数、KB/测试数、竞品名。

### 6.3 install 红线（发布前全站有效）

- 站面（含代码段、注释、文案、meta）**不出现任何 install 类命令**：`npm install` / `npm i` / `pnpm add` / `pnpm install` / `bun add` / `yarn add` / `npx` / `git clone` 等一律不可；**链接指向 GitHub / README 可以，命令本体不可以**。
- 构建期硬门：对 `dist/` 做模式扫描（上述命令 + `install` 关键词的邻近匹配），命中即失败。
- 代码段仍可展示 `import '…'` 层面的 subpath 组合——这正是「compose only what you use」的展示面（§7）。

### 6.4 发布状态事实核验（写作时）

- 2026-10-02 核验：`npm view @balsats/core version` → `0.5.0`（七包同为 0.5.0，**首发 scope = `@balsats/*`**）；框架 README / ROADMAP 已按「已发布」收口（commit `6a1dbc7`；更名后 README 补「`@oribos/*` 自下一版起」口径）。**切换口径注意**：registry 里已上线的是 `@balsats/*`，`@oribos/*` 尚未上线——切换方案拍板时，install 命令该写哪个 scope 需按当时的实际发布状态判。
- 因此 **§6.2 的两个发布后版本会自动成为「事实当前态」**——构建会话开工前必须与 owner 确认：① 是否执行切换；② 若切换，采用哪种 CTA 形态与命令措辞。未获确认前，按发布前文案施工且不写 install 命令。

---

## 7. 代码示例（终稿）

### 7.1 展示形式：file tabs（A · 复刻参照站）

- 每张代码卡 = **文件 tab 条**（左：文件名按钮；如 `server.ts` / `client.ts`）+ copy 按钮（右）；一次显示一个文件；切换用站点自有 `CodeTabs`（§8.7-A①）；语法高亮 Shiki。
- **文件清单**（第二 file tab 仅在有多能力可展示时保留）：
  - Workflows → `workflow.ts` / `resume.ts`；Harness → `gate.ts` / `schedule.ts`；Memory → `memory.ts` / `sqlite.ts`；MCP → `server.ts` / `client.ts`；Agents、Observability 单文件。
  - hero 窗 = `agent.ts` 单文件（不同容器，见 §3.1）。
- **行数约定**：五 tab 与 observability 段均 ≤10 行；**hero 段 = 显式行数例外**（票面记 17 行；hero 窗内独立容器，2026-10-02 定，以 §7.2 代码块为准）——**SPEC 与构建都不得「顺手」压缩**。
- **copy 语义**：每卡 copy = 当前可见文件逐字；hero「Copy quick start」= hero 段逐字（§6.1）。
- 代码不换行、横向滚动（`overflow-x: auto`）；不显示行号；不显示输出/终端（弃用形态 B/C/D 留档可复查）。
- 全段 `@oribos/*`、无 install 命令；import 层必须能看出 subpath 组合（「compose only what you use」的展示面）。

### 7.2 hero · `agent.ts`（显式行数例外；逐字，不得压缩）

```ts
import { openai } from '@ai-sdk/openai';
import { Agent } from '@oribos/core/agent';
import { createTool } from '@oribos/core/tools';
import { z } from 'zod';

const weather = createTool({
  description: 'Looks up the weather for a city.',
  inputSchema: z.object({ city: z.string() }),
  execute: ({ city }) => ({ city, celsius: 18 }),
});

const agent = new Agent({ name: 'assistant',
  model: openai.chat('gpt-4o-mini'), tools: { weather } });

const run = agent.stream('What is the weather in Paris?');
for await (const chunk of run) {
  if (chunk.type === 'text-delta') process.stdout.write(chunk.textDelta);
}
```

### 7.3 五张 feature tab 代码段（均 ≤10 行）

**1 · Agents —— `agent.ts`**

```ts
import { Agent } from '@oribos/core/agent';

const redactPii = {
  processInput: ({ messages }) => ({ messages: scrub(messages) }),
  processOutputStep: ({ step }) => audit(step),
};

const agent = new Agent({ name, instructions, model, processors: [redactPii] });

const run = agent.stream('Summarise this ticket.');
```

**2 · Workflows —— `workflow.ts`**

```ts
import { createWorkflow } from '@oribos/core/workflows';

const workflow = createWorkflow({ id: 'expense-approval', inputSchema: report, outputSchema: receipt })
  .foreach(checkItem, { concurrency: 2 })
  .parallel([policyCheck, budgetCheck])
  .then(draftMemo)
  .then(approvalGate)
  .commit();
```

**2 · Workflows —— `resume.ts`（第二 tab）**

```ts
// another process, later — the whole state is one JSON snapshot
const outcome = await workflow.createRun({ runId: 'run-1' }).resume({
  step: 'approval-gate',
  resumeData: { approved: true },
});
```

**3 · Harness —— `gate.ts`**

```ts
import { createDurableAgent } from '@oribos/core/durable-agent';

const durable = app.durableAgent({ agent, approval: { tools: ['issueRefund'] } });
const out = durable.stream('Please refund order A-4471.');

if ((await out.finishReason) === 'suspended') {
  await durable.resume(out.runId, { approved: true });   // the held call now executes
}
```

**3 · Harness —— `schedule.ts`（第二 tab）**

```ts
import { cron } from '@oribos/croner';

await schedules.save({
  id: 'morning-sweep',
  ...cron('0 9 * * *', { timezone: 'UTC' }),   // the injected next() fragment
  target: { agent: 'desk', input: 'write the daily digest' },
});
```

**4 · Memory —— `memory.ts`**

```ts
import { Memory, createInMemoryStore } from '@oribos/core/memory';

const memory = new Memory({ storage: createInMemoryStore() });
const agent = new Agent({ name, instructions, model, memory });

await agent.generate('Should I bring a rain jacket?', {
  memory: { thread: 'trip-lisbon', resource: 'user-42' },   // identity is per call
});
```

**4 · Memory —— `sqlite.ts`（第二 tab）**

```ts
import { createSqliteStorage } from '@oribos/sqlite';

const storage = createSqliteStorage({ path: 'oribos.db' });   // one adapter, all four ports

const app = createApp({
  storage: { memory: storage.memory, durableAgent: storage.agentRunSnapshots },
});
```

**5 · MCP —— `server.ts`**

```ts
import { createMcpServer } from '@oribos/mcp-server';

const server = createMcpServer({ name: 'weather', version: '0.5.0', tools: { weather } });

export default server.fetch;   // the same tools over MCP — HTTP or stdio
```

**5 · MCP —— `client.ts`（第二 tab）**

```ts
import { createMcpClient } from '@oribos/mcp-client';

const client = await createMcpClient({ transport: { type: 'http', url } });

const agent = new Agent({ name, model, tools: client.tools });   // remote tools, as plain tools
```

### 7.4 Observability —— `app.ts`（独立 section，单文件）

```ts
import { createApp } from '@oribos/core';
import { createTracer, consoleExporter } from '@oribos/core/observability';
import { createOtlpExporter } from '@oribos/otlp';

const app = createApp({
  tracer: createTracer({ exporters: [consoleExporter(), createOtlpExporter({ url })] }),
});

const agent = app.agent({ name, instructions, model });   // one tracer, every agent
```

### 7.5 trace waterfall（hero 右栏；真实 run 截取）

卡片头（meta，逐字）：

```
trace 4f3c9a… · gpt-4o-mini · 2 steps · 1.62s · 214 in / 62 out tokens
```

行数据（轨道按 0–100% 归一；`left%` / `width%` 为渲染坐标；**只改标签不改结构**）：

| lane | left% | width% | 右侧列 | 条色 |
| --- | --- | --- | --- | --- |
| `input` | 0 | 7 | `41ms` | accent |
| `agent-step #1` | 7 | 85 | `1.51s` | accent |
| `tool-call weather` | 12 | 14 | `38ms` | 轨迹绿 55% |
| `tool-result` | 26 | 8 | `2ms` | 轨迹绿 55% |
| `text-delta ×14` | 34 | 48 | `streamed` | accent |
| `agent-step #2` | 82 | 10 | `96ms` | accent |
| `finish stop` | 92 | 8 | `stop` | accent |

卡底小结（逐字）：`chunk.type === 'text-delta' — every span from the same run`

- 颜色：常规 span = `--sl-color-accent`；tool/nested 条 = **轨迹绿**（站点自有辅助色，仅用于 trace/tool 状态，不扩散为品牌色）——亮 `hsl(140, 45%, 32%)` / 暗 `hsl(140, 40%, 55%)`（原型实测值，本 SPEC 登记；owner 可改判）。
- 渲染：纯静态构建期内容（不是 live 数据、不请求任何接口）。
- **可复现步骤**（span 模型或跨度变化时重跑重截）：
  1. `cd ../oribos-framework`
  2. `OPENAI_API_KEY=… pnpm --filter @oribos/example-minimal-agent start`
  3. 取 console exporter 的 span 输出；修剪 = trace id 截短（`4f3c9a…`）、时长取整（如 `1.62s`）；只改标签不改结构。

---

## 8. 技术方案

### 8.1 钉版本与环境

| 项 | 版本/取值 | 说明 |
| --- | --- | --- |
| `astro` | **7.3.5**（精确钉） | 与文档站同版本（一次升级跑两站） |
| `tailwindcss` | **4.3.3** | CSS-first；无 `tailwind.config.js` |
| `@tailwindcss/vite` | **4.3.3** | 官方唯一 Tailwind v4 接入方式；`vite.plugins` 注入 |
| `@astrojs/sitemap` | **3.7.4** | 官方集成 |
| `vite` | 以 `astro@7.3.5` 的解析为准（`^8.0.13` 区间） | **显式写入 package.json**，不让工具链替你挑 |
| Node | **≥ 22.12.0**（构建环境） | `astro@7.3.5` 的 engines（npm ≥9.6.5 / pnpm ≥7.1.0） |
| pnpm | 采用 pnpm（建议 `packageManager: pnpm@10.33.2`，与 docs 一致） | — |

- **不装**：`@astrojs/tailwind`（legacy，只服务 Tailwind 3）、任何 adapter（见 8.2）、`@astrojs/rss`（无 blog）、`@astrojs/mdx`（不需要）、`astro-expressive-code`（A① 不用）、图标库、字体包、任何统计/表单/社交 SDK。
- **不要用 `astro add` 取版本**（历史事故：`@tailwindcss/vite` 的宽 peer 区间会把 Vite 版本 hoist 上来压过 Astro 自带版本）；直接手写 `package.json` 与 `astro.config.mjs`。

### 8.2 输出模式与「部署目标 TBD」的技术前提（硬约束）

- `output: 'static'`，**不装任何 adapter**。官方原文：静态站不需要 adapter；adapter 产的是服务端脚本，装上它 `dist/` 就不再是可移植静态产物，部署目标事实上被锁死。
- 交付物 = **可移植的 `dist/` 静态目录**。**部署目标 = 腾讯云**（2026-10-02 owner 定；不含 Cloudflare）——腾讯云上的具体托管形态（对象存储静态站 / EdgeOne 等，候选待核实选型）与节点选择留在地图 fog（§10 未决②）。
- 任何为某功能引入 adapter / SSR 的改动 = 违反本 SPEC。

### 8.3 内容组织：build-time content collections 承载锁定文案

- 用 Astro 7 现行形态：`src/content.config.ts` + `defineCollection()` + `glob()` loader + `astro/zod` 的 zod；查询 `getCollection()` / `getEntry()`。
- **不用 live collections**（`src/live.config.ts` 必须配 adapter，与 8.2 冲突）。
- 至少四类集合（命名归构建会话，**要求** = 下列锁定文案全部成为带 schema 的数据，不散在 `.astro` 里、不重复两处）：

```ts
// 形状示意（非逐字实现）
const faq = defineCollection({ /* q, a, scope: 'global' | 'page', page?, order */ });
const features = defineCollection({ /* id, tab, claim, bullets[{lead,text}], files[{name,code}] */ });
const useCases = defineCollection({ /* slug, title, claim, tagline, scenarios[{title, body, packages[]}] */ });
const keywordPages = defineCollection({ /* slug, title, h1, sections[{heading, body}], learnMoreKey, faqIds */ });
```

- 页面本身仍用 `.astro` 手写布局（营销版式定制，不做数据驱动页面生成）。

### 8.4 `site` 单点 / sitemap / robots / llms.txt / i18n

- **origin 单点**：`src/lib/site.ts` 的 `SITE.origin = 'https://oribos.dev'`；`astro.config.mjs` 的 `site`、canonical、sitemap、robots.txt 的 sitemap 行全部由它派生（照 docs 站的单点模式）。
- **sitemap**：`@astrojs/sitemap@3.7.4` 装并启用。
- **robots.txt**：`public/robots.txt` 静态文件（`Allow: /` + 指向 `https://oribos.dev/sitemap-index.xml`）。
- **llms.txt**：`public/llms.txt` 静态文件（`public/` 原样进 `dist/`）；v1 = 页面清单（title + 绝对 URL）；具体形态仍属 fog（§10 未决④）。
- **不装 RSS**（无 blog，本期不预留依赖）。
- **i18n 预留但不启用**：

```js
i18n: { locales: ['en'], defaultLocale: 'en', routing: { prefixDefaultLocale: false } }
```

  英文页留在 `src/pages/` 根；**不建 `zh/` 目录、不装翻译依赖**；将来加中文 = 新增 `src/pages/zh/**`，现有 URL 一个不动。

### 8.5 代码高亮（Shiki 双主题）

- `astro@7.3.5` 内置 Shiki 4，无需额外依赖；主题对 = `github-light` / `github-dark`，配置在 `markdown.shikiConfig.themes`。
- 双主题 CSS：类名用 **`.astro-code`**（不是 Shiki 文档的 `.shiki`），CSS 变量前缀 `--astro-code-*`；两套值用 `@media (prefers-color-scheme: dark)` 切换（与全站暗色策略一致）。
- 注意：`.astro` 内嵌的 `<Code />`（来自 `astro:components`）**不继承** `shikiConfig` —— 组件里要把同一对主题显式传入，或包一层薄封装；要求 = 站内每一段代码都是同一对主题、同一套 CSS 变量。
- 语法色不随品牌色板走；仅代码块外框吃品牌 token（沿 docs §3.3 代码面口径）。

### 8.6 工程结构（示意）

```
astro.config.mjs            site/integrations/vite/markdown/i18n（§8.4/8.5）
src/
├── layouts/                BaseLayout.astro（head/meta/OG/canonical）· MarketingLayout.astro（header+footer）
├── components/             Header · Footer · FeatureTabs · CodeTabs · TraceWaterfall · FaqList
│                           · UseCaseCard · ScenarioCard · FinalCta · icons/
├── content/                锁定文案数据（faq / features / use-cases / keyword-pages …）
├── content.config.ts       集合定义
├── lib/                    site.ts（origin 单点）· links.ts（外链单点，§2.4）
├── styles/global.css       品牌 token 层（§5.1）+ Tailwind 入口
└── pages/                  index · about · privacy-policy · terms-of-service · in-product-agents
                            · operations-agents · developer-infrastructure · ai-agent-framework
                            · ai-agents · ai-workflows · ai-agent-observability · 404
public/                     favicon.svg · og.png · llms.txt · robots.txt
scripts/                    check-contrast · check-tokens · check-copy · check-links · check-origin · check-telemetry
```

### 8.7 四项决策（锁在 SPEC；均为报告 §13 的推荐项，**owner 可改判**）

| # | 决策 | 落定值 | 一行理由 |
| --- | --- | --- | --- |
| A | file tabs 实现 | **① 自写 `CodeTabs.astro`**：纯 Shiki + 一小段 vanilla `<script>`，零新依赖 | 与原型成品形态一致；Expressive Code 的交互式 tab 组查无可用官方特性（只给外观），引它反而多一个构建期依赖。**构建前按报告 §12⑤ 复核一次**（`gh issue view 22 --repo expressive-code/expressive-code --json state,stateReason` + 文档站 groups 页仍应 404） |
| B | Markdown 处理器 | **① 保持 Astro 7 默认 Sätteri** | 当前无 remark/rehype 插件需求；`remark` 系插件在 Sätteri 下不运行，只有确实要装时才显式切 `@astrojs/markdown-remark` |
| C | 逐页 OG | **① 不进本期**（单张静态 1200×630 通用） | 首期收益只在社交分享卡；逐页生成（构建期 satori/resvg）留在 SEO fog |
| D | 字体 / 图标 | **① 系统字体栈 + 手挑内联 SVG 图标** | 字体继承 docs 已锁（禁 CDN）；图标零库零 sprite，与「轻」一致 |

### 8.8 构建期质量门（要求锁定；脚本组织归构建会话）

`pnpm verify` 至少串起：

1. `astro build` 通过，产物 = `dist/`（无服务端脚本）。
2. **check-contrast**：16 项 AA 审计（§5.5）。
3. **check-tokens**：landing token 值 vs oribos-docs 权威集逐项一致（漂移即红）。
4. **check-copy**：红线扫描——install 类命令 / 竞品名 / `MIT` / 旧 scope `@balsa/*`·`@balsats/*` / RAG·evals 越线（§9）/ 计数式数字表述 / 旧仓库名与旧域（名单单点在 `link-rules.ts`）。
5. **check-links**：站内链接与 `/#…` 锚可解析；外链为现行仓库名（无 `balsa-framework` / `balsats-framework` / `balsajs.dev` / `balsats.com` 残留）。
6. **check-origin**：`site` 单点；canonical / sitemap / robots 与其一致。
7. **check-telemetry**：`dist/` 零外域子资源、零表单、零 cookie。
8. 人工抽检（构建会话收尾）：亮/暗两主题逐页走查、键盘可达、无 CLS、hero trace 与代码段逐字对上 §7。

---

## 9. 数字与 claims 政策（红线）

### 9.1 可说（全部为架构事实/机制，按票面锁定写）

- `0 runtime dependencies`（core 包零第三方运行时依赖；精确写法，别改成 "minimal"）。
- 每个子系统一个 subpath export；不 import 不付出代价（依赖树与概念面都算）。
- 不需要 database / queue / long-running process；嵌入宿主应用、不接管它。
- `createApp` 是可选薄装配点；processor 是唯一横切扩展点；tool = plain object；as-tool 组合（多 agent）。
- MCP 双向已实现并核验（server HTTP/stdio + client）；随首个发布交付。
- observability 内建：tracer + span + console/memory exporter；`@oribos/otlp` 按 GenAI semconv 导出。
- **CI byte budget 的机制**（"size is a checked property"），不写数值。
- 版本仅在三处出现：FAQ 第 2 题（0.5.0）、MCP 代码段的字面 `version: '0.5.0'`、FAQ 第 5 题的 Node 运行时边界；`pre-1.0` 是状态词可写。
- 绝对值声明（如 "no database, no queue"）——但**只作绝对值**。

### 9.2 不可说（构建期扫描目标）

- **任何 KB / gzip / 体积数字、测试计数、包数量、星数、下载数、用户数、基准对比**；以及**计数式表述**（写 "a handful of fields"，不写 "five fields"）。
- **竞品名 / 参照站真名**；不做相对化、不做生态对比、不做「比 X 轻」句式。
- **RAG / evals 作为已实现能力**。全站仅两处例外：全局 FAQ 第 7 题（如实答「没有」）与 Agents tab 的 processor 用例词 `evals`（框架 README 同口径）；**关键词页正文与页内 FAQ 中两词不出现**。
- **部署平台名**（Vercel / Cloudflare / Netlify / Workers 等不出现在站面；FAQ 第 5 题只答架构事实）。
- **install 类命令**（发布切换未拍前一律不出现，§6.3）。
- `MIT` 字样（许可 = Apache-2.0）。
- `/about` 故事里的年份、版本号、计数（`© 2026` 法务行与 `pre-1.0` 不受影响）。
- 排期承诺（1.0 不排期；RAG / evals 不承诺时间）。

### 9.3 表述纪律

- 数字/事实的**单一真相源** = 框架 README / 本 SPEC 的锁定块；构建会话不得从别处「补」事实。
- 术语守本仓库 `CONTEXT.md`：**capability package**（不叫 plugin / integration）、**harness**（文档分类名，不是模块）、**memory**（不用 session / short-term / long-term）、**as-tool composition**（不用 supervisor / sub-agent）、用例页 / 场景卡 / 关键词页 / 全局 FAQ / 页内 FAQ 各按其定义使用。
- 英文文案统一美式拼写与 em dash 风格（照锁定块，如 "Summarise this ticket." 是锁定代码注释，逐字保留）。
- 包名一律 `@oribos/*`；产品名 = `Oribos`（词首大写，含 wordmark）；域名 / scope / 仓库名小写 `oribos`。

---

## 10. 部署 TBD 与 fog 清单

### 10.1 fog（地图遗留的未决项，构建会话不得自行拍板）

1. **0.5.0 后的 CTA 切换与上线节奏**：三处切换点 + 发布后文案（§6.2）；切换信号已触发（registry 可见），但形态（install 命令 / Copy agent prompt）未拍。
2. **部署目标 = 腾讯云**（2026-10-02 owner 定；不含 Cloudflare）：余下的 = 腾讯云上的具体托管形态（对象存储静态站 / EdgeOne 等，候选待核实选型）与**节点选择**——**大陆节点需 ICP 备案**（上线后 footer 还需按法定要求展示备案号，届时触发 SPEC 修订）、香港 / 海外节点免备案；技术前提已锁（§8.2）。
3. **analytics / 访问统计**：未定；落地即按 §4.2 触发清单改 Privacy（匿名无 cookie 统计同样要披露）；Terms 只在出现托管服务或账号时才动。email 订阅分支已由 #15 关闭。
4. **SEO 细化**：逐页 OG 生成（C① 留雾）、FAQPage JSON-LD、`llms.txt` 的具体形态。
5. **i18n 中文内容**：本期只有 `en`；将来 `src/pages/zh/**`。
6. **与 docs 站的互链余量**：上线后 `Examples` / `Architecture` 是否改指 docs 站对应页（词页 `Learn more` 映射已定，见 §4.4）。

### 10.2 owner 可改判的 SPEC 判定（已拍，集中登记）

| # | 位置 | 判定 |
| --- | --- | --- |
| ① | §3.4 | social proof 占位带的文案（`No logos, no quotes, no numbers yet…`） |
| ② | §4.4 | 关键词页→首页的锚映射（framework 指 `/#features`；observability 指 `/#observability`）与链接文案 |
| ③ | §7.5 | 轨迹绿辅助色（`hsl(140,45%,32%)` / `hsl(140,40%,55%)`）——站点自有，不入 docs token 集 |
| ④ | §2.2 | header 下拉项描述文案；§2.3 footer tagline 排版；§2.6 非关键词页 title/meta |
| ⑤ | §3.3 | observability lead 中 "traced by default" 与零开销句的润色对齐（票面原文保留，仅措辞） |
| ⑥ | §4.2 | Privacy 末段 "or an email subscription" 分支是否删（#15 已关闭该分支；删除需 owner 确认） |
| ⑦ | §3.6 / §3.8 | resources 细带引导词、final CTA 的 sub 文案 |
| ⑧ | §2.2 / §4.1 / §9.3 | 品牌传播的形态判定（wordmark 与 `©` 行用「Oribos」；possessive 写作 "Oribos's"；`/about` 原词源首句**已删**——Oribos 无词源、不发明，2026-10-03 owner 拍）——owner 可改判 |

---

## 11. Out of scope（沿地图，构建会话不得扩边）

- **docs 站**：独立工程（`oribos-docs`，`https://docs.oribos.dev`），内容量远超 landing；本站只做链接与外链常量。
- **blog / 内容引擎、books**：需要持续供稿，后续阶段再议（因此不装 RSS、不设 `/blog`）。
- **`/newsletter` 与任何 email 订阅面**（#15 裁定排除）；**站外社区 / 社交入口**（X / Discord / LinkedIn / YouTube 等一概不设；公开面只留 GitHub）。
- **参照站有、Oribos 结构上不适用的页面**（逐页裁定，不建）：`/pricing`、`/customers`、`/careers`、`/contact`、`/hackathon`、`/mcp-registry`、`/legal/dpa`、`/sales-agents`、`/marketing-agents`、`/company-brain`、`/financial-services`、`/healthcare`、`/studio`、`/factory`、`/agent-builder`、`/ai-agent-deployment`、`/ai-gateway`、`/platform-observability`、`/rag-pipeline`。
- **伞形品牌实物**（真 logo / wordmark / 品牌字体）：归伞形品牌 effort；本站只留接入点（替换成本 = 改 token + 换资产）。
- **竞品对比 / 替代方案页**：任何形式的点名对比不做。
- **服务端能力**：任何需要 adapter / SSR / API route 的功能（含运行时 OG 生成、live collections、搜索服务）。
- **建站本身**：本 SPEC 的范围只到「可交接的 spec」。

---

## 12. 附录：provenance index（每票 → 决定了什么）

| 票 | 标题 | 决定了什么（本 SPEC 的消费点） |
| --- | --- | --- |
| [#1](https://github.com/0xnicholas/oribos-website/issues/1) | Wayfinder map: Oribos 营销站 spec | 目标、红线、取代规则、域名裁决（apex `oribos.dev`）、scope 刷新、更名记录、fog/out-of-scope 索引 |
| [#2](https://github.com/0xnicholas/oribos-website/issues/2) | 页面清单与首页 section 序列 | 11 页清单；首页 8 段序列；数字口径；M5 织入方式 |
| [#3](https://github.com/0xnicholas/oribos-website/issues/3) | 品牌方向 | A 继承暖纸；伞形品牌占位策略；token 真相源 = docs §2.2 + 两站 CI 对比 |
| [#4](https://github.com/0xnicholas/oribos-website/issues/4) | Hero 区文案与视觉形式 | D 复刻 Mastra；H5 + 动词三连 sub；GitHub + Copy quick start；0.5.0 前无 install 命令 |
| [#5](https://github.com/0xnicholas/oribos-website/issues/5) | Feature tabs 内容映射 | 五 tab claim/支撑项/artifact 形态；术语守卫；≤10 行代码；RAG/evals 禁宣 |
| [#6](https://github.com/0xnicholas/oribos-website/issues/6) | 首页代码示例 | 形式 A file tabs；hero h1（17 行例外）；trace 真实 run 截取；五 tab + observability 终稿；第二 file tabs |
| [#7](https://github.com/0xnicholas/oribos-website/issues/7) | FAQ 问题清单 | 全局 9 题与答案要点/铁律；npm 题 = 切换点之二；FAQPage JSON-LD 留雾 |
| [#8](https://github.com/0xnicholas/oribos-website/issues/8) | Use-case cards 内容 | 三张卡标题/claim/tagline；卡片区引言；宿主界面 mock；用例页骨架；9 张场景卡正文 |
| [#9](https://github.com/0xnicholas/oribos-website/issues/9) | 域名与 handle 调研 | 调研方法论与未验证项；（推荐序被 #1 域名裁决覆盖——不可采用） |
| [#10](https://github.com/0xnicholas/oribos-website/issues/10) | Astro 营销站技术方案 | 版本钉法、无 adapter、collections、Shiki、sitemap/RSS/llms、i18n、OG 路线；A–D 待拍项 |
| [#11](https://github.com/0xnicholas/oribos-website/issues/11) | 整合营销站 SPEC.md | 本文件 |
| [#12](https://github.com/0xnicholas/oribos-website/issues/12) | 导航与页脚 IA | header/footer 组成；原位换链表与切换点；互链/锚点；行为；切换点之三（pill） |
| [#13](https://github.com/0xnicholas/oribos-website/issues/13) | /about 与 legal 页内容 | 4 段结构与英文正文；署名到 handle；许可分工；法务 stub；Privacy 触发清单 |
| [#14](https://github.com/0xnicholas/oribos-website/issues/14) | 关键词页 ×4 内容 | 四页终稿（title/H1/段落/页内 FAQ）；Learn more 映射；不互链、不置代码段 |
| [#15](https://github.com/0xnicholas/oribos-website/issues/15) | 订阅渠道与 /newsletter 页 | 不做 email 订阅；无社区/社交外链；Newsletter 槽删除（取代 #12）；launch updates = GitHub Releases |
| [#16](https://github.com/0xnicholas/oribos-website/issues/16) | 上域：oribos.dev 注册 + zone + DNS + 证书 + 线上验收 | 「原位换链」的切换点（docs 站线上验收）；本 SPEC 不执行 |

**非票据来源**：

- 技术调研报告：`docs/research/astro-tech.md` @ `research/astro-tech` `d8ff13e`（§13 = 本 SPEC 的技术输入；§12 = 复核命令）。
- 域名调研报告：`docs/research/domain-and-handles.md` @ `research/domain-and-handles` `4ff64e5` + 附记 `bfe7310`。
- 原型：`prototype/brand-direction` @ `fd4f11b`（A 继承暖纸）；`prototype/hero` @ `301f3b7`（D + H5）；`prototype/code-samples` @ `7524499`（形式 A + h1 + 真实 trace）。
- 品牌规范：`../oribos-docs/docs/spec/brand-visual.md`（§2.1 色板 / §2.2 权威 token 集 / §3.1 占位资产 / §3.3 基础视觉面）。
- 术语：本仓库 `CONTEXT.md`（capability package / harness / 用例页 / 场景卡 / 关键词页 / 全局 FAQ / 页内 FAQ / 维护者署名 / 许可分工）。
- 框架事实面：`../oribos-framework` README / ROADMAP / examples（2026-10-02 核验；0.5.0 已发布）。

---

## 13. 构建会话交接

**开工前必做（一条确认 + 一条复核）**：

1. 与 owner 确认 §6.4 的发布切换问题（0.5.0 已上 npm；预/后双版文案在 §6.2，fog §10.1①）。
2. 按 §8.7-A 的复核命令跑一次 Expressive Code 现状检查（期望：无可用官方 tab 组）。

**资产位置**：

- 本仓库当前分支 = `spec/landing`（含 `CONTEXT.md`、`AGENTS.md`、`docs/agents/`、`prototype/brand-direction/` 与本文 `docs/SPEC.md`）。
- 其余原型在各自分支：`prototype/hero`、`prototype/code-samples`；调研报告在 `research/astro-tech`、`research/domain-and-handles`。
- 框架仓库：`../oribos-framework`（现行名、已发布 0.5.0）；文档站：`../oribos-docs`。
- **原型是 throwaway**：可作视觉参照与文案/代码核对源，**不得折进真站**（浮动切换条、prototype 专属文案、MIT 字样、`assistant — weather.ts` 窗标题一律不进站）。

**建议施工顺序**：脚手架（§8.1 钉版本 + §8.2 静态输出）→ `site.ts` / `links.ts` / token 层 → content collections 装入 §3/§4/§7 的锁定文案与代码 → 布局与组件（Header/Footer/FeatureTabs/CodeTabs/TraceWaterfall/FaqList/ScenarioCard/FinalCta）→ 11 页 + 404 → §8.8 质量门 → 亮暗逐页走查。

**完成定义**：§8.8 全部通过；所有页面与文案按本 SPEC 逐字落地（`【终稿·勿改】` 一字不动）；§9 红线扫描零命中；开工前确认已闭环。
