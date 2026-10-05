/**
 * The site-level asset rules (SPEC §5.3 favicon / OG card, §8.4 llms.txt) over what `public/`
 * puts into `dist/`: the amber-square favicon (one SVG carrying both theme values plus the PNG
 * exports), the one static 1200×630 OG card, and the minimal llms.txt page list.
 * `scripts/check-shell.mjs` reads the built files against these; the shapes live here so they
 * unit-test without a build.
 */

import { wordmark } from './brand.ts';

/**
 * The favicon (map #33 ticket #41, direction #36): the amber-square mark — a full-bleed amber
 * tile whose value follows the OS theme (light `#9e630a` / dark `#ea9f2e`, one hue, lightness
 * split) and a constant white `O`, the Inter 600 capital as a vector path.
 */
export function faviconIssues(svg: string | null): string[] {
	if (svg === null) return ['public/favicon.svg is missing — the shell ships the amber-square favicon (#41)'];

	const issues: string[] = [];
	if (!/<svg\b/i.test(svg)) issues.push('public/favicon.svg is not an SVG document');
	if (!svg.includes('#9e630a')) issues.push('public/favicon.svg has no light tile value #9e630a (#41)');
	if (!svg.includes('#ea9f2e')) {
		issues.push('public/favicon.svg has no dark tile value #ea9f2e (#41)');
	} else if (!/prefers-color-scheme:\s*dark/.test(svg)) {
		issues.push('public/favicon.svg does not switch its dark tile value with prefers-color-scheme (#41)');
	}
	if (!svg.includes('#ffffff')) issues.push('public/favicon.svg has lost the white `O` mark (#41)');
	return issues;
}

/** The IHDR size of a PNG buffer, or `null` when the bytes are not a PNG. */
export function pngSize(png: Uint8Array | null): { width: number; height: number } | null {
	if (png === null || png.length < 24) return null;
	const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
	if (!signature.every((byte, index) => png[index] === byte)) return null;
	if (String.fromCharCode(...png.slice(12, 16)) !== 'IHDR') return null;
	const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
	return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** SPEC §5.3: one static 1200×630 card, site-wide. */
export function ogImageIssues(png: Uint8Array | null): string[] {
	if (png === null) return ['public/og.png is missing — the shell ships one static card (SPEC §5.3)'];
	const size = pngSize(png);
	if (size === null) return ['public/og.png is not a PNG'];
	if (size.width !== 1200 || size.height !== 630) {
		return [`public/og.png is ${size.width}×${size.height} — the card is one static 1200×630 (SPEC §5.3)`];
	}
	return [];
}

/** The favicon's PNG exports (#41): fixed-size rasters of the SVG mark. */
export function sizedPngIssues(png: Uint8Array | null, name: string, size: number): string[] {
	if (png === null) return [`public/${name} is missing — the favicon set ships its PNG exports (#41)`];
	const actual = pngSize(png);
	if (actual === null) return [`public/${name} is not a PNG`];
	if (actual.width !== size || actual.height !== size) {
		return [`public/${name} is ${actual.width}×${actual.height} — the export is ${size}×${size} (#41)`];
	}
	return [];
}

/** SPEC §8.4: v1 is the page list — verbatim titles, absolute URLs on the one origin. */
export function llmsIssues(
	text: string | null,
	pages: readonly { route: string; title: string }[],
	origin: string,
): string[] {
	if (text === null) return ['public/llms.txt is missing — the minimal page list ships with the build (SPEC §8.4)'];

	const issues: string[] = [];
	const seen = new Set<string>();
	let heading = false;

	for (const line of text.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (trimmed === '') continue;
		if (!heading && trimmed === `# ${wordmark}`) {
			heading = true;
			continue;
		}
		const item = trimmed.match(/^-\s+\[([^\]]+)\]\((\S+)\)$/);
		if (item === null) {
			issues.push(`public/llms.txt: \`${trimmed}\` is not a \`- [title](url)\` entry (SPEC §8.4)`);
			continue;
		}
		const url = item[2]!;
		const expected = pages.find((page) => new URL(page.route, origin).href === url);
		if (expected === undefined) {
			issues.push(`public/llms.txt lists ${url}, which is not a page of this site (SPEC §2.1)`);
			continue;
		}
		if (expected.title !== item[1]!) {
			issues.push(`public/llms.txt: the title for ${url} is \`${item[1]}\`, expected \`${expected.title}\` (SPEC §2.6)`);
		}
		if (seen.has(url)) {
			issues.push(`public/llms.txt lists ${url} twice`);
		}
		seen.add(url);
	}

	if (!heading) issues.push('public/llms.txt has no `# Oribos` heading (SPEC §8.4)');
	for (const page of pages) {
		const url = new URL(page.route, origin).href;
		if (!seen.has(url)) issues.push(`public/llms.txt is missing ${url} (SPEC §2.1)`);
	}

	return issues;
}
