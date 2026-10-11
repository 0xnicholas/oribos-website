import assert from 'node:assert/strict';
import { test } from 'node:test';
import { linkIssues, retiredNames, routeOf, routeOfHtmlFile } from './link-rules.ts';

const index = {
	routeExists: (route: string) => ['/', '/about/'].includes(route),
	pageHtml: (route: string) => (route === '/' ? '<section id="features"></section>' : '<h1>About</h1>'),
	allowedExternal: ['https://github.com/0xnicholas/oribos-framework', 'https://oribos.dev'],
	retiredNames,
};

const issues = (html: string, path = 'index.html') => linkIssues([{ path, html }], index);

test('routes normalize to one trailing-slash form', () => {
	assert.equal(routeOf('/'), '/');
	assert.equal(routeOf('/about'), '/about/');
	assert.equal(routeOf('/about/'), '/about/');
	assert.equal(routeOf('/about#team'), '/about/');
});

test('a built file maps to the route it serves, leading slash included', () => {
	assert.equal(routeOfHtmlFile('index.html'), '/');
	assert.equal(routeOfHtmlFile('about/index.html'), '/about/');
	assert.equal(routeOfHtmlFile('in-product-agents/index.html'), '/in-product-agents/');
});

test('an in-site link that resolves and hits its anchor passes', () => {
	assert.deepEqual(issues('<a href="/">home</a><a href="/about/">about</a><a href="/#features">features</a>'), []);
});

test('a link to a page the build did not produce fails', () => {
	const found = issues('<a href="/pricing/">pricing</a>');
	assert.equal(found.length, 1);
	assert.match(found[0]!, /does not resolve to a built page/);
});

test('an anchor with no target on the page it points at fails, home-page anchors included', () => {
	assert.equal(issues('<a href="/#faq">faq</a>').length, 1);
	assert.equal(issues('<a href="#top">top</a>').length, 1);
	assert.deepEqual(issues('<section id="top"></section><a href="#top">top</a>'), []);
});

test('external links must be the links constants, under a current name', () => {
	assert.deepEqual(issues('<a href="https://github.com/0xnicholas/oribos-framework">GitHub</a>'), []);
	// A fragment on a constant is still that constant; another repository is not.
	assert.deepEqual(issues('<a href="https://github.com/0xnicholas/oribos-framework#readme">readme</a>'), []);
	const unknown = issues('<a href="https://example.com/x">x</a>');
	assert.equal(unknown.length, 1);
	assert.match(unknown[0]!, /not one of the links constants/);

	for (const retired of [
		'https://github.com/0xnicholas/balsa-framework',
		'https://github.com/0xnicholas/balsats-framework',
		'https://github.com/0xnicholas/balsats-website',
		'https://docs.balsajs.dev/docs',
		'https://balsats.com/',
	]) {
		const found = issues(`<a href="${retired}">x</a>`);
		assert.ok(found.length > 0, `expected a finding for \`${retired}\``);
	}
});

test('relative links and non-http schemes are findings (the site links out to GitHub only)', () => {
	assert.match(issues('<a href="about/">about</a>')[0]!, /relative link/);
	assert.match(issues('<a href="mailto:hi@oribos.dev">mail</a>')[0]!, /no other scheme/);
});
