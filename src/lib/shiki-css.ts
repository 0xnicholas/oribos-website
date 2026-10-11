/**
 * The §2.6 three-color pair for `<Code />` call sites, plus the line-highlight transformer
 * factory. Astro's `<Code />` does not inherit `markdown.shikiConfig`, so a call site without
 * an explicit `themes` prop silently falls back to Astro's default github pair — which §2.6
 * retires. This module loads the token layer through Vite's `?raw` pipeline (the same route
 * `BaseLayout.astro` takes), and the theme builder itself stays single-sourced in
 * `shiki-theme.ts`; the transformer wiring lives in `highlight-lines.ts`, fed the comment /
 * bump pairs from the same tokens so its rewrite can never drift from the layer.
 */

import tokenCss from '../styles/global.css?raw';
import { parseLandingTokens } from './brand-tokens.ts';
import { highlightLines, type LineTransformer } from './highlight-lines.ts';
import { shikiThemes } from './shiki-theme.ts';

const { tokens, errors } = parseLandingTokens(tokenCss);
if (errors.length > 0) {
	throw new Error(`src/styles/global.css is not a valid brand token layer:\n${errors.join('\n')}`);
}

export const codeThemes = shikiThemes(tokens);

/**
 * The transformer for one block's `highlight` list (1-based line numbers, from the content
 * entry). With no list the block renders unhighlighted; the transformer then no-ops.
 */
export function highlightTransformer(lines?: readonly number[]): LineTransformer {
	return highlightLines(lines ?? [], {
		comment: { light: tokens.light['--ink3']!, dark: tokens.dark['--ink3']! },
		commentOnHighlight: { light: tokens.light['--ink2']!, dark: tokens.dark['--ink2']! },
	});
}
