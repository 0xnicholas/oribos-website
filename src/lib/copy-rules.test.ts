import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyIssues, isKeywordPage, redLineIds, redLineRules } from './copy-rules.ts';

const rules = (text: string, path = 'index.html') => copyIssues([{ path, text }]);

test('the retired `coming soon` status is caught anywhere', () => {
	assert.ok(rules('<p>Coming soon: agents inside your product.</p>').length > 0);
	assert.ok(rules('<p>The first version is coming soon.</p>').length > 0);
	assert.deepEqual(rules('<p>Every capability package ships alongside the core.</p>'), []);
});

test('competitor and reference-site names are found, case-insensitively', () => {
	assert.ok(rules('<p>Like Mastra, but lighter.</p>').length > 0);
	assert.ok(rules('<p>LangChain users will feel at home.</p>').length > 0);
});

test('counting-style figures are caught; the locked phrases of the spec are not', () => {
	for (const figure of ['five fields', 'five core subsystems', '12 packages', '3 tests', '500 KB', '2 million users']) {
		assert.ok(rules(`<p>${figure}</p>`).length > 0, `expected a finding for \`${figure}\``);
	}
	assert.deepEqual(rules('<p>An agent is a handful of fields.</p>'), []);
	assert.deepEqual(rules('<p>One small framework, three shapes.</p>'), []);
	assert.deepEqual(rules('<p>trace · gpt-4o-mini · 2 steps · 1.62s</p>'), []);
	assert.deepEqual(rules('<p>0 runtime dependencies</p>'), []);
});

test('`MIT` is caught as a word, and build-tool license banners are not the site face', () => {
	assert.ok(rules('<p>Licensed MIT.</p>').length > 0);
	assert.deepEqual(rules('<p>Submit a pull request.</p>'), []);
	assert.deepEqual(rules('/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */', 'index.css'), []);
});

test('the retired scopes are caught and the current one is not', () => {
	assert.ok(rules("import { Agent } from '@balsa/core';").length > 0);
	assert.ok(rules("import { Agent } from '@balsats/core';").length > 0);
	assert.deepEqual(rules("import { Agent } from '@oribos/core/agent';"), []);
});

test('the retired repository and domain names are findings in prose, not only in hrefs', () => {
	assert.ok(rules('<p>The source lived at github.com/0xnicholas/balsa-framework.</p>').length > 0);
	assert.ok(rules('<p>The source lived at github.com/0xnicholas/balsats-framework.</p>').length > 0);
	assert.ok(rules('<p>The docs lived at docs.balsajs.dev.</p>').length > 0);
	assert.ok(rules('<p>The site lived at balsats.com.</p>').length > 0);
	// The current names pass — and the bare word `balsa` (a wood, not a name we ship) is not a finding.
	assert.deepEqual(rules('<p>The source is github.com/0xnicholas/oribos-framework.</p>'), []);
	assert.deepEqual(rules('<p>Named after balsa, the wood.</p>'), []);
});

test('RAG and evals are keyword-page findings only', () => {
	assert.ok(rules('<p>RAG pipelines and evals.</p>', 'ai-agents/index.html').length > 0);
	// The two mentions the spec allows — the honest FAQ answer and the processors use-case
	// word — live on the home page, so the rule is scoped to the keyword routes.
	assert.deepEqual(rules('<p>Does Oribos support RAG or evals?</p>', 'index.html'), []);
	assert.deepEqual(rules('<p>Eval-style assertions can hang off processors.</p>', 'index.html'), []);
	assert.ok(isKeywordPage('ai-agent-framework/index.html'));
	assert.ok(isKeywordPage('ai-agent-framework.html'));
	assert.ok(!isKeywordPage('_astro/ai-agents.js'));
});

test('one finding per rule per line, not one per occurrence', () => {
	const found = rules('<p>RAG, evals and more RAG.</p>', 'ai-agents/index.html');
	assert.equal(found.length, 1);
});

test('the §9.2 red-line set is the five site-wide rules, keyword-page scope excluded', () => {
	assert.deepEqual(
		[...redLineIds],
		['competitor-name', 'counting-figure', 'mit-license', 'retired-scope', 'retired-name'],
	);
	assert.ok(redLineRules.length > 0);
	assert.ok(redLineRules.every((rule) => (redLineIds as readonly string[]).includes(rule.id)));
	assert.ok(!redLineRules.some((rule) => rule.id === 'rag-evals'));
	assert.ok(!redLineRules.some((rule) => rule.id === 'coming-soon'));
});
