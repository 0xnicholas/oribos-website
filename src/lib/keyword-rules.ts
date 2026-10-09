/**
 * The keyword pages (SPEC §4.4) over the built site: the skeleton — the §2.6 title
 * (`<Keyword> for TypeScript — Oribos`), the H1 (the keyword's face plus its claim), 2–4
 * argument sections (a subheading plus 1–3 sentences), exactly one `Learn more` text link,
 * the in-page FAQ (4–5 questions, zero overlap with the global nine, 1–3-sentence
 * self-contained answers, no links), the shared final CTA and the back-to-home anchor — and
 * the page-level red lines: RAG / evals nowhere in the page's own copy, no code block, no
 * links between keyword pages, and no Platform-class words.
 *
 * The in-page FAQ wears its own marker (`data-page-faq`): the global FAQ gate owns `data-faq`
 * and demands the §3.7 nine of any page carrying it, while a keyword page carries the page
 * FAQ instead (ticket #28's handoff note). The `Learn more` href is the pre-launch constant
 * from `src/lib/links.ts` until the docs switch (#16) flips the mapping to its `post` values —
 * the constant, this gate's expectation and `allowedExternalLinks` move together.
 *
 * Vocabulary note: the locked §4.4 copy names the supervisor / sub-agent concepts in
 * negation ("no supervisor protocol", "no sub-agent concept"), so the CONTEXT.md term guards
 * do not scan these pages — the verbatim locks pin every word by construction, which is the
 * guards' purpose served by the lock itself.
 *
 * Like the hero, feature, band, FAQ and scenario rules, the strings here are the spec's copy —
 * deliberately not read from the content collections that render them, so the page and its
 * gate cannot agree by construction. All four pages' §4.4 copy is registered now【终稿·勿改】;
 * the gate checks the pages the build has and reports the rest as pending, like the shell
 * gate.
 */

import { sectionColourIssues } from './colour-rules.ts';
import { ragEvalsRule, redLineRules, ruleMatches } from './copy-rules.ts';
import { faqItems as globalFaqItems, sentenceCount } from './faq-rules.ts';
import { elementOf, linksOf, markersInOrder, tagsOf, textOf } from './html.ts';
import { learnMoreLinks, type KeywordPageSlug } from './links.ts';

export type KeywordPage = { path: string; html: string };
export type KeywordSectionSpec = { heading: string; body: string };
export type KeywordFaqSpec = { question: string; answer: string };
export type KeywordPageSpec = {
	/** The page's route (SPEC §2.1), trailing slash as the registry spells it. */
	route: string;
	/** The page's slug — also its key in `learnMoreLinks` (SPEC §4.4 映射). */
	slug: KeywordPageSlug;
	/** H1 = the keyword's face plus its claim (SPEC §4.4 【终稿·勿改】). */
	h1: string;
	/** The §2.6 meta description — og:description reuses it. */
	description: string;
	/** The argument sections, in page order (SPEC §4.4 【终稿·勿改】): subheading + 1–3 sentences. */
	sections: readonly KeywordSectionSpec[];
	/** The in-page FAQ, in page order (SPEC §4.4 【终稿·勿改】) — zero overlap with the global nine. */
	faq: readonly KeywordFaqSpec[];
	/** The home anchor the page links back to (SPEC §4.4 回首页锚映射). */
	backAnchor: string;
};

/** SPEC §4.4: the one text link after the argument — label verbatim. */
export const learnMoreText = 'Learn more';

/** SPEC §4.4 回首页锚【SPEC 起草·可润色】: the back link's text. */
export const backLinkText = 'See how it works →';

/** The in-page FAQ's heading — the site's one FAQ heading, like the global list's. */
export const pageFaqHeading = 'Frequently asked questions';

