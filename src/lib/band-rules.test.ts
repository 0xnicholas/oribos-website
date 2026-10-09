import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	bandColorIssues,
	bandCountingIssues,
	observabilityCardClaim,
	observabilityClaim,
	observabilityFile,
	observabilityIssues,
	observabilityKicker,
	observabilityLead,
	observabilitySnippet,
	resourceLinks,
	resourcesIssues,
	resourcesKicker,
	socialProofIssues,
	socialProofKicker,
	socialProofLine,
} from './band-rules.ts';
import { LINKS } from './links.ts';

const page = (html: string) => ({ path: 'index.html', html: `<html><body>${html}</body></html>` });

const codeBlock = (code: string) =>
	`<pre class="astro-code astro-code-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;overflow-x: auto;" tabindex="0"><code>${code
		.split('\n')
		.map((line) => `<span class="line">${line}</span>`)
		.join('\n')}</code></pre>`;

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
	return `<section id="observability" data-observability class="scroll-mt-20 border-t border-line px-6 py-20">
	<p class="text-base font-semibold tracking-wide text-acc">${copy.kicker}</p>
	<h2 class="mt-3 text-3xl font-semibold tracking-tight text-ink">${copy.claim}</h2>
	<p class="mt-4 max-w-3xl text-ink2">${copy.lead}</p>
	<h3 class="mt-10 text-lg font-semibold tracking-tight text-ink">${copy.codeClaim}</h3>
	<div class="mt-4"><div class="box" data-code-tabs>
		<div role="tablist"><button type="button" role="tab" aria-selected="true" class="text-ink3 hover:text-ink aria-selected:bg-bg2 aria-selected:text-ink">${copy.file}</button></div>
		${codeBlock(copy.code)}
	</div></div>
</section>`;
};

const socialProofSection = (overrides: Partial<Record<string, string>> = {}) => {
	const copy = { kicker: socialProofKicker, line: socialProofLine, ...overrides };
	return `<section id="social-proof" data-social-proof class="scroll-mt-20 border-t border-line px-6 py-16">
	<p class="text-base font-semibold tracking-wide text-acc">${copy.kicker}</p>
	<p class="mt-4 text-base text-ink3">${copy.line}</p>
</section>`;
};

const resourcesSection = (links: readonly { label: string; key: 'docs' | 'examples' | 'architecture' }[] = resourceLinks) =>
	`<section id="resources" data-resources class="scroll-mt-20 border-t border-line px-6 py-10">
	<p class="font-semibold tracking-wide text-acc">${resourcesKicker}</p>
	<ul>${links.map((link) => `<li><a href="${LINKS[link.key]}" class="text-ink2 hover:text-ink">${link.label}</a></li>`).join('')}</ul>
</section>`;

const bands = (
	observability = observabilitySection(),
	socialProof = socialProofSection(),
	resources = resourcesSection(),
) => page(observability + socialProof + resources);

test('a page with the three bands passes every band rule', () => {
	const home = bands();
	assert.deepEqual(observabilityIssues(home), []);
	assert.deepEqual(socialProofIssues(home), []);
	assert.deepEqual(resourcesIssues(home), []);
	assert.deepEqual(bandColorIssues(home), []);
	assert.deepEqual(bandCountingIssues(home), []);
});

test('the observability band is #observability with the §3.3 copy in order', () => {
	assert.match(observabilityIssues(page('<p>nothing</p>'))[0]!, /no observability band/);

	assert.match(observabilityIssues(bands(observabilitySection({ kicker: 'Telemetry' })))[0]!, /kicker reads `Telemetry`/);
	assert.match(observabilityIssues(bands(observabilitySection({ claim: 'Every run traced.' })))[0]!, /H2 reads `Every run traced\.`/);
	assert.match(observabilityIssues(bands(observabilitySection({ lead: 'Traced, mostly.' })))[0]!, /lead is not the §3.3 paragraph verbatim/);
	assert.match(
		observabilityIssues(bands(observabilitySection({ codeClaim: 'One tracer, every agent.' })))[0]!,
		/card claim reads `One tracer, every agent\.`/,
	);

	const reordered = bands(
		observabilitySection()
			.replace(`<p class="text-base font-semibold tracking-wide text-acc">${observabilityKicker}</p>\n\t<h2`, `<h2`)
			.replace('</h2>', `</h2><p>${observabilityKicker}</p>`),
	);
	assert.match(observabilityIssues(reordered).join('\n'), /out of order/);

	const extra = bands(observabilitySection().replace('</section>', '<p>Even more tracing.</p></section>'));
	assert.match(observabilityIssues(extra).join('\n'), /3 paragraphs/);
});

