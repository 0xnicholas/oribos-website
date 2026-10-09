/**
 * The use-case pages (SPEC §4.3) over the built site: the shared header art — one abstract
 * neutral banner with amber orbit / span geometry, no copy, no logo, painted with the brand
 * tokens and identical on every use-case page — then the skeleton in order: H1 (the home card's
 * title) + tagline, the three scenario cards (name, 2–3 sentences, the `→` package line with
 * every package its own inline-code chip), the shared final CTA, the global FAQ ×9 and the
 * `← All use cases` back link. The page keeps its red lines: no code block, no social-proof
 * band, no breadcrumbs. The head carries the §2.6 meta description and the og pair.
 *
 * The §9.3 vocabulary guards hold the pages' prose; the package line names subsystems, so it is
 * checked for shape (`→`, `·` separators, one chip per package) and scope (every `@scope/name`
 * is `@oribos/*`) rather than for prose vocabulary — §4.3's own note renders two of its labels
 * as English phrases.
 *
 * Like the hero, feature, band and FAQ rules, the strings here are the spec's copy —
 * deliberately not read from the content collections that render them, so the page and its gate
 * cannot agree by construction. All three pages' §4.3 copy is registered now【终稿·勿改】; the
 * gate checks the pages the build has and reports the rest as pending, like the shell gate.
 */

import { AA, contrastRatio, parseHex, type Theme, type TokenSet } from './brand-tokens.ts';
import { sectionColourIssues } from './colour-rules.ts';
import { redLineRules, ruleMatches } from './copy-rules.ts';
import { attributeValue, elementOf, linksOf, markersInOrder, tagsOf, textOf } from './html.ts';
import { terminologyHits } from './terminology.ts';

export type ScenarioPage = { path: string; html: string };
export type ScenarioCardSpec = { name: string; text: string; packages: readonly string[] };
export type UseCasePageSpec = {
	/** The page's route (SPEC §2.1), trailing slash as the registry spells it. */
	route: string;
	/** H1 = the home card's title (SPEC §4.3). */
	h1: string;
	/** The 1–2 line tagline under the H1 (SPEC §4.3 【终稿·勿改】). */
	tagline: string;
	/** The §2.6 meta description — og:description reuses it. */
	description: string;
	/** The three scenario cards, in page order (SPEC §4.3 【终稿·勿改】). */
	scenarios: readonly ScenarioCardSpec[];
};

/** SPEC §4.3 页底【SPEC 起草·可润色】: the back link's text and target (§2.5). */
export const backLinkText = '← All use cases';
export const backLinkHref = '/#use-cases';

/** SPEC §4.3 + §2.6: the three use-case pages' locked copy, in §3.5 card order. */
export const useCasePages: readonly UseCasePageSpec[] = [
	{
		route: '/in-product-agents/',
		h1: 'In-product agents',
		tagline: 'Answer your users, act inside your product, hand off to a human.',
		description:
			'Embed an assistant in the app you already run — streaming, tool calls and human handoff, with no second service to operate.',
		scenarios: [
			{
				name: 'Answer, streamed into your UI',
				text: 'agent.stream() on the server, the AI SDK message-stream route on the client, thread / resource memory so each user picks up where they left off.',
				packages: ['@oribos/core/agent', '@oribos/core/memory', '@oribos/ai-sdk'],
			},
			{
				name: 'Act, through your own APIs',
				text: 'Your endpoints become tools — plain objects with schemas — and multi-step flows compose as workflows where every boundary is validated.',
				packages: ['@oribos/core/tools', '@oribos/core/workflows'],
			},
			{
				name: 'Hand off, with the run on hold',
				text: 'Approval-listed tool calls never execute: the run suspends, and resume({ approved }) continues it — even from another process.',
				packages: ['@oribos/core/durable-agent', '@oribos/sqlite'],
			},
		],
	},
	{
		route: '/operations-agents/',
		h1: 'Operations agents',
		tagline: 'Bring your tools in over MCP, gate risky actions on approval, wake the agent on a schedule.',
		description:
			'Agents that handle the busywork around your team — MCP tools, approval gates and schedules, with a human on the risky steps.',
		scenarios: [
			{
				name: 'Bring your tools in, unchanged',
				text: 'MCP servers you already run stay where they are; their tools arrive as ordinary Oribos tools — plain objects, no registry.',
				packages: ['@oribos/mcp-client'],
			},
			{
				name: 'A human on the risky step',
				text: 'Approval-listed calls suspend instead of executing — approve to continue, reject and the model replans; the snapshot is JSON and survives the process.',
				packages: ['@oribos/core/durable-agent', '@oribos/sqlite'],
			},
			{
				name: 'Wake it on a schedule, not a worker',
				text: 'tick() fired by a platform cron is the first-class shape; @oribos/croner supplies the cron expressions, signals wake or inject into a thread.',
				packages: ['@oribos/core/schedules', '@oribos/core/signals', '@oribos/croner'],
			},
		],
	},
	{
		route: '/developer-infrastructure/',
		h1: 'Platform & developer infra',
		tagline: 'Ship primitives other teams build on — each team installs only what it uses.',
		description:
			'Shared agent primitives your product teams compose — subpath imports, capability packages added one at a time, OTLP observability.',
		scenarios: [
			{
				name: 'Primitives, not a platform',
				text: 'Teams import only the subpaths they need and add capability packages one at a time; the composition root is optional and a bare new Agent() stays first-class.',
				packages: ['@oribos/core/*', 'capability packages added one at a time'],
			},
			{
				name: 'Into the observability you already run',
				text: 'Oribos traces its own minimal spans; @oribos/otlp exports them with GenAI semantic conventions to your collector — one tracer handed down by the app.',
				packages: ['@oribos/core/observability', '@oribos/otlp'],
			},
			{
				name: 'Publish agents as shared infrastructure',
				text: "Serve an MCP endpoint other teams and systems call — and compose one team's agent as a tool on another's.",
				packages: ['@oribos/mcp-server', 'as-tool composition'],
			},
		],
	},
];

