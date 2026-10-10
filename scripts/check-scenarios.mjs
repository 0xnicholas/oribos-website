#!/usr/bin/env node
/**
 * The use-case-page gate (SPEC-revamp §5.1; copy per SPEC §4.3/§2.6/§5.5/§9.2) over the built
 * use-case pages: the page head — H1 + tagline verbatim plus the page's one host-interface
 * header mock (chat window / approval thread / trace console, the home card's mock reused
 * as-is — the reuse itself is check-usecases.mjs's assertion) — then the skeleton in order:
 * the three scenario cards with their `→` package lines (every package its own inline-code
 * chip), the global FAQ ×9, the shared final CTA with the §4.5 copy, and the `← All use cases`
 * back link. The v1 shared abstract header art is retired — a tombstone here. The pages keep
 * their red lines — no code block, no social-proof band, no breadcrumbs, the CONTEXT.md
 * vocabulary and the `@oribos/*` scope — state the §2.6 meta description and og pair, paint
 * text only in the §5.5 audited roles outside the mock, and clear AA on the chip pair in both
 * themes. Registered pages the build does not have yet are reported as pending, like the shell
 * gate. The rules live in `src/lib/scenario-rules.ts`; the FAQ itself answers to check-faq.mjs
 * on these pages too.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-scenarios.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, readText, runChecks, startGate } from './lib/cli.mjs';
import { parseLandingTokens } from '../src/lib/brand-tokens.ts';
import { headIssues } from '../src/lib/head-rules.ts';
import { finalCtaIssues } from '../src/lib/hero-rules.ts';
import { routeOfHtmlFile } from '../src/lib/link-rules.ts';
import { pages } from '../src/lib/pages.ts';
import {
	carriesUseCasePage,
	scenarioContrastIssues,
	useCaseColourIssues,
	useCasePageIssues,
	useCasePages,
} from '../src/lib/scenario-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const built = builtPages(dist);

if (built.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const byRoute = new Map(useCasePages.map((spec) => [spec.route, spec]));
const titles = new Map(pages.map((page) => [page.route, page.title]));

// A built page is a use-case page when the registry claims its route; a page carrying the
// scenario marker without a registry entry is a finding of its own — the registry is the
// site's page list (SPEC §2.1).
const builtUseCasePages = built.filter((page) => byRoute.has(routeOfHtmlFile(page.path)));
const stray = built.filter((page) => !byRoute.has(routeOfHtmlFile(page.path)) && carriesUseCasePage(page.html));

if (builtUseCasePages.length === 0) {
	console.error('✗ no built use-case page — /in-product-agents ships in this slice (SPEC §4.3)');
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
	console.error(`\n${errors.length} token-layer problem(s) — the chip AA audit cannot run.`);
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
			useCasePageIssues(page, spec),
			`${route}: the §5.1 skeleton — the page head (H1 + tagline + header mock), three scenario cards with their package lines, the FAQ, the final CTA, the back link`,
		],
		[headIssues(page, { description: spec.description, title }), `${route}: the §2.6 meta description and the og pair`],
		[useCaseColourIssues(page), `${route}: text only in the §5.5 audited roles on the page background`],
		[finalCtaIssues(page), `${route}: the shared final CTA — the §4.5 copy, the chip CTA and the GitHub text link`],
	];
});

const checks = [
	...perPage,
	[stray.map((page) => `${page.path}: carries the scenario skeleton but is not in src/lib/scenario-rules.ts's registry (SPEC §2.1, SPEC-revamp §5.1)`), 'registry: every scenario page is a registered use-case page'],
	[scenarioContrastIssues(tokens), 'package chips: the rendered pair clears AA in both themes (SPEC §4.3/§5.5)'],
];

const issues = runChecks(checks);

const pending = useCasePages.filter((spec) => !builtUseCasePages.some((page) => routeOfHtmlFile(page.path) === spec.route));
if (pending.length > 0) {
	console.log(`· ${pending.length} registered use-case page(s) not built yet: ${pending.map((spec) => spec.route).join(' ')}`);
}

failGate(issues, {
	summary: `use-case-page problem(s) (SPEC-revamp §5.1, SPEC §2.6/§4.3/§5.5/§9.2).`,
	hint: 'The pages read their copy from src/content/use-cases/; the spec copy lives in src/lib/scenario-rules.ts.',
});
console.log('\nUse-case pages hold.');
