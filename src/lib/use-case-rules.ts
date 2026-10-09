/**
 * The home use-case cards (SPEC-revamp §3.5) over the built page: the `#use-cases` section with
 * its verbatim intro, the three cards — the host-interface mock leading the card face, the copy
 * retreating under it to the title (the card's only link, stretching over the whole card) plus
 * its one verbatim claim, each card targeting its use-case page — and the three mocks: an in-app
 * chat panel, a team thread with the approval gate, and a trace console. The mock rules hold the
 * generic-UI line (no image, no logo, no fake control, no real name), keep the figures decorative
 * (no size, count or star claim even in the mock data), restrict every colour to the roles the
 * mock pairs measure, audit those pairs against the shipped token layer in both themes, and keep
 * the keyboard path the card links rely on — the site-wide visible focus ring — shipping.
 *
 * Like the hero, feature and band rules, the strings here are the spec's copy — deliberately not
 * read from the content collections that render them, so the page and its gate cannot agree by
 * construction. The mock strings are this slice's decorative UI, registered here so the gate can
 * hold their shape.
 */

import { AA, contrastRatio, hslToHex, parseHex, type Theme, type TokenSet } from './brand-tokens.ts';
import { colourClassesOf, colourUtilities } from './colour-rules.ts';
import { trailGreen } from './hero-rules.ts';
import { attributeValue, elementOf, linksOf, tagsOf, textOf } from './html.ts';
import { terminologyHits } from './terminology.ts';

export type UseCasePage = { path: string; html: string };
export type MockKind = 'chat' | 'thread' | 'console';
export type UseCaseCardSpec = { title: string; claim: string; route: string; mock: MockKind };

/** SPEC §3.5 引言【终稿·勿改】: the section's two lines, as the heading and the line under it. */
export const useCaseIntroHeading = 'In your product. Around your team. Under your platform.';
export const useCaseIntroSub = 'One small framework, three shapes — and nothing new to stand up.';

/** SPEC §3.5: the three cards in page order — titles, claims and targets verbatim. */
export const useCaseCards: readonly UseCaseCardSpec[] = [
	{
		title: 'In-product agents',
		claim: 'Add an assistant to the app you already run — no second service to operate.',
		route: '/in-product-agents/',
		mock: 'chat',
	},
	{
		title: 'Operations agents',
		claim: 'Agents that handle the busywork around your team — with a human on the risky steps.',
		route: '/operations-agents/',
		mock: 'thread',
	},
	{
		title: 'Platform & developer infra',
		claim: 'Shared agent primitives your product teams compose.',
		route: '/developer-infrastructure/',
		mock: 'console',
	},
];

/** SPEC §3.5 brief ①–③: the strings the mocks render — decorative UI, not claims. */
export const chatToolChip = 'lookupOrder';
export const approvalTitle = 'Refund order A-4471';
export const approvalBadge = 'suspended';
export const approvalActions = ['Approve', 'Reject'] as const;
export const consoleStatus = 'ok';
/** The span kinds the console covers (SPEC §3.5 brief ③). */
export const consoleRowKinds = ['run', 'agent-step', 'tool-call', 'memory-recall'] as const;

/** SPEC §3.5: the neutral handles the mocks may show — nothing that reads as a real name. */
export const mockHandles = ['@agent', '@ops'] as const;

/* ---------------------------------------------------------------- reading the page */

function sectionOf(page: UseCasePage): string | null {
	return elementOf(page.html, 'section', 'data-use-cases');
}

/** The card elements of the section, in document order. */
function useCaseCardsOf(section: string): string[] {
	return [...section.matchAll(/<li\b[^>]*\bdata-use-case-card\b[^>]*>[\s\S]*?<\/li>/gi)].map((match) => match[0]);
}