/** SPEC §4.4 + §2.6: the four keyword pages' locked copy, in §2.1 page order. */
export const keywordPages: readonly KeywordPageSpec[] = [
	{
		route: '/ai-agent-framework/',
		slug: 'ai-agent-framework',
		h1: 'AI agent framework — everything you need, nothing you have to run.',
		description:
			'An AI agent framework for TypeScript: a library, not infrastructure you operate — zero runtime dependencies, nothing new to run.',
		sections: [
			{
				heading: 'A library, not infrastructure you operate',
				body: 'Oribos is a library you call from the app you already run. No database, queue, or long-running process is required: storage ports default to in-memory implementations, and adapters are a deliberate choice rather than a prerequisite.',
			},
			{
				heading: 'Compose only what you use',
				body: 'Every subsystem ships behind its own subpath export — agents, tools, memory, workflows, observability, durable execution, signals, schedules — and the core carries zero runtime dependencies. Capability packages such as @oribos/mcp-server, @oribos/sqlite and @oribos/otlp are added one at a time, only when a job calls for them.',
			},
			{
				heading: 'A small surface you can hold in your head',
				body: "An agent is a handful of fields, a tool is a plain object, and processors are the framework's single cross-cutting extension point. Model instances come straight from the AI SDK provider ecosystem — no adapters, no registries — and multi-agent systems are built by wrapping one agent as a tool on another, with no supervisor protocol to learn.",
			},
		],
		faq: [
			{
				question: 'What does "zero runtime dependencies" actually mean?',
				answer:
					'The core package ships with no third-party runtime dependencies; model instances arrive from AI SDK provider packages you already chose, and schemas stay in the library you already use. Your dependency tree gains Oribos and nothing hidden behind it.',
			},
			{
				question: 'Do I have to run anything alongside my app?',
				answer:
					'No. There is no database, queue, or long-running process to operate; storage ports default to in-memory implementations and swap to adapters only when you want persistence.',
			},
			{
				question: 'Can I adopt Oribos one piece at a time?',
				answer:
					"Yes. Each subsystem is its own subpath export and capability packages are installed individually, so a first agent can be a single import. What you don't import costs nothing — not in the dependency tree, not in concept space.",
			},
			{
				question: 'How do multiple agents fit together?',
				answer:
					'By composition: wrap one agent as a tool on another, and delegation becomes an ordinary tool call. The core has no supervisor protocol and no sub-agent concept to adopt.',
			},
			{
				question: 'Can one agent behave differently per user or request?',
				answer:
					"Every configuration field is a dynamic argument — either a value or a function resolved per execution against the request context — so per-user behavior doesn't fork your agent code.",
			},
		],
		backAnchor: '/#features',
	},
	{
		route: '/ai-agents/',
		slug: 'ai-agents',
		h1: 'AI agents — a handful of fields, a built-in loop, and no hidden state.',
		description:
			'AI agents in TypeScript: a handful of fields, a built-in tool loop, streaming runs, and memory named per call — no hidden state.',
		sections: [
			{
				heading: 'An agent is a small object',
				body: 'Name, instructions, model, tools — plus optional memory and processors. The model instance comes straight from an AI SDK provider package, so there is no adapter or registry between your code and the provider.',
			},
			{
				heading: 'The loop is built in, and it streams',
				body: "When the model answers with a tool call, the loop executes the tool and feeds the result back to the model; a failing tool returns an error result the model can recover from. stream() yields the run's chunks as they happen, and generate() is the same run collapsed to its terminal values — one code path, so the two always agree.",
			},
			{
				heading: 'Tools are plain objects you already know how to write',
				body: "A tool is described by its fields and found by its key; schemas are Standard Schema dual interfaces, so Oribos validates the model's arguments with the schemas you already use and sends the corresponding JSON Schema to the provider.",
			},
			{
				heading: 'Memory is identity you name per call',
				body: 'Thread and resource are passed per call and the agent itself carries no conversation state, so one agent serves every conversation. Message history is on by default; working memory is an opt-in, resource-scoped record the model updates through a framework-attached tool.',
			},
		],
		faq: [
			{
				question: 'Do I need to write my own agent loop?',
				answer:
					'No. generate() and stream() run a built-in loop that executes tool calls and feeds results back, up to a configurable step cap; a tool failure comes back as an error result the model can recover from.',
			},
			{
				question: 'How does streaming work?',
				answer:
					'The run is an async iterable of chunks you can consume as they arrive, and the same object carries the terminal values. generate() is that run collapsed to its result.',
			},
			{
				question: 'Can one agent serve many users and conversations?',
				answer:
					'Yes — thread and resource are named per call and the agent holds no conversation state. Memory storage goes through a port with an in-memory default.',
			},
			{
				question: 'How is tool input validated?',
				answer:
					"Schemas are Standard Schema dual interfaces: Oribos validates the model's arguments with them and sends the corresponding JSON Schema to the provider.",
			},
			{
				question: 'How do I add guardrails, redaction, or rate limiting?',
				answer:
					"Processors: ordered hooks (processInput, processOutputStep, processError) are the framework's single cross-cutting extension point and run in declaration order.",
			},
		],
		backAnchor: '/#agents',
	},
	{
		route: '/ai-workflows/',
		slug: 'ai-workflows',
		h1: 'AI workflows — typed steps, validated boundaries, and runs that survive a restart.',
		description:
			'AI workflows in TypeScript: typed steps, validated boundaries, and JSON snapshots that resume a run in another process.',
		sections: [
			{
				heading: 'Steps that promise what they take and what they give back',
				body: 'A step declares its input and output schemas; the builder composes steps with then, parallel, branch and foreach. Every boundary — start input, step input, resume data — is validated before your code runs.',
			},
			{
				heading: 'Agents join as steps, not instead of them',
				body: "A step can call an agent, run deterministic code, or both: use a model where you need reasoning, and a plain function where you don't. The workflow is what turns a multi-step process into something repeatable.",
			},
			{
				heading: 'Suspend, resume, and move the run to another process',
				body: 'ctx.suspend() unwinds a run with a JSON snapshot at a step boundary; resuming later — even from another process — continues from that snapshot. Snapshots go through a storage port that defaults to memory and takes adapters when persistence matters.',
			},
			{
				heading: 'Runs you can watch while they happen',
				body: 'start() yields lifecycle events at run and step boundaries, and the run settles to success, failed or suspended — progress is legible without inspecting internal state.',
			},
		],
		faq: [
			{
				question: 'When should I use a workflow instead of an agent?',
				answer:
					'Use a workflow when the process is defined up front and order, data flow, or validation matters; use an agent when the task is open-ended and the model should choose the next step. They compose: a workflow step can call an agent.',
			},
			{
				question: 'Do workflows need a database or a queue?',
				answer:
					'No. The snapshot store defaults to an in-memory implementation and is swapped for an adapter — such as @oribos/sqlite — only when you want snapshots to outlive the process.',
			},
			{
				question: 'What happens if my process restarts mid-run?',
				answer:
					'Runs suspend at step boundaries with a JSON snapshot, so with a persistent store you can resume the run from another process.',
			},
			{
				question: 'Can steps run in parallel?',
				answer:
					'Yes: parallel runs steps together and foreach maps over a collection with controlled concurrency, while branch routes between paths.',
			},
			{
				question: 'How do I pass data between steps?',
				answer:
					"Each step's output is the next step's typed input, and every boundary is validated against its schema before your code runs — a malformed value fails at the boundary, not deep inside a step.",
			},
		],
		backAnchor: '/#workflows',
	},
	{
		route: '/ai-agent-observability/',
		slug: 'ai-agent-observability',
		h1: 'AI agent observability — see what actually ran, in the stack you already use.',
		description:
			'AI agent observability for TypeScript: spans for runs, model steps, tool calls and memory — exported to your collector over OTLP.',
		sections: [
			{
				heading: 'Spans for the things that actually ran',
				body: "Every agent run, model step, tool call, workflow run and step, and memory recall or save opens a span. The span model is Oribos's own minimal one — the framework doesn't require an OpenTelemetry SDK in order to trace.",
			},
			{
				heading: 'A tracer you hand down once',
				body: 'Assemble a tracer at the composition root and every agent built through the app traces with no per-agent wiring. A standalone agent with no tracer stays fully first-class: zero overhead, no span objects.',
			},
			{
				heading: 'Export to where your telemetry already lives',
				body: 'Console and memory exporters are built in; @oribos/otlp maps Oribos spans to GenAI semantic conventions and exports them to any OTLP-compatible collector. A resumed run opens a new span in the same trace, so one human interaction stays one story.',
			},
		],
		faq: [
			{
				question: 'What gets traced in a Oribos run?',
				answer:
					'Agent runs, model steps, tool calls, workflow runs and steps, and memory recalls and saves each open a span, with parent-child structure that keeps a run readable.',
			},
			{
				question: 'Can I send traces to my existing OpenTelemetry backend?',
				answer:
					'Yes — @oribos/otlp exports Oribos spans with GenAI semantic conventions to any OTLP-compatible collector.',
			},
			{
				question: "Where do traces go if I don't configure anything?",
				answer:
					'Oribos ships console and memory exporters, so spans can be watched during development without running a collector; nothing is exported unless you assemble a tracer with an exporter.',
			},
			{
				question: "Does tracing cost anything when I don't want it?",
				answer:
					'No: a standalone new Agent() with no tracer opens no span objects, so an untraced run stays as small as it looks.',
			},
			{
				question: 'Does Oribos ship a dashboard or a hosted observability service?',
				answer:
					'No. Oribos produces spans and exports them to the stack you operate; there is no Oribos-side service in the loop.',
			},
		],
		backAnchor: '/#observability',
	},
];

