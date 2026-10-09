import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LINKS } from './links.ts';
import { VERSION, versionLabel } from './version.ts';
import { versionIssues } from './version-rules.ts';

const pill = `<a href="${LINKS.releases}" data-version-pill class="box font-mono">${versionLabel}</a>`;

/** A code block holding the MCP snippet, with `version` spelled the way the spec pins it. */
const mcpBlock = (version = VERSION) =>
	`<pre class="astro-code oribos-light oribos-dark">import { createMcpServer } from '@oribos/mcp-server';\n\nconst server = createMcpServer({ name: 'weather', version: '${version}', tools: { weather } });</pre>`;

const page = (body = '', header = `<header>${pill}</header>`) => ({
	path: 'index.html',
	text: `<html><body>${header}${body}</body></html>`,
});
const build = (files: readonly { path: string; text: string }[]) => versionIssues(files);

test('the pill and the MCP field carry the one constant and pass', () => {
	assert.deepEqual(build([page(mcpBlock())]), []);
});

test('a page that carries the header must carry the pill', () => {
	assert.match(build([page('', '<header><a href="/">Oribos</a></header>')]).join('\n'), /carries no `v0\.6\.0` pill|no \`v/);
});

test('the pill must read the constant, not a drifted literal', () => {
	const drifted = page(mcpBlock(), `<header>${pill.replace(versionLabel, 'v0.5.0')}</header>`);
	assert.match(build([drifted]).join('\n'), /the version pill reads `v0\.5\.0`, expected/);
});

test('the MCP field must equal the constant', () => {
	assert.match(build([page(mcpBlock('0.5.0'))]).join('\n'), /MCP snippet's `version` field reads `0\.5\.0`, expected/);
});

test('a version inside another code block is a finding', () => {
	assert.match(build([page('<pre>const pinned = \'1.2.3\';</pre>')]).join('\n'), /only the MCP snippet names a version/);
});

test('a version in the page copy is a finding', () => {
	assert.match(build([page('<p>New in 1.2.3 — read the notes.</p>')]).join('\n'), /the page reads `1\.2\.3`/);
});

test('a version in an attribute counts — markup is not a hiding place', () => {
	const meta = { path: 'index.html', text: `<html><head><meta name="description" content="New in 1.2.3" /></head><body><header>${pill}</header></body></html>` };
	assert.match(build([meta]).join('\n'), /the page reads `1\.2\.3`/);
});

test('icon geometry and inline styles are not copy', () => {
	const icon = { path: 'index.html', text: `<html><body><header>${pill}</header><svg viewBox="0 0 16 16"><path d="M7.327.668A.75.75 0 0 1 8 .25Z"></path></svg><style>.a{transition:.12s}</style></body></html>` };
	assert.deepEqual(build([icon]), []);
});

test('non-HTML files are scanned, with build-tool comments their only exception', () => {
	assert.deepEqual(
		build([{ path: '_astro/global.css', text: '/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n.a { color: red }' }]),
		[],
	);
	assert.match(build([{ path: 'llms.txt', text: `Oribos ${versionLabel}\n` }]).join('\n'), /reads `v0\.6\.0`/);
});