/** The first opening tag of a fragment that carries a marker (a data attribute). */
function openingTagOf(fragment: string, marker: string): string | null {
	const pattern = new RegExp(`<[a-z][a-z0-9-]*\\b[^>]*\\b${marker}(?![\\w-])[^>]*>`, 'i');
	return fragment.match(pattern)?.[0] ?? null;
}

/* ---------------------------------------------------------------- the checks */

/** SPEC §3.5: the section, its intro, the three cards, their links and the three mocks. */
export function useCaseIssues(page: UseCasePage): string[] {
	const section = sectionOf(page);
	if (section === null) return [`${page.path}: no use-case section — the home page carries \`#use-cases\` (SPEC §3.5)`];

	const issues: string[] = [];
	const opening = section.slice(0, section.indexOf('>') + 1);
	const id = attributeValue(opening, 'id');
	if (id !== 'use-cases') {
		issues.push(
			`${page.path}: the use-case section's id is \`${id ?? 'nothing'}\`, expected \`use-cases\` — \`#use-cases\` direct-links it (SPEC §2.5)`,
		);
	}

	const headings = [...section.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => textOf(match[1]!));
	if (headings.length !== 1 || headings[0] !== useCaseIntroHeading) {
		issues.push(
			`${page.path}: the intro heading reads \`${headings[0] ?? 'nothing'}\`, expected \`${useCaseIntroHeading}\` (SPEC §3.5)`,
		);
	}
	const firstParagraph = section.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	if (firstParagraph === undefined || textOf(firstParagraph) !== useCaseIntroSub) {
		issues.push(`${page.path}: the intro sub is not the §3.5 line verbatim`);
	}

	// SPEC §3.5: intro first, then the cards — the reading order is the section's shape.
	const order = [section.indexOf(useCaseIntroHeading), section.search(/<p\b/i), section.search(/<li\b[^>]*\bdata-use-case-card\b/i)];
	if (order.every((index) => index >= 0) && order.some((index, position) => position > 0 && index < order[position - 1]!)) {
		issues.push(`${page.path}: the use-case section's intro and cards are out of order — intro, then the three cards (SPEC §3.5)`);
	}

	const cards = useCaseCardsOf(section);
	if (cards.length !== useCaseCards.length) {
		issues.push(`${page.path}: the use-case section carries ${cards.length} card(s), expected ${useCaseCards.length} (SPEC §3.5)`);
	}
	cards.forEach((card, index) => {
		const expected = useCaseCards[index];
		if (expected !== undefined) issues.push(...cardIssues(page.path, card, expected, index));
	});

	const links = linksOf(section);
	if (links.length !== useCaseCards.length) {
		issues.push(`${page.path}: the section carries ${links.length} links, expected ${useCaseCards.length} — the three card titles (SPEC §3.5)`);
	}

	// SPEC §3.5: generic UI only — no image, no logo, no working control behind the mock.
	for (const tag of ['img', 'picture', 'video', 'iframe', 'svg'] as const) {
		const count = tagsOf(section, tag).length;
		if (count > 0) {
			issues.push(
				`${page.path}: the use-case section carries ${count} <${tag}> — the mocks draw generic UI, no logo, no image (SPEC §3.5)`,
			);
		}
	}
	const buttons = tagsOf(section, 'button').length;
	if (buttons > 0) {
		issues.push(`${page.path}: the use-case section carries ${buttons} <button> — the mock controls are inert stand-ins (SPEC §3.5)`);
	}

	const text = textOf(section);
	for (const match of text.matchAll(/@[a-z0-9][a-z0-9._-]*/gi)) {
		if (!(mockHandles as readonly string[]).includes(match[0])) {
			issues.push(`${page.path}: \`${match[0]}\` is not a neutral label — the mocks name no real person (SPEC §3.5)`);
		}
	}
	for (const { term, reason } of terminologyHits(text)) {
		issues.push(`${page.path}: the use-case section reads \`${term}\` — ${reason}`);
	}

	return issues;
}

