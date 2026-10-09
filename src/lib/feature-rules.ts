/**
 * The home page's feature tabs (SPEC §3.2 / §7.1 / §7.3) over the built page: the `#features`
 * section, the five tabs in their fixed order with their `#agents`-style anchors, one visible
 * panel without JS, every claim and bullet verbatim, each code card's files and §7.3 snippets
 * verbatim and within the ten-line cap — plus the terminology guard the tabs live under: no
 * as-tool narrative (SPEC §3.2 keeps it for docs), no "the Harness module" reading, and the
 * CONTEXT.md vocabulary (harness is a documentation category; memory is thread / resource
 * identity, never session / short-term / long-term memory).
 *
 * Like the hero rules, the strings here are the spec's copy — deliberately not read from the
 * content collections that render them, so the page and its gate cannot agree by construction.
 */

import { attributeValue, codeBlocksOf, elementOf, hasAttribute, missingCodeSurface, occurrences, textOf, times } from './html.ts';
import { terminologyHits } from './terminology.ts';
import { VERSION } from './version.ts';

export type FeatureBullet = { lead: string; text: string };
export type FeatureFile = { file: string; code: string };
export type FeatureSpec = {
	/** The tab's anchor id (`#agents` …) — also the content entry's own id. */
	id: string;
	tab: string;
	claim: string;
	bullets: readonly FeatureBullet[];
	files: readonly FeatureFile[];
};

/** SPEC §3.2: the section kicker (【可润色】, rendered as written). */
export const featureKicker = "What's in the box";
/** SPEC §3.2/§7.1: every feature card stops at ten lines. */
export const maxFeatureLines = 10;

/**
 * SPEC §3.2 【终稿·勿改 for the Agents claim】 — the five panels, fixed order. The MCP panel's
 * `version` field is written from `src/lib/version.ts` (SPEC-revamp §4.6): the gate holds the
 * rendered snippet to the same literal, so a bump shows up here and in the built page at once.
 */
