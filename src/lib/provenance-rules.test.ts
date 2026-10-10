import assert from 'node:assert/strict';
import { test } from 'node:test';
import { carriedIssues, skeletonRef, type CarriedChange } from './provenance-rules.ts';

const baseFaq = '{"order": 2, "question": "Is Oribos on npm yet?", "answer": "Not yet."}';
const publishedFaq = '{"order": 2, "question": "Is Oribos on npm yet?", "answer": "Yes — Oribos is on npm."}';
const baseKeyword = '{"h1": "AI agents", "faq": [{"question": "own loop?", "answer": "No."}]}';
const sanctionedKeyword = '{"h1": "AI agents", "intro": "An Oribos agent is a small object.", "faq": [{"question": "own loop?", "answer": "No."}, {"question": "see it run?", "answer": "stream()."}]}';

const change = (over: Partial<CarriedChange>): CarriedChange => ({
	path: 'src/content/faq/on-npm.json',
	status: 'M',
	baseText: baseFaq,
	text: publishedFaq,
	...over,
});

test('a tree identical to the skeleton is clean', () => {
	assert.deepEqual(carriedIssues([]), []);
});

test('the sanctioned changes are clean', () => {
	assert.deepEqual(
		carriedIssues([
			change({}),
			change({ path: 'src/content/agent-prompt/default.json', status: 'A', baseText: '', text: '{"payload": "…"}' }),
			change({ path: 'src/content/social-proof/default.json', status: 'D', text: '' }),
			change({
				path: 'src/content/keyword-pages/ai-agents.json',
				baseText: baseKeyword,
				text: sanctionedKeyword,
			}),
			change({ path: 'src/lib/links.ts', deletions: 0, text: 'const LINKS = {};\nexport { LINKS };\n' }),
			change({ path: 'src/lib/version.ts', status: 'A', baseText: '', text: "export const VERSION = '0.6.0';\n" }),
		]),
		[]);
});

test('a carried file with no sanction is a finding', () => {
	const issues = carriedIssues([change({ path: 'src/content/about/story.json', status: 'M', baseText: 'x', text: 'y' })]);
	assert.equal(issues.length, 1);
	assert.match(issues[0]!, /src\/content\/about\/story\.json: differs from the skeleton without a sanctioned change/);
	assert.match(issues[0]!, new RegExp(skeletonRef));
});

test('a sanction does not cover a different status', () => {
	const issues = carriedIssues([change({ path: 'src/content/faq/on-npm.json', status: 'D', text: '' })]);
	assert.match(issues[0]!, /is D against the skeleton, the sanction covers M/);
});

test('a modified JSON may only move its sanctioned keys', () => {
	const touchingQuestion = change({ text: '{"order": 2, "question": "On npm?", "answer": "Yes — Oribos is on npm."}' });
	assert.match(carriedIssues([touchingQuestion]).join('\n'), /outside `answer`/);

	const touchingIntro = change({
		path: 'src/content/keyword-pages/ai-agents.json',
		baseText: baseKeyword,
		text: sanctionedKeyword.replace('"AI agents"', '"AI agents — small"'),
	});
	assert.match(carriedIssues([touchingIntro]).join('\n'), /outside `intro`, `faq`/);
});

test('nested sanctioned values may differ freely, unfrozen ones may not', () => {
	const nested = change({
		path: 'src/content/features/mcp.json',
		baseText: '{"label": "MCP", "files": [{"code": "version: \'0.5.0\'"}]}',
		text: '{"label": "MCP", "files": [{"code": "version: \'{version}\'"}]}',
	});
	assert.deepEqual(carriedIssues([nested]), []);
	const renamed = change({
		path: 'src/content/features/mcp.json',
		baseText: '{"label": "MCP", "files": []}',
		text: '{"label": "Model Context Protocol", "files": []}',
	});
	assert.match(carriedIssues([renamed]).join('\n'), /outside `files`/);
});

test('an additions-only file that loses a line is a finding', () => {
	const issues = carriedIssues([change({ path: 'src/lib/links.ts', deletions: 1, text: 'const LINKS = {};\n' })]);
	assert.match(issues[0]!, /removes 1 line\(s\)/);
});

test('an additions-only file may only add the sanctioned constant', () => {
	const releases = change({
		path: 'src/lib/links.ts',
		deletions: 0,
		addedLines: ['\t/** The header pill\'s target (SPEC-revamp §4.2). */', "\treleases: 'https://github.com/0xnicholas/oribos-framework/releases',"],
	});
	assert.deepEqual(carriedIssues([releases]), []);
	const smuggled = change({
		path: 'src/lib/links.ts',
		deletions: 0,
		addedLines: ["\tshop: 'https://shop.example.com',"],
	});
	const issues = carriedIssues([smuggled]);
	assert.match(issues[0]!, /adds lines outside the sanctioned constant/);
});

test('unparseable JSON is a finding, not a crash', () => {
	const issues = carriedIssues([change({ text: '{not json' })]);
	assert.match(issues[0]!, /is not valid JSON against the skeleton/);
});
