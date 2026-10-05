/**
 * The site-shell rules (SPEC §2.2 header, §2.3 footer, §2.6 head, §2.8 404) over the built site.
 * The shell renders on every canonical page, so the strings and wiring it must carry are stated
 * once here, verbatim from the spec, and `scripts/check-shell.mjs` reads the rendered pages,
 * the shipped CSS and the shipped script against them. The static assets (favicon, OG card,
 * llms.txt) have their own module, `src/lib/asset-rules.ts`.
 *
 * The expectations in this module are the spec's copy of the shell — deliberately not imported
 * from the components that render it, so a component and its gate cannot agree by construction.
 * The one exception is the brand copy in `src/lib/brand.ts` (wordmark, tagline): both the site
 * and this module must spell the same locked string.
 */

import { wordmark } from './brand.ts';
import {
	attributeValue,
	attributesOf,
	decodeEntities,
	elementOf,
	linksOf,
	tagsOf,
	textOf,
	type MarkupLink,
} from './html.ts';
import { LINKS } from './links.ts';
import { routeOf } from './link-rules.ts';

export type ShellPage = { path: string; html: string };

/** SPEC §2.3 【终稿·勿改】: the public tagline, footer brand block. */
export const tagline =
	'Ultralight TypeScript agent framework. Compose only what you use — run anywhere, no runtime baggage.';
/** SPEC §2.3 【终稿·勿改】: a static string, never a build-time year. */
export const legalLine = '© 2026 Oribos · Apache-2.0';
/** SPEC §2.2: passive status badge — not a link, no version, all lowercase. */
export const comingSoon = 'coming soon';

/** SPEC §2.2: the three dropdown items, titles verbatim. */
export const useCaseItems = [
	{
		label: 'In-product agents',
		description: 'An assistant inside the app you already run.',
		href: '/in-product-agents/',
	},
	{
		label: 'Operations agents',
		description: 'Busywork handled — with a human on the risky steps.',
		href: '/operations-agents/',
	},
	{
		label: 'Platform & developer infra',
		description: 'Primitives your product teams compose.',
		href: '/developer-infrastructure/',
	},
] as const;

/** SPEC §2.3: four columns, headings and entries verbatim; external hrefs are links constants. */
export const footerColumns = [
	{
		heading: 'Framework',
		items: [
			{ label: 'Agent framework', href: '/ai-agent-framework/' },
			{ label: 'Agents', href: '/ai-agents/' },
			{ label: 'Workflows', href: '/ai-workflows/' },
			{ label: 'Observability', href: '/ai-agent-observability/' },
		],
	},
	{
		heading: 'Use cases',
		items: useCaseItems.map(({ label, href }) => ({ label, href })),
	},
	{
		heading: 'Developers',
		items: [
			{ label: 'Docs', href: LINKS.docs },
			{ label: 'Examples', href: LINKS.examples },
			{ label: 'Architecture', href: LINKS.architecture },
		],
	},
	{
		heading: 'Project',
		items: [
			{ label: 'About', href: '/about/' },
			{ label: 'GitHub', href: LINKS.github },
		],
	},
] as const;

/** SPEC §2.2: cut from the header, and not to come back. */
export const cutNavLabels = ['Pricing', 'Customers', 'Product', 'Resources'] as const;
/** SPEC §2.2: keyword pages enter the site through the footer only. */
export const keywordRoutes = [
	'/ai-agent-framework/',
	'/ai-agents/',
	'/ai-workflows/',
	'/ai-agent-observability/',
] as const;
/** SPEC §2.2: the three disclosure panels and the buttons that control them. */
export const disclosureIds = ['use-cases-menu', 'site-menu', 'mobile-use-cases'] as const;

/* ------------------------------------------------------------------ header */

