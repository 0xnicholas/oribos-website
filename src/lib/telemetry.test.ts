import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	cookieWriteIssues,
	formIssues,
	storageWriteIssues,
	telemetryMarkerIssues,
	thirdPartySubresourceIssues,
} from './telemetry.ts';

const origin = 'https://oribos.dev';
const pages = (html: string) => thirdPartySubresourceIssues([{ path: 'index.html', text: html }], { origin });

test('every subresource is served from the site itself', () => {
	assert.deepEqual(pages('<script src="/_astro/app.js"></script><link rel="stylesheet" href="/_astro/a.css">'), []);
	assert.deepEqual(pages('<img src="/_astro/x.png"><link rel="preconnect" href="https://oribos.dev">'), []);
	assert.deepEqual(pages('<img src="data:image/svg+xml,<svg/>">'), []);
});

test('a foreign subresource is a finding, however it is spelled', () => {
	assert.match(pages('<script src="https://cdn.example.com/x.js"></script>')[0]!, /zero third-party subresources/);
	assert.match(pages('<link rel="preconnect" href="https://fonts.gstatic.com">')[0]!, /zero third-party subresources/);
	assert.match(pages('<script src="//cdn.example.com/x.js"></script>')[0]!, /zero third-party subresources/);
	// A canonical is a pointer, not a subresource; a link out is content, not a subresource.
	assert.deepEqual(pages(`<link rel="canonical" href="${origin}/">`), []);
	assert.deepEqual(pages('<a href="https://github.com/0xnicholas/oribos-framework">GitHub</a>'), []);
});

test('the site has no form anywhere', () => {
	assert.deepEqual(formIssues([{ path: 'index.html', text: '<main>no forms</main>' }]), []);
	assert.match(formIssues([{ path: 'index.html', text: '<form action="/subscribe"></form>' }])[0]!, /collects nothing/);
});

test('cookie writes are findings; a bare read is not', () => {
	assert.deepEqual(cookieWriteIssues([{ path: 'app.js', text: 'const theme = readTheme();' }]), []);
	assert.match(cookieWriteIssues([{ path: 'app.js', text: 'document.cookie = "theme=dark";' }])[0]!, /writes a cookie/);
	assert.match(cookieWriteIssues([{ path: 'index.html', text: '<script>cookieStore.set("a", "b")</script>' }])[0]!, /writes a cookie/);
});

test('client-side state writes are findings (the theme follows the OS, nothing else)', () => {
	assert.deepEqual(storageWriteIssues([{ path: 'app.js', text: 'const x = localStorage.getItem("theme");' }]), []);
	assert.match(storageWriteIssues([{ path: 'app.js', text: 'localStorage.setItem("theme", "dark");' }])[0]!, /client-side state/);
	assert.match(storageWriteIssues([{ path: 'index.html', text: '<script>sessionStorage.clear()</script>' }])[0]!, /client-side state/);
});

test('vendor signatures count in code, not in prose about them', () => {
	assert.deepEqual(
		telemetryMarkerIssues([{ path: 'index.html', text: '<p>We run no analytics of any kind.</p>' }]),
		[],
	);
	assert.match(
		telemetryMarkerIssues([{ path: 'index.html', text: '<script>gtag("config", "G-1")</script>' }])[0]!,
		/Google Analytics/,
	);
	assert.match(telemetryMarkerIssues([{ path: 'a.js', text: 'fetch("https://plausible.io/api/event")' }])[0]!, /Plausible/);
});
