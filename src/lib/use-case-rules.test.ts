import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseLandingTokens } from './brand-tokens.ts';
import {
	approvalTitle,
	cardMockWindows,
	chatToolChip,
	consoleStatus,
	focusRingIssues,
	headerMockReuseIssues,
	mockContrastIssues,
	useCaseCards,
	useCaseColourIssues,
	useCaseCountingIssues,
	useCaseIntroHeading,
	useCaseIntroSub,
	useCaseIssues,
	type UseCaseCardSpec,
} from './use-case-rules.ts';

const globalCss = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

const page = (html: string) => ({ path: 'index.html', html: `<html><body>${html}</body></html>` });

const dots = `<span class="flex gap-1.5" aria-hidden="true"><i class="size-2.5 rounded-full bg-ink3"></i><i class="size-2.5 rounded-full bg-ink3"></i><i class="size-2.5 rounded-full bg-ink3"></i></span>`;

const windowFrame = (body: string) => `
	<div class="box overflow-hidden bg-bg2" data-mock-window>
		<div class="flex items-center gap-3 border-b border-line px-4 py-2.5" data-mock-bar>${dots}</div>
		${body}
	</div>`;

const mockChat = windowFrame(`
	<div class="flex flex-col gap-3 p-4">
		<p class="ml-auto w-fit max-w-[85%] bg-acc-lo px-3 py-2 text-base text-acc-h" data-mock-bubble="user">Where is my order?</p>
		<span class="flex w-fit items-center gap-1.5 border border-line px-2 py-1 font-mono text-xs text-ink2" data-mock-tool><i class="size-1.5 bg-acc" aria-hidden="true"></i>lookupOrder</span>
		<p class="max-w-[85%] text-base text-ink2" data-mock-reply>It shipped this morning — arriving tomorrow.<span class="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-acc" data-mock-cursor aria-hidden="true"></span></p>
	</div>`);

const mockThread = windowFrame(`
	<div class="flex flex-col gap-3 p-4 text-base">
		<p class="text-ink3"><span class="font-mono text-xs text-acc">@ops</span> — Customer asked again about order A-4471.</p>
		<p class="text-ink2"><span class="font-mono text-xs text-acc">@agent</span> — The refund is ready — I've paused before sending it.</p>
		<div class="box p-3" data-mock-approval>
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
				<p class="font-semibold text-ink">Refund order A-4471</p>
				<span class="ml-auto bg-acc-lo px-2 py-0.5 font-mono text-xs text-acc-h" data-mock-badge>suspended</span>
			</div>
			<div class="mt-3 flex gap-2">
				<span class="bg-acc px-2.5 py-1 text-xs font-semibold text-acc-inv" data-mock-action="approve">Approve</span>
				<span class="border border-line px-2.5 py-1 text-xs font-semibold text-ink2" data-mock-action="reject">Reject</span>
			</div>
		</div>
	</div>`);

const consoleRow = (lane: string, value: string) => `
		<div class="grid grid-cols-[1fr_auto_auto] items-center gap-3" data-mock-span>
			<span class="truncate font-mono text-xs text-ink2">${lane}</span>
			<span class="mock-status font-mono text-xs" data-mock-status>${consoleStatus}</span>
			<span class="text-right font-mono text-xs text-ink3" data-mock-duration>${value}</span>
		</div>`;

const mockConsole = windowFrame(`
	<div class="p-4">
		<p class="font-mono text-xs text-ink3" data-mock-trace-head>trace 8b1e2f… · completed · 214ms</p>
		<div class="mt-3 flex flex-col gap-2">
			${consoleRow('agent-run', '214ms')}
			${consoleRow('agent-step #1', '172ms')}
			${consoleRow('tool-call lookupOrder', '38ms')}
			${consoleRow('memory-recall thread', '9ms')}
			${consoleRow('agent-step #2', '33ms')}
		</div>
	</div>`);

const mockOf = { chat: mockChat, thread: mockThread, console: mockConsole } as const;

