# Pathfinder SAGE

Pathfinder SAGE is a documentation site for **Strategies for AI-Guided
Education**: a practical framework for helping higher education teachers use
generative AI thoughtfully, responsibly, and effectively.

The site is part of the Erasmus+ Pathfinder project, **Pioneering AI Technology
in Higher Education to Facilitate Innovation and Nurture the Development of
Entrepreneurial Resources**. Its purpose is to turn fast-moving AI developments
into usable teaching guidance: when AI is useful, when it is not, how to prompt
well, how to adapt teaching tasks, and how to support students in critical,
ethical AI use.

The public site is available at:

https://sage.ai-pathfinder.eu

## Project Status

This resource is under active development. Content, structure, examples, and
recommendations may change as the project evolves and as AI tools, policy, and
educational practice continue to develop.

## What This Site Contains

The site is organized as a Nextra documentation site with MDX content. The main
sections are:

- **Introduction**: the SAGE framework and its intended role.
- **Basics of Generative AI**: core concepts, limitations, AI detection, ethics,
  and guidance on when AI is an appropriate tool.
- **Basics of Prompt Engineering**: practical prompting techniques for better
  AI-assisted work.
- **Teachers' Tasks**: guidance for course and assignment AI rules, curriculum
  design, lesson planning, course materials, exam questions, rubrics, and
  related teaching workflows.
- **Teaching and Learning with AI**: a progressive AI competency pathway plus
  guidance for assessment, tutoring, simulations, evaluation, and writing
  instruction.
- **Draft sections**: incomplete pages live in `drafts/`, outside Nextra's
  routable content tree, until they meet the publication checklist.

The intention is not to promote AI use for its own sake. The site should help
educators make informed decisions, keep human expertise central, and treat AI
outputs as drafts that require review, judgment, and contextual adaptation.

## Technology

This project uses:

- [Next.js](https://nextjs.org/) with the App Router.
- [Nextra](https://nextra.site/) and `nextra-theme-docs` for documentation
  routing, layout, sidebars, and MDX rendering.
- MDX content stored in `content/`.
- Tailwind CSS and global CSS for styling.
- Pagefind for static search indexing.
- `next-sitemap` for sitemap and `robots.txt` generation.

## Repository Structure

```text
app/                       Next.js App Router layout and Nextra catch-all route
components/                Shared React components
content/                   Published MDX pages and navigation metadata
drafts/                    Unpublished working content
public/                    Static assets, generated sitemap, and Pagefind index
styles/                    Global CSS and chat component styles
mdx-components.js          Nextra MDX component wiring
next.config.mjs            Next.js and Nextra configuration
next-sitemap.config.js     Sitemap and robots.txt configuration
netlify.toml               Netlify redirect configuration
package.json               Scripts, dependencies, and Node engine range
```

## Requirements

- Node.js `>=22 <25`
- pnpm

The repository includes an `.nvmrc` file. If you use `nvm`, run:

```bash
nvm use
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The local site normally runs at:

```text
http://localhost:3000
```

The `dev` script ensures that a Pagefind search index exists before starting
Next.js. If the index is missing, it may trigger a build first.

## Production Build

Build the site:

```bash
pnpm build
```

This runs the Next.js production build and then runs `postbuild`, which:

- generates `public/sitemap.xml` and `public/robots.txt` with `next-sitemap`;
- regenerates the Pagefind search index in `public/_pagefind`.

Serve the production build locally:

```bash
pnpm start
```

## Editing Content

Most content work happens in `content/`.

To add or change a page:

1. Edit or create an `.mdx` file in the relevant `content/` section.
2. Update that section's `_meta.js` file to control sidebar order and labels.
3. Keep incomplete pages in `drafts/`; a sidebar-hidden page inside `content/`
   may still be routed, indexed by search, and included in the sitemap.
4. Run `pnpm build` to catch MDX, routing, and sitemap/search-index issues.
5. Manually check the affected route in `pnpm dev`.

Shared UI belongs in `components/`. Global styling belongs in `styles/`.

## Useful Scripts

```bash
pnpm dev                 Start the local development server
pnpm build               Create a production build and regenerate site outputs
pnpm start               Serve the production build
pnpm run build:search-index
                         Regenerate the Pagefind index from the built site
```

There are currently no dedicated test or lint scripts. `pnpm build` is the main
quality gate.

## Configuration Notes

- The canonical site URL defaults to `https://sage.ai-pathfinder.eu`.
- Set `SITE_URL` to override the sitemap URL during build.
- Theme, navbar, sidebar behavior, analytics, banner text, and footer wiring live
  in `app/layout.jsx`.
- The footer includes the Erasmus+ project link and EU funding declaration.
- `netlify.toml` redirects the older Netlify URL to the canonical domain.

## Contribution Guidelines

Keep changes focused and easy to review:

- Prefer small, content-focused MDX updates.
- Avoid mixing content rewrites with structural refactors.
- Keep filenames lowercase and descriptive.
- Update `_meta.js` whenever navigation order or labels change.
- Run `pnpm build` before opening a pull request.
- Include screenshots for visible layout, styling, or theme changes.

Commit messages should be short and action-oriented, for example:

```text
teaching: add rubric examples
prompting: revise delimiter guidance
docs: update local setup notes
```

## Funding Declaration

Funded by the European Union. Views and opinions expressed are however those of
the author(s) only and do not necessarily reflect those of the European Union or
the European Education and Culture Executive Agency (EACEA). Neither the
European Union nor EACEA can be held responsible for them.
