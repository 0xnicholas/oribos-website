#!/usr/bin/env node
/**
 * The artifact-shape gate (SPEC §8.1/§8.2): `output: 'static'`, no adapter package, and a
 * `dist/` with no server script in it — the deliverable is a portable static directory. The
 * rules live in `src/lib/static-rules.ts`; this script reads the config, package.json and the
 * list of built files.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-static.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { failGate, filesUnder, readJson, readText, runChecks, startGate } from './lib/cli.mjs';
import { staticOutputIssues } from '../src/lib/static-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');

const packageJson = readJson(path.join(repoRoot, 'package.json'));
const issues = staticOutputIssues({
	config: readText(path.join(repoRoot, 'astro.config.mjs')),
	packageJson: packageJson.value ?? null,
	distFiles: filesUnder(dist),
});

const checks = [
	[
		issues.filter((issue) => issue.includes('astro.config.mjs')),
		"astro.config.mjs: `output: 'static'`, no adapter",
	],
	[issues.filter((issue) => issue.includes('adapter package')), 'package.json: no @astrojs/* adapter installed'],
	[issues.filter((issue) => issue.startsWith('dist/')), 'dist/: no server script, worker or middleware — a portable static directory'],
];

failGate(runChecks(checks), {
	summary: `static-output violation(s) (SPEC §8.2).`,
	hint: 'The static build is the deliverable; an adapter would turn `dist/` into server output.',
});
console.log('\nStatic output holds.');
