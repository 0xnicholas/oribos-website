#!/usr/bin/env node
/**
 * The home band gate (SPEC-revamp §3/§3.2/§3.3/§3.4/§3.6/§7.4) over the built home page: the §3
 * nine-zone section order, the architecture facts strip with its four verbatim cells, the
 * observability trio (the one §7.4 code card, the hero trace reused, the span type list), the
 * resources cards with their §3.6 descriptions — and the two shared rules: no counting-style
 * figures, and text painted only in the roles §5.5 audits on the page background. The abolished
 * social-proof band stays gone. The rules live in `src/lib/band-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-bands.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, runChecks, startGate } from './lib/cli.mjs';
import {
	bandColorIssues,
	bandCountingIssues,
	factsIssues,
	homeSectionOrderIssues,
	observabilityIssues,
	resourcesIssues,
	socialProofRelicIssues,
} from '../src/lib/band-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const home = builtPages(dist).find((page) => page.path === 'index.html');

if (home === undefined) {
	console.error(`✗ ${path.relative(repoRoot, dist)}/index.html is missing — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const checks = [
	[
		homeSectionOrderIssues(home),
		'nine-zone order: hero → facts band → feature tabs → observability → use-case cards → resources → FAQ → final CTA',
	],
	[
		observabilityIssues(home),
		'observability trio: #observability — the §3.3 copy verbatim, the §7.4 `app.ts` card, the hero trace reused, the span type list',
	],
	[
		factsIssues(home),
		'facts band: four mono cells verbatim — no kicker, no heading, no anchor',
	],
	[
		resourcesIssues(home),
		'resources cards: #resources — the §3.6 descriptions verbatim, the three links from src/lib/links.ts',
	],
	[
		socialProofRelicIssues(home),
		'social-proof: the abolished band stays gone — no relic section, no #social-proof anchor',
	],
	[
		bandColorIssues(home),
		'home bands: text only in the §5.5 audited roles on the page background',
	],
	[
		bandCountingIssues(home),
		'home bands: no counting-style figures in the copy (SPEC §9.2)',
	],
];

const issues = runChecks(checks);

failGate(issues, {
	summary: 'home-band problem(s) (SPEC-revamp §3/§3.2/§3.3/§3.4/§3.6/§7.4).',
	hint: 'The bands read their copy from src/content/; the spec copy lives in src/lib/band-rules.ts.',
});
console.log('\nHome bands hold.');
