import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	copyScriptIssues,
	finalCtaIssues,
	finalCtaHeading,
	finalCtaSub,
	heroCodeIssues,
	heroCopied,
	heroFile,
	heroH1,
	heroIssues,
	heroSecondary,
	heroSnippet,
	heroSub,
	heroWindowIssues,
	shikiIssues,
	traceIssues,
	traceMeta,
	traceRows,
	traceSummary,
	trailGreen,
	trailIssues,
	traceGreenDeclaration,
} from './hero-rules.ts';
import { LINKS } from './links.ts';

const page = (html: string) => ({ path: 'index.html', html });
const codeBlock = (code = heroSnippet, className = 'astro-code astro-code-themes oribos-light oribos-dark') =>
	`<pre class="${className}" style="background-color:#fff;--shiki-dark-bg:#24292e;overflow-x: auto;" tabindex="0"><code>${code
		.split('\n')
		.map((line) => `<span class="line">${line}</span>`)
		.join('\n')}</code></pre>`;

/** The markup the hero must render, reduced to the strings the rules read. */
const hero = `
<section data-hero>
	<h1>${heroH1}</h1>
	<p>${heroSub}</p>
	<div>
		<a href="${LINKS.github}"><svg aria-hidden="true"></svg>GitHub</a>
		<button type="button"><svg aria-hidden="true"></svg><span>${heroSecondary}</span></button>
	</div>
	<div data-window>
		<div data-window-bar>
			<span aria-hidden="true"><i></i><i></i><i></i></span>
			<span data-file-tab>${heroFile}</span>
			<span data-trace-badge>trace</span>
		</div>
		<div data-hero-code>${codeBlock()}</div>
		<div>
			<div data-trace>
				<p>${traceMeta}</p>
				<ul>
					${traceRows
						.map(
							(row) =>
								`<li data-trace-row data-tone="${row.tone}"><span>${row.lane}</span><span><span style="left:${row.left}%;width:${row.width}%"></span></span><span>${row.value}</span></li>`,
						)
						.join('\n')}
				</ul>
				<p>${traceSummary}</p>
			</div>
		</div>
	</div>
</section>`;

const finalCta = `
<section id="get-started">
	<h2>${finalCtaHeading}</h2>
	<p>${finalCtaSub}</p>
	<div>
		<a href="${LINKS.github}"><svg aria-hidden="true"></svg>GitHub</a>
		<span>coming soon</span>
	</div>
</section>`;

const fullPage = page(`<html><body>${hero}${finalCta}</body></html>`);

test('a hero page passes every hero rule', () => {
	assert.deepEqual(heroIssues(fullPage), []);
	assert.deepEqual(heroWindowIssues(fullPage), []);
	assert.deepEqual(heroCodeIssues(fullPage), []);
	assert.deepEqual(traceIssues(fullPage), []);
	assert.deepEqual(finalCtaIssues(fullPage), []);
});

test('the hero copy and its two CTAs are the locked ones', () => {
	assert.match(heroIssues(page('<p>nothing</p>'))[0]!, /no hero section/);
	assert.match(heroIssues(page(hero.replace(heroH1, 'Build AI agents.')))[0]!, /the hero H1 is/);
	// The CTA's icon is decorative: dropping it changes nothing the rules read.
	assert.deepEqual(heroIssues(page(hero.replace('><svg aria-hidden="true"></svg>GitHub', '>GitHub'))), []);

	const noCopy = page(hero.replace(heroSecondary, 'Copy'));
	assert.match(heroIssues(noCopy)[0]!, /Copy quick start/);

	const kicker = page(hero.replace('<h1>', '<p>TypeScript · zero dependencies</p><h1>'));
	assert.match(heroIssues(kicker)[0]!, /no kicker/);

	const pill = page(hero.replace('</section>', '<span>coming soon</span></section>'));
	assert.match(heroIssues(pill)[0]!, /coming-soon control/);

	const stars = page(hero.replace('</section>', '<a href="/">12,345 stars</a></section>'));
	assert.match(heroIssues(stars)[0]!, /star count/);
});

test('the window bar is dots + the file tab + the trace badge, never a session title', () => {
	const title = page(hero.replace(`<span data-file-tab>${heroFile}</span>`, '<span>assistant — weather.ts</span>'));
	assert.match(heroWindowIssues(title)[0]!, /session title|file tab/);

	const twoDots = page(hero.replace('<i></i><i></i><i></i>', '<i></i><i></i>'));
	assert.match(heroWindowIssues(twoDots)[0]!, /window dots/);
});

