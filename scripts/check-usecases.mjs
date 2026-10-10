#!/usr/bin/env node
/**
 * The use-case-cards gate (SPEC §3.5/§5.5/§9.2) over the built home page: the `#use-cases` section
 * with its verbatim intro, the three cards — title as the card's only link, claim verbatim, each
 * targeting its use-case route, clickable as a whole — and the three host-interface mocks (chat,
 * thread with the approval gate, trace console) with generic UI only. The mocks' figures stay
 * decorative, their colours come from the measured roles, their surface pairs clear AA in both
 * themes against the token layer the site ships, and the shipped CSS keeps the visible focus ring
 * the card links rely on. The mocks are also each use-case page's header mock (SPEC-revamp §5.1):
 * the reuse check holds every built use-case page head's window byte-identical to its card's.
 * The rules live in `src/lib/use-case-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-usecases.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, readText, runChecks, shippedCss, startGate } from './lib/cli.mjs';
import { parseLandingTokens } from '../src/lib/brand-tokens.ts';
import { routeOfHtmlFile } from '../src/lib/link-rules.ts';
import {
	focusRingIssues,
	headerMockReuseIssues,
	mockContrastIssues,
	useCaseCards,
	useCaseColourIssues,
	useCaseCountingIssues,
	useCaseIssues,
} from '../src/lib/use-case-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const built = builtPages(dist);
const home = built.find((page) => page.path === 'index.html');
const useCaseRoutes = new Set(useCaseCards.map((card) => card.route));

if (home === undefined) {
	console.error(`✗ ${path.relative(repoRoot, dist)}/index.html is missing — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const css = readText(path.join(repoRoot, 'src/styles/global.css'));
if (css === null) {
	console.error('✗ cannot read the token stylesheet `src/styles/global.css`');
	process.exit(1);
}
const { tokens, errors } = parseLandingTokens(css);
if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	console.error(`\n${errors.length} token-layer problem(s) — the mock AA audit cannot run.`);
	process.exit(1);
}

const checks = [
	[
		useCaseIssues(home),
		'use-case cards: #use-cases — the §3.5 intro verbatim, three verbatim cards linking their pages, the three host-interface mocks',
	],
	[useCaseColourIssues(home), 'use-case cards: the mock roles only — text and surfaces from the measured set'],
	[useCaseCountingIssues(home), 'use-case cards: figures decorative only — no size, count, test or star claim (SPEC §9.2)'],
	[mockContrastIssues(tokens), 'use-case mocks: the rendered pairs clear AA in both themes (SPEC §3.5/§5.5)'],
	[
		headerMockReuseIssues(home, built.filter((page) => useCaseRoutes.has(routeOfHtmlFile(page.path)))),
		"use-case mocks: every built use-case page's header mock is its card's mock, reused as-is (SPEC-revamp §5.1)",
	],
	[focusRingIssues(shippedCss(dist, [home])), 'use-case cards: the shipped CSS keeps the visible focus ring the card links use (SPEC §2.7)'],
];

const issues = runChecks(checks);

failGate(issues, {
	summary: `use-case-card problem(s) (SPEC §3.5/§5.5/§9.2).`,
	hint: 'The cards read their copy from src/content/use-cases/; the spec copy lives in src/lib/use-case-rules.ts.',
});
console.log('\nUse-case cards hold.');
