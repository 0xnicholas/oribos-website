/**
 * The text pages (SPEC §4.1/§4.2) over the built site: `/about` — the H1 plus the public
 * tagline, Our story ×2, Who's behind it (signed to the `@0xnicholas` handle, never a real
 * name or an email), the closing invitation band with its GitHub · Issues pair, and the one
 * back-to-home link — and the two one-screen legal stubs, each carrying the same static
 * `Last updated` line and its locked paragraphs, promising nothing the project does not have
 * (no jurisdiction, no liability or termination clause, no named hosting platform, GitHub
 * Issues as the only contact channel).
 *
 * Like the hero, feature, band, FAQ, scenario and keyword rules, the strings here are the
 * spec's copy — deliberately not read from the content collections that render them, so the
 * page and its gate cannot agree by construction. The `Last updated` date is the exception:
 * the ticket pins its shape and its sameness across the two pages, not its value — the launch
 * day edits exactly one string in src/content/legal-meta/ (ticket #30).
 */

import { sectionColourIssues } from './colour-rules.ts';
import { redLineRules, ruleMatches } from './copy-rules.ts';
import { elementOf, linksOf, markersInOrder, tagsOf, textOf } from './html.ts';
import { LINKS } from './links.ts';
import { routeOf } from './link-rules.ts';

export type TextPage = { path: string; html: string };

export type AboutPageSpec = {
	/** The page's route (SPEC §2.1), trailing slash as the registry spells it. */
	route: string;
	/** SPEC §4.1: the H1. */
	h1: string;
	/** SPEC §4.1: the sub is the footer brand block's line, verbatim (SPEC §2.3 【终稿·勿改】). */
	tagline: string;
	/** The §4.1 section headings and their locked paragraphs, in page order. */
	storyHeading: string;
	story: readonly string[];
	behindHeading: string;
	/** Plain-text renderings — the maintainer link's label sits inside paragraph one. */
	behind: readonly string[];
	/** The closing invitation band (SPEC §4.1 【终稿·勿改】). */
	closing: { lead: string; sub: string };
	/** The §2.6 meta description — og:description reuses it. */
	description: string;
};

export type LegalPageSpec = {
	route: string;
	h1: string;
	/** The locked stub paragraphs, in page order (SPEC §4.2 【终稿·勿改】). */
	paragraphs: readonly string[];
	description: string;
};

/** SPEC §4.1: the signature stops at the GitHub handle. */
export const maintainerLabel = '@0xnicholas';

/** SPEC §4.1/§2.5: the back-to-home link's text【SPEC 起草·可润色】. */
export const backLinkText = '← Home';

/** SPEC §4.2: the `Last updated` line's shape — a static string, never a build-time date. */
export const lastUpdatedPattern = /^Last updated: [A-Z][a-z]+ \d{1,2}, \d{4}$/;

/** SPEC §4.1 + §2.6: the /about page's locked copy. */
export const aboutSpec: AboutPageSpec = {
	route: '/about/',
	h1: 'About Oribos',
	tagline: 'Ultralight TypeScript agent framework. Compose only what you use — run anywhere, no runtime baggage.',
	storyHeading: 'Our story',
	story: [
		'The project exists for one bet — that an agent framework should be a library inside your application, not a platform your application moves into. So every subsystem ships behind its own entry point, the core carries no runtime dependencies, and nothing here needs a database, a queue or a long-running process.',
		'Oribos is the umbrella brand. The framework came first, the documentation site is next, and future subprojects live alongside them — under one package scope and one domain.',
	],
	behindHeading: "Who's behind it",
	behind: [
		`Oribos is built in the open on GitHub and maintained by ${maintainerLabel}. There is no company behind it and no team page to read: the repository's issues are where questions, bug reports and disagreement land.`,
		'Code and examples are licensed Apache-2.0 — that license covers code, not the name. Site copy and graphics are © 2026 Oribos, all rights reserved.',
	],
	closing: {
		lead: 'Read the code, open an issue.',
		sub: 'Star or watch the repository to follow releases.',
	},
	description: 'About Oribos — why the project exists, who maintains it, and how code and content are licensed.',
};