test('the observability card is the §7.4 `app.ts` snippet, one file, ten lines at most', () => {
	assert.match(observabilityIssues(bands(observabilitySection({ code: 'const app = createApp({});' })))[0]!, /not the §7\.4 snippet verbatim/);

	const eleven = observabilitySnippet.split('\n').concat('const later = true;', 'const more = true;').join('\n');
	assert.match(observabilityIssues(bands(observabilitySection({ code: eleven }))).join('\n'), /snippet is 11 lines/);

	const twoFiles = bands(
		observabilitySection().replace(
			'</div></div>\n</section>',
			'<div role="tablist"><button type="button" role="tab">tracer.ts</button></div></div></div>\n</section>',
		),
	);
	assert.match(observabilityIssues(twoFiles).join('\n'), /file tabs are \[app\.ts, tracer\.ts\]/);

	const echoed = bands(observabilitySection(), '', '');
	assert.match(observabilityIssues(page(`${echoed.html}${codeBlock(observabilitySnippet)}`)).join('\n'), /appears 2 times/);
});

test('the observability band carries no mock image and no default-export claim', () => {
	const mocked = bands(observabilitySection().replace('<h2', '<img src="/mock.png" alt="" /><h2'));
	assert.match(observabilityIssues(mocked).join('\n'), /<img>/);

	const exported = bands(observabilitySection().replace('</h2>', '</h2><p>Every subsystem is exported by default.</p>'));
	assert.match(observabilityIssues(exported).join('\n'), /exported by default/);
});

test('the social-proof band is #social-proof: the §3.4 kicker, one muted line, nothing else', () => {
	assert.match(socialProofIssues(page('<p>nothing</p>'))[0]!, /no social-proof band/);

	assert.match(socialProofIssues(bands('', socialProofSection({ kicker: 'Open source' })))[0]!, /kicker reads `Open source`/);

	const edited = bands('', socialProofSection({ line: 'No logos yet.' }));
	assert.match(socialProofIssues(edited)[0]!, /§3.4 kicker and one muted line/);

	const extraCopy = bands('', socialProofSection().replace('</section>', '<p>Watch this space.</p></section>'));
	assert.match(socialProofIssues(extraCopy)[0]!, /one muted line, nothing else/);

	const cta = bands('', socialProofSection().replace('</section>', '<a href="/">Read more</a></section>'));
	assert.match(socialProofIssues(cta).join('\n'), /<a>/);

	const quote = bands('', socialProofSection().replace('</section>', '<blockquote>They ship fast.</blockquote></section>'));
	assert.match(socialProofIssues(quote).join('\n'), /<blockquote>/);

	const unmuted = bands('', socialProofSection().replace('text-ink3', 'text-acc-lo'));
	assert.match(socialProofIssues(unmuted).join('\n'), /not muted in `text-ink3`/);
});

test('the resources strip is #resources: three verbatim links from the links constants', () => {
	assert.match(resourcesIssues(page('<p>nothing</p>'))[0]!, /no resources strip/);

	const readme = `https://github.com/0xnicholas/oribos-framework/blob/main/README.md`;
	const wrongTarget = bands('', '', resourcesSection().replace(LINKS.examples, readme));
	assert.match(resourcesIssues(wrongTarget).join('\n'), /`Examples` link points at/);

	const renamed = bands(
		'',
		'',
		resourcesSection()
			.replace('>Examples<', '>Samples<')
			.replace('>Architecture<', '>Samples<'),
	);
	assert.match(resourcesIssues(renamed).join('\n'), /resources link 2 reads `Samples`/);

	const fourth = bands(
		'',
		'',
		resourcesSection([...resourceLinks, { label: 'Blog', key: 'docs' }]),
	);
	assert.match(resourcesIssues(fourth).join('\n'), /4 link\(s\)/);

	const extraCopy = bands('', '', resourcesSection().replace('</section>', '<p>and more.</p></section>'));
	assert.match(resourcesIssues(extraCopy).join('\n'), /three labels only/);

	const cta = bands('', '', resourcesSection().replace('</section>', '<button type="button">Star</button></section>'));
	assert.match(resourcesIssues(cta).join('\n'), /carries a button/);
});

test('the three bands paint with the roles §5.5 audits on the page background', () => {
	const badRole = bands('', socialProofSection().replace('text-ink3', 'text-acc-lo'));
	assert.match(bandColorIssues(badRole)[0]!, /social-proof band paints text with `text-acc-lo`/);

	const surfless = bands(observabilitySection().replace('class="scroll-mt-20', 'class="bg-bg2 scroll-mt-20'));
	assert.match(bandColorIssues(surfless)[0]!, /paints its own surface with `bg-bg2`/);
});

test('the three bands state no counting-style figures in their copy', () => {
	const digit = bands(observabilitySection().replace('</section>', '<p>It takes 3 steps.</p></section>'));
	assert.match(bandCountingIssues(digit)[0]!, /carries `3`/);

	const word = bands('', socialProofSection().replace('</section>', '<p>Three real stories.</p></section>'));
	assert.match(bandCountingIssues(word)[0]!, /`Three real stories`/);

	const inCode = bands(observabilitySection({ code: 'const retries = 5;' }));
	assert.deepEqual(bandCountingIssues(inCode), []);
	assert.deepEqual(bandCountingIssues(bands()), []);
});