const section = (cards: readonly UseCaseCardSpec[] = useCaseCards, intro = { heading: useCaseIntroHeading, sub: useCaseIntroSub }) => `
<section id="use-cases" data-use-cases class="scroll-mt-20 border-t border-line px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<h2 class="text-center text-3xl font-semibold tracking-tight text-ink">${intro.heading}</h2>
		<p class="mx-auto mt-3 max-w-2xl text-center text-ink3">${intro.sub}</p>
		<ul class="mt-10 grid gap-6 md:grid-cols-3">
			${cards
				.map(
					(card) => `
			<li data-use-case-card data-mock="${card.mock}" class="group relative flex flex-col overflow-hidden box transition-colors hover:border-acc">
				<div class="p-4 pb-0">${mockOf[card.mock]}</div>
				<div class="flex flex-1 flex-col gap-2 p-5" data-card-copy>
					<h3 class="text-lg font-semibold tracking-tight"><a href="${card.route}" data-card-link class="text-ink after:absolute after:inset-0 after:content-[''] group-hover:text-acc hover:text-acc">${card.title}</a></h3>
					<p class="text-base text-ink2">${card.claim}</p>
				</div>
			</li>`,
				)
				.join('')}
		</ul>
	</div>
</section>`;

test('a page with the use-case cards passes every rule', () => {
	const home = page(section());
	assert.deepEqual(useCaseIssues(home), []);
	assert.deepEqual(useCaseCountingIssues(home), []);
	assert.deepEqual(useCaseColourIssues(home), []);
});

test('the use-case section is #use-cases with the §3.5 intro in order', () => {
	assert.match(useCaseIssues(page('<p>nothing</p>'))[0]!, /no use-case section/);

	const renamed = page(section().replace('id="use-cases"', 'id="cases"'));
	assert.match(useCaseIssues(renamed)[0]!, /id is `cases`/);

	const heading = page(section(useCaseCards, { heading: 'Use cases', sub: useCaseIntroSub }));
	assert.match(useCaseIssues(heading)[0]!, /intro heading reads `Use cases`/);

	const sub = page(section(useCaseCards, { heading: useCaseIntroHeading, sub: 'Three shapes.' }));
	assert.match(useCaseIssues(sub)[0]!, /intro sub is not the §3\.5 line verbatim/);
});

