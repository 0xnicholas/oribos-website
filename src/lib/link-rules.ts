/**
 * The link rules (SPEC §8.8 ⑤) over the built pages: every in-site link resolves to a page
 * that exists, every `#…` anchor — including the home-page anchors keyword pages link into —
 * exists on the page it points at, and every external link is one of the constants in
 * `src/lib/links.ts` under its current name.
 *
 * The index a caller supplies is what makes this module pure: `routeExists` / `pageHtml` ask
 * the filesystem, `allowedExternal` comes from the links constant, `retiredNames` from the
 * renames this project has been through.
 */

export type BuiltPage = { path: string; html: string };

export type LinkIndex = {
	/** Does a built page serve this site-root route (`/`, `/about/`)? */
	routeExists: (route: string) => boolean;
	/** The HTML of the page serving a route, for anchor lookups. */
	pageHtml: (route: string) => string | undefined;
	/** External hrefs the site may carry (SPEC §2.4 — the one links constant). */
	allowedExternal: readonly string[];
	/** Names retired by the renames (`balsa-framework`, `balsats.com`, …), SPEC §8.8 ⑤. Specific
	 * spellings come first so a finding prints the closest reason; the bare `balsats` net last. */
	retiredNames: readonly { pattern: RegExp; reason: string }[];
};

export const retiredNames = [
	{ pattern: /balsa-framework/, reason: 'the repository became `0xnicholas/oribos-framework` (SPEC §1)' },
	{ pattern: /balsa-website/, reason: 'this repository became `0xnicholas/oribos-website` (SPEC §1)' },
	{
		pattern: /balsats-framework/,
		reason: 'the repository was renamed `balsats-framework` → `oribos-framework` (SPEC §1)',
	},
	{
		pattern: /balsats-website/,
		reason: 'this repository was renamed `balsats-website` → `oribos-website` (SPEC §1)',
	},
	{ pattern: /balsats-docs/, reason: 'the documentation repository was renamed `balsats-docs` → `oribos-docs` (SPEC §1)' },
	{ pattern: /balsajs\.dev/, reason: 'the docs domain is `docs.oribos.dev` (SPEC §1)' },
	{ pattern: /balsats\.com/, reason: 'the domain is `oribos.dev` (SPEC §1)' },
	{ pattern: /@balsats\//, reason: 'the npm scope is `@oribos/*` (SPEC §1)' },
	{ pattern: /balsats/i, reason: 'the project was renamed `Balsats` → `Oribos` (framework ADR-0013 末次修订)' },
] as const;

const anchorAttributePattern = /\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const anchorLinkPattern = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

/** `/about`, `/about/` and `/about/index.html` are one route: `/about/`. */
export function routeOf(href: string): string {
	const path = (href.split(/[?#]/)[0] ?? '').replace(/index\.html$/, '');
	if (path === '' || path === '/') return '/';
	return path.endsWith('/') ? path : `${path}/`;
}

/** The route a built HTML file serves: `index.html` → `/`, `about/index.html` → `/about/`. */
export function routeOfHtmlFile(file: string): string {
	const withoutIndex =
		file === 'index.html' ? '' : file.endsWith('/index.html') ? file.slice(0, -'index.html'.length) : file.replace(/\.html$/, '');
	return routeOf(`/${withoutIndex}`);
}

function anchorsOf(html: string): Set<string> {
	const anchors = new Set<string>();
	for (const match of html.matchAll(anchorAttributePattern)) {
		const value = match[1] ?? match[2];
		if (value !== undefined && value !== '') anchors.add(value);
	}
	return anchors;
}

/** Every finding a built page carries, as `path: href — reason` lines. */
export function linkIssues(pages: readonly BuiltPage[], index: LinkIndex): string[] {
	const issues: string[] = [];

	for (const page of pages) {
		for (const match of page.html.matchAll(anchorLinkPattern)) {
			const href = (match[1] ?? match[2] ?? '').trim();
			if (href === '') {
				issues.push(`${page.path}: an <a> carries an empty href`);
				continue;
			}

			for (const retired of index.retiredNames) {
				if (retired.pattern.test(href)) {
					issues.push(`${page.path}: \`${href}\` — ${retired.reason}`);
				}
			}

			if (href.startsWith('#')) {
				reportAnchor(issues, page.path, page.html, page.path, href.slice(1));
				continue;
			}

			if (href.startsWith('/')) {
				reportInternal(issues, index, page.path, href);
				continue;
			}

			if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
				reportExternal(issues, index, page.path, href);
				continue;
			}

			issues.push(
				`${page.path}: \`${href}\` is a relative link — built pages address links from the site root (SPEC §2.4)`,
			);
		}
	}

	return issues;
}

function reportInternal(issues: string[], index: LinkIndex, pagePath: string, href: string): void {
	const [pathAndQuery, anchor] = splitAnchor(href);
	const route = routeOf(pathAndQuery ?? '');
	if (!index.routeExists(route)) {
		issues.push(`${pagePath}: \`${href}\` does not resolve to a built page`);
		return;
	}
	reportAnchor(issues, pagePath, index.pageHtml(route), route, anchor);
}

function reportAnchor(
	issues: string[],
	pagePath: string,
	targetHtml: string | undefined,
	targetRoute: string,
	anchor: string | undefined,
): void {
	if (anchor === undefined || anchor === '') return;
	if (targetHtml === undefined) return;
	if (anchorsOf(targetHtml).has(anchor)) return;
	issues.push(`${pagePath}: \`#${anchor}\` has no target on ${targetRoute} (SPEC §2.5)`);
}

function reportExternal(issues: string[], index: LinkIndex, pagePath: string, href: string): void {
	if (!/^https?:/i.test(href)) {
		issues.push(`${pagePath}: \`${href}\` — the site links out to GitHub only, no other scheme (SPEC §11)`);
		return;
	}
	const withoutFragment = href.split('#')[0]!;
	if (index.allowedExternal.includes(withoutFragment)) return;
	issues.push(
		`${pagePath}: \`${href}\` is not one of the links constants — external links come from src/lib/links.ts (SPEC §2.4)`,
	);
}

function splitAnchor(href: string): [string, string | undefined] {
	const [path, anchor] = href.split('#');
	return [path, anchor];
}