/* ---------------------------------------------------------------- reading the page */

/** Whether a built page is a use-case page — `check-scenarios.mjs`'s page filter. */
export function carriesUseCasePage(html: string): boolean {
	return elementOf(html, 'section', 'data-scenarios') !== null;
}

function artOf(html: string): string | null {
	return elementOf(html, 'figure', 'data-use-case-art');
}

function scenarioCardsOf(section: string): string[] {
	return [...section.matchAll(/<li\b[^>]*\bdata-scenario-card\b[^>]*>[\s\S]*?<\/li>/gi)].map((match) => match[0]);
}

function packagesOf(card: string): string | null {
	return card.match(/<p\b[^>]*\bdata-scenario-packages\b[^>]*>[\s\S]*?<\/p>/i)?.[0] ?? null;
}

/** The page regions a rule scans when the package lines are not its subject. */
function proseOf(html: string): string {
	return html.replace(/<p\b[^>]*\bdata-scenario-packages\b[^>]*>[\s\S]*?<\/p>/gi, ' ');
}

/* ---------------------------------------------------------------- the skeleton */

/** SPEC §4.3: the art, the hero, the three cards, the page order and the red lines. */
export function useCasePageIssues(page: ScenarioPage, spec: UseCasePageSpec): string[] {
	const issues: string[] = [];

	issues.push(...artIssues(page));
	issues.push(...heroIssues(page, spec));
	issues.push(...cardIssues(page, spec));
	issues.push(...orderIssues(page));
	issues.push(...redLineIssues(page));
	issues.push(...backLinkIssues(page));
	issues.push(...proseIssues(page));

	return issues;
}

/** SPEC §4.3 页头图: one shared abstract banner — no copy, no logo, brand tokens only. */
function artIssues(page: ScenarioPage): string[] {
	const figures = [...page.html.matchAll(/<figure\b[^>]*\bdata-use-case-art\b[^>]*>/gi)];
	if (figures.length === 0) {
		return [`${page.path}: no shared header art — the use-case pages carry one abstract banner (SPEC §4.3)`];
	}
	if (figures.length > 1) {
		return [`${page.path}: ${figures.length} header-art figures — the page carries the one shared banner (SPEC §4.3)`];
	}

	const issues: string[] = [];
	const art = artOf(page.html)!;
	const opening = figures[0]![0];

	if (attributeValue(opening, 'aria-hidden') !== 'true') {
		issues.push(`${page.path}: the header art is not hidden from assistive technology — it is decoration, no copy (SPEC §4.3)`);
	}

	const viewBox = attributeValue(art.match(/<svg\b[^>]*>/i)?.[0] ?? '', 'viewBox');
	if (viewBox !== '0 0 1600 600') {
		issues.push(`${page.path}: the header art's viewBox is \`${viewBox ?? 'nothing'}\` — not the 1600×600 banner (SPEC §4.3)`);
	}

	for (const tag of ['text', 'image', 'img'] as const) {
		const count = tagsOf(art, tag).length;
		if (count > 0) {
			issues.push(`${page.path}: the header art carries <${tag}> — no copy, no logo, no third-party name (SPEC §4.3)`);
		}
	}
	if (textOf(art) !== '') {
		issues.push(`${page.path}: the header art reads \`${textOf(art)}\` — no copy (SPEC §4.3)`);
	}

	const paints = [...art.matchAll(/\b(?:fill|stroke)\s*=\s*"([^"]*)"/gi)].map((match) => match[1]!);
	for (const paint of paints) {
		if (paint !== 'none' && !/^var\(--(?:bg2?|ink[23]?|line|acc(?:-h|-lo|-inv)?|code-bg)\)$/.test(paint)) {
			issues.push(`${page.path}: the header art paints with \`${paint}\` — the brand tokens are the palette (SPEC §4.3/§2.1)`);
		}
	}
	if (!paints.some((paint) => /^var\(--acc\)$/.test(paint))) {
		issues.push(`${page.path}: the header art has no amber geometry — the orbit / span shapes are the accent (SPEC §4.3)`);
	}
	if (!paints.some((paint) => paint === 'var(--bg2)' || paint === 'var(--bg)')) {
		issues.push(`${page.path}: the header art has no neutral base (SPEC §4.3)`);
	}

	return issues;
}

