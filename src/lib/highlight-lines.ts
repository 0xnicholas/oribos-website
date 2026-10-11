/**
 * The line-highlight transformer (SPEC-revamp §2.6): a content entry declares the lines its
 * code block highlights — `"highlight": […]`, 1-based, a sibling of `file` / `code` — and this
 * Shiki transformer marks those line spans with the `hl` class the `.astro-code` rules paint
 * as the `--acc-lo` band with the 2px `--acc` left bar.
 *
 * A highlighted line also bumps its comment tokens from `--ink3` to `--ink2`: on the `--acc-lo`
 * band `--ink3` reads 2.40:1, below the AA floor, while `--ink2` clears it (5.29:1). The bump
 * rewrites the span's inline style — the default-theme `color` and its `--shiki-dark` twin —
 * matched by colour, not by scope name: the theme paints comments alone in `--ink3`, so the
 * colour match is the scope match. The values arrive as parameters from `shiki-css.ts`, which
 * reads them out of the token layer — this module carries no colour of its own.
 */

/** The hast shape the transformer touches. Shiki is Astro's dependency, not ours, so the
 *  structural minimum is declared here instead of importing its types. */
type HastElement = {
	tagName: string;
	properties: Record<string, unknown>;
	children: HastNode[];
};
type HastNode = HastElement | { type: string; value?: string };

export type HighlightColours = {
	/** The comment token's pair — the default theme's `color` and the dark `--shiki-dark`. */
	comment: { light: string; dark: string };
	/** The pair a comment takes on a highlighted line. */
	commentOnHighlight: { light: string; dark: string };
};

/** The transformer object `<Code />` accepts — structurally a `ShikiTransformer`. */
export type LineTransformer = {
	name: string;
	line(node: HastElement, line: number): void;
};

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function isElement(node: HastNode): node is HastElement {
	return (node as HastElement).tagName !== undefined;
}

/** `hl` on the line span, keeping the `line` class shiki set. */
function addClass(node: HastElement, className: string): void {
	const existing = node.properties['class'];
	if (typeof existing === 'string' && existing !== '') {
		node.properties['class'] = `${existing} ${className}`;
	} else if (Array.isArray(existing)) {
		node.properties['class'] = [...existing, className];
	} else {
		node.properties['class'] = className;
	}
}

/**
 * The transformer for one block's highlight list. Shiki emits hex upper-case, so the rewrite
 * matches case-insensitively and writes the bump pair in the same convention.
 */
export function highlightLines(lines: readonly number[], colours: HighlightColours): LineTransformer {
	const highlighted = new Set(lines);
	const commentLight = colours.comment.light.toUpperCase();

	const bumpComments = (node: HastElement): void => {
		const style = node.properties['style'];
		if (typeof style === 'string' && style.toUpperCase().includes(commentLight)) {
			node.properties['style'] = style
				.replace(new RegExp(escapeRegExp(colours.comment.light), 'gi'), colours.commentOnHighlight.light.toUpperCase())
				.replace(new RegExp(escapeRegExp(colours.comment.dark), 'gi'), colours.commentOnHighlight.dark.toUpperCase());
		}
		for (const child of node.children) {
			if (isElement(child)) bumpComments(child);
		}
	};

	return {
		name: 'oribos-highlight-lines',
		line(node: HastElement, line: number): void {
			if (!highlighted.has(line)) return;
			addClass(node, 'hl');
			bumpComments(node);
		},
	};
}
