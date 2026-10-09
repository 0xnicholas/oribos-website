import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LINKS } from './links.ts';
import {
	aboutEntryIssues,
	aboutPageIssues,
	aboutSpec,
	backLinkText,
	carriesTextPage,
	lastUpdatedIssues,
	legalPageIssues,
	legalPageSpecs,
	maintainerLabel,
	type AboutPageSpec,
	type LegalPageSpec,
	type TextPage,
} from './text-page-rules.ts';

const aboutHtml = (spec: AboutPageSpec, { closingGitHub = LINKS.github, closingIssues = LINKS.issues }: { closingGitHub?: string; closingIssues?: string } = {}): string =>
	`<main>
		<section data-about-hero class="px-6 py-16">
			<div class="mx-auto max-w-3xl">
				<h1 class="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">${spec.h1}</h1>
				<p data-about-tagline class="mt-5 text-lg text-ink2">${spec.tagline}</p>
			</div>
		</section>
		<section data-about-story class="border-t border-line px-6 py-20">
			<div class="mx-auto max-w-3xl">
				<h2 class="text-2xl font-semibold tracking-tight text-ink">${spec.storyHeading}</h2>
				${spec.story.map((paragraph) => `<p class="mt-4 text-ink2">${paragraph}</p>`).join('')}
			</div>
		</section>
		<section data-about-behind class="border-t border-line px-6 py-20">
			<div class="mx-auto max-w-3xl">
				<h2 class="text-2xl font-semibold tracking-tight text-ink">${spec.behindHeading}</h2>
				<p class="mt-4 text-ink2">Oribos is built in the open on GitHub and maintained by <a href="${LINKS.maintainer}" class="text-acc hover:underline">${maintainerLabel}</a>. There is no company behind it and no team page to read: the repository's issues are where questions, bug reports and disagreement land.</p>
				<p class="mt-4 text-ink2">${spec.behind[1]}</p>
			</div>
		</section>
		<section data-about-closing class="border-t border-line px-6 py-20">
			<div class="mx-auto max-w-3xl">
				<h2 class="text-2xl font-semibold tracking-tight text-ink">${spec.closing.lead}</h2>
				<p class="mt-3 text-ink2">${spec.closing.sub}</p>
				<p class="mt-6 flex gap-4">
					<a href="${closingGitHub}" class="font-semibold text-acc hover:underline">GitHub</a>
					<a href="${closingIssues}" class="font-semibold text-acc hover:underline">Issues</a>
				</p>
			</div>
		</section>
		<section data-about-back class="border-t border-line px-6 py-12">
			<div class="mx-auto max-w-3xl">
				<a href="/" class="text-base font-semibold text-acc hover:underline">${backLinkText}</a>
			</div>
		</section>
	</main>`;

const aboutPage = (spec: AboutPageSpec = aboutSpec, options?: Parameters<typeof aboutHtml>[1]): TextPage => ({
	path: 'about/index.html',
	html: `<html lang="en"><head><title>About — Oribos</title></head><body>
		<header><a href="/">Oribos</a></header>
		${aboutHtml(spec, options)}
		<footer><a href="/">Oribos</a></footer>
	</body></html>`,
});

const legalHtml = (spec: LegalPageSpec, lastUpdated: string): string =>
	`<main>
		<section data-legal-page class="px-6 py-16">
			<div class="mx-auto max-w-3xl">
				<h1 class="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">${spec.h1}</h1>
				<p data-legal-updated class="mt-4 text-xs text-ink3">Last updated: ${lastUpdated}</p>
				<div data-legal-body class="mt-8 flex flex-col gap-4">
					${spec.paragraphs.map((paragraph) => `<p class="text-ink2">${paragraph.replace('in the repository.', `in the <a href="${LINKS.issues}" class="text-acc hover:underline">repository</a>.`)}</p>`).join('')}
				</div>
			</div>
		</section>
	</main>`;

