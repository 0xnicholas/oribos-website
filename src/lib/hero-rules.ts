/**
 * The home hero, its product window, the trace waterfall and the shared final CTA (SPEC §3.1 /
 * §3.8 / §7.1 / §7.2 / §7.5) over the built page. The strings and geometry here are the spec's
 * copy — deliberately not read from the content collections that render them, so the page and
 * its gate cannot agree by construction.
 */

import { attributeValue, codeOf, elementOf, linksOf, missingCodeSurface, textOf } from './html.ts';
import { hslToHex } from './brand-tokens.ts';
import { LINKS } from './links.ts';

export type HeroPage = { path: string; html: string };

/** SPEC §3.1 【终稿·勿改】: the H1 and the sub. */
export const heroH1 = 'Build ultralight AI agents.';
export const heroSub =
	'Build, compose, and ship agents with zero runtime dependencies — Oribos, the ultralight TypeScript agent framework.';
/** SPEC §3.1/§6.1: the two CTAs and the copy's success state. */
export const ctaGithub = 'GitHub';
export const heroSecondary = 'Copy quick start';
export const heroCopied = '✓ copied';
/** SPEC §3.1: the window's file tab and badge. */
export const heroFile = 'agent.ts';
export const heroBadge = 'trace';

/** SPEC §7.2 【终稿·勿改】 — the block verbatim, blank lines included; never compressed. */
export const heroSnippet = `import { openai } from '@ai-sdk/openai';
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
}`;

/** SPEC §7.5: the card head, the seven lanes, the card foot — verbatim and in order. */
export const traceMeta = 'trace 4f3c9a… · gpt-4o-mini · 2 steps · 1.62s · 214 in / 62 out tokens';
export const traceRows = [
	{ lane: 'input', left: 0, width: 7, value: '41ms', tone: 'accent' },
	{ lane: 'agent-step #1', left: 7, width: 85, value: '1.51s', tone: 'accent' },
	{ lane: 'tool-call weather', left: 12, width: 14, value: '38ms', tone: 'tool' },
	{ lane: 'tool-result', left: 26, width: 8, value: '2ms', tone: 'tool' },
	{ lane: 'text-delta ×14', left: 34, width: 48, value: 'streamed', tone: 'accent' },
	{ lane: 'agent-step #2', left: 82, width: 10, value: '96ms', tone: 'accent' },
	{ lane: 'finish stop', left: 92, width: 8, value: 'stop', tone: 'accent' },
] as const;
export const traceSummary = "chunk.type === 'text-delta' — every span from the same run";

/** SPEC §3.8: the shared final CTA's copy (the spec permits polishing these words). */
export const finalCtaHeading = 'Build ultralight AI agents.';
export const finalCtaSub =
	'The repository is open today — star or watch it to follow releases. The first public version is coming soon.';

/** SPEC §7.5 轨迹绿: the site's own auxiliary colour — trace rows only, never a brand token. */
export const trailGreen = { light: 'hsl(140, 45%, 32%)', dark: 'hsl(140, 40%, 55%)' } as const;

/* ------------------------------------------------------------------ reading the page */

/** Leaf `<span>` texts of a fragment — spans that hold text and no nested elements. */
function leafSpanTexts(fragment: string): string[] {
	return [...fragment.matchAll(/<span\b[^>]*>([^<]*)<\/span>/gi)].map((match) => textOf(match[1]!));
}

/* ------------------------------------------------------------------ the checks */

