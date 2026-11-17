# GUARD — Generative Universal Assistant for Resourceful Development

[Try GUARD](https://guard.ai-pathfinder.eu)

GUARD helps higher education educators practise using AI for real teaching tasks. Each lab guides the educator through reflection, prompt composition, generation and critical evaluation. The goal is to build judgement about AI outputs while producing something useful for a course.

GUARD is an output of the Erasmus+ **Pathfinder** project, **Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources** (project reference [`2023-2-LI01-KA220-HED-000178579`](https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579)).

## What educators can do

Five labs are available:

| Lab | Teaching task |
| --- | --- |
| **Plan a Class Activity** | Design a learning activity for a topic, audience and objective |
| **Create a Learning Assessment** | Develop and review assessment items for alignment and rigour |
| **Design a Rubric** | Build specific criteria, performance levels and descriptors |
| **Revise an Existing Curriculum** | Review an uploaded curriculum or syllabus for alignment, sequencing and practical implementation |
| **Revise an Assignment for AI Use** | Adapt an existing assignment to support fair AI-use expectations and meaningful assessment |

In each lab, the left panel asks guiding questions and assembles an editable prompt. The right panel holds the model conversation. Educators work through **Reflect → Compose → Generate → Evaluate** across iterations, checking alignment, specificity and common failure modes before revising their work. Later iterations support side-by-side comparison; conversations can also be exported.

There are no user accounts. Lab work and history are kept in the browser, while generation sends the conversation and included context through the server to OpenRouter and the selected model provider. Hosting the app on campus does not keep model processing on campus.

## Run locally

Clone or download the **whole monorepo**, including shared packages. Use Node.js **22.22.0** from the root `.nvmrc` and pnpm **10.30.3**. Run all commands from the **workspace root**, two directories above `apps/guard`, where `pnpm-workspace.yaml` lives.

With nvm and Corepack available:

```bash
nvm install
nvm use
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm dev:guard
```

Open [http://localhost:3002](http://localhost:3002). You can explore the labs without a key, but generation requires model access.

## Configure model access

GUARD uses the OpenRouter API. Supply a key through either of these routes:

| Configuration | Who supplies it | Where it is kept |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | The host, for shared model access | Server environment; locally, `apps/guard/.env.local` |
| Key entered at `/settings` | The individual user, bringing their own key | Browser `sessionStorage`, then sent to the server for model calls |

A user-supplied key takes precedence over the server key. To configure shared access locally, create `apps/guard/.env.local` with:

```dotenv
OPENROUTER_API_KEY=replace-with-your-openrouter-key
```

Restart the development server after setting it. Keep the file out of version control; never put this key in a `NEXT_PUBLIC_` variable.

The Settings page lets users choose a curated model or enter a custom OpenRouter model ID. The default and curated choices live in `lib/constants.ts`; `DEFAULT_MODEL_OPTION` controls the built-in default. Model calls can incur provider charges, including when visitors use a host-supplied key.

The provider endpoint is defined in `app/api/chat/route.ts` and `netlify/functions/chat-worker.mts`. There is no environment setting for a local inference endpoint. Using an institutional model service requires adapting those integrations and reviewing model IDs and streaming compatibility.

## Data, history and uploads

| Data | Storage and lifetime |
| --- | --- |
| Active lab, chat messages, model choice and user-supplied key | Browser `sessionStorage`; survives reloads within the tab session |
| Saved lab history | Browser `localStorage`, up to 20 sessions |
| Uploaded documents | Sent to `/api/parse-file` for text extraction; extracted text becomes lab context and can be included in model requests and saved lab history |
| Model requests | Sent through the host server to OpenRouter and the chosen provider |
| Netlify chat jobs | Temporary server-side storage, described below |

Browser history is tied to the same browser, device and site origin. Clearing site data removes it; it is not an institutional backup or shared account history. Provider-side handling is separate from browser storage.

Uploads support PDF, DOCX, TXT and MD, with an application limit of **20 MB per file** and **five context documents**. Assignment and curriculum revision use uploaded source material. Reverse proxies and hosting platforms can impose smaller request limits; verify realistic files on the deployed instance. Extracted document text is part of the model context, so use material appropriate for the institution's chosen provider and deployment.

## Host on an institutional server

After installing dependencies at the workspace root, build and run GUARD as a Node.js service:

```bash
pnpm --filter @pathfinder/guard build
pnpm --filter @pathfinder/guard start --hostname 127.0.0.1 --port 3002
```

Supply `OPENROUTER_API_KEY` through the service environment if offering shared access, or let users enter their own keys in Settings. Keep `SITE_ID` unset on a non-Netlify host: its presence selects the Netlify background-job path. Neither Netlify Blobs nor `CHAT_JOB_SIGNING_SECRET` is required for the regular Node.js server.

Use a service manager and an HTTPS reverse proxy to your chosen hostname. Serve GUARD at `/`; URL subpaths are not configured. Keep workspace dependencies, app `.next/` and `public/` directories, and writable runtime caches available. This app needs server API routes and cannot run as a static file site.

Disable proxy response buffering for `/api/chat` so streamed output reaches the browser. The direct streaming path has a 55-second application deadline; proxy timeouts should allow it to finish. Set upload request limits to match the sizes you intend to support. See the [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

Set your GUARD and other product URLs in `packages/brand/products.ts` before building. This controls shared links, sitemap and robots URLs; `SITE_URL` is not used. The app has no built-in login or per-user spending quota. For an institution-only service with a shared key, provide access controls and usage limits at your gateway.

## Deploy on Netlify

Use the workspace root as the base directory, `apps/guard` as the package directory and this app's `netlify.toml`. It specifies:

- Build: `pnpm --filter @pathfinder/guard build`
- Publish directory: `apps/guard/.next`
- Functions directory: `apps/guard/netlify/functions`

Review the legacy-host redirect to `guard.ai-pathfinder.eu` when adapting the configuration. Supply `OPENROUTER_API_KEY` for shared access, or use individual keys. Also set **`CHAT_JOB_SIGNING_SECRET`**, shared by the Next.js functions and `chat-worker`, with Functions scope. Generate a random secret, for example with `openssl rand -hex 32`, configure it outside Git and redeploy.

Netlify supplies `SITE_ID`, which switches `/api/chat` to a background job. The browser receives an access token and polls `/api/chat/jobs/[id]` for progress. The worker allows up to five minutes for generation. Netlify Blobs stores prompt input while the job runs and removes it when the worker finishes. Generated text is accessible for one hour from job creation; the hourly `cleanup-chat-jobs` function deletes expired records and abandoned inputs on a subsequent run. Expiry is not an exact deletion deadline.

Verify that both functions are deployed and that a real chat, job polling, uploads and expiry cleanup work. A successful local stream does not verify the Netlify job path.

## Code and routes

The app uses Next.js 16's App Router, React 19, TypeScript, Tailwind CSS 4, Zustand browser stores, the OpenAI SDK configured for OpenRouter, and `pdf-parse`/`mammoth` for document text extraction.

| Path, relative to this app | Purpose |
| --- | --- |
| `content/` | Lab definitions, guiding questions, prompt templates and evaluation checklists |
| `content/labs.ts` | Lab registry and landing-page descriptions |
| `components/scaffolding/`, `components/chat/` | Guided workflow, uploads, conversation and comparison UI |
| `hooks/` | Lab orchestration and persistence |
| `stores/` | Chat, active session and history state |
| `lib/` | Types, model options, streaming, job handling and export helpers |
| `app/api/` | Chat submission, job polling and file parsing |
| `netlify/functions/` | Background worker and scheduled cleanup |

Public routes are `/` for lab selection, `/lab/[labId]` for a lab, `/settings` for keys and model choice, and `/history` for saved sessions. Server routes are `/api/chat`, `/api/chat/jobs/[id]` and `/api/parse-file`. Shared branding, product URLs and funding footer live in `packages/brand/` at the workspace root; build configuration lives in `packages/config/`.

## Contribute and verify

Useful contributions include better guiding questions, discipline-specific examples, clearer evaluation criteria, accessibility improvements and more reliable model or file handling. Keep lab content in `content/` and preserve existing lab IDs, routes and browser storage compatibility.

Run from the workspace root:

```bash
pnpm --filter @pathfinder/guard lint
pnpm --filter @pathfinder/guard typecheck
pnpm --filter @pathfinder/guard build
```

Manually complete a lab through generation and evaluation, reload to check persistence, resume history, change models and parse a sample document. For shared changes run `pnpm check` and then `pnpm test:smoke`; smoke tests use production builds and Playwright Chromium. The browser smoke suite mocks model output, so it does not prove live provider access.

Submit focused pull requests with the user-facing change, validation and screenshots where relevant. Use pnpm for dependency changes and update the root lockfile. See the [workspace README](../../README.md) for cross-app guidance. There is currently no project-wide licence file; clarify reuse and redistribution terms with the maintainers for an adapted instance.

## Funding

Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
