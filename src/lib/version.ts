/**
 * The one version literal (SPEC-revamp §4.6) — the site has a single published state, and its
 * version is stated once here. The two consumers are the header pill (SPEC-revamp §4.2) and the
 * MCP code snippet's `version` field (SPEC-revamp §6); a release bumps this constant and nothing
 * else. The header pill links the releases page, which is a link constant like any other.
 *
 * The MCP snippet lives in the features content collection, where the release literal cannot be
 * written as a second copy: the code carries a `{version}` token and the pages fill it from here
 * (`fillVersion`). `scripts/check-version.mjs` then holds the built site to the rule — a version
 * literal anywhere but the pill and that one `version` field is a finding.
 */

/** The current release, without the `v` the pill spells. Bump this on release. */
export const VERSION = '0.6.0';

/** The pill's label, e.g. `v0.6.0` (SPEC-revamp §4.2). */
export const versionLabel = `v${VERSION}`;

/** The token a snippet carries where the release literal would otherwise be written twice. */
export const versionToken = '{version}';

/** Fill a snippet's `{version}` tokens from the one constant; a snippet without one is unchanged. */
export function fillVersion(code: string): string {
	return code.replaceAll(versionToken, VERSION);
}
