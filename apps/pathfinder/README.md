# Pathfinder project website

[Visit Pathfinder](https://ai-pathfinder.eu)

Pathfinder is the public website for **Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources**, an Erasmus+ cooperation partnership (project reference [`2023-2-LI01-KA220-HED-000178579`](https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579)).

The website introduces the project, presents the consortium from Liechtenstein, Finland and Croatia, and helps educators and students find the three learning outputs:

| Output | What visitors can do | Public site |
| --- | --- | --- |
| **SAGE** — Strategies for AI-Guided Education | Read practical guidance on teaching with generative AI | [SAGE](https://sage.ai-pathfinder.eu) |
| **GUARD** — Generative Universal Assistant for Resourceful Development | Work through guided AI labs for teaching tasks | [GUARD](https://guard.ai-pathfinder.eu) |
| **ARTISAN** — AI Readiness Training for Insightful Systematic Adaptation and Navigation | Build AI literacy through interactive story cases | [ARTISAN](https://artisan.ai-pathfinder.eu) |

The website runs as a standalone application. SAGE, GUARD and ARTISAN are separate applications in the same workspace, with their own development servers and deployments. There is no account system, database or model API requirement for this app.

## Run locally

Clone or download the **whole monorepo**, including its shared packages. Use Node.js **22.22.0** from the root `.nvmrc` and pnpm **10.30.3**. Run all commands from the **workspace root**, two directories above `apps/pathfinder`, where `pnpm-workspace.yaml` lives.

With nvm and Corepack available:

```bash
nvm install
nvm use
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm dev:pathfinder
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are required to view or build the website. Links to the other outputs use the public domains until you change `packages/brand/products.ts`.

## How it works

The app uses Next.js 16's App Router, React 19, TypeScript and Tailwind CSS. Material UI supports the form components. The homepage presents the project mission, output cards and consortium profiles. Navigation and the funding footer use shared Pathfinder components.

| Path, relative to this app | Purpose |
| --- | --- |
| `app/page.tsx` | Homepage text, project mission and output cards |
| `app/layout.tsx` | Root layout and page metadata |
| `components/Consortium.tsx` | Partner profiles and links |
| `components/Navigation.tsx`, `components/Footer.tsx` | Wiring for the shared project header and footer |
| `components/forms/` | Form controls |
| `public/` | Static images and generated brand assets |
| `app/sitemap.ts`, `app/robots.ts` | Search-engine discovery routes |
| `next.config.js` | Shared build configuration and legacy redirects |
| `netlify.toml` | Netlify build settings and original-domain redirect |

Shared components, fonts, design tokens and product URLs live in `packages/brand/` at the workspace root; shared Next.js settings live in `packages/config/`.

The website has one public content page, `/`, with consortium profiles at `/#consortium`. Old links remain supported:

- `/about` redirects permanently to `/#consortium`.
- `/sage`, `/guard` and `/artisan` redirect permanently to the respective product URLs in `packages/brand/products.ts`.

## Host your own instance

This app can run on a university server or virtual machine with Node.js; it does not require Netlify. After the root installation above:

```bash
pnpm --filter @pathfinder/pathfinder build
pnpm --filter @pathfinder/pathfinder start --hostname 127.0.0.1 --port 3000
```

Keep the production process running with a service manager and route an HTTPS hostname to port 3000 through your reverse proxy. Serve the app at the root of its hostname; URL subpaths are not configured. Keep the workspace dependencies, app `public/` and `.next/` directories available, with writable runtime caches. `.next/` is build output for the server, not a static website to upload to a file server. See the [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

Before building an institutional instance:

1. Set your project and output URLs in `packages/brand/products.ts`. You can host only this app and continue linking to the public learning outputs.
2. Review `app/layout.tsx`, homepage text and consortium profiles for the context of your instance, retaining the original project and funding attribution. The Open Graph URL in the layout is hardcoded and needs a separate update.
3. Rebuild after changing URLs. `/sitemap.xml`, `/robots.txt` and product redirects use the shared registry; `SITE_URL` is not used.

The sitemap lists only the homepage. After deployment, check the homepage, partner and product links, all four legacy redirects, `/sitemap.xml` and `/robots.txt`.

For Netlify, use the workspace root as the base directory, `apps/pathfinder` as the package directory and this app's `netlify.toml`. Its build command is `pnpm --filter @pathfinder/pathfinder build` and its publish directory is `apps/pathfinder/.next`. Review the redirect from the original Netlify hostname to `ai-pathfinder.eu` when adapting the configuration.

## Contribute

Useful contributions include clearer project explanations, updated partner information, accessibility fixes and improvements to how visitors discover the outputs. Edit homepage content in `app/page.tsx`, partner profiles in `components/Consortium.tsx`, and shared navigation or branding in `packages/brand/`. Place static images under `public/` and reference them with root-relative URLs.

Run app checks from the workspace root:

```bash
pnpm --filter @pathfinder/pathfinder lint
pnpm --filter @pathfinder/pathfinder typecheck
pnpm --filter @pathfinder/pathfinder build
```

For UI changes, check the homepage at desktop and mobile widths and use a keyboard to follow navigation and product links. If you add a page, update navigation and `app/sitemap.ts` as appropriate. Preserve the existing redirects. Shared changes require `pnpm check` followed by `pnpm test:smoke`; the latter uses production builds and Playwright Chromium.

Submit focused pull requests explaining the user-facing change and validation, with screenshots for visible changes. See the [workspace README](../../README.md) for cross-app development and reuse terms. There is currently no project-wide licence file; clarify reuse terms with the maintainers before redistributing an adapted instance.

## Funding

Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
