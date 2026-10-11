#!/usr/bin/env node
/**
 * The install-slot gate (SPEC-revamp §4.6, §2.10-5) over the built site: install-class commands
 * are allowed in exactly two slots — the global FAQ's second answer and the agent prompt payload
 * the chip CTA copies. A match anywhere else, in any built file, is a finding; a missing slot is
 * one too. The rules live in `src/lib/install-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-install.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { failGate, reportIssues, startGate, textFiles } from './lib/cli.mjs';
import { installIssues } from '../src/lib/install-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const files = textFiles(dist);

if (files.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no text file — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const issues = installIssues(files);

reportIssues(
	issues,
	`${files.length} built file(s): install commands only in the FAQ's npm answer and the agent prompt payload`,
);

failGate(issues, {
	summary: `install-command finding(s) outside the two slots (SPEC-revamp §4.6).`,
	hint: "The two slots are the global FAQ's second answer (src/content/faq/on-npm.json) and the chip CTA's payload (src/content/agent-prompt/default.json).",
});
console.log('\nInstall slots hold.');