const legalPage = (spec: LegalPageSpec, lastUpdated = 'October 3, 2026'): TextPage => ({
	path: `${spec.route.slice(1)}index.html`,
	html: `<html lang="en"><head><title>${spec.h1} — Oribos</title></head><body>
		<header><a href="/">Oribos</a></header>
		${legalHtml(spec, lastUpdated)}
		<footer><a href="/">Oribos</a></footer>
	</body></html>`,
});

test('the /about page carrying the §4.1 skeleton and the locked copy passes every rule', () => {
	const page = aboutPage();
	assert.deepEqual(aboutPageIssues(page), []);
	assert.ok(carriesTextPage(page.html));
});

test('each legal page carrying the §4.2 stub passes every rule, and the two dates agree', () => {
	for (const spec of legalPageSpecs) {
		const page = legalPage(spec);
		assert.deepEqual(legalPageIssues(page, spec), [], spec.route);
		assert.ok(carriesTextPage(page.html));
	}
	const [privacy, terms] = legalPageSpecs.map((spec) => legalPage(spec));
	assert.deepEqual(lastUpdatedIssues(privacy!, terms!), []);
});

/* ---------------------------------------------------------------- /about mutations */

const mutateAbout = (find: string, replace: string): TextPage => {
	const page = aboutPage();
	assert.ok(page.html.includes(find), `fixture carries ${find}`);
	return { ...page, html: page.html.replace(find, replace) };
};

test('/about: the H1 must read `About Oribos`', () => {
	const issues = aboutPageIssues(mutateAbout(aboutSpec.h1, 'About us'));
	assert.ok(issues.some((issue) => issue.includes('the H1 reads `About us`')));
});

test('/about: the sub is the public tagline verbatim', () => {
	const issues = aboutPageIssues(mutateAbout(aboutSpec.tagline, 'The ultralight agent framework.'));
	assert.ok(issues.some((issue) => issue.includes('the sub is not the public tagline verbatim')));
});

test('/about: Our story is the locked copy, in order', () => {
	const drift = aboutPageIssues(mutateAbout('under one package scope and one domain.', 'under one package scope.'));
	assert.ok(drift.some((issue) => issue.includes('Our story paragraph 2 is not the §4.1 copy verbatim')));

	const page = aboutPage();
	const swapped = {
		...page,
		html: page.html.replace(
			`<p class="mt-4 text-ink2">${aboutSpec.story[0]}</p>`,
			`<p class="mt-4 text-ink2">${aboutSpec.story[1]}</p>`,
		),
	};
	assert.ok(aboutPageIssues(swapped).some((issue) => issue.includes('paragraph 1 is not the §4.1 copy verbatim')));
});

test('/about: the signature is one `@0xnicholas` link to the maintainer profile', () => {
	const unlinked = aboutPageIssues(mutateAbout(`<a href="${LINKS.maintainer}" class="text-acc hover:underline">${maintainerLabel}</a>`, maintainerLabel));
	assert.ok(unlinked.some((issue) => issue.includes('the signature is not one `@0xnicholas` link')));

	const elsewhere = aboutPageIssues(mutateAbout(`href="${LINKS.maintainer}"`, `href="${LINKS.github}"`));
	assert.ok(elsewhere.some((issue) => issue.includes('the signature is not one `@0xnicholas` link')));
});

test('/about: the invitation band carries the GitHub · Issues pair, exactly two links', () => {
	const wrongTarget = aboutPageIssues(aboutPage(aboutSpec, { closingGitHub: 'https://github.com/0xnicholas' }));
	assert.ok(wrongTarget.some((issue) => issue.includes('the invitation band\'s GitHub link')));

	const page = aboutPage();
	const extra = {
		...page,
		html: page.html.replace(
			`<a href="${LINKS.issues}" class="font-semibold text-acc hover:underline">Issues</a>`,
			`<a href="${LINKS.issues}" class="font-semibold text-acc hover:underline">Issues</a> <a href="${LINKS.docs}" class="font-semibold text-acc hover:underline">Docs</a>`,
		),
	};
	const issues = aboutPageIssues(extra);
	assert.ok(issues.some((issue) => issue.includes('the invitation band carries 3 links')));
});

