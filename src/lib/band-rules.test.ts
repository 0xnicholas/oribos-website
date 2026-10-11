import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	bandColorIssues,
	bandCountingIssues,
	factsIssues,
	factsStrip,
	homeSectionOrder,
	homeSectionOrderIssues,
	observabilityCardClaim,
	observabilityClaim,
	observabilityFile,
	observabilityIssues,
	observabilityKicker,
	observabilityLead,
	observabilitySnippet,
	resourceCards,
	resourcesIssues,
	resourcesKicker,
	spanTypes,
	socialProofRelicIssues,
} from './band-rules.ts';
import { traceMeta, traceRows } from './hero-rules.ts';
import { LINKS } from './links.ts';

const page = (html: string) => ({ path: 'index.html', html: `<html><body>${html}</body></html>` });

const codeBlock = (code: string) =>
	`<pre class="astro-code astro-code-themes oribos-light oribos-dark" style="background-color:#fff;--shiki-dark-bg:#151513;overflow-x: auto;" tabindex="0"><code>${code
		.split('\n')
		.map((line) => `<span class="line">${line}</span>`)
		.join('\n')}</code></pre>`;

const waterfall = () => `<div class="trace" data-trace>
		<p class="trace-meta font-mono text-xs text-ink3">${traceMeta}</p>
		<ul>
			${traceRows
				.map(
					(row) =>
						`<li data-trace-row data-tone="${row.tone}"><span>${row.lane}</span><span><span style="left:${row.left}%;width:${row.width}%"></span></span><span>${row.value}</span></li>`,
				)
				.join('\n')}
		</ul>
		<p class="trace-summary font-mono text-xs text-ink3">chunk.type === 'text-delta' — every span from the same run</p>
	</div>`;

const spanList = () =>
	`<ul data-span-list>${spanTypes.map((type) => `<li class="font-mono text-xs text-ink2">${type}</li>`).join('')}</ul>`;

const factsSection = () =>
	`<section data-facts><ul>${factsStrip
		.map((fact) => `<li class="border-line p-4 font-mono text-xs text-ink2">${fact}</li>`)
		.join('')}</ul></section>`;

const observabilitySection = (overrides: Partial<Record<string, string>> = {}) => {
	const copy = {
		kicker: observabilityKicker,
		claim: observabilityClaim,
		lead: observabilityLead,
		codeClaim: observabilityCardClaim,
		file: observabilityFile,
		code: observabilitySnippet,
		...overrides,
	};
	return `<section id="observability" data-observability class="scroll-mt-20 border-t border-line py-24">
	<p class="text-base font-semibold tracking-wide text-acc">${copy.kicker}</p>
	<h2 class="mt-3 text-2xl font-semibold tracking-tight text-ink">${copy.claim}</h2>
	<p class="mt-4 max-w-3xl text-lg text-ink2">${copy.lead}</p>
	<h3 class="mt-10 text-xl font-semibold tracking-tight text-ink">${copy.codeClaim}</h3>
	<div class="mt-4 grid gap-6 lg:grid-cols-2">
		<div class="box" data-code-tabs>
			<div role="tablist"><button type="button" role="tab" aria-selected="true" class="text-ink3 hover:text-ink aria-selected:bg-bg2 aria-selected:text-ink">${copy.file}</button></div>
			${codeBlock(copy.code)}
		</div>
		<div class="box bg-bg2 p-4">${waterfall()}</div>
		<div class="box p-4">${spanList()}</div>
	</div>
</section>`;
};

const resourcesSection = () =>
	`<section id="resources" data-resources class="scroll-mt-20 border-t border-line py-24">
	<p class="font-semibold tracking-wide text-acc">${resourcesKicker}</p>
	<ul class="grid md:grid-cols-3">${resourceCards
		.map(
			(card) =>
				`<li class="box p-6"><a href="${LINKS[card.key]}" class="font-semibold text-acc">${card.label}</a><p class="mt-2 text-ink2">${card.description}</p></li>`,
		)
		.join('')}</ul>
</section>`;

/** The nine home sections, in the §3 order; the hero carries the run capture, the bands can be
 * the real markup. */
const homeWith = (observability: string, facts: string, resources: string): string =>
	[
		`<section data-hero>${waterfall()}</section>`,
		facts,
		'<section data-features></section>',
		observability,
		'<section data-use-cases></section>',
		resources,
		'<section data-faq></section>',
		'<section id="get-started"></section>',
	].join('');

test('a page with the bands passes every band rule', () => {
	const home = page(homeWith(observabilitySection(), factsSection(), resourcesSection()));
	assert.deepEqual(observabilityIssues(home), []);
	assert.deepEqual(factsIssues(home), []);
	assert.deepEqual(resourcesIssues(home), []);
	assert.deepEqual(homeSectionOrderIssues(home), []);
	assert.deepEqual(socialProofRelicIssues(home), []);
	assert.deepEqual(bandColorIssues(home), []);
	assert.deepEqual(bandCountingIssues(home), []);
});

