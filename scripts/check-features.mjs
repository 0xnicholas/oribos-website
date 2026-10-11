#!/usr/bin/env node
/**
 * The feature-tabs gate (SPEC §3.2 / §7.1 / §7.3 / §8.5) over the built home page: the five tabs
 * in their fixed order with the `#agents`-style anchors, one visible panel without JS, every
 * claim and bullet verbatim, each code card's files in order with its §7.3 snippets verbatim and
 * within the ten-line cap, the terminology guard, and the shipped script that switches panels,
 * follows the hash and takes the arrow keys. The rules live in `src/lib/feature-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-features.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, runChecks, shippedScripts, startGate } from './lib/cli.mjs';
import { featureIssues, featureScriptIssues } from '../src/lib/feature-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const home = builtPages(dist).find((page) => page.path === 'index.html');

if (home === undefined) {
	console.error(`✗ ${path.relative(repoRoot, dist)}/index.html is missing — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const scripts = shippedScripts(dist, [home]);
const checks = [
	[
		featureIssues(home),
		'feature tabs: the §3.2 five panels — claims and bullets verbatim, §7.3 cards, anchors, the first panel on without JS',
	],
	[
		featureScriptIssues(scripts),
		'feature tabs: the shipped script switches panels, follows the hash and takes the arrow keys',
	],
];

const issues = runChecks(checks);

failGate(issues, {
	summary: `feature-tab problem(s) (SPEC §3.2/§7.1/§7.3).`,
	hint: 'The tabs read their copy from src/content/features/; the spec copy lives in src/lib/feature-rules.ts.',
});
console.log('\nFeature tabs hold.');
