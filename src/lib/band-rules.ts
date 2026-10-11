/**
 * The home page's bands (SPEC-revamp §3.2 facts, §3.3 observability, §3.6 resources, §7.4) and
 * the §3 nine-zone section order: each band's anchor and its verbatim copy, the observability
 * trio (the one code card, the trace waterfall reused from the hero, the span type list), the
 * resources cards' descriptions, and the two rules the bands share: no counting-style figures
 * (§9.2), and text painted only in the roles §5.5 audits on the page background. The social-proof
 * band is abolished (SPEC-revamp §3.2): a relic check keeps it from coming back.
 *
 * Like the hero and feature rules, the strings here are the spec's copy — deliberately not read
 * from the content collections that render them, so the page and its gate cannot agree by
 * construction.
 */

import { sectionColourIssues } from './colour-rules.ts';
import { traceMeta, traceRows } from './hero-rules.ts';
import { attributeValue, codeBlocksOf, elementOf, linksOf, missingCodeSurface, occurrences, tagsOf, textOf, times } from './html.ts';
import { LINKS, type ResourceLinkKey } from './links.ts';

export type BandPage = { path: string; html: string };

/** SPEC-revamp §3.2 【终稿·勿改】: the architecture facts band's four cells, in order. */
export const factsStrip = [
	'0 runtime dependencies',
	'Every subsystem a subpath export',
	'No database, no queue, no long-running process',
	'Size is a checked property',
] as const;

/** SPEC §3.3 【终稿·勿改】: the observability band's kicker, H2 claim, lead and card claim. */
export const observabilityKicker = 'Observability';
export const observabilityClaim = 'Every run traced. OTLP when you want it.';
export const observabilityLead =
	'Agent runs, model steps, tool calls, workflow steps, memory recall and save — traced by default. Built-in console and memory exporters; @oribos/otlp maps Oribos spans to the GenAI semantic conventions. A standalone agent with no tracer stays zero-overhead.';
export const observabilityCardClaim = 'One tracer, distributed by the composition root.';
/** SPEC-revamp §3.4: the span type list — structured mono entries, not a terminal output block. */
export const spanTypes = ['agent run', 'model step', 'tool call', 'workflow step', 'memory recall · save'] as const;
/** SPEC §3.3/§7.1/§7.4: the card's single file, its snippet, and the observability line cap. */
export const observabilityFile = 'app.ts';
export const maxBandLines = 10;
export const observabilitySnippet = `import { createApp } from '@oribos/core';
import { createTracer, consoleExporter } from '@oribos/core/observability';
import { createOtlpExporter } from '@oribos/otlp';

const app = createApp({
  tracer: createTracer({ exporters: [consoleExporter(), createOtlpExporter({ url })] }),
});

const agent = app.agent({ name, instructions, model });   // one tracer, every agent`;

/** SPEC-revamp §3.6: the resources band's kicker and its three cards — labels, targets and the
 * one-line descriptions (【终稿·勿改】). No changelog flow, no Releases card. */
export const resourcesKicker = 'Go deeper';
export type BandResourceLink = { label: string; key: ResourceLinkKey; description: string };
export const resourceCards: readonly BandResourceLink[] = [
	{
		label: 'Docs',
		key: 'docs',
		description: 'Concepts and reference for every subsystem — agents, tools, memory, workflows, observability.',
	},
	{ label: 'Examples', key: 'examples', description: 'Working examples from the repository — copy one and start building.' },
	{
		label: 'Architecture',
		key: 'architecture',
		description: 'How the framework stays ultralight — architecture decisions and the CI byte budget mechanism.',
	},
];

/** SPEC-revamp §3: the home page's fixed nine-zone reading order, hero to final CTA. */
export const homeSectionOrder = [
	{ marker: 'data-hero', label: 'hero' },
	{ marker: 'data-facts', label: 'facts band' },
	{ marker: 'data-features', label: 'feature tabs' },
	{ marker: 'data-observability', label: 'observability band' },
	{ marker: 'data-use-cases', label: 'use-case cards' },
	{ marker: 'data-resources', label: 'resources band' },
	{ marker: 'data-faq', label: 'FAQ' },
	{ marker: 'id="get-started"', label: 'final CTA' },
] as const;

/* ---------------------------------------------------------------- reading the page */

/** The colour scan's sections: the three bands, by their `data-` marker. */
const bandSections = [
	{ marker: 'data-observability', label: 'observability band' },
	{ marker: 'data-facts', label: 'facts band' },
	{ marker: 'data-resources', label: 'resources band' },
];

