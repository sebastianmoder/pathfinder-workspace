# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js App Router pages and route segments (`about/`, `guard/`, `artisan/`, `sage/`), plus global layout and styles.
- `components/` holds reusable UI pieces, with focused subfolders like `components/forms/` and `components/svg/`.
- `public/` stores static assets and generated SEO files (`public/sitemap.xml`, `public/robots.txt`, image assets).
- Root-level config files (`next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`) define runtime and code quality behavior.

## Build, Test, and Development Commands
- `npm run dev`: start the local development server on `http://localhost:3000`.
- `npm run lint`: run ESLint with Next.js core web vitals rules.
- `npm run build`: create a production build.
- `npm run start`: run the production server after a successful build.
- `npm run build` also triggers `postbuild` (`next-sitemap`) to regenerate sitemap output.

## Coding Style & Naming Conventions
- Use TypeScript with `strict` mode enabled; keep types explicit and avoid `any` unless necessary.
- Follow Prettier settings: 2-space indentation, semicolons, double quotes, trailing commas (`es5`), max line width `90`.
- Keep component filenames in PascalCase (for example, `Navigation.tsx`) and route folders in lowercase (for example, `app/about`).
- Prefer absolute imports via the `@/*` alias defined in `tsconfig.json`.

## Testing Guidelines
- No automated test runner is configured yet (`package.json` has no `test` script).
- Required verification before PR: run `npm run lint` and `npm run build`.
- For UI changes, manually validate main routes (`/`, `/about`, `/guard`, `/artisan`, `/sage`).
- If adding tests, colocate them near source files with `*.test.ts(x)` or `*.spec.ts(x)` naming.

## Commit & Pull Request Guidelines
- Match current history style: short, imperative commit subjects (for example, `fixed nav`, `updated deps`).
- Keep commits focused to one logical change; separate dependency bumps from feature edits when possible.
- PRs should include a concise summary, validation steps, linked issue/ticket, and screenshots for visual updates.
- Call out SEO/output changes explicitly when `sitemap` or `robots` files are updated.

## Environment & Configuration Tips
- Use a Node.js version compatible with Next.js 16 (Node `>=20.9.0`).
- Keep generated SEO artifacts in sync when routes are added, renamed, or removed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
