import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	carriesFaq,
	faqHeading,
	faqIssues,
	faqItems,
	sentenceCount,
	type FaqSpecItem,
} from './faq-rules.ts';

const page = (html: string) => ({ path: 'index.html', html: `<html><body>${html}</body></html>` });

const details = (item: FaqSpecItem) =>
	`<details><summary class="cursor-pointer py-4 font-semibold text-ink hover:text-acc">${item.question}</summary><p class="pb-4 text-base text-ink2">${item.answer}</p></details>`;

const section = (items: readonly FaqSpecItem[] = faqItems) =>
	`<section id="faq" data-faq class="scroll-mt-20 border-t border-line px-6 py-20"><div><h2 class="text-3xl font-semibold tracking-tight text-ink">${faqHeading}</h2><div>${items.map(details).join('')}</div></div></section>`;

test('a page with the FAQ passes every FAQ rule', () => {
	assert.deepEqual(faqIssues(page(section())), []);
	assert.equal(carriesFaq(section()), true);
	assert.equal(carriesFaq('<section id="faq">no marker</section>'), false);
});

test('the FAQ is #faq with the heading, nine <details> in the §3.7 order and a summary first', () => {
	assert.match(faqIssues(page('<p>nothing</p>'))[0]!, /no FAQ section/);

	const unanchored = page(section().replace('id="faq"', 'id="questions"'));
	assert.match(faqIssues(unanchored).join('\n'), /expected `faq`/);

	const renamed = page(section().replace(faqHeading, 'Questions'));
	assert.match(faqIssues(renamed)[0]!, /heading reads `Questions`/);

	const eight = page(section(faqItems.slice(0, 8)));
	assert.match(faqIssues(eight)[0]!, /carries 8 questions, expected 9/);

	const swapped = [...faqItems];
	[swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
	assert.match(faqIssues(page(section(swapped))).join('\n'), /question 1 reads `Is Oribos on npm yet\?`/);

	const summaryLater = page(section().replace('<details><summary', '<details><p>…</p><summary'));
	assert.match(faqIssues(summaryLater).join('\n'), /<summary> is not the first child/);
});

test('the questions and answers are the §3.7 copy, verbatim and once each', () => {
	const editedQuestion = page(section().replace('Does Oribos support MCP?', 'Does Oribos speak MCP?'));
	assert.match(faqIssues(editedQuestion).join('\n'), /question 6 reads `Does Oribos speak MCP\?`/);

	const editedAnswer = page(section().replace('No — neither is built in.', 'No.'));
	assert.match(faqIssues(editedAnswer).join('\n'), /answer to question 7 is not the §3\.7 text verbatim/);

	const extra = page(section().replace('</section>', '<details><summary>One more?</summary><p>Yes.</p></details></section>'));
	assert.match(faqIssues(extra).join('\n'), /carries 10 questions/);
});

test('an answer carries no link — answers are self-contained', () => {
	const linked = page(
		section().replace('Both ship with the first release.', 'Both ship with the first release — see <a href="/">the repo</a>.'),
	);
	assert.match(faqIssues(linked).join('\n'), /answer carries a link/);
});

test('the nine iron rules hold: no install command, competitor, counting figure or foreign scope', () => {
	const install = page(
		section().replace('Both ship with the first release.', 'Both ship with the first release — run npm install @oribos/mcp-server.'),
	);
	assert.match(faqIssues(install).join('\n'), /\[install-command\]/);

	const competitor = page(section().replace('Not yet.', 'Mastra is not there yet.'));
	assert.match(faqIssues(competitor).join('\n'), /\[competitor-name\]/);

	const counting = page(section().replace('Both ship with the first release.', 'Both ship with the first release; five fields are enough.'));
	assert.match(faqIssues(counting).join('\n'), /\[counting-figure\]/);

	const scope = page(section().replace('@oribos/mcp-server', '@balsa/mcp-server'));
	assert.match(faqIssues(scope).join('\n'), /packages are `@oribos\/\*`/);
});

test('RAG and evals appear in question 7 alone — the honest answer (SPEC §9.2)', () => {
	const elsewhere = page(
		section().replace('Every subsystem ships behind its own subpath export', 'Every subsystem ships behind its own subpath export; RAG is not in yet'),
	);
	assert.match(faqIssues(elsewhere).join('\n'), /RAG \/ evals line/);

	const onSeven = page(section());
	assert.deepEqual(faqIssues(onSeven), []);
});

test('the FAQ text wears the §5.5 audited roles on the page background', () => {
	const badRole = page(section().replace('text-ink2', 'text-acc-lo'));
	assert.match(faqIssues(badRole)[0]!, /FAQ section paints text with `text-acc-lo`/);

	const surface = page(section().replace('class="scroll-mt-20', 'class="bg-bg2 scroll-mt-20'));
	assert.match(faqIssues(surface)[0]!, /paints its own surface with `bg-bg2`/);
});

test('every §3.7 answer is one to three sentences', () => {
	for (const item of faqItems) {
		const count = sentenceCount(item.answer);
		assert.ok(count >= 1 && count <= 3, `${item.question}: ${count} sentence(s)`);
	}
	assert.equal(sentenceCount('Apache-2.0. Code and examples are licensed under it; the license covers code, not the name.'), 2);
	assert.equal(sentenceCount('Not yet.'), 1);
	assert.equal(sentenceCount('Pre-1.0: one. Two. Three. Four.'), 4);
});
