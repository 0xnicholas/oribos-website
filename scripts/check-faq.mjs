#!/usr/bin/env node
/**
 * The global-FAQ gate (SPEC §3.7/§9.2, SPEC-revamp §4.4) over every built page that carries the
 * FAQ: the `#faq` section with its heading, nine `<details>` pairs whose questions and answers are
 * the §3.7 copy verbatim and in order — question 2's answer in its published state (SPEC-revamp
 * §4.4) — no link inside an answer, the answers' iron rules — no competitor name, no counting
 * figure, no foreign package scope, the CONTEXT.md vocabulary, and the RAG / evals line only
 * question 7 answers — and the §5.5 audited text roles on the page background. Install commands in
 * an answer are held to the slot discipline by `scripts/check-install.mjs`. Every page rendering
 * the shared FaqList joins this gate, so a use-case page cannot drift from the home page's copy.
 * The rules live in `src/lib/faq-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-faq.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, runChecks, startGate } from './lib/cli.mjs';
import { carriesFaq, faqIssues } from '../src/lib/faq-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const pages = builtPages(dist);
const faqPages = pages.filter((page) => carriesFaq(page.html));

if (pages.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}
if (faqPages.length === 0) {
	console.error('✗ no built page carries the FAQ — the home page renders the shared FaqList (SPEC §3.7)');
	process.exit(1);
}

const checks = faqPages.map((page) => [
	faqIssues(page),
	`FAQ ×9: ${page.path} — the §3.7 pairs verbatim, no answer link, the iron rules, the RAG / evals line and the §5.5 audited roles`,
]);

const issues = runChecks(checks);

failGate(issues, {
	summary: `FAQ problem(s) (SPEC §3.7/§9.2).`,
	hint: 'The FAQ copy lives in src/content/faq/; the spec copy lives in src/lib/faq-rules.ts.',
});
console.log('\nThe global FAQ holds.');
