/**
 * The brand token layer's only reader, and the rules the CI gates run over it (SPEC-revamp
 * §2.1/§2.3/§2.10). `src/styles/global.css` is the marketing site's own token source of truth;
 * the contrast audit (`scripts/check-contrast.mjs`), the drift audit (`scripts/check-tokens.mjs`)
 * and the `theme-color` pair all go through this module, so the gates and the shipped page
 * cannot disagree about what a token means.
 *
 * Contracts this module enforces:
 *
 *  1. **The §2.1 table is complete and byte-identical.** A missing slot is an error, not a
 *     silent fallback; a value that drifts from the table in `docs/SPEC-revamp.md` is drift,
 *     not a tweak. The same holds for the §2.3 type scale: eight steps, line heights on the
 *     4px discipline.
 *  2. **AA holds.** §2.10 reduces the palette to 8 rendered pairs × 2 themes; each pair is
 *     checked against WCAG AA (4.5:1). `--ink3` is deliberately below AA — muted meta is
 *     decorative mono labelling (§2.1/§2.3), never running text, so no pair of the audit
 *     reads on it.
 */

export type Theme = 'light' | 'dark';
/** Token name → declared value, e.g. `--acc` → `#9e630a`. */
export type TokenSet = Record<string, string>;

/** The §2.1 colour slots — the same eleven in both themes. */
export const colourTokens = [
	'--bg',
	'--bg2',
	'--ink',
	'--ink2',
	'--ink3',
	'--line',
	'--acc',
	'--acc-h',
	'--acc-lo',
	'--acc-inv',
	'--code-bg',
] as const;
export type ColourToken = (typeof colourTokens)[number];

/** The §2.3 type-scale steps, in order, each a size token plus its line-height token. */
export const typeScaleSteps = ['xs', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;
export type TypeScaleStep = (typeof typeScaleSteps)[number];
export type TypeScaleTable = Record<TypeScaleStep, { size: string; lineHeight: string }>;

/** The §2.3 table as this build is constructed from — sizes in px, line heights 4px multiples. */
export const typeScale: TypeScaleTable = {
	xs: { size: '13px', lineHeight: '20px' },
	base: { size: '16px', lineHeight: '24px' },
	lg: { size: '21px', lineHeight: '28px' },
	xl: { size: '28px', lineHeight: '36px' },
	'2xl': { size: '38px', lineHeight: '44px' },
	'3xl': { size: '50px', lineHeight: '56px' },
	'4xl': { size: '67px', lineHeight: '72px' },
	'5xl': { size: '89px', lineHeight: '96px' },
};

/* ---------------------------------------------------------------- reading the layer */

/** Comments first: a `{` inside one would derail the block scan. */
export function stripComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Every `--name: value;` declaration of a block body, in document order. The trailing
 * semicolon is optional — CSS minifiers drop the last one before a closing brace. */
export function declarationsOf(body: string): Array<[string, string]> {
	return [...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;{}]+);?/gi)].map((match) => [
		match[1]!,
		match[2]!.trim(),
	]);
}

/** The body of the first block whose prelude matches `prelude`, by brace matching. */
function blockAfter(css: string, prelude: RegExp): { body: string; start: number; end: number } | null {
	const match = prelude.exec(css);
	if (match === null) return null;

	const open = css.indexOf('{', match.index + match[0].length - 1);
	if (open === -1) return null;

	let depth = 0;
	for (let index = open; index < css.length; index += 1) {
		if (css[index] === '{') depth += 1;
		else if (css[index] === '}') {
			depth -= 1;
			if (depth === 0) return { body: css.slice(open + 1, index), start: match.index, end: index + 1 };
		}
	}
	return null;
}

/**
 * The two theme regions of a token stylesheet: light is the default on `:root`, dark lives
 * inside `@media (prefers-color-scheme: dark)` (SPEC-revamp §2.7 — the OS is the only switch).
 */
