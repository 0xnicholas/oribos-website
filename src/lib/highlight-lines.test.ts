import assert from 'node:assert/strict';
import { test } from 'node:test';
import { highlightLines, type HighlightColours } from './highlight-lines.ts';

const colours: HighlightColours = {
	comment: { light: '#98988f', dark: '#74726b' },
	commentOnHighlight: { light: '#5f5f5c', dark: '#b3b1aa' },
};

/** A line span as shiki builds it: `<span class="line">` wrapping token spans. */
const line = (...styles: (string | undefined)[]) => ({
	tagName: 'span',
	properties: { class: 'line' },
	children: styles.map((style) => ({
		tagName: 'span',
		properties: style === undefined ? {} : { style },
		children: [{ type: 'text', value: 'x' }],
	})),
});

// Shiki's dual-theme emission: the default theme is the inline `color`, dark rides as a var;
// hex comes out upper-case.
const COMMENT_STYLE = 'color:#98988F;--shiki-dark:#74726B';
const CODE_STYLE = 'color:#161513;--shiki-dark:#F2F1EE';

test('only the listed lines take the `hl` class', () => {
	const transformer = highlightLines([2], colours);
	const first = line(CODE_STYLE);
	const second = line(CODE_STYLE);
	const third = line(CODE_STYLE);
	transformer.line(first, 1);
	transformer.line(second, 2);
	transformer.line(third, 3);
	assert.equal(first.properties['class'], 'line');
	assert.equal(second.properties['class'], 'line hl');
	assert.equal(third.properties['class'], 'line');
});

test('a highlighted line bumps its comment tokens to the ink2 pair, code spans untouched', () => {
	const transformer = highlightLines([1], colours);
	const node = line(`${CODE_STYLE}`, `${COMMENT_STYLE}`);
	transformer.line(node, 1);
	assert.equal(node.children[0]!.properties['style'], CODE_STYLE);
	assert.equal(node.children[1]!.properties['style'], 'color:#5F5F5C;--shiki-dark:#B3B1AA');
});

test('a plain line keeps its comments at the muted token', () => {
	const transformer = highlightLines([2], colours);
	const node = line(COMMENT_STYLE);
	transformer.line(node, 1);
	assert.equal(node.children[0]!.properties['style'], COMMENT_STYLE);
	assert.equal(node.properties['class'], 'line');
});

test('the colour match is case-insensitive; no highlight list marks nothing', () => {
	const transformer = highlightLines([], colours);
	const node = line('color:#98988f;--shiki-dark:#74726b');
	transformer.line(node, 1);
	assert.equal(node.properties['class'], 'line');
	assert.equal(node.children[0]!.properties['style'], 'color:#98988f;--shiki-dark:#74726b');
});
