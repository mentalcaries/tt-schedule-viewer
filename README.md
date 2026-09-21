# AISE Instructor Schedule

A read-only SvelteKit schedule viewer for Calendly events, deployed on Vercel.

## Developing

Install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

Configure the private environment variables shown in `.env.example` before loading schedule data.

## Verification

```sh
pnpm check
pnpm build
```

Use `pnpm preview` to preview the production build locally.

## Deployment

Import the repository into Vercel and configure the Calendly and display-timezone environment variables. The project uses `@sveltejs/adapter-vercel`; no custom Vercel configuration is required.
