# Oribos Website

The marketing site for the Oribos project. This repo's deliverable is a handoff-ready spec for that site; the site itself is built from the spec.

## Language

**营销站 (Marketing site)**:
The landing page group for Oribos — home page and closely related content pages. Does not include docs or a blog; those are separate efforts.
_Avoid_: docs site, website（泛指）

**Oribos**:
The umbrella brand this site markets: its first subproject is the ultralight TypeScript AI agent framework (repo `oribos-framework`), the documentation site follows, and future subprojects live alongside them. Public tagline: "Ultralight TypeScript agent framework. Compose only what you use — run anywhere, no runtime baggage."
_Avoid_: `balsa` / `balsats`（旧名，见框架 ADR-0013 末次修订；`link-rules.ts` 见到即红）

**站点根 (Site origin)**:
营销站的单一部署根 = `https://oribos.dev`（文档站 = `https://docs.oribos.dev`，两站同根）；仓库里唯一的 host 字面量在 `src/lib/site.ts`，canonical / `og:url` / sitemap / robots 全由它派生。
_Avoid_: 在页面 / 布局 / 组件 / 内容数据里另写域名（`scripts/check-origin.mjs` 见到即红）

**Lightweight**:
Oribos's differentiating axis, with a precise two-part meaning: compose only what you use (every subsystem a separate subpath export; zero runtime dependencies) and no runtime burden (no required DB, queue, or long-running process; embeds in the host app).
_Avoid_: small, mini（泛化的"小"）

**core package**:
`@oribos/core`, the zero-runtime-dependency package; every subsystem is a subpath export.

**capability package**:
An optional add-on package `@oribos/<capability>` (e.g. `@oribos/mcp-server`).
_Avoid_: plugin, integration

**composition root**:
`createApp`, an optional thin assembly point.

**processor**:
Oribos's single cross-cutting extension point: ordered hooks `processInput` / `processOutputStep` / `processError`.

**as-tool composition**:
Oribos's multi-agent model: wrap an agent as a tool on another agent; delegation is an ordinary tool call.
_Avoid_: supervisor, sub-agent

**memory**:
Thread/resource identity plus message history, with opt-in resource-scoped working memory.
_Avoid_: session, short-term memory, long-term memory

**workflow snapshot**:
How workflows suspend/resume: JSON snapshots at step boundaries, resumable from another process.

**durable agent**:
An agent whose approval-listed tool calls suspend the run as a human approval gate; `resume({ approved })` continues.

**harness**:
A documentation category name, not a module: the trio of durable agents, signals, and schedules.

**用例页 (Use-case page)**:
首页 use-case 卡片的展开页,每卡一页(首发三页);讲单一应用场景的完整论证。页头 = 该页对应的宿主界面 mock(与首页卡面同一张,每页一张:聊天窗 / 审批线程 / trace 控制台)。
_Avoid_: 案例页、customers 页(Oribos 无客户案例)

**场景卡 (Scenario card)**:
用例页正文的卡片单元,代替客户故事卡:场景名 + 2–3 句「用 Oribos 怎么搭」+ 用到的子系统/包名(首发每页三张);卡片本体纯文字——宿主界面 mock 是页面级素材,每用例页一张置于页头,复用首页对应卡那张(改版图 #39 裁定)。
_Avoid_: 客户故事卡、案例卡(Oribos 无客户案例);能力清单(能力维度归 feature tabs)

**关键词页 (Keyword page)**:
按搜索词建立的说明页,首发四页(`/ai-agent-framework`、`/ai-agents`、`/ai-workflows`、`/ai-agent-observability`),服务搜索与 LLM 收录;内容只讲 Oribos 自身能力。
_Avoid_: SEO 页(泛指)、行业页

**全局 FAQ (Global FAQ)**:
全站共用的九题 FAQ(首页与用例页逐字复用),承接通用问题。
_Avoid_: 首页 FAQ(用例页同样出现)

**论证卡区 (Argument card band)**:
关键词页正文的论证段容器(改版图 #39 裁定):现「小标题 + 1–3 句」论证段文字不动、只换容器为 h3 卡网格(每页 3–4 张,瑞士盒式 hairline 卡);无图标、无 h2 区头、无卡内链接。
_Avoid_: 特性网格(feature tabs 的能力维度)、图标卡

**页内 FAQ (Page FAQ)**:
关键词页正文末的本地 FAQ,承接该页对应搜索词的长尾问句;与全局 FAQ 零重叠。
_Avoid_: FAQ(未限定时指代不清)、SEO 问答

**架构事实带 (Architecture facts band)**:
首页第二区,logo 墙位的替代(改版图 #37 裁定):一行 3–4 格 fact strip,内容只取数字与 claims 政策中已批准的绝对值架构声明(`0 runtime dependencies`、逐子系统 subpath 导出、无 database/queue/长驻进程、CI byte budget 机制),不带任何数值。
_Avoid_: social proof 占位带、logo 墙(无客户案例)、数字宣称

**agent prompt CTA**:
改版后 hero 与 final CTA 共用的主 CTA 形态(改版图 #38 裁定):一个代码块,复制的是一段喂给 coding agent 的自含脚手架 prompt(install 行 + 最小 agent 代码 + README 指引);prompt 文本单点定义,final CTA 复用同一块。取代旧「Copy quick start」次 CTA(已废止,与 hero 代码卡自带 copy 按钮功能重复)。
_Avoid_: Copy quick start(废止形态)、install 命令裸块(#38 否决的备选)

**文本页 (Text page)**:
纯文本三页(`/about` 与 `/privacy-policy`、`/terms-of-service` 两页法务 stub)的合称;正文逐字锁定,署名只到 GitHub handle,法务页 `Last updated` 为内容数据里的单一静态字符串。
_Avoid_: 内容页(泛指)、静态页(与整站静态形态混淆)

**维护者署名 (Maintainer attribution)**:
站点公开面上代表 Oribos 的个人标识:只到 GitHub handle(`@0xnicholas`),不出现真实姓名与邮箱;footer 的 `©` 行保持项目名义,不随署名改变。
_Avoid_: 实名署名、作者邮箱、团队页(Oribos 无团队)

**许可分工 (License split)**:
站点与项目的版权口径分工:代码与示例 = Apache-2.0;站点文案与图形 = 版权保留。写在法务页与 `/about`,避免 footer 的 `© Oribos · Apache-2.0` 并排被读成「站点内容也是 Apache-2.0」。
_Avoid_: 全站开源(代码与文案混谈)、内容许可(未定,不表态)
