# ARTISAN

An interactive website for learning to think better with AI. See `ARTISAN-PRD.md` for the product scope.

There are no accounts, database or analytics. Every route is prerendered, and learner state lives in memory for the active visit only. Mission passwords are static lookups that open a mission at its start.

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit and content rules
pnpm test:e2e     # builds, then runs Playwright at desktop and 375px widths
pnpm lint
```

## Where things live

| Path | What it holds |
| --- | --- |
| `content/en/missions/` | Mission content, answer keys and review metadata |
| `content/journey.ts` | Stages and modules, with `available` or `planned` status |
| `content/passwords.ts` | Password registry. Append-only once learners hold codes |
| `lib/i18n/en.ts` | All interface wording |
| `components/activities/` | The reusable interaction patterns |
| `lib/evidence.ts` | What the learner did this visit, which the debrief reads. Each debrief skill in the content names the items that show it |
| `app/globals.css` | Design tokens and shared classes (`.mat`, `.sheet`, `.claim`, `.btn`, `.ruler`) |

## Adding a module

1. Write the mission in `content/en/missions/` and register it in `content/missions.ts`.
2. Add the password to `content/passwords.ts`. Never edit an existing code.
3. Set the module to `available` in `content/journey.ts`, and point the previous debrief's `nextMissionId` at it.
4. Record `reviewedOn` and `reviewedBy` in its `meta` once the content has been reviewed.

`content/missions.test.ts` enforces the PRD's mission structure, so run `pnpm test` to catch missing parts.

Next keeps recently visited pages alive but hidden, so radio `name`s and element `id`s must come from `useId`, not from content ids.
