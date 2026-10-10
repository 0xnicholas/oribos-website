import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
	corpusOf,
	normalize,
	plainBlocks,
	sectionOf,
	specBlocks,
	specTables,
	tableRows,
	verbatimIssues,
	withoutLabel,
	type SpecFile,
} from './verbatim-rules.ts';

const realSpec = readFileSync(fileURLToPath(new URL('../../docs/SPEC-revamp.md', import.meta.url)), 'utf8');

// A miniature SPEC with the shapes the real one uses: a labelled line block, a wrapped
// paragraph block, a skeleton block with CJK, and a question/answer table.
const spec = `# SPEC

### 3.2 facts band

\`\`\`
alpha fact one
beta fact two
\`\`\`

### 4.3 chip

\`\`\`
tag（mono）：  agent prompt — self-contained
按钮：        Copy agent prompt
\`\`\`

\`\`\`
Add a working agent.
Install: npm i @oribos/core
\`\`\`

### 4.4 answer

\`\`\`
Yes — on npm, and every
package ships alongside.
\`\`\`

### 5.2 keyword pages

\`\`\`
H1（逐字不动）+ 引言段
\`\`\`

\`\`\`
A framework you call from the app you already run.
\`\`\`

### 5.3 new FAQ

| 页 | Q | A | 意图 |
| --- | --- | --- | --- |
| /x | Does it scale? | Scale is your app's job, not the library's. | 「scale」 |
`;

const facts: SpecFile = { path: 'src/content/facts/one.json', text: '{"items": ["alpha fact one", "beta fact two"]}' };
const chip: SpecFile = {
	path: 'src/content/agent-prompt/default.json',
	text: '{"tag": "agent prompt — self-contained", "button": "Copy agent prompt", "payload": "Add a working agent.\\nInstall: npm i @oribos/core"}',
};

/** The expectations the miniature SPEC above satisfies. */
const expectations = () => ({
	blocks: [
		{ heading: '### 3.2', block: 0, mode: 'lines' as const, scope: ['src/content/facts'] },
		{ heading: '### 4.3', block: 0, mode: 'lines' as const, stripLabel: true, scope: ['src/content/agent-prompt'] },
		{ heading: '### 4.3', block: 1, mode: 'paragraph' as const, scope: ['src/content/agent-prompt'] },
		{ heading: '### 4.4', block: 0, mode: 'paragraph' as const, scope: ['src/content/faq'] },
		{ heading: '### 5.2', block: 1, mode: 'paragraph' as const, scope: ['src/content/keyword-pages/x.json'] },
	],
	tables: [
		{
			heading: '### 5.3',
			columns: [1, 2],
			scope: ['src/content/keyword-pages'],
			fileFor: (cells: readonly string[]) => `src/content/keyword-pages${cells[0]}.json`,
		},
	],
});

const faq: SpecFile = { path: 'src/content/faq/on-npm.json', text: '{"answer": "Yes — on npm, and every package ships alongside."}' };
const intro: SpecFile = { path: 'src/content/keyword-pages/x.json', text: '{"intro": "A framework you call from the app you already run."}' };
const tableFaq: SpecFile = {
	path: 'src/content/keyword-pages/x.json',
	text: '{"faq": [{"question": "Does it scale?", "answer": "Scale is your app\'s job, not the library\'s."}]}',
};

test('extraction: sections, plain blocks and table rows', () => {
	assert.equal(plainBlocks(sectionOf(spec, '### 4.3')).length, 2);
	assert.equal(plainBlocks(sectionOf(spec, '### 3.2'))[0], 'alpha fact one\nbeta fact two');
	assert.equal(sectionOf(spec, '### 4.4').includes('### 5.2'), false, 'a section ends at the next heading');
	assert.equal(sectionOf(spec, '### 9.9'), '');
	const rows = tableRows(sectionOf(spec, '### 5.3'));
	assert.deepEqual(rows.map((row) => row[1]), ['Does it scale?']);
	assert.deepEqual(rows.map((row) => row[2]), ['Scale is your app\'s job, not the library\'s.']);
});

test('extraction helpers: labels out, whitespace collapsed', () => {
	assert.equal(withoutLabel('tag（mono）：  agent prompt — self-contained'), 'agent prompt — self-contained');
	assert.equal(withoutLabel('Docs:         Concepts and reference.'), 'Concepts and reference.');
	assert.equal(normalize('Yes — on npm, and every\npackage ships alongside.'), 'Yes — on npm, and every package ships alongside.');
});