/** SPEC §9.2: the RAG / evals words — keyword pages carry neither at all (SPEC §4.4). */
const ragEvals = ragEvalsRule.pattern;
/** SPEC §3.7: packages are `@oribos/*` — any other `@scope/name` is a finding. */
const packageScope = /\B@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*/gi;
/** SPEC §4.4: the target is the slug keyword plus its TypeScript qualifier — no Platform-class words. */
const platformWord = /\bplatform\b/i;

/* ---------------------------------------------------------------- reading the page */

/** Whether a built page is a keyword page — `check-keyword.mjs`'s page filter. */
export function carriesKeywordPage(html: string): boolean {
	return elementOf(html, 'section', 'data-keyword-sections') !== null;
}

function heroOf(html: string): string | null {
	return elementOf(html, 'section', 'data-keyword-hero');
}

function sectionsOf(html: string): string | null {
	return elementOf(html, 'section', 'data-keyword-sections');
}

function learnMoreOf(html: string): string | null {
	return elementOf(html, 'p', 'data-keyword-learn-more');
}

function pageFaqOf(html: string): string | null {
	return elementOf(html, 'section', 'data-page-faq');
}

function backOf(html: string): string | null {
	return elementOf(html, 'section', 'data-keyword-back');
}

function sectionCardsOf(section: string): string[] {
	return [...section.matchAll(/<article\b[^>]*\bdata-keyword-section\b[^>]*>[\s\S]*?<\/article>/gi)].map((match) => match[0]);
}

