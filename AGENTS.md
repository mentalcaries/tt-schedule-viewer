# Repository Guide

## Toolchain

- Use `pnpm`; the lockfile and `pnpm-workspace.yaml` are pnpm-specific, including the build allowlist for `esbuild`.
- This is a single-package SvelteKit app targeting Vercel through `@sveltejs/adapter-vercel`.
- Local `.svelte` files are forced into Svelte 5 runes mode by `vite.config.ts`; do not introduce legacy component syntax.

## Commands

- `pnpm dev`: run the Vite development server.
- `pnpm check`: canonical static verification (SvelteKit sync, then `svelte-check`).
- `pnpm build`: produce the Vercel deployment output under `.vercel/output`.
- `pnpm preview`: preview the production build locally; run `pnpm build` first.
- There are currently no test, lint, formatter, or deploy scripts.

## Project Wiring

- Routes and the app shell live in `src/routes`; `+layout.svelte` imports the sole global stylesheet, `src/routes/layout.css`.
- Tailwind CSS 4 is configured through the Vite plugin and CSS directives, not a `tailwind.config.*` file. Typography and daisyUI are loaded with `@plugin` directives in `layout.css`.
- Private server environment variables are read through SvelteKit's `$env/dynamic/private` module and must be configured in Vercel.
- Do not edit generated `.svelte-kit/` or `.vercel/` content by hand.