test('the §3 nine-zone order holds: every section present, none out of place', () => {
	const scrambled = page(
		[
			'<section data-facts></section>',
			'<section data-resources></section>',
			'<section data-hero></section>',
			'<section id="get-started"></section>',
			'<section data-observability></section>',
			'<section data-use-cases></section>',
			'<section data-features></section>',
			'<section data-faq></section>',
		].join(''),
	);
	const issues = homeSectionOrderIssues(scrambled).join('\n');
	assert.match(issues, /facts band sits before the hero/);
	assert.match(issues, /resources band sits before the use-case cards/);

	const missing = page('<section data-hero></section>');
	assert.match(homeSectionOrderIssues(missing).join('\n'), /no facts band/);
});

test('the social-proof band stays gone: no relic section, no relic anchor', () => {
	assert.match(socialProofRelicIssues(page('<section data-social-proof></section>'))[0]!, /abolished/);
	assert.match(socialProofRelicIssues(page('<a href="#social-proof">logo wall</a>'))[0]!, /abolished/);
});

test('the facts band is four mono cells, verbatim, no kicker, no heading, no anchor', () => {
	const nowhere = page('<p>nothing</p>');
	assert.match(factsIssues(nowhere)[0]!, /no facts band/);

	const edited = page(factsSection().replace(factsStrip[1]!, 'Subpath exports everywhere'));
	assert.match(factsIssues(edited).join('\n'), /facts cell 2 reads/);

	const threeCells = page(factsSection().replace(/<li[^>]*>[^<]*<\/li>/, ''));
	assert.match(factsIssues(threeCells).join('\n'), /3 cell\(s\), expected 4/);

	const headed = page(factsSection().replace('<ul>', '<h2>Architecture</h2><ul>'));
	assert.match(factsIssues(headed).join('\n'), /<h2>/);

	const anchored = page(factsSection().replace('data-facts', 'data-facts id="social-proof"'));
	assert.match(factsIssues(anchored)[0]!, /sets no anchor/);

	const notMono = page(factsSection().replace('font-mono text-xs', 'text-base'));
	assert.match(factsIssues(notMono).join('\n'), /not mono `--t-xs`/);
});

test('the observability band is #observability with the §3.3 copy in order', () => {
	assert.match(observabilityIssues(page('<p>nothing</p>'))[0]!, /no observability band/);

	assert.match(observabilityIssues(page(observabilitySection({ kicker: 'Telemetry' })))[0]!, /kicker reads `Telemetry`/);
	assert.match(observabilityIssues(page(observabilitySection({ claim: 'Every run traced.' })))[0]!, /H2 reads `Every run traced\.`/);
	assert.match(observabilityIssues(page(observabilitySection({ lead: 'Traced, mostly.' })))[0]!, /lead is not the §3.3 paragraph verbatim/);
	assert.match(
		observabilityIssues(page(observabilitySection({ codeClaim: 'One tracer, every agent.' })))[0]!,
		/card claim reads `One tracer, every agent\.`/,
	);

	const reordered = observabilitySection()
		.replace(`<p class="text-base font-semibold tracking-wide text-acc">${observabilityKicker}</p>\n\t<h2`, `<h2`)
		.replace('</h2>', `</h2><p>${observabilityKicker}</p>`);
	assert.match(observabilityIssues(page(reordered)).join('\n'), /out of order/);

	const extra = page(observabilitySection().replace('</section>', '<p>Even more tracing.</p></section>'));
	assert.match(observabilityIssues(extra).join('\n'), /3 paragraphs/);
});

