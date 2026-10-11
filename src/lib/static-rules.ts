/**
 * The artifact-shape rules (SPEC §8.1/§8.2): static output, no adapter, and a `dist/` that is
 * a portable directory of pages and assets — no server script, no platform worker, nothing a
 * host would have to execute.
 */

/** Adapter packages the spec forbids by name and by shape (`@astrojs/<platform>`). */
const adapterPackagePattern = /^@astrojs\/(?:node|vercel|netlify|cloudflare|deno|bun|adapter-)/;

/** Files that only exist when the build produced something a host must run. */
const serverArtifactPattern = /(^|\/)(?:_worker\.js|_middleware\.js|_routes\.json)$|(^|\/)server\/|\.(?:mjs|cjs)$/;

export type PackageJson = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

export function staticOutputIssues(input: {
	config: string | null;
	packageJson: PackageJson | null;
	distFiles: readonly string[];
}): string[] {
	const issues: string[] = [];

	if (input.config === null) {
		issues.push('astro.config.mjs is missing — the output mode and the integration list live there');
	} else {
		if (!/output\s*:\s*['"]static['"]/.test(input.config)) {
			issues.push("astro.config.mjs does not set `output: 'static'` (SPEC §8.2)");
		}
		if (/\badapter\s*:/.test(input.config)) {
			issues.push('astro.config.mjs configures an adapter — a static site needs none (SPEC §8.2)');
		}
	}

	if (input.packageJson === null) {
		issues.push('package.json is unreadable');
	} else {
		const dependencies = {
			...input.packageJson.dependencies,
			...input.packageJson.devDependencies,
		};
		for (const name of Object.keys(dependencies)) {
			if (adapterPackagePattern.test(name)) {
				issues.push(`\`${name}\` is an adapter package — the build produces no server output (SPEC §8.2)`);
			}
		}
	}

	for (const file of input.distFiles) {
		if (serverArtifactPattern.test(file)) {
			issues.push(`dist/${file} is a server artifact — the deliverable is a portable static directory (SPEC §8.2)`);
		}
	}

	return issues;
}