test('verbatim copy in JSON collections is clean, escapes included', () => {
	const files = [facts, chip, faq, intro, tableFaq];
	assert.deepEqual(verbatimIssues(spec, files, expectations()), [], JSON.stringify(verbatimIssues(spec, files, expectations())));
});

test('a drifted character is a finding', () => {
	const drifted: SpecFile = { ...intro, text: '{"intro": "A framework you call from the app you already run!"}' };
	const issues = verbatimIssues(spec, [facts, chip, faq, tableFaq, drifted], expectations());
	assert.equal(issues.length, 1);
	assert.match(issues[0]!, /keyword-pages\/x\.json: locked copy is not verbatim — «A framework you call/);
});

test('a missing word inside a newline-escaped JSON string is still a finding', () => {
	const shy: SpecFile = { ...chip, text: '{"tag": "agent prompt — self-contained", "button": "Copy agent prompt", "payload": "Add a agent.\\nInstall: npm i @oribos/core"}' };
	const issues = verbatimIssues(spec, [facts, shy, faq, tableFaq, intro], expectations());
	assert.ok(issues.some((issue) => /«Add a working agent\. Install: npm i @oribos\/core»/.test(issue)), JSON.stringify(issues));
});

test('a block the SPEC no longer carries is a finding, not a pass', () => {
	const shrunken = spec.replace(/### 4\.4[\s\S]*?### 5\.2/, '### 5.2');
	const issues = verbatimIssues(shrunken, [facts, chip, faq, intro], expectations());
	assert.ok(issues.some((issue) => /### 4\.4: locked block 0 is gone/.test(issue)));
});

test('the expectation table covers the SPEC\'s locked sections', () => {
	const headings = new Set([...specBlocks, ...specTables].map((expectation) => expectation.heading));
	for (const heading of ['### 3.2', '### 3.6', '### 4.3', '### 4.4', '### 4.5', '### 5.2', '### 5.3']) {
		assert.ok(headings.has(heading), `expected ${heading} in the expectation table`);
	}
	const sections5_2 = specBlocks.filter((expectation) => expectation.heading === '### 5.2');
	assert.deepEqual(sections5_2.map((expectation) => expectation.block), [1, 2, 3, 4], 'block 0 is the skeleton, 1–4 the intros');
});

test('the corpus holds JSON copy as parsed strings, not raw file text', () => {
	const corpus = corpusOf([chip], ['src/content/agent-prompt']);
	assert.deepEqual(corpus, [normalize('agent prompt — self-contained\nCopy agent prompt\nAdd a working agent.\nInstall: npm i @oribos/core')]);
	assert.deepEqual(corpusOf([facts], ['src/content/none']), []);
});

test('the §5.3 table cells are held against the keyword pages', () => {
	const issues = verbatimIssues(spec, [facts, chip, faq, tableFaq, intro], expectations());
	assert.deepEqual(issues, [], JSON.stringify(issues));
	const drifted: SpecFile = {
		...tableFaq,
		text: '{"faq": [{"question": "Does it scale?", "answer": "Scale is your job."}]}',
	};
	const findings = verbatimIssues(spec, [facts, chip, faq, drifted, intro], expectations());
	assert.equal(findings.length, 1);
	assert.match(findings[0]!, /locked copy is not verbatim — «Scale is your app's job/);
});

test('a table row\'s copy on the wrong page is a finding — the row names its file', () => {
	const wrongPage: SpecFile = {
		path: 'src/content/keyword-pages/other.json',
		text: '{"faq": [{"question": "Does it scale?", "answer": "Scale is your app\'s job, not the library\'s."}]}',
	};
	const findings = verbatimIssues(spec, [facts, chip, faq, wrongPage, intro], expectations());
	assert.equal(findings.length, 2, JSON.stringify(findings));
	assert.match(findings[0]!, /keyword-pages\/x\.json: locked copy is not verbatim/);
});

test('the gate defaults to the real expectation table', () => {
	// The real SPEC against empty content: every expectation must fire, none silently pass.
	const issues = verbatimIssues(realSpec, []);
	assert.ok(issues.length >= specBlocks.length + 2, `expected findings for every expectation, got ${issues.length}`);
});
