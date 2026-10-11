#!/usr/bin/env node
/**
 * The origin gate (SPEC §8.8 ⑥): canonical, og:url, the sitemap and robots.txt all name the
 * one origin `src/lib/site.ts` declares, the sitemap lists exactly this version's pages, and
 * no page, layout, style or config carries a second copy of the origin literal. The rules
 * live in `src/lib/origin-rules.ts`; this script reads the source tree and `dist/`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-origin.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, filesUnder, readText, runChecks, startGate } from './lib/cli.mjs';
import {
	canonicalIssues,
	ogUrlIssues,
	originIssues,
	robotsIssues,
	singlePointIssues,
	sitemapIssues,
} from '../src/lib/origin-rules.ts';
import { routeOfHtmlFile } from '../src/lib/link-rules.ts';
import { SITE } from '../src/lib/site.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const pages = builtPages(dist);

if (pages.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

/** The 404 is an error page: the sitemap skips it and so does the route set. */
const routes = pages
	.map((page) => (page.path.endsWith('404.html') ? null : routeOfHtmlFile(page.path)))
	.filter((route) => route !== null);
const origin = SITE.origin;

const sitemapIndex = readText(path.join(dist, 'sitemap-index.xml'));
const shards = new Map(
	filesUnder(dist)
		.filter((file) => /^sitemap-\d+\.xml$/.test(file))
		.map((file) => [file, readText(path.join(dist, file)) ?? '']),
);

// The origin literal is allowed in two checked static assets — `public/robots.txt` (its
// `Sitemap:` line) and `public/llms.txt` (every page URL) — plus the constant itself. Their
// values are verified against the constant by `robotsIssues` here and by `llmsIssues` in the
// shell gate, so neither can drift into a second origin. Unit tests are not the site face —
// they carry the literal as test data and never render a page.
const scannedFiles = [
	...filesUnder(path.join(repoRoot, 'src'))
		.filter((file) => /\.(?:ts|astro|css|mjs|json)$/.test(file) && !file.endsWith('.test.ts'))
		.map((file) => ({ path: `src/${file}`, text: readText(path.join(repoRoot, 'src', file)) ?? '' })),
	{ path: 'astro.config.mjs', text: readText(path.join(repoRoot, 'astro.config.mjs')) ?? '' },
	...filesUnder(path.join(repoRoot, 'public')).map((file) => ({
		path: `public/${file}`,
		text: readText(path.join(repoRoot, 'public', file)) ?? '',
	})),
];

const checks = [
	[originIssues(origin), `SITE.origin is a bare origin (${origin})`],
	[canonicalIssues({ pages, origin }), 'every page carries exactly one canonical on the one origin'],
	[ogUrlIssues({ pages, origin }), 'every page\u2019s og:url is its canonical'],
	[robotsIssues({ robots: readText(path.join(dist, 'robots.txt')), origin }), 'robots.txt allows crawling and names the sitemap index'],
	[sitemapIssues({ index: sitemapIndex, shards, origin, routes }), `the sitemap lists exactly the ${routes.length} built page(s)`],
	[
		singlePointIssues({
			files: scannedFiles,
			origin,
			allowedPaths: ['src/lib/site.ts', 'public/robots.txt', 'public/llms.txt'],
		}),
		'the origin literal lives in src/lib/site.ts (and the two checked static assets) only',
	],
];

const issues = runChecks(checks);

failGate(issues, {
	summary: `origin problem(s) (SPEC §8.4).`,
	hint: 'canonical / og:url / sitemap / robots all derive from SITE.origin in src/lib/site.ts.',
});
console.log('\nOrigin holds.');