/** The card's mock region: from the window element's opening tag to the card's end. */
function mockStartOf(card: string): number {
	const marker = card.indexOf('data-mock-window');
	return marker === -1 ? -1 : card.lastIndexOf('<', marker);
}

/** The card's copy block: the title + claim region under the mock, by its marker. */
function copyStartOf(card: string): number {
	const marker = card.search(/<div\b[^>]*\bdata-card-copy\b[^>]*>/i);
	return marker === -1 ? -1 : marker;
}

/** One card: its mock kind, its single stretched link, its copy and its mock window. */
function cardIssues(path: string, card: string, expected: UseCaseCardSpec, index: number): string[] {
	const issues: string[] = [];
	const label = `card ${index + 1}`;
	const opening = card.slice(0, card.indexOf('>') + 1);

	const kind = attributeValue(opening, 'data-mock');
	if (kind !== expected.mock) {
		issues.push(`${path}: ${label} carries mock \`${kind ?? 'nothing'}\`, expected \`${expected.mock}\` (SPEC §3.5)`);
	}
	if (!/\brelative\b/.test(attributeValue(opening, 'class') ?? '')) {
		issues.push(`${path}: ${label} is not positioned — the stretched link cannot cover the card (SPEC §3.5)`);
	}

	const links = linksOf(card);
	if (links.length !== 1) issues.push(`${path}: ${label} carries ${links.length} links — one, the title (SPEC §3.5)`);
	const link = links[0];
	if (link !== undefined) {
		if (link.text !== expected.title) {
			issues.push(`${path}: ${label}'s title link reads \`${link.text}\`, expected \`${expected.title}\` (SPEC §3.5)`);
		}
		if (link.href !== expected.route) {
			issues.push(`${path}: ${label} links to \`${link.href}\`, expected \`${expected.route}\` (SPEC §3.5)`);
		}
	}
	const linkTag = card.match(/<a\b[^>]*\bdata-card-link\b[^>]*>/i)?.[0];
	if (linkTag === undefined) {
		issues.push(`${path}: ${label}'s title is not marked as the card's link (SPEC §3.5)`);
	} else if (
		!/\bafter:absolute\b/.test(attributeValue(linkTag, 'class') ?? '') ||
		!/\bafter:inset-0\b/.test(attributeValue(linkTag, 'class') ?? '')
	) {
		issues.push(`${path}: ${label}'s title link does not stretch over the card — the whole card is clickable (SPEC §3.5)`);
	}

	const mockIndex = mockStartOf(card);
	if (mockIndex === -1) {
		issues.push(`${path}: ${label} carries no mock window (SPEC §3.5)`);
		return issues;
	}

	// SPEC-revamp §3.5: the mock leads the card; the copy retreats to a title + one claim below it.
	const copyIndex = copyStartOf(card);
	if (copyIndex === -1 || copyIndex < mockIndex) {
		issues.push(`${path}: ${label}'s copy does not sit under its mock — the mock is the card's body (SPEC-revamp §3.5)`);
	} else {
		const copy = textOf(card.slice(copyIndex));
		if (copy !== `${expected.title} ${expected.claim}`) {
			issues.push(`${path}: ${label}'s copy reads \`${copy}\`, expected \`${expected.title} ${expected.claim}\` (SPEC §3.5)`);
		}
	}

	const mock = card.slice(mockIndex);
	const bar = mock.match(/<div\b[^>]*\bdata-mock-bar\b[^>]*>[\s\S]*?<\/div>/i)?.[0];
	if (bar === undefined) {
		issues.push(`${path}: ${label}: the mock window has no bar (SPEC §3.5)`);
	} else {
		const dots = [...bar.matchAll(/<i\b/gi)].length;
		if (dots !== 3) issues.push(`${path}: ${label}: the mock window bar carries ${dots} dots, expected three (SPEC §3.5)`);
	}

	if (expected.mock === 'chat') issues.push(...chatIssues(path, label, mock));
	else if (expected.mock === 'thread') issues.push(...threadIssues(path, label, mock));
	else issues.push(...consoleIssues(path, label, mock));

	return issues;
}

