import assert from 'node:assert/strict';
import { test } from 'node:test';
import { featureIssues, featureKicker, featureScriptIssues, features } from './feature-rules.ts';

const page = (html: string) => ({ path: 'index.html', html: `<html><body>${html}</body></html>` });

const codeBlock = (code: string) =>
	`<pre class="astro-code astro-code-themes oribos-light oribos-dark" style="background-color:#fff;--shiki-dark-bg:#151513;overflow-x: auto;" tabindex="0"><code>${code
		.split('\n')
		.map((line) => `<span class="line">${line}</span>`)
		.join('\n')}</code></pre>`;

const card = (feature: (typeof features)[number]) => `<div data-code-tabs>
	<div role="tablist">${feature.files.map((file, index) => `<button type="button" role="tab" aria-selected="${index === 0}">${file.file}</button>`).join('')}</div>
	${feature.files.map((file) => codeBlock(file.code)).join('')}
</div>`;

const panel = (feature: (typeof features)[number], index: number) =>
	`<div role="tabpanel" id="feature-panel-${feature.id}" aria-labelledby="${feature.id}" data-feature-panel${index === 0 ? '' : ' hidden'}>
	<h3>${feature.claim}</h3>
	<ul>${feature.bullets.map((bullet) => `<li><strong>${bullet.lead}</strong> — ${bullet.text}</li>`).join('')}</ul>
	${card(feature)}
</div>`;

const section = (list: readonly (typeof features)[number][] = features) => `<section id="features" data-features>
	<p>${featureKicker}</p>
	<div role="tablist" aria-label="${featureKicker}">${list
		.map(
			(feature, index) =>
				`<button type="button" role="tab" id="${feature.id}" aria-controls="feature-panel-${feature.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-feature-tab>${feature.tab}</button>`,
		)
		.join('')}</div>
	${list.map((feature, index) => panel(feature, index)).join('')}
</section>`;

const script =
	'const s=document.querySelector("[data-features]");const tabs=[...s.querySelectorAll("[data-feature-tab]")];const panels=[...s.querySelectorAll("[data-feature-panel]")];addEventListener("hashchange",()=>select(location.hash));tab.setAttribute("aria-selected","true");panel.hidden=true;if(e.key==="ArrowRight"||e.key==="ArrowLeft"){}';

test('a features page passes every feature rule', () => {
	assert.deepEqual(featureIssues(page(section())), []);
	assert.deepEqual(featureScriptIssues([script]), []);
});

test('the section is #features with the five tabs in the §3.2 order and their anchors', () => {
	assert.match(featureIssues(page('<p>nothing</p>'))[0]!, /no #features section/);

	const noKicker = page(section().replace(featureKicker, 'Everything'));
	assert.match(featureIssues(noKicker)[0]!, /kicker/);

	const swapped = [...features];
	[swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
	assert.match(featureIssues(page(section(swapped)))[0]!, /feature tab 1 reads `Workflows`/);

	const renamed = page(section().replace('id="harness"', 'id="harnes"'));
	assert.match(featureIssues(renamed).join('\n'), /#harness` direct-links it/);

	const four = page(section(features.slice(0, 4)));
	assert.match(featureIssues(four).join('\n'), /4 feature tabs, expected 5/);

	const miswired = page(section().replace('aria-controls="feature-panel-memory"', 'aria-controls="feature-panel-workflows"'));
	assert.match(featureIssues(miswired).join('\n'), /tab controls `feature-panel-workflows`/);

	const mislabelled = page(section().replace('aria-labelledby="memory"', 'aria-labelledby="agents"'));
	assert.match(featureIssues(mislabelled).join('\n'), /panel is not labelled by its tab/);
});

test('the claims and bullets are the §3.2 copy, once each', () => {
	const otherClaim = page(section().replace(features[2]!.claim, 'Runs that never stop.'));
	assert.match(featureIssues(otherClaim).join('\n'), /`Harness` claim is `Runs that never stop\.`/);

	const editedBullet = page(section().replace('recalled into the prompt', 'summarised into the prompt'));
	assert.match(featureIssues(editedBullet)[0]!, /bullet 2/);

	const bulletless = page(section().replace('<li><strong>Signals</strong> — inject into a live run, wake an idle thread, or queue in order.</li>', ''));
	assert.match(featureIssues(bulletless)[0]!, /3 bullets, expected 4/);

	const echoed = page(`${section()}<p>${features[0]!.claim}</p>`);
	assert.match(featureIssues(echoed)[0]!, /appears 2 times/);
});

test('each panel carries its §7.3 code card: files in order, code verbatim, ten lines at most', () => {
	const edited = page(section().replace('processOutputStep: ({ step }) => audit(step),', 'processOutputStep: ({ step }) => review(step),'));
	assert.match(featureIssues(edited)[0]!, /`agent.ts` is not the §7.3 snippet verbatim/);

	const renamed = page(section().replace('>resume.ts<', '>retry.ts<'));
	assert.match(featureIssues(renamed)[0]!, /shows \[workflow.ts, retry.ts\]/);

	const longer = structuredClone(features) as (typeof features)[number][];
	longer[1]!.files[0]!.code = `${longer[1]!.files[0]!.code}\nconst a = 1;\nconst b = 2;\nconst c = 3;`;
	assert.match(featureIssues(page(section(longer))).join('\n'), /snippet is 11 lines/);

	const singleTheme = page(section().replace(/\soribos-light/g, ''));
	assert.match(featureIssues(singleTheme)[0]!, /theme pair/);

	const echoed = page(`${section()}<pre><code>${features[4]!.files[0]!.code}</code></pre>`);
	assert.match(featureIssues(echoed).join('\n'), /`server.ts` appears 2 times/);
});

test('without JS the first panel is the visible one and the buttons are inert', () => {
	const firstHidden = page(section().replace('data-feature-panel>', 'data-feature-panel hidden>'));
	assert.match(featureIssues(firstHidden)[0]!, /first feature panel/);

	const secondVisible = page(section().replace('data-feature-panel hidden>', 'data-feature-panel>'));
	assert.match(featureIssues(secondVisible)[0]!, /#2 feature panel is visible/);
});

test('the feature tabs keep the terminology guard', () => {
	const asTool = page(section().replace('an agent is an ordinary step', 'as-tool composition makes each agent a tool'));
	assert.match(featureIssues(asTool).join('\n'), /read `as-tool`/);

	const moduleWord = page(section().replace('Durable execution for humans and time.', 'The Harness module keeps runs alive.'));
	assert.match(featureIssues(moduleWord).join('\n'), /read `The Harness module` — Harness is a documentation category name/);

	const session = page(section().replace('the conversation is named per call', 'the session is named per call'));
	assert.match(featureIssues(session).join('\n'), /read `session`/);

	const longTerm = page(section().replace('Working memory', 'Long-term memory'));
	assert.match(featureIssues(longTerm).join('\n'), /read `Long-term`/);
});

test('the shipped script switches panels, follows the hash and takes the arrow keys', () => {
	assert.match(featureScriptIssues(['console.log("no tabs")'])[0]!, /data-feature-tab/);
	assert.match(featureScriptIssues([script.replace('location.hash', 'location.search')])[0]!, /location\.hash/);
	assert.match(featureScriptIssues([script.replace('hashchange', 'scroll')])[0]!, /hashchange/);
	assert.match(featureScriptIssues([script.replace('ArrowRight', 'Right')])[0]!, /arrow keys/);
	assert.match(featureScriptIssues([script.replace(/"aria-selected"/, '"selected"')])[0]!, /aria-selected/);
});
