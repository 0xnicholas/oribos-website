/**
 * The home page's three bands between the feature tabs and the final CTA (SPEC §3.3 observability,
 * §3.4 social proof, §3.6 resources, §7.4): each band's anchor and its verbatim copy, the one
 * observability code card and the resources strip's three links — plus the two rules the three
 * share: no counting-style figures (§9.2), and text painted only in the roles §5.5 audits on the
 * page background.
 *
 * Like the hero and feature rules, the strings here are the spec's copy — deliberately not read
 * from the content collections that render them, so the page and its gate cannot agree by
 * construction.
 */

import { sectionColourIssues } from './colour-rules.ts';
import { attributeValue, codeBlocksOf, elementOf, linksOf, missingCodeSurface, occurrences, tagsOf, textOf, times } from './html.ts';
import { LINKS, type ResourceLinkKey } from './links.ts';

export type BandPage = { path: string; html: string };

/** SPEC §3.3 【终稿·勿改】: the observability band's kicker, H2 claim, lead and card claim. */
export const observabilityKicker = 'Observability';
export const observabilityClaim = 'Every run traced. OTLP when you want it.';
export const observabilityLead =
	'Agent runs, model steps, tool calls, workflow steps, memory recall and save — traced by default. Built-in console and memory exporters; @oribos/otlp maps Oribos spans to the GenAI semantic conventions. A standalone agent with no tracer stays zero-overhead.';
export const observabilityCardClaim = 'One tracer, distributed by the composition root.';
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

/** SPEC §3.4: the placeholder band's copy (owner-tunable, rendered as written). */
export const socialProofKicker = 'In the open';
export const socialProofLine =
	'No logos, no quotes, no numbers yet — Oribos is new. When there are real stories to tell, they will live here.';

/** SPEC §3.6: the resources strip's kicker and its three links (labels verbatim). */
export const resourcesKicker = 'Go deeper';
export type BandResourceLink = { label: string; key: ResourceLinkKey };
export const resourceLinks: readonly BandResourceLink[] = [
	{ label: 'Docs', key: 'docs' },
	{ label: 'Examples', key: 'examples' },
	{ label: 'Architecture', key: 'architecture' },
];

/* ---------------------------------------------------------------- reading the page */

const bands = [
	{ marker: 'data-observability', label: 'observability' },
	{ marker: 'data-social-proof', label: 'social-proof' },
	{ marker: 'data-resources', label: 'resources' },
] as const;

/** The three bands as §5.5 sections — the colour scan's names include the noun. */
const bandSections = bands.map(({ marker, label }) => ({ marker, label: `${label} band` }));

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

/* ---------------------------------------------------------------- the checks */

