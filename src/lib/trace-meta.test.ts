import assert from 'node:assert/strict';
import { test } from 'node:test';
import { windowBarMeta } from './trace-meta.ts';
import { traceMeta } from './hero-rules.ts';

test('the §7.5 meta line shortens to trace id · model · duration', () => {
	assert.equal(
		windowBarMeta('trace 4f3c9a… · gpt-4o-mini · 2 steps · 1.62s · 214 in / 62 out tokens'),
		'4f3c9a… · gpt-4o-mini · 1.62s',
	);
});

test('the bar meta derives from the locked run capture, not a second copy', () => {
	assert.match(windowBarMeta(traceMeta), /^4f3c9a… · gpt-4o-mini · \d+(?:\.\d+)?s$/);
});

test('a capture without a duration segment drops it instead of guessing', () => {
	assert.equal(windowBarMeta('trace ab12cd… · claude-sonnet-4 · 3 steps · 88 in / 12 out tokens'), 'ab12cd… · claude-sonnet-4');
	assert.equal(windowBarMeta('trace ab12cd…'), 'ab12cd…');
	assert.equal(windowBarMeta(''), '');
});
