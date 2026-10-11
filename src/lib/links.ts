import { SITE } from './site.ts';

/**
 * The site's only external-link constants (SPEC §2.4). Pages and components import from
 * here; they never write a URL. The docs switch point (#16, docs site accepted online)
 * replaces `docs` in place — the value changes, the call sites do not.
 */
export const LINKS = {
	github: 'https://github.com/0xnicholas/oribos-framework',
	issues: 'https://github.com/0xnicholas/oribos-framework/issues',
	/** The header pill's target (SPEC-revamp §4.2). */
	releases: 'https://github.com/0xnicholas/oribos-framework/releases',
	docs: 'https://github.com/0xnicholas/oribos-framework', // → https://docs.oribos.dev
	examples: 'https://github.com/0xnicholas/oribos-framework/tree/main/examples',
	architecture: 'https://github.com/0xnicholas/oribos-framework/tree/main/docs/architecture',
	/** The /about signature link (SPEC §4.1): attribution stops at the GitHub handle. */
	maintainer: 'https://github.com/0xnicholas',
} as const;

/** The link keys the about / legal pages' copy segments may carry (SPEC §4.1/§4.2). */
export const textPageLinkKeys = ['maintainer', 'issues'] as const;
export type TextPageLinkKey = (typeof textPageLinkKeys)[number];

/**
 * The keyword pages' `Learn more` targets (SPEC §4.4) — the one constant's extension, keyed by
 * page slug. Both values live here: `pre` renders until the docs switch point (#16, docs site
 * accepted online), then `post` replaces it in place. The `pre` anchors are the live README's
 * GitHub slugs under the current names (`### Agents — `@oribos/core/agent`` →
 * `#agents--oriboscoreagent`), the same derivation that was verified against the rendered README
 * when this mapping first landed; the slice that builds a page re-verifies its anchor against the
 * live README before the link renders (SPEC §4.4). **Known window (2026-10-03)**: the framework's
 * rename commit (`81483bd`) is cut in `oribos-framework` but not yet pushed — its live README
 * still spells its scope the old way, so these two anchors land at the README top until that
 * commit ships. The old spelling is retired (`link-rules.ts`), so pointing back at it is not an
 * option; re-verify these two anchors after that push.
 */
export const learnMoreLinks = {
	'ai-agent-framework': {
		pre: LINKS.docs,
		post: 'https://docs.oribos.dev/docs',
	},
	'ai-agents': {
		pre: `${LINKS.docs}#agents--oriboscoreagent`,
		post: 'https://docs.oribos.dev/docs/concepts/agents',
	},
	'ai-workflows': {
		pre: `${LINKS.docs}#workflows--oriboscoreworkflows`,
		post: 'https://docs.oribos.dev/docs/concepts/workflows',
	},
	'ai-agent-observability': {
		pre: 'https://github.com/0xnicholas/oribos-framework/blob/main/docs/architecture/observability.md',
		post: 'https://docs.oribos.dev/docs/concepts/observability',
	},
} as const;

export type KeywordPageSlug = keyof typeof learnMoreLinks;
export const keywordPageSlugs = Object.keys(learnMoreLinks) as [KeywordPageSlug, ...KeywordPageSlug[]];

/** The `Learn more` href that renders today — the pre-launch value until the docs switch flips it. */
export const learnMoreHref = (slug: KeywordPageSlug): string => learnMoreLinks[slug].pre;

/** Every href an external link may carry (SPEC §8.8 ⑤: no retired repo name, one constant). The
 * `Learn more` post-launch values stay out until the docs switch — a built page linking
 * docs.oribos.dev today is a finding, not a constant. */
export const allowedExternalLinks: readonly string[] = [
	...Object.values(LINKS),
	...Object.values(learnMoreLinks).map((entry) => entry.pre),
	SITE.origin,
];

/** The three keys the resources strip draws from (SPEC §3.6); their values are the constants above. */
export const resourceLinkKeys = ['docs', 'examples', 'architecture'] as const;
export type ResourceLinkKey = (typeof resourceLinkKeys)[number];
