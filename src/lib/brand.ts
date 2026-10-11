/**
 * The site's public brand copy, stated once: the wordmark and the public tagline (SPEC §2.3
 * 【终稿·勿改】, §9.3 产品名 `Oribos`). The footer brand block renders the tagline from here,
 * the OG-card generator reads both, and `/about` reuses the tagline when its slice lands.
 *
 * The shell gate keeps its own copy of the tagline on purpose (see `src/lib/shell-rules.ts`),
 * so the rendered page and the spec's shell cannot agree by construction.
 */

/** The wordmark: the brand name as the public surface spells it. */
export const wordmark = 'Oribos';

/** The public tagline, verbatim from the spec — sentence one, then sentence two. */
export const publicTagline =
	'Ultralight TypeScript agent framework. Compose only what you use — run anywhere, no runtime baggage.';
