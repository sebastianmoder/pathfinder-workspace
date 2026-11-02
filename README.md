# GUARD

Generative Universal Assistant for Resourceful Development

GUARD is a scaffolded AI learning environment for educators. Instead of treating the chat model as the product, it treats the educator's thinking process as the product: each lab guides the user through reflection, prompt composition, generation, and critical evaluation inside a split-panel workspace.

## What This App Does

GUARD helps educators practice using AI critically through structured labs:

- `Plan a Class Activity`
- `Create a Learning Assessment`
- `Design a Rubric`
- `Revise an Assignment for AI Use`

Each lab is broken into guided iterations. Users answer Socratic scaffolding questions, watch those answers assemble into a prompt template, send the prompt to a live model, and then evaluate the output for alignment, rigor, and common AI failure modes.

## Core Features

- Split-panel lab interface with scaffolding on the left and live chat on the right
- Four-phase workflow per iteration: `Reflect -> Compose -> Generate -> Evaluate`
- Four built-in educator labs with domain-specific prompts and evaluation checklists
- Prompt assembly that turns reflection answers into an editable prompt template
- Streaming chat responses via OpenRouter-compatible models
- Optional BYOK flow on the Settings page for model choice
- Additional context upload support for `pdf`, `docx`, `txt`, and `md` files
- Session persistence in browser storage so users can resume work locally
- Session history with autosave and side-by-side comparison during later iterations

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand for client state and persistence
- OpenAI SDK pointed at the OpenRouter API
- `pdf-parse` and `mammoth` for file ingestion

## Local Development

Requires Node.js 22.13 or newer and [Corepack](https://github.com/nodejs/corepack#installation). This repository uses pnpm, with the exact version pinned in `package.json`.

Enable pnpm through Corepack:

```bash
corepack enable pnpm
```

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Chat requests require an OpenRouter API key from one of these sources:

1. `OPENROUTER_API_KEY` in your local environment
2. A BYOK key entered in the app's Settings page

Example `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

Without either of those, `/api/chat` will return an error.

On Netlify, also set `CHAT_JOB_SIGNING_SECRET` to a random 32-byte secret in the site environment variables with Functions scope (for example, generate one with `openssl rand -hex 32`). The variable must be available to both the Next.js functions and `chat-worker`. Redeploy after setting it. The Netlify chat path starts a background job and polls its progress; `pnpm run dev` keeps the direct stream for local development.

Netlify Blobs holds generated text for up to one hour of access. Prompt input is stored only while a job runs and is removed when it finishes. The hourly `cleanup-chat-jobs` function removes expired or abandoned data on a subsequent run. Chat job events in Netlify function logs include request and job IDs for troubleshooting.

## Using the App

1. Start from the landing page and choose one of the four labs.
2. Answer the reflection questions in the left panel.
3. Review or edit the assembled prompt in the compose phase.
4. Send the prompt to the model and inspect the streamed response.
5. Work through the evaluation checklist and reflection prompts.
6. Continue into the next iteration or complete the lab.

The Settings page lets users store a BYOK OpenRouter key in `sessionStorage` and choose from curated model options or a custom OpenRouter model ID.

## Storage Model

GUARD is intentionally browser-local for user state:

- Chat messages, active lab session, selected model, and BYOK key are stored in `sessionStorage`
- Session history is stored in `localStorage`
- History keeps up to 20 sessions

This means saved work is tied to the same browser and device. Clearing browser data removes it.

## File Uploads

The scaffolding panel supports optional context uploads to enrich prompts.

- Supported types: `pdf`, `docx`, `txt`, `md`
- Maximum file size: `20 MB` per file
- Maximum documents: `5`
- Uploaded files are parsed through `/api/parse-file` and normalized into plain text

## Key Routes

- `/` - landing page and lab selection
- `/lab/[labId]` - guided lab workspace
- `/settings` - BYOK and model selection
- `/history` - resume or review saved sessions
- `/api/chat` - streaming chat proxy to OpenRouter
- `/api/parse-file` - text extraction for uploaded files

## Project Structure

```text
app/
  api/
  history/
  lab/[labId]/
  settings/
components/
  chat/
  landing/
  layout/
  scaffolding/
content/
  activity-planning.ts
  assessment-creation.ts
  assignment-ai-resilience.ts
  rubric-design.ts
hooks/
stores/
lib/
```

## Scripts

```bash
pnpm run dev
pnpm run build
pnpm run start
pnpm run lint
```

## Dependency Management

Use pnpm for all dependency changes. Commit `pnpm-lock.yaml` alongside `package.json`; it is the repository's only dependency lockfile. Installation checks reject other package managers, and `.npmrc` requires the pinned pnpm version.

```bash
pnpm add <package>
pnpm add -D <package>
pnpm remove <package>
pnpm update
pnpm audit
pnpm audit --prod
```

Use `pnpm install --frozen-lockfile` for reproducible installs in CI. Netlify detects pnpm from `pnpm-lock.yaml`, selects the pinned version from `package.json`, and runs `pnpm run build` as configured in `netlify.toml`.

## Notes

- Dependency review (2026-11-02): ESLint stays on 9 because the current React and import lint plugins do not declare ESLint 10 support. TypeScript stays on 6 because `typescript-eslint` requires TypeScript below 6.1. Node types stay on 22 to match the minimum supported runtime.
- The development lint toolchain still reports [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) through `minimatch` 3 and 10. The fix requires `minimatch` 11.0.1 or newer, outside the upstream dependency ranges; revisit this when the lint packages add compatible releases. Avoid forcing a global major-version override because the older consumers expect a different API.
- The default model is defined by `DEFAULT_MODEL_OPTION` in `lib/constants.ts`. Update that single object to change the built-in default model, its labels, and its position at the top of the BYOK selector.
- On hosted deployments, a shared OpenRouter key can be supplied through environment configuration.
- `netlify.toml` currently contains a redirect from the old Netlify domain to `guard.ai-pathfinder.eu`.
