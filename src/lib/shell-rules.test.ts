import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	footerIssues,
	headerIssues,
	headIssues,
	notFoundIssues,
	scrollStateIssues,
	shellComponentIssues,
	shellCssIssues,
	titleIssues,
} from './shell-rules.ts';
import { LINKS } from './links.ts';
import { versionLabel } from './version.ts';

const origin = 'https://oribos.dev';

/** The version badge the header carries (SPEC-revamp §4.2) — desktop nav and mobile menu. */
const pill = `<a href="${LINKS.releases}" data-version-pill class="box font-mono">${versionLabel}</a>`;

/** The markup the shell must render, reduced to the strings the rules read. */
const header = `
<header id="site-header" class="sticky top-0">
	<a href="/" class="wordmark">Oribos</a>
	<nav aria-label="Main">
		<button type="button" aria-expanded="false" aria-controls="use-cases-menu">Use cases<svg aria-hidden="true"></svg></button>
		<div id="use-cases-menu" hidden>
			<a href="/in-product-agents/">In-product agents<span>An assistant inside the app you already run.</span></a>
			<a href="/operations-agents/">Operations agents<span>Busywork handled — with a human on the risky steps.</span></a>
			<a href="/developer-infrastructure/">Platform &amp; developer infra<span>Primitives your product teams compose.</span></a>
		</div>
		<a href="${LINKS.docs}">Docs</a>
		<a href="${LINKS.github}">GitHub</a>
		${pill}
	</nav>
	<button type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Menu"><svg aria-hidden="true"></svg></button>
	<div id="site-menu" hidden>
		<button type="button" aria-expanded="false" aria-controls="mobile-use-cases">Use cases</button>
		<ul id="mobile-use-cases" hidden>
			<li><a href="/in-product-agents/">In-product agents</a></li>
			<li><a href="/operations-agents/">Operations agents</a></li>
			<li><a href="/developer-infrastructure/">Platform &amp; developer infra</a></li>
		</ul>
		<a href="${LINKS.docs}">Docs</a>
		<a href="${LINKS.github}">GitHub</a>
		${pill}
	</div>
</header>`;

const footer = `
<footer>
	<a href="/">Oribos</a>
	<p>Ultralight TypeScript agent framework.<br />Compose only what you use — run anywhere, no runtime baggage.</p>
	<h2>Framework</h2>
	<a href="/ai-agent-framework/">Agent framework</a>
	<a href="/ai-agents/">Agents</a>
	<a href="/ai-workflows/">Workflows</a>
	<a href="/ai-agent-observability/">Observability</a>
	<h2>Use cases</h2>
	<a href="/in-product-agents/">In-product agents</a>
	<a href="/operations-agents/">Operations agents</a>
	<a href="/developer-infrastructure/">Platform &amp; developer infra</a>
	<h2>Developers</h2>
	<a href="${LINKS.docs}">Docs</a>
	<a href="${LINKS.examples}">Examples</a>
	<a href="${LINKS.architecture}">Architecture</a>
	<h2>Project</h2>
	<a href="/about/">About</a>
	<a href="${LINKS.github}">GitHub</a>
	<span>© 2026 Oribos · Apache-2.0</span>
	<a href="/privacy-policy/">Privacy</a>
	<a href="/terms-of-service/">Terms</a>
</footer>`;

const head = `
<html lang="en">
	<head>
		<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg" />
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
		<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
		<meta property="og:site_name" content="Oribos" />
		<meta property="og:image" content="${origin}/og.png" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fdfdfb" />
		<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1d1a16" />
	</head>
	<body>${header}${footer}</body>
</html>`;

const page = (html: string, path = 'index.html') => ({ path, html });
const issuesOf = (html: string) => headerIssues(page(html));

test('a shell page passes the header, footer and head rules', () => {
	assert.deepEqual(headerIssues(page(head)), []);
	assert.deepEqual(footerIssues(page(head)), []);
	assert.deepEqual(headIssues(page(head), origin), []);
});

test('the header carries the wordmark, the use-case dropdown, Docs, GitHub and the pill', () => {
	const withoutWordmark = head.replace('<a href="/" class="wordmark">Oribos</a>', '');
	assert.match(issuesOf(withoutWordmark)[0]!, /wordmark/);

	const withoutItem = head.replace(/<a href="\/operations-agents\/">[\s\S]*?<\/a>/g, '');
	assert.match(issuesOf(withoutItem)[0]!, /Operations agents/);

	const wrongDocs = head.replace(`<a href="${LINKS.docs}">Docs</a>`, '<a href="https://example.com">Docs</a>');
	assert.match(issuesOf(wrongDocs)[0]!, /Docs/);
});