export function splitThemeRegions(css: string): { light: string; dark: string } {
	const stripped = stripComments(css);
	const dark = blockAfter(stripped, /@media[^{]*prefers-color-scheme:\s*dark[^{]*\{/);
	if (dark === null) return { light: stripped, dark: '' };
	return {
		light: stripped.slice(0, dark.start) + stripped.slice(dark.end),
		dark: dark.body,
	};
}

/** The declarations of every `:root { … }` block in a region, merged. Duplicates are returned
 * as errors rather than silently overwritten — a token declared twice is a second copy. */
export function rootDeclarations(region: string): { values: TokenSet; errors: string[] } {
	const values: TokenSet = {};
	const errors: string[] = [];

	for (const match of region.matchAll(/:root\s*\{([^{}]*)\}/g)) {
		for (const [name, value] of declarationsOf(match[1]!)) {
			if (name in values) {
				errors.push(`${name} is declared twice in the same theme block`);
				continue;
			}
			values[name] = value;
		}
	}

	return { values, errors };
}

/**
 * Read the shipped token layer. `light` is the default region, `dark` the media block. The
 * result carries the eleven §2.1 colour slots per theme plus the §2.3 type-scale tokens,
 * which are theme-independent and live in the light region only.
 */
export function parseLandingTokens(css: string): { tokens: Record<Theme, TokenSet>; errors: string[] } {
	const regions = splitThemeRegions(css);
	const tokens: Record<Theme, TokenSet> = { light: {}, dark: {} };
	const errors: string[] = [];

	const typeTokenNames = new Set<string>(
		typeScaleSteps.flatMap((step) => [`--t-${step}`, `--t-${step}-lh`]),
	);
	const allowed = new Set<string>([...colourTokens, ...typeTokenNames]);

	const lightRoots = rootDeclarations(regions.light);
	const typeDeclarations = lightRoots.values;

	for (const theme of ['light', 'dark'] as const) {
		const parsed = theme === 'light' ? lightRoots : rootDeclarations(regions.dark);
		errors.push(...parsed.errors.map((error) => `${theme}: ${error}`));

		for (const [name, value] of Object.entries(parsed.values)) {
			if ((colourTokens as readonly string[]).includes(name)) {
				tokens[theme][name] = value;
			} else if (theme === 'dark') {
				errors.push(`${name} in the dark block — dark swaps §2.1 values only; anything else belongs on \`:root\``);
			}
		}

		for (const name of colourTokens) {
			if (!(name in tokens[theme])) {
				errors.push(`the ${theme} token block is missing ${name} (SPEC-revamp §2.1)`);
			} else if (!isHex(tokens[theme][name]!)) {
				errors.push(`${name} in the ${theme} token block is not a #rrggbb hex value: \`${tokens[theme][name]}\``);
			}
		}
	}

	for (const name of [...Object.keys(lightRoots.values), ...Object.keys(rootDeclarations(regions.dark).values)]) {
		if (!allowed.has(name)) {
			errors.push(`${name} is not part of the §2.1/§2.3 token set — the layer invents no slots`);
		}
	}

	// The type scale is declared once, on `:root`; a dark re-declaration would be a second copy.
	for (const step of typeScaleSteps) {
		const size = typeDeclarations[`--t-${step}`];
		const lineHeight = typeDeclarations[`--t-${step}-lh`];
		if (size === undefined || lineHeight === undefined) {
			errors.push(`the token layer is missing --t-${step} / --t-${step}-lh (SPEC-revamp §2.3)`);
			continue;
		}
		if (size !== typeScale[step].size || lineHeight !== typeScale[step].lineHeight) {
			errors.push(
				`--t-${step} is \`${size}/${lineHeight}\`, the §2.3 table locks \`${typeScale[step].size}/${typeScale[step].lineHeight}\``,
			);
		}
	}
	if (regions.dark.includes('--t-')) {
		errors.push('the type scale is re-declared inside the dark block — eight steps, declared once');
	}

	return { tokens, errors };
}

/* ---------------------------------------------------------------- the spec tables */

/**
 * The §2.1 token table as written in `docs/SPEC-revamp.md` — the corpus this build is
 * constructed from. Hex is normative there; any hsl note rides in a comment, which is
 * stripped before parsing.
 */
export function parseSpecRevampTable(markdown: string): { tokens: Record<Theme, TokenSet>; errors: string[] } {
	const block = [...markdown.matchAll(/```css\s*\n([\s\S]*?)```/g)]
		.map((match) => match[1]!)
		.find((body) => body.includes('--acc:'));

	if (block === undefined) {
		return { tokens: { light: {}, dark: {} }, errors: ['docs/SPEC-revamp.md carries no ```css §2.1 token table'] };
	}

	const regions = splitThemeRegions(block);
	const tokens: Record<Theme, TokenSet> = { light: {}, dark: {} };
	const errors: string[] = [];

	for (const theme of ['light', 'dark'] as const) {
		for (const [name, value] of declarationsOf(regions[theme])) {
			if ((colourTokens as readonly string[]).includes(name)) tokens[theme][name] = value;
		}
		for (const name of colourTokens) {
			if (!(name in tokens[theme])) errors.push(`the §2.1 ${theme} block is missing ${name}`);
		}
	}

	return { tokens, errors };
}

/* ---------------------------------------------------------------- comparisons */

/**
 * Per-slot value drift between two token sets, as human-readable lines. `slotsFor` scopes the
 * comparison to the colour slots; the type scale is validated against its own table above.
 */
export function tokenDrift(
	actual: Record<Theme, TokenSet>,
	expected: Record<Theme, TokenSet>,
	{
		actualLabel,
		expectedLabel,
		slotsFor,
	}: {
		actualLabel: string;
		expectedLabel: string;
		slotsFor?: (theme: Theme) => readonly string[];
	},
): string[] {
	const issues: string[] = [];

	for (const theme of ['light', 'dark'] as const) {
		const names = slotsFor
			? [...slotsFor(theme)]
			: [...new Set([...Object.keys(actual[theme]), ...Object.keys(expected[theme])])];
		for (const name of [...names].sort()) {
			const found = actual[theme][name];
			const wanted = expected[theme][name];
			if (found === wanted) continue;
			issues.push(
				`${name} (${theme}): ${actualLabel} has ${found ?? 'no declaration'}, ${expectedLabel} has ${wanted ?? 'no declaration'}`,
			);
		}
	}

	return issues;
}

/**
 * Colour literals outside the token blocks, and `@theme` aliases that do not point back at a
 * token (SPEC-revamp §2.1: Tailwind only aliases `var(--*)` — no second copy of a value).
 */
export function literalColorIssues(css: string): string[] {
	const issues: string[] = [];
	const stripped = stripComments(css);
	const regions = splitThemeRegions(stripped);
	const remainder = regions.light.replace(/:root\s*\{[^{}]*\}/g, '');

	for (const match of remainder.matchAll(/#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lch|lab|color)\s*\(/gi)) {
		issues.push(`\`${match[0]}\` outside the token blocks — colours are declared once, as §2.1 tokens`);
	}

	for (const match of remainder.matchAll(/@theme([^{]*)\{([^{}]*)\}/g)) {
		const modifier = match[1]!.trim();
		if (modifier !== 'inline') {
			issues.push(`\`@theme${modifier ? ` ${modifier}` : ''}\` — the alias block is \`@theme inline\` (SPEC-revamp §2.1)`);
		}
		for (const [name, value] of declarationsOf(match[2]!)) {
			if (!name.startsWith('--color-')) continue;
			if (!/^var\(--[a-z0-9-]+\)$/.test(value)) {
				issues.push(`\`${name}: ${value}\` — a Tailwind colour alias must be a \`var(--*)\` reference (SPEC-revamp §2.1)`);
			}
		}
	}

	return issues;
}

/* ---------------------------------------------------------------- colour maths */

export type Rgb = { r: number; g: number; b: number };

/** `#rrggbb` — the normative shape of every §2.1 value. */
export function parseHex(value: string): Rgb | null {
	const match = value.trim().match(/^#([0-9a-f]{6})$/i);
	if (!match) return null;
	return {
		r: parseInt(match[1]!.slice(0, 2), 16),
		g: parseInt(match[1]!.slice(2, 4), 16),
		b: parseInt(match[1]!.slice(4, 6), 16),
	};
}

function isHex(value: string): boolean {
	return parseHex(value) !== null;
}

/** `hsl(36, 82%, 55%)` — the shape the trace green declares itself in (trace-ink.css). */
function parseHsl(value: string): { h: number; s: number; l: number } | null {
	const match = value
		.trim()
		.match(/^hsl\(\s*(\d+(?:\.\d+)?)(?:,|\s)\s*(\d+(?:\.\d+)?)%(?:,|\s)\s*(\d+(?:\.\d+)?)%\s*\)$/i);
	if (!match) return null;
	return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function hslRgb({ h, s, l }: { h: number; s: number; l: number }): [number, number, number] {
	const saturation = s / 100;
	const lightness = l / 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = saturation * Math.min(lightness, 1 - lightness);
	const f = (n: number) => lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [f(0), f(8), f(4)].map((channel) => Math.round(channel * 255)) as [number, number, number];
}

/** `#rrggbb` of an `hsl()` value — bridges the trace green into the hex-only audit maths. */
export function hslToHex(value: string): string {
	const hsl = parseHsl(value);
	if (hsl === null) throw new Error(`not an hsl() value: ${value}`);
	return `#${hslRgb(hsl)
		.map((channel) => channel.toString(16).padStart(2, '0'))
		.join('')}`;
}

function luminanceOf(value: string): number {
	const rgb = parseHex(value);
	if (rgb === null) throw new Error(`not a #rrggbb value: ${value}`);
	const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
		const c = channel / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG 2.1 contrast ratio between two `#rrggbb` values. */
export function contrastRatio(a: string, b: string): number {
	const [first, second] = [luminanceOf(a), luminanceOf(b)];
	const [high, low] = first > second ? [first, second] : [second, first];
	return (high + 0.05) / (low + 0.05);
}

/* ---------------------------------------------------------------- the AA audit */

/** WCAG AA for normal text; §2.10 audits exactly these rendered pairs, and the slice gates reuse it. */
export const AA = 4.5;

export type AuditRow = {
	theme: Theme;
	label: string;
	fg: string;
	bg: string;
	ratio: number;
	min: number;
	pass: boolean;
};

/**
 * The 8 pairs §2.10 enumerates per theme — body and secondary text × page & secondary
 * surface, the accent link × both, the accent hover state, and the inverted button label.
 * `--ink3` is muted meta labelling, deliberately outside AA (§2.1), so no pair reads on it.
 */
function auditPairs(tokens: TokenSet) {
	return [
		{ label: 'body text on page background', fg: tokens['--ink']!, bg: tokens['--bg']! },
		{ label: 'body text on secondary surface', fg: tokens['--ink']!, bg: tokens['--bg2']! },
		{ label: 'secondary text on page background', fg: tokens['--ink2']!, bg: tokens['--bg']! },
		{ label: 'secondary text on secondary surface', fg: tokens['--ink2']!, bg: tokens['--bg2']! },
		{ label: 'accent link on page background', fg: tokens['--acc']!, bg: tokens['--bg']! },
		{ label: 'accent link on secondary surface', fg: tokens['--acc']!, bg: tokens['--bg2']! },
		{ label: 'accent hover on page background', fg: tokens['--acc-h']!, bg: tokens['--bg']! },
		{ label: 'inverted label on accent button', fg: tokens['--acc-inv']!, bg: tokens['--acc']! },
	];
}

/** Run §2.10 over both themes: 8 pairs × 2 themes = the 16 checks the CI gate reports. */
export function auditTokens(tokens: Record<Theme, TokenSet>): { rows: AuditRow[]; errors: string[] } {
	const rows: AuditRow[] = [];
	const errors: string[] = [];

	for (const theme of ['light', 'dark'] as const) {
		for (const { label, fg, bg } of auditPairs(tokens[theme])) {
			if (typeof fg !== 'string' || typeof bg !== 'string') {
				errors.push(`${theme}: \`${label}\` needs tokens the ${theme} block does not declare`);
				continue;
			}
			if (parseHex(fg) === null || parseHex(bg) === null) {
				errors.push(`${theme}: \`${label}\` resolves to a value the audit cannot measure (fg ${fg}, bg ${bg})`);
				continue;
			}
			const ratio = contrastRatio(fg, bg);
			rows.push({ theme, label, fg, bg, ratio, min: AA, pass: ratio >= AA });
		}
	}

	return { rows, errors };
}

/** The two `theme-color` values (SPEC-revamp §2.8): each theme's resolved `--bg`. */
export function themeColorValues(tokens: Record<Theme, TokenSet>): Record<Theme, string> {
	return {
		light: tokens.light['--bg']!,
		dark: tokens.dark['--bg']!,
	};
}
