#!/usr/bin/env node
/**
 * The text-page gate (SPEC §4.1/§4.2/§2.5/§2.6/§5.5/§9.2, ticket #30) over the built `/about`
 * and the two legal stubs: /about's skeleton in order — H1, the public tagline verbatim, Our
 * story ×3, Who's behind it (the signature one `@0xnicholas` link to the maintainer profile,
 * never a name or an email), the closing invitation band with its GitHub · Issues pair and the
 * one back-to-home link — its red lines (no years outside the `© 2026` license line, no ADR or
 * issue numbers, no careers / funding content, no external link beyond the handle, GitHub and
 * Issues) — and its single entry (the footer Project column: the home body never links it).
 * The legal stubs carry their H1, the shared static `Last updated` line (shape and sameness
 * pinned, the value the launch day's one edit) and the locked paragraphs, contact through
 * GitHub Issues only, and no SaaS contract clauses or named hosting platform. The rules live
 * in `src/lib/text-page-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-text-pages.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, runChecks, startGate } from './lib/cli.mjs';
import { headIssues } from '../src/lib/head-rules.ts';
import { routeOfHtmlFile } from '../src/lib/link-rules.ts';
import { pages } from '../src/lib/pages.ts';
import {
	aboutEntryIssues,
	aboutPageIssues,
	aboutSpec,
	carriesTextPage,
	lastUpdatedIssues,
	legalPageIssues,
	legalPageSpecs,
	textPageColourIssues,
} from '../src/lib/text-page-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const built = builtPages(dist);

if (built.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const titles = new Map(pages.map((page) => [page.route, page.title]));
const byRoute = new Map(built.map((page) => [routeOfHtmlFile(page.path), page]));
const routes = [aboutSpec.route, ...legalPageSpecs.map((spec) => spec.route)];

// A built page carrying the text-page skeleton without being one of the three registered
// routes is a finding of its own — the registry is the site's page list (SPEC §2.1).
const stray = built.filter((page) => !routes.includes(routeOfHtmlFile(page.path)) && carriesTextPage(page.html));

const about = byRoute.get(aboutSpec.route);
const legalBuilt = legalPageSpecs.flatMap((spec) => {
	const page = byRoute.get(spec.route);
	return page === undefined ? [] : [{ spec, page }];
});

// All three text pages ship in this one slice (ticket #30) — none built is a failed build,
// not a pending slice.
if (about === undefined && legalBuilt.length === 0) {
	console.error('✗ no built text page — /about, /privacy-policy and /terms-of-service ship in this slice (SPEC §4.1/§4.2)');
	process.exit(1);
}

// A missing registry title is a finding of its own, like the keyword gate's — never an
// empty-string fallback that lets headIssues pass vacuously.
const headChecks = (route, page, description) => {
	const title = titles.get(route);
	return title === undefined
		? [[[`${page.path}: ${route} has no title in src/lib/pages.ts (SPEC §2.6)`], `${route}: the §2.6 title is registered`]]
		: [[headIssues(page, { description, title }), `${route}: the §2.6 meta description and the og pair`]];
};

const checks = [
	...(about === undefined
		? []
		: [
				[aboutPageIssues(about), '/about: the §4.1 skeleton — H1 + tagline, Our story, Who\'s behind it, the invitation band, back home'],
				...headChecks(aboutSpec.route, about, aboutSpec.description),
				[textPageColourIssues(about), '/about: text only in the §5.5 audited roles on the page background'],
			]),
	...legalBuilt.flatMap(({ spec, page }) => [
		[legalPageIssues(page, spec), `${spec.route}: the §4.2 stub — H1, the static \`Last updated\` line, the locked paragraphs, Issues-only contact`],
		...headChecks(spec.route, page, spec.description),
		[textPageColourIssues(page), `${spec.route}: text only in the §5.5 audited roles on the page background`],
	]),
	...(legalBuilt.length === legalPageSpecs.length
		? [
				[
					lastUpdatedIssues(legalBuilt[0].page, legalBuilt[1].page),
					'legal: the `Last updated` date is one static string both pages carry (ticket #30)',
				],
			]
		: []),
	[aboutEntryIssues(built), 'entry: no page body links /about — the entry is the footer Project column (SPEC §2.5)'],
	[stray.map((page) => `${page.path}: carries the text-page skeleton but is not one of the three text pages (SPEC §2.1)`), 'registry: every text-page-skeleton page is a registered text page'],
];

const issues = runChecks(checks);

const missing = routes.filter((route) => !byRoute.has(route));
if (missing.length > 0) {
	console.log(`· ${missing.length} registered text page(s) not built yet: ${missing.join(' ')}`);
}

failGate(issues, {
	summary: `text-page problem(s) (SPEC §4.1/§4.2).`,
	hint: 'The pages read their copy from src/content/about/ and src/content/legal-pages/; the spec copy lives in src/lib/text-page-rules.ts.',
});
console.log('\nText pages hold.');
