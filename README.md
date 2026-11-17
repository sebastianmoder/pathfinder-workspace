# Pathfinder

Source code for the public outputs of **Pathfinder: Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources**, an Erasmus+ cooperation partnership in higher education (project reference [`2023-2-LI01-KA220-HED-000178579`](https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579)).

Pathfinder helps educators and students use AI thoughtfully in teaching, learning, employability and entrepreneurial innovation. This monorepo contains the project website and three learning applications: SAGE, GUARD and ARTISAN. Each application can be developed and deployed independently, with shared packages for branding and build configuration.

## Applications

| App | Purpose | Live site | Development and hosting guide |
| --- | --- | --- | --- |
| **Pathfinder** | Project background, consortium and links to the outputs | [Project website](https://ai-pathfinder.eu) | [README](apps/pathfinder/README.md) |
| **SAGE** — Strategies for AI-Guided Education | A searchable guide to responsible teaching with generative AI | [SAGE](https://sage.ai-pathfinder.eu) | [README](apps/sage/README.md) |
| **GUARD** — Generative Universal Assistant for Resourceful Development | Guided labs for planning activities, assessments, rubrics, curricula and assignments with AI | [GUARD](https://guard.ai-pathfinder.eu) | [README](apps/guard/README.md) |
| **ARTISAN** — AI Readiness Training for Insightful Systematic Adaptation and Navigation | A story-based learning journey that builds AI literacy through interactive cases | [ARTISAN](https://artisan.ai-pathfinder.eu) | [README](apps/artisan/README.md) |

The apps have no user accounts. SAGE is a reading and search resource. GUARD makes live model calls through OpenRouter and keeps lab history in the user's browser. ARTISAN uses authored scenarios and simulations without live model calls; progress is saved in the browser and can be transferred with a save file or return code.

## Repository structure

Each app is an independent Next.js 16 application using React 19. They share one pnpm workspace and lockfile, along with project branding and build configuration. You can run just the app you need, but must keep the whole workspace available when installing and building it.

```text
apps/
  pathfinder/   Project website
  sage/         Nextra documentation site, MDX content and Pagefind search
  guard/        Guided labs, server API routes and Netlify chat functions
  artisan/      Interactive story, missions and browser-based saves
packages/       Shared components, assets and infrastructure
docs/           Deployment history and validation notes
scripts/        Branding and deployment utilities
tests/          Browser smoke tests across the four apps
pathfinder-refined.svg   Source Pathfinder emblem
```

Shared navigation, footer, design tokens and product URLs live in `packages/brand/`. Shared Next.js configuration lives in `packages/config/`. Fonts are vendored with their licences, so builds do not need to download them from a font service. The four apps were imported with their original Git histories.

## Run locally

Clone or download the whole repository. All commands below run from the **workspace root**, the directory containing `pnpm-workspace.yaml`.

Use **Node.js 22.22.0**, as pinned in `.nvmrc`, and **pnpm 10.30.3**, as pinned in `package.json`. With nvm and Corepack available:

```bash
nvm install
nvm use
corepack enable pnpm
pnpm install --frozen-lockfile
```

Start the app you want to work on. To run several, use a separate terminal for each command:

```bash
pnpm dev:pathfinder   # http://localhost:3000
pnpm dev:sage         # http://localhost:3001
pnpm dev:guard        # http://localhost:3002
pnpm dev:artisan      # http://localhost:3003
```

Pathfinder, SAGE and ARTISAN require no API keys or database. SAGE's first development start may build the site to create its search index. GUARD's generation phase needs an OpenRouter key supplied by the host or entered by the user in Settings; see the [GUARD guide](apps/guard/README.md#configure-model-access).

Product links point to the public sites by default, including during local development. To link between your own instances, edit `packages/brand/products.ts` and rebuild the affected apps.

## Host on your own infrastructure

All four apps can run as Node.js services on an institutional server or virtual machine. Netlify is an alternative, not a requirement. The repository currently uses regular Next.js builds, rather than static exports: serve them with the production server, not by exposing `.next/` as a directory of files.

Install dependencies at the workspace root, then build and start each required app:

| App | Build | Start production server |
| --- | --- | --- |
| Pathfinder | `pnpm --filter @pathfinder/pathfinder build` | `pnpm --filter @pathfinder/pathfinder start --hostname 127.0.0.1 --port 3000` |
| SAGE | `pnpm --filter @pathfinder/sage build` | `pnpm --filter @pathfinder/sage start --hostname 127.0.0.1 --port 3001` |
| GUARD | `pnpm --filter @pathfinder/guard build` | `pnpm --filter @pathfinder/guard start --hostname 127.0.0.1 --port 3002` |
| ARTISAN | `pnpm --filter @pathfinder/artisan build` | `pnpm --filter @pathfinder/artisan start --hostname 127.0.0.1 --port 3003` |

Use a service manager to keep each process running, and an HTTPS reverse proxy to route a hostname to its local port. Give each app its own hostname or subdomain and serve it at `/`; deployment under a shared URL subpath is not configured. Keep the workspace dependencies, each app's `.next/` and `public/` directories, and writable runtime cache directories available to the service. SAGE's generated `public/_pagefind/` search index must be included.

Set your deployment URLs in `packages/brand/products.ts` **before building**. These values drive shared links, sitemaps, robots files and Pathfinder's product redirects; there is no `SITE_URL` override. Review each app's layout metadata for titles, descriptions and references to the original public URLs. Review each app's `netlify.toml` if deploying a fork on Netlify, since several include redirects to the original project domains. Each app README covers its own runtime requirements and verification steps. The [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting) explains production server operation in more detail.

Hosting GUARD on campus still sends model requests to OpenRouter and the selected provider. A fully local model service requires changes to its model integration. Its README also explains the Netlify-specific background jobs, upload limits and shared-key operation.

For Netlify, connect the whole repository with the repository root as the base directory and the relevant `apps/<app>` as the package directory. Use that app's `netlify.toml`; its build command and publish paths are relative to the workspace root. GUARD additionally needs its functions and job-signing secret configured as described in its README.

## Contribute

Contributions can improve teaching examples, correct explanations, refine lab scaffolding, extend missions, fix bugs or improve accessibility. Start with the app README to find the relevant content and components. For a larger change, open an issue describing the intended learning or user benefit before starting implementation.

- Keep changes focused. Separate educational content revisions from dependency upgrades or structural refactors.
- Change shared behaviour in `packages/` so the apps remain consistent. Product names, URLs and status are in `packages/brand/products.ts`.
- Preserve existing routes and browser storage formats, and retain the project attribution and EU funding declaration.
- Use pnpm for dependency changes and commit the root `pnpm-lock.yaml` with any manifest changes.
- After changing `pathfinder-refined.svg`, run `pnpm brand:generate`. This requires librsvg's `rsvg-convert` and ImageMagick's `magick`.
- In a pull request, explain what changes for users, name the affected apps, report validation and include screenshots for visual changes.

Run these checks from the workspace root:

```bash
pnpm check                         # Lint, type checks, unit tests and all production builds
pnpm exec playwright install chromium
pnpm test:smoke                    # Cross-app checks; requires production builds
pnpm test:e2e                      # ARTISAN missions and accessibility; builds ARTISAN
```

`pnpm check` and `pnpm test:smoke` are required for shared changes. On Linux, Playwright may also need system dependencies; CI installs Chromium with `pnpm exec playwright install --with-deps chromium`. Smoke tests start servers on ports 3200–3203. ARTISAN's end-to-end suite uses port 3100 by default. SAGE has no separate lint or unit-test script; its build and browser checks validate content integration. CI runs the workspace checks and both browser suites.

## Reuse and attribution

This repository currently has no project-wide licence file. Ask the project maintainers through the repository to clarify reuse and redistribution terms for an adapted deployment. Third-party font licences are included in `packages/brand/fonts/`. Keep the original project and funding attribution when adapting the outputs.

## Consortium

- [University of Liechtenstein](https://www.uni.li/en/), Liechtenstein
- [LAB University of Applied Sciences](https://lab.fi/en/), Finland
- [University of Dubrovnik](https://www.unidu.hr/eng/), Croatia
- [Formatio Private School](https://www.formatio.li/en/), Liechtenstein

Partner profiles are on the [project website](https://ai-pathfinder.eu/#consortium).

## Funding

Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
