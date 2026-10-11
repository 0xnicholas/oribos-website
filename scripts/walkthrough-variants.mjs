#!/usr/bin/env node
/**
 * Walkthrough helper (issue #50 人工走查, non-CI): builds three served variants of `dist/` —
 *
 *   /tmp/dist-dark  — the dark theme locked on (the `prefers-color-scheme` media query forced
 *                     to match), so dark mode can be walked without OS appearance flips;
 *   /tmp/dist-gray  — a grayscale wash over every page, for the JMB self-check (the hierarchy
 *                     must hold on luminance alone);
 *   /tmp/dist-light — the light theme locked on (the media query never matches), for machines
 *                     whose OS prefers dark.
 *
 * Neither `src/` nor `dist/` is touched; all three are throwaways. Serve them with any static
 * server and walk the pages (issue #50's checklist).
 */
import { cpSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const dist = path.join(repoRoot, 'dist');

const walk = (dir) =>
	readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && /\.(?:html|css)$/.test(entry.name))
		.map((entry) => path.join(entry.parentPath, entry.name));

for (const [target, transform] of [
	[
		// The dark theme locked on: the media query matches everything, so the later dark
		// `:root` block always wins.
		'/tmp/dist-dark',
		(text) => text.replace(/@media \(prefers-color-scheme: ?dark\)/g, '@media all'),
	],
	[
		'/tmp/dist-gray',
		(text) => text.replaceAll('</head>', '<style>html{filter:grayscale(100%)}</style></head>'),
	],
	[
		// The light theme locked on: the media query never matches, so only the leading light
		// `:root` block applies.
		'/tmp/dist-light',
		(text) => text.replace(/@media \(prefers-color-scheme: ?dark\)/g, '@media (min-width: 99999px)'),
	],
]) {
	rmSync(target, { recursive: true, force: true });
	cpSync(dist, target, { recursive: true });
	let touched = 0;
	for (const file of walk(target)) {
		writeFileSync(file, transform(readFileSync(file, 'utf8')));
		touched += 1;
	}
	console.log(`${target}: ${touched} file(s) rewritten`);
}
