# ARTISAN — AI Readiness Training for Insightful Systematic Adaptation and Navigation

[Play ARTISAN](https://artisan.ai-pathfinder.eu)

ARTISAN is an interactive story game for educators and students learning to think better with AI. Set over one year in the fictional town of Riverside, it asks learners to investigate evidence, test claims, make decisions and explain their reasoning. Decisions in the cases shape what the surrounding story remembers.

It is an output of the Erasmus+ **Pathfinder** project, **Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources** (project reference [`2023-2-LI01-KA220-HED-000178579`](https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579)).

The game uses authored scenarios, branching dialogue and simulations. It needs no live model, API key, account or database. Learners' answers and game saves stay in their browser unless they export a save themselves.

## The learning journey

The curriculum has four stages, with modules M01–M13, three bridge challenges and a four-part capstone:

| Stage | Focus |
| --- | --- |
| **1. Understand and choose** | How AI prediction works, when to delegate and how to write a useful brief |
| **2. Investigate and think** | Checking evidence, examining arguments, choosing help and interpreting numbers |
| **3. Create and act responsibly** | Verifying media, examining fairness, setting boundaries and recording creative contributions |
| **4. Design and participate** | Testing AI workflows and weighing effects on a community |
| **Capstone** | Scope, investigate, test and defend a proposal for a town's AI information service |

The bridge challenges B01, T01 and B03 ask learners to apply earlier skills to a new case without hints. M06 has two missions; C01 has four independently restartable chapters. Debriefs explain the learning and lead to the next mission, or the next unfinished case. See the [product requirements](ARTISAN-PRD.md) for the educational design.

## Progress, saves and return codes

The browser stores the game under **`artisan_progress` in `localStorage`**: completed cases, work within each case and story state. Reloading resumes the current step. Progress belongs to the browser, device and site origin; there is no server-side learner record or automatic cross-device sync. Clearing site data removes the local save. If browser storage is blocked or full, the game can still run but progress may not be remembered.

Settings provides two ways to move between browsers or devices:

- **Save file:** carries the complete saved game, including choices, written work and progress inside a case.
- **Return code:** carries completed cases and story decisions. It does **not** restore work inside a partially completed case.

On shared computers, learners can export their save and clear the local game in Settings. Hosting ARTISAN does not provide a teacher dashboard, central gradebook or learning-management-system integration.

## Run locally

Clone or download the **whole monorepo**, including shared packages. Use Node.js **22.22.0** from the root `.nvmrc` and pnpm **10.30.3**. Run all commands from the **workspace root**, two directories above `apps/artisan`, where `pnpm-workspace.yaml` lives.

With nvm and Corepack available:

```bash
nvm install
nvm use
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm dev:artisan
```

Open [http://localhost:3003](http://localhost:3003). No environment variables are required.

## How it works

ARTISAN uses Next.js 16's App Router, React 19, TypeScript and Tailwind CSS. Routes are prerendered; client-side components run the activities and manage game state. Mission content, interaction logic and story content are separate so an educational revision can be reviewed without changing the whole application.

| Path, relative to this app | Purpose |
| --- | --- |
| `content/en/missions/` | Mission content, answer keys and review metadata |
| `content/missions.ts`, `content/journey.ts` | Mission registry, stage order, module availability and bridge placement |
| `content/types.ts` | Types for missions and activity steps |
| `content/en/story/`, `content/story/` | Scenes, chapters, clues, remembered decisions in `flags.ts` and artwork registry in `art.ts` |
| `components/mission-runner.tsx`, `components/activities/` | Mission flow and reusable activities |
| `components/story/`, `lib/story/story.ts` | Scene player, “Trace it back” activity and story logic |
| `lib/` | Activity logic, journey navigation and evidence used by debriefs |
| `lib/session/` | Browser persistence, save format and return-code encoding |
| `components/saved-state.tsx` | Activity state that survives a reload through `useSaved` |
| `components/cases/`, `components/path/` | Case list, cards and progress indicators |
| `components/session-summary.tsx`, `components/settings.tsx` | Notebook, save transfer and reset controls |
| `lib/i18n/en.ts` | Interface wording |
| `assets/story/`, `assets/scenes/` | Story and activity images |
| `app/globals.css`, `app/game.css` | Design tokens and shared game styles |
| `e2e/` | Browser journey and accessibility checks |

Shared fonts, project branding, product URLs and the funding footer live in `packages/brand/` at the workspace root; shared Next.js settings live in `packages/config/`.

The main routes are `/` (title screen), `/map` (cases), `/missions/[missionId]` (a mission), `/summary` (notebook) and `/settings` (save and reset controls). Old `/start` and `/continue` links redirect permanently to the first mission and case map respectively.

## Contribute missions and activities

Useful contributions include clearer scenarios, stronger evidence, better feedback, accessible interactions and fixes to save handling.

To add a module:

1. Write missions in `apps/artisan/content/en/missions/` and register them in `content/missions.ts`.
2. Add or update the module in `content/journey.ts`, mark it `available` when ready, and set the preceding debrief's `nextMissionId`.
3. Add story scenes and artwork references where appropriate.
4. Record `reviewedOn` and `reviewedBy` in mission `meta` after content review.
5. Run the content and unit checks, then play the changed path through its debrief.

Step kinds are defined in `content/types.ts`, with interaction logic in `lib/` and components in `components/activities/`. Many also work as unaided `transfer` steps.

| Step kinds | Interaction |
| --- | --- |
| `sandbox`, `faultTrace`, `sort` | Toy prediction model, failure tracing and sorting |
| `claimAudit` | Claims, sources, repairs and calculations |
| `dialogue`, `argumentMap` | Branching conversation and argument mapping |
| `delegation` | Task allocation with consequences and replay |
| `compose` | Authored outputs, comparisons, revisions and contribution records |
| `gym` | Attempt, choose help and try again |
| `chartLab` | Linked charts and tables with adjustable measures, axes and ranges |
| `casefile` | Leads, timelines and uncertain or contradictory evidence |
| `thresholdLab` | Screening thresholds and outcomes across groups |
| `mark` | Text marking and redaction |
| `workflow` | Assemble, test, diagnose and repair a process |
| `allocation` | Budget decisions and stakeholder coverage |
| `match`, `rank` | Pairing and ordering activities |

`content/missions.test.ts` checks mission structure, task completion, worked solutions and whether activity data supports the intended lesson.

Preserve the `artisan_progress` storage key and saved-game compatibility. Return codes depend on the declared order of missions, story flags and their values; append new entries rather than reordering existing ones, and review the return-code tests when extending them. Use React's `useId` for form names and element IDs: Next.js can keep visited pages mounted but hidden, so content IDs can collide.

For artwork maintenance, run these from the workspace root:

```bash
pnpm --filter @pathfinder/artisan art:sync
pnpm --filter @pathfinder/artisan art:brief
```

`art:sync` updates the enabled image list from supplied assets. `art:brief` regenerates [ART-BRIEF.md](ART-BRIEF.md) from the artwork registry.

## Verify changes

Run from the workspace root:

```bash
pnpm --filter @pathfinder/artisan test
pnpm --filter @pathfinder/artisan lint
pnpm --filter @pathfinder/artisan typecheck
pnpm --filter @pathfinder/artisan build
pnpm exec playwright install chromium
pnpm --filter @pathfinder/artisan test:e2e
```

The browser suite starts a production build on port 3100 and runs at desktop and 375-pixel mobile widths. Use `E2E_PORT=3111 pnpm --filter @pathfinder/artisan test:e2e` if that port is occupied. For shared changes, run `pnpm check` and `pnpm test:smoke`; smoke tests require all apps' production builds.

Manually check fresh play, resume after reload, save-file export/import, return-code restore and reset when changing progression or persistence. Submit focused pull requests explaining the learner benefit and validation, with screenshots for visual changes.

## Host your own instance

After installing workspace dependencies, build and start ARTISAN as a Node.js service:

```bash
pnpm --filter @pathfinder/artisan build
pnpm --filter @pathfinder/artisan start --hostname 127.0.0.1 --port 3003
```

Keep the process running with a service manager and route an HTTPS hostname to port 3003 through a reverse proxy. Serve at `/` on its own hostname or subdomain; URL subpaths are not configured. Keep workspace dependencies, the app's `.next/` and `public/` directories, and writable runtime caches available. Routes are prerendered, but the repository is configured for a Next.js server rather than static export. See the [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

Set your ARTISAN and other product URLs in `packages/brand/products.ts` before building. The sitemap and robots file use this registry; `SITE_URL` is not used. No model service or server database is needed. If you later change the site's origin, learners must transfer their browser progress using a save file or return code.

For Netlify, use the workspace root as the base directory, `apps/artisan` as the package directory and this app's `netlify.toml`. Its build command is `pnpm --filter @pathfinder/artisan build` and its publish directory is `apps/artisan/.next`.

After deployment, play a mission, reload it, try both save-transfer methods, and check `/sitemap.xml`, `/robots.txt`, the legacy redirects and the funding footer.

## Reuse and attribution

See the [workspace README](../../README.md) for the wider project and cross-app guidance. There is currently no project-wide licence file; clarify reuse and redistribution terms with the maintainers for an adapted deployment. Preserve the original project attribution and EU funding declaration.

## Funding

Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
