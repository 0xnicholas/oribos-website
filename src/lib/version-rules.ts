/**
 * The version single-point discipline (SPEC-revamp §4.6, §2.10-6) over the built site. The site
 * carries one published version, stated once in `src/lib/version.ts`; exactly two slots consume
 * it — the header pill, which reads `v{version}` (SPEC-revamp §4.2), and the MCP snippet's
 * `version` field (SPEC-revamp §6). A release literal anywhere else, in any built file — prose,
 * a meta description, another code block — is a finding; so are a pill and an MCP field that
 * drift from the constant. `scripts/check-version.mjs` walks `dist/`.
 */

import { codeBlocksOf, textOf } from './html.ts';
import { withoutBlockComments, type BuiltFile } from './copy-rules.ts';
import { VERSION, versionLabel } from './version.ts';

/** `1.2.3`-shaped, with or without the `v`; the two-part `1.0` / `Pre-1.0` do not match. */
const versionPattern = /\bv?\d+\.\d+\.\d+\b/g;

/** The code card whose `version` field consumes the constant (SPEC-revamp §6). */
const mcpMarker = 'createMcpServer';

const pillPattern = /<a\b[^>]*\bdata-version-pill\b[^>]*>([\s\S]*?)<\/a>/gi;
const prePattern = /<pre\b[^>]*>[\s\S]*?<\/pre>/gi;
/** Icons are geometry, not copy, and their path data is full of `1.2.3`-shaped numbers. */
const svgPattern = /<svg\b[^>]*>[\s\S]*?<\/svg>/gi;
/** Inline styles are not the site face either; the shipped CSS is scanned with its banners cut. */
const stylePattern = /<style\b[^>]*>[\s\S]*?<\/style>/gi;

/** The versions a code block names: only the MCP snippet's own `version` field may carry one. */
function blockIssues(block: string): string[] {
	const hits = [...block.matchAll(versionPattern)];
	if (hits.length === 0) return [];

	if (!block.includes(mcpMarker)) {
		return hits.map((hit) => `a code block reads \`${hit[0]}\` — only the MCP snippet names a version (SPEC-revamp §4.6)`);
	}

	const issues: string[] = [];
	const field = block.match(/version:\s*'([^']*)'/)?.[1];
	if (field !== VERSION) {
		issues.push(
			`the MCP snippet's \`version\` field reads \`${field ?? 'nothing'}\`, expected \`${VERSION}\` — the one constant (SPEC-revamp §4.6)`,
		);
	}
	// Everything the allowed spelling accounts for; what is left is another literal.
	const rest = block.split(`version: '${VERSION}'`).join(' ');
	for (const hit of rest.matchAll(versionPattern)) {
		issues.push(`the MCP snippet reads \`${hit[0]}\` outside its \`version\` field (SPEC-revamp §4.6)`);
	}
	return issues;
}

/**
 * Every version literal outside the two slots, as findings. A page that carries the header must
 * carry the pill; the pill and the MCP field must read the one constant. Markup counts: an
 * attribute value (a meta description, an `aria-label`) names a version exactly as prose does.
 */
export function versionIssues(files: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const file of files) {
		if (!file.path.endsWith('.html')) {
			const text = /\.(?:css|js)$/.test(file.path) ? withoutBlockComments(file.text) : file.text;
			for (const match of text.matchAll(versionPattern)) {
				issues.push(`${file.path}: reads \`${match[0]}\` — versions come from the one constant (SPEC-revamp §4.6)`);
			}
			continue;
		}

		let html = file.text;
		const pills = [...html.matchAll(pillPattern)];
		if (pills.length === 0 && /<header\b/i.test(html)) {
			issues.push(`${file.path}: the header carries no \`${versionLabel}\` pill (SPEC-revamp §4.2)`);
		}
		for (const pill of pills) {
			const label = textOf(pill[1]!);
			if (label !== versionLabel) {
				issues.push(
					`${file.path}: the version pill reads \`${label}\`, expected \`${versionLabel}\` — the one constant (SPEC-revamp §4.6)`,
				);
			}
		}

		for (const block of codeBlocksOf(html)) {
			issues.push(...blockIssues(block).map((issue) => `${file.path}: ${issue}`));
		}

		html = html.replace(pillPattern, ' ').replace(prePattern, ' ').replace(svgPattern, ' ').replace(stylePattern, ' ');
		for (const match of html.matchAll(versionPattern)) {
			issues.push(`${file.path}: the page reads \`${match[0]}\` — versions come from the one constant (SPEC-revamp §4.6)`);
		}
	}

	return issues;
}
