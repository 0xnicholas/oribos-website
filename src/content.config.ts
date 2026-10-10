/**
 * The content collections (SPEC §8.3): the site's locked copy and artifacts as data with a
 * schema, read at build time with `getCollection()` / `getEntry()`. Pages stay hand-written
 * `.astro`; only the strings, code samples and trace rows live here.
 *
 * Collections so far:
 *   - `hero`          — the home hero's H1 and sub (SPEC §3.1 【终稿·勿改】)
 *   - `finalCta`      — the shared final CTA's heading and sub (SPEC §3.8)
 *   - `agentPrompt`   — the chip CTA's visible face and its hidden payload (SPEC-revamp §4.3),
 *                       rendered by the hero and the final CTA from this one entry
 *   - `features`      — the home feature tabs, one entry per tab (SPEC §3.2/§7.3)
 *   - `facts`         — the architecture facts band's four cells (SPEC-revamp §3.2 【终稿·勿改】)
 *   - `observability` — the observability band's copy and card claim (SPEC §3.3)
 *   - `useCaseIntro`  — the use-case cards' section intro (SPEC §3.5)
 *   - `useCases`      — the three use-case cards plus each use-case page's copy (SPEC §3.5/§4.3)
 *   - `resources`     — the resources band's kicker and its three cards (SPEC-revamp §3.6)
 *   - `faq`           — the global FAQ ×9, shared by the home and use-case pages (SPEC §3.7)
 *   - `keywordPages`  — the keyword pages' H1, §5.2 intro, argument cards, `Learn more` key,
 *                       in-page FAQ ×6 and back anchor (SPEC-revamp §5.2–§5.5), one JSON per page
 *   - `about`         — the /about page's sections (SPEC §4.1); the sub reuses the tagline
 *                       from `src/lib/brand.ts`, so it is not repeated here
 *   - `legalPages`    — the two legal stubs' H1 and paragraphs (SPEC §4.2), one JSON per page
 *   - `legalMeta`     — the one static `Last updated` date both legal pages carry (ticket #30:
 *                       the launch day edits exactly this string)
 *   - `snippets`      — code samples by file name (SPEC §7), one JSON per file
 *   - `traces`        — the hero's trace waterfall, a real run's static capture (SPEC §7.5)
 */

import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { keywordPageSlugs, resourceLinkKeys, textPageLinkKeys } from './lib/links.ts';

const hero = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/hero' }),
	schema: z.object({
		h1: z.string(),
		sub: z.string(),
	}),
});

const finalCta = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/final-cta' }),
	schema: z.object({
		heading: z.string(),
		sub: z.string(),
	}),
});

const agentPrompt = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/agent-prompt' }),
	schema: z.object({
		/** The chip's visible face (SPEC-revamp §4.3 【终稿·勿改】), one field per text slot. */
		tag: z.string(),
		button: z.string(),
		task: z.string(),
		cmeta: z.string(),
		/** The hidden payload the copy button takes, verbatim (SPEC-revamp §4.3). */
		payload: z.string(),
	}),
});

const features = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/features' }),
	schema: z.object({
		/** The tab order on the home page (SPEC §3.2: Agents → Workflows → Harness → Memory → MCP). */
		order: z.number().int(),
		/** The tab label; the entry's id is the panel's anchor (`#agents` …). */
		tab: z.string(),
		claim: z.string(),
		/** SPEC §3.2: a panel carries 3–5 supporting bullets. */
		bullets: z.array(z.object({ lead: z.string(), text: z.string() })).min(3).max(5),
		/** The code card's file tabs, in order — one or two files (SPEC §7.1/§7.3). */
		files: z.array(z.object({ file: z.string(), code: z.string() })).min(1).max(2),
	}),
});

const observability = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/observability' }),
	schema: z.object({
		/** SPEC §3.3: the band's kicker and its H2 claim. */
		kicker: z.string(),
		claim: z.string(),
		/** The band's lead paragraph (【终稿·勿改】). */
		lead: z.string(),
		/** The code card's claim above the `app.ts` card (【终稿·勿改】). */
		codeClaim: z.string(),
	}),
});

const facts = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/facts' }),
	schema: z.object({
		/** The fact's place in the strip (SPEC-revamp §3.2: one row of four, mobile 2×2). */
		order: z.number().int(),
		/** The fact, verbatim (SPEC-revamp §3.2 【终稿·勿改】) — an approved §9.1 absolute. */
		text: z.string(),
	}),
});

const useCaseIntro = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/use-case-intro' }),
	schema: z.object({
		/** SPEC §3.5 引言【终稿·勿改】: the section's heading and its second line. */
		heading: z.string(),
		sub: z.string(),
	}),
});

const useCases = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/use-cases' }),
	schema: z.object({
		/** The card's place on the home page (SPEC §3.5: in-product → operations → platform). */
		order: z.number().int(),
		title: z.string(),
		claim: z.string(),
		/** The use-case page the card title — and the whole card — links to (SPEC §2.1). */
		route: z.string(),
		/** Which host-interface mock the card carries (SPEC §3.5 brief ①–③) — the page's header mock reuses it (SPEC-revamp §5.1). */
		mock: z.enum(['chat', 'thread', 'console']),
		/**
		 * The use-case page's own copy (SPEC §4.3), landing with each page's build slice. The
		 * H1 is the card's `title`; the page adds the tagline and the three scenario cards —
		 * name, 2–3 sentences and the `→` package line (`·`-separated, inline code).
		 */
		page: z
			.object({
				tagline: z.string(),
				scenarios: z
					.array(
						z.object({
							name: z.string(),
							text: z.string(),
							packages: z.array(z.string()).min(1),
						}),
					)
					.length(3),
			})
			.optional(),
	}),
});

