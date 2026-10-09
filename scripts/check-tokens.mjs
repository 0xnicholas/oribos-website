#!/usr/bin/env node
/**
 * The token-drift and literal-colour gate (SPEC-revamp §2.1/§2.10-2). The marketing site owns
 * its brand tokens now — the table in `docs/SPEC-revamp.md` §2.1 is the authority — so the
 * old cross-check against the oribos-docs checkout is gone. Three comparisons, one direction
 * of authority:
 *
 *   1. `src/styles/global.css` — the layer the site loads — against the §2.1 table in
 *      `docs/SPEC-revamp.md`, value by value, both themes;
 *   2. the rendered artifact: every `--*` colour token the build ships, read back out of
 *      `dist/`'s CSS, must equal the same table — the page cannot wear a value the layer
 *      never declared;
 *   3. every colour outside the token blocks — including the `@theme inline` aliases — must
 *      be a `var(--*)` reference, never a second copy of a value.
 *
 * It also reads the built `theme-color` pair back from `dist/index.html` (SPEC-revamp §2.8),
 * so the meta tags and the token layer cannot disagree about `--bg`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-tokens.mjs [--root <dir>] [--css <file>]
 *     [--spec <file>]
 */
import path from 'node:path';
import { builtPages, failGate, readText, shippedCss, shippedScripts, startGate } from './lib/cli.mjs';
import {
	colourTokens,
	literalColorIssues,
	parseLandingTokens,
	parseSpecRevampTable,
	rootDeclarations,
	splitThemeRegions,
	themeColorValues,
	tokenDrift,
} from '../src/lib/brand-tokens.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), {
	values: ['css', 'spec'],
});
const cssFile = path.join(repoRoot, options.css ?? 'src/styles/global.css');
const specFile = path.join(repoRoot, options.spec ?? 'docs/SPEC-revamp.md');
const distDir = path.join(repoRoot, 'dist');

const css = readText(cssFile);
if (css === null) {
	console.error(`✗ cannot read the token stylesheet \`${path.relative(repoRoot, cssFile)}\``);
	process.exit(1);
}
const spec = readText(specFile);
if (spec === null) {
	console.error(`✗ cannot read the spec corpus \`${path.relative(repoRoot, specFile)}\``);
	process.exit(1);
}

const landing = parseLandingTokens(css);
const specTable = parseSpecRevampTable(spec);
const hardErrors = [...landing.errors, ...specTable.errors];
if (hardErrors.length > 0) {
	for (const error of hardErrors) console.error(`✗ ${error}`);
	process.exit(1);
}

const issues = tokenDrift(landing.tokens, specTable.tokens, {
	actualLabel: 'src/styles/global.css',
	expectedLabel: 'docs/SPEC-revamp.md §2.1',
	slotsFor: () => colourTokens,
});
for (const issue of issues) console.error(`✗ ${issue}`);
if (issues.length === 0) {
	console.log('✓ token layer matches the §2.1 table in docs/SPEC-revamp.md, slot by slot, both themes');
}

const literals = literalColorIssues(css);
for (const issue of literals) console.error(`✗ ${issue}`);
if (literals.length === 0) {
	console.log('✓ no colour literal outside the token blocks — Tailwind aliases are var(--*) references');
}

/* ------------------------------------------------- the rendered artifact (§2.10-2) */

const pages = builtPages(distDir);
if (pages.length === 0) {
	console.error('✗ dist/ carries no built pages — `pnpm build` writes them before this gate runs');
	process.exit(1);
}
const rendered = shippedCss(distDir, pages);

