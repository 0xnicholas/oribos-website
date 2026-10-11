/**
 * The zero-telemetry rules (SPEC §5.5, §2.7): the built site loads every subresource from its
 * own origin, carries no form (no collection surface at all), sets no cookie and keeps no
 * client-side state, and ships no analytics / marketing / consent signature.
 *
 * What it cannot see is what a host adds afterwards (an edge-injected beacon, a response
 * header) — that half belongs to the deployment step, not to this repository.
 */

import { attributeValue } from './html.ts';

/** A built artifact to scan: its dist-relative path and its text. */
export type BuiltFile = { path: string; text: string };

/** Subresource attributes, per tag. `a` is absent on purpose: outbound links are content. */
const subresourceTags = [
	['script', ['src']],
	['iframe', ['src']],
	['img', ['src', 'srcset']],
	['source', ['src', 'srcset']],
	['video', ['src', 'poster']],
	['audio', ['src']],
	['embed', ['src']],
	['object', ['data']],
] as const;

/**
 * `<link>` relations that load something (or open a connection). `canonical`, `alternate` and
 * `sitemap` are pointers — an absolute canonical on the real origin is a statement about the
 * site, not a subresource (SPEC §2.6).
 */
const subresourceLinkRels = new Set([
	'stylesheet',
	'preload',
	'modulepreload',
	'prefetch',
	'preconnect',
	'dns-prefetch',
	'icon',
	'apple-touch-icon',
	'manifest',
]);