/** The page's own copy regions — everything but the header, the footer and the shared final CTA. */
function ownRegionsOf(html: string): string[] {
	return [heroOf(html), sectionsOf(html), pageFaqOf(html), backOf(html)].filter((region): region is string => region !== null);
}

/* ---------------------------------------------------------------- the skeleton */

/** SPEC §4.4: the skeleton, the verbatim copy, the in-page FAQ's discipline and the red lines. */
export function keywordPageIssues(page: KeywordPage, spec: KeywordPageSpec): string[] {
	const issues: string[] = [];

	issues.push(...heroIssues(page, spec));
	issues.push(...sectionIssues(page, spec));
	issues.push(...learnMoreIssues(page, spec));
	issues.push(...pageFaqIssues(page, spec));
	issues.push(...orderIssues(page));
	issues.push(...redLineIssues(page));
	issues.push(...backLinkIssues(page, spec));
	issues.push(...proseIssues(page));

	return issues;
}

/** SPEC §4.4: the page opens with its H1 — the keyword's face plus its claim, once. */
function heroIssues(page: KeywordPage, spec: KeywordPageSpec): string[] {
	const hero = heroOf(page.html);
	if (hero === null) {
		return [`${page.path}: no keyword hero — the page opens with its H1 (SPEC §4.4)`];
	}

	const issues: string[] = [];
	const h1s = tagsOf(page.html, 'h1');
	if (h1s.length !== 1) {
		issues.push(`${page.path}: the page carries ${h1s.length} <h1> — the keyword page's H1 is its one headline (SPEC §4.4)`);
	}

	const h1 = hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
	if (h1 === undefined || textOf(h1) !== spec.h1) {
		issues.push(`${page.path}: the H1 reads \`${h1 === undefined ? 'nothing' : textOf(h1)}\`, expected \`${spec.h1}\` (SPEC §4.4)`);
	}

	return issues;
}

