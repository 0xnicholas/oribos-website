/**
 * The home hero, its product window, the trace waterfall, the chip CTA and the shared final CTA
 * (SPEC §3.1 / §7.1 / §7.2 / §7.5, SPEC-revamp §4.1 / §4.3 / §4.5) over the built page. The
 * strings and geometry here are the spec's copy — deliberately not read from the content
 * collections that render them, so the page and its gate cannot agree by construction.
 */

import { attributeValue, codeOf, decodeEntities, elementOf, linksOf, missingCodeSurface, occurrences, tagsOf, textOf } from './html.ts';
import { hslToHex } from './brand-tokens.ts';
import { LINKS } from './links.ts';
import { windowBarMeta } from './trace-meta.ts';

export type HeroPage = { path: string; html: string };

/** SPEC §3.1 【终稿·勿改】: the H1 and the sub. */
export const heroH1 = 'Build ultralight AI agents.';
export const heroSub =
	'Build, compose, and ship agents with zero runtime dependencies — Oribos, the ultralight TypeScript agent framework.';
/** SPEC-revamp §4.1: the hero's secondary CTA is a `GitHub` text link; the v1 copy button is retired. */
export const ctaGithub = 'GitHub';
export const retiredHeroCta = 'Copy quick start';
/** SPEC-revamp §4.3: the copy button's success state. */
export const copiedLabel = '✓ copied';
/** SPEC §3.1: the window's file tab and trace tab — one pane visible at a time. */
export const heroFile = 'agent.ts';
export const heroTraceTab = 'trace';

/** SPEC-revamp §4.3 【终稿·勿改】: the chip CTA's visible face — one constant per text slot. */
export const agentPromptTag = 'agent prompt — self-contained';
export const agentPromptButton = 'Copy agent prompt';
export const agentPromptTask = 'One paste into your coding agent → a working Oribos agent.';
export const agentPromptCmeta = 'install · 6-line agent · README — inside';

/** SPEC-revamp §4.3 【终稿·勿改】: the 13-line payload — hidden, single-point defined, copied verbatim. */
export const agentPromptPayload = `Add a working Oribos agent to this project.

Install: npm i @oribos/core @ai-sdk/openai

Create agent.ts:
  import { openai } from '@ai-sdk/openai';
  import { Agent } from '@oribos/core/agent';
  const agent = new Agent({ name: 'assistant',
    model: openai.chat('gpt-4o-mini') });
  for await (const c of agent.stream('Say hello.'))
    if (c.type === 'text-delta') process.stdout.write(c.textDelta);

Run it with your model key set, then read github.com/0xnicholas/oribos-framework#readme to go deeper.`;

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

/** The hero window bar's meta line: the §7.5 capture shortened to trace id · model · duration. */
export const heroWindowBarMeta = windowBarMeta(traceMeta);

/** SPEC-revamp §4.5: the shared final CTA — the H2 from the v1 spec, the new published-state sub. */
export const finalCtaHeading = 'Build ultralight AI agents.';
export const finalCtaSub =
	'Copy the agent prompt, paste it into your coding agent, and add a working Oribos agent to the app you already run.';

/** SPEC §7.5 轨迹绿: the site's own auxiliary colour — trace rows only, never a brand token. */
export const trailGreen = { light: 'hsl(140, 45%, 32%)', dark: 'hsl(140, 40%, 55%)' } as const;

/* ------------------------------------------------------------------ reading the page */

/** Leaf `<span>` texts of a fragment — spans that hold text and no nested elements. */
function leafSpanTexts(fragment: string): string[] {
	return [...fragment.matchAll(/<span\b[^>]*>([^<]*)<\/span>/gi)].map((match) => textOf(match[1]!));
}

/* ------------------------------------------------------------------ the checks */

/**
 * SPEC-revamp §4.3: the chip CTA in `scope` (the hero, the final CTA) — the four visible slots
 * verbatim and the one hidden payload the copy button takes. The chip's root is read through its
 * markers, not through nested-element matching: a `data-agent-prompt` div ends at its first inner
 * `</div>`, which the payload sits past.
 */
