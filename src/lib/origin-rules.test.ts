import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	canonicalIssues,
	ogUrlIssues,
	originIssues,
	robotsIssues,
	singlePointIssues,
	sitemapIssues,
} from './origin-rules.ts';

const origin = 'https://oribos.dev';
const page = (path: string, head: string) => ({ path, html: `<head>${head}</head><body></body>` });
const canonical = (href: string) => `<link rel="canonical" href="${href}">`;
const og = (content: string) => `<meta property="og:url" content="${content}">`;

test('the declared origin is a bare scheme + host', () => {
	assert.deepEqual(originIssues(origin), []);
	assert.equal(originIssues('https://oribos.dev/').length, 1);
	assert.equal(originIssues('oribos.dev').length, 1);
});

test('every page points at itself, exactly once', () => {
	assert.deepEqual(canonicalIssues({ pages: [page('index.html', canonical(`${origin}/`))], origin }), []);
	assert.match(canonicalIssues({ pages: [page('index.html', '')], origin })[0]!, /no <link rel="canonical">/);
	assert.match(
		canonicalIssues({ pages: [page('index.html', canonical('https://example.com/'))], origin })[0]!,
		/canonical is https:\/\/example\.com\//,
	);
	assert.match(
		canonicalIssues({ pages: [page('index.html', canonical(`${origin}/`) + canonical(`${origin}/`))], origin })[0]!,
		/2 canonical links/,
	);
	// The 404 is an error page: the sitemap skips it and so does this rule.
	assert.deepEqual(canonicalIssues({ pages: [page('404.html', '')], origin }), []);
});

test('og:url is the page canonical', () => {
	assert.deepEqual(ogUrlIssues({ pages: [page('index.html', og(`${origin}/`))], origin }), []);
	assert.match(ogUrlIssues({ pages: [page('index.html', '')], origin })[0]!, /no <meta property="og:url">/);
	assert.match(ogUrlIssues({ pages: [page('index.html', og(`${origin}/other`))], origin })[0]!, /og:url is/);
});

test('robots.txt allows crawling and names the sitemap index on the one origin', () => {
	const good = 'User-agent: *\nAllow: /\n\nSitemap: https://oribos.dev/sitemap-index.xml\n';
	assert.deepEqual(robotsIssues({ robots: good, origin }), []);
	assert.match(robotsIssues({ robots: null, origin })[0]!, /robots\.txt is missing/);
	assert.match(robotsIssues({ robots: 'User-agent: *\nAllow: /\n', origin })[0]!, /no `Sitemap:` line/);
	assert.ok(
		robotsIssues({ robots: 'Sitemap: https://docs.oribos.dev/sitemap-index.xml\n', origin }).some((issue) =>
			/points at https:\/\/docs\.oribos\.dev/.test(issue),
		),
	);
});

test('the sitemap lists exactly the built pages, once each, on the one origin', () => {
	const shards = new Map([['sitemap-0.xml', `<url><loc>${origin}/</loc></url><url><loc>${origin}/about/</loc></url>`]]);
	const index = `<sitemapindex><loc>${origin}/sitemap-0.xml</loc></sitemapindex>`;

	assert.deepEqual(sitemapIssues({ index, shards, origin, routes: ['/', '/about/'] }), []);
	assert.match(sitemapIssues({ index, shards, origin, routes: ['/'] })[0]!, /lists .*\/about\//);
	assert.match(sitemapIssues({ index: null, shards, origin, routes: ['/'] })[0]!, /sitemap-index\.xml is missing/);
	assert.match(
		sitemapIssues({ index, shards: new Map([['sitemap-0.xml', `<loc>https://example.com/</loc>`]]), origin, routes: ['/'] })[0]!,
		/names https:\/\/example\.com\//,
	);
	assert.match(
		sitemapIssues({ index: `<loc>${origin}/sitemap-9.xml</loc>`, shards, origin, routes: ['/'] })[0]!,
		/points at sitemap-9\.xml/,
	);
});

test('the origin literal may live in the constant and the checked robots file only', () => {
	const files = [
		{ path: 'src/lib/site.ts', text: `export const SITE = { origin: '${origin}' };` },
		{ path: 'src/pages/index.astro', text: `<link rel="canonical" href="${origin}/">` },
		{ path: 'src/pages/about.astro', text: '// the canonical origin is spelled in prose in this comment only' },
		{ path: 'src/layouts/Base.astro', text: `<!-- ${origin} -->` },
	];
	const found = singlePointIssues({ files, origin, allowedPaths: ['src/lib/site.ts', 'public/robots.txt'] });
	assert.equal(found.length, 1);
	assert.match(found[0]!, /src\/pages\/index\.astro/);
});
