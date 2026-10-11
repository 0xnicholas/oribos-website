#!/usr/bin/env node
/**
 * The type-scale gate (SPEC-revamp §2.3/§2.10-3). Component font sizes come from the eight
 * locked steps and nothing else — no free px/rem values, no step the table does not have,
 * no orphan line-heights that would break the 4px discipline. Three scans:
 *
 *   1. the token layer: the `--t-*` declarations must equal the §2.3 table (sizes and the
 *      4px-multiple line heights), which `parseLandingTokens` already validates;
 *   2. the source: components, layouts and pages carry no banned size utility (`text-sm`
 *      and friends), no `leading-*` override, and no hand-written `font-size` that is not
 *      a `var(--t-*)` reference;
 *   3. the rendered artifact: every `font-size` the build ships is one of the eight tokens.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-type-scale.mjs [--root <dir>] [--css <file>]
 */
import path from 'node:path';
import { builtPages, failGate, filesUnder, readText, shippedCss, startGate } from './lib/cli.mjs';
import { parseLandingTokens, typeScaleSteps } from '../src/lib/brand-tokens.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['css'] });
const cssFile = path.join(repoRoot, options.css ?? 'src/styles/global.css');
const distDir = path.join(repoRoot, 'dist');

const css = readText(cssFile);
if (css === null) {
	console.error(`✗ cannot read the token stylesheet \`${path.relative(repoRoot, cssFile)}\``);
	process.exit(1);
}

const issues = [];

// 1. The layer itself — sizes, line heights, declared once (§2.3).
const { errors: layerErrors } = parseLandingTokens(css);
for (const error of layerErrors) console.error(`✗ ${error}`);
if (layerErrors.length === 0) console.log('✓ the --t-* declarations equal the §2.3 table (sizes + 4px-multiple line heights)');

// 2. The source: the banned utilities and hand-written sizes.
const steps = new Set(typeScaleSteps.map((step) => `--t-${step}`));
const sizeUtilities = /(?:^|[\s":])text-(sm|6xl|7xl|8xl|9xl|\[[^\]]*\])(?=[\s"])/g;
const leadingUtilities = /(?:^|[\s":])leading-(?!none\b)[a-z0-9[\]#/.-]*(?=[\s"])/g;
const sourceIssues = [];

for (const directory of ['src/components', 'src/layouts', 'src/pages']) {
	for (const file of filesUnder(path.join(repoRoot, directory)).filter((name) => name.endsWith('.astro'))) {
		const text = readText(path.join(repoRoot, directory, file));
		if (text === null) continue;
		for (const match of text.matchAll(sizeUtilities)) {
			sourceIssues.push(`${directory}/${file}: \`text-${match[1]}\` is not one of the eight §2.3 steps`);
		}
		for (const match of text.matchAll(leadingUtilities)) {
			sourceIssues.push(`${directory}/${file}: \`${match[0].trim()}\` overrides the locked line height — the type-scale utilities set it`);
		}
		for (const match of text.matchAll(/font-size\s*:\s*([^;}"']+)?/g)) {
			const value = (match[1] ?? '').trim();
			if (value.startsWith('var(') && steps.has(value.slice(4, -1))) continue;
			sourceIssues.push(`${directory}/${file}: hand-written \`font-size: ${value || '…'}\` — sizes come from the §2.3 tokens`);
		}
	}
}
for (const issue of sourceIssues) console.error(`✗ ${issue}`);
if (sourceIssues.length === 0) {
	console.log('✓ components carry no banned size utility, no leading-* override, no hand-written font-size');
}
issues.push(...layerErrors, ...sourceIssues);

// 3. The rendered artifact: every shipped font-size is a --t-* reference (§2.10-3).
const pages = builtPages(distDir);
if (pages.length === 0) {
	console.error('✗ dist/ carries no built pages — `pnpm build` writes them before this gate runs');
	process.exit(1);
}
const rendered = shippedCss(distDir, pages);
const renderedIssues = [];
for (const match of rendered.matchAll(/font-size\s*:\s*([^;}]+)/g)) {
	const value = (match[1] ?? '').trim();
	if (value.startsWith('var(') && steps.has(value.slice(4, -1))) continue;
	if (value === 'inherit' || value === '100%' || value === '1em' || value === '80%' || value === '75%') continue; // preflight UA resets, not size choices
	renderedIssues.push(`dist/ ships \`font-size: ${value}\` — not one of the eight §2.3 tokens`);
}
for (const issue of renderedIssues) console.error(`✗ ${issue}`);
if (renderedIssues.length === 0) {
	console.log('✓ every rendered font-size in dist/ is one of the eight --t-* tokens');
}

failGate([...issues, ...renderedIssues], {
	summary: 'type-scale problem(s) (SPEC-revamp §2.3 — eight steps, locked; do not add one in passing).',
	hint: 'Use the text-xs/base/lg/xl/2xl/3xl/4xl/5xl utilities; they carry the §2.3 line heights with them.',
});
console.log('\nType scale: locked.');