export function agentPromptIssues(page: HeroPage, scope: string, where: string): string[] {
	const copies = occurrences(scope, 'data-agent-prompt-copy');
	if (copies === 0) return [`${page.path}: ${where} carries no chip CTA (SPEC-revamp §4.3)`];

	const issues: string[] = [];
	if (copies !== 1) {
		issues.push(`${page.path}: ${where} carries ${copies} chip CTAs, expected one (SPEC-revamp §4.3)`);
	}

	for (const slot of [
		{ marker: 'data-agent-prompt-tag', expected: agentPromptTag, what: 'tag' },
		{ marker: 'data-agent-prompt-task', expected: agentPromptTask, what: 'task sentence' },
		{ marker: 'data-agent-prompt-cmeta', expected: agentPromptCmeta, what: 'cmeta' },
	] as const) {
		const element = elementOf(scope, 'span', slot.marker);
		if (element === null || textOf(element) !== slot.expected) {
			issues.push(`${page.path}: the chip's ${slot.what} is not the §4.3 text verbatim`);
		}
	}

	const button = scope.match(/<button\b[^>]*\bdata-agent-prompt-copy\b[^>]*>([\s\S]*?)<\/button>/i);
	if (button === null || textOf(button[1]!) !== agentPromptButton) {
		issues.push(`${page.path}: the chip has no \`${agentPromptButton}\` button (SPEC-revamp §4.3)`);
	}

	const payloads = occurrences(scope, 'data-agent-prompt-payload');
	if (payloads !== 1) {
		issues.push(`${page.path}: the chip carries ${payloads} payload definition(s), expected one (SPEC-revamp §4.3)`);
	}
	const payload = scope.match(/<template\b[^>]*\bdata-agent-prompt-payload\b[^>]*>([\s\S]*?)<\/template>/i);
	if (payload === null) {
		issues.push(`${page.path}: the chip has no hidden payload — the copy button copies this text (SPEC-revamp §4.3)`);
	} else if (decodeEntities(payload[1]!) !== agentPromptPayload) {
		issues.push(`${page.path}: the chip's payload is not the §4.3 13-line text verbatim — the copy button copies this text`);
	}

	return issues;
}

/** SPEC-revamp §3.1/§4.1/§4.3: the hero's copy, its chip CTA, its GitHub link, and what it must not carry. */
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
		issues.push(`${page.path}: the hero has no \`${ctaGithub}\` link from src/lib/links.ts (SPEC-revamp §4.1)`);
	}
	const buttons = [...hero.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((match) => textOf(match[1]!));
	if (buttons.includes(retiredHeroCta)) {
		issues.push(`${page.path}: the hero still carries \`${retiredHeroCta}\` — the chip CTA is the main action (SPEC-revamp §3.1)`);
	}
	issues.push(...agentPromptIssues(page, hero, 'the hero'));

	if (/coming\s+soon/i.test(text)) {
		issues.push(`${page.path}: the hero carries a coming-soon control — the site carries one published state (SPEC-revamp §4)`);
	}
	if (/\b\d[\d,]*\s*stars?\b/i.test(text)) {
		issues.push(`${page.path}: the hero states a star count (SPEC §3.1: none)`);
	}
	for (const label of [...links.map((link) => link.text), ...buttons]) {
		if (/\bv?\d+\.\d+\.\d+\b/.test(label)) {
			issues.push(`${page.path}: a hero CTA carries a version number (SPEC-revamp §4.6): \`${label}\``);
		}
	}

	return issues;
}

/**
 * SPEC-revamp §3.1: the window bar is dots + the `agent.ts` / `trace` tabs + the run's meta line
 * (trace id · model · duration) — never a session title. The copy button rides in the bar and
 * copies the visible file, so it stays outside this shape's copy assertions.
 */