/** SPEC §4.2 + §2.6: the two legal stubs' locked copy, in §2.1 page order. */
export const legalPageSpecs: readonly LegalPageSpec[] = [
	{
		route: '/privacy-policy/',
		h1: 'Privacy policy',
		paragraphs: [
			"Oribos's marketing site is a static site. It has no accounts, sets no cookies and runs no tracking, and we do not collect or store personal information about you.",
			'Our hosting provider serves the site and may keep standard server logs — IP address, user agent, requested URL — for security and operations, under its own policies. We do not sell or share personal data, so there is nothing here to opt out of.',
			"If you reach us through GitHub, what you send is handled by GitHub under GitHub's terms. Questions and requests: open an issue in the repository.",
			'If analytics or an email subscription is added later, this page will say exactly what is collected and by whom before it goes live.',
		],
		description:
			'Privacy policy for the Oribos marketing site: a static site with no accounts, no cookies and no tracking.',
	},
	{
		route: '/terms-of-service/',
		h1: 'Terms of service',
		paragraphs: [
			'This site is provided as-is, without warranties of any kind. It describes an open-source project that is pre-1.0: what you read here can change.',
			'Code and examples in the Oribos project are licensed under Apache-2.0 — that license covers code, and does not grant rights to the Oribos name or logo. Site copy and graphics are © 2026 Oribos, all rights reserved.',
			'Links to third-party sites are here for convenience; those sites are governed by their own terms. Questions: open an issue in the repository.',
		],
		description:
			'Terms of service for the Oribos website and project: pre-1.0, provided as-is, code under Apache-2.0.',
	},
];

/* ---------------------------------------------------------------- reading the page */

const aboutMarkers = ['data-about-hero', 'data-about-story', 'data-about-behind', 'data-about-closing', 'data-about-back'] as const;

/** Whether a built page is a text page — `check-text-pages.mjs`'s stray-page filter. */
export function carriesTextPage(html: string): boolean {
	return elementOf(html, 'section', 'data-about-hero') !== null || elementOf(html, 'section', 'data-legal-page') !== null;
}

function heroOf(html: string): string | null {
	return elementOf(html, 'section', 'data-about-hero');
}

function storyOf(html: string): string | null {
	return elementOf(html, 'section', 'data-about-story');
}

function behindOf(html: string): string | null {
	return elementOf(html, 'section', 'data-about-behind');
}

function closingOf(html: string): string | null {
	return elementOf(html, 'section', 'data-about-closing');
}

function backOf(html: string): string | null {
	return elementOf(html, 'section', 'data-about-back');
}

function legalOf(html: string): string | null {
	return elementOf(html, 'section', 'data-legal-page');
}

/** The paragraphs of a section, in document order. */
function paragraphsOf(section: string): string[] {
	return [...section.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => match[1]!);
}

/**
 * The rendered prose of a fragment: `textOf`, plus the space a tag boundary leaves before
 * punctuation (`repository</a>.`) folded back — the browser renders no space there, and the
 * comparison is against the copy's spelling.
 */
function proseOf(html: string): string {
	return textOf(html).replace(/\s+([.,;:!?])/g, '$1');
}

/** The page's own copy regions — everything but the header and the footer. */
function ownRegionsOf(html: string): string[] {
	return [heroOf(html), storyOf(html), behindOf(html), closingOf(html), backOf(html), legalOf(html)].filter(
		(region): region is string => region !== null,
	);
}

/* ---------------------------------------------------------------- /about */

/** SPEC §4.1: the four-section skeleton, the verbatim copy, the links and the page's red lines. */
export function aboutPageIssues(page: TextPage, spec: AboutPageSpec = aboutSpec): string[] {
	const issues: string[] = [];

	issues.push(...aboutHeroIssues(page, spec));
	issues.push(...aboutStoryIssues(page, spec));
	issues.push(...aboutBehindIssues(page, spec));
	issues.push(...aboutClosingIssues(page, spec));
	issues.push(...aboutBackIssues(page));
	if (!markersInOrder(page.html, aboutMarkers)) {
		issues.push(`${page.path}: the skeleton is out of order — H1 → Our story → Who's behind it → the invitation band → back home (SPEC §4.1)`);
	}
	issues.push(...aboutRedLineIssues(page));

	return issues;
}