test('the observability trio: the §7.4 card, the hero trace reused, the span type list', () => {
	assert.match(observabilityIssues(page(observabilitySection({ code: 'const app = createApp({});' })))[0]!, /not the §7\.4 snippet verbatim/);

	const eleven = observabilitySnippet.split('\n').concat('const later = true;', 'const more = true;').join('\n');
	assert.match(observabilityIssues(page(observabilitySection({ code: eleven }))).join('\n'), /snippet is 11 lines/);

	const twoFiles = observabilitySection().replace(
		'</div></div>',
		'<div role="tablist"><button type="button" role="tab">tracer.ts</button></div></div></div>',
	);
	assert.match(observabilityIssues(page(twoFiles)).join('\n'), /file tabs are \[app\.ts, tracer\.ts\]/);

	const echoed = observabilitySection();
	const twice = page(`${echoed}${codeBlock(observabilitySnippet)}`);
	assert.match(observabilityIssues(twice).join('\n'), /§7\.4 snippet appears 2 times/);

	// The waterfall must be the hero's capture — no rows, no reuse.
	const dry = observabilitySection().replace(/<div class="trace"[\s\S]*?<\/div>\s*<\/div>/, '</div>');
	assert.match(observabilityIssues(page(dry)).join('\n'), /no trace waterfall/);

	// The meta line reads exactly twice: the hero window and the band.
	assert.match(observabilityIssues(page(`${traceMeta} ${traceMeta} ${observabilitySection()}`)).join('\n'), /appears 3 times/);

	// The span list: five mono entries, verbatim.
	const noSpans = observabilitySection().replace(/<ul data-span-list>[\s\S]*?<\/ul>/, '');
	assert.match(observabilityIssues(page(noSpans)).join('\n'), /no span type list/);

	const editedSpan = observabilitySection().replace(
		`<li class="font-mono text-xs text-ink2">${spanTypes[2]}</li>`,
		'<li class="font-mono text-xs text-ink2">tool calls</li>',
	);
	assert.match(observabilityIssues(page(editedSpan)).join('\n'), /span type 3 reads/);

	const notMono = observabilitySection().replace('<li class="font-mono text-xs text-ink2">tool call</li>', '<li>tool call</li>');
	assert.match(observabilityIssues(page(notMono)).join('\n'), /span type 3 is not mono/);
});

test('the observability band carries no mock image and no default-export claim', () => {
	const mocked = observabilitySection().replace('<h2', '<img src="/mock.png" alt="" /><h2');
	assert.match(observabilityIssues(page(mocked)).join('\n'), /<img>/);

	const exported = observabilitySection().replace('</h2>', '</h2><p>Every subsystem is exported by default.</p>');
	assert.match(observabilityIssues(page(exported)).join('\n'), /exported by default/);
});

test('the resources band is the kicker plus three cards, descriptions verbatim, links intact', () => {
	assert.match(resourcesIssues(page('<p>nothing</p>'))[0]!, /no resources band/);

	const readme = `https://github.com/0xnicholas/oribos-framework/blob/main/README.md`;
	const wrongTarget = resourcesSection().replace(LINKS.examples, readme);
	assert.match(resourcesIssues(page(wrongTarget)).join('\n'), /`Examples` link points at/);

	const renamed = resourcesSection().replace('>Examples<', '>Samples<').replace('>Architecture<', '>Samples<');
	assert.match(resourcesIssues(page(renamed)).join('\n'), /resources link 2 reads `Samples`/);

	const fourth = resourcesSection().replace('</ul>', '<li class="box p-6"><a href="/">Blog</a><p>News.</p></li></ul>');
	assert.match(resourcesIssues(page(fourth)).join('\n'), /4 link\(s\)/);

	const edited = resourcesSection().replace(resourceCards[0]!.description, 'Read the docs.');
	assert.match(resourcesIssues(page(edited)).join('\n'), /`Docs` card reads/);

	const noKicker = resourcesSection().replace(`>${resourcesKicker}<`, '>Elsewhere<');
	assert.match(resourcesIssues(page(noKicker)).join('\n'), /kicker reads `Elsewhere`/);

	const cta = resourcesSection().replace('</section>', '<button type="button">Star</button></section>');
	assert.match(resourcesIssues(page(cta)).join('\n'), /carries a button/);

	const changelog = resourcesSection().replace('</section>', '<p>Read the changelog.</p></section>');
	assert.match(resourcesIssues(page(changelog)).join('\n'), /no changelog flow/);
});

test('the bands paint with the roles §5.5 audits on the page background', () => {
	const badRole = factsSection().replace('text-ink2', 'text-acc-lo');
	assert.match(bandColorIssues(page(badRole))[0]!, /facts band paints text with `text-acc-lo`/);

	const surfaced = observabilitySection().replace('class="scroll-mt-20', 'class="bg-bg2 scroll-mt-20');
	assert.match(bandColorIssues(page(surfaced))[0]!, /paints its own surface with `bg-bg2`/);
});

test('the bands state no counting-style figures in their copy', () => {
	const digit = observabilitySection().replace('</section>', '<p>It takes 3 steps.</p></section>');
	assert.match(bandCountingIssues(page(digit))[0]!, /carries `3`/);

	const word = resourcesSection().replace('</section>', '<p>Three real stories.</p></section>');
	assert.match(bandCountingIssues(page(word)).join('\n'), /`Three real stories`/);

	// The waterfall's figures are the §7.5 capture's data, not claims.
	assert.deepEqual(bandCountingIssues(page(observabilitySection())), []);
	// The facts band is held verbatim by factsIssues — its approved "0" is not a counting claim.
	assert.deepEqual(bandCountingIssues(page(factsSection())), []);
});
