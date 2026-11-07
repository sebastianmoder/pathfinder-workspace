# ARTISAN

An interactive website for learning to think better with AI. See `ARTISAN-PRD.md` for the product scope.

There are no accounts or database. Every route is prerendered, and answers live in memory for the active visit only. The browser keeps one small record, `artisan_progress` in `localStorage`, of finished missions, the furthest step reached in unfinished ones, and familiar activities (`lib/session/stored-progress.ts`). It never holds answers or text. `/start` and `/continue` are retired and redirect (see `next.config.ts`).

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:3000 (pnpm dev:artisan from the workspace root uses port 3003)
pnpm test         # unit and content rules
pnpm test:e2e     # builds, then runs Playwright at desktop and 375px widths
pnpm lint
```

## Where things live

| Path | What it holds |
| --- | --- |
| `content/en/missions/` | Mission content, answer keys and review metadata |
| `content/journey.ts` | Stages and modules, with `available` or `planned` status; `bridge: true` puts a module on the seam between stages |
| `components/path/` | The mission map: a route across a sheet per stage, the mission card, and the eyelet glyphs. `lib/journey-nav.ts` holds its logic |
| `lib/i18n/en.ts` | All interface wording |
| `components/activities/` | The reusable interaction patterns (see below) |
| `lib/evidence.ts` | What the learner did this visit, which the debrief reads. Each debrief skill in the content names the items that show it |
| `app/globals.css` | Design tokens and shared classes (`.mat`, `.sheet`, `.claim`, `.btn`, `.ruler`) |

## Curriculum

All of the PRD's journey is available: stages 1–4 (M01–M13), a bridge challenge at the end of stages 1–3 (B01, T01, B03), and the C01 capstone in four chapters. The guided order follows the curriculum, and each debrief's `nextMissionId` points at the next mission. A module can hold several missions (M06, C01); the map card lists them as parts. A debrief points to its `nextMissionId`, or to the first unfinished mission on the path if that one is done.

## Interaction patterns

Each pattern is a step kind in `content/types.ts`, with its pure logic in `lib/` (unit-tested) and its component in `components/activities/`. Most can also be used as an unaided `transfer` step.

| Step kind | Pattern | Used in |
| --- | --- | --- |
| `sandbox`, `faultTrace`, `sort` | Toy model, trace a failure, select-and-place sorting | M01, and sorting throughout |
| `claimAudit` | Claim highlighter, source drawer, repairs, calculations | M04, M07, T01, C01 |
| `dialogue`, `argumentMap` | Scripted branching conversation, argument map | M05, M06 (teach-back) |
| `delegation` | Task inbox with later consequences and “what if” replay | M02, B01, C01 |
| `compose` | Workspace with authored outputs, comparison, checklist, version tree, contribution record | M03, M11, B01 |
| `gym` | Attempt, choose a kind of help, try again | M06 |
| `chartLab` | Linked chart and table with adjustable measure, axis and range | M07, C01 |
| `casefile` | Leads under time pressure, timeline, known/uncertain/contradicted | M08, M13, B03 |
| `thresholdLab` | Screening threshold, outcomes by group, score versions | M09 |
| `mark` | Mark text; `mode: "redact"` shows what each party receives | M10, B03, C01 |
| `workflow` | Assemble steps, run tests, diagnose, fix | M12, C01 |
| `allocation` | Spend a budget on conditions; stakeholder coverage map | M13, C01 |
| `match` | Pin cards to partners one to one, with threads between pairs | M08, M11 |
| `rank` | Order cards between two ends; only the ends are judged | M07, B01 |

Initial judgments that are in-scenario first moves are shown as a hand of move cards (`ChoiceQuestion` `variant="move"`); a position that the revision re-asks as it was keeps the plain list.

`content/missions.test.ts` checks each pattern's content: that every task can be completed, that worked solutions work, and that the data tells the story the mission tells (for example, that no threshold on M09's original score closes the gap).

## Adding a module

1. Write the mission in `content/en/missions/` and register it in `content/missions.ts`.
2. Set the module to `available` in `content/journey.ts`, and point the previous debrief's `nextMissionId` at it.
3. Record `reviewedOn` and `reviewedBy` in its `meta` once the content has been reviewed.

`content/missions.test.ts` enforces the PRD's mission structure, so run `pnpm test` to catch missing parts.

Next keeps recently visited pages alive but hidden, so radio `name`s and element `id`s must come from `useId`, not from content ids.
