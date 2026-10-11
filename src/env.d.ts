/// <reference types="astro/client" />

/** Vite's `?raw` import shape (the token layer is read as text by BaseLayout, SPEC §5.3). */
declare module '*?raw' {
	const content: string;
	export default content;
}