test('/about: the page ends with one `← Home` link', () => {
	const missing = aboutPageIssues(mutateAbout(`<a href="/" class="text-base font-semibold text-acc hover:underline">${backLinkText}</a>`, ''));
	assert.ok(missing.some((issue) => issue.includes('does not end with one `← Home` link')));

	const retext = aboutPageIssues(mutateAbout(backLinkText, '← Back'));
	assert.ok(retext.some((issue) => issue.includes('does not end with one `← Home` link')));
});

test('/about: the skeleton keeps its order', () => {
	const page = aboutPage();
	const story = page.html.match(/<section data-about-story[\s\S]*?<\/section>/)![0];
	const behind = page.html.match(/<section data-about-behind[\s\S]*?<\/section>/)![0];
	const swapped = { ...page, html: page.html.replace(story, '<!-- story -->').replace(behind, story).replace('<!-- story -->', behind) };
	assert.ok(aboutPageIssues(swapped).some((issue) => issue.includes('the skeleton is out of order')));
});

test('/about: no years outside the `© 2026` license line', () => {
	const issues = aboutPageIssues(mutateAbout('The project exists for one bet', 'Founded in 2026, the project exists for one bet'));
	assert.ok(issues.some((issue) => issue.includes('no years outside the `© 2026` license line')));
});

test('/about: no ADR numbers, issue numbers, email or careers content', () => {
	const adr = aboutPageIssues(mutateAbout('The project exists for one bet', 'Per ADR-0013, the project exists for one bet'));
	assert.ok(adr.some((issue) => issue.includes('no ADR numbers or issue numbers')));

	const ticket = aboutPageIssues(mutateAbout('The project exists for one bet', 'Per #30, the project exists for one bet'));
	assert.ok(ticket.some((issue) => issue.includes('no ADR numbers or issue numbers')));

	const email = aboutPageIssues(mutateAbout('maintained by', 'maintained by hello@oribos.dev and'));
	assert.ok(email.some((issue) => issue.includes('no email')));

	const careers = aboutPageIssues(mutateAbout('Read the code, open an issue.', 'Read the code, open an issue. See our careers page.'));
	assert.ok(careers.some((issue) => issue.includes('no careers / funding content')));
});

test('/about: no mailto and no external link beyond the handle, GitHub and Issues', () => {
	const mailto = aboutPageIssues(mutateAbout(`href="${LINKS.maintainer}"`, 'href="mailto:hello@oribos.dev"'));
	assert.ok(mailto.some((issue) => issue.includes('no email surface')));

	const docs = aboutPageIssues(mutateAbout(`<a href="${LINKS.github}" class="font-semibold text-acc hover:underline">GitHub</a>`, `<a href="https://github.com/0xnicholas/oribos-website" class="font-semibold text-acc hover:underline">GitHub</a>`));
	assert.ok(docs.some((issue) => issue.includes("/about's own links are the handle, GitHub and Issues")));
});

test('/about: a missing section is a finding of its own', () => {
	for (const marker of ['data-about-hero', 'data-about-story', 'data-about-behind', 'data-about-closing', 'data-about-back']) {
		const page = aboutPage();
		const section = page.html.match(new RegExp(`<section ${marker}[\\s\\S]*?</section>`))![0];
		const without = { ...page, html: page.html.replace(section, '') };
		assert.ok(aboutPageIssues(without).length > 0, marker);
	}
});

/* ---------------------------------------------------------------- legal mutations */

const privacySpec = legalPageSpecs[0]!;
const termsSpec = legalPageSpecs[1]!;

const mutateLegal = (spec: LegalPageSpec, find: string, replace: string, lastUpdated = 'October 3, 2026'): TextPage => {
	const page = legalPage(spec, lastUpdated);
	assert.ok(page.html.includes(find), `fixture carries ${find}`);
	return { ...page, html: page.html.replace(find, replace) };
};

