#!/usr/bin/env node
/**
 * The one-off OG-card generator (SPEC §5.3). It renders the single static 1200×630 card with
 * the system's Chrome in headless mode and writes `public/og.png`. The PNG is the artifact and
 * is committed; this script exists so the card can be regenerated when the wordmark, the
 * tagline or the palette moves.
 *
 * The card carries the map #33 visual language (#36, #41): the neutral field with its 1px
 * hairline frame, the amber square as the wordmark's dot, self-hosted Inter (the file in
 * `public/fonts/`, embedded as a data URI at render time). The wordmark and the public tagline
 * still come out of `src/lib/brand.ts`, so the copy cannot drift from the site; the palette is
 * read from `src/styles/global.css` (the §2.1 token layer), so the card cannot drift from the
 * site's colours either.
 *
 * It is deliberately outside `pnpm verify` and outside the dependency tree: no image library,
 * no build-time OG generation (SPEC §8.7-C keeps per-page OG out of this effort).
 *
 * Usage:
 *   node --experimental-strip-types scripts/make-og.mjs [--theme dark|light] [--out public/og.png]
 *     [--chrome "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pngSize } from '../src/lib/asset-rules.ts';
import { publicTagline, wordmark } from '../src/lib/brand.ts';
import { parseLandingTokens } from '../src/lib/brand-tokens.ts';
import { parseArgs } from './lib/cli.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), { values: ['out', 'chrome', 'theme'] });
if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

// The token layer is the single source of the palette: every colour the card paints is read
// from `src/styles/global.css` at run time (SPEC-revamp §2.8), so the card and the site
// cannot disagree about a brand value.
const tokenCss = readFileSync(path.join(repoRoot, 'src/styles/global.css'), 'utf8');
const { tokens: brandTokens, errors: tokenErrors } = parseLandingTokens(tokenCss);
if (tokenErrors.length > 0) {
	console.error(`✗ src/styles/global.css is not a valid brand token layer:\n${tokenErrors.join('\n')}`);
	process.exit(1);
}

// The map #33 set (#36): one neutral pair, the hairline, the amber — single hue, lightness
// split per theme. `acc` matches the favicon tile of the same theme. `parseLandingTokens`
// already errored on a missing slot, so the pick below cannot miss.
const pick = (theme, name) => {
	const value = brandTokens[theme][name];
	if (value === undefined) throw new Error(`the ${theme} token block does not declare ${name}`);
	return value;
};
const THEMES = {
	dark: {
		bg: pick('dark', '--bg'),
		ink: pick('dark', '--ink'),
		ink2: pick('dark', '--ink2'),
		line: pick('dark', '--line'),
		acc: pick('dark', '--acc'),
	},
	light: {
		bg: pick('light', '--bg'),
		ink: pick('light', '--ink'),
		ink2: pick('light', '--ink2'),
		line: pick('light', '--line'),
		acc: pick('light', '--acc'),
	},
};
const themeName = options.theme ?? 'dark';
const theme = THEMES[themeName];
if (theme === undefined) {
	console.error(`✗ --theme must be one of: ${Object.keys(THEMES).join(', ')}`);
	process.exit(2);
}

const out = path.resolve(repoRoot, options.out ?? 'public/og.png');
const chrome =
	options.chrome ?? process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!existsSync(chrome)) {
	console.error(`✗ no Chrome at ${chrome} — pass --chrome <path> or set CHROME`);
	process.exit(1);
}

const fontPath = path.join(repoRoot, 'public/fonts/inter-latin-wght-normal.woff2');
if (!existsSync(fontPath)) {
	console.error(`✗ no Inter at ${path.relative(repoRoot, fontPath)} — the card sets the self-hosted Inter (#36)`);
	process.exit(1);
}
const font = readFileSync(fontPath).toString('base64');

// The footer's own discipline for the tagline (SPEC §2.3): sentence one on its own line, a
// touch heavier; the card follows it. Falls back to the whole string if the shape ever moves.
const stop = publicTagline.indexOf('. ');
const taglineHtml =
	stop === -1
		? publicTagline
		: `<span class="s1">${publicTagline.slice(0, stop + 1)}</span>${publicTagline.slice(stop + 2)}`;

const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<style>
			@font-face {
				font-family: 'InterVar';
				src: url(data:font/woff2;base64,${font}) format('woff2');
				font-weight: 100 900;
			}
			* { margin: 0; box-sizing: border-box; }
			body {
				width: 1200px;
				height: 630px;
				overflow: hidden;
				background: ${theme.bg};
				font-family: 'InterVar', system-ui, sans-serif;
			}
			.frame { position: absolute; inset: 36px; border: 1px solid ${theme.line}; }
			main {
				position: relative;
				height: 100%;
				padding: 0 96px;
				display: flex;
				flex-direction: column;
				justify-content: center;
			}
			.wm {
				font-size: 89px;
				line-height: 96px;
				font-weight: 600;
				letter-spacing: -0.025em;
				color: ${theme.ink};
			}
			.wm .sq {
				display: inline-block;
				width: 32px;
				height: 32px;
				margin-left: 12px;
				background: ${theme.acc};
			}
			.tag {
				max-width: 1000px;
				margin-top: 40px;
				font-size: 38px;
				line-height: 44px;
				color: ${theme.ink2};
				text-wrap: balance;
			}
			.tag .s1 { display: block; margin-bottom: 8px; font-weight: 600; color: ${theme.ink}; }
		</style>
	</head>
	<body>
		<div class="frame"></div>
		<main>
			<div class="wm">${wordmark}<span class="sq"></span></div>
			<p class="tag">${taglineHtml}</p>
		</main>
	</body>
</html>
`;

const scratch = mkdtempSync(path.join(tmpdir(), 'oribos-og-'));
const page = path.join(scratch, 'card.html');
writeFileSync(page, html);

const render = spawnSync(
	chrome,
	[
		'--headless=new',
		'--disable-gpu',
		'--hide-scrollbars',
		'--force-device-scale-factor=1',
		'--window-size=1200,630',
		`--screenshot=${out}`,
		`file://${page}`,
	],
	{ stdio: 'inherit' },
);
rmSync(scratch, { recursive: true, force: true });

if (render.status !== 0) {
	console.error(`✗ Chrome exited with ${render.status ?? render.signal}`);
	process.exit(1);
}

const size = pngSize(readFileSync(out));
if (size === null || size.width !== 1200 || size.height !== 630) {
	console.error(`✗ ${path.relative(repoRoot, out)} is not a 1200×630 PNG (${size ? `${size.width}×${size.height}` : 'not a PNG'})`);
	process.exit(1);
}

console.log(`✓ ${path.relative(repoRoot, out)} — ${size.width}×${size.height}, ${themeName}`);