/** SPEC §4.3: H1 (the home card's title) + the 1–2 line tagline — the page's only h1. */
function heroIssues(page: ScenarioPage, spec: UseCasePageSpec): string[] {
	const hero = elementOf(page.html, 'section', 'data-use-case-hero');
	if (hero === null) {
		return [`${page.path}: no hero section — the page opens with H1 + tagline (SPEC §4.3)`];
	}

	const issues: string[] = [];
	const h1s = tagsOf(page.html, 'h1');
	if (h1s.length !== 1) {
		issues.push(`${page.path}: the page carries ${h1s.length} <h1> — the H1 is the home card's title, once (SPEC §4.3)`);
	}

	const h1 = hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
	if (h1 === undefined || textOf(h1) !== spec.h1) {
		issues.push(`${page.path}: the H1 reads \`${h1 === undefined ? 'nothing' : textOf(h1)}\`, expected \`${spec.h1}\` (SPEC §4.3)`);
	}

	const tagline = hero.match(/<p\b[^>]*\bdata-use-case-tagline\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	if (tagline === undefined || textOf(tagline) !== spec.tagline) {
		issues.push(`${page.path}: the tagline is not the §4.3 line verbatim`);
	}

	return issues;
}

/** SPEC §4.3: the three scenario cards — name, 2–3 sentences, the `→` package line. */
function cardIssues(page: ScenarioPage, spec: UseCasePageSpec): string[] {
	const section = elementOf(page.html, 'section', 'data-scenarios');
	if (section === null) {
		return [`${page.path}: no scenario section — the cards are the page's argument (SPEC §4.3)`];
	}

	const issues: string[] = [];
	const cards = scenarioCardsOf(section);
	if (cards.length !== spec.scenarios.length) {
		issues.push(`${page.path}: the scenario section carries ${cards.length} scenario card(s), expected ${spec.scenarios.length} (SPEC §4.3)`);
	}

	cards.forEach((card, index) => {
		const expected = spec.scenarios[index];
		if (expected === undefined) return;
		const label = `card ${index + 1}`;

		const name = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1];
		if (name === undefined || textOf(name) !== expected.name) {
			issues.push(`${page.path}: ${label}'s name reads \`${name === undefined ? 'nothing' : textOf(name)}\`, expected \`${expected.name}\` (SPEC §4.3)`);
		}

		const prose = card.replace(/<p\b[^>]*\bdata-scenario-packages\b[^>]*>[\s\S]*?<\/p>/i, ' ');
		const text = prose.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
		if (text === undefined || textOf(text) !== expected.text) {
			issues.push(`${page.path}: ${label}'s text is not the §4.3 copy verbatim`);
		}

		const line = packagesOf(card);
		if (line === null) {
			issues.push(`${page.path}: ${label} carries no \`→\` package line (SPEC §4.3)`);
			return;
		}
		const chips = [...line.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/gi)].map((match) => textOf(match[1]!));
		if (chips.length !== expected.packages.length || chips.some((chip, position) => chip !== expected.packages[position])) {
			issues.push(`${page.path}: ${label} does not render every package as its own <code> — ${expected.packages.join(' · ')} (SPEC §4.3)`);
		}
		const expectedLine = `→ ${expected.packages.join(' · ')}`;
		if (textOf(line) !== expectedLine) {
			issues.push(`${page.path}: ${label}'s package line reads \`${textOf(line)}\`, expected \`${expectedLine}\` (SPEC §4.3)`);
		}
	});

	return issues;
}

/** SPEC §4.3: the skeleton's reading order — art → hero → cards → CTA → FAQ → back link. */
function orderIssues(page: ScenarioPage): string[] {
	const markers = ['data-use-case-art', 'data-use-case-hero', 'data-scenarios', 'id="get-started"', 'data-faq', 'data-use-case-back'];
	if (markersInOrder(page.html, markers)) return [];
	return [`${page.path}: the skeleton is out of order — art → H1 → scenario cards → GitHub CTA → FAQ → \`← All use cases\` (SPEC §4.3)`];
}

