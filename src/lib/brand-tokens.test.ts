import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
	auditTokens,
	colourTokens,
	contrastRatio,
	literalColorIssues,
	parseLandingTokens,
	parseSpecRevampTable,
	themeColorValues,
	tokenDrift,
	typeScale,
} from './brand-tokens.ts';

const globalCss = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
const specMarkdown = readFileSync(new URL('../../docs/SPEC-revamp.md', import.meta.url), 'utf8');

test('the shipped token layer parses with no errors and carries both themes', () => {
	const { tokens, errors } = parseLandingTokens(globalCss);
	assert.deepEqual(errors, []);

	assert.equal(tokens.light['--acc'], '#9e630a');
	assert.equal(tokens.dark['--acc'], '#ea9f2e');
	// 11 §2.1 colour slots in each theme; the §2.3 type scale lives once in the light region.
	assert.deepEqual(Object.keys(tokens.light), [...colourTokens]);
	assert.deepEqual(Object.keys(tokens.dark), [...colourTokens]);
});

test('the §2.1 table in docs/SPEC-revamp.md and the shipped token layer agree slot by slot', () => {
	const landing = parseLandingTokens(globalCss);
	const spec = parseSpecRevampTable(specMarkdown);
	assert.deepEqual(spec.errors, []);

	assert.deepEqual(
		tokenDrift(landing.tokens, spec.tokens, {
			actualLabel: 'global.css',
			expectedLabel: 'SPEC-revamp §2.1',
			slotsFor: (theme) => Object.keys(spec.tokens[theme]),
		}),
		[],
	);
});

test('a drifted slot is reported, not rounded away', () => {
	const landing = parseLandingTokens(globalCss);
	const spec = parseSpecRevampTable(specMarkdown);
	const mutated = { ...landing.tokens, light: { ...landing.tokens.light, '--acc': '#9e630b' } };

	const drift = tokenDrift(mutated, spec.tokens, {
		actualLabel: 'global.css',
		expectedLabel: 'SPEC-revamp §2.1',
		slotsFor: (theme) => Object.keys(spec.tokens[theme]),
	});
	assert.equal(drift.length, 1);
	assert.match(drift[0]!, /--acc \(light\)/);
});

test('a slot the §2.1 table does not have is an error, not an extension', () => {
	const mutated = globalCss.replace('--bg:', '--brand: #123456;\n\t--bg:');
	const { errors } = parseLandingTokens(mutated);
	assert.ok(errors.some((error) => error.includes('--brand is not part of the')));
});

test('a non-hex colour value is an error — hex is the normative shape (§2.1)', () => {
	const mutated = globalCss.replace('--acc: #9e630a;', '--acc: hsl(36, 88%, 33%);');
	const { errors } = parseLandingTokens(mutated);
	assert.ok(errors.some((error) => error.includes('--acc in the light token block is not a #rrggbb hex value')));
});

test('the type scale is the eight locked §2.3 steps, declared once', () => {
	const { errors } = parseLandingTokens(globalCss);
	assert.deepEqual(errors, []);

	const mutated = globalCss.replace('--t-base: 16px;', '--t-base: 18px;');
	assert.ok(parseLandingTokens(mutated).errors.some((error) => error.includes('--t-base is `18px/24px`')));

	const redeclared = globalCss.replace('--code-bg: #fafaf8;', '--code-bg: #fafaf8;\n\t--t-xs: 13px;');
	assert.ok(parseLandingTokens(redeclared).errors.some((error) => error.includes('--t-xs is declared twice')));

	const inDark = globalCss.replace('--code-bg: #151513;', '--code-bg: #151513;\n\t\t--t-xs: 13px; --t-xs-lh: 20px;');
	assert.ok(parseLandingTokens(inDark).errors.some((error) => error.includes('re-declared inside the dark block')));

	for (const { lineHeight } of Object.values(typeScale)) {
		assert.equal(Number.parseInt(lineHeight, 10) % 4, 0, `${lineHeight} is not a 4px multiple (§2.2)`);
	}
});

test('colour literals outside the token blocks are findings; var() aliases are not', () => {
	assert.deepEqual(literalColorIssues(globalCss), []);
	assert.equal(literalColorIssues(`${globalCss}\n.example { color: #ffffff; }`).length, 1);
	assert.equal(literalColorIssues(`${globalCss}\n@theme { --color-x: var(--acc); }`).length, 1);
});

test('the audit reports 16 checks and all of them pass on the pinned palette', () => {
	const { tokens } = parseLandingTokens(globalCss);
	const { rows, errors } = auditTokens(tokens);
	assert.deepEqual(errors, []);
	assert.equal(rows.length, 16);
	assert.deepEqual(
		rows.filter((row) => !row.pass).map((row) => row.label),
		[],
	);
});

test('the pinned accent pairs measure where §2.7 says they do', () => {
	const { tokens } = parseLandingTokens(globalCss);
	assert.equal(contrastRatio(tokens.light['--acc']!, tokens.light['--bg']!).toFixed(2), '4.95');
	assert.equal(contrastRatio(tokens.dark['--acc']!, tokens.dark['--bg']!).toFixed(2), '8.61');
	assert.equal(contrastRatio(tokens.light['--acc-inv']!, tokens.light['--acc']!).toFixed(2), '4.95');
});

test('--ink3 is deliberately sub-AA muted meta, outside every audited pair', () => {
	const { tokens } = parseLandingTokens(globalCss);
	for (const theme of ['light', 'dark'] as const) {
		const fg = tokens[theme]['--ink3']!;
		const bg = tokens[theme]['--bg']!;
		assert.ok(contrastRatio(fg, bg) < 4.5, `${theme} --ink3 unexpectedly clears AA`);
	}
});

test('theme-color is each theme\u2019s resolved --bg (SPEC-revamp §2.8)', () => {
	const { tokens } = parseLandingTokens(globalCss);
	assert.deepEqual(themeColorValues(tokens), { light: '#ffffff', dark: '#101010' });
});
