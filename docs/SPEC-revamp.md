# Oribos 营销站改版 SPEC（交接就绪 · v2）

> **状态**：交接就绪。本文是营销站**改版施工**的唯一依据——后续施工会话只读本文件（不读 issue tracker），据此把已建站点（`build/01-skeleton` @ `481a89b`，148 例 verify 全绿）改造成本文件描述的形态。
> **日期**：2026-10-07
> **范围**：全站 11 页 + 404 一次改完——**视觉与内容布局全重做**（非换肤）：内容布局对齐 mastra.ai 的密度（结构对齐，站上永不点名），视觉语言 = 瑞士国际主义风格（方向 C · 琥珀延续）。发布口径收单一「已发布」态。
> **来源（provenance）**：Wayfinder 地图 [#33](https://github.com/0xnicholas/oribos-website/issues/33)（其 "Decisions so far" 是全量决策索引）+ tickets [#34](https://github.com/0xnicholas/oribos-website/issues/34) – [#43](https://github.com/0xnicholas/oribos-website/issues/43) + 两份调研（`docs/research/mastra-layout.md` @ `research/mastra-layout` `5cef80f`、`docs/research/swiss-style.md` @ `research/swiss-style` `cbaaf69`）+ 两个原型（`prototype/swiss-direction` @ `eea5d5e`、`prototype/hero-form` @ `7360ac4`）+ 资产落点 `build/01-skeleton` @ `481a89b`（[#41](https://github.com/0xnicholas/oribos-website/issues/41)）。逐条见 §11。
> **取代规则摘要**（冲突时按此读）：本文件取代 v1 SPEC（`docs/SPEC.md` @ main `3a63488`）中一切与本文件冲突处；**未在本文件出现的逐字文案与代码，真相源 = `build/01-skeleton` @ `481a89b` 的 content collections 与页面源码，逐字沿用，不重抄进本文件**。v1 中的 `Balsats` / `@balsats/*` 字面一律按现行名读（`Oribos` / `@oribos/*`）。v1 §9 红线继续有效，除本文明示解除的两项（install 红线 → 双槽位纪律 §4.6；版本三处口径 → 单一常量 §4.6）。

### 标记约定

- `【终稿·勿改】`：施工会话逐字落地（含标点、em dash、大小写、换行），一字不许动。**本文件新起草的文案同样标 `【终稿·勿改】`**——起草权来自 [#40](https://github.com/0xnicholas/oribos-website/issues/40)，锁定对象是施工会话；owner 改判走 §9 登记，不走施工会话润笔。
- `沿用 build`：逐字沿用 `build/01-skeleton` 对应 content collection / 组件，本文件只指路。
- 中文为内部结构与工程说明；站面文案一律英文（`<html lang="en">`）。

---

## 1. 一页速览

**改版是什么**：已建站点的一次全站重做。三条主线——

1. **视觉**：瑞士国际主义（网格 + 盒式 hairline 模块 + 单强调色），token 层全量重做（§2）；营销站自此**自立品牌 token 真相源**，两站 CI 色值对比门禁解除、`brand-visual.md` 继承关系终止（§2.9）。
2. **内容布局**：首页 8 区 → **9 区**（§3）；关键词页 ×4 对标 mastra 同 slug 产品页重排、新增 hero 引言段与页内 FAQ 扩编（§5.2–5.3）；用例页 ×3 骨架定稿、零内容增量（§5.1）。
3. **发布口径**：单一「已发布」态——双版切换机制作废；主 CTA = **隐藏 payload 的 chip 式 agent prompt CTA**（§4）；header pill = 版本徽标链 Releases。

**不变的底座**：Astro 静态站、`output: 'static'`、无 adapter、content collections 承载锁定文案、零第三方子资源、只随 `prefers-color-scheme` 的双主题、16 项 WCAG AA 审计 CI 硬门（v1 §8 技术方案整体沿用，除本文件明示的 token 层与门禁改动）。

**红线速查**（v1 §9 全文有效，仅两处修订，详见 §7）：无客户案例、不写数字宣称、无 RAG/evals 宣称、无 blog/newsletter/订阅面、不点名竞品、零第三方子资源——**全部沿旧**。install 类命令由「全站禁止」改为**双槽位纪律**（§4.6）。

---

## 2. 视觉与品牌 token（真相源 = 本节）

### 2.1 token 集 v2（亮 / 暗两套，定义在 `src/styles/global.css`）

命名弃用 v1 的 `--sl-*`（其存在理由「与 docs 机械化对比」随 §2.9 分岔死亡），改用语义 token（与原型 `prototype/swiss-direction` / `prototype/hero-form` 一致）。**hex 为规范值**（与 #41 资产同源），hsl 为推导注记。Tailwind v4 `@theme inline` 以 `var(--*)` 建别名，**不得出现第二份字面色值**。

```css
:root {
  --bg: #ffffff;        /* 页面底 */
  --bg2: #fafaf8;       /* 次级面（卡底 / 区带底） */
  --ink: #161513;       /* 正文/标题墨色（中性暖灰黑，非纯黑） */
  --ink2: #5f5f5c;      /* 次级文字 */
  --ink3: #98988f;      /* muted meta / mono 标签 */
  --line: #e6e6e0;      /* hairline（1px 盒线、分隔线） */
  --acc: #9e630a;       /* 琥珀强调 = hsl(36,88%,33%)；对 --bg 4.86:1 */
  --acc-h: #7a4c07;     /* hover 加深（同色相不换相） */
  --acc-lo: #f4e8d3;    /* 强调底色（低饱和琥珀底） */
  --acc-inv: #ffffff;   /* 强调底上的反字 */
  --code-bg: #fafaf8;   /* 代码块底 */
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #101010;      /* 中性黑（Carbon 式换值：角色不变只换值） */
    --bg2: #171716;
    --ink: #f2f1ee;
    --ink2: #b3b1aa;
    --ink3: #74726b;
    --line: #2a2925;
    --acc: #ea9f2e;     /* = hsl(36,82%,55%)；#41 记录值，规范值 */
    --acc-h: #f5b456;   /* 暗 hover = 提亮（≈hsl(36,89%,65%)） */
    --acc-lo: #3a2c14;
    --acc-inv: #101010;
    --code-bg: #151513;
  }
}
```

- **暗 accent 漂移已裁**（#41 遗留）：规范值 = `#ea9f2e`（#36 记录值；favicon / OG 资产已按此落，**施工期不重导出**）。原型 CSS 实写的 `#eaa03c` 是实现漂移，施工按 `#ea9f2e` 修正。
- 派生量不手写：`::selection` = `--acc` 底 + `--acc-inv` 字；focus 见 §2.5。
- **调色纪律**：琥珀是全站**唯一**品牌强调色相——链接、主按钮、focus、wordmark 方块点、tab 选中下划线、trace bar 完成态同一色相；灰阶中性微暖，不引入第二色相。功能语义色另设（trace 状态绿先例，不扩散为品牌色）。

### 2.2 网格与纵向节奏

- 桌面 **12 栏** / 移动 **4 栏**；gutter 桌面 **32px** / 移动 **16px**；容器宽 **1200px**。
- 内容入**盒式模块**：1px hairline（`--line`）成盒，零圆角、零阴影——「模块网格可见」是本方向的骨架手法（Müller-Brockmann 盒式模块）。
- 纵向节奏 = **24px 倍数**（区距 96/144、区内 24/48/72，按密度取值）；间距沿 Tailwind `--spacing: 0.25rem` 动态派生，**不手写第二套间距字面**。
- 真基线网格不做（css-rhythm 仍是 WD，浏览器零实现——#35 报告结论），行距倍数纪律即基线替身：所有行高 = 4px 倍数（§2.3 表内锁定）。

### 2.3 字阶八档（1:1.333，锁死）

| token | size/line-height | 用途 |
| --- | --- | --- |
| `--t-xs` | 13/20 | mono 标签、meta、chip 副行、事实带 |
| `--t-base` | 16/24 | **正文基值**（节奏与行距的基准档） |
| `--t-lg` | 21/28 | 卡正文、lead |
| `--t-xl` | 28/36 | H3 / 卡标题 |
| `--t-2xl` | 38/44 | H2 / 页头引言 |
| `--t-3xl` | 50/56 | H2 大号（关键词页 H1 备选档） |
| `--t-4xl` | 67/72 | **hero H1** |
| `--t-5xl` | 89/96 | 限量（OG wordmark 级；站面默认不用） |

- 正文 = 16/24（16 vs 18 之争已随 #36 实物定 16）；组件**禁任意字号**——字号只许出自本表 token（入 `check-*` 门禁）。
- 字重纪律：**400 / 600 两档**，不用中间字重。

### 2.4 字体（推翻 v1 D① 系统字体栈）

- **自托管 Inter 可变字重**，latin 子集 woff2（48KB，OFL 1.1）。文件已在 `public/fonts/inter-latin-wght-normal.woff2` + `inter-OFL.txt`（#41 随资产先行落 `build/01-skeleton`）。
- 接线：`@font-face`（`font-weight: 100 900` 可变轴声明）+ `<link rel="preload">` + `font-display: swap` + `unicode-range` latin 子集；栈 = `'InterVar', system-ui, -apple-system, sans-serif`（系统栈仅回退）。
- mono 维持系统栈（`ui-monospace, 'SF Mono', Menlo, Consolas, monospace`），不引入字体文件。
- 字号/字重两档纪律见 §2.3；**换字体 = 一处变量 + 一份 @font-face**（owner 改判点，§9）。

### 2.5 强调色与交互态纪律

- 链接 / 主按钮 / focus 同一琥珀色相；hover 只动明度（亮色加深 `--acc-h`、暗色提亮 `--acc-h`），**只做颜色/透明度过渡**（无位移、无缩放动画）。
- `:focus-visible` = **2px outline `--acc`，offset 2px**（键盘可见性是瑞士版的可访问性兜底）；visited 不标。
- **JMB 灰度自检入走查门禁**：任意页面转灰度后层级不散（对比来自明度而非色相——#35 报告的 GDS/Carbon 先例手法），走查清单项，非 CI。

### 2.6 代码块、产品窗与宿主界面 mock（同一盒式语言）

- **代码块**：tab 条 + 1px hairline 盒、零圆角零阴影；语法高亮**无彩虹**——自定义 Shiki 主题（亮暗一对），token 色仅灰阶 + 字符串单档灰，必要时以字重区分关键字；代码底 `--code-bg`，块内 mono 走系统栈。
- **产品窗 / 宿主界面 mock**：同盒式语言（hairline 盒 + 窗点栏 + tab 条）；mock 内容 brief 沿 v1 §3.5 三件套（聊天窗 / 审批线程 / trace 控制台），通用界面、无第三方名。
- **trace waterfall**：mono 表（label / 事件 / 耗时三列，五行级体量）；bar 完成态 `--acc`。hero 产品窗与 observability 区**复用同一份数据与组件**（两处陈列 = 刻意对齐 mastra 的重复手法，#37 裁定）。

### 2.7 暗色模式

- 只随 `prefers-color-scheme`，无切换按钮、无 `.dark` class、无持久化（沿旧）。
- Carbon 式换值：角色不变只换值（§2.1 表）；暗底 `#101010` 中性黑（非纯黑、非旧暖黑）；经典先例 = Der Film 黑底浅字红点强调（#35）。
- 16 项 WCAG AA 审计 CI 硬门保留（对象换 §2.1 新值，#36/#41 已核：亮 accent 4.86:1、暗 accent ≈8.6:1、按钮反字 ≥4.9:1）。

### 2.8 favicon / OG / theme-color（终形，#41 已落资产）

- **favicon** = ② 琥珀底 + 白 O：tile 亮 `#9e630a` / 暗 `#ea9f2e` 随 `prefers-color-scheme`，白 O（Inter wght=600 大写 O 字形矢量化路径）双主题恒定。文件四件已在 `public/`：`favicon.svg`（源，内嵌双主题 switch）、`favicon-32.png`、`favicon-16.png`、`apple-touch-icon.png`（180）；head 四条 link 已钉死。**施工期不产新导出、不改结构。**
- **OG** = 1200×630 单张静态**暗色卡**：`#101010` 底 + 1px hairline 框（inset 36px）+ 96px 边距；wordmark `Oribos`（89/96 Inter 600，-0.025em）+ 32px 琥珀方块点贴基线；tagline 38/44——第一句独立行 600 墨色、第二句 `--ink2` 灰、`text-wrap: balance`。`scripts/make-og.mjs` 重生成；token 层落地后脚本回读 `global.css`（替换脚本内常量）。全站通用单张，不做逐页生成（沿 v1 C①）。
- **theme-color**：双 meta = 各主题 `--bg` 解析值（亮 `#ffffff` / 暗 `#101010`），随 token 层一并换。

### 2.9 两站分岔：token 真相源自立（地图绘图会话裁定）

- **营销站自持品牌 token 真相源** = 本 SPEC §2.1。与 `oribos-docs` 的继承关系（v1「真相源在 docs、landing 跟随」）**终止**。
- **两站 CI 色值对比门禁解除**：v1 §5.5 的「landing vs docs 逐项对比，漂移即红」从 CI 移除。
- docs 站是否/何时换肤 = 独立工程（地图 fog，不在本图）。

### 2.10 防漂移与验收（CI 门，v1 §5.5 → v2）

1. **对比度门**：16 项审计对象换 §2.1 值，退出码硬门不变。
2. **token 门（新）**：渲染产物解析出的 `--*` 值逐项 == §2.1 表。
3. **字阶门（新）**：组件字号只出自 §2.3 token（`check-*` 扫描）。
4. ~~两站色值对比门~~ **删除**（§2.9）。
5. **install 槽位门（改造）**：v1 全站禁 install 改为——`dist/` 扫描 install 类命令，**仅允许两个槽位命中**（全局 FAQ 第 2 题答案、agent prompt payload，§4.6），其余命中即红。
6. **版本单点门（改造）**：版本字面只出自单一常量（§4.6）；MCP 代码段内 `version` 字面必须等于常量当前值。
7. **资产门（沿 #41）**：favicon 四件 + 四条 head link + OG 断言，已落 `build/01-skeleton`，照跑。
8. 零外域请求、无 CLS（沿旧；自托管字体不构成第三方子资源）。

---

## 3. 首页 section-by-section（9 区）

序列（固定，#37 终版）：

```
Header（不动，无公告条）→ Hero → 架构事实带 → Feature tabs ×5 → Observability（三件组）
→ Use-case cards ×3（mock 升舱）→ Resources 3 卡组 → 全局 FAQ ×9 → Final CTA → Footer（4 栏不动）
```

mastra 11 区裁定汇总：**删 2**（公告条、案例卡区）、**替 2**（logo 墙 → 架构事实带；书+changelog 流 → 静态 3 卡组）、**升 2**（observability、use-case 卡 mock）、**保留 5**。**代码 11 块不减、分布不变**（hero `agent.ts` + 5 tab 共 9 文件 + observability `app.ts`，§6）——对齐 mastra 不减代码，密度增量全在代码以外。

### 3.1 Hero（D 形态：并置两栏 + 隐藏 payload chip CTA）

- **版面** = 并置两栏框：左 = H1 + sub + chip CTA + GitHub 文字链；右 = **产品窗**（tab 单 pane 切 `agent.ts` / `trace`；trace waterfall 留 hero 窗内，§2.6 复用件；窗栏 meta = trace id · model · duration 一行）。
- **文案**：H1 + sub `沿用 build`（`hero/home.json`，勿改）。
- **chip CTA** = 主 CTA，形态与逐字文案见 §4.3；**次 CTA** = GitHub 文字链（v1「Copy quick start」废止）。
- **窄屏序**：H1 → sub → chip → GitHub → 产品窗。
- 产品窗左 pane = §6 hero `agent.ts` 17 行逐字 + copy 按钮（复制**当前可见文件**逐字，沿旧）。

### 3.2 架构事实带（architecture facts band，新区；`#social-proof` 锚废止，全站无入链）

- 一行 **4 格** fact strip（移动 2×2），mono `--t-xs`，格间 hairline 分隔，无 kicker、无 h2、不设对外锚。
- 四格文案`【终稿·勿改】`（全部为 v1 §9.1 已批准绝对值口径，不带数值）：

```
0 runtime dependencies
Every subsystem a subpath export
No database, no queue, no long-running process
Size is a checked property
```

- 旧 §3.4 social proof 占位带（"No logos, no quotes…"）整带废止。

### 3.3 Feature tabs ×5

`沿用 build`（五 tab = Agents / Workflows / Harness / Memory / MCP；每 tab claim + 4 支撑项 + ≤10 行代码卡逐字不动；tab 数不是密度来源）。视觉随 §2 重绘（tab 条 hairline 盒式、高亮无彩虹）。

### 3.4 Observability（三件组，#37 升舱）

- kicker `Observability` + H2 / lead / 代码卡 claim `沿用 build`。
- 三件组 = ① `app.ts` 代码卡（§6）+ ② **trace waterfall**（复用 hero 产品窗同组件同数据）+ ③ **span 类型清单**：`agent run / model step / tool call / workflow step / memory recall · save`，结构化条目（mono 清单，**非终端输出块**——v1 §7.1「不显示输出/终端」不动）。
- **不加第二张代码卡**；无 Studio 可截图、evals 截图撞红线，密度增量全在自有素材。

### 3.5 Use-case cards ×3（mock 升舱）

- 引言、三卡标题与 claim、整卡可点 `沿用 build`。
- 卡面以**宿主界面 mock 为主体**（§2.6 三件套 brief，无第三方名），文案退为标题 + 一句 claim（均勿改）；场景卡不上首页（用例页是单一真相源）。

### 3.6 Resources 3 卡组（替 v1 细带）

- 三卡 = `Docs` / `Examples` / `Architecture`（标签沿用），链接目标 = `links.ts` 常量不动（§2.4 沿用 build）。
- 卡描述`【终稿·勿改】`（一句/卡）：

```
Docs:         Concepts and reference for every subsystem — agents, tools, memory, workflows, observability.
Examples:     Working examples from the repository — copy one and start building.
Architecture: How the framework stays ultralight — architecture decisions and the CI byte budget mechanism.
```

- **无 changelog 流、无 Releases 卡、无书**（#15 承接面禁令沿旧）。

### 3.7 全局 FAQ ×9

`沿用 build`，唯第 2 题答案翻已发布态（§4.4）；`<details>` 形态随新视觉重绘。

### 3.8 Final CTA

共用组件口径见 §4.5。

---

## 4. CTA 与发布口径（单一「已发布」态）

双版切换机制与「三处切换点」概念**作废**（#38）；本节即终态，无预置切换。

### 4.1 CTA 语义总表 v2

| 位置 | 形态/文案 | 行为或目标 |
| --- | --- | --- |
| header `GitHub` | 文字链 | `links.github` |
| header pill | `v{version}` 徽标（链） | GitHub Releases（§4.2） |
| hero 主 CTA | **chip 式 agent prompt CTA**（§4.3） | 复制 payload 逐字 |
| hero 次 CTA | `GitHub` 文字链 | `links.github` |
| feature / observability / hero 产品窗代码卡 | `⧉ copy` | 复制当前可见文件逐字（沿旧） |
| Resources 卡组 | 三卡 | `links.*`（沿旧） |
| final CTA（首页 + 用例页 + 关键词页共用） | H2 + 新 sub + 同款 chip + GitHub 次链（§4.5） | 同 hero chip |
| `/about` 收尾带、法务页、用例页底 `← All use cases` | 沿用 build | 沿旧 |

### 4.2 header pill

`v{version}` 徽标（mono，hairline 边），链 `https://github.com/0xnicholas/oribos-framework/releases`；字面取版本常量（§4.6），当前 `v0.6.0`。v1 `coming soon` 非链接 pill 废止。

### 4.3 agent prompt CTA（chip 式，隐藏 payload）

**形态**（#42 D 拍板）：chip = 盒式小件（hairline 边）——头行 = mono tag + 琥珀实底 copy 按钮；副行 = 任务句 + mono cmeta。**payload 藏于复制按钮后**（所见非所复制），点击直拷、按钮短暂 `✓ copied`（1.2s 复原）。自含担保不变（#43）：coding agent 不保证联网，payload 自含才一次粘贴必现。

**可见面文案`【终稿·勿改】`**（原型草稿定稿）：

```
tag（mono，uppercase）：  agent prompt — self-contained
按钮：                    Copy agent prompt
任务句：                  One paste into your coding agent → a working Oribos agent.
cmeta（mono）：           install · 6-line agent · README — inside
```

**payload 逐字终稿`【终稿·勿改】`**（#43 压缩版；hero 与 final CTA 同文、单点定义，改一处自动全改）：

```
Add a working Oribos agent to this project.

Install: npm i @oribos/core @ai-sdk/openai

Create agent.ts:
  import { openai } from '@ai-sdk/openai';
  import { Agent } from '@oribos/core/agent';
  const agent = new Agent({ name: 'assistant',
    model: openai.chat('gpt-4o-mini') });
  for await (const c of agent.stream('Say hello.'))
    if (c.type === 'text-delta') process.stdout.write(c.textDelta);

Run it with your model key set, then read github.com/0xnicholas/oribos-framework#readme to go deeper.
```

结构 = 任务陈述 1 + install 1 + 6 行 Agent+stream（无 tool / 无 zod）+ README 指引 1；不计入首页「代码 11 块」（#43）。

### 4.4 全局 FAQ 第 2 题

题干不动（`Is Oribos on npm yet?`——真实搜索词，留 SEO）。答案`【终稿·勿改】`（#38 语义边界定稿，无版本字面）：

```
Yes — Oribos is on npm. npm i @oribos/core installs the zero-dependency core, and every
capability package ships alongside it under @oribos/* — add them one at a time, as you need them.
```

### 4.5 final CTA 组件（首页 + 用例页 + 关键词页共用）

- H2 `沿用 build`（`Build ultralight AI agents.`）；coming soon pill 移除。
- 新 sub`【终稿·勿改】`：

```
Copy the agent prompt, paste it into your coding agent, and add a working Oribos agent
to the app you already run.
```

- 主体 = §4.3 同款 chip（payload 单点复用）+ GitHub 文字链次 CTA。
- 用例页中段 GitHub CTA 带**拆除**（#39：final CTA 已内含 GitHub 次链，存在理由消失）。

### 4.6 install 双槽位与版本单一常量

- **install 类命令全站仅两槽位**：全局 FAQ 第 2 题答案、agent prompt payload（§4.3/4.4 中的 `npm i …`）。其余任何位置（文案、代码注释、meta）命中即门禁红（§2.10-5）。代码段 `import '…'` 层面的 subpath 组合不受限（沿旧）。
- **版本字面单一常量**（`links.ts` 同款单点，如 `VERSION = '0.6.0'`）：消费点 = header pill（§4.2）与 MCP 代码段 `version` 字面；其余文案无状态（FAQ 第 2 题答案、prompt payload 均不含版本）。发布后只 bump 常量。
- v1 §6.2/§6.3 双版机制、§9.1「版本仅在三处出现」口径**废止**，以本节为准。

---

## 5. 内页

### 5.1 用例页 ×3（结构已对齐、密度已超标、零内容增量）

终版骨架（#39）：

```
H1 + tagline + 页头宿主界面 mock → 场景卡 ×3（纯文字）→ 全局 FAQ ×9 → final CTA（§4.5）
```

- H1 / tagline / 九张场景卡文字`沿用 build`（【终稿·勿改】口径不变）。
- **页头 mock 上位**：每页一张、复用首页对应卡那张（§3.5 brief 三件套），瑞士盒式 hairline 框；**mock 与页的映射 = 聊天窗 → `/in-product-agents`、审批线程 → `/operations-agents`、trace 控制台 → `/developer-infrastructure`**。旧「三页同图」抽象页头图废止。
- 不设 kicker chip（无客户语境，不凭空造文案）；中段 GitHub CTA 带拆除（§4.5）；final CTA 组件口径不动。

### 5.2 关键词页 ×4（对标 mastra 同 slug 产品页重排）

四页 slug 与 mastra 逐字相同（`/ai-agent-framework` 等）。终版骨架（#39）：

```
H1（逐字不动）+ hero 引言段（新增）→ 论证卡区（h3 卡网格）→ Learn more 单条 → 页内 FAQ ×6 → final CTA（§4.5）
```

- **hero 引言段** = 本区唯一新文案槽：一段自包含概述、LLM 抽取友好、无按钮无 chip；置于 H1 之下，`--t-lg`。
- **代码禁令维持**：不置代码段；hero 不设 prompt 块（每页 prompt 块仅页底 final CTA 一处）。
- Learn more 维持单条页级映射（`links.ts` 的 `learnMoreLinks` 不动）；四页不互链、回出锚映射不动（`#features` / `#agents` / `#workflows` / `#observability`）。
- title / meta description 逐字沿用（引言段不回写 meta）。

**hero 引言段逐字稿`【终稿·勿改】`**：

`/ai-agent-framework`：

```
Oribos is an AI agent framework for TypeScript: a library you call from the app you already
run, not infrastructure you operate. The core package has zero runtime dependencies, every
subsystem — agents, tools, memory, workflows, observability — ships behind its own subpath
export, and capability packages such as @oribos/mcp-server are added one at a time, only when
a job calls for them. There is no database, queue, or long-running process to stand up: an
agent is a handful of fields, and model instances come straight from the AI SDK provider
packages you already chose.
```

`/ai-agents`：

```
An Oribos agent is a small object — name, instructions, model, tools, plus optional memory
and processors — with a built-in tool loop that streams. generate() and stream() run one
code path: the loop executes tool calls and feeds results back to the model, and stream()
yields the run's chunks as they happen. Tools are plain objects validated with the Standard
Schema interfaces you already use, and memory is identity you name per call — thread and
resource — so one agent serves every conversation without hidden state.
```

`/ai-workflows`：

```
Oribos workflows compose typed steps — then, parallel, branch, foreach — where a step can
call an agent, run deterministic code, or both. Every boundary is validated against its
schema before your code runs, and ctx.suspend() unwinds a run into a JSON snapshot at a step
boundary that can resume later, even from another process. The snapshot store defaults to
memory and takes an adapter such as @oribos/sqlite when runs must outlive the process.
```

`/ai-agent-observability`：

```
Oribos traces what actually ran: every agent run, model step, tool call, workflow run and
step, and memory recall or save opens a span — with no OpenTelemetry SDK required. Assemble
a tracer once at the composition root and every agent built through the app traces with no
per-agent wiring; console and memory exporters are built in, and @oribos/otlp maps spans to
the GenAI semantic conventions for any OTLP-compatible collector. A standalone agent with no
tracer opens no span objects — untraced runs stay as small as they look.
```

### 5.3 页内 FAQ 扩编（4–5 → 6 题/页，逐题附搜索意图举证）

- 既有题`沿用 build`（题干/答案勿改）；每页**新增 1 题**（下表），答案`【终稿·勿改】`。
- 形态 `<details><summary>` 随新视觉重绘；与全局 FAQ 零重叠；**不为凑数立题**——6 题/页即落定（区间 6–8 的下沿），后续只在真实长尾意图出现时增补。
- 闸门 = 逐题举证（下表「搜索意图」列）：题目是真实长尾搜索问句的直译，答案只含 v1 §9.1 批准事实。

**新增题`【终稿·勿改】`**：

| 页 | Q | A | 搜索意图举证 |
| --- | --- | --- | --- |
| `/ai-agent-framework` | Does Oribos replace the AI SDK? | No — it builds on it. Model instances come straight from AI SDK provider packages, and schemas stay in the Standard Schema library you already use. Oribos adds the layers around the model: agents, the tool loop, memory, workflows, and tracing. | 「agent framework vs ai sdk」「do i still need the ai sdk」——选型期直问 |
| `/ai-agents` | How do I see what an agent is doing while it runs? | stream() yields the run's chunks as they happen — text deltas and tool activity. When a tracer is assembled, the same run opens spans (agent run, model step, tool call) that the built-in exporters can show, so a run can be watched live and read back afterwards. | 「stream ai agent output typescript」「watch agent tool calls live」——落地期调试问句 |
| `/ai-workflows` | What happens if a step fails? | The run settles to failed rather than continuing on bad data. Every boundary — start input, step input, resume data — is validated before your code runs, so a malformed value fails at the boundary instead of deep inside a step, and the run's lifecycle events report which step failed. Suspending is the separate, deliberate path for resumable long-running work. | 「what happens when a workflow step fails」「ai workflow error handling」——可靠性评估问句 |
| `/ai-agent-observability` | How do I turn tracing on? | Assemble a tracer with an exporter and hand it down from the composition root — every agent built through the app then traces with no per-agent wiring. Nothing is exported until you do: a standalone new Agent() with no tracer opens no span objects at all. | 「how to enable tracing for ai agents」「ai agent tracing setup」——上手第一问 |

**既有 5 题的意图举证**（施工不加不改，仅供复核闸门）：各页既有题干即长尾问句直译——如 "What does 'zero runtime dependencies' actually mean?"（framework）、"Do I need to write my own agent loop?"（agents）、"When should I use a workflow instead of an agent?"（workflows）、"What gets traced in a Oribos run?"（observability）等，全数为真实搜索形态，闸门通过。

### 5.4 论证卡区与页头 mock 落位（逐区规格）

- **论证段卡区化**：现「小标题 + 1–3 句」论证段**文字不动、只换容器**——每段成一张 **h3 卡**（卡标题 = 现小标题文字，`--t-xl`；卡正文 = 现段落文字，`--t-lg`），入瑞士盒式 hairline 卡网格：桌面 12 栏内两列（各 6 栏）、移动单列。**无图标、无 h2 区头**（卡数 3–4，太少不设区头）、无卡内链接。
- 卡数：framework 3 / agents 4 / workflows 4 / observability 3（= 现段落 数，不减不并）。
- 页头 mock 仅用例页有（§5.1）；关键词页页头无图（H1 + 引言段而已）。

### 5.5 密度口径（结构槽位，词数区间废止）

v1「正文约 500–700 词」区间**废止**（#39）；密度 = 结构槽位计数，词数由论证需要决定（沿「篇幅由论证需要决定」）：

| 页型 | 槽位口径 |
| --- | --- |
| 关键词页 | 引言段 ×1 + 论证卡 3–4 + Learn more ×1 + 页内 FAQ 6–8 |
| 用例页 | 页头 mock ×1 + 场景卡 ×3 + 全局 FAQ ×9 + final CTA ×1 |
| 首页 | §3 九区序列（事实带 4 格、tabs 5、use-case 卡 3、Resources 卡 3、FAQ 9） |

### 5.6 不动页（`/about`、两法务页、404）

内容零改动`沿用 build`；只吃 §2 视觉重绘（token / 网格 / 字体 / 盒式语言）与全站组件换装（final CTA 组件除外——此四页无 final CTA）。footer 四栏、法务行、署名口径沿旧。

---

## 6. 代码示例不变量

- **11 块不减、逐字不动、分布不变**：hero `agent.ts`（17 行显式例外，不许压缩）+ 五 tab 共 9 文件（各 ≤10 行）+ observability `app.ts`。真相源 = `build/01-skeleton` content collections（`snippets/` 等），施工只换陈列容器（§2.6 盒式、无彩虹高亮）。
- 产品窗左 pane 展示**完整 weather tool 版** `agent.ts`（prompt payload 的 6 行是压缩版，两者并存是刻意：可见代码的火力在产品窗，不在 CTA——#43 链一/链二分解）。
- **prompt payload 不计入 11 块**（§4.3）；trace waterfall 数据沿用 build 真实 run 截取。
- MCP 代码段 `version` 字面随单一常量（§4.6）。
- 展示纪律沿 v1 §7.1：file tabs 形态、不显示输出/终端。

---

## 7. 红线（沿 v1 §9，修订两项）

**全部沿旧**：无客户案例 / 无数字宣称（KB、计数、星数、下载数、基准）／ RAG / evals 不作已实现宣称（全局 FAQ 第 7 题与 Agents tab processor 用例词两例外沿旧；**关键词页正文与页内 FAQ 两词不出现**）／ 不点名竞品与参照站真名 / 无 blog / newsletter / 订阅面 / 无表单与 email 收集 / 零第三方子资源 / 许可 Apache-2.0（无 MIT）/ 不出现部署平台名 / 排期不承诺。表述纪律沿 v1 §9.3（术语守 `CONTEXT.md`、美式拼写、em dash）。

**修订两项**（v1 §9 相应条目以本节为准）：

1. ~~install 红线（发布前全站有效）~~ → **双槽位纪律**（§4.6）。
2. ~~版本仅在三处出现~~ → **版本字面单一常量**（§4.6），消费点两处（header pill、MCP 代码段字面）。

---

## 8. 施工与门禁交接

**施工前提**：本文件定稿交接（地图 #33 目的地）；施工票动线归 owner（照旧图 #18–#31 式开新票），不在本图。

**建议施工顺序**：token 层（§2.1 → `global.css` + `@theme` 别名）→ 字体接线（§2.4）→ 布局原语（网格/盒式模块/rhythm）→ 首页九区（§3）→ chip CTA 与 final CTA 组件（§4）→ 关键词页重排（§5.2–5.4）→ 用例页（§5.1）→ 不动页换装（§5.6）→ 门禁更新（§2.10）→ 亮暗双主题逐页走查（含 JMB 灰度自检）。

**门禁清单**：§2.10 八项；v1 §8.8 构建期质量门未废止项照跑。

**完成定义**：§2.10 全绿；所有 `【终稿·勿改】` 一字不动落地；`沿用 build` 内容与 `build/01-skeleton` 逐字一致；§7 红线扫描零命中（双槽位除外）；亮暗 × 桌面/移动走查通过。

---

## 9. owner 可改判登记（施工开工前有效）

| 项 | 现值 | 改判成本 |
| --- | --- | --- |
| 字体（#36-③ 余量） | Inter 可变字重 | 一处变量 + @font-face |
| 本 SPEC 新起草文案（引言段 ×4、FAQ 新题 ×4、事实带 4 格、Resources 描述 ×3、chip 文案 4 行、payload、final CTA sub、FAQ 第 2 题答案） | 均`【终稿·勿改】` | 改判即改本文件对应块；开工后视为定稿 |
| 暗 accent 规范值 | `#ea9f2e`（若改取原型实物 `#eaa03c`：重跑 make-og + favicon.svg 一字面 + 重导 PNG，十分钟） | 小 |

---

## 10. Out of scope（沿地图 #33）

mastra 有而 Oribos 不适用的页面与区块（pricing / customers / blog / newsletter / 行业页 / 云平台功能页）；客户 logo 墙与带数字案例卡；首页公告条与 changelog 流 / Releases 承接面；部署与上域（旧图 #1）；docs 站本体改造与换肤动线（独立工程，§2.9 分岔后属 docs 侧）；框架侧 create 包（`create-oribos`）与 mastra 同构短块回归（框架工程）；i18n 中文内容。

---

## 11. 附录：provenance index（每票 → 决定了什么）

| 票 | 标题 | 决定了什么（本 SPEC 消费点） |
| --- | --- | --- |
| [#33](https://github.com/0xnicholas/oribos-website/issues/33) | Wayfinder map: 营销站改版 | 目的地（本文件）、红线、范围、token 真相源自立 |
| [#34](https://github.com/0xnicholas/oribos-website/issues/34) | 调研：mastra.ai 内容布局事实 | 11 区序列与密度五手法（§3 序列的事实输入）；#42 修正其「代码块陈列」SSR 误读 |
| [#35](https://github.com/0xnicholas/oribos-website/issues/35) | 调研：瑞士风格 Web 转译 | §2 网格/字阶/强调色纪律/暗色先例/字体选型 |
| [#36](https://github.com/0xnicholas/oribos-website/issues/36) | 原型：视觉方向与品牌 token | 方向 C 全套：§2.1–2.7 token、字阶、Inter、focus、暗色、代码块形态、wordmark |
| [#37](https://github.com/0xnicholas/oribos-website/issues/37) | 首页序列与密度 | §3 九区终版、事实带、三件组、mock 升舱、代码 11 块、锚点 |
| [#38](https://github.com/0xnicholas/oribos-website/issues/38) | CTA 切换与 hero 形态 | §4 单一已发布态、pill、FAQ 第 2 题、final CTA、自含边界 |
| [#39](https://github.com/0xnicholas/oribos-website/issues/39) | 内页内容增强 | §5 全部：用例页骨架、关键词页重排、引言段、FAQ 扩编、卡区化、密度口径 |
| [#41](https://github.com/0xnicholas/oribos-website/issues/41) | OG 与 favicon 重绘 | §2.8 终形与资产、字体文件先行、暗 accent 漂移裁决输入 |
| [#43](https://github.com/0xnicholas/oribos-website/issues/43) | 重裁：prompt 块形态 | §4.3 payload 压缩（14→6 行代码、块 22→13 行）、自含担保保留 |
| [#42](https://github.com/0xnicholas/oribos-website/issues/42) | 原型：hero 视觉形态 | §3.1 D 形态（并置 + 隐藏 chip）、窄屏序、trace 留窗、§4.3 chip 文案槽 |

**非票据来源**：调研报告（`research/mastra-layout` `5cef80f`、`research/swiss-style` `cbaaf69`）；原型（`prototype/swiss-direction` `eea5d5e`、`prototype/hero-form` `7360ac4`，throwaway 不折进真站）；既有站与逐字内容真相源 `build/01-skeleton` `481a89b`；v1 SPEC `docs/SPEC.md` @ main `3a63488`；术语 `CONTEXT.md`。
