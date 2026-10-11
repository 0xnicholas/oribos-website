#!/usr/bin/env node
/**
 * The WCAG AA gate over the brand token layer (SPEC §5.5). The audited source is
 * `src/styles/global.css` — the same file the site loads — so the gate cannot drift from what
 * ships: a token edit that drops a pair below 4.5:1 turns this red.
 *
 * §5.5 reduces the palette to 8 rendered pairs (body / headings / link × page & nav-footer,
 * accent-low chip, button invert, muted meta) × 2 themes = the 16 checks below.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-contrast.mjs [--root <dir>] [--css <file>]
 */
import path from 'node:path';
import { startGate, readText } from './lib/cli.mjs';
import { auditTokens, parseLandingTokens } from '../src/lib/brand-tokens.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['css'] });
const cssFile = options.css ?? path.join(repoRoot, 'src/styles/global.css');

const css = readText(cssFile);
if (css === null) {
	console.error(`✗ cannot read the token stylesheet \`${cssFile}\``);
	process.exit(1);
}

const { tokens, errors: parseErrors } = parseLandingTokens(css);
if (parseErrors.length > 0) {
	for (const error of parseErrors) console.error(`✗ ${error}`);
	console.error(`\n${parseErrors.length} token-layer problem(s) — the AA audit cannot run.`);
	process.exit(1);
}

const { rows, errors: auditErrors } = auditTokens(tokens);
for (const error of auditErrors) console.error(`✗ ${error}`);

const failed = rows.filter((row) => !row.pass);

// One report block per theme: the ratio, the pair it was measured on, and the floor.
for (const theme of ['light', 'dark']) {
	console.log(`\n${theme}`);
	for (const row of rows.filter((item) => item.theme === theme)) {
		const mark = row.pass ? 'ok  ' : 'FAIL';
		console.log(`  ${mark} ${`${row.ratio.toFixed(2)}:1`.padEnd(8)} ${row.label.padEnd(38)} (min ${row.min})`);
	}
}

console.log(`\n${rows.length} checks · ${rows.length - failed.length} pass · ${failed.length} fail`);

if (failed.length > 0 || auditErrors.length > 0) {
	console.error('\n✗ Failing pairs (SPEC §5.5 — the palette is pinned, do not tune it in passing):');
	for (const row of failed) {
		console.error(`  ${row.theme} — ${row.label}: ${row.ratio.toFixed(2)}:1`);
		console.error(`    fg ${row.fg} on bg ${row.bg}`);
	}
	process.exit(1);
}

console.log('\nBrand tokens clear WCAG AA in both themes.');
