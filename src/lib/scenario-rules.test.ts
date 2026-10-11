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

/**
 * The header mock's shape as the §5.1 gate reads it — a `data-mock-window` box standing in for
 * the §3.5 mocks, with the accent button's inverted label (the role the page's colour scan must
 * leave to the mock audit) inside.
 */
const mockWindow = `
			<div class="overflow-hidden box bg-bg2" data-mock-window>
				<div class="flex items-center gap-3 border-b border-line px-4 py-2.5" data-mock-bar><span class="flex gap-1.5" aria-hidden="true"><i class="size-2.5 rounded-full bg-ink3"></i><i class="size-2.5 rounded-full bg-ink3"></i><i class="size-2.5 rounded-full bg-ink3"></i></span></div>
				<div class="p-4"><span class="bg-acc px-2.5 py-1 text-xs font-semibold text-acc-inv" data-mock-action="approve">Approve</span></div>
			</div>`;

const headerMock = (kind: string, window: string = mockWindow) => `
		<figure data-use-case-mock="${kind}" class="mx-auto mt-12 max-w-2xl">
			${window}
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

const page = (entry: UseCasePageSpec = spec, options: { mock?: string } = {}): ScenarioPage => ({
	path: `${entry.route.slice(1)}index.html`,
	html: `<html lang="en"><head>
		<title>${entry.h1} — Oribos</title>
		<meta name="description" content="${entry.description}" />
		<meta property="og:title" content="${entry.h1} — Oribos" />
		<meta property="og:description" content="${entry.description}" />
	</head><body>
	<section data-use-case-hero class="px-6 py-18">
		<div class="mx-auto flex max-w-3xl flex-col items-center text-center">
			<h1 class="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">${entry.h1}</h1>
			<p data-use-case-tagline class="mt-5 max-w-2xl text-lg text-ink2">${entry.tagline}</p>
		</div>
		${options.mock ?? headerMock(entry.mock)}
	</section>
	<section data-scenarios class="border-t border-line py-24">
		<div class="wrap">
			<ul class="grid gap-6 md:grid-cols-3">
				${entry.scenarios.map(cardHtml).join('')}
			</ul>
		</div>
	</section>
	<section id="faq" data-faq class="border-t border-line px-6 py-24"><h2>Frequently asked questions</h2></section>
	<section id="get-started" class="border-t border-line px-6 py-24"><h2>Build ultralight AI agents.</h2></section>
	<section data-use-case-back class="border-t border-line py-12">
		<div class="wrap">
			<a href="${backLinkHref}" class="text-base font-semibold text-acc hover:underline">${backLinkText}</a>
		</div>
	</section>
</body></html>`,
});

test('a use-case page with the §5.1 skeleton passes every rule', () => {
	const built = page();
	assert.deepEqual(useCasePageIssues(built, spec), []);
	assert.deepEqual(headIssues(built, { description: spec.description, title }), []);
	assert.deepEqual(useCaseColourIssues(built), []);
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

test('the page head carries the one host-interface mock, mapped per page (SPEC-revamp §5.1)', () => {
	const missing = page(spec, { mock: '' });
	assert.match(useCasePageIssues(missing, spec).join('\n'), /no header mock/);

	const doubled = page(spec, { mock: headerMock(spec.mock) + headerMock(spec.mock) });
	assert.match(useCasePageIssues(doubled, spec).join('\n'), /2 header mocks/);

	const swapped = page(spec, { mock: headerMock('thread') });
	assert.match(useCasePageIssues(swapped, spec).join('\n'), /the header mock is `thread`, expected `chat`/);

	const outside = page(spec, { mock: '' });
	outside.html = outside.html.replace('<section data-scenarios', `${headerMock(spec.mock)}\n\t<section data-scenarios`);
	assert.match(useCasePageIssues(outside, spec).join('\n'), /sits outside the page head/);

	const above = page(spec, { mock: '' });
	above.html = above.html.replace('<p data-use-case-tagline', `${headerMock(spec.mock)}\n\t\t\t<p data-use-case-tagline`);
	assert.match(useCasePageIssues(above, spec).join('\n'), /does not follow the tagline/);

	const twoWindows = page(spec, { mock: headerMock(spec.mock, mockWindow + mockWindow) });
	assert.match(useCasePageIssues(twoWindows, spec).join('\n'), /carries 2 mock windows/);

	const unboxed = page(spec, { mock: headerMock(spec.mock, mockWindow.replace('overflow-hidden box bg-bg2', 'overflow-hidden bg-bg2')) });
	assert.match(useCasePageIssues(unboxed, spec).join('\n'), /box hairline frame/);

	const surfaceless = page(spec, { mock: headerMock(spec.mock, mockWindow.replace('overflow-hidden box bg-bg2', 'overflow-hidden box')) });
	assert.match(useCasePageIssues(surfaceless, spec).join('\n'), /no surface/);
});

test('the retired shared header art is a tombstone (SPEC-revamp §5.1)', () => {
	const art = page();
	art.html = art.html.replace(
		'<section data-use-case-hero',
		'<figure data-use-case-art aria-hidden="true"><svg viewBox="0 0 1600 600"></svg></figure>\n\t<section data-use-case-hero',
	);
	assert.match(useCasePageIssues(art, spec).join('\n'), /the retired shared header art/);
});

test('the skeleton order is page head → cards → FAQ → final CTA → back link (SPEC-revamp §5.1)', () => {
	// The retired mid-page CTA position — the band between the cards and the FAQ — is a finding.
	const midCta = page();
	const cta = midCta.html.match(/<section id="get-started"[\s\S]*?<\/section>/)![0];
	const faq = midCta.html.match(/<section id="faq"[\s\S]*?<\/section>/)![0];
	midCta.html = midCta.html.replace(faq, '').replace(cta, `${cta}\n\t${faq}`);
	assert.match(useCasePageIssues(midCta, spec).join('\n'), /out of order/);

	const scrambled = page();
	const back = scrambled.html.match(/<section data-use-case-back[\s\S]*?<\/section>/)![0];
	scrambled.html = scrambled.html.replace(back, '').replace('<section data-scenarios', `${back}\n\t<section data-scenarios`);
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

	// The header mock's decorative UI text is the §3.5 gate's subject, not page prose.
	const chatty = page(spec, { mock: headerMock(spec.mock, mockWindow.replace('>Approve<', '>A session per user<')) });
	assert.deepEqual(useCasePageIssues(chatty, spec), []);
});

test('text comes only from the audited roles on the page background', () => {
	const offRole = page();
	offRole.html = offRole.html.replace('text-base text-ink2', 'text-base text-acc-lo');
	assert.match(useCaseColourIssues(offRole).join('\n'), /`text-acc-lo`/);

	const surfaced = page();
	surfaced.html = surfaced.html.replace(
		'class="border-t border-line py-24">\n\t\t<div class="wrap">\n\t\t\t<ul',
		'class="border-t border-line bg-bg2 py-24">\n\t\t<div class="wrap">\n\t\t\t<ul',
	);
	assert.match(useCaseColourIssues(surfaced).join('\n'), /paints its own surface/);

	// The mock's own roles — the accent button's inverted label — are the §3.5 audit's pairs:
	// the fixture's mock carries `text-acc-inv` and clears this scan.
	assert.deepEqual(useCaseColourIssues(page()), []);
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