test('the three cards carry the verbatim title and claim, in order', () => {
	const fewer = page(section(useCaseCards.slice(0, 2)));
	assert.match(useCaseIssues(fewer)[0]!, /carries 2 card\(s\), expected 3/);

	const retitled = page(section().replace('>In-product agents<', '>Chat agents<'));
	assert.match(useCaseIssues(retitled).join('\n'), /card 1's title link reads `Chat agents`, expected `In-product agents`/);

	const reclaimed = page(section().replace(useCaseCards[1]!.claim, 'Busywork, handled.'));
	assert.match(useCaseIssues(reclaimed).join('\n'), /card 2's copy reads/);

	const misrouted = page(section().replace('href="/operations-agents/"', 'href="/about/"'));
	assert.match(useCaseIssues(misrouted).join('\n'), /card 2 links to `\/about\/`, expected `\/operations-agents\/`/);
});

test('the card title is the only link and it stretches over the whole card', () => {
	const twoLinks = page(section().replace('</h3>', '</h3><a href="/">Docs</a>'));
	assert.match(useCaseIssues(twoLinks).join('\n'), /card 1 carries 2 links/);

	const unstretched = page(section().replace(" after:absolute after:inset-0 after:content-['']", ''));
	assert.match(useCaseIssues(unstretched).join('\n'), /does not stretch over the card/);

	const unpositioned = page(section().replace('class="group relative flex flex-col', 'class="group flex flex-col'));
	assert.match(useCaseIssues(unpositioned).join('\n'), /card 1 is not positioned/);

	const extraLink = page(section().replace('</h2>', '</h2><a href="/">All use cases</a>'));
	assert.match(useCaseIssues(extraLink).join('\n'), /carries 4 links, expected 3/);
});

test('the chat mock shows a bubble, a streaming reply and a tool chip', () => {
	const noBubble = page(section().replace(' data-mock-bubble="user"', ''));
	assert.match(useCaseIssues(noBubble).join('\n'), /card 1: the chat mock has no user bubble/);

	const noCursor = page(section().replace(' data-mock-cursor', ''));
	assert.match(useCaseIssues(noCursor).join('\n'), /the reply does not stream/);

	const otherTool = page(section().replace(chatToolChip, 'weather'));
	assert.match(useCaseIssues(otherTool).join('\n'), /tool chip reads `weather`, expected `lookupOrder`/);

	const noDots = page(section().replace('<i class="size-2.5 rounded-full bg-ink3"></i>', ''));
	assert.match(useCaseIssues(noDots).join('\n'), /card 1: the mock window bar carries 2 dots, expected three/);
});

test('the thread mock shows the @agent message, the approval card and the suspended badge', () => {
	const noAgent = page(section().replace('@agent', '@helper'));
	assert.match(useCaseIssues(noAgent).join('\n'), /the thread mock has no `@agent` message/);

	const noApproval = page(section().replace(' data-mock-approval', ''));
	assert.match(useCaseIssues(noApproval).join('\n'), /the thread mock has no approval card/);

	const otherTitle = page(section().replace(approvalTitle, 'Cancel order A-4471'));
	assert.match(useCaseIssues(otherTitle).join('\n'), /approval card does not read `Refund order A-4471`/);

	const noReject = page(section().replace('>Reject<', '>Decline<'));
	assert.match(useCaseIssues(noReject).join('\n'), /approval card has no `Reject` action/);

	const otherBadge = page(section().replace('>suspended<', '>pending<'));
	assert.match(useCaseIssues(otherBadge).join('\n'), /badge reads `pending`, expected `suspended`/);
});

test('the console mock shows a trace head and span rows with status and duration columns', () => {
	const noHead = page(section().replace(' data-mock-trace-head', ''));
	assert.match(useCaseIssues(noHead).join('\n'), /the console mock has no trace head/);

	const noStatus = page(section().replace(`>${consoleStatus}<`, '>done<'));
	assert.match(useCaseIssues(noStatus).join('\n'), /row 1 has no `ok` status/);

	const noDuration = page(section().replace('>38ms<', '>fast<'));
	assert.match(useCaseIssues(noDuration).join('\n'), /row 3 carries no duration/);

	const oneKind = page(section().replace('memory-recall thread', 'agent-step #3'));
	assert.match(useCaseIssues(oneKind).join('\n'), /the console has no `memory-recall` row/);

	const tooFew = page(section().replace(consoleRow('memory-recall thread', '9ms'), '').replace(consoleRow('agent-step #2', '33ms'), ''));
	assert.match(useCaseIssues(tooFew).join('\n'), /carries 3 span rows, expected at least four/);
});

test('the mocks stay generic: no image, no logo, no fake control, no real name', () => {
	const image = page(section().replace('</h2>', '</h2><img src="/logo.svg" alt="" />'));
	assert.match(useCaseIssues(image).join('\n'), /carries 1 <img>/);

	const logo = page(section().replace('</h2>', '</h2><svg aria-hidden="true"></svg>'));
	assert.match(useCaseIssues(logo).join('\n'), /carries 1 <svg>/);

	const button = page(
		section().replace('data-mock-action="approve">Approve</span>', 'data-mock-action="approve"><button type="button">Approve</button></span>'),
	);
	assert.match(useCaseIssues(button).join('\n'), /carries 1 <button>/);

	const named = page(section().replace('@ops', '@jane'));
	assert.match(useCaseIssues(named).join('\n'), /`@jane` is not a neutral label/);
});

test('figures stay decorative: none in the copy, none that read as a size or a count', () => {
	const digitInClaim = page(section().replace(useCaseCards[0]!.claim, 'Add 3 assistants to the app you already run.'));
	assert.match(useCaseCountingIssues(digitInClaim).join('\n'), /copy carries `3`/);

	const size = page(section().replace('>214ms<', '>214 KB<'));
	assert.match(useCaseCountingIssues(size).join('\n'), /`214 KB`/);

	const stars = page(section().replace('trace 8b1e2f… · completed · 214ms', 'trace 8b1e2f… · 12,345 stars'));
	assert.match(useCaseCountingIssues(stars).join('\n'), /12,345 stars/);

	// The decorative durations, step numbers and the order number are not figures.
	assert.deepEqual(useCaseCountingIssues(page(section())), []);
});

test('text and surfaces come only from the measured roles, paired as audited', () => {
	const offRole = page(section().replace('text-base text-ink2', 'text-base text-acc-lo'));
	assert.match(useCaseColourIssues(offRole)[0]!, /`text-acc-lo`/);

	const cardSurface = page(section().replace('class="group relative flex flex-col', 'class="group relative flex flex-col bg-bg2'));
	assert.match(useCaseColourIssues(cardSurface)[0]!, /card 1 paints its own surface with `bg-bg2`/);

	const loudBubble = page(
		section().replace('bg-acc-lo px-3 py-2 text-base text-acc-h', 'bg-acc-lo px-3 py-2 text-base text-acc-inv'),
	);
	assert.match(useCaseColourIssues(loudBubble).join('\n'), /does not wear `text-acc-h`/);

	const ghostApprove = page(
		section().replace('bg-acc px-2.5 py-1 text-xs font-semibold text-acc-inv', 'bg-acc px-2.5 py-1 text-xs font-semibold text-ink'),
	);
	assert.match(useCaseColourIssues(ghostApprove).join('\n'), /does not wear `text-acc-inv`/);

	const noStatusInk = page(section().replace('class="mock-status font-mono text-xs"', 'class="font-mono text-xs"'));
	assert.match(useCaseColourIssues(noStatusInk).join('\n'), /does not wear `mock-status`/);

	assert.deepEqual(useCaseColourIssues(page(section())), []);
});

test('the mock pairs clear AA on the shipped token layer, both themes', () => {
	const { tokens, errors } = parseLandingTokens(globalCss);
	assert.deepEqual(errors, []);
	assert.deepEqual(mockContrastIssues(tokens), []);

	const dimmed = { ...tokens, light: { ...tokens.light, '--ink2': '#a0a09c' } };
	const muted = mockContrastIssues(dimmed);
	assert.equal(muted.length, 1);
	assert.match(muted[0]!, /body text on the mock window surface/);

	const missing = { light: tokens.light, dark: { ...tokens.dark, '--bg2': undefined as unknown as string } };
	assert.ok(mockContrastIssues(missing).some((issue) => issue.includes('needs tokens')));
});

test('every use-case page head reuses its home card\'s mock as-is (SPEC-revamp §5.1)', () => {
	const home = page(section());
	const windows = cardMockWindows(home);
	assert.deepEqual(Object.keys(windows).sort(), ['chat', 'console', 'thread']);
	assert.ok(windows.chat!.includes('data-mock-bubble="user"'));
	assert.ok(windows.thread!.includes('data-mock-approval'));
	assert.ok(windows.console!.includes('data-mock-trace-head'));

	const header = (kind: string, window: string) => ({
		path: `${kind}-page/index.html`,
		html: `<section data-use-case-hero><figure data-use-case-mock="${kind}">${window}</figure></section>`,
	});
	const reused = useCaseCards.map((card) => header(card.mock, windows[card.mock]!));
	assert.deepEqual(headerMockReuseIssues(home, reused), []);

	const drifted = header('chat', windows.chat!.replace('Where is my order?', 'Where is my parcel?'));
	assert.match(headerMockReuseIssues(home, [drifted]).join('\n'), /chat-page\/index\.html: the header mock is not the home card's `chat` mock/);

	// A missing figure, an unmapped kind or a missing window is the page gate's finding; a home
	// without its section is the home gate's — the reuse check stays silent on both.
	assert.deepEqual(headerMockReuseIssues(home, [{ path: 'bare/index.html', html: '<p>nothing</p>' }]), []);
	assert.deepEqual(headerMockReuseIssues(home, [header('orbit', windows.chat!)]), []);
	assert.deepEqual(headerMockReuseIssues(home, [header('chat', '<p>no window</p>')]), []);
	assert.deepEqual(headerMockReuseIssues(page('<p>no section</p>'), reused), []);
});

test('the card links keep the site-wide visible focus ring', () => {
	assert.deepEqual(
		focusRingIssues(':where(a[href], button):focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }'),
		[],
	);
	assert.match(focusRingIssues('a { color: red }')[0]!, /no `:focus-visible` rule/);
	assert.match(focusRingIssues(':focus-visible { outline: none }').join('\n'), /2px accent outline/);
	assert.match(focusRingIssues(':focus-visible { outline: 2px solid var(--acc) }').join('\n'), /outline offset/);
});