test('the hero code block is the §7.2 snippet in one dual-theme Shiki block', () => {
	const edited = page(hero.replace('  execute: ({ city }) => ({ city, celsius: 18 }),', '  execute: () => ({ celsius: 18 }),'));
	assert.match(heroCodeIssues(edited)[0]!, /not the §7.2 snippet verbatim/);

	const singleTheme = page(hero.replace('oribos-light oribos-dark', 'oribos-dark'));
	assert.match(heroCodeIssues(singleTheme)[0]!, /oribos-light/);
});

test('the trace keeps the §7.5 lanes, coordinates, values and tones', () => {
	const moved = page(hero.replace('left:34%;width:48%', 'left:35%;width:48%'));
	assert.match(traceIssues(moved)[0]!, /left:34% width:48%/);

	const wrongTone = page(hero.replace('data-tone="tool"', 'data-tone="accent"'));
	assert.match(traceIssues(wrongTone)[0]!, /toned/);

	const fewerRows = page(hero.replace(/<li data-trace-row[\s\S]*?<\/li>\n\s*/, ''));
	assert.match(traceIssues(fewerRows)[0]!, /expected 7/);

	const otherMeta = page(hero.replace(traceMeta, 'trace · a run'));
	assert.match(traceIssues(otherMeta)[0]!, /card head/);
});

test('the final CTA is the shared copy, the GitHub action and a passive pill', () => {
	assert.match(finalCtaIssues(page('<p>nothing</p>'))[0]!, /no #get-started section/);

	const linked = page(finalCta.replace('<span>coming soon</span>', `<a href="${LINKS.github}">coming soon</a>`));
	assert.match(finalCtaIssues(linked)[0]!, /never a link/);

	const noHeading = page(finalCta.replace(finalCtaHeading, 'Ship agents.'));
	assert.match(finalCtaIssues(noHeading)[0]!, /final CTA heading/);
});

test('the shipped CSS switches the code surface; the trace green is declared once and trace-only', () => {
	const css = `
		.astro-code { padding: 1rem 1.25rem; font-size: var(--t-xs); }
		@media (prefers-color-scheme: dark) { .astro-code, .astro-code span { color: var(--shiki-dark) !important; background-color: var(--shiki-dark-bg) !important; } }
		:root { --trace-green: ${trailGreen.light}; }
		@media (prefers-color-scheme: dark) { :root { --trace-green: ${trailGreen.dark}; } }
	`;
	assert.deepEqual(shikiIssues(css), []);
	assert.deepEqual(trailIssues(css, [{ path: traceGreenDeclaration, text: css }]), []);

	assert.match(shikiIssues('@media (prefers-color-scheme: dark) { .other { color: red } }')[0]!, /astro-code/);

	// The retired github pair must not ship: `<Code />` falls back to it without the themes prop.
	const custom = '<pre class="astro-code oribos-light oribos-dark">const a = 1;</pre>';
	assert.deepEqual(shikiIssues(css, custom), []);
	assert.match(shikiIssues(css, '<pre class="astro-code github-light github-dark">x</pre>').join('\n'), /retired `github-light`/);
	assert.match(shikiIssues(css, '<pre class="astro-code">x</pre>').join('\n'), /does not carry the dual `oribos-light`/);
	assert.match(trailIssues('.trace {}', [])[0]!, /missing the light trace green/);
	// The literal lives in the one declaration file: a component restating it is a spread.
	assert.match(
		trailIssues(css, [{ path: 'src/components/Hero.astro', text: '.x { color: hsl(140, 45%, 32%) }' }])[0]!,
		/trace-only/,
	);
	// The use-case cards' trace console draws trace / tool states too: it may read the var…
	assert.deepEqual(
		trailIssues(css, [{ path: 'src/components/mocks/MockTraceConsole.astro', text: '.mock-status { color: var(--trace-green) }' }]),
		[],
	);
	// …but a component that merely repaints with it is a spread as well.
	assert.match(
		trailIssues(css, [{ path: 'src/components/SocialProof.astro', text: '.x { color: var(--trace-green) }' }])[0]!,
		/trace green/,
	);
	// The minifier may ship the hex form instead of the spec's hsl().
	const hex = `@media (prefers-color-scheme: dark) { .astro-code { color: var(--shiki-dark) } }
		:root { --trace-green: #2d7645; }
		@media (prefers-color-scheme: dark) { :root { --trace-green: #5eba7d; } }`;
	assert.deepEqual(trailIssues(hex, []), []);
});

test('the copy script ships: the clipboard write, the copied state, the reset', () => {
	const script = `document.querySelector(\`[data-copy-quick-start]\`),document.querySelector(\`[data-hero-code]\`),i.textContent=\`${heroCopied}\`,a=window.setTimeout(()=>{},1200),await navigator.clipboard.writeText(n)`;
	assert.deepEqual(copyScriptIssues([script]), []);
	assert.match(copyScriptIssues(['console.log("no copy")'])[0]!, /clipboard/);
});
