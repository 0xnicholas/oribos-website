/**
 * The copy buttons' shared behaviour (SPEC §6.1/§7.1, SPEC-revamp §4.3): a code card's copy takes
 * the visible code block's text, verbatim — the rendered `<pre>` of the pane on screen — so the
 * clipboard gets exactly what the visitor read; the chip CTA's copy takes its hidden payload.
 */

/** How long the copied state shows before the button resets (SPEC §3.1: 1.2s). */
const copiedMs = 1200;

/** The verbatim text of the visible code block inside `scope`. */
function visibleCode(scope: ParentNode): string | null {
	const text = scope.querySelector('pre')?.textContent;
	if (text === undefined || text === '') return null;
	// Shiki separates its line spans with newlines; the code block carries no trailing one.
	return text.replace(/\n$/, '');
}

/** Write one text to the clipboard; resolves to whether the clipboard took it. */
async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// No clipboard access (insecure context, denied permission): the button stays put.
		return false;
	}
}

/**
 * Wire a copy button to a text the caller supplies — the chip CTA's hidden payload (SPEC-revamp
 * §4.3) reads its `<template>`, a code card its visible pane. On a successful copy the button
 * shows the copied state, and resets it after 1.2s; the timer never overlaps itself when the
 * button is clicked twice. The caller owns what "copied" looks like — a label swap, an icon swap.
 */
export function wireCopyText(
	button: HTMLElement,
	text: () => string | null | undefined,
	{ onCopied, onReset }: { onCopied: () => void; onReset: () => void },
): void {
	let reset: number | undefined;
	button.addEventListener('click', async () => {
		const value = text();
		if (value === null || value === undefined || value === '' || !(await copyText(value))) return;
		window.clearTimeout(reset);
		onCopied();
		reset = window.setTimeout(onReset, copiedMs);
	});
}

/**
 * Wire a copy button: on click it copies the code `target()` points at, shows the copied state,
 * and resets it after 1.2s (SPEC §7.1). A button whose target is gone stays inert.
 */
export function wireCopyButton(
	button: HTMLElement,
	target: () => ParentNode | null | undefined,
	handlers: { onCopied: () => void; onReset: () => void },
): void {
	wireCopyText(
		button,
		() => {
			const scope = target();
			return scope === null || scope === undefined ? null : visibleCode(scope);
		},
		handlers,
	);
}
