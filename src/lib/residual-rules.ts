/**
 * The anti-residual scan (SPEC-revamp 完成定义, issue #50): the names the v1 site and the retired
 * directions left behind must have zero hits anywhere the site is built from — the rendered
 * `dist/` tree and the site source alike. The set, stated once here:
 *
 * - the v1 `--sl-*` token namespace (SPEC-revamp §2.1 — tokens are semantic now);
 * - the social-proof band, its component, its collection and its `#social-proof` anchor
 *   (SPEC-revamp §3.2 — the architecture-facts band replaced it);
 * - the v1 shared use-case header art (SPEC-revamp §5.1 — pages carry host-interface mocks);
 * - the `coming soon` release status (SPEC-revamp §4 — one published state);
 * - the v1 dual-version switch mechanism (SPEC-revamp §4 — release-status state, toggle points);
 * - the retired brand names and domains (SPEC §1 — the renames this project has been through,
 *   `src/lib/link-rules.ts` holds the list and this scan imports it).
 *
 * A match in a built file or in site source is a finding. Source files that state a retired term
 * in order to forbid it — this module, its test, and the rules modules that pin the same
 * tombstones for their own gates — are the only exemptions, listed in `residualMentionsAllowed`.
 * `scripts/check-residuals.mjs` walks `dist/` and the site source and prints the findings.
 */

import { lineAt, ruleMatches, type BuiltFile, type CopyRule } from './copy-rules.ts';
import { retiredNames } from './link-rules.ts';

export const residualTargets: readonly CopyRule[] = [
	{
		id: 'sl-token',
		reason: 'the v1 `--sl-*` token namespace is retired — the token layer is semantic now (SPEC-revamp §2.1)',
		pattern: /--sl-[a-z0-9-]+/,
	},
	{
		id: 'social-proof',
		reason: 'the social-proof band is abolished — component, content collection and `#social-proof` anchor alike (SPEC-revamp §3.2)',
		pattern: /SocialProof|social-proof/i,
	},
	{
		id: 'use-case-art',
		reason: 'the v1 shared use-case header art is retired — pages carry host-interface mocks (SPEC-revamp §5.1)',
		pattern: /UseCaseArt|use-case-art/i,
	},
	{
		// Broader than copy-rules' prose rule: identifiers and class names (`coming-soon`) are
		// residuals too, and this scan reads source as well as built output.
		id: 'coming-soon',
		reason: 'the site carries one published state — `coming soon` is retired (SPEC-revamp §4)',
		pattern: /coming[\s-]+soon/i,
	},
	{
		id: 'dual-version',
		reason: 'the v1 dual-version switch mechanism is abolished — release-status state and toggle points included (SPEC-revamp §4)',
		pattern: /release[\s_-]?status|data-release-|version[\s_-]?toggle/i,
	},
	// Stated once in link-rules.ts (which holds hrefs to the same line); the residual scan holds
	// source and built output to the retired brand names as well.
	...retiredNames.map((retired) => ({ id: 'retired-name', reason: retired.reason, pattern: retired.pattern })),
];

/**
 * The only places a retired term may appear: source files that name it in order to forbid it —
 * this module and its test, plus the rules modules whose gates pin the same tombstones. Every
 * other file under `src/` and every built file is held to zero hits.
 */
export const residualMentionsAllowed: readonly string[] = [
	'src/lib/residual-rules.ts',
	'src/lib/residual-rules.test.ts',
	'src/lib/copy-rules.ts',
	'src/lib/copy-rules.test.ts',
	'src/lib/link-rules.ts',
	'src/lib/link-rules.test.ts',
	'src/lib/band-rules.ts',
	'src/lib/band-rules.test.ts',
	'src/lib/scenario-rules.ts',
	'src/lib/scenario-rules.test.ts',
	'src/lib/hero-rules.ts',
	'src/lib/hero-rules.test.ts',
	'src/lib/provenance-rules.ts',
	'src/lib/provenance-rules.test.ts',
];

/**
 * Every residual finding in the given files, as `path:line` lines naming the target and the
 * match. Files on the allowed list are skipped whole: they exist to state the terms.
 */
export function residualIssues(files: readonly BuiltFile[]): string[] {
	const issues: string[] = [];
	const seen = new Set<string>();

	for (const file of files) {
		if (residualMentionsAllowed.includes(file.path)) continue;
		for (const target of residualTargets) {
			for (const match of ruleMatches(target, file.text)) {
				const line = lineAt(file.text, match.index ?? 0);
				const key = `${file.path}:${line}:${target.id}`;
				if (seen.has(key)) continue;
				seen.add(key);
				issues.push(`${file.path}:${line}: \`${match[0]}\` — ${target.reason} [${target.id}]`);
			}
		}
	}

	return issues;
}
