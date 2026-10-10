#!/usr/bin/env node
/**
 * The anti-residual gate (SPEC-revamp 完成定义, issue #50): the retired names — the v1 `--sl-*`
 * token namespace, the social-proof band and its anchor, the v1 shared use-case header art, the
 * `coming soon` release status, the v1 dual-version switch mechanism, and the retired brand
 * names — must have zero hits in the site source and in any built file. The target list lives in
 * `src/lib/residual-rules.ts`, next to the exemptions that state the terms in order to forbid
 * them.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-residuals.mjs [--root <dir>] [--src <dir>] [--dist <dir>]
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { failGate, filesUnder, reportIssues, startGate, textFiles } from './lib/cli.mjs';
import { residualIssues } from '../src/lib/residual-rules.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['src', 'dist'] });

// Site source: the files `pnpm build` reads — components, layouts, pages, content, styles, lib.
const sourceExtensions = ['.astro', '.ts', '.css', '.json', '.mjs', '.html', '.svg', '.txt', '.xml'];
const src = path.join(repoRoot, options.src ?? 'src');
const srcFiles = filesUnder(src)
	.filter((file) => sourceExtensions.some((extension) => file.endsWith(extension)))
	.map((file) => ({ path: `src/${file}`, text: readFileSync(path.join(src, file), 'utf8') }));

const dist = path.join(repoRoot, options.dist ?? 'dist');
const distFiles = textFiles(dist);
if (distFiles.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no text file — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const issues = residualIssues([...srcFiles, ...distFiles]);

reportIssues(
	issues,
	`${srcFiles.length} source + ${distFiles.length} built file(s): zero residue of every retired name`,
);

failGate(issues, {
	summary: 'residual finding(s) in site source or built output (SPEC-revamp 完成定义, issue #50).',
	hint: 'The retired names and the exemptions that may state them live in src/lib/residual-rules.ts; a finding in site copy means a retired mechanism is back.',
});
console.log('\nZero residue holds.');
