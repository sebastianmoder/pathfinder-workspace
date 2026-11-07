# ARTISAN

An interactive website for learning to think better with AI. See `ARTISAN-PRD.md` for the product scope.

There are no accounts or database. Every route is prerendered, and learner state lives in memory for the active visit only. Mission passwords are static lookups that open a mission at its start.

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
| `content/journey.ts` | Stages and modules, with `available` or `planned` status |
| `content/passwords.ts` | Password registry. Append-only once learners hold codes |
| `lib/i18n/en.ts` | All interface wording |
| `components/activities/` | The reusable interaction patterns (see below) |
| `lib/evidence.ts` | What the learner did this visit, which the debrief reads. Each debrief skill in the content names the items that show it |
| `app/globals.css` | Design tokens and shared classes (`.mat`, `.sheet`, `.claim`, `.btn`, `.ruler`) |

## Curriculum

All of the PRD's journey is available: stages 1–4 (M01–M13), a bridge challenge at the end of stages 1–3 (B01, T01, B03), and the C01 capstone in four chapters. The guided order follows the curriculum, and each debrief's `nextMissionId` points at the next mission. A module can hold several missions (M06, C01); the map lists them as parts.

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

`content/missions.test.ts` checks each pattern's content: that every task can be completed, that worked solutions work, and that the data tells the story the mission tells (for example, that no threshold on M09's original score closes the gap).

## Adding a module

1. Write the mission in `content/en/missions/` and register it in `content/missions.ts`.
2. Add the password to `content/passwords.ts`. Never edit an existing code.
3. Set the module to `available` in `content/journey.ts`, and point the previous debrief's `nextMissionId` at it.
4. Record `reviewedOn` and `reviewedBy` in its `meta` once the content has been reviewed.

`content/missions.test.ts` enforces the PRD's mission structure, so run `pnpm test` to catch missing parts.

Next keeps recently visited pages alive but hidden, so radio `name`s and element `id`s must come from `useId`, not from content ids.