test('legal: a drifted H1 or paragraph is a finding', () => {
	const h1 = legalPageIssues(mutateLegal(privacySpec, `${privacySpec.h1}</h1>`, 'Privacy notice</h1>'), privacySpec);
	assert.ok(h1.some((issue) => issue.includes('the H1 reads `Privacy notice`')));

	const paragraph = legalPageIssues(mutateLegal(privacySpec, 'sets no cookies', 'sets almost no cookies'), privacySpec);
	assert.ok(paragraph.some((issue) => issue.includes('paragraph 1 is not the §4.2 copy verbatim')));
});

test('legal: the paragraphs sit in their own `data-legal-body` container', () => {
	const issues = legalPageIssues(mutateLegal(privacySpec, '<div data-legal-body class="mt-8 flex flex-col gap-4">', '<div class="mt-8 flex flex-col gap-4">'), privacySpec);
	assert.ok(issues.some((issue) => issue.includes('no `data-legal-body` block')));
});

test('legal: the `Last updated` line is present, static-shaped and shared', () => {
	const missing = legalPageIssues(mutateLegal(privacySpec, '<p data-legal-updated class="mt-4 text-xs text-ink3">Last updated: October 3, 2026</p>', ''), privacySpec);
	assert.ok(missing.some((issue) => issue.includes('no `Last updated` line')));

	const dynamic = legalPageIssues(legalPage(privacySpec, '2026-10-03'), privacySpec);
	assert.ok(dynamic.some((issue) => issue.includes('`Last updated: 2026-10-03`')));

	const mismatch = lastUpdatedIssues(legalPage(privacySpec, 'October 3, 2026'), legalPage(termsSpec, 'October 4, 2026'));
	assert.ok(mismatch.some((issue) => issue.includes('the legal pages disagree on the date')));
});

test('legal: the contact channel is one `repository` link to GitHub Issues', () => {
	const github = legalPageIssues(mutateLegal(privacySpec, `href="${LINKS.issues}"`, `href="${LINKS.github}"`), privacySpec);
	assert.ok(github.some((issue) => issue.includes('the contact link is not one `repository` link')));
	assert.ok(github.some((issue) => issue.includes("the stub's only external link is the Issues contact")));

	const mailto = legalPageIssues(mutateLegal(privacySpec, `href="${LINKS.issues}"`, 'href="mailto:hello@oribos.dev"'), privacySpec);
	assert.ok(mailto.some((issue) => issue.includes('no email surface')));
});

test('legal: no jurisdiction / liability / termination clause and no named hosting platform', () => {
	const clause = legalPageIssues(mutateLegal(termsSpec, 'provided as-is', 'provided as-is under the governing law of Delaware'), termsSpec);
	assert.ok(clause.some((issue) => issue.includes('no jurisdiction / liability / termination clauses')));

	const host = legalPageIssues(mutateLegal(privacySpec, 'Our hosting provider', 'Vercel'), privacySpec);
	assert.ok(host.some((issue) => issue.includes('the hosting platform stays `our hosting provider`')));
});

test('legal: the terms page holds the same rules', () => {
	const paragraph = legalPageIssues(mutateLegal(termsSpec, 'provided as-is, without warranties', 'provided as-is, with warranties'), termsSpec);
	assert.ok(paragraph.some((issue) => issue.includes('paragraph 1 is not the §4.2 copy verbatim')));
});

/* ---------------------------------------------------------------- the /about entry */

test('/about enters through the footer only — no page body links it', () => {
	const clean: TextPage = {
		path: 'index.html',
		html: '<main><a href="/#use-cases">Use cases</a></main><footer><a href="/about/">About</a></footer>',
	};
	assert.deepEqual(aboutEntryIssues([clean]), []);

	const linked: TextPage = {
		path: 'index.html',
		html: '<main><a href="/about/">About the project</a></main><footer><a href="/about/">About</a></footer>',
	};
	const other: TextPage = {
		path: 'ai-agents/index.html',
		html: '<main><a href="/about/">About the project</a></main>',
	};
	for (const page of [linked, other]) {
		assert.ok(
			aboutEntryIssues([clean, page]).some((issue) => issue.includes("/about's only entry is the footer Project column")),
			page.path,
		);
	}
});

