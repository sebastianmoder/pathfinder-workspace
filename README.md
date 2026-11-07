# Pathfinder

Source code for the public outputs of **Pathfinder: Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources**, an Erasmus+ cooperation partnership in higher education (project reference [`2023-2-LI01-KA220-HED-000178579`](https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579)).

Pathfinder helps educators and students in higher education use AI in practical, responsible ways. It focuses on teaching, learning, employability and entrepreneurial innovation, with critical thinking and digital readiness at the centre. All outputs are free to use, need no account, and are open source in this repository.

## The outputs

| Output | Full name | For | Live site |
| --- | --- | --- | --- |
| **Pathfinder** | Project website | Everyone | <https://ai-pathfinder.eu> |
| **SAGE** | Strategies for AI-Guided Education | Educators | <https://sage.ai-pathfinder.eu> |
| **GUARD** | Generative Universal Assistant for Resourceful Development | Educators | <https://guard.ai-pathfinder.eu> |
| **ARTISAN** | AI Readiness Training for Insightful Systematic Adaptation and Navigation | Educators and students | <https://artisan.ai-pathfinder.eu> |

- **Pathfinder** introduces the project and consortium, and links to each output.
- **SAGE** is a searchable guide to teaching with generative AI. It covers when AI helps and when it doesn't, how to prompt well, how to adapt assignments, and how to support students in critical, ethical use.
- **GUARD** offers guided AI labs for educators: planning a class activity, creating an assessment, designing a rubric, and revising an assignment for AI use. Each lab walks through reflection, prompt composition, generation with a live model, and critical evaluation of the output.
- **ARTISAN** is an interactive learning journey for thinking better with AI. Learners work through missions across four stages, three bridge challenges and a capstone. Progress lives only in the browser tab for the current visit.

## Consortium

- [University of Liechtenstein](https://www.uni.li/en/), Liechtenstein
- [LAB University of Applied Sciences](https://lab.fi/en/), Finland
- [University of Dubrovnik](https://www.unidu.hr/eng/), Croatia
- [Formatio Private School](https://www.formatio.li/en/), Liechtenstein

Partner profiles are on the [project website](https://ai-pathfinder.eu/#consortium).

## How the repository is organised

Each output is its own Next.js application with its own deployment and subdomain. They live together in one pnpm workspace so they share a single Pathfinder identity: logo, typography, colours, the project navigation and the EU funding footer.

```text
apps/
  pathfinder/   Project website
  sage/         SAGE guide (Nextra, with Pagefind search)
  guard/        GUARD labs (with serverless functions for model calls)
  artisan/      ARTISAN learning journey
packages/
  brand/        Shared components, design tokens, fonts and the product list
  config/       Shared Next.js build configuration
docs/           Deployment and validation notes
tests/          Browser smoke tests across all apps
pathfinder-refined.svg   The canonical Pathfinder emblem
```

Each app has its own README with details on its content, structure and configuration:
[Pathfinder](apps/pathfinder/README.md) · [SAGE](apps/sage/README.md) · [GUARD](apps/guard/README.md) · [ARTISAN](apps/artisan/README.md)

The four apps were developed separately and imported here with their full Git histories.

## Running locally

You need Node from `.nvmrc` (22.22) and pnpm 10.30.3 (`corepack enable` sets this up).

```bash
pnpm install --frozen-lockfile
pnpm dev:pathfinder   # http://localhost:3000
pnpm dev:sage         # http://localhost:3001
pnpm dev:guard        # http://localhost:3002
pnpm dev:artisan      # http://localhost:3003
```

GUARD's labs need an OpenRouter API key, either `OPENROUTER_API_KEY` locally or one entered on its Settings page. See its README.

Checks:

```bash
pnpm check        # lint, typecheck, unit tests and production builds for all apps
pnpm test:e2e     # ARTISAN mission and accessibility suite
pnpm test:smoke   # shared-shell browser checks, run after pnpm build
```

## Contributing and maintenance

- Change shared behaviour (navigation, footer, tokens, product URLs) in `packages/`, not by copying it into an app. Product names, URLs and status are in `packages/brand/products.ts`.
- After changing `pathfinder-refined.svg`, run `pnpm brand:generate` to regenerate logos, favicons and touch icons for every app. It requires `rsvg-convert` (librsvg) and ImageMagick's `magick`.
- Fonts are vendored with their licences, so builds don't contact external font services.
- Dependabot opens dependency updates weekly. Keep them separate from content changes, and review framework updates together.
- Pull requests should describe the behaviour change, the affected products and how it was validated, with screenshots for visual changes. CI builds every app when shared code changes.
- Read [docs/cutover.md](docs/cutover.md) before changing live hosting.

## Funding

Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
