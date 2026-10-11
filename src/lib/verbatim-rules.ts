/**
 * The 【终稿·勿改】 verbatim gate (SPEC-revamp 完成定义, issue #50): the copy the SPEC locks —
 * the §3.2 facts band, the §3.6 Resources descriptions, the §4.3 chip face and payload, the
 * §4.4 FAQ answer, the §4.5 final-CTA sub, the §5.2 keyword-page intros and the §5.3 new FAQ
 * rows — must sit in the content collections character for character, including punctuation,
 * em dashes and casing. The blocks are read out of `docs/SPEC-revamp.md` itself at gate time, so
 * an owner amending the SPEC (§9 登记) moves the gate with it instead of past it; a block the
 * gate can no longer find is a finding too, so a SPEC edit cannot slip past silently.
 *
 * Matching is whitespace-collapsed: the SPEC hard-wraps prose, the collections store it as one
 * string, and the rendered page re-wraps both — every character must line up, the line breaks
 * need not. Labelled lines (the chip face's `tag（…）：` rows, the Resources' `Docs:` rows) have
 * their label stripped before the match; the copy after it must be exact.
 *
 * `scripts/check-verbatim.mjs` reads the SPEC and the collections and prints the findings.
 */

import type { BuiltFile } from './copy-rules.ts';

/** Where one SPEC block must appear: the `### N.N` heading whose section holds it. */
export type BlockExpectation = {
	/** The section heading prefix, e.g. `### 4.3`. */
	heading: string;
	/** Zero-based ordinal of the block among the section's plain (untagged) fenced blocks. */
	block: number;
	/** `lines`: each line of the block is one locked string; `paragraph`: the whole block is. */
	mode: 'lines' | 'paragraph';
	/** Strip a leading `label:` / `label：` prefix from each line before matching. */
	stripLabel?: boolean;
	/** Repo-relative files or directories; the copy must sit in at least one of them. */
	scope: readonly string[];
};

/** Where one SPEC table's cells must appear. */
export type TableExpectation = {
	heading: string;
	/** Cell ordinals (after splitting a row on `|`) holding the locked strings, in order. */
	columns: readonly number[];
	scope: readonly string[];
	/**
	 * Map a row's cells to the one file the row's copy must sit in — the per-row mapping the
	 * §5.3 table carries in its first column. When absent, every cell is held against the whole
	 * scope.
	 */
	fileFor?: (cells: readonly string[]) => string;
};

/** The locked blocks of SPEC-revamp, and the collections that carry them. */
export const specBlocks: readonly BlockExpectation[] = [
	{ heading: '### 3.2', block: 0, mode: 'lines', scope: ['src/content/facts'] },
	{ heading: '### 3.6', block: 0, mode: 'lines', stripLabel: true, scope: ['src/content/resources'] },
	{ heading: '### 4.3', block: 0, mode: 'lines', stripLabel: true, scope: ['src/content/agent-prompt'] },
	{ heading: '### 4.3', block: 1, mode: 'paragraph', scope: ['src/content/agent-prompt'] },
	{ heading: '### 4.4', block: 0, mode: 'paragraph', scope: ['src/content/faq'] },
	{ heading: '### 4.5', block: 0, mode: 'paragraph', scope: ['src/content/final-cta'] },
	{ heading: '### 5.2', block: 1, mode: 'paragraph', scope: ['src/content/keyword-pages/ai-agent-framework.json'] },
	{ heading: '### 5.2', block: 2, mode: 'paragraph', scope: ['src/content/keyword-pages/ai-agents.json'] },
	{ heading: '### 5.2', block: 3, mode: 'paragraph', scope: ['src/content/keyword-pages/ai-workflows.json'] },
	{ heading: '### 5.2', block: 4, mode: 'paragraph', scope: ['src/content/keyword-pages/ai-agent-observability.json'] },
];

/** The locked table rows of SPEC-revamp. §5.3's new FAQ: one row per keyword page —
 * the page cell names the file the row's question and answer must land in. */
export const specTables: readonly TableExpectation[] = [
	{
		heading: '### 5.3',
		columns: [1, 2],
		scope: ['src/content/keyword-pages'],
		fileFor: (cells) => `src/content/keyword-pages${cells[0]}.json`,
	},
];

/** Whitespace-collapsed form: every character must match, line breaks need not. */
export const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** A labelled line's copy: everything after the first `:` / `：` and its spacing. */
export const withoutLabel = (line: string): string => line.replace(/^.*?[:：]\s*/, '');

/** The lines of one plain fenced block: ```` ``` ```` opens and closes it, no language tag. */
export function plainBlocks(section: string): string[] {
	const blocks: string[] = [];
	const lines = section.split('\n');
	for (let index = 0; index < lines.length; index += 1) {
		if (lines[index] !== '```') continue;
		const body: string[] = [];
		index += 1;
		while (index < lines.length && lines[index] !== '```') {
			body.push(lines[index]!);
			index += 1;
		}
		blocks.push(body.join('\n'));
	}
	return blocks;
}

