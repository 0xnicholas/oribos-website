/**
 * The carried-content gate (SPEC-revamp 完成定义, issue #50): content the SPEC marks `沿用 build`
 * is frozen at `build/01-skeleton` @ `481a89b` — content collections, the links constant, the
 * site/nav constants. Only the changes SPEC-revamp itself sanctions may differ, each held to the
 * exact fields its section rewrites:
 *
 * - §3.2/§4.3 add the `facts/` and `agent-prompt/` collections, §3.2 abolishes `social-proof/`;
 * - §4.4 flips only the FAQ's npm answer, §4.5 only the final-CTA sub;
 * - §4.6 turns the MCP snippet's version literal into the `{version}` token;
 * - §5.2/§5.3 add only each keyword page's `intro` and its new `faq` row;
 * - §3.6 adds only the Resources card descriptions; §4.2 adds the `releases` link, removing
 *   nothing.
 *
 * Any other difference from the skeleton — a re-worded carried sentence, a dropped FAQ, an
 * edited legal page — is a finding. `scripts/check-provenance.mjs` diffs the working tree
 * against the skeleton ref with git and prints the findings; the matching rules live here.
 */

/** The skeleton commit the SPEC names as the carried content's truth source. */
export const skeletonRef = '481a89b';

export type CarriedChange = {
	path: string;
	status: 'A' | 'D' | 'M';
	/** The skeleton's file text (`git show <ref>:<path>`); empty for an added file. */
	baseText: string;
	/** The working tree's file text; empty for a deleted file. */
	text: string;
	/** Lines the diff removes from a modified file, for the `additionsOnly` sanctions. */
	deletions?: number;
	/** Lines the diff adds to a modified file, for an `additionsMatch` sanction. */
	addedLines?: readonly string[];
};

export type Sanction = {
	path: RegExp;
	status: 'A' | 'D' | 'M';
	/** For modified JSON: the only top-level keys allowed to differ from the skeleton. */
	keys?: readonly string[];
	/** For modified text: the diff may only add lines, never remove one. */
	additionsOnly?: boolean;
	/** With `additionsOnly`: every added line must match this — the additions are held to the
	 * sanctioned constant, not just to "any line". */
	additionsMatch?: RegExp;
	reason: string;
};

/** The changes SPEC-revamp sanctions, and no others. */
export const sanctions: readonly Sanction[] = [
	{ path: /^src\/content\/agent-prompt\//, status: 'A', reason: 'the chip CTA\'s collection is new (SPEC-revamp §4.3)' },
	{ path: /^src\/content\/facts\//, status: 'A', reason: 'the architecture-facts collection is new (SPEC-revamp §3.2)' },
	{ path: /^src\/content\/social-proof\//, status: 'D', reason: 'the social-proof collection is abolished (SPEC-revamp §3.2)' },
	{ path: /^src\/content\/faq\/on-npm\.json$/, status: 'M', keys: ['answer'], reason: 'only the npm answer flips to the published state (SPEC-revamp §4.4)' },
	{ path: /^src\/content\/features\/mcp\.json$/, status: 'M', keys: ['files'], reason: 'only the MCP snippet\'s version literal becomes the {version} token (SPEC-revamp §4.6)' },
	{ path: /^src\/content\/final-cta\/default\.json$/, status: 'M', keys: ['sub'], reason: 'only the final-CTA sub is replaced (SPEC-revamp §4.5)' },
	{ path: /^src\/content\/keyword-pages\/[^/]+\.json$/, status: 'M', keys: ['intro', 'faq'], reason: 'only the hero intro and the §5.3 FAQ row are added (SPEC-revamp §5.2/§5.3)' },
	{ path: /^src\/content\/resources\/default\.json$/, status: 'M', keys: ['links'], reason: 'only the card descriptions are added (SPEC-revamp §3.6)' },
	{ path: /^src\/lib\/links\.ts$/, status: 'M', additionsOnly: true, additionsMatch: /releases|§4\.2/, reason: 'the releases constant is added, nothing removed (SPEC-revamp §4.2)' },
	{ path: /^src\/lib\/version\.ts$/, status: 'A', reason: 'the version constant is new (SPEC-revamp §4.6)' },
];

/** A JSON object without its allowed-to-differ keys. */
const withoutKeys = (value: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> =>
	Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));

const frozen = `must stay verbatim at build/01-skeleton @ ${skeletonRef} (SPEC-revamp 完成定义)`;

/**
 * Every carried-content finding: a path that differs from the skeleton without a sanction, a
 * sanctioned path whose status or unfrozen fields moved anyway, or a JSON file that no longer
 * parses.
 */
export function carriedIssues(changes: readonly CarriedChange[]): string[] {
	const issues: string[] = [];

	for (const change of changes) {
		const sanction = sanctions.find((candidate) => candidate.path.test(change.path));
		if (sanction === undefined) {
			issues.push(`${change.path}: differs from the skeleton without a sanctioned change — carried content ${frozen}`);
			continue;
		}
		if (change.status !== sanction.status) {
			issues.push(`${change.path}: is ${change.status} against the skeleton, the sanction covers ${sanction.status} — ${sanction.reason}`);
			continue;
		}
		if (sanction.additionsOnly) {
			if ((change.deletions ?? 0) > 0) {
				issues.push(`${change.path}: removes ${change.deletions} line(s) against the skeleton — ${sanction.reason}`);
			}
			const added = change.addedLines ?? [];
			if (sanction.additionsMatch !== undefined && added.some((line) => !sanction.additionsMatch!.test(line))) {
				issues.push(`${change.path}: adds lines outside the sanctioned constant — ${sanction.reason}`);
			}
		}
		if (sanction.keys !== undefined) {
			let base;
			let current;
			try {
				base = JSON.parse(change.baseText) as Record<string, unknown>;
				current = JSON.parse(change.text) as Record<string, unknown>;
			} catch {
				issues.push(`${change.path}: is not valid JSON against the skeleton — carried content ${frozen}`);
				continue;
			}
			const basePruned = JSON.stringify(withoutKeys(base, sanction.keys));
			const currentPruned = JSON.stringify(withoutKeys(current, sanction.keys));
			if (basePruned !== currentPruned) {
				issues.push(`${change.path}: carries a change outside \`${sanction.keys.join('`, `')}\` — ${sanction.reason}`);
			}
		}
	}

	return issues;
}