/** The markup of a band, or `null` when the page does not carry it. */
function bandOf(page: BandPage, marker: string): string | null {
	return elementOf(page.html, 'section', marker);
}

/** Every `<p>` of a fragment, as its opening tag and its rendered text. */
function paragraphsOf(fragment: string): { tag: string; text: string }[] {
	return [...fragment.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => ({
		tag: match[0].slice(0, match[0].indexOf('>') + 1),
		text: textOf(match[1]!),
	}));
}

/** The rendered text of every heading of one kind, in document order. */
function headingsOf(fragment: string, tag: string): string[] {
	return [...fragment.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((match) =>
		textOf(match[1]!),
	);
}

/** The labels of the fragment's `role="tab"` buttons, in document order. */
function tabLabelsOf(fragment: string): string[] {
	return [...fragment.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)]
		.filter((match) => attributeValue(match[0].slice(0, match[0].indexOf('>') + 1), 'role') === 'tab')
		.map((match) => textOf(match[0]));
}

/** A band's copy without its code blocks — what the §9.2 counting rule is about. */
function copyOf(fragment: string): string {
	return textOf(fragment.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, ' '));
}

/** The fragment with its trace waterfall removed — the run capture is data, not band copy. */
function withoutTrace(fragment: string): string {
	const trace = elementOf(fragment, 'div', 'data-trace');
	return trace === null ? fragment : fragment.replace(trace, ' ');
}

/* ---------------------------------------------------------------- the facts band */

/**
 * SPEC-revamp §3.2: the architecture facts band — one row of four mono cells, the hairline
 * between them, no kicker, no heading, and no anchor of its own (nothing links to it).
 */
export function factsIssues(page: BandPage): string[] {
	const section = bandOf(page, 'data-facts');
	if (section === null) return [`${page.path}: no facts band — the home page carries the §3.2 architecture facts strip`];

	const issues: string[] = [];
	const opening = section.slice(0, section.indexOf('>') + 1);
	if (attributeValue(opening, 'id') !== null) {
		issues.push(`${page.path}: the facts band carries an id — the §3.2 strip sets no anchor (SPEC-revamp §3.2)`);
	}
	for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'] as const) {
		if (tagsOf(section, tag).length > 0) {
			issues.push(`${page.path}: the facts band carries a <${tag}> — four mono cells, no kicker, no heading, no link (SPEC-revamp §3.2)`);
		}
	}

	const cells = [...section.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/gi)].map((match) => match[0]);
	if (cells.length !== factsStrip.length) {
		issues.push(`${page.path}: the facts band carries ${cells.length} cell(s), expected ${factsStrip.length} (SPEC-revamp §3.2)`);
	}
	cells.forEach((cell, index) => {
		const expected = factsStrip[index];
		if (expected === undefined) return;
		if (textOf(cell) !== expected) {
			issues.push(`${page.path}: facts cell ${index + 1} reads \`${textOf(cell)}\`, expected \`${expected}\` (SPEC-revamp §3.2)`);
		}
		const classes = attributeValue(cell.slice(0, cell.indexOf('>') + 1), 'class') ?? '';
		if (!/\bfont-mono\b/.test(classes) || !/\btext-xs\b/.test(classes)) {
			issues.push(`${page.path}: facts cell ${index + 1} is not mono \`--t-xs\` — the strip's one type treatment (SPEC-revamp §3.2)`);
		}
	});

	return issues;
}

/* ---------------------------------------------------------------- the observability band */

