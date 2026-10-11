/**
 * Shared plumbing for the gate scripts: argument parsing, file walks, JSON reads and the
 * ✓/✗ report shape `pnpm verify` prints. Nothing here knows about a gate's subject matter.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The head every gate script shares: locate the repository root from the script's own URL,
 * parse `--root` plus the gate's own `--…` values, and exit 2 on a typo before any check runs.
 */
export function startGate(importMetaUrl, argv, { values = [] } = {}) {
	const root = fileURLToPath(new URL('..', importMetaUrl));
	const { options, errors } = parseArgs(argv, { values: ['root', ...values] });
	if (errors.length > 0) {
		for (const error of errors) console.error(`✗ ${error}`);
		process.exit(2);
	}
	return { repoRoot: options.root ?? root, options };
}

/**
 * Parse `--key value`, `--key=value` and boolean `--flag` options. Unknown options and bare
 * positionals are errors: a gate that silently ignores a typo is a gate that lies.
 */
export function parseArgs(argv, { values = [] } = {}) {
	const options = {};
	const errors = [];

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (!token.startsWith('--')) {
			errors.push(`unexpected argument \`${token}\``);
			continue;
		}

		const [name, inline] = token.slice(2).split('=');
		if (values.includes(name)) {
			const value = inline ?? argv[index + 1];
			if (value === undefined || value.startsWith('--')) {
				errors.push(`--${name} needs a value`);
				continue;
			}
			if (inline === undefined) index += 1;
			options[name] = value;
		} else {
			errors.push(`unknown option \`--${name}\``);
		}
	}

	return { options, errors };
}

/** Every file under `directory`, as forward-slashed paths relative to it, sorted. */
export function filesUnder(directory) {
	if (!existsSync(directory)) return [];
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
		.sort();
}

/** The extensions the red-line gates read: markup, shipped code and plain text. */
const textExtensions = ['.html', '.js', '.css', '.xml', '.txt', '.json', '.svg'];

/** Every built text file under `directory`, as `{ path, text }`. */
export function textFiles(directory) {
	return filesUnder(directory)
		.filter((file) => textExtensions.some((extension) => file.endsWith(extension)))
		.map((file) => ({ path: file, text: readFileSync(path.join(directory, file), 'utf8') }));
}

/** Every built HTML page under `directory`, as `{ path, html }`. */
export function builtPages(directory) {
	return filesUnder(directory)
		.filter((file) => file.endsWith('.html'))
		.map((file) => ({ path: file, html: readFileSync(path.join(directory, file), 'utf8') }));
}

/**
 * The styles the pages ship: every `.css` file plus the `<style>` blocks inlined into the pages
 * (Astro inlines small scoped styles). The shell and hero gates read this, so where a rule lives
 * does not decide whether it counts.
 */
export function shippedCss(directory, pages) {
	return [
		...filesUnder(directory)
			.filter((file) => file.endsWith('.css'))
			.map((file) => readFileSync(path.join(directory, file), 'utf8')),
		...pages.flatMap((page) =>
			[...page.html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1] ?? ''),
		),
	].join('\n');
}

/** The scripts the pages ship: every `.js` file plus the inline `<script>` blocks. */
export function shippedScripts(directory, pages) {
	return [
		...filesUnder(directory)
			.filter((file) => file.endsWith('.js'))
			.map((file) => readFileSync(path.join(directory, file), 'utf8')),
		...pages.flatMap((page) =>
			[...page.html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1] ?? ''),
		),
	];
}

/** Read JSON with a message a human can act on; returns `{ value }` or `{ error }`. */
export function readJson(file) {
	let text;
	try {
		text = readFileSync(file, 'utf8');
	} catch (error) {
		return { error: `cannot read ${file}: ${error.message}` };
	}
	try {
		return { value: JSON.parse(text) };
	} catch (error) {
		return { error: `${file} is not valid JSON: ${error.message}` };
	}
}

/** Read a file as text, or `null` when it is not there — a missing artifact is a finding. */
export function readText(file) {
	try {
		return readFileSync(file, 'utf8');
	} catch {
		return null;
	}
}

/** One ✓ line per rule that held; every finding on its own ✗ line. */
export function reportIssues(issues, okMessage) {
	if (issues.length === 0) {
		console.log(`✓ ${okMessage}`);
		return;
	}
	for (const issue of issues) console.error(`✗ ${issue}`);
}

/**
 * Run a gate's checks: one `[findings, okMessage]` pair per rule, reported in order, with
 * every finding returned for the closing count.
 */
export function runChecks(checks) {
	for (const [found, okMessage] of checks) reportIssues(found, okMessage);
	return checks.flatMap(([found]) => found);
}

/** End a gate: exit 1 with the count and the pointer, or print the closing line and return. */
export function failGate(issues, { summary, hint }) {
	if (issues.length === 0) return;
	console.error(`\n${issues.length} ${summary}`);
	if (hint) console.error(hint);
	process.exit(1);
}
