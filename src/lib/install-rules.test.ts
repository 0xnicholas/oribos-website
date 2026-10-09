import assert from 'node:assert/strict';
import { test } from 'node:test';
import { faqSlotQuestion, installIssues, installSlotSpans, payloadSlotMarker } from './install-rules.ts';

const faqSlot = `<details><summary>${faqSlotQuestion}</summary><p>Yes — Oribos is on npm. npm i @oribos/core installs the zero-dependency core.</p></details>`;
const payloadSlot = `<template ${payloadSlotMarker}>Install: npm i @oribos/core @ai-sdk/openai</template>`;

/** A built page carrying both slots; test bodies add the stray command or drop a slot. */
const page = (body = '') => ({
	path: 'index.html',
	text: `<html><body><section>${faqSlot}${payloadSlot}</section>${body}</body></html>`,
});
const build = (files: readonly { path: string; text: string }[]) => installIssues(files);

test('install commands inside the two slots pass', () => {
	assert.deepEqual(build([page()]), []);
	assert.equal(installSlotSpans(page().text).length, 2);
});

test('an install command outside the slots is a finding', () => {
	const found = build([page('<p>Run npm i @oribos/core to get started.</p>')]);
	assert.equal(found.length, 1);
	assert.match(found[0]!, /index\.html:1: `npm i` — .*two slots/);
});

test('every install-class shape is a finding outside the slots', () => {
	for (const command of [
		'npm install @oribos/core',
		'npm i @oribos/core',
		'pnpm add @oribos/core',
		'pnpm install',
		'bun add @oribos/core',
		'yarn add @oribos/core',
		'npx create-oribos',
		'git clone https://github.com/0xnicholas/oribos-framework',
		'First, install the package with npm.',
	]) {
		assert.ok(build([page(`<p>${command}</p>`)]).length > 0, `expected a finding for \`${command}\``);
	}
});

test('import lines, package names and plain prose are not install commands', () => {
	assert.deepEqual(
		build([
			page(
				"<pre>import { Agent } from '@oribos/core/agent';\nimport { openai } from '@ai-sdk/openai';</pre>" +
					'<p>Each team installs only what it uses. Read the installation notes in the repository.</p>',
			),
		]),
		[],
	);
});

test('install commands in code comments are findings too', () => {
	const shipped = { path: '_astro/app.js', text: '// run npm i @oribos/core first\nconst x = 1;' };
	assert.ok(build([page(), shipped]).some((issue) => /_astro\/app\.js:1/.test(issue)));
});

test('a missing slot is a finding — the gate names its own premise', () => {
	assert.match(build([{ path: 'index.html', text: `<html><body>${payloadSlot}</body></html>` }]).join('\n'), /slot one is gone/);
	assert.match(build([{ path: 'index.html', text: `<html><body>${faqSlot}</body></html>` }]).join('\n'), /slot two is gone/);
});

test('the FAQ slot is the answer to that exact question, not any other', () => {
	const other = `<details><summary>What's the license?</summary><p>npm i @oribos/core is not part of this answer.</p></details>`;
	const found = build([{ path: 'index.html', text: `<html><body>${other}${payloadSlot}</body></html>` }]);
	assert.ok(found.some((issue) => /npm i/.test(issue)), 'an install command under another question stays a finding');
	assert.ok(found.some((issue) => /slot one is gone/.test(issue)));
});