/** SPEC §3.3/§7.1/§7.4, SPEC-revamp §3.4: the band, its copy, and the three-piece group. */
export function observabilityIssues(page: BandPage): string[] {
	const section = bandOf(page, 'data-observability');
	if (section === null) return [`${page.path}: no observability band — the home page carries \`#observability\` (SPEC §3.3)`];

	const issues: string[] = [];
	// The waterfall's meta/summary lines are capture data, not band copy — read without them.
	const paragraphs = paragraphsOf(withoutTrace(section));
	if (paragraphs.length > 2) {
		issues.push(`${page.path}: the observability band carries ${paragraphs.length} paragraphs — the §3.3 copy is the kicker and the lead`);
	}
	if (paragraphs[0]?.text !== observabilityKicker) {
		issues.push(
			`${page.path}: the observability kicker reads \`${paragraphs[0]?.text ?? 'nothing'}\`, expected \`${observabilityKicker}\` (SPEC §3.3)`,
		);
	}
	if (paragraphs[1]?.text !== observabilityLead) {
		issues.push(`${page.path}: the observability lead is not the §3.3 paragraph verbatim`);
	}

	const claims = headingsOf(section, 'h2');
	if (claims.length !== 1 || claims[0] !== observabilityClaim) {
		issues.push(
			`${page.path}: the observability H2 reads \`${claims[0] ?? 'nothing'}\`, expected \`${observabilityClaim}\` (SPEC §3.3)`,
		);
	}
	const cardClaims = headingsOf(section, 'h3');
	if (cardClaims.length !== 1 || cardClaims[0] !== observabilityCardClaim) {
		issues.push(
			`${page.path}: the observability card claim reads \`${cardClaims[0] ?? 'nothing'}\`, expected \`${observabilityCardClaim}\` (SPEC §3.3)`,
		);
	}

	// SPEC §3.3: kicker → H2 claim → lead → the card claim, in that reading order.
	const order = [observabilityKicker, observabilityClaim, observabilityLead, observabilityCardClaim].map((part) =>
		section.indexOf(part),
	);
	if (order.every((index) => index >= 0) && order.some((index, position) => position > 0 && index < order[position - 1]!)) {
		issues.push(`${page.path}: the observability band's copy is out of order — kicker, H2 claim, lead, then the card claim (SPEC §3.3)`);
	}

	// SPEC §3.3/§7.4: one file — `app.ts` — and its snippet, verbatim and ≤10 lines (§7.1).
	const tabs = tabLabelsOf(section);
	if (tabs.length !== 1 || tabs[0] !== observabilityFile) {
		issues.push(
			`${page.path}: the observability card's file tabs are [${tabs.join(', ')}], expected [${observabilityFile}] — the card is one file (SPEC §3.3/§7.4)`,
		);
	}

	const blocks = codeBlocksOf(section);
	if (blocks.length !== 1) {
		issues.push(`${page.path}: the observability band carries ${blocks.length} code blocks, expected the one §7.4 card (SPEC §3.3)`);
	}
	const code = blocks[0];
	if (code !== observabilitySnippet) {
		issues.push(`${page.path}: \`${observabilityFile}\` is not the §7.4 snippet verbatim (SPEC §7.4)`);
	}
	if (code !== undefined && code.split('\n').length > maxBandLines) {
		issues.push(`${page.path}: the \`${observabilityFile}\` snippet is ${code.split('\n').length} lines — the observability card caps at ${maxBandLines} (SPEC §7.1)`);
	}
	const pre = section.match(/<pre\b[^>]*>/i)?.[0];
	if (pre !== undefined) {
		for (const expected of missingCodeSurface(pre)) {
			issues.push(`${page.path}: the observability code block is missing \`${expected}\` (SPEC §8.5)`);
		}
	}

	// SPEC-revamp §3.4: the trio's second piece — the trace waterfall, the hero's own component
	// and data rendered again here (two placements of one run, not two runs).
	const trace = elementOf(section, 'div', 'data-trace');
	if (trace === null) {
		issues.push(`${page.path}: the observability band carries no trace waterfall — the §3.4 trio is the code card, the waterfall and the span list`);
	} else {
		if (!textOf(trace).includes(traceMeta)) {
			issues.push(`${page.path}: the observability waterfall is not the §7.5 capture — the hero's data, reused (SPEC-revamp §3.4)`);
		}
		const rows = [...trace.matchAll(/<li\b[^>]*\bdata-trace-row\b[^>]*>[\s\S]*?<\/li>/gi)];
		if (rows.length !== traceRows.length) {
			issues.push(`${page.path}: the observability waterfall carries ${rows.length} lanes, expected ${traceRows.length} — the hero's data, reused`);
		}
	}
	// The same run in both windows: the capture's meta line reads exactly twice on the page.
	const metaCount = occurrences(textOf(page.html), traceMeta);
	if (metaCount !== 2) {
		issues.push(`${page.path}: the §7.5 meta line appears ${times(metaCount)} — the hero window and the observability band carry the same run (SPEC-revamp §3.4)`);
	}

	// SPEC-revamp §3.4: the trio's third piece — the span type list, structured mono entries.
	const spanList = elementOf(section, 'ul', 'data-span-list');
	if (spanList === null) {
		issues.push(`${page.path}: the observability band carries no span type list — the §3.4 trio's structured entries (SPEC-revamp §3.4)`);
	} else {
		const entries = [...spanList.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/gi)].map((match) => match[0]);
		if (entries.length !== spanTypes.length) {
			issues.push(`${page.path}: the span type list carries ${entries.length} entr(ies), expected ${spanTypes.length} (SPEC-revamp §3.4)`);
		}
		entries.forEach((entry, index) => {
			const expected = spanTypes[index];
			if (expected === undefined) return;
			if (textOf(entry) !== expected) {
				issues.push(`${page.path}: span type ${index + 1} reads \`${textOf(entry)}\`, expected \`${expected}\` (SPEC-revamp §3.4)`);
			}
			const classes = attributeValue(entry.slice(0, entry.indexOf('>') + 1), 'class') ?? '';
			if (!/\bfont-mono\b/.test(classes)) {
				issues.push(`${page.path}: span type ${index + 1} is not mono — structured entries, not terminal output (SPEC-revamp §3.4)`);
			}
		});
	}

	// The claim and the snippet live in the band and nowhere else on the page (SPEC §3.3).
	const claimCount = occurrences(textOf(page.html), observabilityClaim);
	if (claimCount !== 1) {
		issues.push(`${page.path}: \`${observabilityClaim}\` appears ${times(claimCount)} — the band's copy stays in its band (SPEC §3.3)`);
	}
	const snippetCount = codeBlocksOf(page.html).filter((block) => block === observabilitySnippet).length;
	if (snippetCount !== 1) {
		issues.push(`${page.path}: the §7.4 snippet appears ${times(snippetCount)} on the page (SPEC §3.3)`);
	}

	// SPEC §3.3: no mock image; the band is copy plus the trio.
	for (const tag of ['img', 'picture', 'figure']) {
		if (tagsOf(section, tag).length > 0) {
			issues.push(`${page.path}: the observability band carries an <${tag}> — the §3.3 band has no mock image (SPEC §3.3)`);
		}
	}

	// SPEC §3.3 润色注记: the lead says what is traced; the band grows no default-export claim.
	const copy = copyOf(section);
	for (const pattern of defaultPhrasings) {
		const match = copy.match(pattern);
		if (match !== null) {
			issues.push(
				`${page.path}: the observability band reads \`${sentenceAt(copy, match.index ?? 0)}\` — no "exported by default" claim (SPEC §3.3)`,
			);
		}
	}

	return issues;
}