export const features: readonly FeatureSpec[] = [
	{
		id: 'agents',
		tab: 'Agents',
		claim: 'A minimal agent surface with a built-in tool loop.',
		bullets: [
			{ lead: 'A handful of fields', text: 'name, instructions, model, tools — plus optional memory and processors.' },
			{
				lead: 'One run, two consumption styles',
				text: 'generate() and stream() share one output object; the tool loop is built in.',
			},
			{
				lead: 'Structured output & dynamic arguments',
				text: 'every field takes a value or a function of the request context.',
			},
			{
				lead: 'Processors',
				text: 'the one cross-cutting extension point — processInput / processOutputStep / processError.',
			},
		],
		files: [
			{
				file: 'agent.ts',
				code: `import { Agent } from '@oribos/core/agent';

const redactPii = {
  processInput: ({ messages }) => ({ messages: scrub(messages) }),
  processOutputStep: ({ step }) => audit(step),
};

const agent = new Agent({ name, instructions, model, processors: [redactPii] });

const run = agent.stream('Summarise this ticket.');`,
			},
		],
	},
	{
		id: 'workflows',
		tab: 'Workflows',
		claim: 'Multi-step runs that suspend, snapshot, and resume — anywhere.',
		bullets: [
			{ lead: 'A fluent builder', text: 'foreach, parallel, branch, then — an agent is an ordinary step.' },
			{
				lead: 'Suspend & resume',
				text: 'a run stops at a step boundary as a JSON snapshot, resumable from another process.',
			},
			{ lead: 'Lifecycle events', text: 'run-start, step-start, step-end, run-end — streamed as they happen.' },
			{ lead: 'Schema at every boundary', text: 'start input, step input and resume data are all validated.' },
		],
		files: [
			{
				file: 'workflow.ts',
				code: `import { createWorkflow } from '@oribos/core/workflows';

const workflow = createWorkflow({ id: 'expense-approval', inputSchema: report, outputSchema: receipt })
  .foreach(checkItem, { concurrency: 2 })
  .parallel([policyCheck, budgetCheck])
  .then(draftMemo)
  .then(approvalGate)
  .commit();`,
			},
			{
				file: 'resume.ts',
				code: `// another process, later — the whole state is one JSON snapshot
const outcome = await workflow.createRun({ runId: 'run-1' }).resume({
  step: 'approval-gate',
  resumeData: { approved: true },
});`,
			},
		],
	},
	{
		id: 'harness',
		tab: 'Harness',
		claim: 'Durable execution for humans and time.',
		bullets: [
			{ lead: 'Durable agents', text: 'a listed tool call suspends the run; resume({ approved }) continues it.' },
			{ lead: 'Signals', text: 'inject into a live run, wake an idle thread, or queue in order.' },
			{
				lead: 'Schedules',
				text: 'tick() fires what is due — storage is JSON, the occurrence function is injected.',
			},
			{ lead: '@oribos/croner', text: 'cron expressions as that injected next() fragment.' },
		],
		files: [
			{
				file: 'gate.ts',
				code: `import { createDurableAgent } from '@oribos/core/durable-agent';

const durable = app.durableAgent({ agent, approval: { tools: ['issueRefund'] } });
const out = durable.stream('Please refund order A-4471.');

if ((await out.finishReason) === 'suspended') {
  await durable.resume(out.runId, { approved: true });   // the held call now executes
}`,
			},
			{
				file: 'schedule.ts',
				code: `import { cron } from '@oribos/croner';

await schedules.save({
  id: 'morning-sweep',
  ...cron('0 9 * * *', { timezone: 'UTC' }),   // the injected next() fragment
  target: { agent: 'desk', input: 'write the daily digest' },
});`,
			},
		],
	},
	{
		id: 'memory',
		tab: 'Memory',
		claim: 'Threads, resources, and history — persistent where you choose.',
		bullets: [
			{
				lead: 'Thread / resource identity',
				text: 'the conversation is named per call, so one agent serves every one.',
			},
			{
				lead: 'Message history, on by default',
				text: 'the recent window is recalled into the prompt; recall() reads the rest.',
			},
			{ lead: 'Working memory', text: 'an opt-in, resource-scoped record injected as a system message.' },
			{ lead: 'Storage ports', text: 'in-memory defaults; @oribos/sqlite covers all of them.' },
		],
		files: [
			{
				file: 'memory.ts',
				code: `import { Memory, createInMemoryStore } from '@oribos/core/memory';

const memory = new Memory({ storage: createInMemoryStore() });
const agent = new Agent({ name, instructions, model, memory });

await agent.generate('Should I bring a rain jacket?', {
  memory: { thread: 'trip-lisbon', resource: 'user-42' },   // identity is per call
});`,
			},
			{
				file: 'sqlite.ts',
				code: `import { createSqliteStorage } from '@oribos/sqlite';

const storage = createSqliteStorage({ path: 'oribos.db' });   // one adapter, all four ports

const app = createApp({
  storage: { memory: storage.memory, durableAgent: storage.agentRunSnapshots },
});`,
			},
		],
	},
	{
		id: 'mcp',
		tab: 'MCP',
		claim: 'Serve your tools over MCP — and bring MCP tools in.',
		bullets: [
			{ lead: '@oribos/mcp-server', text: 'your tools served over MCP, HTTP or stdio.' },
			{ lead: '@oribos/mcp-client', text: "another server's tools become ordinary Oribos tools." },
			{ lead: 'Tools stay plain objects', text: "no registry — a tool's name is its key in the container." },
		],
		files: [
			{
				file: 'server.ts',
				code: `import { createMcpServer } from '@oribos/mcp-server';

const server = createMcpServer({ name: 'weather', version: '${VERSION}', tools: { weather } });

export default server.fetch;   // the same tools over MCP — HTTP or stdio`,
			},
			{
				file: 'client.ts',
				code: `import { createMcpClient } from '@oribos/mcp-client';

const client = await createMcpClient({ transport: { type: 'http', url } });

const agent = new Agent({ name, model, tools: client.tools });   // remote tools, as plain tools`,
			},
		],
	},
];

const panelPattern = /<div\b[^>]*\bdata-feature-panel\b[^>]*>/gi;
const tabPattern = /<button\b[^>]*\bdata-feature-tab\b[^>]*>[\s\S]*?<\/button>/gi;

