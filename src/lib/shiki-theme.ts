/**
 * The custom Shiki theme pair (SPEC-revamp §2.6): the restrained three-color palette — keywords
 * in the `--acc` amber (hue separates them now; the grayscale pair's keyword bold is retired),
 * strings in the `--syn-green` green (the trace green's value, promoted to syntax use),
 * function / method calls in the `--syn-blue` blue — over the ink grayscale: `--ink` for code,
 * `--ink3` for comments, `--ink2` for constants. No rainbow: three hues, each a §2.1 token, so
 * the theme pair carries no value of its own; the `github-light` / `github-dark` pair this
 * replaced painted a second palette the token gate never saw.
 */

import type { Theme, TokenSet } from './brand-tokens.ts';

type ShikiTokenColor = { scope: string[]; settings: { foreground: string; fontStyle?: string } };
export type ShikiTheme = {
	name: string;
	type: 'light' | 'dark';
	colors: Record<string, string>;
	tokenColors: ShikiTokenColor[];
};

function buildTheme(theme: Theme, tokens: TokenSet): ShikiTheme {
	const ink = tokens['--ink']!;
	const ink2 = tokens['--ink2']!;
	const ink3 = tokens['--ink3']!;

	return {
		name: `oribos-${theme}`,
		type: theme,
		colors: {
			'editor.background': tokens['--code-bg']!,
			'editor.foreground': ink,
		},
		tokenColors: [
			{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: ink3 } },
			{ scope: ['string', 'punctuation.definition.string'], settings: { foreground: tokens['--syn-green']! } },
			{
				scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier', 'keyword.operator.new'],
				settings: { foreground: tokens['--acc']! },
			},
			{ scope: ['entity.name.function', 'support.function'], settings: { foreground: tokens['--syn-blue']! } },
			{ scope: ['constant', 'constant.numeric', 'constant.language'], settings: { foreground: ink2 } },
		],
	};
}

/** The §2.6 pair, both themes, from one token set. */
export function shikiThemes(tokens: Record<Theme, TokenSet>): { light: ShikiTheme; dark: ShikiTheme } {
	return { light: buildTheme('light', tokens.light), dark: buildTheme('dark', tokens.dark) };
}