/** Known analytics, marketing and consent signatures — a red gate, not a taxonomy. */
export const vendorMarkers: readonly { vendor: string; pattern: RegExp }[] = [
	{ vendor: 'Google Analytics / Tag Manager', pattern: /googletagmanager|google-analytics|\bgtag\(|\bga\(\s*['"]|analytics\.js/i },
	{ vendor: 'Plausible', pattern: /plausible\.io/i },
	{ vendor: 'Umami', pattern: /umami\.is/i },
	{ vendor: 'GoatCounter', pattern: /goatcounter/i },
	{ vendor: 'PostHog', pattern: /posthog/i },
	{ vendor: 'Matomo / Piwik', pattern: /matomo|piwik/i },
	{ vendor: 'Mixpanel', pattern: /mixpanel/i },
	{ vendor: 'Amplitude', pattern: /amplitude\.com/i },
	{ vendor: 'Segment', pattern: /segment\.(?:com|io)/i },
	{ vendor: 'Hotjar', pattern: /hotjar/i },
	{ vendor: 'FullStory', pattern: /fullstory/i },
	{ vendor: 'Microsoft Clarity', pattern: /clarity\.ms/i },
	{ vendor: 'Meta Pixel', pattern: /\bfbq\(|fbevents|connect\.facebook\.net/i },
	{ vendor: 'Google Ads', pattern: /adsbygoogle|doubleclick|googlesyndication/i },
	{ vendor: 'consent banner', pattern: /cookiebot|onetrust|cookieyes|termly|iubenda|cookie-?consent|cookie-?banner|consent-management/i },
];

/** `document.cookie = …` (an assignment, not a read) and the `cookieStore` write API. */
const cookieWritePattern = /document\.cookie\s*(?:=[^=]|\+=)|cookieStore\s*\.\s*(?:set|delete)\s*\(/;

/**
 * The code part of an HTML document: tags and the bodies of inline `<script>` / `<style>`
 * survive, text nodes between tags are dropped. Attribute values are kept — which is what the
 * subresource rule needs.
 */
export function codeContextOf(html: string): string {
	let code = '';
	let index = 0;
	for (const match of html.matchAll(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
		const block = match[0];
		const openingTag = block.slice(0, block.indexOf('>') + 1);
		code += `${tagsOf(html.slice(index, match.index))} ${openingTag} ${match[2]}`;
		index = (match.index ?? 0) + block.length;
	}
	return `${code} ${tagsOf(html.slice(index))}`;
}

/** Tags only: everything between a `>` and the next `<` is a text node. */
function tagsOf(segment: string): string {
	return segment.replace(/>[^<]*/g, '>');
}

/**
 * Subresources that leave the site's own origin (SPEC §5.5: no font, script, pixel or embed
 * from a third party). Root-relative and `data:` / `blob:` values are self-contained; a
 * protocol-relative `//host/x` is not a site-root path.
 */
export function thirdPartySubresourceIssues(pages: readonly BuiltFile[], { origin }: { origin: string }): string[] {
	const issues: string[] = [];
	const own = origin.replace(/\/+$/, '');

	for (const { path, text } of pages) {
		const report = (shape: string, url: string) => {
			if (url === '' || url.startsWith('#') || /^(?:data|blob):/i.test(url)) return;
			if (url === own || url.startsWith(`${own}/`)) return;
			// Protocol-relative first: `//host/x` starts with a slash but is not a site-root path.
			if (url.startsWith('//') || /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) {
				issues.push(`${path}: \`${shape}\` loads ${url} — the site ships zero third-party subresources (SPEC §5.5)`);
				return;
			}
			if (url.startsWith('/')) return;
		};

		for (const [tag, attributes] of subresourceTags) {
			for (const attribute of attributes) {
				const pattern = new RegExp(`<${tag}\\b[^>]*?\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'gi');
				for (const match of text.matchAll(pattern)) {
					const value = match[1] ?? match[2] ?? '';
					const candidates = attribute === 'srcset' ? value.split(',') : [value];
					for (const candidate of candidates) {
						report(`<${tag} ${attribute}>`, candidate.trim().split(/\s+/)[0] ?? '');
					}
				}
			}
		}

		for (const match of text.matchAll(/<link\b[^>]*>/gi)) {
			const tag = match[0];
			const rel = (attributeValue(tag, 'rel') ?? '')
				.toLowerCase()
				.split(/\s+/)
				.filter((token) => subresourceLinkRels.has(token));
			if (rel.length === 0) continue;
			report(`<link rel="${rel.join(' ')}">`, (attributeValue(tag, 'href') ?? '').trim());
		}
	}

	return issues;
}

/** The site has no form anywhere — no newsletter, no contact, no email capture (SPEC §2.3/§11). */
export function formIssues(pages: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const { path, text } of pages) {
		for (const match of text.matchAll(/<form\b[^>]*>/gi)) {
			issues.push(`${path}: \`${match[0]}\` — the site collects nothing; GitHub is the only channel (SPEC §2.3)`);
		}
	}

	return issues;
}

/** Vendor signatures in the code of the shipped files (HTML reduced to its code context). */
export function telemetryMarkerIssues(files: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const { path, text } of files) {
		const code = path.endsWith('.html') ? codeContextOf(text) : text;
		for (const { vendor, pattern } of vendorMarkers) {
			const match = code.match(pattern);
			if (match === null) continue;
			issues.push(`${path}: \`${match[0]}\` is a ${vendor} signature in shipped code — the site ships zero telemetry (SPEC §5.5)`);
		}
	}

	return issues;
}

/**
 * Cookie writes in shipped code — `document.cookie` / `cookieStore` shapes. Callers pass the
 * *code* of each file: JavaScript as it is, HTML reduced by `codeContextOf` so an inline
 * `<script>` counts while prose does not.
 */
export function cookieWriteIssues(scripts: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const { path, text } of scripts) {
		const match = text.match(cookieWritePattern);
		if (match === null) continue;
		issues.push(`${path}: \`${match[0]}\` writes a cookie — the site sets none, and stores no theme state (SPEC §5.4)`);
	}

	return issues;
}

/** `localStorage.setItem(…)` / `sessionStorage…` — the other way a theme switch would persist. */
const storageWritePattern = /\b(?:localStorage|sessionStorage)\s*\.\s*(?:setItem|removeItem|clear)\s*\(/;

/** No client-side state: the theme follows the OS and nothing else (SPEC §5.4/§2.7). */
export function storageWriteIssues(scripts: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const { path, text } of scripts) {
		const match = text.match(storageWritePattern);
		if (match === null) continue;
		issues.push(`${path}: \`${match[0]}\` keeps client-side state — the site stores no theme or visitor state (SPEC §5.4)`);
	}

	return issues;
}