/** SPEC §4.4: the 2–4 argument sections — a subheading plus 1–3 sentences, verbatim, in order. */
function sectionIssues(page: KeywordPage, spec: KeywordPageSpec): string[] {
	const section = sectionsOf(page.html);
	if (section === null) {
		return [`${page.path}: no argument sections — the page argues in 2–4 headed paragraphs (SPEC §4.4)`];
	}

	const issues: string[] = [];
	const cards = sectionCardsOf(section);
	if (cards.length !== spec.sections.length) {
		issues.push(`${page.path}: the page carries ${cards.length} argument section(s), expected ${spec.sections.length} (SPEC §4.4)`);
	}

	cards.forEach((card, index) => {
		const expected = spec.sections[index];
		if (expected === undefined) return;
		const label = `section ${index + 1}`;

		const heading = card.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
		if (heading === undefined || textOf(heading) !== expected.heading) {
			issues.push(
				`${page.path}: ${label}'s heading reads \`${heading === undefined ? 'nothing' : textOf(heading)}\`, expected \`${expected.heading}\` (SPEC §4.4)`,
			);
		}

		const body = card.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
		if (body === undefined || textOf(body) !== expected.body) {
			issues.push(`${page.path}: ${label}'s body is not the §4.4 copy verbatim`);
		}
	});

	return issues;
}

/** SPEC §4.4: exactly one `Learn more` text link — the pre-launch constant until the docs switch. */
function learnMoreIssues(page: KeywordPage, spec: KeywordPageSpec): string[] {
	const expected = learnMoreLinks[spec.slug].pre;
	const issues: string[] = [];

	const main = elementOf(page.html, 'main') ?? page.html;
	const labelled = linksOf(main).filter((link) => link.text === learnMoreText);
	if (labelled.length > 1) {
		issues.push(`${page.path}: the page carries ${labelled.length} \`Learn more\` links — exactly one (SPEC §4.4)`);
	}

	const region = learnMoreOf(page.html);
	const link = region === null ? undefined : linksOf(region)[0];
	if (link === undefined) {
		issues.push(`${page.path}: no \`Learn more\` link — the page carries exactly one, after its argument (SPEC §4.4)`);
		return issues;
	}
	if (link.text !== learnMoreText) {
		issues.push(`${page.path}: the link after the argument reads \`${link.text}\`, expected \`${learnMoreText}\` (SPEC §4.4)`);
	}
	if (link.href !== expected) {
		issues.push(
			`${page.path}: the \`Learn more\` link targets \`${link.href}\` — \`${expected}\` renders; the docs switch has not flipped (#16, SPEC §4.4)`,
		);
	}

	return issues;
}