/** SPEC §4.3: no code block on the page, no social-proof band, no breadcrumbs. */
function redLineIssues(page: ScenarioPage): string[] {
	const issues: string[] = [];

	if (/<pre\b/i.test(page.html)) {
		issues.push(`${page.path}: the page carries a <pre> code block — use-case pages hold no code (SPEC §4.3)`);
	}
	if (elementOf(page.html, 'section', 'data-social-proof') !== null) {
		issues.push(`${page.path}: the page carries a social-proof band — the scenario cards hold the case slot (SPEC §4.3)`);
	}
	if (/aria-label\s*=\s*"breadcrumb"/i.test(page.html) || /\bdata-breadcrumbs?\b/i.test(page.html)) {
		issues.push(`${page.path}: the page carries a breadcrumb — marketing pages have none (SPEC §2.5/§4.3)`);
	}

	return issues;
}

/** SPEC §4.3/§2.5: the page ends with `← All use cases` → `/#use-cases`. */
function backLinkIssues(page: ScenarioPage): string[] {
	const section = elementOf(page.html, 'section', 'data-use-case-back');
	if (section === null) {
		return [`${page.path}: no back-link section — the page ends with \`← All use cases\` (SPEC §4.3)`];
	}
	const link = linksOf(section).find((candidate) => candidate.href === backLinkHref && candidate.text === backLinkText);
	if (link === undefined) {
		return [`${page.path}: no \`← All use cases\` link to \`/#use-cases\` at the page's end (SPEC §4.3/§2.5)`];
	}
	return [];
}

/** SPEC §9.2/§9.3: the prose's vocabulary, red lines and the `@oribos/*` package scope. */
function proseIssues(page: ScenarioPage): string[] {
	const section = elementOf(page.html, 'section', 'data-scenarios');
	if (section === null) return [];

	const issues: string[] = [];
	const prose = textOf(proseOf([elementOf(page.html, 'section', 'data-use-case-hero') ?? '', section].join('\n')));

	for (const { term, reason } of terminologyHits(prose)) {
		issues.push(`${page.path}: the page reads \`${term}\` — ${reason}`);
	}

	for (const rule of redLineRules) {
		for (const match of ruleMatches(rule, prose)) {
			issues.push(`${page.path}: the page reads \`${match[0]}\` — ${rule.reason}`);
		}
	}

	for (const match of textOf(section).matchAll(/@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*/gi)) {
		if (!match[0].startsWith('@oribos/')) {
			issues.push(`${page.path}: \`${match[0]}\` is not a \`@oribos/\` package — the package line names Oribos subsystems only (SPEC §3.7/§4.3)`);
		}
	}

	return issues;
}

/* ---------------------------------------------------------------- the colours */

/**
 * SPEC §2.10 over the page's own sections: they read on the page background in the audited
 * roles, like the home bands. The package chips wear the secondary surface (`--bg2`), the
 * same surface pair the AA audit measures.
 */
export function useCaseColourIssues(page: ScenarioPage): string[] {
	return sectionColourIssues(page, [
		{ marker: 'data-use-case-hero', label: 'use-case hero' },
		{ marker: 'data-scenarios', label: 'scenario cards' },
		{ marker: 'data-use-case-back', label: 'back link' },
	]);
}

/** SPEC §4.3 三页同图: the header art is byte-identical on every built use-case page. */
export function sharedArtIssues(pages: readonly ScenarioPage[]): string[] {
	const arts = pages.map((page) => artOf(page.html)).filter((art): art is string => art !== null);
	if (arts.length <= 1) return [];
	const [first, ...rest] = arts;
	return rest.some((art) => art !== first)
		? ['the header art is not the same figure on every use-case page — one shared abstract banner (SPEC §4.3)']
		: [];
}

/**
 * SPEC §4.3/§2.10: the package chips' rendered pair — secondary ink on the secondary surface
 * — clears AA in both themes, the same pair the token audit measures.
 */
export function scenarioContrastIssues(tokens: Record<Theme, TokenSet>): string[] {
	const issues: string[] = [];

	for (const theme of ['light', 'dark'] as const) {
		const fg = tokens[theme]['--ink2'];
		const bg = tokens[theme]['--bg2'];
		if (fg === undefined || bg === undefined) {
			issues.push(`${theme}: the package chip pair needs tokens the §2.1 layer does not declare (SPEC §4.3/§2.10)`);
			continue;
		}
		if (parseHex(fg) === null || parseHex(bg) === null) {
			issues.push(`${theme}: the package chip pair resolves to a value the audit cannot measure (${fg} on ${bg})`);
			continue;
		}
		const ratio = contrastRatio(fg, bg);
		if (ratio < AA) {
			issues.push(`${theme}: package chip text on its surface is ${ratio.toFixed(2)}:1 — below the ${AA}:1 floor (SPEC §4.3/§2.10)`);
		}
	}

	return issues;
}