/** SPEC §3.1: the hero's copy, its two CTAs, and what the hero must not carry. */
export function heroIssues(page: HeroPage): string[] {
	const hero = elementOf(page.html, 'section', 'data-hero');
	if (hero === null) return [`${page.path}: no hero section (SPEC §3.1)`];

	const issues: string[] = [];
	const text = textOf(hero);

	const h1 = hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
	if (h1 === undefined || textOf(h1) !== heroH1) {
		issues.push(`${page.path}: the hero H1 is \`${h1 === undefined ? 'missing' : textOf(h1)}\`, expected \`${heroH1}\` (SPEC §3.1)`);
	} else if (!text.startsWith(heroH1)) {
		issues.push(`${page.path}: something precedes the H1 — the hero sets no kicker (SPEC §3.1)`);
	}

	const sub = hero.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	if (sub === undefined || textOf(sub) !== heroSub) {
		issues.push(`${page.path}: the hero sub is not the §3.1 sentence verbatim`);
	}

	const links = linksOf(hero);
	if (!links.some((link) => link.text === ctaGithub && link.href === LINKS.github)) {
		issues.push(`${page.path}: the hero has no \`${ctaGithub}\` link from src/lib/links.ts (SPEC §3.1)`);
	}
	const buttons = [...hero.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((match) => textOf(match[1]!));
	if (!buttons.includes(heroSecondary)) {
		issues.push(`${page.path}: the hero has no \`${heroSecondary}\` button (SPEC §3.1)`);
	}

	if (/coming\s+soon/i.test(text)) {
		issues.push(`${page.path}: the hero carries a coming-soon control — the header pill, the final CTA and the FAQ carry it (SPEC §3.1)`);
	}
	if (/\b\d[\d,]*\s*stars?\b/i.test(text)) {
		issues.push(`${page.path}: the hero states a star count (SPEC §3.1: none)`);
	}
	for (const label of [...links.map((link) => link.text), ...buttons]) {
		if (/\bv?\d+\.\d+\.\d+\b/.test(label)) {
			issues.push(`${page.path}: a hero CTA carries a version number (SPEC §3.1): \`${label}\``);
		}
	}

	return issues;
}

/** SPEC §3.1: the window bar is dots + the file tab + the trace badge — never a session title. */
export function heroWindowIssues(page: HeroPage): string[] {
	const hero = elementOf(page.html, 'section', 'data-hero') ?? page.html;
	const bar = elementOf(hero, 'div', 'data-window-bar');
	if (bar === null) return [`${page.path}: the hero has no product window bar (SPEC §3.1)`];

	const issues: string[] = [];
	const dots = [...bar.matchAll(/<i\b/gi)].length;
	if (dots !== 3) {
		issues.push(`${page.path}: the window bar has ${dots} window dots, expected three (SPEC §3.1)`);
	}

	const fileTab = elementOf(bar, 'span', 'data-file-tab');
	if (fileTab === null || textOf(fileTab) !== heroFile) {
		issues.push(`${page.path}: the window bar has no \`${heroFile}\` file tab (SPEC §3.1)`);
	}
	const badge = elementOf(bar, 'span', 'data-trace-badge');
	if (badge === null || textOf(badge) !== heroBadge) {
		issues.push(`${page.path}: the window bar has no \`${heroBadge}\` badge (SPEC §3.1)`);
	}

	const barText = textOf(bar);
	if (/—/.test(barText) || /assistant/i.test(barText) || /\.ts\b/.test(barText.replace(heroFile, ''))) {
		issues.push(`${page.path}: the window bar reads \`${barText}\` — a file tab and a badge, not a session title (SPEC §3.1)`);
	}

	return issues;
}

/** SPEC §7.1/§7.2/§8.5: the hero's code block is the §7.2 snippet, one Shiki dual-theme block. */
export function heroCodeIssues(page: HeroPage): string[] {
	const hero = elementOf(page.html, 'section', 'data-hero');
	const pane = hero === null ? null : elementOf(hero, 'div', 'data-hero-code');
	if (pane === null) return [`${page.path}: the hero has no code pane (SPEC §3.1)`];

	const issues: string[] = [];
	const pre = pane.match(/<pre\b[^>]*>/i)?.[0];
	if (pre === undefined) {
		issues.push(`${page.path}: the hero code pane has no code block (SPEC §3.1)`);
	} else {
		for (const expected of missingCodeSurface(pre)) {
			issues.push(`${page.path}: the hero code block is missing \`${expected}\` (SPEC §8.5)`);
		}
		if (/(^|\s)shiki(\s|$)/.test(attributeValue(pre, 'class') ?? '')) {
			issues.push(`${page.path}: the code block carries a \`shiki\` class — the site uses \`astro-code\` (SPEC §8.5)`);
		}
		if (/line-numbers/i.test(pre)) {
			issues.push(`${page.path}: the hero code block carries line numbers (SPEC §7.1: none)`);
		}
		// SPEC §7.1: no wrapping — the block scrolls sideways instead of folding long lines.
		if (!/\bstyle\s*=\s*"[^"]*overflow-x\s*:\s*auto/.test(pre)) {
			issues.push(`${page.path}: the hero code block does not scroll horizontally (SPEC §7.1)`);
		}
	}

	// The copy button takes the pane's visible `<pre>` text; that text is the §7.2 snippet.
	const code = codeOf(pane);
	if (code === null || code !== heroSnippet) {
		issues.push(`${page.path}: the hero code block is not the §7.2 snippet verbatim — the copy button copies this text (SPEC §7.2)`);
	}

	return issues;
}

