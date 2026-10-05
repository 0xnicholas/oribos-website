import assert from 'node:assert/strict';
import { test } from 'node:test';
import { faviconIssues, llmsIssues, ogImageIssues, pngSize, sizedPngIssues } from './asset-rules.ts';

const origin = 'https://oribos.dev';

test('the favicon keeps the amber tile in both theme values and the white O', () => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg"><style>.tile{fill:#9e630a}@media (prefers-color-scheme: dark){.tile{fill:#ea9f2e}}</style><rect class="tile" width="32" height="32"/><path fill="#ffffff" d="M0 0"/></svg>`;
	assert.deepEqual(faviconIssues(svg), []);
	assert.match(faviconIssues(null)[0]!, /favicon/);
	assert.match(faviconIssues(svg.replace('#ea9f2e', '#000000'))[0]!, /dark/);
	assert.match(faviconIssues('<svg></svg>')[0]!, /#9e630a/);
	assert.match(faviconIssues(svg.replace('#ffffff', '#eeeeee'))[0]!, /white/);
});

const png = (width: number, height: number) => {
	const buffer = Buffer.alloc(24);
	buffer.write('\x89PNG\r\n\x1a\n', 0, 'binary');
	buffer.write('IHDR', 12, 'binary');
	buffer.writeUInt32BE(width, 16);
	buffer.writeUInt32BE(height, 20);
	return buffer;
};

test('the og card is one 1200×630 PNG', () => {
	assert.deepEqual(pngSize(png(1200, 630)), { width: 1200, height: 630 });
	assert.equal(pngSize(Buffer.from('not a png')), null);
	assert.deepEqual(ogImageIssues(png(1200, 630)), []);
	assert.match(ogImageIssues(png(1200, 600))[0]!, /1200×630/);
	assert.match(ogImageIssues(null)[0]!, /og\.png/);
});

test('the favicon PNG exports keep their sizes', () => {
	assert.deepEqual(sizedPngIssues(png(32, 32), 'favicon-32.png', 32), []);
	assert.match(sizedPngIssues(null, 'favicon-32.png', 32)[0]!, /missing/);
	assert.match(sizedPngIssues(Buffer.from('not a png'), 'favicon-32.png', 32)[0]!, /not a PNG/);
	assert.match(sizedPngIssues(png(16, 16), 'favicon-32.png', 32)[0]!, /32×32/);
});

test('llms.txt is the page list: verbatim titles with absolute URLs on the one origin', () => {
	const pages = [
		{ route: '/', title: 'Oribos — ultralight TypeScript AI agent framework' },
		{ route: '/about/', title: 'About — Oribos' },
	];
	const text = `# Oribos\n\n- [${pages[0]!.title}](${origin}/)\n- [${pages[1]!.title}](${origin}/about/)\n`;
	assert.deepEqual(llmsIssues(text, pages, origin), []);

	assert.match(llmsIssues(null, pages, origin)[0]!, /llms\.txt/);
	assert.ok(llmsIssues(text.replace(`${origin}/about/`, 'https://example.com/about/'), pages, origin).length > 0);
	assert.ok(llmsIssues(`${text}- [Extra](https://oribos.dev/extra/)\n`, pages, origin).length > 0);
	assert.ok(llmsIssues(text.replace('About — Oribos', 'About'), pages, origin).length > 0);
	assert.match(llmsIssues(text.replace('About — Oribos', 'About'), pages, origin)[0]!, /the title for/);
	const withoutHeading = `- [${pages[0]!.title}](${origin}/)\n- [${pages[1]!.title}](${origin}/about/)\n`;
	assert.match(llmsIssues(withoutHeading, pages, origin)[0]!, /no `# Oribos` heading/);
});
