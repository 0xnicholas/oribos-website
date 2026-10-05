#!/usr/bin/env node
/**
 * The shell gate (SPEC §2.2 header, §2.3 footer, §2.6/§5.3 head, §2.8 404, §8.4 llms.txt): every
 * canonical page carries the one header and footer with the verbatim composition and targets,
 * the head names the favicon, the og card and the theme-colour pair, the title is the registry's,
 * the 404 stays minimal, the static assets keep their shapes, and the shipped CSS and script keep
 * the sticky / blur behaviour. The rules live in `src/lib/shell-rules.ts` and
 * `src/lib/asset-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-shell.mjs [--root <dir>] [--dist <dir>]
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { builtPages, failGate, readText, runChecks, shippedCss, shippedScripts, startGate } from './lib/cli.mjs';
import { faviconIssues, llmsIssues, ogImageIssues, sizedPngIssues } from '../src/lib/asset-rules.ts';
import {
	footerIssues,
	headIssues,
	headerIssues,
	notFoundIssues,
	scrollStateIssues,
	shellComponentIssues,
	shellCssIssues,
	titleIssues,
} from '../src/lib/shell-rules.ts';
import { routeOfHtmlFile } from '../src/lib/link-rules.ts';
import { pages } from '../src/lib/pages.ts';
import { SITE } from '../src/lib/site.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const built = builtPages(dist);

if (built.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

/** The 404 is an error page: it carries neither shell, so its rules run on its own. */
const shellPages = built.filter((page) => !page.path.endsWith('404.html'));
const notFound = built.filter((page) => page.path.endsWith('404.html'));
const titleOf = new Map(pages.map((page) => [page.route, page.title]));

const binary = (file) => {
	try {
		return readFileSync(path.join(dist, file));
	} catch {
		return null;
	}
};

const css = shippedCss(dist, built);
const scripts = shippedScripts(dist, built);

/** The components that render the shell; their sources carry the animation / subresource rules. */
const shellComponents = ['src/components/Header.astro', 'src/components/Footer.astro'];

// A built page that is not one of the registered pages is a finding of its own: `src/lib/pages.ts`
// is the site's page list, and the link gate and llms.txt both trust it.
const titleChecks = shellPages.flatMap((page) => {
	const route = routeOfHtmlFile(page.path);
	const title = titleOf.get(route);
	return title === undefined
		? [`${page.path}: ${route} is not in src/lib/pages.ts — the registry is the site's page list (SPEC §2.1)`]
		: titleIssues(page, title);
});

const checks = [
	[
		shellPages.flatMap((page) => headerIssues(page)),
		`header: ${shellPages.length} page(s) carry the wordmark, the three use-case items, Docs, GitHub and the pill`,
	],
	[
		shellPages.flatMap((page) => footerIssues(page)),
		`footer: ${shellPages.length} page(s) carry the brand block, the four columns and the legal row`,
	],
	[
		shellPages.flatMap((page) => headIssues(page, SITE.origin)),
		`head: favicon, og:image ${SITE.origin}/og.png (1200×630), og:site_name and the theme-colour pair`,
	],
	[titleChecks, `titles: every page states the §2.6 title from src/lib/pages.ts`],
	[
		notFound.length === 0
			? ['dist/404.html is missing — the site serves the default 404 (SPEC §2.8)']
			: notFound.flatMap((page) => notFoundIssues(page)),
		'404: the default minimal page — one sentence, one way home, nothing else',
	],
	[faviconIssues(readText(path.join(dist, 'favicon.svg'))), 'favicon.svg: the amber-square mark, both theme values'],
	[
		[
			...sizedPngIssues(binary('favicon-32.png'), 'favicon-32.png', 32),
			...sizedPngIssues(binary('favicon-16.png'), 'favicon-16.png', 16),
			...sizedPngIssues(binary('apple-touch-icon.png'), 'apple-touch-icon.png', 180),
		],
		'favicon PNG exports: 32×32 and 16×16 fallbacks, the 180×180 apple-touch-icon',
	],
	[ogImageIssues(binary('og.png')), 'og.png: one static 1200×630 card'],
	[
		llmsIssues(readText(path.join(dist, 'llms.txt')), pages, SITE.origin),
		`llms.txt: the ${pages.length}-page list, verbatim titles and absolute URLs`,
	],
	[shellCssIssues(css), 'shell CSS: the header is sticky, blurs past its threshold and goes solid under reduced transparency'],
	[scrollStateIssues(scripts), 'shell script: the header walks past 8px of scroll'],
	[
		shellComponents.flatMap((file) =>
			shellComponentIssues(readText(path.join(repoRoot, file)) ?? '').map((issue) => `${file}: ${issue}`),
		),
		`shell components: ${shellComponents.length} source(s) ship no entrance animation, no foreign subresource`,
	],
];

const issues = runChecks(checks);

// A status line, not a finding: the sitemap covers every built page (check-origin), and the
// remaining registered pages arrive in later slices — the final walkthrough (#31) wants zero.
const builtRoutes = new Set(built.map((page) => routeOfHtmlFile(page.path)));
const pending = pages.filter((page) => !builtRoutes.has(page.route));
if (pending.length > 0) {
	console.log(
		`· ${pending.length} of ${pages.length} registered page(s) not built yet: ${pending.map((page) => page.route).join(' ')}`,
	);
}

failGate(issues, {
	summary: `shell problem(s) (SPEC §2.2/§2.3/§2.8/§5.3).`,
	hint: 'The shell is one component pair; its strings and targets are stated in src/lib/shell-rules.ts.',
});
console.log('\nShell holds.');