/** Each feature panel's opening tag and the markup up to the next panel. */
function featurePanels(section: string): { tag: string; body: string }[] {
	const openings = [...section.matchAll(panelPattern)];
	return openings.map((opening, index) => ({
		tag: opening[0],
		body: section.slice((opening.index ?? 0) + opening[0].length, openings[index + 1]?.index ?? section.length),
	}));
}

/** The label of a `<button>` token: its opening tag and the text between the tags. */
function buttonOf(token: string): { tag: string; label: string } {
	const tag = token.slice(0, token.indexOf('>') + 1);
	return { tag, label: textOf(token.slice(tag.length).replace(/<\/button>$/i, '')) };
}

/** SPEC §3.2/§7.1/§7.3 over the built home page. */
export function featureIssues(page: { path: string; html: string }): string[] {
	const section = elementOf(page.html, 'section', 'id="features"');
	if (section === null) return [`${page.path}: no #features section (SPEC §3.2)`];

	const issues: string[] = [];
	if (!textOf(section).includes(featureKicker)) {
		issues.push(`${page.path}: the section has no \`${featureKicker}\` kicker (SPEC §3.2)`);
	}

	const tabs = [...section.matchAll(tabPattern)].map((match) => match[0]);
	if (tabs.length !== features.length) {
		issues.push(`${page.path}: ${tabs.length} feature tabs, expected ${features.length} (SPEC §3.2)`);
	}
	const panels = featurePanels(section);
	if (panels.length !== features.length) {
		issues.push(`${page.path}: ${panels.length} feature panels, expected ${features.length} (SPEC §3.2)`);
	}
	panels.forEach((panel, index) => {
		const hidden = hasAttribute(panel.tag, 'hidden');
		if (hidden !== (index !== 0)) {
			issues.push(
				`${page.path}: the ${index === 0 ? 'first' : `#${index + 1}`} feature panel ${hidden ? 'is hidden' : 'is visible'} — without JS the first panel is the one shown (SPEC §3.2)`,
			);
		}
	});

	const pageText = textOf(page.html);
	const pageBlocks = codeBlocksOf(page.html);

	features.forEach((feature, index) => {
		const tab = tabs[index];
		const tabParts = tab === undefined ? undefined : buttonOf(tab);
		if (tabParts !== undefined) {
			if (tabParts.label !== feature.tab) {
				issues.push(
					`${page.path}: feature tab ${index + 1} reads \`${tabParts.label}\`, expected \`${feature.tab}\` (SPEC §3.2)`,
				);
			}
			const id = attributeValue(tabParts.tag, 'id');
			if (id !== feature.id) {
				issues.push(
					`${page.path}: the \`${feature.tab}\` tab has id \`${id ?? 'nothing'}\`, expected \`${feature.id}\` — \`#${feature.id}\` direct-links it (SPEC §2.5)`,
				);
			}
		}

		const claimCount = occurrences(pageText, feature.claim);
		if (claimCount !== 1) {
			issues.push(
				`${page.path}: \`${feature.claim}\` appears ${times(claimCount)} — a panel's content stays in its panel (SPEC §3.2)`,
			);
		}

		const panel = panels[index];
		if (panel === undefined) return;

		if (tabParts !== undefined) {
			const controls = attributeValue(tabParts.tag, 'aria-controls');
			const panelId = attributeValue(panel.tag, 'id');
			if (panelId === null || controls !== panelId) {
				issues.push(
					`${page.path}: the \`${feature.tab}\` tab controls \`${controls ?? 'nothing'}\`, expected the panel it names (SPEC §3.2)`,
				);
			}
			if (attributeValue(panel.tag, 'aria-labelledby') !== feature.id) {
				issues.push(`${page.path}: the \`${feature.tab}\` panel is not labelled by its tab (SPEC §3.2)`);
			}
		}

		const claim = panel.body.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1];
		if (claim === undefined || textOf(claim) !== feature.claim) {
			issues.push(
				`${page.path}: the \`${feature.tab}\` claim is ${claim === undefined ? 'missing' : `\`${textOf(claim)}\``}, expected the §3.2 sentence`,
			);
		}

		const bullets = [...panel.body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => textOf(match[1]!));
		if (bullets.length !== feature.bullets.length) {
			issues.push(
				`${page.path}: the \`${feature.tab}\` panel carries ${bullets.length} bullets, expected ${feature.bullets.length} (SPEC §3.2)`,
			);
		}
		feature.bullets.forEach((bullet, bulletIndex) => {
			const expected = `${bullet.lead} — ${bullet.text}`;
			if (bullets[bulletIndex] !== expected) {
				issues.push(
					`${page.path}: the \`${feature.tab}\` bullet ${bulletIndex + 1} is \`${bullets[bulletIndex] ?? 'missing'}\`, expected \`${expected}\` (SPEC §3.2)`,
				);
			}
		});

		const fileTabs = [...panel.body.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)]
			.map((match) => buttonOf(match[0]))
			.filter((button) => attributeValue(button.tag, 'role') === 'tab')
			.map((button) => button.label);
		const names = feature.files.map((file) => file.file);
		if (fileTabs.length !== names.length || fileTabs.some((name, position) => name !== names[position])) {
			issues.push(
				`${page.path}: the \`${feature.tab}\` card shows [${fileTabs.join(', ')}], expected [${names.join(', ')}] (SPEC §7.1)`,
			);
		}

		const blocks = codeBlocksOf(panel.body);
		feature.files.forEach((file, fileIndex) => {
			const code = blocks[fileIndex];
			if (code !== file.code) {
				issues.push(`${page.path}: \`${file.file}\` is not the §7.3 snippet verbatim (SPEC §7.3)`);
			}
			if (code !== undefined && code.split('\n').length > maxFeatureLines) {
				issues.push(
					`${page.path}: the \`${file.file}\` snippet is ${code.split('\n').length} lines — the feature cards cap at ${maxFeatureLines} (SPEC §7.3)`,
				);
			}
			const codeCount = pageBlocks.filter((block) => block === file.code).length;
			if (codeCount !== 1) {
				issues.push(
					`${page.path}: \`${file.file}\` appears ${times(codeCount)} — a panel's content stays in its panel (SPEC §3.2)`,
				);
			}
		});

		for (const pre of panel.body.matchAll(/<pre\b[^>]*>/gi)) {
			const missing = missingCodeSurface(pre[0]);
			if (missing.includes('astro-code')) {
				issues.push(`${page.path}: a \`${feature.tab}\` code block is not the \`astro-code\` surface (SPEC §8.5)`);
			} else if (missing.length > 0) {
				issues.push(`${page.path}: a \`${feature.tab}\` code block is missing its Shiki theme pair (SPEC §8.5)`);
			}
		}
	});

	const sectionText = textOf(section);
	for (const { term, reason } of terminologyHits(sectionText)) {
		issues.push(`${page.path}: the feature tabs read \`${term}\` — ${reason}`);
	}

	return issues;
}

/** SPEC §3.2/§2.7: the shipped script that switches tabs, follows the hash and takes the keys. */
export function featureScriptIssues(scripts: readonly string[]): string[] {
	const issues: string[] = [];
	const some = (predicate: (script: string) => boolean): boolean => scripts.some(predicate);

	if (!some((script) => script.includes('data-feature-tab') && script.includes('data-feature-panel'))) {
		issues.push('no shipped script ties the `data-feature-tab` buttons to their `data-feature-panel` panels (SPEC §3.2)');
	}
	if (!some((script) => script.includes('location.hash'))) {
		issues.push('no shipped script reads `location.hash` — a `#agents`-style link must activate its tab (SPEC §3.2)');
	}
	if (!some((script) => script.includes('hashchange'))) {
		issues.push('no shipped script follows `hashchange` — a changed hash activates its tab (SPEC §3.2)');
	}
	if (!some((script) => script.includes('ArrowRight') && script.includes('ArrowLeft'))) {
		issues.push('the feature tabs do not take the arrow keys (SPEC §2.7)');
	}
	if (!some((script) => script.includes('aria-selected'))) {
		issues.push('no shipped script marks the selected tab with `aria-selected` (SPEC §3.2)');
	}

	return issues;
}