/** What the header of every page must carry, per SPEC §2.2. */
export function headerIssues(page: ShellPage): string[] {
	const header = elementOf(page.html, 'header');
	if (header === null) {
		return [`${page.path}: no <header> — every page carries the one shell (SPEC §2.2)`];
	}

	const issues: string[] = [];
	const links = linksOf(header);
	const text = textOf(header);

	const wordmarkLink = links.find((link) => link.href === '/' && link.text === wordmark);
	if (wordmarkLink === undefined) {
		issues.push(`${page.path}: the header has no \`${wordmark}\` wordmark linking to / (SPEC §2.2)`);
	}

	for (const item of useCaseItems) {
		const link = links.find((candidate) => candidate.href === item.href);
		if (link === undefined) {
			issues.push(`${page.path}: the header does not link \`${item.label}\` to ${item.href} (SPEC §2.2)`);
			continue;
		}
		if (!link.text.includes(item.label)) {
			issues.push(`${page.path}: the header link to ${item.href} does not read \`${item.label}\` (SPEC §2.2)`);
		}
		if (!text.includes(item.description)) {
			issues.push(
				`${page.path}: the header is missing the dropdown description \`${item.description}\` (SPEC §2.2)`,
			);
		}
	}

	const navLinks = {
		Docs: links.find((link) => link.text === 'Docs' && link.href === LINKS.docs),
		GitHub: links.find((link) => link.text === 'GitHub' && link.href === LINKS.github),
	};
	for (const [label, link] of Object.entries(navLinks)) {
		if (link === undefined) {
			issues.push(`${page.path}: the header has no \`${label}\` link from src/lib/links.ts (SPEC §2.2/§2.4)`);
		}
	}

	// A label never points anywhere but its one target — the shell is duplicated for the
	// hamburger, so "one correct copy" is not enough.
	const targets = [
		...useCaseItems.map((item) => ({ label: item.label, href: item.href })),
		{ label: 'Docs', href: LINKS.docs },
		{ label: 'GitHub', href: LINKS.github },
	];
	for (const link of links) {
		for (const target of targets) {
			if (link.text.includes(target.label) && link.href !== target.href) {
				issues.push(
					`${page.path}: the header's \`${target.label}\` link points at ${link.href}, not ${target.href} (SPEC §2.2/§2.4)`,
				);
			}
		}
	}

	// Order is fixed (SPEC §2.2): wordmark → the three items → Docs → GitHub → pill.
	const order = [
		wordmarkLink,
		...useCaseItems.map((item) => links.find((candidate) => candidate.href === item.href)),
		navLinks.Docs,
		navLinks.GitHub,
		{ index: header.indexOf(comingSoon), text: comingSoon },
	].filter((entry): entry is MarkupLink => entry !== undefined && entry.index !== -1);
	if (order.length === 7) {
		for (let index = 1; index < order.length; index += 1) {
			if (order[index]!.index < order[index - 1]!.index) {
				issues.push(`${page.path}: \`${order[index]!.text}\` sits before \`${order[index - 1]!.text}\` — the header order is fixed (SPEC §2.2)`);
				break;
			}
		}
	}

	for (const link of links) {
		if ((cutNavLabels as readonly string[]).includes(link.text)) {
			issues.push(`${page.path}: \`${link.text}\` was cut from the header (SPEC §2.2)`);
		}
		if ((keywordRoutes as readonly string[]).includes(routeOf(link.href))) {
			issues.push(`${page.path}: the header links ${link.href} — keyword pages are footer-only (SPEC §2.2)`);
		}
	}

	if (links.some((candidate) => candidate.text.includes(comingSoon))) {
		issues.push(`${page.path}: \`${comingSoon}\` is a passive status badge — never a link (SPEC §2.2)`);
	}
	for (const match of text.matchAll(/coming\s+soon/gi)) {
		if (match[0] !== comingSoon) {
			issues.push(`${page.path}: the pill reads \`${match[0]}\` — it stays all lowercase (SPEC §2.2)`);
		}
	}
	if (!text.includes(comingSoon)) {
		issues.push(`${page.path}: the header has no \`${comingSoon}\` pill (SPEC §2.2)`);
	}
	if (/\bv?\d+\.\d+\.\d+\b/.test(text)) {
		issues.push(`${page.path}: the header carries a version number — the pill takes none (SPEC §2.2)`);
	}

	for (const id of disclosureIds) {
		const control = header.match(
			new RegExp(`<button\\b[^>]*\\baria-controls\\s*=\\s*["']${id}["'][^>]*>`, 'i'),
		)?.[0];
		if (control === undefined) {
			issues.push(`${page.path}: no <button aria-controls="${id}"> — the disclosure has a real button (SPEC §2.2)`);
			continue;
		}
		const expanded = attributeValue(control, 'aria-expanded');
		if (expanded !== 'false') {
			issues.push(
				`${page.path}: the control for #${id} carries aria-expanded="${expanded ?? ''}" — the shell starts closed (SPEC §2.2)`,
			);
		}
		if (!new RegExp(`\\bid\\s*=\\s*["']${id}["']`).test(page.html)) {
			issues.push(`${page.path}: #${id} is not on the page — its control points nowhere (SPEC §2.2)`);
		}
	}

	return issues;
}