/** SPEC §3.3/§7.1/§7.4: the observability band, its copy and its one code card. */
export function observabilityIssues(page: BandPage): string[] {
	const section = bandOf(page, 'data-observability');
	if (section === null) return [`${page.path}: no observability band — the home page carries \`#observability\` (SPEC §3.3)`];

	const issues: string[] = [];
	const paragraphs = paragraphsOf(section);
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

	// The claim and the snippet live in the band and nowhere else on the page (SPEC §3.3).
	const claimCount = occurrences(textOf(page.html), observabilityClaim);
	if (claimCount !== 1) {
		issues.push(`${page.path}: \`${observabilityClaim}\` appears ${times(claimCount)} — the band's copy stays in its band (SPEC §3.3)`);
	}
	const snippetCount = codeBlocksOf(page.html).filter((block) => block === observabilitySnippet).length;
	if (snippetCount !== 1) {
		issues.push(`${page.path}: the §7.4 snippet appears ${times(snippetCount)} on the page (SPEC §3.3)`);
	}

	// SPEC §3.3: no mock image; the band is copy plus the code card.
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

/** SPEC §3.4: the social-proof placeholder — kicker, one muted line, and nothing invented. */
export function socialProofIssues(page: BandPage): string[] {
	const section = bandOf(page, 'data-social-proof');
	if (section === null) return [`${page.path}: no social-proof band — the home page carries \`#social-proof\` (SPEC §3.4)`];

	const issues: string[] = [];
	const paragraphs = paragraphsOf(section);
	if (paragraphs[0]?.text !== socialProofKicker) {
		issues.push(
			`${page.path}: the social-proof kicker reads \`${paragraphs[0]?.text ?? 'nothing'}\`, expected \`${socialProofKicker}\` (SPEC §3.4)`,
		);
	}

	const text = textOf(section);
	if (text !== `${socialProofKicker} ${socialProofLine}`) {
		issues.push(`${page.path}: the social-proof band reads \`${text}\` — the §3.4 kicker and one muted line, nothing else (SPEC §3.4)`);
	}

	const lineTag = paragraphs[1]?.tag;
	if (lineTag !== undefined && !/\btext-ink3\b/.test(attributeValue(lineTag, 'class') ?? '')) {
		issues.push(`${page.path}: the social-proof line is not muted in \`text-ink3\` — the muted-meta role (SPEC §3.4/§2.1)`);
	}

	// SPEC §3.4: no fabricated logo wall, quote, rating, count or CTA — no such element at all.
	for (const tag of ['a', 'button', 'svg', 'img', 'picture', 'figure', 'blockquote', 'ul', 'ol']) {
		const count = tagsOf(section, tag).length;
		if (count > 0) {
			issues.push(
				`${page.path}: the social-proof band carries ${count} <${tag}> — the placeholder invents no logo, quote, rating, count or CTA (SPEC §3.4)`,
			);
		}
	}

	return issues;
}

/** SPEC §3.6/§2.4: the resources strip — the kicker, three verbatim links, nothing else. */
export function resourcesIssues(page: BandPage): string[] {
	const section = bandOf(page, 'data-resources');
	if (section === null) return [`${page.path}: no resources strip — the home page carries \`#resources\` (SPEC §3.6)`];

	const issues: string[] = [];
	const paragraphs = paragraphsOf(section);
	if (paragraphs.length !== 1 || paragraphs[0]!.text !== resourcesKicker) {
		issues.push(
			`${page.path}: the resources kicker reads \`${paragraphs[0]?.text ?? 'nothing'}\`, expected \`${resourcesKicker}\` and nothing else (SPEC §3.6)`,
		);
	}

	const links = linksOf(section);
	if (links.length !== resourceLinks.length) {
		issues.push(`${page.path}: the resources strip carries ${links.length} link(s), expected ${resourceLinks.length} (SPEC §3.6)`);
	}
	resourceLinks.forEach((expected, index) => {
		const link = links[index];
		if (link === undefined) return;
		if (link.text !== expected.label) {
			issues.push(
				`${page.path}: resources link ${index + 1} reads \`${link.text}\`, expected \`${expected.label}\` (SPEC §3.6)`,
			);
		}
		if (link.href !== LINKS[expected.key]) {
			issues.push(
				`${page.path}: the \`${expected.label}\` link points at \`${link.href}\`, expected \`${LINKS[expected.key]}\` from src/lib/links.ts (SPEC §2.4)`,
			);
		}
	});

	if (tagsOf(section, 'button').length > 0) {
		issues.push(`${page.path}: the resources strip carries a button — three links, no CTA (SPEC §3.6)`);
	}

	const text = textOf(section);
	if (text !== [resourcesKicker, ...resourceLinks.map((link) => link.label)].join(' ')) {
		issues.push(`${page.path}: the resources band reads \`${text}\` — the kicker and the three labels only (SPEC §3.6)`);
	}

	return issues;
}

/**
 * SPEC §5.5: the three bands read on the page background, and their text wears only the roles the
 * AA audit covers there (`src/lib/colour-rules.ts`) — a band that paints its own surface, or a
 * role the audit never measured, is a finding.
 */
export function bandColorIssues(page: BandPage): string[] {
	return sectionColourIssues(page, bandSections);
}

/**
 * SPEC §9.2 over the three bands, at this slice's stricter reading (#23): the bands' copy carries
 * no figure at all — no digits, no number-word counts. That is deliberate where the site-wide scan
 * (`copy-rules.ts`) catches the noun-bound counting style: the bands' locked copy has no figure to
 * exempt, so zero occurrences is the property to hold.
 */
export function bandCountingIssues(page: BandPage): string[] {
	const issues: string[] = [];
	for (const { marker, label } of bands) {
		const section = bandOf(page, marker);
		if (section === null) continue;

		const copy = copyOf(section);
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
