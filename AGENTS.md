# Repository Guide

## Toolchain

- Use `pnpm`; the lockfile and `pnpm-workspace.yaml` are pnpm-specific, including build allowlists for `workerd` and `esbuild`.
- This is a single-package SvelteKit app targeting Cloudflare Workers through `@sveltejs/adapter-cloudflare`.
- Local `.svelte` files are forced into Svelte 5 runes mode by `vite.config.ts`; do not introduce legacy component syntax.

## Commands

- `pnpm dev`: run the Vite development server.
- `pnpm gen`: generate `worker-configuration.d.ts` from `wrangler.jsonc`. Run this on a fresh checkout and after changing Cloudflare bindings; `pnpm check` and `pnpm build` fail when the generated types are missing or stale.
- `pnpm check`: canonical static verification (`wrangler types --check`, SvelteKit sync, then `svelte-check`).
- `pnpm build`: validate Wrangler types, then produce the Cloudflare Worker under `.svelte-kit/cloudflare`.
- `pnpm preview`: serve the already-built Worker on port 4173; run `pnpm build` first.
- There are currently no test, lint, formatter, or deploy scripts.

## Project Wiring

- Routes and the app shell live in `src/routes`; `+layout.svelte` imports the sole global stylesheet, `src/routes/layout.css`.
- Tailwind CSS 4 is configured through the Vite plugin and CSS directives, not a `tailwind.config.*` file. Typography and daisyUI are loaded with `@plugin` directives in `layout.css`.
- `src/app.d.ts` extends `App.Platform` with Cloudflare `env`, execution context, caches, and request metadata. Its `Env` and Worker globals come from generated `worker-configuration.d.ts`.
- Do not edit generated `.svelte-kit/`, `.wrangler/`, or `worker-configuration.d.ts` content by hand.