export function heroWindowIssues(page: HeroPage): string[] {
	const hero = elementOf(page.html, 'section', 'data-hero') ?? page.html;
	// The bar nests a tablist `div`, so the shallow element reader would cut it early — the bar is
	// the run from its opening tag to the first tab panel.
	const barStart = hero.search(/<div\b[^>]*\bdata-window-bar(?![\w-])/i);
	const barEnd = ['role="tabpanel"', 'data-hero-code', 'data-hero-trace']
		.map((marker) => hero.indexOf(marker))
		.filter((index) => index >= 0)
		.sort((a, b) => a - b)[0];
	const bar = barStart >= 0 && barEnd > barStart ? hero.slice(barStart, barEnd) : null;
	if (bar === null) return [`${page.path}: the hero has no product window bar (SPEC-revamp §3.1)`];

	const issues: string[] = [];
	const dots = [...bar.matchAll(/<i\b/gi)].length;
	if (dots !== 3) {
		issues.push(`${page.path}: the window bar has ${dots} window dots, expected three (SPEC §3.1)`);
	}

	const tabs = [...bar.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)]
		.filter((match) => attributeValue(match[0].slice(0, match[0].indexOf('>') + 1), 'role') === 'tab')
		.map((match) => textOf(match[0]));
	if (tabs.join(',') !== `${heroFile},${heroTraceTab}`) {
		issues.push(`${page.path}: the window tabs are [${tabs.join(', ')}], expected [${heroFile}, ${heroTraceTab}] — one pane at a time (SPEC-revamp §3.1)`);
	}

	const meta = elementOf(bar, 'span', 'data-window-meta');
	if (meta === null || textOf(meta) !== heroWindowBarMeta) {
		issues.push(
			`${page.path}: the window bar meta reads \`${meta === null ? 'nothing' : textOf(meta)}\`, expected \`${heroWindowBarMeta}\` — trace id · model · duration (SPEC-revamp §3.1)`,
		);
	}

	const barText = textOf(bar);
	if (/—/.test(barText) || /assistant/i.test(barText) || /\.ts\b/.test(barText.replace(heroFile, ''))) {
		issues.push(`${page.path}: the window bar reads \`${barText}\` — tabs and a meta line, not a session title (SPEC-revamp §3.1)`);
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

/** SPEC-revamp §4.5: the shared final CTA — its copy, the shared chip CTA and the GitHub text link. */
export function finalCtaIssues(page: HeroPage): string[] {
	const section = elementOf(page.html, 'section', 'id="get-started"');
	if (section === null) return [`${page.path}: no #get-started section — the final CTA is shared copy (SPEC-revamp §4.5)`];

	const issues: string[] = [];
	const text = textOf(section);

	const heading = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
	if (heading === undefined || textOf(heading) !== finalCtaHeading) {
		issues.push(`${page.path}: the final CTA heading is ${heading === undefined ? 'missing' : `\`${textOf(heading)}\``}, expected \`${finalCtaHeading}\` (SPEC-revamp §4.5)`);
	}
	if (!text.includes(finalCtaSub)) {
		issues.push(`${page.path}: the final CTA sub is not the §4.5 sentence verbatim`);
	}
	issues.push(...agentPromptIssues(page, section, 'the final CTA'));
	if (!linksOf(section).some((link) => link.text === ctaGithub && link.href === LINKS.github)) {
		issues.push(`${page.path}: the final CTA has no \`${ctaGithub}\` link from src/lib/links.ts (SPEC-revamp §4.5)`);
	}
	if (/coming\s+soon/i.test(text)) {
		issues.push(`${page.path}: the final CTA still carries \`coming soon\` — the pill is retired (SPEC-revamp §4.5)`);
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

/** SPEC-revamp §4.3/§4.1: the copy scripts ship — the clipboard write, the state, the reset, the wiring. */
export function copyScriptIssues(scripts: readonly string[]): string[] {
	const issues: string[] = [];
	if (!scripts.some((script) => script.includes('writeText'))) {
		issues.push('no shipped script writes to the clipboard (SPEC-revamp §4.3)');
	}
	if (!scripts.some((script) => script.includes(copiedLabel))) {
		issues.push(`no shipped script shows the \`${copiedLabel}\` state (SPEC-revamp §4.3)`);
	}
	if (!scripts.some((script) => script.includes('1200'))) {
		issues.push('no shipped script resets the copied state after 1.2s (SPEC-revamp §4.3)');
	}
	// The buttons and what they copy: a handler that lost its target is a dead button.
	if (!scripts.some((script) => script.includes('data-agent-prompt-copy') && script.includes('data-agent-prompt-payload'))) {
		issues.push('no shipped script ties the chip copy button to its hidden payload (SPEC-revamp §4.3)');
	}
	if (!scripts.some((script) => script.includes('data-copy-hero-code') && script.includes('data-hero-code'))) {
		issues.push('no shipped script ties the hero code card\'s copy button to its pane (SPEC-revamp §4.1)');
	}
	return issues;
}
