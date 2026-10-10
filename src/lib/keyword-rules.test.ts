import assert from 'node:assert/strict';
import { test } from 'node:test';
import { faqItems as globalFaqItems, sentenceCount } from './faq-rules.ts';
import { headIssues } from './head-rules.ts';
import {
	backLinkText,
	carriesKeywordPage,
	keywordColourIssues,
	keywordPageIssues,
	keywordPages,
	learnMoreText,
	pageFaqHeading,
	type KeywordFaqSpec,
	type KeywordPage,
	type KeywordPageSpec,
	type KeywordSectionSpec,
} from './keyword-rules.ts';
import { learnMoreLinks } from './links.ts';
import { pages as registered } from './pages.ts';

const spec = keywordPages[0]!;

const titleOf = (route: string): string => registered.find((page) => page.route === route)!.title;

const cardHtml = (section: KeywordSectionSpec) =>
	`<article data-keyword-section class="col-span-4 flex flex-col gap-3 box p-5 md:col-span-6"><h3 class="text-xl font-semibold tracking-tight text-ink">${section.heading}</h3><p class="text-lg text-ink2">${section.body}</p></article>`;

const faqHtml = (item: KeywordFaqSpec) =>
	`<details><summary class="cursor-pointer py-4 font-semibold text-ink hover:text-acc">${item.question}</summary><p class="pb-4 text-base text-ink2">${item.answer}</p></details>`;

const page = (entry: KeywordPageSpec = spec): KeywordPage => ({
	path: `${entry.route.slice(1)}index.html`,
	html: `<html lang="en"><head>
		<title>${titleOf(entry.route)}</title>
		<meta name="description" content="${entry.description}" />
		<meta property="og:title" content="${titleOf(entry.route)}" />
		<meta property="og:description" content="${entry.description}" />
	</head><body>
	<header><a href="/">Oribos</a></header>
	<main>
		<section data-keyword-hero class="px-6 py-18">
			<div class="mx-auto max-w-3xl">
				<h1 class="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">${entry.h1}</h1>
				<p data-keyword-intro class="mt-5 text-lg text-ink2">${entry.intro}</p>
			</div>
		</section>
		<section data-keyword-sections class="border-t border-line py-24">
			<div class="wrap">
				<div class="cols">
					${entry.sections.map(cardHtml).join('')}
				</div>
				<p data-keyword-learn-more class="mt-12"><a href="${learnMoreLinks[entry.slug].pre}" class="font-semibold text-acc hover:underline">${learnMoreText}</a></p>
			</div>
		</section>
		<section data-page-faq class="border-t border-line py-24">
			<div class="mx-auto max-w-3xl">
				<h2 class="text-3xl font-semibold tracking-tight text-ink">${pageFaqHeading}</h2>
				<div class="mt-8 divide-y divide-line border-y border-line">
					${entry.faq.map(faqHtml).join('')}
				</div>
			</div>
		</section>
		<section id="get-started" class="border-t border-line px-6 py-20"><h2>Build ultralight AI agents.</h2></section>
		<section data-keyword-back class="border-t border-line px-6 py-12">
			<div class="mx-auto max-w-3xl">
				<a href="${entry.backAnchor}" class="text-base font-semibold text-acc hover:underline">${backLinkText}</a>
			</div>
		</section>
	</main>
	<footer><nav><a href="/ai-agents/">Agents</a><a href="/ai-workflows/">Workflows</a><a href="/ai-agent-observability/">Observability</a></nav></footer>
	</body></html>`,
});

test('every registered keyword page with the §4.4 skeleton passes every rule', () => {
	for (const entry of keywordPages) {
		const built = page(entry);
		assert.deepEqual(keywordPageIssues(built, entry), [], entry.route);
		assert.deepEqual(headIssues(built, { description: entry.description, title: titleOf(entry.route) }), [], entry.route);
		assert.deepEqual(keywordColourIssues(built), [], entry.route);
		assert.ok(carriesKeywordPage(built.html), entry.route);
	}
	assert.equal(carriesKeywordPage('<section>no marker</section>'), false);
});