// The rendered tokens come out of the same `:root` reader the layer uses, so a §2.1 token
// declared twice in the build is the same finding it is in the source (SPEC-revamp §2.1).
// Other variables the pages inline (`--trace-green` once per page, Tailwind's own theme
// block) are out of this gate's subject and are ignored name-wise, duplicates included.
const colourOnly = (root) => ({
	values: Object.fromEntries(Object.entries(root.values).filter(([name]) => colourTokens.includes(name))),
	errors: root.errors.filter((error) => colourTokens.some((name) => error.startsWith(`${name} `))),
});
const renderedRegions = splitThemeRegions(rendered);
const lightRoot = colourOnly(rootDeclarations(renderedRegions.light));
const darkRoot = colourOnly(rootDeclarations(renderedRegions.dark));
for (const error of [...lightRoot.errors, ...darkRoot.errors]) console.error(`✗ rendered CSS: ${error}`);
const renderedTokens = { light: lightRoot.values, dark: darkRoot.values };
/** `#fff` → `#ffffff`: the minifier shortens hex, the §2.1 table does not — compare longhand. */
const expandHex = (value) =>
	typeof value === 'string' ? value.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3') : value;
const longhand = (tokens) =>
	Object.fromEntries(
		Object.entries(tokens).map(([theme, set]) => [
			theme,
			Object.fromEntries(Object.entries(set).map(([name, value]) => [name, expandHex(value)])),
		]),
	);
const renderedIssues = [
	...lightRoot.errors.map((error) => `rendered CSS (light): ${error}`),
	...darkRoot.errors.map((error) => `rendered CSS (dark): ${error}`),
	...tokenDrift(longhand(renderedTokens), specTable.tokens, {
		actualLabel: 'the rendered CSS in dist/',
		expectedLabel: 'docs/SPEC-revamp.md §2.1',
		slotsFor: () => colourTokens,
	}),
];
for (const issue of renderedIssues) console.error(`✗ ${issue}`);
if (renderedIssues.length === 0) {
	console.log('✓ every rendered --* colour token in dist/ equals the §2.1 table, both themes');
}
issues.push(...renderedIssues);

// `--sl-*` is the retired v1 namespace: zero residue anywhere the build ships (§2.1) — the
// stylesheets, the pages and their scripts, not just the token block.
const shippedText = [rendered, ...pages.map((entry) => entry.html), ...shippedScripts(distDir, pages)].join('\n');
const residue = [...new Set(shippedText.match(/--sl-[a-z0-9-]*/g) ?? [])];
for (const name of residue) console.error(`✗ \`${name}\` still ships in dist/ — the v1 namespace is retired`);
if (residue.length === 0) {
	console.log('✓ the retired --sl-* namespace has zero residue anywhere in dist/');
}
issues.push(...residue.map((name) => `${name} still ships in dist/`));

// theme-color is each theme's resolved --bg (SPEC-revamp §2.8); read it back from the
// build so the meta pair and the stylesheet cannot disagree.
const themeColor = themeColorValues(landing.tokens);
const page = readText(path.join(distDir, 'index.html'));
if (page === null) {
	console.error('✗ dist/index.html is missing — `pnpm build` writes it before this gate runs');
	process.exit(1);
}
const metaColorIssues = [];
for (const [scheme, expected] of [['light', themeColor.light], ['dark', themeColor.dark]]) {
	const tag = [...page.matchAll(/<meta\b[^>]*>/gi)]
		.map((match) => match[0])
		.find((html) => /name\s*=\s*["']theme-color["']/i.test(html) && html.includes(`(prefers-color-scheme: ${scheme})`));
	const content = tag?.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
	const value = content?.[1] ?? content?.[2];
	if (value !== expected) {
		metaColorIssues.push(`dist/index.html: the ${scheme} theme-color is ${value ?? 'missing'}, expected ${expected}`);
	}
}
for (const issue of metaColorIssues) console.error(`✗ ${issue}`);
if (metaColorIssues.length === 0) {
	console.log(`✓ theme-color pair matches the token layer (${themeColor.light} / ${themeColor.dark})`);
}

failGate([...issues, ...literals, ...metaColorIssues], {
	summary: 'token-layer problem(s) (SPEC-revamp §2.1 — the §2.1 table owns the palette; do not tune it here).',
	hint: 'The table lives in docs/SPEC-revamp.md §2.1; global.css and the rendered CSS must match it slot by slot.',
});
console.log('\nToken layer: no drift.');
