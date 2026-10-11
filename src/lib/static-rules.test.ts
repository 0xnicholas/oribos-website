import assert from 'node:assert/strict';
import { test } from 'node:test';
import { staticOutputIssues } from './static-rules.ts';

const config = "export default defineConfig({ output: 'static', site: SITE.origin });";
const packageJson = { dependencies: { astro: '7.3.5' }, devDependencies: { typescript: '^6.0.3' } };

test('a static build with no adapter and a portable dist passes', () => {
	assert.deepEqual(
		staticOutputIssues({ config, packageJson, distFiles: ['index.html', '_astro/index.css', 'sitemap-0.xml'] }),
		[],
	);
});

test('the output mode and the adapter list are both checked', () => {
	assert.match(staticOutputIssues({ config: 'defineConfig({})', packageJson, distFiles: [] })[0]!, /output: 'static'/);
	assert.ok(
		staticOutputIssues({ config: "defineConfig({ adapter: node(), output: 'server' })", packageJson, distFiles: [] }).some(
			(issue) => /configures an adapter/.test(issue),
		),
	);
	assert.match(
		staticOutputIssues({ config, packageJson: { dependencies: { '@astrojs/node': '9.0.0' } }, distFiles: [] })[0]!,
		/adapter package/,
	);
});

test('server output in dist is a finding', () => {
	for (const file of ['_worker.js', 'server/entry.mjs', '_middleware.js', 'entry.cjs']) {
		assert.ok(
			staticOutputIssues({ config, packageJson, distFiles: [file] }).length > 0,
			`expected a finding for dist/${file}`,
		);
	}
});
