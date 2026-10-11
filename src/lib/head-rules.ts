/**
 * The §2.6 head of a page family: the meta description verbatim and the og pair that reuses
 * the table's title and description. Shared by the use-case and keyword gates — one
 * implementation, so the two page families cannot drift on what the head must carry.
 */

import { attributesOf } from './html.ts';

export type HeadPage = { path: string; html: string };

/** SPEC §2.6: the meta description verbatim; og:title / og:description reuse the table. */
export function headIssues(page: HeadPage, expected: { description: string; title: string }): string[] {
	const issues: string[] = [];

	const description = attributesOf(page.html, 'meta', 'name', 'description', 'content');
	if (description.length !== 1 || description[0] !== expected.description) {
		issues.push(`${page.path}: the meta description is not the §2.6 line verbatim`);
	}
	const ogDescription = attributesOf(page.html, 'meta', 'property', 'og:description', 'content');
	if (ogDescription.length !== 1 || ogDescription[0] !== expected.description) {
		issues.push(`${page.path}: og:description is not the §2.6 line verbatim`);
	}
	const ogTitle = attributesOf(page.html, 'meta', 'property', 'og:title', 'content');
	if (ogTitle.length !== 1 || ogTitle[0] !== expected.title) {
		issues.push(`${page.path}: og:title is \`${ogTitle.join(', ') || 'missing'}\`, expected \`${expected.title}\` (SPEC §2.6)`);
	}

	return issues;
}
