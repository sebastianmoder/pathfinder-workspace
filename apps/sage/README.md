# SAGE — Strategies for AI-Guided Education

[Read SAGE](https://sage.ai-pathfinder.eu)

SAGE is a practical guide for higher education educators who want to use generative AI thoughtfully. It explains when AI is useful, where its limitations matter, how to write and evaluate prompts, and how to adapt teaching and assessment while keeping human judgement central.

It is one of the outputs of the Erasmus+ **Pathfinder** project, **Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources** (project reference [`2023-2-LI01-KA220-HED-000178579`](https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579)).

SAGE serves MDX content through Nextra, with a Pagefind index for browser-based search. It is a standalone application in the Pathfinder workspace and uses shared packages for branding and build configuration. Reading and searching require no account, database or model API key.

## Content

- **Introduction:** the SAGE framework and how to use it.
- **Basics of Generative AI:** concepts, limitations, AI detection, ethics and deciding whether AI fits a task.
- **Basics of Prompt Engineering:** practical techniques for communicating with and evaluating AI.
- **Teachers' Tasks:** course rules, curriculum and lesson design, materials, assessments, rubrics, source-based assistants and a teacher workshop pack.
- **Teaching and Learning with AI:** a competency pathway and activities for assessment, tutoring, simulations, writing, data analysis, programming and entrepreneurial learning.

Unfinished material stays in `drafts/` and is not part of the published site. Content evolves with educational practice and AI tools; contributions should help readers make informed choices and review AI outputs critically.

## Run locally

Clone or download the **whole monorepo**, including shared packages and workspace patches. Use Node.js **22.22.0** from the root `.nvmrc` and pnpm **10.30.3**. Run all commands from the **workspace root**, two directories above `apps/sage`, where `pnpm-workspace.yaml` lives.

With nvm and Corepack available:

```bash
nvm install
nvm use
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm dev:sage
```

Open [http://localhost:3001](http://localhost:3001). No environment variables are required. The development script ensures a Pagefind search index exists; a first start can trigger a production build. Search reflects the last indexed build, so rebuild after content changes when checking search results.

## How it works

SAGE uses Next.js 16's App Router, React 19, Nextra 4 and `nextra-theme-docs`. MDX files combine Markdown with React components. Nextra turns the published content tree into routes and sidebars; `_meta.js` files control navigation order and labels. Pagefind builds a search index from the generated HTML, then searches that index in the browser.

| Path, relative to this app | Purpose |
| --- | --- |
| `content/` | Published MDX pages and `_meta.js` navigation metadata |
| `drafts/` | Unpublished working material and its publication checklist |
| `app/layout.jsx` | Theme, navbar, sidebar and footer wiring |
| `app/[[...mdxPath]]/` | Nextra catch-all route |
| `app/sitemap.js`, `app/robots.js` | Published routes and crawler discovery |
| `mdx-components.js` | Components available to MDX pages |
| `components/`, `styles/` | App-specific components and styles |
| `public/` | Static assets and generated `_pagefind/` search index |
| `patches/` | Documented Nextra theme compatibility patch |
| `next.config.mjs`, `netlify.toml` | Framework and Netlify build configuration |

Shared branding, fonts, project navigation, funding footer and product URLs live in `packages/brand/` at the workspace root. Shared Next.js settings live in `packages/config/`. Keep theme configuration in `app/layout.jsx`; this app does not use the older Nextra `pages/` or `theme.config.jsx` structure.

## Contribute content

Content contributions include corrections, worked teaching examples, classroom experience and clearer explanations. Pages and navigation are maintained in MDX and `_meta.js` files independently of application components.

1. Edit or create an `.mdx` page in the relevant section of `apps/sage/content/`.
2. Update the section's `_meta.js` and overview page when adding a topic or changing navigation.
3. Check factual and product-specific claims against current primary sources. Give examples enough context for another educator to use them.
4. Keep incomplete pages in `apps/sage/drafts/`. Hiding a sidebar entry inside `content/` does **not** prevent its route, search indexing or sitemap inclusion.
5. Build and inspect the changed pages, links, sidebar and search results at desktop and mobile widths.

From the workspace root:

```bash
pnpm --filter @pathfinder/sage build
pnpm --filter @pathfinder/sage start --port 3001
```

The build prerenders the published routes, `/sitemap.xml` and `/robots.txt`. Its `postbuild` step generates `public/_pagefind/`. To regenerate only search after a successful build:

```bash
pnpm --filter @pathfinder/sage run build:search-index
```

SAGE has no separate lint or unit-test script; the production build is its main content integration check. Shared changes require `pnpm check` followed by `pnpm test:smoke` from the workspace root; smoke tests require all production builds and Playwright Chromium. The [draft checklist](drafts/README.md) and [theme patch notes](patches/README.md) explain their respective maintenance requirements.

Keep content revisions separate from structural or dependency changes. Submit a focused pull request describing the reader benefit and validation, with screenshots for layout changes.

## Host your own instance

SAGE can run on an institutional Node.js server without Netlify. After installing the workspace dependencies:

```bash
pnpm --filter @pathfinder/sage build
pnpm --filter @pathfinder/sage start --hostname 127.0.0.1 --port 3001
```

Use a service manager to keep the process running and an HTTPS reverse proxy to route your chosen hostname to port 3001. Serve SAGE at `/` on its own hostname or subdomain; hosting under a URL subpath is not configured. Keep workspace dependencies, the app's `.next/` and `public/` directories, and writable runtime caches available. Include `public/_pagefind/` generated by the build or search will fail. Although pages are prerendered, the current configuration uses a Next.js server, not a static export. See the [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

Before building your instance, update the SAGE URL and any other hosted product URLs in `packages/brand/products.ts`. The sitemap and robots file use that registry even in previews; `SITE_URL` is not used. Review the titles, description and repository reference in `app/layout.jsx`. That layout also loads an external Font Awesome icon script; review this dependency if your installation must operate on a restricted network. Fonts are bundled in the workspace.

For Netlify, use the workspace root as the base directory, `apps/sage` as the package directory and this app's `netlify.toml`. The build command is `pnpm --filter @pathfinder/sage build` and the publish directory is `apps/sage/.next`. Review the legacy-host redirect to `sage.ai-pathfinder.eu` for your deployment. Keep the workspace theme patch applied during installation.

After deployment, open several published pages, use search, follow sidebar and product links, and check `/sitemap.xml`, `/robots.txt` and the EU funding footer. Draft pages should remain unavailable.

## Reuse and attribution

See the [workspace README](../../README.md) for the wider project and contribution checks. There is currently no project-wide licence file; clarify reuse and redistribution terms with the maintainers for an adapted deployment. Preserve the original project attribution and EU funding declaration.

## Funding

Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