test('the H1 and the §5.2 intro are the locked lines, the H1 the only h1 on the page', () => {
	const renamed = page();
	renamed.html = renamed.html.replace(`>${spec.h1}<`, '>Everything agents.<');
	assert.match(keywordPageIssues(renamed, spec).join('\n'), /the H1 reads `Everything agents\.`/);

	const twoH1 = page();
	twoH1.html = twoH1.html.replace('</main>', `<h1>${spec.h1}</h1></main>`);
	assert.match(keywordPageIssues(twoH1, spec).join('\n'), /carries 2 <h1>/);

	const noHero = page();
	noHero.html = noHero.html.replace(' data-keyword-hero', '');
	assert.match(keywordPageIssues(noHero, spec).join('\n'), /no keyword hero/);

	const noIntro = page();
	noIntro.html = noIntro.html.replace(/<p data-keyword-intro[\s\S]*?<\/p>/, '');
	assert.match(keywordPageIssues(noIntro, spec).join('\n'), /the hero intro is not the §5\.2 paragraph verbatim/);

	const reworded = page();
	reworded.html = reworded.html.replace('a library you call from the app you already run', 'a library you import');
	assert.match(keywordPageIssues(reworded, spec).join('\n'), /the hero intro is not the §5\.2 paragraph verbatim/);

	const linked = page();
	linked.html = linked.html.replace('</p>\n\t\t\t</div>', '</p><a href="/#features">See how it works →</a></div>');
	assert.match(keywordPageIssues(linked, spec).join('\n'), /the hero carries a link/);
});

