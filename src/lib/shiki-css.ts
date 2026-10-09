/**
 * The §2.6 grayscale pair for `<Code />` call sites. Astro's `<Code />` does not inherit
 * `markdown.shikiConfig`, so a call site without an explicit `themes` prop silently falls
 * back to Astro's default github pair — which §2.6 retires. This module loads the token
 * layer through Vite's `?raw` pipeline (the same route `BaseLayout.astro` takes), and the
 * theme builder itself stays single-sourced in `shiki-theme.ts`.
 */

import tokenCss from '../styles/global.css?raw';
import { parseLandingTokens } from './brand-tokens.ts';
import { shikiThemes } from './shiki-theme.ts';

const { tokens, errors } = parseLandingTokens(tokenCss);
if (errors.length > 0) {
	throw new Error(`src/styles/global.css is not a valid brand token layer:\n${errors.join('\n')}`);
}

export const codeThemes = shikiThemes(tokens);
