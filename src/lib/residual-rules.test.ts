import assert from 'node:assert/strict';
import { test } from 'node:test';
import { residualIssues, residualMentionsAllowed, residualTargets } from './residual-rules.ts';
import type { BuiltFile } from './copy-rules.ts';

const build = (files: readonly BuiltFile[]) => residualIssues(files);

test('every retired family has a target', () => {
	const ids = residualTargets.map((target) => target.id);
	for (const id of ['sl-token', 'social-proof', 'use-case-art', 'coming-soon', 'dual-version', 'retired-name']) {
		assert.ok(ids.includes(id), `expected a \`${id}\` target`);
	}
});

test('a clean file and a clean build carry no findings', () => {
	assert.deepEqual(
		build([
			{ path: 'src/components/Hero.astro', text: '---\nconst token = "--acc";\n---' },
			{ path: 'dist/index.html', text: '<html><body>Copy the agent prompt.</body></html>' },
		]),
		[]);
});

test('each residual family is a finding in site source', () => {
	for (const [snippet, id] of [
		['color: var(--sl-bg);', 'sl-token'],
		['<section id="social-proof">', 'social-proof'],
		['import UseCaseArt from', 'use-case-art'],
		['Releases are coming soon.', 'coming-soon'],
		['const releaseStatus = "prerelease"', 'dual-version'],
		['href="https://balsats.com/docs"', 'retired-name'],
	] as const) {
		const found = build([{ path: 'src/components/Hero.astro', text: snippet }]);
		assert.ok(found.some((issue) => issue.includes(`[${id}]`)), `expected a [${id}] finding for \`${snippet}\``);
	}
});

test('built output is held to the same line', () => {
	const found = build([{ path: 'dist/index.html', text: '<span data-social-proof></span>' }]);
	assert.equal(found.length, 1);
	assert.match(found[0]!, /^dist\/index\.html:1: `social-proof` — /);
});

test('findings carry the line they sit on, once per line', () => {
	const found = build([
		{ path: 'src/styles/old.css', text: '/* header */\n:root { --sl-bg: #fff; --sl-ink: #000; }' },
	]);
	assert.equal(found.length, 1);
	assert.match(found[0]!, /^src\/styles\/old\.css:2: `--sl-bg` — /);
});

test('the allowed list is exactly the files that state the terms to forbid them', () => {
	for (const allowed of residualMentionsAllowed) {
		assert.match(allowed, /^src\/lib\//, `allowed paths are rules modules, not site source: ${allowed}`);
	}
	assert.ok(residualMentionsAllowed.every((allowed) => allowed !== 'src/components/FinalCta.astro'));
});

test('an allowed file is skipped whole, a renamed one is not', () => {
	const text = 'pin `coming soon` here so the gate can forbid it';
	assert.deepEqual(build([{ path: 'src/lib/copy-rules.ts', text }]), []);
	const found = build([{ path: 'src/components/FinalCta.astro', text }]);
	assert.equal(found.length, 1);
});
