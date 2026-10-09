import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { parseLandingTokens } from './src/lib/brand-tokens.ts';
import { shikiThemes } from './src/lib/shiki-theme.ts';
import { SITE } from './src/lib/site.ts';

// Static output, no adapter (SPEC §8.1/§8.2): `dist/` stays a portable static directory that
// any host can serve. `site` is read from `src/lib/site.ts` so canonical, og:url, the sitemap
// and robots.txt all name one origin; versions are pinned in package.json by hand, never
// through `astro add`.

// The grayscale Shiki pair (SPEC-revamp §2.6) is derived from the shipped token layer. The
// config loader runs outside Vite, so it reads the file directly; the `<Code />` call sites
// take the same pair through `src/lib/shiki-css.ts` (which they must — `<Code />` does not
// inherit this config).
const { tokens: brandTokens, errors: tokenErrors } = parseLandingTokens(
	readFileSync(new URL('./src/styles/global.css', import.meta.url), 'utf8'),
);
if (tokenErrors.length > 0) {
	throw new Error(`src/styles/global.css is not a valid brand token layer:\n${tokenErrors.join('\n')}`);
}

export default defineConfig({
	site: SITE.origin,
	output: 'static',
	// Reserved, not enabled (SPEC §8.4): English pages live at the site root and the default
	// locale carries no prefix, so adding `zh/` later moves no existing URL.
	i18n: { locales: ['en'], defaultLocale: 'en', routing: { prefixDefaultLocale: false } },
	vite: { plugins: [tailwindcss()] },
	integrations: [sitemap()],
	markdown: { shikiConfig: { themes: shikiThemes(brandTokens) } },
});