/**
 * SPEC §4.4 页内 FAQ: 4–5 questions, verbatim and in order, answers 1–3 sentences and
 * self-contained (no link), zero overlap with the global nine — and never the global list's
 * `data-faq` marker, which belongs to the §3.7 gate.
 */
function pageFaqIssues(page: KeywordPage, spec: KeywordPageSpec): string[] {
	const issues: string[] = [];

	if (elementOf(page.html, 'section', 'data-faq') !== null) {
		issues.push(
			`${page.path}: the page carries the global FAQ's \`data-faq\` marker — the in-page FAQ is the keyword page's only FAQ (SPEC §4.4)`,
		);
	}

	const section = pageFaqOf(page.html);
	if (section === null) {
		issues.push(`${page.path}: no in-page FAQ — the keyword page closes its argument with 4–5 local questions (SPEC §4.4)`);
		return issues;
	}

	const heading = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
	if (heading === undefined || textOf(heading) !== pageFaqHeading) {
		issues.push(
			`${page.path}: the in-page FAQ heading reads \`${heading === undefined ? 'nothing' : textOf(heading)}\`, expected \`${pageFaqHeading}\` (SPEC §4.4)`,
		);
	}

	const entries = [...section.matchAll(/<details\b[^>]*>[\s\S]*?<\/details>/gi)].map((match) => match[0]);
	if (entries.length !== spec.faq.length) {
		issues.push(`${page.path}: the in-page FAQ carries ${entries.length} questions, expected ${spec.faq.length} (SPEC §4.4)`);
	}

	entries.forEach((entry, index) => {
		const expected = spec.faq[index];
		if (expected === undefined) return;
		const label = `in-page question ${index + 1}`;

		const inner = entry.slice(entry.indexOf('>') + 1);
		if (!/^\s*<summary\b/i.test(inner)) {
			issues.push(`${page.path}: ${label}'s <summary> is not the first child of its <details> (SPEC §4.4)`);
		}
		const summary = entry.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
		const renderedQuestion = summary === undefined ? 'nothing' : textOf(summary);
		if (summary === undefined || renderedQuestion !== expected.question) {
			issues.push(`${page.path}: ${label} reads \`${renderedQuestion}\`, expected \`${expected.question}\` (SPEC §4.4)`);
		}

		const overlap = globalFaqItems.find((item) => item.question.toLowerCase() === renderedQuestion.toLowerCase());
		if (overlap !== undefined) {
			issues.push(`${page.path}: ${label} repeats the global FAQ's \`${overlap.question}\` — the two FAQs share no question (SPEC §4.4)`);
		}

		const answerMarkup = inner.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '');
		const answer = textOf(answerMarkup);
		if (answer !== expected.answer) {
			issues.push(`${page.path}: the answer to ${label} is not the §4.4 text verbatim`);
		}
		if (linksOf(answerMarkup).length > 0) {
			issues.push(`${page.path}: ${label}'s answer carries a link — answers are self-contained (SPEC §4.4)`);
		}
		const sentences = sentenceCount(answer);
		if (sentences < 1 || sentences > 3) {
			issues.push(`${page.path}: ${label}'s answer runs ${sentences} sentences — 1–3, self-contained (SPEC §4.4)`);
		}
	});

	// The section is the heading and the question / answer pairs — nothing else, nothing reordered.
	const expectedText = [pageFaqHeading, ...spec.faq.flatMap((item) => [item.question, item.answer])].join(' ');
	if (textOf(section) !== expectedText) {
		issues.push(
			`${page.path}: the in-page FAQ reads more than its heading and question / answer pairs, or reorders them (SPEC §4.4)`,
		);
	}

	return issues;
}

