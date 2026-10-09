import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseLandingTokens } from './brand-tokens.ts';
import { headIssues } from './head-rules.ts';
import {
	backLinkHref,
	backLinkText,
	carriesUseCasePage,
	scenarioContrastIssues,
	sharedArtIssues,
	useCaseColourIssues,
	useCasePageIssues,
	useCasePages,
	type ScenarioCardSpec,
	type ScenarioPage,
	type UseCasePageSpec,
} from './scenario-rules.ts';

const globalCss = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

const spec = useCasePages[0]!;
const title = `${spec.h1} — Oribos`;

const art = `
	<figure data-use-case-art aria-hidden="true">
		<svg viewBox="0 0 1600 600" class="block h-auto w-full">
			<rect width="1600" height="600" fill="var(--bg2)" />
			<circle cx="800" cy="300" r="96" fill="none" stroke="var(--line)" stroke-width="1.5" />
			<path d="M 959.5 225.6 A 176 176 0 0 1 874.4 459.5" fill="none" stroke="var(--acc)" stroke-width="4" stroke-linecap="round" />
			<circle cx="800" cy="300" r="8" fill="var(--acc)" />
		</svg>
	</figure>`;

const packagesHtml = (packages: readonly string[]) =>
	`→ ${packages
		.map(
			(name) =>
				`<code class="box whitespace-nowrap bg-bg2 px-1.5 py-0.5 font-mono text-xs text-ink2">${name}</code>`,
		)
		.join(' · ')}`;

const cardHtml = (card: ScenarioCardSpec) => `
			<li data-scenario-card class="box flex flex-col gap-3 p-5">
				<h3 class="text-lg font-semibold tracking-tight text-ink">${card.name}</h3>
				<p class="text-base text-ink2">${card.text}</p>
				<p data-scenario-packages class="mt-auto pt-2 text-xs text-ink3">${packagesHtml(card.packages)}</p>
			</li>`;

const page = (entry: UseCasePageSpec = spec, options: { art?: string } = {}): ScenarioPage => ({
	path: `${entry.route.slice(1)}index.html`,
	html: `<html lang="en"><head>
		<title>${entry.h1} — Oribos</title>
		<meta name="description" content="${entry.description}" />
		<meta property="og:title" content="${entry.h1} — Oribos" />
		<meta property="og:description" content="${entry.description}" />
	</head><body>
	${options.art ?? art}
	<section data-use-case-hero class="px-6 py-16">
		<div class="mx-auto flex max-w-3xl flex-col items-center text-center">
			<h1 class="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">${entry.h1}</h1>
			<p data-use-case-tagline class="mt-5 max-w-2xl text-lg text-ink2">${entry.tagline}</p>
		</div>
	</section>
	<section data-scenarios class="border-t border-line px-6 py-20">
		<div class="mx-auto max-w-5xl">
			<ul class="grid gap-6 md:grid-cols-3">
				${entry.scenarios.map(cardHtml).join('')}
			</ul>
		</div>
	</section>
	<section id="get-started" class="border-t border-line px-6 py-20"><h2>Build ultralight AI agents.</h2></section>
	<section id="faq" data-faq class="border-t border-line px-6 py-20"><h2>Frequently asked questions</h2></section>
	<section data-use-case-back class="border-t border-line px-6 py-12">
		<div class="mx-auto max-w-5xl">
			<a href="${backLinkHref}" class="text-base font-semibold text-acc hover:underline">${backLinkText}</a>
		</div>
	</section>
</body></html>`,
});

test('a use-case page with the §4.3 skeleton passes every rule', () => {
	const built = page();
	assert.deepEqual(useCasePageIssues(built, spec), []);
	assert.deepEqual(headIssues(built, { description: spec.description, title }), []);
	assert.deepEqual(useCaseColourIssues(built), []);
	assert.deepEqual(sharedArtIssues([built]), []);
	assert.ok(carriesUseCasePage(built.html));
});