/** SPEC §3.3 润色注记: phrasings that would read as "everything is exported by default". */
const defaultPhrasings: readonly RegExp[] = [
	/\b(?:all|every|everything)\b[^.]{0,80}\bexport(?:s|ed)?\b/i,
	/\bexport(?:s|ed)?\b[^.]{0,80}\b(?:all|everything)\b/i,
	/\bexports?\b[^.]{0,40}\bby default\b/i,
];

/** The sentence around an index, for a finding a human can read. */
function sentenceAt(text: string, index: number): string {
	const start = text.lastIndexOf('.', Math.max(0, index - 1)) + 1;
	const end = text.indexOf('.', index);
	return text.slice(start, end === -1 ? undefined : end + 1).trim();
}

/* ---------------------------------------------------------------- the resources band */

/** SPEC-revamp §3.6/§2.4: the resources band — the kicker, three cards, nothing else. */
export function resourcesIssues(page: BandPage): string[] {
	const section = bandOf(page, 'data-resources');
	if (section === null) return [`${page.path}: no resources band — the home page carries \`#resources\` (SPEC-revamp §3.6)`];

	const issues: string[] = [];
	const paragraphs = paragraphsOf(section);
	if (paragraphs.length !== resourceCards.length + 1 || paragraphs[0]!.text !== resourcesKicker) {
		issues.push(
			`${page.path}: the resources kicker reads \`${paragraphs[0]?.text ?? 'nothing'}\`, expected \`${resourcesKicker}\` above the three cards (SPEC-revamp §3.6)`,
		);
	}

	const links = linksOf(section);
	if (links.length !== resourceCards.length) {
		issues.push(`${page.path}: the resources band carries ${links.length} link(s), expected ${resourceCards.length} (SPEC-revamp §3.6)`);
	}
	resourceCards.forEach((expected, index) => {
		const link = links[index];
		if (link === undefined) return;
		if (link.text !== expected.label) {
			issues.push(
				`${page.path}: resources link ${index + 1} reads \`${link.text}\`, expected \`${expected.label}\` (SPEC-revamp §3.6)`,
			);
		}
		if (link.href !== LINKS[expected.key]) {
			issues.push(
				`${page.path}: the \`${expected.label}\` link points at \`${link.href}\`, expected \`${LINKS[expected.key]}\` from src/lib/links.ts (SPEC-revamp §2.4)`,
			);
		}
	});

	// Each card is its label plus its one-line description, verbatim (SPEC-revamp §3.6).
	const cards = [...section.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/gi)].map((match) => textOf(match[0]));
	resourceCards.forEach((expected, index) => {
		const card = cards[index];
		if (card === undefined) return;
		if (card !== `${expected.label} ${expected.description}`) {
			issues.push(
				`${page.path}: the \`${expected.label}\` card reads \`${card}\` — the label and the §3.6 description, verbatim (SPEC-revamp §3.6)`,
			);
		}
	});

	if (tagsOf(section, 'button').length > 0) {
		issues.push(`${page.path}: the resources band carries a button — three cards, no CTA (SPEC-revamp §3.6)`);
	}
	const retired = textOf(section).match(/changelog|releases/i);
	if (retired !== null) {
		issues.push(`${page.path}: the resources band reads \`${retired[0]}\` — no changelog flow, no Releases card (SPEC-revamp §3.6)`);
	}

	return issues;
}