/** SPEC §3.5 brief ①: a user bubble, a streamed reply and one tool-call chip. */
function chatIssues(path: string, label: string, mock: string): string[] {
	const issues: string[] = [];

	const bubble = mock.match(/<p\b[^>]*\bdata-mock-bubble\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	if (bubble === undefined || textOf(bubble) === '') {
		issues.push(`${path}: ${label}: the chat mock has no user bubble (SPEC §3.5)`);
	}

	const reply = mock.match(/<p\b[^>]*\bdata-mock-reply\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	if (reply === undefined || textOf(reply) === '') {
		issues.push(`${path}: ${label}: the chat mock has no assistant reply (SPEC §3.5)`);
	} else if (!/\bdata-mock-cursor\b/.test(reply)) {
		issues.push(`${path}: ${label}: the reply does not stream — no cursor (SPEC §3.5)`);
	}

	const tool = mock.match(/<span\b[^>]*\bdata-mock-tool\b[^>]*>([\s\S]*?)<\/span>/i)?.[1];
	if (tool === undefined || textOf(tool) !== chatToolChip) {
		issues.push(`${path}: ${label}: the tool chip reads \`${tool === undefined ? 'nothing' : textOf(tool)}\`, expected \`${chatToolChip}\` (SPEC §3.5)`);
	}

	return issues;
}

/** SPEC §3.5 brief ②: a message from `@agent`, the approval card and the `suspended` badge. */
function threadIssues(path: string, label: string, mock: string): string[] {
	const issues: string[] = [];

	if (!/\B@agent\b/.test(textOf(mock))) {
		issues.push(`${path}: ${label}: the thread mock has no \`@agent\` message (SPEC §3.5)`);
	}

	const approvalIndex = mock.indexOf('data-mock-approval');
	if (approvalIndex === -1) {
		issues.push(`${path}: ${label}: the thread mock has no approval card (SPEC §3.5)`);
		return issues;
	}
	const approval = mock.slice(approvalIndex);
	const approvalText = textOf(approval);
	if (!approvalText.includes(approvalTitle)) {
		issues.push(`${path}: ${label}: the approval card does not read \`${approvalTitle}\` (SPEC §3.5)`);
	}
	for (const action of approvalActions) {
		if (!approvalText.includes(action)) {
			issues.push(`${path}: ${label}: the approval card has no \`${action}\` action (SPEC §3.5)`);
		}
	}
	const badge = approval.match(/<span\b[^>]*\bdata-mock-badge\b[^>]*>([\s\S]*?)<\/span>/i)?.[1];
	if (badge === undefined || textOf(badge) !== approvalBadge) {
		issues.push(
			`${path}: ${label}: the approval badge reads \`${badge === undefined ? 'nothing' : textOf(badge)}\`, expected \`${approvalBadge}\` (SPEC §3.5)`,
		);
	}

	return issues;
}

/** SPEC §3.5 brief ③: the trace head, then span rows with a status and a duration column. */
function consoleIssues(path: string, label: string, mock: string): string[] {
	const issues: string[] = [];

	const head = mock.match(/<p\b[^>]*\bdata-mock-trace-head\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	if (head === undefined || textOf(head) === '') {
		issues.push(`${path}: ${label}: the console mock has no trace head (SPEC §3.5)`);
	}

	const rows = [...mock.matchAll(/<div\b[^>]*\bdata-mock-span\b[^>]*>[\s\S]*?<\/div>/gi)].map((match) => match[0]);
	if (rows.length < consoleRowKinds.length) {
		issues.push(`${path}: ${label}: the console carries ${rows.length} span rows, expected at least four (SPEC §3.5)`);
	}

	const lanes: string[] = [];
	rows.forEach((row, position) => {
		lanes.push(textOf(row.match(/<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? ''));
		const status = row.match(/<span\b[^>]*\bdata-mock-status\b[^>]*>([\s\S]*?)<\/span>/i)?.[1];
		if (status === undefined || textOf(status) !== consoleStatus) {
			issues.push(`${path}: ${label}: row ${position + 1} has no \`${consoleStatus}\` status (SPEC §3.5)`);
		}
		const duration = row.match(/<span\b[^>]*\bdata-mock-duration\b[^>]*>([\s\S]*?)<\/span>/i)?.[1];
		if (duration === undefined || !/^\d+(?:\.\d+)?\s*(?:ms|s)$/.test(textOf(duration))) {
			issues.push(`${path}: ${label}: row ${position + 1} carries no duration (SPEC §3.5)`);
		}
	});
	for (const kind of consoleRowKinds) {
		if (!lanes.some((lane) => lane.includes(kind))) {
			issues.push(`${path}: ${label}: the console has no \`${kind}\` row (SPEC §3.5)`);
		}
	}

	return issues;
}

/**
 * SPEC §3.5/§9.2: the cards' copy carries no figure at all; the mock figures stay decorative —
 * no size, count, test or star claim anywhere in the section. The order number and the console's
 * durations / step numbers are decoration, not claims.
 */
export function useCaseCountingIssues(page: UseCasePage): string[] {
	const section = sectionOf(page);
	if (section === null) return [];

	const issues: string[] = [];
	const firstCard = section.search(/<li\b[^>]*\bdata-use-case-card\b/i);
	const intro = firstCard === -1 ? section : section.slice(0, firstCard);
	const copyParts = [textOf(intro)];
	for (const card of useCaseCardsOf(section)) {
		// The copy is the card's `data-card-copy` block (title + claim); the mock's figures are
		// decorative, and a missing copy block is already a structure finding above.
		const copyIndex = copyStartOf(card);
		if (copyIndex !== -1) copyParts.push(textOf(card.slice(copyIndex)));
	}
	const digit = copyParts.join(' ').match(/\d[\d,.]*/);
	if (digit !== null) {
		issues.push(`${page.path}: the card copy carries \`${digit[0]}\` — figures stay decorative, inside the mocks (SPEC §3.5/§9.2)`);
	}

	const text = textOf(section);
	for (const pattern of claimFigures) {
		const match = text.match(pattern);
		if (match !== null) {
			issues.push(`${page.path}: the use-case section reads \`${match[0]}\` — no size, count or star figure, mock data included (SPEC §9.2)`);
		}
	}

	return issues;
}

/**
 * SPEC §9.2: figure-shaped claims that stay out of the mocks as well. This slice reads the rule
 * strictly — a mock that states a size or a count would read as a claim whatever the intent —
 * so the patterns are stated here rather than inherited from the site-wide copy scan, which
 * `src/lib/copy-rules.ts` keeps to the nouns its own gate reports on.
 */
const claimFigures: readonly RegExp[] = [
	/\b\d[\d.,]*\s*(?:kb|mb|gb|kib|mib|gib|kilobytes?|megabytes?)\b/i,
	/\b\d[\d,]*\s*(?:stars?|downloads?|users?|customers?|tests?|benchmarks?)\b/i,
	/\b(?:two|three|four|five|six|seven|eight|nine|ten)\s+(?:fields|packages|dependencies|modules|subsystems|tests?|stars|downloads|users|customers)\b/i,
];

/* ---------------------------------------------------------------- the colours */

/**
 * The colour classes the cards and mocks render: the text roles and surfaces the mock pairs
 * below measure, plus the inert decorations (window dots, hairline borders, the streaming
 * cursor) that carry no text and need no pair of their own. `text-ink3` is muted meta —
 * decorative mono labelling, deliberately outside AA (SPEC-revamp §2.1), never running text.
 */
const mockColourClasses = new Set([
	'text-ink',
	'text-ink2',
	'text-ink3',
	'text-acc',
	'text-acc-h',
	'text-acc-inv',
	'bg-ink3',
	'bg-bg2',
	'bg-acc',
	'bg-acc-lo',
	'border-line',
	'border-acc',
]);

/** The first surface class of a fragment, if it paints one. */
function surfaceIn(fragment: string): string | null {
	for (const token of colourClassesOf(fragment)) {
		if (token.startsWith('bg-')) return token;
	}
	return null;
}

/**
 * SPEC §3.5/§5.5 over the section: the cards read on the page background — the mock window is the
 * only surface — every colour class is one the AA pairs below measure, and the pairs are the ones
 * the markup actually renders (bubble, badge, buttons, status ink, window frame).
 */
export function useCaseColourIssues(page: UseCasePage): string[] {
	const section = sectionOf(page);
	if (section === null) return [];

	const issues: string[] = [];
	const opening = section.slice(0, section.indexOf('>') + 1);
	const surface = colourUtilities(attributeValue(opening, 'class') ?? '').find((token) => token.startsWith('bg-'));
	if (surface !== undefined) {
		issues.push(`${page.path}: the use-case section paints its own surface with \`${surface}\` — the cards read on the page background (SPEC §5.5)`);
	}

	const firstCard = section.search(/<li\b[^>]*\bdata-use-case-card\b/i);
	const intro = firstCard === -1 ? section : section.slice(0, firstCard);
	const introSurface = surfaceIn(intro);
	if (introSurface !== null) {
		issues.push(`${page.path}: the intro paints its own surface with \`${introSurface}\` — the cards read on the page background (SPEC §5.5)`);
	}

	useCaseCardsOf(section).forEach((card, index) => {
		// The copy block under the mock reads on the page background; the mock window carries the
		// card's one surface (`bg-bg2`, asserted below). The card's own opening tag is in the scan —
		// a surface on the `<li>` paints the whole card, mock included.
		const copyIndex = copyStartOf(card);
		const opening = card.slice(0, card.indexOf('>') + 1);
		const region = copyIndex === -1 ? `${opening}${card.slice(0, mockStartOf(card))}` : `${opening}${card.slice(copyIndex)}`;
		const found = surfaceIn(region);
		if (found !== null) {
			issues.push(`${page.path}: card ${index + 1} paints its own surface with \`${found}\` — the mock window is the card's only surface (SPEC §3.5/§5.5)`);
		}

		const marker = mockStartOf(card);
		if (marker === -1) return;

		const mock = card.slice(marker);
		requireClasses(issues, page.path, openingTagOf(mock, 'data-mock-window'), ['box', 'bg-bg2'], `card ${index + 1}'s mock window`);
		requireClasses(issues, page.path, openingTagOf(mock, 'data-mock-bubble'), ['bg-acc-lo', 'text-acc-h'], `card ${index + 1}'s user bubble`);
		requireClasses(issues, page.path, openingTagOf(mock, 'data-mock-badge'), ['bg-acc-lo', 'text-acc-h'], `card ${index + 1}'s suspended badge`);
		requireClasses(issues, page.path, openingTagOf(mock, 'data-mock-status'), ['mock-status'], `card ${index + 1}'s console status`);
		requireClasses(issues, page.path, mock.match(/<span\b[^>]*\bdata-mock-action="approve"[^>]*>/i)?.[0] ?? null, ['bg-acc', 'text-acc-inv'], `card ${index + 1}'s Approve control`);
		requireClasses(issues, page.path, mock.match(/<span\b[^>]*\bdata-mock-action="reject"[^>]*>/i)?.[0] ?? null, ['border-line', 'text-ink2'], `card ${index + 1}'s Reject control`);
	});

	for (const token of colourClassesOf(section)) {
		if (!mockColourClasses.has(token)) {
			issues.push(`${page.path}: the use-case section paints with \`${token}\` — the mock roles are the measured set (SPEC §3.5/§5.5)`);
		}
	}

	return issues;
}

/** One element's class list must carry the given classes — the pair the AA audit measures. */
function requireClasses(issues: string[], path: string, tag: string | null, required: readonly string[], label: string): void {
	if (tag === null) return;
	const classes = (attributeValue(tag, 'class') ?? '').split(/\s+/);
	for (const expected of required) {
		if (!classes.includes(expected)) {
			issues.push(`${path}: ${label} does not wear \`${expected}\` — the pair the AA audit measures (SPEC §3.5/§5.5)`);
		}
	}
}

/* ---------------------------------------------------------------- the mock AA audit */

/**
 * SPEC §3.5/§2.10: the pairs the cards and mocks actually render must clear AA in both themes —
 * body / heading / accent text on the mock window surface, the accent chip pair (bubble and
 * badge), the inverted label on the accent button, and the trace console's status ink
 * (`src/lib/hero-rules.ts`'s trailGreen, SPEC §7.5 判定③). Muted meta (`--ink3`) is decorative
 * labelling, deliberately unaudited (SPEC-revamp §2.1).
 */
export function mockContrastIssues(tokens: Record<Theme, TokenSet>): string[] {
	const issues: string[] = [];

	for (const theme of ['light', 'dark'] as const) {
		const surface = tokens[theme]['--bg2'];
		const pairs = [
			{ label: 'body text on the mock window surface', fg: tokens[theme]['--ink2'], bg: surface },
			{ label: 'heading text on the mock window surface', fg: tokens[theme]['--ink'], bg: surface },
			{ label: 'accent text on the mock window surface', fg: tokens[theme]['--acc'], bg: surface },
			{ label: 'accent chip label on accent-low', fg: tokens[theme]['--acc-h'], bg: tokens[theme]['--acc-lo'] },
			{
				label: 'inverted label on the accent button',
				fg: tokens[theme]['--acc-inv'],
				bg: tokens[theme]['--acc'],
			},
			{ label: 'trace status text on the mock window surface', fg: hslToHex(trailGreen[theme]), bg: surface },
		];

		for (const { label, fg, bg } of pairs) {
			if (fg === undefined || bg === undefined) {
				issues.push(`${theme}: \`${label}\` needs tokens the §2.1 layer does not declare (SPEC §3.5/§2.10)`);
				continue;
			}
			if (parseHex(fg) === null || parseHex(bg) === null) {
				issues.push(`${theme}: \`${label}\` resolves to a value the audit cannot measure (${fg} on ${bg})`);
				continue;
			}
			const ratio = contrastRatio(fg, bg);
			if (ratio < AA) {
				issues.push(`${theme}: \`${label}\` is ${ratio.toFixed(2)}:1 — the mock pair sits below the ${AA}:1 floor (SPEC §3.5/§2.10)`);
			}
		}
	}

	return issues;
}

/* ---------------------------------------------------------------- the keyboard path */

/**
 * SPEC §2.7/§3.5: the card links are the section's only controls (each card's one `<a href>`,
 * checked above — no buttons, no tabindex tricks), and the shipped CSS keeps the site-wide
 * visible focus ring that keyboard visitors follow them with.
 */
export function focusRingIssues(css: string): string[] {
	const issues: string[] = [];
	const rule = css.match(/:focus-visible[^{}]*\{([^}]*)\}/i);
	if (rule === null) {
		return ['the shipped CSS has no `:focus-visible` rule — the card links have no visible focus (SPEC §2.7)'];
	}
	const body = rule[1]!.replace(/\s+/g, ' ');
	if (!/outline\s*:\s*2px solid var\(--acc\)/.test(body)) {
		issues.push('the shipped `:focus-visible` rule does not draw the 2px accent outline (SPEC §2.5)');
	}
	if (!/outline-offset\s*:/.test(body)) {
		issues.push('the shipped `:focus-visible` rule sets no outline offset — the ring hugs the letterforms (SPEC §2.7)');
	}
	return issues;
}
