/**
 * The global FAQ ×9 (SPEC §3.7) over the built page: the `#faq` section, its heading, nine
 * `<details>` pairs whose questions and answers are the §3.7 copy verbatim and in order, no link
 * inside an answer, and the nine answers' iron rules — no competitor name, no counting figure, no
 * foreign package scope, the CONTEXT.md vocabulary, and the RAG / evals line that only question 7
 * answers (SPEC §9.2). The answers also keep the §5.5 audited text roles on the page background
 * (`src/lib/colour-rules.ts`), like the home bands. Question 2's answer is the published state
 * (SPEC-revamp §4.4): Oribos is on npm, and the answer is one of the two places an install command
 * may appear — the slot discipline is `src/lib/install-rules.ts` (SPEC-revamp §4.6).
 *
 * Like the hero, feature and band rules, the strings here are the spec's copy — deliberately not
 * read from the content collection that renders them, so the page and its gate cannot agree by
 * construction.
 */

import { sectionColourIssues } from './colour-rules.ts';
import { ragEvalsRule, redLineRules, ruleMatches } from './copy-rules.ts';
import { attributeValue, elementOf, linksOf, textOf } from './html.ts';
import { terminologyHits } from './terminology.ts';

export type FaqPage = { path: string; html: string };
export type FaqSpecItem = { question: string; answer: string };

/** SPEC §3.7: the section heading (§3.7's drafted title). */
export const faqHeading = 'Frequently asked questions';

/** SPEC §3.7 — the nine questions in page order, verbatim; the answers are the section's drafts (【可润色】). */
export const faqItems: readonly FaqSpecItem[] = [
	{
		question: 'What is Oribos?',
		answer:
			'Oribos is an ultralight TypeScript agent framework. Its surface is agents, tools, memory, workflows and durable execution, with capability packages you add as you need them. It is lightweight in two precise senses: you compose only what you use, and it asks for no runtime of its own — no database, no queue, no long-running process; it embeds in the app you already run.',
	},
	{
		question: 'Is Oribos on npm yet?',
		answer:
			'Yes — Oribos is on npm. npm i @oribos/core installs the zero-dependency core, and every capability package ships alongside it under @oribos/* — add them one at a time, as you need them.',
	},
	{
		question: 'Why another TypeScript agent framework?',
		answer:
			"Because the useful parts of a framework should behave like a library, not a platform. Every subsystem ships behind its own subpath export and the core carries zero runtime dependencies, so what you don't import costs you nothing — not in the dependency tree, not in concept space. Nothing here needs a database, a queue or a long-running process, and a CI byte budget keeps size a checked property rather than a promise.",
	},
	{
		question: 'What models and providers can I use with Oribos?',
		answer:
			'Any model from the AI SDK provider ecosystem: you pass a model instance straight from a provider package, with no adapter, no registry and no magic strings. The core stays dependency-free by keeping a minimal structural model contract. For streaming into an AI SDK UI, @oribos/ai-sdk provides the message-stream interop and a useChat-compatible route.',
	},
	{
		question: 'Does Oribos run on edge and serverless?',
		answer:
			"Yes — nothing in the architecture requires a database, a queue or a long-running process, and the core has zero runtime dependencies. Serverless and edge deployments are a first-class shape rather than a downgrade: a platform cron calling tick() on an endpoint is the canonical way to run schedules. Capability packages carry their own runtime requirements — the SQLite adapter targets Node — and the core's declared runtime is Node 22.13 or newer; Bun, Deno and Workers are not promised.",
	},
	{
		question: 'Does Oribos support MCP?',
		answer:
			"Yes. @oribos/mcp-server serves your tools over MCP through HTTP or stdio, and @oribos/mcp-client brings another server's tools in as ordinary Oribos tools — plain objects, no registry. Both ship with the first release.",
	},
	{
		question: 'Does Oribos support RAG or evals?',
		answer:
			"No — neither is built in. Both sit on the framework's deferred list and will be reopened against real use-case signals, with no schedule promised. Eval-style assertions can already hang off processors, and observability is built in: a tracer with spans, exportable to any OTLP collector with GenAI semantic conventions.",
	},
	{
		question: 'Is Oribos production-ready?',
		answer:
			'Pre-1.0: everything this site describes is implemented and verified, but 0.x releases reserve the right to make breaking changes, and 1.0 is not scheduled. Pin the version you build against and follow releases — storage ports become additive-only from 1.0.',
	},
	{
		question: "What's the license?",
		answer: 'Apache-2.0. Code and examples are licensed under it; the license covers code, not the name.',
	},
];

/** SPEC §9.2: the RAG / evals words — question 7's answer is the only place they may appear. */
const ragEvals = ragEvalsRule.pattern;
/** SPEC §3.7: packages are `@oribos/*` — any other `@scope/name` is a finding. */
const packageScope = /\B@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*/gi;