test('the dropdown keeps the SPEC order: Items → Docs → GitHub → the version pill', () => {
	const reordered = head
		.replace(pill, '')
		.replace('<nav aria-label="Main">', `<nav aria-label="Main">${pill}`);
	assert.ok(issuesOf(reordered).length > 0, 'a pill before the links is out of order');
});

test('the footer keeps the four columns in order and the verbatim tagline and legal line', () => {
	const withoutTagline = head.replace('Compose only what you use — run anywhere, no runtime baggage.', 'Compose only what we sell.');
	assert.match(footerIssues(page(withoutTagline))[0]!, /tagline/);

	const withoutLegal = head.replace('© 2026 Oribos · Apache-2.0', '© 2026 Oribos');
	assert.match(footerIssues(page(withoutLegal))[0]!, /Apache-2.0/);

	const swapped = head.replace('<h2>Developers</h2>', '<h2>Project</h2>');
	const found = footerIssues(page(swapped));
	assert.ok(found.length > 0, 'column order is not the SPEC order');
});

test('cut navigation and the newsletter/social surfaces do not come back', () => {
	for (const label of ['Pricing', 'Customers', 'Resources', 'Product']) {
		const found = issuesOf(head.replace('</nav>', `<a href="/${label.toLowerCase()}">${label}</a></nav>`));
		assert.ok(found.length > 0, `\`${label}\` must not appear in the header`);
	}

	const keywordLink = issuesOf(head.replace('</nav>', '<a href="/ai-agents/">Agents</a></nav>'));
	assert.ok(keywordLink.length > 0, 'keyword pages are footer-only');

	const newsletter = footerIssues(page(head.replace('</footer>', '<a href="/newsletter">Newsletter</a></footer>')));
	assert.ok(newsletter.length > 0, 'the newsletter slot stays deleted');

	const social = footerIssues(page(head.replace('</footer>', '<a href="https://x.com/oribos">X</a></footer>')));
	assert.ok(social.length > 0, 'no social column');
});

test('the version pill reads the one constant, links Releases and stays a mono hairline badge', () => {
	const without = issuesOf(head.replaceAll(pill, ''));
	assert.ok(without.some((issue) => /has no version pill/.test(issue)), 'the header carries the badge');

	const drifted = issuesOf(head.replaceAll(versionLabel, 'v0.5.0'));
	assert.ok(drifted.some((issue) => /one constant/.test(issue)), 'the label comes from the constant');

	const elsewhere = issuesOf(head.replaceAll(LINKS.releases, LINKS.github));
	assert.ok(elsewhere.some((issue) => /releases/.test(issue)), 'the badge links the releases page');

	const plain = issuesOf(head.replaceAll(' class="box font-mono"', ''));
	assert.ok(plain.some((issue) => /mono, hairline/.test(issue)), 'the badge is mono and hairline-edged');

	const stray = issuesOf(head.replace('</header>', '<span>v0.5.0</span></header>'));
	assert.ok(stray.some((issue) => /besides the/.test(issue)), 'no other version sits in the header');
});

test('disclosures are wired: every control names a panel, and starts closed', () => {
	const dangling = issuesOf(head.replace('aria-controls="mobile-use-cases"', 'aria-controls="nope"'));
	assert.ok(dangling.length > 0, 'an aria-controls pointing nowhere is a finding');

	const opened = issuesOf(head.replace('aria-expanded="false"', 'aria-expanded="true"'));
	assert.ok(opened.length > 0, 'the shell starts closed');

	const notAButton = issuesOf(head.replace('<button type="button" aria-expanded="false" aria-controls="use-cases-menu">', '<div aria-expanded="false" aria-controls="use-cases-menu">'));
	assert.ok(notAButton.length > 0, 'a disclosure is controlled by a real button');
});

