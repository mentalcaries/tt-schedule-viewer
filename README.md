# Instructor Team Schedule

A read-only SvelteKit schedule viewer for Calendly events, deployed on Vercel.

The landing page lists every configured program. Team schedules use bookmarkable routes such as
`/teams/aise`, `/teams/aise/last-week`, and `/teams/aise/next-week`.

## Developing

Install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

Configure the private environment variables shown in `.env.example` before loading schedule data.
`CALENDLY_TEAMS` defines the available programs and references a separate PAT environment variable
for each one. Only teams with a valid definition and a non-empty PAT are shown in the program
selector. `CALENDLY_ORGANIZATION_URI` and `DISPLAY_TIMEZONE` are shared by every team.

The legacy `CALENDLY_TOKEN` and `CALENDLY_GROUP_URI` variables remain supported as a single AISE
team when `CALENDLY_TEAMS` is not configured.

## Verification

```sh
pnpm check
pnpm build
```

Use `pnpm preview` to preview the production build locally.

## Deployment

Import the repository into Vercel and configure the Calendly and display-timezone environment variables. The project uses `@sveltejs/adapter-vercel`; no custom Vercel configuration is required.
