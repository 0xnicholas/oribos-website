/**
 * The deployed origin — the one place in the repository that names a host (SPEC §8.4).
 * `astro.config.mjs` reads it as `site`, and canonical / og:url / sitemap / robots all
 * derive from that, so the surfaces a crawler sees cannot disagree. The source scan in
 * `scripts/check-origin.mjs` fails if the literal reappears in a page, layout or component.
 */
export const SITE = { origin: 'https://oribos.dev' } as const;