/** SPEC §7.5: the trace's meta line, seven lanes with their coordinates, and the summary. */
export function traceIssues(page: HeroPage): string[] {
	const hero = elementOf(page.html, 'section', 'data-hero') ?? page.html;
	const rows = [...hero.matchAll(/<li\b[^>]*\bdata-trace-row\b[^>]*>[\s\S]*?<\/li>/gi)].map((match) => match[0]);

	const issues: string[] = [];
	const text = textOf(hero);
	if (!text.includes(traceMeta)) {
		issues.push(`${page.path}: the trace card head is not the §7.5 meta line verbatim`);
	}
	if (!text.includes(traceSummary)) {
		issues.push(`${page.path}: the trace card foot is not the §7.5 summary verbatim`);
	}
	if (rows.length !== traceRows.length) {
		issues.push(`${page.path}: the trace has ${rows.length} rows, expected ${traceRows.length} (SPEC §7.5)`);
	}

	traceRows.forEach((expected, index) => {
		const row = rows[index];
		if (row === undefined) return;
		const leaves = leafSpanTexts(row);
		const lane = leaves[0] ?? '';
		const value = leaves.filter((leaf) => leaf !== '').at(-1) ?? '';
		const style = row.match(/\bstyle\s*=\s*"([^"]*)"/i)?.[1] ?? '';
		const tone = attributeValue(row.match(/<li\b[^>]*>/i)?.[0] ?? '', 'data-tone');

		if (lane !== expected.lane || value !== expected.value) {
			issues.push(
				`${page.path}: trace row ${index + 1} reads \`${lane}\` / \`${value}\`, expected \`${expected.lane}\` / \`${expected.value}\` (SPEC §7.5)`,
			);
		}
		if (!style.includes(`left:${expected.left}%`) || !style.includes(`width:${expected.width}%`)) {
			issues.push(
				`${page.path}: trace row ${index + 1} spans \`${style}\`, expected left:${expected.left}% width:${expected.width}% (SPEC §7.5)`,
			);
		}
		if (tone !== expected.tone) {
			issues.push(
				`${page.path}: trace row ${index + 1} is toned \`${tone ?? 'nothing'}\`, expected \`${expected.tone}\` (SPEC §7.5)`,
			);
		}
	});

	return issues;
}

/** SPEC §3.8: the shared final CTA — its copy, its action, and the pill as a passive badge. */
export function finalCtaIssues(page: HeroPage): string[] {
	const section = elementOf(page.html, 'section', 'id="get-started"');
	if (section === null) return [`${page.path}: no #get-started section — the final CTA is shared copy (SPEC §3.8)`];

	const issues: string[] = [];
	const text = textOf(section);

	const heading = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
	if (heading === undefined || textOf(heading) !== finalCtaHeading) {
		issues.push(`${page.path}: the final CTA heading is ${heading === undefined ? 'missing' : `\`${textOf(heading)}\``}, expected \`${finalCtaHeading}\` (SPEC §3.8)`);
	}
	if (!text.includes(finalCtaSub)) {
		issues.push(`${page.path}: the final CTA sub is not the §3.8 sentence verbatim`);
	}
	if (!linksOf(section).some((link) => link.text === ctaGithub && link.href === LINKS.github)) {
		issues.push(`${page.path}: the final CTA has no \`${ctaGithub}\` link from src/lib/links.ts (SPEC §3.8)`);
	}
	if (!text.includes('coming soon')) {
		issues.push(`${page.path}: the final CTA has no \`coming soon\` pill (SPEC §3.8)`);
	}
	if (linksOf(section).some((link) => link.text.includes('coming soon'))) {
		issues.push(`${page.path}: \`coming soon\` is a passive badge — never a link (SPEC §3.8)`);
	}

	return issues;
}

/** SPEC-revamp §2.6: one dual-theme grayscale code surface — `.astro-code`, switched by the
 * OS preference, painted by the custom `oribos-*` pair. The retired github pair must not
 * ship: `<Code />` does not inherit `markdown.shikiConfig`, so a call site without the
 * explicit themes prop silently falls back to it (the regression this check exists for). */