/* ---------------------------------------------------------------- the shared rules */

/**
 * SPEC-revamp §3: the home page reads in the nine-zone order — a section that drifts out of the
 * sequence, or goes missing, is a finding.
 */
export function homeSectionOrderIssues(page: BandPage): string[] {
	const issues: string[] = [];
	const at = homeSectionOrder.map(({ marker }) => page.html.indexOf(marker));
	homeSectionOrder.forEach(({ marker, label }, index) => {
		if (at[index] === -1) issues.push(`${page.path}: the home page has no ${label} (\`${marker}\`) — the §3 nine-zone order (SPEC-revamp §3)`);
	});
	for (let index = 1; index < at.length; index += 1) {
		if (at[index] !== -1 && at[index - 1] !== -1 && at[index]! < at[index - 1]!) {
			issues.push(
				`${page.path}: the ${homeSectionOrder[index]!.label} sits before the ${homeSectionOrder[index - 1]!.label} — the §3 nine-zone order (SPEC-revamp §3)`,
			);
		}
	}
	return issues;
}

/**
 * SPEC-revamp §3.2: the social-proof band is abolished — component, content collection and
 * `#social-proof` anchor alike. Any relic on the page is a finding.
 */
export function socialProofRelicIssues(page: BandPage): string[] {
	const issues: string[] = [];
	for (const relic of ['#social-proof', 'data-social-proof']) {
		if (page.html.includes(relic)) {
			issues.push(`${page.path}: the page still carries \`${relic}\` — the social-proof band is abolished (SPEC-revamp §3.2)`);
		}
	}
	return issues;
}

/**
 * SPEC §5.5: the bands read on the page background, and their text wears only the roles the
 * AA audit covers there (`src/lib/colour-rules.ts`) — a band that paints its own surface, or a
 * role the audit never measured, is a finding.
 */
export function bandColorIssues(page: BandPage): string[] {
	return sectionColourIssues(page, bandSections);
}

/**
 * SPEC §9.2 over the observability and resources bands, at this slice's stricter reading (#23):
 * the bands' copy carries no figure at all — no digits, no number-word counts. That is deliberate
 * where the site-wide scan (`copy-rules.ts`) catches the noun-bound counting style: the bands'
 * locked copy has no figure to exempt, so zero occurrences is the property to hold. The facts
 * band is not scanned here — its locked §3.2 copy carries the one approved absolute ("0 runtime
 * dependencies"), and `factsIssues` already holds it verbatim. The waterfall's figures are the
 * §7.5 capture's data, not claims.
 */
export function bandCountingIssues(page: BandPage): string[] {
	const issues: string[] = [];
	const scanned = [
		{ marker: 'data-observability', label: 'observability', copyOfBand: (fragment: string) => copyOf(withoutTrace(fragment)) },
		{ marker: 'data-resources', label: 'resources', copyOfBand: copyOf },
	] as const;
	for (const { marker, label, copyOfBand } of scanned) {
		const section = bandOf(page, marker);
		if (section === null) continue;

		const copy = copyOfBand(section);
		const digit = copy.match(/\d[\d,.]*/);
		if (digit !== null) {
			issues.push(`${page.path}: the ${label} band's copy carries \`${digit[0]}\` — no counting-style claims (SPEC §9.2)`);
		}
		const word = copy.match(numberWordCount);
		if (word !== null) {
			issues.push(`${page.path}: the ${label} band's copy carries \`${word[0]}\` — no counting-style claims (SPEC §9.2)`);
		}
	}
	return issues;
}

/** `one tracer` is fine; a number word counting a noun is not (SPEC §9.2). */
const numberWordCount = /\b(?:two|three|four|five|six|seven|eight|nine|ten)\b(?:\s+[a-z][a-z-]*){1,4}/i;
