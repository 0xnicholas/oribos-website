/**
 * The hero product window's bar meta (SPEC-revamp §3.1): `trace id · model · duration`, derived
 * from the one locked run capture (`traces` collection, SPEC §7.5) — no second copy of the run's
 * facts, just a shorter reading of the same line.
 */

/**
 * The bar meta for a §7.5 meta line: the trace id, the model and the wall-clock duration,
 * `·`-separated. Segments the capture does not carry (steps, token counts) are dropped.
 */
export function windowBarMeta(meta: string): string {
	const parts = meta.split(' · ');
	const id = parts[0]?.replace(/^trace\s+/, '') ?? '';
	const model = parts[1] ?? '';
	const duration = parts.slice(2).find((part) => /^\d+(?:\.\d+)?(?:ms|s)$/.test(part.trim()));
	return [id, model, duration?.trim()].filter((part) => part !== undefined && part !== '').join(' · ');
}