export function shikiIssues(css: string, html = ''): string[] {
	const issues: string[] = [];
	const darkBlocks = [...css.matchAll(/@media[^{]*prefers-color-scheme:\s*dark[^{]*\{([^}]*)\}/g)].map(
		(match) => match[1]!,
	);
	const shiki = darkBlocks.find((body) => body.includes('astro-code'));
	if (shiki === undefined) {
		issues.push('the shipped CSS has no dark-mode switch for `.astro-code` (SPEC-revamp §2.6)');
	} else if (!/var\(--shiki-dark\)/.test(shiki) || !/var\(--shiki-dark-bg\)/.test(shiki)) {
		issues.push('the `.astro-code` dark switch does not read the block\'s `--shiki-dark` pair (SPEC-revamp §2.6)');
	}

	// The one code surface: a `.astro-code` rule carries the block's padding and type scale.
	if (!/\.astro-code[^{}]*\{[^}]*padding/.test(css)) {
		issues.push('the shipped CSS has no `.astro-code` surface rule — every block is the same shape (SPEC-revamp §2.6)');
	}
	if (/white-space:\s*pre-wrap/.test(css)) {
		issues.push('the shipped CSS wraps code — blocks scroll horizontally instead (SPEC §7.1)');
	}

	// The custom pair, not the retired one (SPEC-revamp §2.6).
	if (html !== '') {
		for (const retired of ['github-light', 'github-dark']) {
			if (html.includes(retired)) {
				issues.push(`a code block still renders with the retired \`${retired}\` theme — the §2.6 pair is \`oribos-light\` / \`oribos-dark\``);
			}
		}
		if (html.includes('astro-code') && (!html.includes('oribos-light') || !html.includes('oribos-dark'))) {
			issues.push('a code block does not carry the dual `oribos-light` / `oribos-dark` pair (SPEC-revamp §2.6)');
		}
	}
	return issues;
}

/**
 * SPEC §7.5 判定③: the trace green is declared once — in `trace-ink.css` — and consumed only by
 * the components that draw trace / tool states: the hero's `TraceWaterfall` and the use-case
 * cards' trace-console mock (SPEC §3.5 brief ③).
 */
export const traceGreenDeclaration = 'src/styles/trace-ink.css';
export const traceGreenConsumers = [
	'src/components/TraceWaterfall.astro',
	'src/components/mocks/MockTraceConsole.astro',
] as const;

/** SPEC §7.5: the trace green is declared once and stays trace-only. */
export function trailIssues(css: string, sources: readonly { path: string; text: string }[]): string[] {
	const issues: string[] = [];
	// The shipped CSS may hold the spec's `hsl()` or the minifier's hex; both count.
	const greens = [
		{ theme: 'light', hsl: trailGreen.light },
		{ theme: 'dark', hsl: trailGreen.dark },
	];
	const shipped = css.toLowerCase();
	for (const { theme, hsl } of greens) {
		if (!shipped.includes(hsl.toLowerCase()) && !shipped.includes(hslToHex(hsl))) {
			issues.push(`the shipped CSS is missing the ${theme} trace green \`${hsl}\` (SPEC §7.5)`);
		}
	}

	// The literal lives in one file; a component that restates it is a spread.
	const needles = greens.flatMap(({ hsl }) => [hsl.toLowerCase(), hslToHex(hsl)]);
	for (const source of sources) {
		if (source.path === traceGreenDeclaration) continue;
		const text = source.text.toLowerCase();
		if (needles.some((needle) => text.includes(needle))) {
			issues.push(`${source.path}: the trace green is trace-only — it does not spread (SPEC §7.5)`);
		}
	}
	// So does a component that repaints with it without drawing a trace / tool state.
	for (const source of sources) {
		if (source.path === traceGreenDeclaration || (traceGreenConsumers as readonly string[]).includes(source.path)) continue;
		if (source.text.includes('--trace-green')) {
			issues.push(`${source.path}: reads the trace green — it stays with the components that draw trace states (SPEC §7.5)`);
		}
	}
	return issues;
}

/** SPEC §3.1: the copy button's script ships — the clipboard write, the state, the reset. */
export function copyScriptIssues(scripts: readonly string[]): string[] {
	const issues: string[] = [];
	if (!scripts.some((script) => script.includes('writeText'))) {
		issues.push('no shipped script writes to the clipboard — the hero CTA copies the snippet (SPEC §3.1)');
	}
	if (!scripts.some((script) => script.includes(heroCopied))) {
		issues.push(`no shipped script shows the \`${heroCopied}\` state (SPEC §3.1)`);
	}
	if (!scripts.some((script) => script.includes('1200'))) {
		issues.push('no shipped script resets the copied state after 1.2s (SPEC §3.1)');
	}
	// The button and the pane it copies: a handler that lost its target is a dead button.
	if (!scripts.some((script) => script.includes('data-copy-quick-start') && script.includes('data-hero-code'))) {
		issues.push('no shipped script ties the hero copy button to the hero code pane (SPEC §3.1)');
	}
	return issues;
}