const resources = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/resources' }),
	schema: z.object({
		/** SPEC-revamp §3.6: the band's kicker, then exactly three cards by their `links.ts` key. */
		kicker: z.string(),
		links: z
			.array(
				z.object({
					label: z.string(),
					key: z.enum([...resourceLinkKeys]),
					/** The card's one-line description (SPEC-revamp §3.6 【终稿·勿改】). */
					description: z.string(),
				}),
			)
			.length(3),
	}),
});

const faq = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/faq' }),
	schema: z.object({
		/** The question's place on the page (SPEC §3.7: nine, in this order). */
		order: z.number().int(),
		question: z.string(),
		/** 1–3 sentences, self-contained, no links (SPEC §3.7). */
		answer: z.string(),
	}),
});

const keywordPages = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/keyword-pages' }),
	schema: z.object({
		/** The §2.6 title (【终稿】: `<Keyword> for TypeScript — Oribos`). */
		title: z.string(),
		/** The §2.6 meta description — og:description reuses it. */
		description: z.string(),
		/** The §4.4 H1 (【终稿·勿改】): the keyword's face plus its claim. */
		h1: z.string(),
		/** The §5.2 hero intro paragraph (【终稿·勿改】) — one self-contained overview below the H1. */
		intro: z.string(),
		/** §5.4: the argument cards — the v1 sections' words, 3–4 per page, heading + body. */
		sections: z.array(z.object({ heading: z.string(), body: z.string() })).min(3).max(4),
		/** The `Learn more` target — a key of `learnMoreLinks` in links.ts (the §4.4 mapping). */
		learnMore: z.enum([...keywordPageSlugs]),
		/** §5.3: the in-page FAQ — 6 questions per page (§5.5 slot 6–8), zero overlap with the global nine. */
		faq: z.array(z.object({ question: z.string(), answer: z.string() })).min(6).max(8),
		/** The §4.4 anchor mapping: the home anchor the page links back to (`/#features` …). */
		backAnchor: z.string(),
	}),
});

const snippets = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/snippets' }),
	schema: z.object({
		/** The file name shown in the tab, e.g. `agent.ts` — also the copy's name. */
		file: z.string(),
		/** The code, verbatim; the rendered text is what a copy button copies. */
		code: z.string(),
	}),
});

/**
 * A paragraph of the about / legal pages' copy: plain text runs and links whose hrefs come
 * from the one constants file (SPEC §2.4) — the JSON names the key, never the URL.
 */
const copySegment = z.union([
	z.object({ text: z.string() }),
	z.object({ link: z.object({ label: z.string(), key: z.enum([...textPageLinkKeys]) }) }),
]);

const about = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/about' }),
	schema: z.object({
		/** The §2.6 title and meta description. */
		title: z.string(),
		description: z.string(),
		/** SPEC §4.1: the H1; the sub is `publicTagline` from src/lib/brand.ts, read by the page. */
		h1: z.string(),
		storyHeading: z.string(),
		/** SPEC §4.1 【终稿·勿改】: Our story's two paragraphs (the etymology line was dropped 2026-10-03). */
		story: z.array(z.string()).length(2),
		behindHeading: z.string(),
		/** SPEC §4.1 【终稿·勿改】: Who's behind it — two paragraphs, the signature a link segment. */
		behind: z.array(z.array(copySegment)).length(2),
		/** SPEC §4.1 【终稿·勿改】: the closing invitation band. */
		closing: z.object({ lead: z.string(), sub: z.string() }),
	}),
});

const legalPages = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/legal-pages' }),
	schema: z.object({
		/** The §2.6 title and meta description. */
		title: z.string(),
		description: z.string(),
		h1: z.string(),
		/** SPEC §4.2 【终稿·勿改】: the stub's paragraphs; the contact link is a link segment. */
		paragraphs: z.array(z.array(copySegment)).min(1),
	}),
});

const legalMeta = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/legal-meta' }),
	schema: z.object({
		/**
		 * The one static `Last updated` date both legal pages carry (SPEC §4.2 / ticket #30) —
		 * a string, never a build-time date; the launch day edits exactly this value.
		 */
		lastUpdated: z.string(),
	}),
});

const traces = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/traces' }),
	schema: z.object({
		/** The card head, verbatim from the run capture (SPEC §7.5). */
		meta: z.string(),
		rows: z.array(
			z.object({
				lane: z.string(),
				left: z.number(),
				width: z.number(),
				value: z.string(),
				/** `tool` rows take the trace-green; every other row takes the accent. */
				tone: z.enum(['accent', 'tool']),
			}),
		),
		/** The card foot, verbatim. */
		summary: z.string(),
	}),
});

export const collections = {
	hero,
	finalCta,
	agentPrompt,
	features,
	facts,
	observability,
	useCaseIntro,
	useCases,
	resources,
	faq,
	keywordPages,
	about,
	legalPages,
	legalMeta,
	snippets,
	traces,
};