/** SPEC §4.4: the skeleton's reading order — H1 → sections → Learn more → FAQ → CTA → back anchor. */
function orderIssues(page: KeywordPage): string[] {
	const markers = ['data-keyword-hero', 'data-keyword-sections', 'data-keyword-learn-more', 'data-page-faq', 'id="get-started"', 'data-keyword-back'];
	if (markersInOrder(page.html, markers)) return [];
	return [`${page.path}: the skeleton is out of order — H1 → sections → \`Learn more\` → in-page FAQ → final CTA → back anchor (SPEC §4.4)`];
}

/** SPEC §4.4: no code block, no links between keyword pages, no Platform-class words, no RAG / evals. */
function redLineIssues(page: KeywordPage): string[] {
	const issues: string[] = [];

	if (/<pre\b/i.test(page.html)) {
		issues.push(`${page.path}: the page carries a <pre> code block — keyword pages hold no code (SPEC §4.4)`);
	}

	const main = elementOf(page.html, 'main') ?? page.html;
	for (const link of linksOf(main)) {
		if (/^\/ai-/.test(link.href)) {
			issues.push(
				`${page.path}: the page links to \`${link.href}\` — keyword pages do not interlink; the footer Framework column is the entry (SPEC §4.4)`,
			);
		}
	}

	const ownCopy = textOf(ownRegionsOf(page.html).join('\n'));

	const platform = ownCopy.match(platformWord);
	if (platform !== null) {
		issues.push(
			`${page.path}: the page's own copy reads \`${platform[0]}\` — the target is the slug keyword plus its TypeScript qualifier, not Platform-class words (SPEC §4.4)`,
		);
	}

	const rag = ownCopy.match(ragEvals);
	if (rag !== null) {
		issues.push(`${page.path}: the page's own copy reads \`${rag[0]}\` — RAG / evals do not appear on keyword pages (SPEC §4.4/§9.2)`);
	}

	return issues;
}

/** SPEC §4.4 回首页锚: the page ends with `See how it works →` to its mapped home anchor. */
function backLinkIssues(page: KeywordPage, spec: KeywordPageSpec): string[] {
	const section = backOf(page.html);
	if (section === null) {
		return [`${page.path}: no back-anchor section — the page ends with \`${backLinkText}\` (SPEC §4.4)`];
	}
	const link = linksOf(section).find((candidate) => candidate.href === spec.backAnchor && candidate.text === backLinkText);
	if (link === undefined) {
		return [`${page.path}: no \`${backLinkText}\` link to \`${spec.backAnchor}\` at the page's end (SPEC §4.4)`];
	}
	return [];
}

/** SPEC §9.2: the page's own prose holds the site-wide red lines and the `@oribos/*` scope. */
function proseIssues(page: KeywordPage): string[] {
	const issues: string[] = [];
	const ownCopy = textOf(ownRegionsOf(page.html).join('\n'));

	for (const rule of redLineRules) {
		for (const match of ruleMatches(rule, ownCopy)) {
			issues.push(`${page.path}: the page's own copy reads \`${match[0]}\` — ${rule.reason} [${rule.id}]`);
		}
	}

	for (const match of ownCopy.matchAll(packageScope)) {
		if (!match[0].toLowerCase().startsWith('@oribos/')) {
			issues.push(`${page.path}: \`${match[0]}\` is not a \`@oribos/\` package — packages are \`@oribos/*\` (SPEC §4.4)`);
		}
	}

	return issues;
}

/* ---------------------------------------------------------------- the colours */

/** SPEC §5.5 over the page's own sections: they read on the page background in the audited roles. */
export function keywordColourIssues(page: KeywordPage): string[] {
	return sectionColourIssues(page, [
		{ marker: 'data-keyword-hero', label: 'keyword hero' },
		{ marker: 'data-keyword-sections', label: 'argument sections' },
		{ marker: 'data-page-faq', label: 'in-page FAQ' },
		{ marker: 'data-keyword-back', label: 'back anchor' },
	]);
}
