/**
 * SPEC-revamp §2.1/§2.10: the roles the AA audit covers on the page background, and the scan
 * that keeps a section inside them. A section that reads on the page — no surface of its own —
 * may wear `text-ink` (body & headings), `text-ink2` (secondary), `text-acc` / `text-acc-h`
 * (links / kickers / the accent hover state), and nothing else: every foreground it ships is
 * then one the audit measured. `text-ink3` is the muted-meta role — deliberately outside AA
 * (§2.1 puts it below 4.5:1), decorative mono labelling, never running text; the scan lets it
 * through on the page so meta rows do not have to fake a surface.
 * Shared by the home-band and FAQ rules; the use-case rules reuse its colour-class readers
 * (`colourClassesOf` / `colourUtilities`) for the mocks' own allow-list.
 */

import { attributeValue, elementOf } from './html.ts';

export type ColourPage = { path: string; html: string };
/** A section the scan covers: its `data-` marker and the name a finding prints. */
export type PageSection = { marker: string; label: string };

/** SPEC-revamp §2.10: the audited foreground roles on the page background. */
export const auditedTextRoles = ['text-ink', 'text-ink2', 'text-acc', 'text-acc-h'] as const;
/** The muted-meta role: allowed on the page, never audited (§2.1 values are sub-AA by design). */
export const decorativeTextRoles = ['text-ink3'] as const;

/** The token layer's colour families — `text-xl`, `text-center` and `border-b` are not colours. */
const colourToken =
	/^(?:text|bg|border|divide|fill|stroke)-(?:ink[23]?|bg2?|line|acc(?:-h|-lo|-inv)?|code-bg)$/;

/** The colour-class tokens of a class list, variant prefixes (`hover:`, `aria-selected:`) dropped. */
export function colourUtilities(classes: string): string[] {
	const found: string[] = [];
	for (const raw of classes.split(/\s+/)) {
		if (raw === '') continue;
		const token = raw.slice(raw.lastIndexOf(':') + 1);
		if (colourToken.test(token)) found.push(token);
	}
	return found;
}

/** Every colour class the fragment's elements carry, in document order. */
export function colourClassesOf(fragment: string): string[] {
	return [...fragment.matchAll(/class\s*=\s*"([^"]*)"/gi)].flatMap((match) => colourUtilities(match[1]!));
}

/** The §2.10 findings for the given sections: a painted surface, or a text role off the audit. */
export function sectionColourIssues(page: ColourPage, sections: readonly PageSection[]): string[] {
	const issues: string[] = [];
	const pageRoles: readonly string[] = [...auditedTextRoles, ...decorativeTextRoles];
	for (const { marker, label } of sections) {
		const section = elementOf(page.html, 'section', marker);
		if (section === null) continue;

		const opening = section.slice(0, section.indexOf('>') + 1);
		const surface = colourUtilities(attributeValue(opening, 'class') ?? '').filter((token) => token.startsWith('bg-'));
		if (surface.length > 0) {
			issues.push(
				`${page.path}: the ${label} paints its own surface with \`${surface[0]}\` — the §2.10 audited pairs are the page-background pairs (SPEC-revamp §2.10)`,
			);
		}

		for (const token of colourClassesOf(section)) {
			if (!token.startsWith('text-')) continue;
			if (!pageRoles.includes(token)) {
				issues.push(
					`${page.path}: the ${label} paints text with \`${token}\` — §2.10 audits text-ink / text-ink2 / text-acc / text-acc-h on the page (text-ink3 is decorative meta)`,
				);
			}
		}
	}
	return issues;
}
