/**
 * The install-command slot discipline (SPEC-revamp §4.6, §2.10-5) over the built site. The v1 red
 * line — no install command anywhere — is retired: the site is published, and an install command
 * is allowed in exactly two slots, the global FAQ's second answer (SPEC-revamp §4.4) and the
 * agent prompt payload the chip CTA copies (SPEC-revamp §4.3). A match anywhere else, in any
 * built file, is a finding.
 *
 * The slots are read off the markup, not restated as text: slot one is the `<details>` whose
 * summary is the FAQ's npm question (the FAQ gate pins the nine pairs verbatim), slot two is the
 * chip's `<template data-agent-prompt-payload>`. `scripts/check-install.mjs` walks `dist/`.
 */

import { faqItems } from './faq-rules.ts';
import { lineAt, ruleMatches, type BuiltFile, type CopyRule } from './copy-rules.ts';
import { textOf } from './html.ts';

/** SPEC-revamp §4.4: the FAQ's second answer — install slot one. */
export const faqSlotQuestion = faqItems[1]!.question;

/** SPEC-revamp §4.3: the chip CTA's hidden payload — install slot two. */
export const payloadSlotMarker = 'data-agent-prompt-payload';

/** The install-class shapes (SPEC-revamp §4.6): the v1 set, now held to the two slots. */
export const installRules: readonly CopyRule[] = [
	{
		id: 'install-command',
		reason: 'install commands live in two slots only — the FAQ\'s npm answer and the agent prompt payload (SPEC-revamp §4.6)',
		pattern: /\b(?:npm|pnpm|bun|yarn)\s+(?:install|i|add|create|link|dlx|exec|x)\b/i,
	},
	{
		id: 'install-command',
		reason: 'install commands live in two slots only (SPEC-revamp §4.6)',
		pattern: /\bnpx\b/i,
	},
	{
		id: 'install-command',
		reason: 'install commands live in two slots only (SPEC-revamp §4.6)',
		pattern: /\bgit\s+clone\b/i,
	},
	{
		id: 'install-command',
		reason: 'a package manager next to `install` reads as an install command (SPEC-revamp §4.6)',
		pattern: /\binstall\b[^\n]{0,40}\b(?:npm|pnpm|bun|yarn)\b|\b(?:npm|pnpm|bun|yarn)\b[^\n]{0,40}\binstall\b/i,
	},
];

type InstallSlot = { slot: 'faq' | 'payload'; start: number; end: number };

/** The character ranges of a built page where an install command is allowed — the two slots. */
export function installSlotSpans(html: string): InstallSlot[] {
	const spans: InstallSlot[] = [];

	for (const match of html.matchAll(/<details\b[^>]*>[\s\S]*?<\/details>/gi)) {
		const summary = match[0].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
		if (summary !== undefined && textOf(summary) === faqSlotQuestion) {
			spans.push({ slot: 'faq', start: match.index ?? 0, end: (match.index ?? 0) + match[0].length });
		}
	}
	for (const match of html.matchAll(
		new RegExp(`<template\\b[^>]*\\b${payloadSlotMarker}\\b[^>]*>[\\s\\S]*?</template>`, 'gi'),
	)) {
		spans.push({ slot: 'payload', start: match.index ?? 0, end: (match.index ?? 0) + match[0].length });
	}

	return spans;
}

/**
 * Every install command outside the two slots, as `path:line: …` lines — one finding per rule
 * per line, like the red-line scan. Comments count (SPEC-revamp §4.6 names code comments), so no
 * file is stripped before the scan; a missing slot is a finding too, because the gate's premise
 * is that both slots ship.
 */
export function installIssues(files: readonly BuiltFile[]): string[] {
	const issues: string[] = [];
	const seen = new Set<string>();
	const slots = new Set<InstallSlot['slot']>();

	for (const file of files) {
		const spans = file.path.endsWith('.html') ? installSlotSpans(file.text) : [];
		for (const span of spans) slots.add(span.slot);

		for (const rule of installRules) {
			for (const match of ruleMatches(rule, file.text)) {
				const at = match.index ?? 0;
				if (spans.some((span) => at >= span.start && at < span.end)) continue;
				const key = `${file.path}:${lineAt(file.text, at)}:${rule.id}`;
				if (seen.has(key)) continue;
				seen.add(key);
				issues.push(`${file.path}:${lineAt(file.text, at)}: \`${match[0]}\` — ${rule.reason} [${rule.id}]`);
			}
		}
	}

	if (!slots.has('faq')) {
		issues.push(`no \`${faqSlotQuestion}\` answer in the built site — install slot one is gone (SPEC-revamp §4.4/§4.6)`);
	}
	if (!slots.has('payload')) {
		issues.push(`no \`${payloadSlotMarker}\` payload template in the built site — install slot two is gone (SPEC-revamp §4.3/§4.6)`);
	}

	return issues;
}
