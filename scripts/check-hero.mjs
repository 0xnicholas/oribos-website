#!/usr/bin/env node
/**
 * The hero gate (SPEC §3.1 / §7.1 / §7.2 / §7.5 / §8.5, SPEC-revamp §4) over the built home page:
 * the hero's copy, its chip CTA and its GitHub text link, the product window's bar, the §7.2 code
 * block verbatim on the Shiki dual-theme surface, the trace waterfall's lanes and coordinates, the
 * shared final CTA with the same chip, the trace green staying trace-only, and the copy scripts
 * shipping. The rules live in `src/lib/hero-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-hero.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, filesUnder, readText, runChecks, shippedCss, shippedScripts, startGate } from './lib/cli.mjs';
import {
	copyScriptIssues,
	finalCtaIssues,
	heroCodeIssues,
	heroFile,
	heroIssues,
	heroWindowIssues,
	shikiIssues,
	traceIssues,
	traceRows,
	trailIssues,
} from '../src/lib/hero-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const home = builtPages(dist).find((page) => page.path === 'index.html');

if (home === undefined) {
	console.error(`✗ ${path.relative(repoRoot, dist)}/index.html is missing — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const css = shippedCss(dist, [home]);
const scripts = shippedScripts(dist, [home]);
/** Where the trace green may live: the one declaration file, and the components that draw a trace. */
const sources = ['src/components', 'src/layouts', 'src/styles'].flatMap((directory) =>
	filesUnder(path.join(repoRoot, directory))
		.filter((file) => /\.(?:astro|css|ts)$/.test(file))
		.map((file) => ({
			path: `${directory}/${file}`,
			text: readText(path.join(repoRoot, directory, file)) ?? '',
		})),
);

const checks = [
	[heroIssues(home), 'hero: the §3.1 H1 and sub, the §4.3 chip CTA and the GitHub text link — no kicker, no pill, no star count'],
	[heroWindowIssues(home), `product window: three dots, the \`${heroFile}\` file tab, the \`trace\` badge, no session title`],
	[heroCodeIssues(home), 'code: the §7.2 snippet verbatim in one `astro-code` dual-theme block'],
	[traceIssues(home), `trace: the §7.5 meta line, ${traceRows.length} lanes with their coordinates and tones, the summary`],
	[finalCtaIssues(home), 'final CTA: the §4.5 copy, the same chip CTA and the GitHub text link'],
	[shikiIssues(css, home.html), "Shiki: the `.astro-code` dark switch reads the block's `--shiki-*` pair, painted by the custom oribos pair (github retired)"],
	[trailIssues(css, sources), 'trace green: declared once, consumed only by the trace-drawing components'],
	[copyScriptIssues(scripts), 'copy: the shipped scripts write the clipboard, show `✓ copied` and reset'],
];

const issues = runChecks(checks);

failGate(issues, {
	summary: `hero problem(s) (SPEC §3.1/§7.2/§7.5).`,
	hint: 'The hero, the window and the final CTA read their copy from src/content/; the spec copy lives in src/lib/hero-rules.ts.',
});
console.log('\nHero holds.');