/* ------------------------------------------------------------------ footer */

/** What the footer of every page must carry, per SPEC §2.3. */
export function footerIssues(page: ShellPage): string[] {
	const footer = elementOf(page.html, 'footer');
	if (footer === null) {
		return [`${page.path}: no <footer> — every page carries the one shell (SPEC §2.3)`];
	}

	const issues: string[] = [];
	const links = linksOf(footer);
	const text = textOf(footer);

	if (!links.some((link) => link.href === '/' && link.text === wordmark)) {
		issues.push(`${page.path}: the footer brand block has no \`${wordmark}\` wordmark linking to / (SPEC §2.3)`);
	}
	if (!text.includes(tagline)) {
		issues.push(`${page.path}: the footer tagline is not the public tagline verbatim (SPEC §2.3)`);
	}
	if (!text.includes(legalLine)) {
		issues.push(`${page.path}: the footer legal line is not \`${legalLine}\` verbatim (SPEC §2.3)`);
	}

	let cursor = -1;
	for (const column of footerColumns) {
		const headingIndex = text.indexOf(column.heading);
		if (headingIndex === -1) {
			issues.push(`${page.path}: the footer has no \`${column.heading}\` column (SPEC §2.3)`);
			continue;
		}
		if (headingIndex < cursor) {
			issues.push(`${page.path}: the \`${column.heading}\` column is out of order (SPEC §2.3)`);
		}
		cursor = headingIndex;
		for (const item of column.items) {
			if (!links.some((link) => link.href === item.href && link.text === item.label)) {
				issues.push(
					`${page.path}: the \`${column.heading}\` column is missing \`${item.label}\` → ${item.href} (SPEC §2.3)`,
				);
			}
		}
	}

	if (!links.some((link) => link.href === '/privacy-policy/' && link.text === 'Privacy')) {
		issues.push(`${page.path}: the footer legal row has no \`Privacy\` link (SPEC §2.3)`);
	}
	if (!links.some((link) => link.href === '/terms-of-service/' && link.text === 'Terms')) {
		issues.push(`${page.path}: the footer legal row has no \`Terms\` link (SPEC §2.3)`);
	}

	const forbidden: readonly { pattern: RegExp; reason: string }[] = [
		{ pattern: /(^|\/)newsletter\/?$/i, reason: 'the newsletter slot stays deleted (SPEC §2.3)' },
		{ pattern: /^mailto:/i, reason: 'the site collects nothing — no email surface (SPEC §2.3)' },
		{
			pattern: /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com|discord\.(?:com|gg)|linkedin\.com|youtube\.com|t\.me)\//i,
			reason: 'no social or community column (SPEC §2.3/§11)',
		},
	];
	for (const link of links) {
		for (const rule of forbidden) {
			if (rule.pattern.test(link.href)) {
				issues.push(`${page.path}: the footer links ${link.href} — ${rule.reason}`);
			}
		}
	}

	return issues;
}

/* ------------------------------------------------------------------ head, title, 404 */