/** SPEC §5.5: the FAQ section reads on the page background — the audited roles only. */
const faqSection = [{ marker: 'data-faq', label: 'FAQ section' }];

/**
 * How many sentences a §3.7 answer holds: a `.`/`!`/`?` ends one when a capitalised word or the
 * text's end follows it — so `22.13`, `Apache-2.0` and `Pre-1.0` never split a sentence.
 */
export function sentenceCount(text: string): number {
	const terminators = [...text.matchAll(/[.!?](?=\s+(?:["'(\[])?[A-Z]|\s*$)/g)].length;
	return terminators === 0 ? 1 : terminators;
}

/** Whether a built page carries the FAQ — `check-faq.mjs`'s page filter, the rules' own lookup. */
export function carriesFaq(html: string): boolean {
	return elementOf(html, 'section', 'data-faq') !== null;
}

/** SPEC §3.7/§9.2: the `#faq` section, the nine pairs, and the iron rules they hold. */
export function faqIssues(page: FaqPage): string[] {
	const section = elementOf(page.html, 'section', 'data-faq');
	if (section === null) return [`${page.path}: no FAQ section — the page carries \`#faq\` (SPEC §3.7)`];

	const issues: string[] = [];

	const id = attributeValue(section.slice(0, section.indexOf('>') + 1), 'id');
	if (id !== 'faq') {
		issues.push(
			`${page.path}: the FAQ section's id is \`${id ?? 'nothing'}\`, expected \`faq\` — \`#faq\` direct-links it (SPEC §2.5)`,
		);
	}

	const heading = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
	if (heading === undefined || textOf(heading) !== faqHeading) {
		issues.push(
			`${page.path}: the FAQ heading reads \`${heading === undefined ? 'nothing' : textOf(heading)}\`, expected \`${faqHeading}\` (SPEC §3.7)`,
		);
	}

	const ragIndex = faqItems.findIndex((item) => /\bRAG\b/i.test(item.question));
	const entries = [...section.matchAll(/<details\b[^>]*>[\s\S]*?<\/details>/gi)].map((match) => match[0]);
	if (entries.length !== faqItems.length) {
		issues.push(
			`${page.path}: the FAQ carries ${entries.length} questions, expected ${faqItems.length} — none added, none dropped (SPEC §3.7)`,
		);
	}

	entries.forEach((entry, index) => {
		const expected = faqItems[index];
		if (expected === undefined) return;

		const inner = entry.slice(entry.indexOf('>') + 1);
		if (!/^\s*<summary\b/i.test(inner)) {
			issues.push(`${page.path}: question ${index + 1}'s <summary> is not the first child of its <details> (SPEC §3.7)`);
		}
		const summary = entry.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
		if (summary === undefined || textOf(summary) !== expected.question) {
			issues.push(
				`${page.path}: question ${index + 1} reads \`${summary === undefined ? 'nothing' : textOf(summary)}\`, expected \`${expected.question}\` (SPEC §3.7)`,
			);
		}
		const answerMarkup = inner.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '');
		const answer = textOf(answerMarkup);
		if (answer !== expected.answer) {
			issues.push(`${page.path}: the answer to question ${index + 1} is not the §3.7 text verbatim`);
		}
		if (linksOf(answerMarkup).length > 0) {
			issues.push(`${page.path}: question ${index + 1}'s answer carries a link — answers are self-contained (SPEC §3.7)`);
		}

		const text = `${textOf(summary ?? '')} ${answer}`;
		for (const rule of redLineRules) {
			for (const match of ruleMatches(rule, text)) {
				issues.push(`${page.path}: question ${index + 1} reads \`${match[0]}\` — ${rule.reason} [${rule.id}]`);
			}
		}
		for (const match of text.matchAll(packageScope)) {
			if (!match[0].toLowerCase().startsWith('@oribos/')) {
				issues.push(`${page.path}: question ${index + 1} names \`${match[0]}\` — packages are \`@oribos/*\` (SPEC §3.7)`);
			}
		}
		for (const { term, reason } of terminologyHits(text)) {
			issues.push(`${page.path}: question ${index + 1} reads \`${term}\` — ${reason}`);
		}
		if (index !== ragIndex) {
			const match = text.match(ragEvals);
			if (match !== null) {
				issues.push(
					`${page.path}: question ${index + 1} mentions \`${match[0]}\` — only question ${ragIndex + 1} answers the RAG / evals line (SPEC §3.7/§9.2)`,
				);
			}
		}
	});

	// The section is the heading and the nine pairs — nothing else, nothing reordered.
	const expectedText = [faqHeading, ...faqItems.flatMap((item) => [item.question, item.answer])].join(' ');
	const text = textOf(section);
	if (text !== expectedText) {
		issues.push(
			`${page.path}: the FAQ reads more than the §3.7 heading and nine question / answer pairs, or reorders them (SPEC §3.7)`,
		);
	}

	issues.push(...sectionColourIssues(page, faqSection));

	return issues;
}