test('the hero carries the page H1 and tagline verbatim, one h1 on the page', () => {
	const renamed = page();
	renamed.html = renamed.html.replace(`>${spec.h1}<`, '>Assistants<');
	assert.match(useCasePageIssues(renamed, spec).join('\n'), /the H1 reads `Assistants`, expected `In-product agents`/);

	const subbed = page();
	subbed.html = subbed.html.replace(spec.tagline, 'Agents, inside.');
	assert.match(useCasePageIssues(subbed, spec).join('\n'), /the tagline is not the §4\.3 line verbatim/);

	const twoH1 = page();
	twoH1.html = twoH1.html.replace('</section>', `<h1>${spec.h1}</h1></section>`);
	assert.match(useCasePageIssues(twoH1, spec).join('\n'), /carries 2 <h1>/);
});

test('the three scenario cards carry the name, the text and the package line verbatim', () => {
	const fewer = page({ ...spec, scenarios: spec.scenarios.slice(0, 2) });
	assert.match(useCasePageIssues(fewer, spec).join('\n'), /carries 2 scenario card\(s\), expected 3/);

	const renamed = page();
	renamed.html = renamed.html.replace(`>${spec.scenarios[0]!.name}<`, '>Stream answers<');
	assert.match(useCasePageIssues(renamed, spec).join('\n'), /card 1's name reads `Stream answers`/);

	const reworded = page();
	reworded.html = reworded.html.replace('picks up where they left off', 'resumes the conversation');
	assert.match(useCasePageIssues(reworded, spec).join('\n'), /card 1's text is not the §4\.3 copy verbatim/);

	const repackaged = page();
	repackaged.html = repackaged.html.replace('@oribos/ai-sdk</code>', '@oribos/vercel-ai</code>');
	assert.match(useCasePageIssues(repackaged, spec).join('\n'), /card 1's package line reads/);

	const unpacked = page();
	unpacked.html = unpacked.html.replace(
		/<code class="[^"]*">@oribos\/core\/agent<\/code>/,
		'@oribos/core/agent',
	);
	assert.match(useCasePageIssues(unpacked, spec).join('\n'), /card 1 does not render every package as its own <code>/);
});

test('the shared art is one decorative banner, painted with the brand tokens', () => {
	const missing = page(spec, { art: '' });
	assert.match(useCasePageIssues(missing, spec).join('\n'), /no shared header art/);

	const labelled = page(spec, { art: art.replace(' aria-hidden="true"', '') });
	assert.match(useCasePageIssues(labelled, spec).join('\n'), /is not hidden from assistive technology/);

	const square = page(spec, { art: art.replace('viewBox="0 0 1600 600"', 'viewBox="0 0 600 600"') });
	assert.match(useCasePageIssues(square, spec).join('\n'), /not the 1600×600 banner/);

	const captioned = page(spec, { art: art.replace('</svg>', '<text x="10" y="10">Oribos</text></svg>') });
	assert.match(useCasePageIssues(captioned, spec).join('\n'), /carries <text>/);

	const literal = page(spec, { art: art.replace('var(--acc)" stroke-width="4"', '#9e630a" stroke-width="4"') });
	assert.match(useCasePageIssues(literal, spec).join('\n'), /paints with `#9e630a`/);

	const pale = page(spec, { art: art.replaceAll('var(--acc)', 'var(--line)') });
	assert.match(useCasePageIssues(pale, spec).join('\n'), /no amber geometry/);

	const drifted = page(spec, { art: art.replace('r="96"', 'r="100"') });
	assert.match(sharedArtIssues([page(), drifted]).join('\n'), /not the same figure on every use-case page/);
});

test('the skeleton order is art → hero → cards → CTA → FAQ → back link', () => {
	const scrambled = page();
	const back = scrambled.html.match(/<section data-use-case-back[\s\S]*?<\/section>/)![0];
	scrambled.html = scrambled.html.replace(back, '').replace('<section id="get-started"', `${back}<section id="get-started"`);
	assert.match(useCasePageIssues(scrambled, spec).join('\n'), /out of order/);
});

test('the page keeps the §4.3 red lines: no code block, no social proof, no breadcrumbs', () => {
	const coded = page();
	coded.html = coded.html.replace('</body>', '<pre class="astro-code">const a = 1;</pre></body>');
	assert.match(useCasePageIssues(coded, spec).join('\n'), /carries a <pre>/);

	const proofed = page();
	proofed.html = proofed.html.replace('</body>', '<section data-social-proof>Logos</section></body>');
	assert.match(useCasePageIssues(proofed, spec).join('\n'), /social-proof band/);

	const crumbed = page();
	crumbed.html = crumbed.html.replace('<section data-use-case-hero', '<nav aria-label="breadcrumb">Home</nav><section data-use-case-hero');
	assert.match(useCasePageIssues(crumbed, spec).join('\n'), /breadcrumb/);
});

test('the back link closes the page, naming the home cards', () => {
	const missing = page();
	missing.html = missing.html.replace(`>${backLinkText}<`, '>Back<');
	assert.match(useCasePageIssues(missing, spec).join('\n'), /no `← All use cases` link/);

	const astray = page();
	astray.html = astray.html.replace(`href="${backLinkHref}"`, 'href="/"');
	assert.match(useCasePageIssues(astray, spec).join('\n'), /no `← All use cases` link/);
});

test('the head states the §2.6 description and the og pair', () => {
	const described = page();
	described.html = described.html.replaceAll(spec.description, 'Agents in your product.');
	assert.match(headIssues(described, { description: spec.description, title }).join('\n'), /meta description is not the §2\.6 line verbatim/);
	assert.match(headIssues(described, { description: spec.description, title }).join('\n'), /og:description is not the §2\.6 line verbatim/);

	const ogTitled = page();
	ogTitled.html = ogTitled.html.replace(`content="${title}"`, 'content="Agents — Oribos"');
	assert.match(headIssues(ogTitled, { description: spec.description, title }).join('\n'), /og:title is `Agents — Oribos`/);
});

test('the head comparisons read attribute values decoded, as Astro emits them', () => {
	const infra = useCasePages[2]!;
	const infraTitle = `${infra.h1} — Oribos`;
	const built = page(infra);
	built.html = built.html.replaceAll(infraTitle, infraTitle.replace('&', '&amp;'));
	assert.ok(built.html.includes('content="Platform &amp; developer infra — Oribos"'));
	assert.deepEqual(useCasePageIssues(built, infra), []);
	assert.deepEqual(headIssues(built, { description: infra.description, title: infraTitle }), []);
});

test('the scenario prose holds the vocabulary, the red lines and the package scope', () => {
	const session = page();
	session.html = session.html.replace('picks up where they left off', 'keeps a session per user');
	assert.match(useCasePageIssues(session, spec).join('\n'), /reads `session`.*never a session/);

	const foreign = page();
	foreign.html = foreign.html.replace('@oribos/ai-sdk</code>', '@ai-sdk/react</code>');
	assert.match(useCasePageIssues(foreign, spec).join('\n'), /`@ai-sdk\/react` is not a `@oribos\/` package/);

	const counted = page();
	counted.html = counted.html.replace('plain objects with schemas', 'five fields with schemas');
	assert.match(useCasePageIssues(counted, spec).join('\n'), /`five fields`/);
});

test('text comes only from the audited roles on the page background', () => {
	const offRole = page();
	offRole.html = offRole.html.replace('text-base text-ink2', 'text-base text-acc-lo');
	assert.match(useCaseColourIssues(offRole).join('\n'), /`text-acc-lo`/);

	const surfaced = page();
	surfaced.html = surfaced.html.replace(
		'class="border-t border-line px-6 py-20">\n\t\t<div class="mx-auto max-w-5xl">\n\t\t\t<ul',
		'class="border-t border-line bg-bg2 px-6 py-20">\n\t\t<div class="mx-auto max-w-5xl">\n\t\t\t<ul',
	);
	assert.match(useCaseColourIssues(surfaced).join('\n'), /paints its own surface/);
});

test('the package chip pair clears AA on the shipped token layer, both themes', () => {
	const { tokens, errors } = parseLandingTokens(globalCss);
	assert.deepEqual(errors, []);
	assert.deepEqual(scenarioContrastIssues(tokens), []);

	const dimmed = { ...tokens, light: { ...tokens.light, '--ink2': '#a0a09c' } };
	const muted = scenarioContrastIssues(dimmed);
	assert.equal(muted.length, 1);
	assert.match(muted[0]!, /light: package chip text on its surface/);
});
