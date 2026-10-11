#!/usr/bin/env node
/**
 * The red-line scan over the built site (SPEC §8.8 ④, §9.2, SPEC-revamp §4): the retired
 * `coming soon` status, competitor names, counting-style figures, `MIT`, the retired
 * `@balsa/*` / `@balsats/*` scopes, the retired repository / domain names (issue #18 Testing #4),
 * and the RAG / evals line keyword pages must not cross. Install-class commands are held to two
 * slots instead — `scripts/check-install.mjs`. The rules and their reasons live in
 * `src/lib/copy-rules.ts`; this script walks `dist/` and reports.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-copy.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { failGate, reportIssues, startGate, textFiles } from './lib/cli.mjs';
import { copyIssues } from '../src/lib/copy-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const files = textFiles(dist);

if (files.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no text file — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const issues = copyIssues(files);

reportIssues(
	issues,
	`${files.length} built file(s): no retired \`coming soon\`, competitor name, counting figure, \`MIT\`, retired scope, retired name or RAG/evals breach`,
);

failGate(issues, {
	summary: `red-line finding(s) in the built site (SPEC §9.2).`,
	hint: 'The reason printed after each finding names the spec section it breaks.',
});
console.log('\nRed lines hold.');
