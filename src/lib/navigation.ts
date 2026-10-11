/**
 * The header and footer navigation, as data (SPEC §2.2/§2.3). The two components share the
 * use-case list here rather than each writing their own copy; the external targets come from
 * `src/lib/links.ts`, so the docs switch point stays one edit.
 *
 * The gate keeps its own copy of these strings (`src/lib/shell-rules.ts`), so the rendered
 * page and the spec's shell cannot agree by construction.
 */

import { LINKS } from './links.ts';

export type NavItem = { label: string; href: string };
export type UseCaseItem = NavItem & { description: string };

/** SPEC §2.2: the three dropdown items — titles verbatim, descriptions the drafted copy. */
export const useCaseItems: readonly UseCaseItem[] = [
	{
		label: 'In-product agents',
		description: 'An assistant inside the app you already run.',
		href: '/in-product-agents/',
	},
	{
		label: 'Operations agents',
		description: 'Busywork handled — with a human on the risky steps.',
		href: '/operations-agents/',
	},
	{
		label: 'Platform & developer infra',
		description: 'Primitives your product teams compose.',
		href: '/developer-infrastructure/',
	},
];

/** SPEC §2.3: four columns, in order. The keyword pages enter the site through Framework. */
export const footerColumns: readonly { heading: string; items: readonly NavItem[] }[] = [
	{
		heading: 'Framework',
		items: [
			{ label: 'Agent framework', href: '/ai-agent-framework/' },
			{ label: 'Agents', href: '/ai-agents/' },
			{ label: 'Workflows', href: '/ai-workflows/' },
			{ label: 'Observability', href: '/ai-agent-observability/' },
		],
	},
	{
		heading: 'Use cases',
		items: useCaseItems.map(({ label, href }) => ({ label, href })),
	},
	{
		heading: 'Developers',
		items: [
			{ label: 'Docs', href: LINKS.docs },
			{ label: 'Examples', href: LINKS.examples },
			{ label: 'Architecture', href: LINKS.architecture },
		],
	},
	{
		heading: 'Project',
		items: [
			{ label: 'About', href: '/about/' },
			{ label: 'GitHub', href: LINKS.github },
		],
	},
];
