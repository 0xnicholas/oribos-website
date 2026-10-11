#!/usr/bin/env node
/**
 * The carried-content gate (SPEC-revamp 完成定义, issue #50): the working tree's content
 * collections and copy-bearing constants are diffed against `build/01-skeleton` @ `481a89b` —
 * the truth source every `沿用 build` marker points at — and only the changes SPEC-revamp
 * sanctions may differ. The sanctions live in `src/lib/provenance-rules.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-provenance.mjs [--root <dir>] [--ref <commit>]
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { failGate, reportIssues, startGate } from './lib/cli.mjs';
import { carriedIssues, skeletonRef } from '../src/lib/provenance-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['ref'] });
const ref = options.ref ?? skeletonRef;

const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });

// The carried regions: the whole content tree plus the copy-bearing constants. Site code
// (components, layouts, styles) is the revamp's own work and is not compared here.
const scope = [
	'src/content',
	'src/lib/brand.ts',
	'src/lib/site.ts',
	'src/lib/navigation.ts',
	'src/lib/links.ts',
	'src/lib/version.ts',
];

const statusLines = git(['diff', '--name-status', ref, '--', ...scope]).split('\n').filter(Boolean);
if (statusLines.length === 0 && !existsSync(path.join(repoRoot, 'src/content'))) {
	console.error('✗ no src/content to compare — run this gate from the repository (pnpm verify does)');
	process.exit(1);
}

const changes = statusLines.map((line) => {
	const [status, filePath] = line.split('\t');
	const absolute = path.join(repoRoot, filePath);
	let deletions = 0;
	let addedLines = [];
	if (status === 'M') {
		const numstat = git(['diff', '--numstat', ref, '--', filePath]).trim();
		deletions = Number(numstat.split('\t')[1] ?? 0);
		addedLines = git(['diff', '-U0', ref, '--', filePath])
			.split('\n')
			.filter((line) => line.startsWith('+') && !line.startsWith('+++'));
	}
	return {
		path: filePath,
		status,
		baseText: status === 'A' ? '' : git(['show', `${ref}:${filePath}`]),
		text: status === 'D' || !existsSync(absolute) ? '' : readFileSync(absolute, 'utf8'),
		deletions,
		addedLines,
	};
});

const issues = carriedIssues(changes);

reportIssues(
	issues,
	statusLines.length === 0
		? `working tree identical to ${ref} over ${scope.length} carried region(s)`
		: `${statusLines.length} carried file(s) differ from ${ref}: only SPEC-sanctioned changes among them`,
);

failGate(issues, {
	summary: `carried-content finding(s) against ${ref} (SPEC-revamp 完成定义, issue #50).`,
	hint: 'The skeleton\'s content collections and copy constants are frozen; the sanctions — and the fields they cover — live in src/lib/provenance-rules.ts.',
});
console.log('\nCarried content holds.');
