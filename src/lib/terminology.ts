/**
 * The CONTEXT.md vocabulary guards (SPEC §9.3) the site's copy holds: memory is thread / resource
 * identity (never session, short-term or long-term memory), multi-agent composition is the as-tool
 * composition story spelled out in docs (the shorthand stays off the marketing copy), and Harness
 * is a documentation category name rather than a module. Shared by the feature-tab and FAQ rules,
 * so one vocabulary list serves every gate.
 */

export type TerminologyHit = { term: string; reason: string };

/** The words the copy never carries, with the reason a finding prints. */
export const terminologyRules: readonly { pattern: RegExp; reason: string }[] = [
	{ pattern: /\bas-tool\b/i, reason: 'multi-agent composition is spelled out — the shorthand stays in docs (SPEC §9.3)' },
	{ pattern: /\bsupervisor\b/i, reason: 'multi-agent composition is as-tool, not supervisor (CONTEXT.md)' },
	{ pattern: /\bsub-?agent\b/i, reason: 'the vocabulary is as-tool composition, not sub-agent (CONTEXT.md)' },
	{ pattern: /\bthe harness module\b/i, reason: 'Harness is a documentation category name, not a module (CONTEXT.md)' },
	{ pattern: /\bsessions?\b/i, reason: 'memory is thread / resource identity, never a session (CONTEXT.md)' },
	{ pattern: /\bshort-term\b/i, reason: 'working memory is resource-scoped — no short-term memory (CONTEXT.md)' },
	{ pattern: /\blong-term\b/i, reason: 'working memory is resource-scoped — no long-term memory (CONTEXT.md)' },
];

/** Every term guard a text trips, one hit per term (its first match). */
export function terminologyHits(text: string): TerminologyHit[] {
	const hits: TerminologyHit[] = [];
	for (const { pattern, reason } of terminologyRules) {
		const match = text.match(pattern);
		if (match !== null) hits.push({ term: match[0], reason });
	}
	return hits;
}