/** The section a heading opens: from the heading line to the next `##`/`###` heading. */
export function sectionOf(spec: string, heading: string): string {
	const lines = spec.split('\n');
	const start = lines.findIndex((line) => line.startsWith(`${heading} `));
	if (start === -1) return '';
	let end = lines.length;
	for (let index = start + 1; index < lines.length; index += 1) {
		if (/^#{2,3} /.test(lines[index]!)) {
			end = index;
			break;
		}
	}
	return lines.slice(start, end).join('\n');
}

/** A markdown table's rows, each split into its cells; header and separator rows dropped.
 * Cells lose their surrounding inline-code backticks — markup, not content. */
export function tableRows(section: string): string[][] {
	const rows: string[][] = [];
	for (const line of section.split('\n')) {
		if (!line.trimStart().startsWith('|')) continue;
		const cells = line
			.trim()
			.replace(/^\|/, '')
			.replace(/\|$/, '')
			.split('|')
			.map((cell) => cell.trim().replace(/^`(.*)`$/s, '$1'));
		if (cells.every((cell) => /^:?-{3,}:?$/.test(cell) || cell === '')) continue;
		rows.push(cells);
	}
	return rows.length > 0 ? rows.slice(1) : [];
}

/** A file the verbatim scan reads — the same shape the built-file gates scan. */
export type SpecFile = BuiltFile;

/** Every string leaf of a parsed JSON value, so a corpus can hold a JSON collection's copy. */
const stringLeaves = (value: unknown): string[] =>
	typeof value === 'string'
		? [value]
		: Array.isArray(value)
			? value.flatMap(stringLeaves)
			: value !== null && typeof value === 'object'
				? Object.values(value).flatMap(stringLeaves)
				: [];

/** The scope files a corpus covers, as normalized text a locked string must appear in. */
export function corpusOf(files: readonly SpecFile[], scope: readonly string[]): readonly string[] {
	const inScope = files.filter((file) => scope.some((entry) => file.path === entry || file.path.startsWith(`${entry}/`)));
	return inScope.map((file) => {
		// A JSON collection escapes its newlines, so its corpus is the parsed string values, not
		// the raw file text; anything else (markdown, yaml) is already plain text.
		if (file.path.endsWith('.json')) {
			try {
				return normalize(stringLeaves(JSON.parse(file.text)).join('\n'));
			} catch {
				return normalize(file.text);
			}
		}
		return normalize(file.text);
	});
}

const missingIn = (corpus: readonly string[], needle: string): boolean =>
	!corpus.some((text) => text.includes(needle));

/**
 * Every verbatim finding: a locked string the SPEC states but no scope file carries, or a
 * block/table the gate can no longer find in the SPEC (the SPEC moved — the expectation table
 * must move with it). The expectations are injectable so tests can pin the matching rules on a
 * miniature SPEC; the gate runs the real `specBlocks` / `specTables`.
 */
export function verbatimIssues(
	spec: string,
	files: readonly SpecFile[],
	{ blocks = specBlocks, tables = specTables }: { blocks?: readonly BlockExpectation[]; tables?: readonly TableExpectation[] } = {},
): string[] {
	const issues: string[] = [];

	for (const expectation of blocks) {
		const block = plainBlocks(sectionOf(spec, expectation.heading))[expectation.block];
		if (block === undefined) {
			issues.push(`docs/SPEC-revamp.md ${expectation.heading}: locked block ${expectation.block} is gone — update the expectation table`);
			continue;
		}
		const corpus = corpusOf(files, expectation.scope);
		const locked =
			expectation.mode === 'paragraph'
				? [normalize(block)]
				: block.split('\n').filter((line) => line.trim() !== '').map((line) => normalize(expectation.stripLabel ? withoutLabel(line) : line));
		for (const needle of locked) {
			if (missingIn(corpus, needle)) {
				issues.push(`${expectation.scope.join(' / ')}: locked copy is not verbatim — «${needle.slice(0, 80)}${needle.length > 80 ? '…' : ''}» (SPEC-revamp ${expectation.heading})`);
			}
		}
	}

	for (const expectation of tables) {
		const rows = tableRows(sectionOf(spec, expectation.heading));
		if (rows.length === 0) {
			issues.push(`docs/SPEC-revamp.md ${expectation.heading}: the locked table is gone — update the expectation table`);
			continue;
		}
		const corpus = corpusOf(files, expectation.scope);
		for (const row of rows) {
			const rowScope = expectation.fileFor ? [expectation.fileFor(row)] : expectation.scope;
			const corpus = corpusOf(files, rowScope);
			for (const column of expectation.columns) {
				const cell = row[column];
				if (cell === undefined || cell === '') {
					issues.push(`docs/SPEC-revamp.md ${expectation.heading}: table row has no column ${column} — update the expectation table`);
					continue;
				}
				const needle = normalize(cell);
				if (missingIn(corpus, needle)) {
					issues.push(`${rowScope.join(' / ')}: locked copy is not verbatim — «${needle.slice(0, 80)}${needle.length > 80 ? '…' : ''}» (SPEC-revamp ${expectation.heading})`);
				}
			}
		}
	}

	return issues;
}
