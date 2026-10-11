#!/usr/bin/env node
/**
 * The link gate (SPEC §8.8 ⑤): every in-site link resolves to a built page or to one of the
 * registered pages of §2.1 that a later build slice lands, every `#…` anchor — including the
 * home-page anchors keyword pages link into — exists on its target, and every external link is
 * one of the constants in `src/lib/links.ts` under a current name. The rules live in
 * `src/lib/link-rules.ts`; this script builds the route index out of `dist/`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-links.mjs [--root <dir>] [--dist <dir>]
 */
import path from 'node:path';
import { builtPages, failGate, reportIssues, startGate } from './lib/cli.mjs';
import { linkIssues, retiredNames, routeOfHtmlFile } from '../src/lib/link-rules.ts';
import { allowedExternalLinks } from '../src/lib/links.ts';
import { pages as registered } from '../src/lib/pages.ts';

const { repoRoot, options } = startGate(import.meta.url, process.argv.slice(2), { values: ['dist'] });
const dist = path.join(repoRoot, options.dist ?? 'dist');
const pages = builtPages(dist);

if (pages.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} holds no HTML page — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const routes = new Map(pages.map((page) => [routeOfHtmlFile(page.path), page.html]));

// A link resolves when the build serves the page, or when the target is one of the eleven
// registered pages (SPEC §2.1) whose build slice has not landed yet. A typo is neither, so it
// still fails; once every slice is in, the registry adds nothing the build does not already have.
const registeredRoutes = new Set(registered.map((page) => page.route));

const issues = linkIssues(pages, {
	routeExists: (route) => routes.has(route) || registeredRoutes.has(route),
	pageHtml: (route) => routes.get(route),
	allowedExternal: allowedExternalLinks,
	retiredNames,
});

const pending = [...registeredRoutes].filter((route) => !routes.has(route));
if (pending.length > 0) {
	console.log(`· ${pending.length} registered page(s) not built yet: ${pending.join(' ')}`);
}

reportIssues(
	issues,
	`${pages.length} page(s): every link resolves (built or registered) and every external link is a links constant`,
);
failGate(issues, {
	summary: `link problem(s) (SPEC §2.4/§2.5).`,
	hint: 'External links come from src/lib/links.ts; in-site links are site-root relative.',
});
console.log('\nLinks hold.');