/** SPEC §4.1: the page opens with its H1 and the public tagline, once. */
function aboutHeroIssues(page: TextPage, spec: AboutPageSpec): string[] {
	const hero = heroOf(page.html);
	if (hero === null) {
		return [`${page.path}: no about hero — the page opens with its H1 and the public tagline (SPEC §4.1)`];
	}

	const issues: string[] = [];
	const h1s = tagsOf(page.html, 'h1');
	if (h1s.length !== 1) {
		issues.push(`${page.path}: the page carries ${h1s.length} <h1> — /about's H1 is its one headline (SPEC §4.1)`);
	}

	const h1 = hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
	if (h1 === undefined || textOf(h1) !== spec.h1) {
		issues.push(`${page.path}: the H1 reads \`${h1 === undefined ? 'nothing' : textOf(h1)}\`, expected \`${spec.h1}\` (SPEC §4.1)`);
	}

	const tagline = hero.match(/<p\b[^>]*\bdata-about-tagline\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	if (tagline === undefined || textOf(tagline) !== spec.tagline) {
		issues.push(`${page.path}: the sub is not the public tagline verbatim — /about reuses the footer brand block's line (SPEC §4.1/§2.3)`);
	}

	return issues;
}

/** SPEC §4.1: Our story — the heading and its two paragraphs, verbatim and in order. */
function aboutStoryIssues(page: TextPage, spec: AboutPageSpec): string[] {
	const section = storyOf(page.html);
	if (section === null) {
		return [`${page.path}: no Our story section (SPEC §4.1)`];
	}

	const issues: string[] = [];
	const heading = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
	if (heading === undefined || textOf(heading) !== spec.storyHeading) {
		issues.push(
			`${page.path}: the story heading reads \`${heading === undefined ? 'nothing' : textOf(heading)}\`, expected \`${spec.storyHeading}\` (SPEC §4.1)`,
		);
	}

	const paragraphs = paragraphsOf(section).map(proseOf);
	if (paragraphs.length !== spec.story.length) {
		issues.push(`${page.path}: Our story carries ${paragraphs.length} paragraph(s), expected ${spec.story.length} (SPEC §4.1)`);
	}
	paragraphs.forEach((paragraph, index) => {
		if (paragraph !== spec.story[index]) {
			issues.push(`${page.path}: Our story paragraph ${index + 1} is not the §4.1 copy verbatim`);
		}
	});

	return issues;
}

/** SPEC §4.1: Who's behind it — two paragraphs verbatim; the signature is the handle, linked. */
function aboutBehindIssues(page: TextPage, spec: AboutPageSpec): string[] {
	const section = behindOf(page.html);
	if (section === null) {
		return [`${page.path}: no Who's behind it section (SPEC §4.1)`];
	}

	const issues: string[] = [];
	const heading = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
	if (heading === undefined || textOf(heading) !== spec.behindHeading) {
		issues.push(
			`${page.path}: the section heading reads \`${heading === undefined ? 'nothing' : textOf(heading)}\`, expected \`${spec.behindHeading}\` (SPEC §4.1)`,
		);
	}

	const paragraphs = paragraphsOf(section).map(proseOf);
	if (paragraphs.length !== spec.behind.length) {
		issues.push(`${page.path}: Who's behind it carries ${paragraphs.length} paragraph(s), expected ${spec.behind.length} (SPEC §4.1)`);
	}
	paragraphs.forEach((paragraph, index) => {
		if (paragraph !== spec.behind[index]) {
			issues.push(`${page.path}: Who's behind it paragraph ${index + 1} is not the §4.1 copy verbatim`);
		}
	});

	const links = linksOf(section);
	const signature = links.filter((link) => link.text === maintainerLabel);
	if (signature.length !== 1 || signature[0]!.href !== LINKS.maintainer) {
		issues.push(
			`${page.path}: the signature is not one \`${maintainerLabel}\` link to ${LINKS.maintainer} — attribution stops at the GitHub handle (SPEC §4.1)`,
		);
	}
	for (const link of links) {
		if (link.text !== maintainerLabel) {
			issues.push(`${page.path}: Who's behind it links \`${link.text}\` — the section's only link is the maintainer handle (SPEC §4.1)`);
		}
	}

	return issues;
}

/** SPEC §4.1/§6.1: the closing invitation band — the locked lines and the GitHub · Issues pair. */
function aboutClosingIssues(page: TextPage, spec: AboutPageSpec): string[] {
	const section = closingOf(page.html);
	if (section === null) {
		return [`${page.path}: no closing invitation band (SPEC §4.1)`];
	}

	const issues: string[] = [];
	const text = textOf(section);
	if (!text.includes(spec.closing.lead) || !text.includes(spec.closing.sub)) {
		issues.push(`${page.path}: the invitation band is not the §4.1 copy verbatim (\`${spec.closing.lead}\` / \`${spec.closing.sub}\`)`);
	}

	const links = linksOf(section);
	const github = links.filter((link) => link.text === 'GitHub');
	if (github.length !== 1 || github[0]!.href !== LINKS.github) {
		issues.push(`${page.path}: the invitation band's GitHub link does not target ${LINKS.github} (SPEC §6.1)`);
	}
	const issuesLink = links.filter((link) => link.text === 'Issues');
	if (issuesLink.length !== 1 || issuesLink[0]!.href !== LINKS.issues) {
		issues.push(`${page.path}: the invitation band's Issues link does not target ${LINKS.issues} (SPEC §6.1)`);
	}
	if (links.length !== 2) {
		issues.push(`${page.path}: the invitation band carries ${links.length} links — GitHub · Issues, exactly two (SPEC §6.1)`);
	}

	return issues;
}

/** SPEC §4.1/§2.5: the way home is the wordmark plus one back-to-home link — no breadcrumbs. */
function aboutBackIssues(page: TextPage): string[] {
	const section = backOf(page.html);
	if (section === null) {
		return [`${page.path}: no back-to-home link — /about ends with \`${backLinkText}\` (SPEC §4.1/§2.5)`];
	}

	const issues: string[] = [];
	const links = linksOf(section);
	const home = links.filter((link) => link.href === '/' && link.text === backLinkText);
	if (home.length !== 1) {
		issues.push(`${page.path}: the page does not end with one \`${backLinkText}\` link to / (SPEC §4.1/§2.5)`);
	}
	if (links.length !== 1) {
		issues.push(`${page.path}: the back section carries ${links.length} links — the way home is the wordmark plus this one link (SPEC §2.5)`);
	}

	return issues;
}

/* ---------------------------------------------------------------- /about red lines */

/** A year the §4.1 page may not carry — the `© 2026` of the license split is the one exception. */
const yearPattern = /\b(?:19|20)\d{2}\b/g;
/** SPEC §4.1: no ADR numbers, no issue numbers, no internal references in the story. */
const internalRefPattern = /\bADR-\d+\b|#\d+/i;
/** The site collects nothing: no mailto anywhere, no address in the page's own copy. */
const emailPattern = /[\w.+-]+@[\w-]+\.[\w.]+/;
/** SPEC §4.1 裁掉: no careers CTA, no funding, no hiring. */
const cutTopicPattern = /\bcareers?\b|\bfunding\b|\bhiring\b/i;

/** The external links /about's own copy may carry (SPEC §4.1/§6.1): the handle, GitHub, Issues. */
const aboutExternalLinks: readonly string[] = [LINKS.maintainer, LINKS.github, LINKS.issues];

/** SPEC §4.1/§9.2: the page's own copy holds the site-wide red lines and the story's discipline. */
function aboutRedLineIssues(page: TextPage): string[] {
	const issues: string[] = [];
	const ownCopy = textOf(ownRegionsOf(page.html).join('\n'));

	for (const rule of redLineRules) {
		for (const match of ruleMatches(rule, ownCopy)) {
			issues.push(`${page.path}: the page's own copy reads \`${match[0]}\` — ${rule.reason} [${rule.id}]`);
		}
	}

	const withoutLicenseLine = ownCopy.replaceAll('© 2026', '');
	for (const match of withoutLicenseLine.matchAll(yearPattern)) {
		issues.push(`${page.path}: the page's own copy reads \`${match[0]}\` — no years outside the \`© 2026\` license line (SPEC §4.1)`);
	}

	const internalRef = ownCopy.match(internalRefPattern);
	if (internalRef !== null) {
		issues.push(`${page.path}: the page's own copy reads \`${internalRef[0]}\` — no ADR numbers or issue numbers on the page (SPEC §4.1)`);
	}

	const email = ownCopy.match(emailPattern);
	if (email !== null) {
		issues.push(`${page.path}: the page's own copy reads \`${email[0]}\` — attribution stops at the GitHub handle, no email (SPEC §4.1)`);
	}

	const cutTopic = ownCopy.match(cutTopicPattern);
	if (cutTopic !== null) {
		issues.push(`${page.path}: the page's own copy reads \`${cutTopic[0]}\` — no careers / funding content (SPEC §4.1)`);
	}

	for (const region of ownRegionsOf(page.html)) {
		for (const link of linksOf(region)) {
			if (/^mailto:/i.test(link.href)) {
				issues.push(`${page.path}: the page links \`${link.href}\` — the site collects nothing, no email surface (SPEC §2.3/§4.1)`);
			}
			if (/^https?:/i.test(link.href) && !aboutExternalLinks.includes(link.href)) {
				issues.push(`${page.path}: the page links out to ${link.href} — /about's own links are the handle, GitHub and Issues (SPEC §4.1/§6.1)`);
			}
		}
	}

	return issues;
}

/* ---------------------------------------------------------------- the legal stubs */

/** SPEC §4.2: the one-screen stub — H1, the static `Last updated` line, the locked paragraphs. */
export function legalPageIssues(page: TextPage, spec: LegalPageSpec): string[] {
	const issues: string[] = [];

	const section = legalOf(page.html);
	if (section === null) {
		return [`${page.path}: no legal section — the stub is one screen (SPEC §4.2)`];
	}

	const h1s = tagsOf(page.html, 'h1');
	if (h1s.length !== 1) {
		issues.push(`${page.path}: the page carries ${h1s.length} <h1> — the stub's H1 is its one headline (SPEC §4.2)`);
	}
	const h1 = section.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
	if (h1 === undefined || textOf(h1) !== spec.h1) {
		issues.push(`${page.path}: the H1 reads \`${h1 === undefined ? 'nothing' : textOf(h1)}\`, expected \`${spec.h1}\` (SPEC §4.2)`);
	}

	issues.push(...lastUpdatedLineIssues(page));

	const body = elementOf(section, 'div', 'data-legal-body');
	if (body === null) {
		issues.push(`${page.path}: no \`data-legal-body\` block — the paragraphs sit in their own container (SPEC §4.2)`);
	}
	const paragraphs = paragraphsOf(body ?? section)
		.map(proseOf)
		.filter((paragraph) => !lastUpdatedPattern.test(paragraph));
	if (paragraphs.length !== spec.paragraphs.length) {
		issues.push(`${page.path}: the stub carries ${paragraphs.length} paragraph(s), expected ${spec.paragraphs.length} (SPEC §4.2)`);
	}
	paragraphs.forEach((paragraph, index) => {
		if (paragraph !== spec.paragraphs[index]) {
			issues.push(`${page.path}: paragraph ${index + 1} is not the §4.2 copy verbatim`);
		}
	});

	issues.push(...legalLinkIssues(page, section));
	issues.push(...legalRedLineIssues(page));

	return issues;
}

/** The page's `Last updated` line, or `null` — shared by the per-page and cross-page checks. */
export function lastUpdatedOf(page: TextPage): string | null {
	const line = page.html.match(/<p\b[^>]*\bdata-legal-updated\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	return line === undefined ? null : textOf(line);
}

/** SPEC §4.2: the line is present and static-shaped — the one check both date gates share. */
function lastUpdatedLineIssues(page: TextPage): string[] {
	const date = lastUpdatedOf(page);
	if (date === null) {
		return [`${page.path}: no \`Last updated\` line — a static string, never a build-time date (SPEC §4.2)`];
	}
	if (!lastUpdatedPattern.test(date)) {
		return [`${page.path}: \`${date}\` — the line reads \`Last updated: <Month D, YYYY>\` (SPEC §4.2)`];
	}
	return [];
}

/** SPEC §4.2: contact is GitHub Issues only — the body's one external link, no mailto. */
function legalLinkIssues(page: TextPage, section: string): string[] {
	const issues: string[] = [];
	const links = linksOf(section);

	const repository = links.filter((link) => link.text === 'repository');
	if (repository.length !== 1 || repository[0]!.href !== LINKS.issues) {
		issues.push(`${page.path}: the contact link is not one \`repository\` link to ${LINKS.issues} — GitHub Issues is the only channel (SPEC §4.2)`);
	}
	for (const link of links) {
		if (/^mailto:/i.test(link.href)) {
			issues.push(`${page.path}: the page links \`${link.href}\` — the site collects nothing, no email surface (SPEC §4.2)`);
		}
		if (/^https?:/i.test(link.href) && link.href !== LINKS.issues) {
			issues.push(`${page.path}: the page links out to ${link.href} — the stub's only external link is the Issues contact (SPEC §4.2)`);
		}
	}

	return issues;
}

/** SPEC §4.2: no SaaS contract content — the stub borrows the shape, not the clauses. */
const contractClausePattern = /\b(?:governing law|jurisdiction|liabilit\w+|indemnif\w+|terminat\w+|arbitration)\b/i;
/** SPEC §4.2: the hosting platform stays generic (`our hosting provider`), never named. */
const namedHostPattern = /\b(?:vercel|netlify|cloudflare|tencent|aliyun|amazon web services|aws|github pages)\b/i;

/** SPEC §4.2/§9.2: the stub's own copy holds the site-wide red lines and the stub's discipline. */
function legalRedLineIssues(page: TextPage): string[] {
	const issues: string[] = [];
	const ownCopy = textOf(ownRegionsOf(page.html).join('\n'));

	for (const rule of redLineRules) {
		for (const match of ruleMatches(rule, ownCopy)) {
			issues.push(`${page.path}: the page's own copy reads \`${match[0]}\` — ${rule.reason} [${rule.id}]`);
		}
	}

	const clause = ownCopy.match(contractClausePattern);
	if (clause !== null) {
		issues.push(`${page.path}: the stub reads \`${clause[0]}\` — no jurisdiction / liability / termination clauses (SPEC §4.2)`);
	}

	const host = ownCopy.match(namedHostPattern);
	if (host !== null) {
		issues.push(`${page.path}: the stub names \`${host[0]}\` — the hosting platform stays \`our hosting provider\` (SPEC §4.2)`);
	}

	return issues;
}

/* ---------------------------------------------------------------- the shared date */

/**
 * Ticket #30 / SPEC §4.2: the `Last updated` date is one static string in the content data;
 * both legal pages carry it, so the launch day edits exactly one place. The gate pins the
 * shape and the sameness, not the value.
 */
export function lastUpdatedIssues(privacy: TextPage, terms: TextPage): string[] {
	const issues: string[] = [...lastUpdatedLineIssues(privacy), ...lastUpdatedLineIssues(terms)];
	const dates = [lastUpdatedOf(privacy), lastUpdatedOf(terms)];

	if (dates.every((date) => date !== null) && dates[0] !== dates[1]) {
		issues.push(
			`the legal pages disagree on the date (\`${dates[0]}\` vs \`${dates[1]}\`) — the string lives in one place (ticket #30)`,
		);
	}

	return issues;
}

/* ---------------------------------------------------------------- the /about entry */

/** SPEC §2.5/§4.1: /about's only entry is the footer Project column — no page body links it. */
export function aboutEntryIssues(pages: readonly TextPage[]): string[] {
	return pages.flatMap((page) => {
		const main = elementOf(page.html, 'main');
		if (main === null) return [];
		return linksOf(main)
			.filter((link) => routeOf(link.href) === aboutSpec.route)
			.map((link) => `${page.path}: the page body links \`${link.text}\` to ${link.href} — /about's only entry is the footer Project column (SPEC §2.5)`);
	});
}

/* ---------------------------------------------------------------- the colours */

/** SPEC §5.5 over the text pages' own sections: they read on the page background in the audited roles. */
export function textPageColourIssues(page: TextPage): string[] {
	return sectionColourIssues(page, [
		{ marker: 'data-about-hero', label: 'about hero' },
		{ marker: 'data-about-story', label: 'Our story' },
		{ marker: 'data-about-behind', label: "Who's behind it" },
		{ marker: 'data-about-closing', label: 'invitation band' },
		{ marker: 'data-about-back', label: 'back home' },
		{ marker: 'data-legal-page', label: 'legal stub' },
	]);
}
