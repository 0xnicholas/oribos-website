#!/usr/bin/env node
/**
 * The zero-telemetry gate (SPEC §5.5, §2.7) over the built site: no subresource from another
 * origin, no form anywhere (the site collects nothing), no cookie write, no analytics /
 * marketing / consent signature in shipped code. The rules live in `src/lib/telemetry.ts`;
 * this script walks `dist/` and reports one ✓ line per rule.
 *
 * What it cannot see is what a host adds afterwards (an edge-injected beacon) — that half
 * belongs to the deployment step, not to this repository.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-telemetry.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { failGate, runChecks, startGate, textFiles } from './lib/cli.mjs';
import {
	codeContextOf,
	cookieWriteIssues,
	formIssues,
	storageWriteIssues,
	telemetryMarkerIssues,
	thirdPartySubresourceIssues,
} from '../src/lib/telemetry.ts';
import { SITE } from '../src/lib/site.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const files = textFiles(dist);
const pages = files.filter((file) => file.path.endsWith('.html'));

if (pages.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

/** Shipped code: HTML reduced to its code context, JS/CSS as they are (comments included). */
const code = files
	.filter((file) => /\.(?:html|js|css)$/.test(file.path))
	.map((file) => ({ path: file.path, text: file.path.endsWith('.html') ? codeContextOf(file.text) : file.text }));
/** Where a cookie write can hide: shipped scripts and the inline `<script>` blocks. */
const scripts = code.filter((file) => /\.(?:js|html)$/.test(file.path));
const scriptTags = pages.reduce((count, page) => count + [...page.text.matchAll(/<script\b[^>]*\bsrc\s*=/gi)].length, 0);

const checks = [
	[
		thirdPartySubresourceIssues(pages, { origin: SITE.origin }),
		`third-party runtime: ${scriptTags} \`<script src>\` tag(s) across ${pages.length} page(s), every subresource on ${SITE.origin}`,
	],
	[formIssues(pages), 'forms: no collection surface anywhere (no newsletter, no contact, no email capture)'],
	[telemetryMarkerIssues(code), `vendors: no analytics / marketing / consent signature in ${code.length} shipped HTML/JS/CSS file(s)`],
	[cookieWriteIssues(scripts), `cookies: ${scripts.length} shipped script(s) and inline script block(s) carry no cookie write`],
	[
		storageWriteIssues(scripts),
		`client state: ${scripts.length} shipped script(s) and inline script block(s) keep no localStorage/sessionStorage state`,
	],
];

const issues = runChecks(checks);

failGate(issues, {
	summary: `zero-telemetry violation(s) (SPEC §5.5).`,
	hint: 'Fonts stay on the system stack, icons are inline SVG, and the site sets no cookie or theme state.',
});
console.log('\nZero telemetry holds (repository side).');
