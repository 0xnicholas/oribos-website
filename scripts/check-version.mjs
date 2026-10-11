#!/usr/bin/env node
/**
 * The version single-point gate (SPEC-revamp §4.6, §2.10-6) over the built site: the only
 * version literals are the header pill — which reads `v{version}` from `src/lib/version.ts` and
 * links the releases page — and the MCP snippet's `version` field, which must read the same
 * constant. A release literal anywhere else, in any built file, is a finding. The rules live in
 * `src/lib/version-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-version.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { failGate, reportIssues, startGate, textFiles } from './lib/cli.mjs';
import { VERSION } from '../src/lib/version.ts';
import { versionIssues } from '../src/lib/version-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const files = textFiles(dist);

if (files.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no text file — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const issues = versionIssues(files);

reportIssues(
	issues,
	`${files.length} built file(s): version ${VERSION} only in the header pill and the MCP snippet's \`version\` field`,
);

failGate(issues, {
	summary: `version-literal finding(s) (SPEC-revamp §4.6).`,
	hint: 'Bump src/lib/version.ts; the pill and the MCP snippet read it, and no copy states a version of its own.',
});
console.log('\nThe version has one source.');
