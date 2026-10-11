/**
 * The site's page list (SPEC §2.1) with the titles §2.6 locks. Three consumers read it, so the
 * eleven routes exist once:
 *
 *  - `scripts/check-links.mjs` treats a link to a registered page as a link to a page this site
 *    publishes, while the page itself lands in a later build slice;
 *  - the shell gate (`scripts/check-shell.mjs`) reports how many of the eleven the build has;
 *  - `public/llms.txt` is checked against it, entry by entry.
 *
 * Titles are the §2.6 values, `— Oribos` suffix included. The 404 is not in the list: it is an
 * error page, not one of the eleven.
 */

export type SitePage = { route: string; title: string };

export const pages: readonly SitePage[] = [
	{ route: '/', title: 'Oribos — ultralight TypeScript AI agent framework' },
	{ route: '/about/', title: 'About — Oribos' },
	{ route: '/privacy-policy/', title: 'Privacy policy — Oribos' },
	{ route: '/terms-of-service/', title: 'Terms of service — Oribos' },
	{ route: '/in-product-agents/', title: 'In-product agents — Oribos' },
	{ route: '/operations-agents/', title: 'Operations agents — Oribos' },
	{ route: '/developer-infrastructure/', title: 'Platform & developer infra — Oribos' },
	{ route: '/ai-agent-framework/', title: 'AI agent framework for TypeScript — Oribos' },
	{ route: '/ai-agents/', title: 'AI agents for TypeScript — Oribos' },
	{ route: '/ai-workflows/', title: 'AI workflows for TypeScript — Oribos' },
	{ route: '/ai-agent-observability/', title: 'AI agent observability for TypeScript — Oribos' },
];