/** What every canonical page states in its head, per SPEC §2.6/§5.3. */
export function headIssues(page: ShellPage, origin: string): string[] {
	const issues: string[] = [];

	if (!/<html\b[^>]*\blang\s*=\s*["']en["']/i.test(page.html)) {
		issues.push(`${page.path}: <html lang="en"> (SPEC §1)`);
	}

	// The favicon set (#41): one SVG source, the 32/16 PNG fallbacks, the apple-touch-icon.
	const icons = tagsOf(page.html, 'link').filter((tag) => attributeValue(tag, 'rel') === 'icon');
	const svgIcons = icons.filter((tag) => attributeValue(tag, 'type') === 'image/svg+xml');
	if (svgIcons.length !== 1 || attributeValue(svgIcons[0]!, 'href') !== '/favicon.svg') {
		issues.push(`${page.path}: the SVG favicon link is missing or not /favicon.svg (#41)`);
	} else if (attributeValue(svgIcons[0]!, 'sizes') !== 'any') {
		issues.push(`${page.path}: the SVG favicon link carries sizes="any", so Chromium keeps it over the PNG fallbacks (#41)`);
	}
	for (const size of [32, 16] as const) {
		const png = icons.find((tag) => attributeValue(tag, 'sizes') === `${size}x${size}`);
		if (png === undefined || attributeValue(png, 'href') !== `/favicon-${size}.png`) {
			issues.push(`${page.path}: the ${size}×${size} PNG favicon link is missing (#41)`);
		}
	}
	const touch = tagsOf(page.html, 'link').filter((tag) => attributeValue(tag, 'rel') === 'apple-touch-icon');
	if (touch.length !== 1 || attributeValue(touch[0]!, 'href') !== '/apple-touch-icon.png') {
		issues.push(`${page.path}: the apple-touch-icon link is missing or not /apple-touch-icon.png (#41)`);
	}

	const ogImage = attributesOf(page.html, 'meta', 'property', 'og:image', 'content');
	const expectedImage = `${origin}/og.png`;
	if (ogImage.length !== 1 || ogImage[0] !== expectedImage) {
		issues.push(`${page.path}: og:image is ${ogImage.join(', ') || 'missing'}, expected ${expectedImage} (SPEC §2.6/§5.3)`);
	}
	for (const [key, value] of [['og:image:width', '1200'], ['og:image:height', '630']] as const) {
		const found = attributesOf(page.html, 'meta', 'property', key, 'content');
		if (found.length !== 1 || found[0] !== value) {
			issues.push(`${page.path}: ${key} is ${found.join(', ') || 'missing'}, expected ${value} (SPEC §5.3)`);
		}
	}
	const siteName = attributesOf(page.html, 'meta', 'property', 'og:site_name', 'content');
	if (siteName.length !== 1 || siteName[0] !== wordmark) {
		issues.push(`${page.path}: og:site_name is ${siteName.join(', ') || 'missing'}, expected \`${wordmark}\` (SPEC §2.6)`);
	}

	for (const scheme of ['light', 'dark'] as const) {
		const tag = tagsOf(page.html, 'meta').find(
			(candidate) =>
				attributeValue(candidate, 'name') === 'theme-color' &&
				(attributeValue(candidate, 'media') ?? '').includes(`(prefers-color-scheme: ${scheme})`),
		);
		const content = tag === undefined ? null : attributeValue(tag, 'content');
		if (content === null || !/^#[0-9a-f]{6}$/i.test(content)) {
			issues.push(`${page.path}: the ${scheme} theme-color meta is ${content ?? 'missing'} (SPEC §5.3)`);
		}
	}

	for (const tag of tagsOf(page.html, 'meta')) {
		const name = attributeValue(tag, 'name') ?? '';
		if (name.toLowerCase().startsWith('twitter:')) {
			issues.push(`${page.path}: \`${name}\` — no social meta beyond og:site_name (SPEC §2.6)`);
		}
	}

	return issues;
}

/**
 * SPEC §2.6: the page title is the §2.1/§2.6 title from `src/lib/pages.ts`, verbatim. Checking
 * it here ties the registry — which the link gate trusts and llms.txt mirrors — to what the
 * page actually renders, so a title cannot drift out of the registry unnoticed.
 */
export function titleIssues(page: ShellPage, title: string): string[] {
	const found = page.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
	if (found === undefined) return [`${page.path}: no <title> (SPEC §2.6)`];
	return decodeEntities(found).trim() === title
		? []
		: [`${page.path}: the title is \`${found.trim()}\`, expected \`${title}\` (SPEC §2.6)`];
}

/** The 404 keeps the default minimal shape (SPEC §2.8): one sentence, one way home, nothing else. */
export function notFoundIssues(page: ShellPage): string[] {
	const issues: string[] = [];
	const text = textOf(page.html);
	const links = linksOf(page.html);

	if (!text.includes("This page doesn't exist.")) {
		issues.push(`${page.path}: the 404 is missing \`This page doesn't exist.\` (SPEC §2.8)`);
	}
	if (!text.includes('Head back home.')) {
		issues.push(`${page.path}: the 404 is missing the \`Head back home.\` link text (SPEC §2.8)`);
	}
	if (!links.some((link) => link.href === '/')) {
		issues.push(`${page.path}: the 404 has no link home (SPEC §2.8)`);
	}
	for (const link of links.filter((candidate) => /^https?:/i.test(candidate.href))) {
		issues.push(`${page.path}: the 404 links out to ${link.href} — no docs / GitHub entry (SPEC §2.8)`);
	}

	return issues;
}

/* ------------------------------------------------------------------ behaviours in the shipped CSS and script */

/**
 * SPEC §2.2/§2.7: the header's own rules in the shipped CSS. The sticky position and the blur
 * are read out of the rules that name `#site-header`, so a `sticky` or a blur declared
 * somewhere else in the sheet does not stand in for the header's; the reduced-transparency
 * block has to override that same rule, and the reduced-motion guard turns scrolling off.
 */
export function shellCssIssues(css: string): string[] {
	const issues: string[] = [];
	const headerRules = [...css.matchAll(/([^{}]*#site-header[^{}]*)\{([^}]*)\}/g)].map((match) => ({
		selector: match[1]!,
		body: match[2]!,
	}));

	const positionRule = headerRules.find((rule) => !rule.selector.includes('.is-scrolled'));
	if (positionRule === undefined || !/position:\s*sticky/.test(positionRule.body)) {
		issues.push('the shipped CSS has no `position: sticky` on #site-header (SPEC §2.2)');
	}

	const scrolledRule = headerRules.find((rule) => rule.selector.includes('.is-scrolled'));
	if (scrolledRule === undefined || !/backdrop-filter:\s*blur\(12px\)/.test(scrolledRule.body)) {
		issues.push('the shipped CSS has no `backdrop-filter: blur(12px)` on the scrolled header (SPEC §2.2)');
	} else if (!/background-color:\s*(?:color-mix|rgba?|hsla?)\(/.test(scrolledRule.body)) {
		issues.push('the scrolled header has no translucent wash — the blur sits on an opaque bar (SPEC §2.2)');
	}

	const reducedTransparency = css.match(/@media[^{]*prefers-reduced-transparency:\s*reduce[^{]*\{([^}]*)\}/);
	if (reducedTransparency === null) {
		issues.push('the shipped CSS has no `prefers-reduced-transparency: reduce` fallback (SPEC §2.2)');
	} else {
		const fallback = reducedTransparency[1]!;
		if (!fallback.includes('#site-header') || !/backdrop-filter:\s*none/.test(fallback)) {
			issues.push(
				'the reduced-transparency fallback does not give #site-header a solid, blur-free background (SPEC §2.2)',
			);
		}
	}

	const reducedMotion = css.match(/@media[^{]*prefers-reduced-motion:\s*reduce[^{]*\{([^}]*)\}/);
	if (reducedMotion === null) {
		issues.push('the shipped CSS has no `prefers-reduced-motion: reduce` guard (SPEC §2.7)');
	} else if (!/scroll-behavior:\s*auto/.test(reducedMotion[1]!)) {
		issues.push('the reduced-motion guard does not turn smooth scrolling off (SPEC §2.7)');
	}

	return issues;
}

/**
 * SPEC §2.2: the shipped script walks the header past the 8px threshold. Read from what the
 * pages ship (the inline `<script>` text), so deleting the listener or the class name is a
 * finding rather than a silent no-op.
 */
export function scrollStateIssues(scripts: readonly string[]): string[] {
	const walks = scripts.some((script) => script.includes('is-scrolled') && /\bscrollY\s*>\s*8\b/.test(script));
	return walks
		? []
		: ['no shipped script walks #site-header past 8px of scroll — `is-scrolled` never changes (SPEC §2.2)'];
}

/**
 * SPEC §2.2/§5.5: a shell component's own source — no entrance animation, no foreign
 * subresource. The gate runs it over the components that render the shell; the origin literal
 * is `check-origin`'s rule, not this one's.
 */
export function shellComponentIssues(source: string): string[] {
	const issues: string[] = [];

	if (/@keyframes/.test(source)) {
		issues.push('the shell ships no entrance animation (SPEC §2.2): `@keyframes` found');
	}
	if (/\banimation\s*:/.test(source)) {
		issues.push('the shell ships no entrance animation (SPEC §2.2): an `animation` declaration found');
	}
	if (/\burl\(\s*["']?https?:/i.test(source)) {
		issues.push('the shell loads nothing from another origin (SPEC §5.5): a remote `url()` found');
	}

	return issues;
}
