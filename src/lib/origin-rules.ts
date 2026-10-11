/**
 * The origin rules (SPEC §8.4/§8.8 ⑥) over the built site: the four surfaces a crawler reads
 * — each page's canonical and og:url, the sitemap, robots.txt — must all name the one origin
 * that `src/lib/site.ts` declares, and the origin literal must not reappear in a page,
 * layout or component that renders (that would be a second point to change).
 */

import { attributesOf } from './html.ts';
import { routeOf, routeOfHtmlFile } from './link-rules.ts';

export type BuiltPage = { path: string; html: string };
export type BuiltFile = { path: string; text: string };

/** The declared origin's shape: scheme + host, no trailing slash, no path (SPEC §2.4). */
export function originIssues(origin: string): string[] {
	return /^https?:\/\/[^/]+$/.test(origin)
		? []
		: [`\`${origin}\` is not a bare origin — SITE.origin is scheme + host, no trailing slash (SPEC §2.4)`];
}

/** The route a built HTML file serves; `404.html` is an error page, not a canonical page. */
function canonicalRouteOf(path: string): string | null {
	if (path.endsWith('404.html')) return null;
	return routeOfHtmlFile(path);
}

/**
 * Every page points at itself on the deployed origin, exactly once (SPEC §2.6/§8.4). A page
 * with no canonical, two canonicals, or a canonical on another host is a defect either way.
 */
export function canonicalIssues(input: { pages: readonly BuiltPage[]; origin: string }): string[] {
	const issues: string[] = [];

	for (const page of input.pages) {
		const route = canonicalRouteOf(page.path);
		if (route === null) continue;

		const canonicals = attributesOf(page.html, 'link', 'rel', 'canonical', 'href');
		const expected = `${input.origin}${route}`;
		if (canonicals.length === 0) {
			issues.push(`${page.path}: no <link rel="canonical"> — every page points at itself on ${input.origin}`);
		} else if (canonicals.length > 1) {
			issues.push(`${page.path}: ${canonicals.length} canonical links (${canonicals.join(', ')}) — a head states exactly one`);
		} else if (canonicals[0] !== expected) {
			issues.push(`${page.path}: canonical is ${canonicals[0]}, expected ${expected}`);
		}
	}

	return issues;
}

/** og:url is the page's canonical (SPEC §2.6): one value, one host. */
export function ogUrlIssues(input: { pages: readonly BuiltPage[]; origin: string }): string[] {
	const issues: string[] = [];

	for (const page of input.pages) {
		const route = canonicalRouteOf(page.path);
		if (route === null) continue;

		const urls = attributesOf(page.html, 'meta', 'property', 'og:url', 'content');
		const expected = `${input.origin}${route}`;
		if (urls.length === 0) {
			issues.push(`${page.path}: no <meta property="og:url"> (SPEC §2.6)`);
		} else if (urls.length > 1) {
			issues.push(`${page.path}: ${urls.length} og:url metas (${urls.join(', ')}) — a head states exactly one`);
		} else if (urls[0] !== expected) {
			issues.push(`${page.path}: og:url is ${urls[0]}, expected ${expected}`);
		}
	}

	return issues;
}

/** `robots.txt` allows crawling and names the sitemap on the one origin (SPEC §8.4). */
export function robotsIssues(input: { robots: string | null; origin: string }): string[] {
	if (input.robots === null) return ['dist/robots.txt is missing — `public/robots.txt` ships with the build (SPEC §8.4)'];

	const issues: string[] = [];
	if (!/^Allow:\s*\/\s*$/m.test(input.robots)) issues.push('dist/robots.txt has no `Allow: /` line (SPEC §8.4)');

	const sitemapLines = [...input.robots.matchAll(/^Sitemap:\s*(.+)$/gim)].map((match) => match[1]!.trim());
	const expected = `${input.origin}/sitemap-index.xml`;
	if (sitemapLines.length === 0) {
		issues.push(`dist/robots.txt has no \`Sitemap:\` line — it points at ${expected} (SPEC §8.4)`);
	} else if (sitemapLines.length > 1) {
		issues.push(`dist/robots.txt carries ${sitemapLines.length} \`Sitemap:\` lines — one origin, one sitemap`);
	} else if (sitemapLines[0] !== expected) {
		issues.push(`dist/robots.txt points at ${sitemapLines[0]}, expected ${expected}`);
	}

	return issues;
}

const locPattern = /<loc>([^<]*)<\/loc>/g;

/** Every `<loc>` value of a sitemap or sitemap index, trimmed, in document order. */
export function sitemapLocations(xml: string): string[] {
	return [...xml.matchAll(locPattern)]
		.map((match) => match[1]!.trim())
		.filter((loc) => loc !== '');
}

/**
 * The sitemap lists exactly this version's pages, once each, on the one origin (SPEC §8.4):
 * the index points at shards that exist, every shard entry is a built page, and no page is
 * dropped. Extra entries — a 404, an asset, another host — are the other half of the rule.
 */
export function sitemapIssues(input: {
	index: string | null;
	shards: ReadonlyMap<string, string>;
	origin: string;
	routes: readonly string[];
}): string[] {
	if (input.index === null) {
		return ['dist/sitemap-index.xml is missing — `site` is set, so the build emits a sitemap (SPEC §8.4)'];
	}

	const issues: string[] = [];
	const known = new Set(input.routes);
	const listed = new Set<string>();

	for (const loc of sitemapLocations(input.index)) {
		const shard = loc.slice(loc.lastIndexOf('/') + 1);
		if (!loc.startsWith(`${input.origin}/`)) {
			issues.push(`sitemap-index names ${loc} — every URL is on ${input.origin} (SPEC §8.4)`);
			continue;
		}
		if (!input.shards.has(shard)) {
			issues.push(`sitemap-index points at ${shard}, which the build did not write`);
		}
	}

	for (const [shard, xml] of input.shards) {
		for (const loc of sitemapLocations(xml)) {
			if (!loc.startsWith(`${input.origin}/`)) {
				issues.push(`${shard} names ${loc} — every URL is on ${input.origin} (SPEC §8.4)`);
				continue;
			}
			const route = routeOf(loc.slice(input.origin.length));
			if (!known.has(route)) {
				issues.push(`${shard} lists ${loc}, which is not a built page`);
				continue;
			}
			if (listed.has(route)) {
				issues.push(`${shard} lists ${loc} twice`);
				continue;
			}
			listed.add(route);
		}
	}

	for (const route of input.routes) {
		if (!listed.has(route)) issues.push(`the sitemap is missing ${input.origin}${route}`);
	}

	return issues;
}

/**
 * The origin literal lives in `src/lib/site.ts` (and in the static `public/robots.txt`, whose
 * value `robotsIssues` checks). Everywhere else — pages, layouts, components, styles, config
 * — a second copy would be a second switch point (SPEC §8.4). Comments are not the site face,
 * so a spec reference that spells the host out in prose stays readable.
 */
export function singlePointIssues(input: {
	files: readonly BuiltFile[];
	origin: string;
	allowedPaths: readonly string[];
}): string[] {
	const allowed = new Set(input.allowedPaths);
	const issues: string[] = [];

	for (const file of input.files) {
		if (allowed.has(file.path)) continue;
		const text = file.text
			.replace(/\/\*[\s\S]*?\*\//g, ' ')
			.replace(/<!--[\s\S]*?-->/g, ' ')
			.replace(/^\s*\/\/.*$/gm, ' ');
		if (!text.includes(input.origin)) continue;
		issues.push(`${file.path} writes ${input.origin} — the origin lives in src/lib/site.ts only (SPEC §8.4)`);
	}

	return issues;
}