test('the argument cards are the §5.4 rehousing: h3 titles, verbatim words, in order, no h2, no links', () => {
	const fewer = page({ ...spec, sections: spec.sections.slice(0, 2) });
	assert.match(keywordPageIssues(fewer, spec).join('\n'), /carries 2 argument card\(s\), expected 3/);

	const renamed = page();
	renamed.html = renamed.html.replace(`>${spec.sections[0]!.heading}<`, '>A library you call<');
	assert.match(keywordPageIssues(renamed, spec).join('\n'), /card 1's title reads `A library you call`/);

	const reworded = page();
	reworded.html = reworded.html.replace('a deliberate choice rather than a prerequisite', 'an option, not a prerequisite');
	assert.match(keywordPageIssues(reworded, spec).join('\n'), /card 1's body is not the §4\.4 copy verbatim/);

	const swapped = page();
	swapped.html = swapped.html
		.replace(spec.sections[0]!.heading, '@@TWO@@')
		.replace(spec.sections[1]!.heading, spec.sections[0]!.heading)
		.replace('@@TWO@@', spec.sections[1]!.heading);
	assert.match(keywordPageIssues(swapped, spec).join('\n'), /card 1's title reads/);

	const h2Head = page();
	h2Head.html = h2Head.html.replace('<div class="cols">', '<h2 class="text-3xl font-semibold tracking-tight text-ink">Why Oribos</h2><div class="cols">');
	assert.match(keywordPageIssues(h2Head, spec).join('\n'), /the argument cards carry an <h2>/);

	const linked = page();
	linked.html = linked.html.replace('</article>', '<a href="/">home</a></article>');
	assert.match(keywordPageIssues(linked, spec).join('\n'), /card 1 carries a link/);
});

test('one Learn more link, the label verbatim, the pre-launch constant its target', () => {
	const missing = page();
	missing.html = missing.html.replace(/<p data-keyword-learn-more[\s\S]*?<\/p>/, '');
	assert.match(keywordPageIssues(missing, spec).join('\n'), /no `Learn more` link/);

	const doubled = page();
	doubled.html = doubled.html.replace('</main>', `<p><a href="${learnMoreLinks[spec.slug].pre}">${learnMoreText}</a></p></main>`);
	assert.match(keywordPageIssues(doubled, spec).join('\n'), /carries 2 `Learn more` links/);

	const relabeled = page();
	relabeled.html = relabeled.html.replace(`>${learnMoreText}<`, '>Read the docs<');
	assert.match(keywordPageIssues(relabeled, spec).join('\n'), /reads `Read the docs`, expected `Learn more`/);

	const retargeted = page();
	retargeted.html = retargeted.html.replace(learnMoreLinks[spec.slug].pre, learnMoreLinks[spec.slug].post);
	assert.match(keywordPageIssues(retargeted, spec).join('\n'), /the docs switch has not flipped/);
});

test('the in-page FAQ is the §4.4 set, verbatim and in order — and not the global nine', () => {
	const four = page({ ...spec, faq: spec.faq.slice(0, 4) });
	assert.match(keywordPageIssues(four, spec).join('\n'), /the in-page FAQ carries 4 questions, expected 6/);

	const renamed = page();
	renamed.html = renamed.html.replace(spec.faq[0]!.question, 'What is Oribos?');
	const found = keywordPageIssues(renamed, spec).join('\n');
	assert.match(found, /in-page question 1 reads `What is Oribos\?`/);
	assert.match(found, /repeats the global FAQ/);

	const reworded = page();
	reworded.html = reworded.html.replace('nothing hidden behind it', 'nothing else');
	assert.match(keywordPageIssues(reworded, spec).join('\n'), /the answer to in-page question 1 is not the §4\.4 text verbatim/);

	const globalMarker = page();
	globalMarker.html = globalMarker.html.replace('data-page-faq', 'data-faq');
	assert.match(keywordPageIssues(globalMarker, spec).join('\n'), /the global FAQ's `data-faq` marker/);
});

test('an in-page answer carries no link and runs one to three sentences', () => {
	const linked = page();
	linked.html = linked.html.replace('nothing hidden behind it.', 'nothing hidden behind it — see <a href="/">the docs</a>.');
	assert.match(keywordPageIssues(linked, spec).join('\n'), /answer carries a link/);

	const wordy = page();
	wordy.html = wordy.html.replace('nothing hidden behind it.', 'nothing hidden. Nothing at all. Really nothing. Not a thing.');
	assert.match(keywordPageIssues(wordy, spec).join('\n'), /runs 5 sentences/);
});

test('the page-level red lines: no code block, no interlink, no Platform word, no RAG / evals', () => {
	const coded = page();
	coded.html = coded.html.replace('</main>', '<pre><code>const a = 1;</code></pre></main>');
	assert.match(keywordPageIssues(coded, spec).join('\n'), /<pre> code block/);

	const interlinked = page();
	interlinked.html = interlinked.html.replace('</main>', '<p><a href="/ai-agents/">Agents</a></p></main>');
	assert.match(keywordPageIssues(interlinked, spec).join('\n'), /keyword pages do not interlink/);

	const platformed = page();
	platformed.html = platformed.html.replace('A library, not infrastructure you operate', 'A library, not a platform you operate');
	assert.match(keywordPageIssues(platformed, spec).join('\n'), /Platform-class words/);

	const ragged = page();
	ragged.html = ragged.html.replace('storage ports default to in-memory implementations', 'retrieval ports default to in-memory evals');
	assert.match(keywordPageIssues(ragged, spec).join('\n'), /RAG \/ evals/);
});

test('the skeleton order is H1 → sections → Learn more → in-page FAQ → final CTA → back anchor', () => {
	const built = page();
	const sections = built.html.match(/<section data-keyword-sections[\s\S]*?<\/section>/)![0];
	const faq = built.html.match(/<section data-page-faq[\s\S]*?<\/section>/)![0];
	const swapped = built.html.replace(sections, '@@FAQ@@').replace(faq, sections).replace('@@FAQ@@', faq);
	assert.match(keywordPageIssues({ ...built, html: swapped }, spec).join('\n'), /out of order/);
});

test('the page ends with the §4.4 back anchor', () => {
	const missing = page();
	missing.html = missing.html.replace(/<section data-keyword-back[\s\S]*?<\/section>/, '');
	assert.match(keywordPageIssues(missing, spec).join('\n'), /no back-anchor section/);

	const reworded = page();
	reworded.html = reworded.html.replace(backLinkText, 'Back home');
	assert.match(keywordPageIssues(reworded, spec).join('\n'), /See how it works/);

	const retargeted = page();
	retargeted.html = retargeted.html.replace(`href="${spec.backAnchor}"`, 'href="/#faq"');
	assert.match(keywordPageIssues(retargeted, spec).join('\n'), /\/#features/);
});

test('the head carries the §2.6 meta description and the og pair', () => {
	const described = page();
	described.html = described.html.replace(spec.description, 'A framework page.');
	assert.match(headIssues(described, { description: spec.description, title: titleOf(spec.route) }).join('\n'), /meta description is not the §2\.6 line/);

	const ogDescribed = page();
	ogDescribed.html = ogDescribed.html.replace(
		`<meta property="og:description" content="${spec.description}" />`,
		'<meta property="og:description" content="A framework page." />',
	);
	assert.match(headIssues(ogDescribed, { description: spec.description, title: titleOf(spec.route) }).join('\n'), /og:description is not the §2\.6 line/);

	const ogTitled = page();
	ogTitled.html = ogTitled.html.replace(`content="${titleOf(spec.route)}"`, 'content="AI agent framework — Oribos"');
	assert.match(headIssues(ogTitled, { description: spec.description, title: titleOf(spec.route) }).join('\n'), /og:title/);
});

test('the page sections wear the §5.5 audited roles on the page background', () => {
	const badRole = page();
	badRole.html = badRole.html.replace('mt-5 text-lg text-ink2', 'mt-5 text-lg text-acc-lo');
	assert.match(keywordColourIssues(badRole).join('\n'), /keyword hero paints text with `text-acc-lo`/);

	const badCardRole = page();
	badCardRole.html = badCardRole.html.replace('<p class="text-lg text-ink2">', '<p class="text-lg text-acc-lo">');
	assert.match(keywordColourIssues(badCardRole).join('\n'), /argument sections paints text with `text-acc-lo`/);

	const surface = page();
	surface.html = surface.html.replace('data-keyword-sections class="', 'data-keyword-sections class="bg-bg2 ');
	assert.match(keywordColourIssues(surface).join('\n'), /argument sections paints its own surface with `bg-bg2`/);
});

test('the registry holds the §5.2–§5.5 locks: four pages, the structural slots, their sentence discipline', () => {
	assert.deepEqual(
		keywordPages.map((entry) => entry.route),
		['/ai-agent-framework/', '/ai-agents/', '/ai-workflows/', '/ai-agent-observability/'],
	);
	assert.deepEqual(
		keywordPages.map((entry) => entry.backAnchor),
		['/#features', '/#agents', '/#workflows', '/#observability'],
	);

	const globalQuestions = new Set(globalFaqItems.map((item) => item.question.toLowerCase()));
	for (const entry of keywordPages) {
		assert.ok(entry.intro.length > 0, `${entry.route}: the §5.2 intro paragraph is registered`);
		assert.ok(entry.sections.length >= 3 && entry.sections.length <= 4, `${entry.route}: 3–4 argument cards`);
		assert.ok(entry.faq.length >= 6 && entry.faq.length <= 8, `${entry.route}: 6–8 in-page questions (§5.5 slot)`);
		for (const section of entry.sections) {
			const count = sentenceCount(section.body);
			assert.ok(count >= 1 && count <= 3, `${entry.route} · ${section.heading}: ${count} sentence(s)`);
		}
		for (const item of entry.faq) {
			const count = sentenceCount(item.answer);
			assert.ok(count >= 1 && count <= 3, `${entry.route} · ${item.question}: ${count} sentence(s)`);
			assert.ok(!globalQuestions.has(item.question.toLowerCase()), `${entry.route} repeats the global question \`${item.question}\``);
		}
		const ownCopy = [
			entry.h1,
			entry.intro,
			...entry.sections.flatMap((section) => [section.heading, section.body]),
			...entry.faq.flatMap((item) => [item.question, item.answer]),
		].join(' ');
		assert.ok(!/\bplatform\b/i.test(ownCopy), `${entry.route}: no Platform-class words`);
		assert.ok(!/\bRAG\b|\bevals?\b/i.test(ownCopy), `${entry.route}: no RAG / evals`);
		assert.ok(!/[<>{}]/.test(entry.intro), `${entry.route}: the intro is prose only — no markup, no code`);
		assert.ok(entry.slug in learnMoreLinks, `${entry.route}: the Learn more mapping covers the slug`);
	}
});