test('the head carries the favicon set, the og image pair and the theme-color pair', () => {
	assert.deepEqual(headIssues(page(head), origin), []);

	const noIcon = head.replace('<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg" />', '');
	assert.match(headIssues(page(noIcon), origin)[0]!, /favicon/);

	const noPng = head.replace('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />', '');
	assert.match(headIssues(page(noPng), origin)[0]!, /32×32/);

	const noTouch = head.replace('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />', '');
	assert.match(headIssues(page(noTouch), origin)[0]!, /apple-touch-icon/);

	const wrongImage = head.replace(`${origin}/og.png`, `${origin}/card.png`);
	assert.match(headIssues(page(wrongImage), origin)[0]!, /og:image/);

	const oneThemeColor = head.replace(/\s*<meta name="theme-color" media="\(prefers-color-scheme: dark\)" content="#1d1a16" \/>/, '');
	assert.match(headIssues(page(oneThemeColor), origin)[0]!, /theme-color/);

	const twitter = head.replace('</head>', '<meta name="twitter:card" content="summary" /></head>');
	assert.match(headIssues(page(twitter), origin)[0]!, /twitter/);
});

test('the 404 carries one sentence and a home link, and no way out to docs or GitHub', () => {
	const notFound = `<html lang="en"><body><h1>404</h1><p>This page doesn't exist. <a href="/">Head back home.</a></p></body></html>`;
	assert.deepEqual(notFoundIssues(page(notFound, '404.html')), []);

	assert.match(notFoundIssues(page('<p>Nothing here.</p>', '404.html'))[0]!, /doesn't exist/);
	assert.ok(notFoundIssues(page(notFound.replace('href="/"', 'href="/about/"'), '404.html')).length > 0);
	assert.ok(
		notFoundIssues(page(notFound.replace('</p>', `</p><a href="${LINKS.github}">GitHub</a>`), '404.html')).length > 0,
	);
});

test('the page title is the registry title, verbatim', () => {
	const title = 'About — Oribos';
	const pageWithTitle = (value: string) => page(`<html><head><title>${value}</title></head><body></body></html>`);

	assert.deepEqual(titleIssues(pageWithTitle(title), title), []);
	assert.match(titleIssues(pageWithTitle('About'), title)[0]!, /expected \`About — Oribos\`/);
	assert.match(titleIssues(page('<html><head></head></html>'), title)[0]!, /no <title>/);
});

test('the shell behaviours the spec pins are in the shipped CSS', () => {
	const css = `
		#site-header { position: sticky; top: 0; }
		#site-header.is-scrolled { backdrop-filter: blur(12px); background-color: color-mix(in srgb, var(--bg) 82%, transparent); }
		@media (prefers-reduced-transparency: reduce) { #site-header.is-scrolled { background-color: var(--bg); backdrop-filter: none; } }
		@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
	`;
	assert.deepEqual(shellCssIssues(css), []);

	assert.match(shellCssIssues(css.replace(/position: sticky;/g, ''))[0]!, /position: sticky.*#site-header/);
	assert.match(shellCssIssues(css.replace('blur(12px)', 'blur(4px)'))[0]!, /blur\(12px\)/);
	assert.ok(shellCssIssues(css.replace(/@media \(prefers-reduced-transparency: reduce\)[^}]*\}[^}]*\}/, '')).length > 0);

	// A sticky or a blur declared on some other element does not stand in for the header's own.
	assert.deepEqual(shellCssIssues(`#other { position: sticky; } #other.is-scrolled { backdrop-filter: blur(12px); }\n${css}`), []);
	const elsewhere = shellCssIssues('#other { position: sticky; } #other.is-scrolled { backdrop-filter: blur(12px); }');
	assert.ok(elsewhere.some((issue) => /position: sticky.*#site-header/.test(issue)));
	assert.ok(elsewhere.some((issue) => /blur\(12px\).*scrolled header/.test(issue)));
});

test('the shipped script walks the header past its 8px threshold', () => {
	assert.deepEqual(scrollStateIssues(['const on = () => header.classList.toggle("is-scrolled", window.scrollY > 8);']), []);
	assert.match(scrollStateIssues(['console.log("no header script")'])[0]!, /8px/);
	assert.match(scrollStateIssues(['header.classList.toggle("is-scrolled", window.scrollY > 40);'])[0]!, /8px/);
	assert.match(scrollStateIssues(['header.classList.toggle("is-scrolled", window.scrollY > 80);'])[0]!, /8px/);
});

test('the header ships no entrance animation and no foreign subresource', () => {
	assert.deepEqual(shellComponentIssues('<style>#site-header { position: sticky; }</style>'), []);
	assert.match(shellComponentIssues('<style>#site-header { animation: fade-in 0.3s; }</style>')[0]!, /animation/);
	assert.match(shellComponentIssues('<style>@keyframes fade-in { from { opacity: 0 } }</style>')[0]!, /@keyframes/);
	assert.match(
		shellComponentIssues('<style>#site-header { background: url(https://example.com/x.png) }</style>')[0]!,
		/another origin/,
	);
});
