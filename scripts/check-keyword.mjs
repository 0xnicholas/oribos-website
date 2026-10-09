#!/usr/bin/env node
/**
 * The keyword-page gate (SPEC §4.4/§2.6/§5.5/§9.2) over the built keyword pages: the skeleton
 * in order — H1 (the keyword's face plus its claim), the 2–4 argument sections verbatim, the
 * one `Learn more` link to the pre-launch constant, the in-page FAQ (4–5 questions verbatim,
 * answers 1–3 sentences and self-contained, zero overlap with the global nine, never the
 * `data-faq` marker the §3.7 gate owns), the shared final CTA with the §4.5 copy and the
 * back-to-home anchor. The pages keep their red lines — RAG / evals nowhere in the page's own
 * copy (the page-level half of check-copy's rule), no code block, no links between keyword
 * pages, no Platform-class words — state the §2.6 meta description and og pair, and paint text
 * only in the §5.5 audited roles.
 * Registered pages the build does not have yet are reported as pending, like the shell gate.
 * The rules live in `src/lib/keyword-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-keyword.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, runChecks, startGate } from './lib/cli.mjs';
import { headIssues } from '../src/lib/head-rules.ts';
import { finalCtaIssues } from '../src/lib/hero-rules.ts';
import {
	carriesKeywordPage,
	keywordColourIssues,
	keywordPageIssues,
	keywordPages,
} from '../src/lib/keyword-rules.ts';
import { routeOfHtmlFile } from '../src/lib/link-rules.ts';
import { pages } from '../src/lib/pages.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const built = builtPages(dist);

if (built.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const byRoute = new Map(keywordPages.map((spec) => [spec.route, spec]));
const titles = new Map(pages.map((page) => [page.route, page.title]));

// A built page is a keyword page when the registry claims its route; a page carrying the
// keyword skeleton without a registry entry is a finding of its own — the registry is the
// site's page list (SPEC §2.1).
const builtKeywordPages = built.filter((page) => byRoute.has(routeOfHtmlFile(page.path)));
const stray = built.filter((page) => !byRoute.has(routeOfHtmlFile(page.path)) && carriesKeywordPage(page.html));

if (builtKeywordPages.length === 0) {
	console.error('✗ no built keyword page — /ai-agent-framework ships in this slice (SPEC §4.4)');
	process.exit(1);
}

const perPage = [...byRoute.entries()].flatMap(([route, spec]) => {
	const page = built.find((candidate) => routeOfHtmlFile(candidate.path) === route);
	if (page === undefined) return [];
	const title = titles.get(route);
	if (title === undefined) {
		return [[[`${page.path}: ${route} has no title in src/lib/pages.ts (SPEC §2.6)`], `${route}: the §2.6 title is registered`]];
	}
	return [
		[
			keywordPageIssues(page, spec),
			`${route}: the §4.4 skeleton — H1, the argument sections, one \`Learn more\`, the in-page FAQ, the back anchor, the red lines`,
		],
		[headIssues(page, { description: spec.description, title }), `${route}: the §2.6 meta description and the og pair`],
		[keywordColourIssues(page), `${route}: text only in the §5.5 audited roles on the page background`],
		[finalCtaIssues(page), `${route}: the shared final CTA — the §4.5 copy, the chip CTA and the GitHub text link`],
	];
});

const checks = [
	...perPage,
	[stray.map((page) => `${page.path}: carries the keyword skeleton but is not in src/lib/keyword-rules.ts's registry (SPEC §2.1/§4.4)`), 'registry: every keyword-skeleton page is a registered keyword page'],
];

const issues = runChecks(checks);

const pending = keywordPages.filter((spec) => !builtKeywordPages.some((page) => routeOfHtmlFile(page.path) === spec.route));
if (pending.length > 0) {
	console.log(`· ${pending.length} registered keyword page(s) not built yet: ${pending.map((spec) => spec.route).join(' ')}`);
}

failGate(issues, {
	summary: `keyword-page problem(s) (SPEC §4.4/§2.6/§5.5/§9.2).`,
	hint: 'The pages read their copy from src/content/keyword-pages/; the spec copy lives in src/lib/keyword-rules.ts.',
});
console.log('\nKeyword pages hold.');
