#!/usr/bin/env node
/**
 * The 【终稿·勿改】 verbatim gate (SPEC-revamp 完成定义, issue #50): the copy the SPEC locks is
 * read out of `docs/SPEC-revamp.md` at gate time and must sit in the content collections
 * character for character. Which blocks are locked, and which collection carries each, is the
 * expectation table in `src/lib/verbatim-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-verbatim.mjs [--root <dir>] [--spec <file>]
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { failGate, filesUnder, reportIssues, startGate } from './lib/cli.mjs';
import { verbatimIssues } from '../src/lib/verbatim-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['spec', 'content'] });

const specFile = path.join(repoRoot, options.spec ?? 'docs/SPEC-revamp.md');
if (!existsSync(specFile)) {
	console.error(`✗ no SPEC at ${path.relative(repoRoot, specFile)} — the locked copy is read out of it at gate time`);
	process.exit(1);
}
const spec = readFileSync(specFile, 'utf8');

const contentDir = path.join(repoRoot, options.content ?? 'src/content');
const contentExtensions = ['.json', '.md', '.yaml', '.yml'];
const files = filesUnder(contentDir)
	.filter((file) => contentExtensions.some((extension) => file.endsWith(extension)))
	.map((file) => ({ path: `src/content/${file}`, text: readFileSync(path.join(contentDir, file), 'utf8') }));
if (files.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, contentDir)} holds no content file — the collections carry the locked copy`);
	process.exit(1);
}

const issues = verbatimIssues(spec, files);

reportIssues(issues, `${files.length} content file(s): every 【终稿·勿改】 block verbatim against ${path.basename(specFile)}`);

failGate(issues, {
	summary: 'verbatim finding(s) against the SPEC\'s locked copy (SPEC-revamp 完成定义, issue #50).',
	hint: 'Locked copy is read out of docs/SPEC-revamp.md at gate time; a finding means the collections drifted from it — or the SPEC moved and the expectation table in src/lib/verbatim-rules.ts must follow (§9 登记).',
});
console.log('\nLocked copy holds verbatim.');
