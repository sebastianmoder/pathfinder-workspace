# Pathfinder

Pathfinder is the public website for the Erasmus+ Pathfinder project:
**Pioneering AI Technology in Higher Education to Facilitate Innovation and
Nurture the Development of Entrepreneurial Resources**.

The site explains the project background, introduces the consortium, and points
educators and students to the project outputs: SAGE, GUARD, and ARTISAN. It is
built as a lightweight, content-focused Next.js application and published under
the `ai-pathfinder.eu` domain.

## Background and Intentions

Pathfinder is an Erasmus+ collaboration focused on practical and responsible AI
adoption in higher education. The project brings together academic, applied
research, and school-level partners from Liechtenstein, Finland, and Croatia.

Its purpose is to help educators and students understand where AI can support
teaching, learning, employability, and entrepreneurial innovation while keeping
responsible use, critical thinking, and digital readiness at the center.

This website has four main responsibilities:

- Explain the Pathfinder mission and project context.
- Present the consortium and participating organizations.
- Publish the status of the project deliverables.
- Route visitors to live or upcoming Pathfinder tools and learning resources.

Project reference:
[`2023-2-LI01-KA220-HED-000178579`](https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579)

## Project Outputs

| Output  | Full name                                                                 | Audience               | Status       | Location                         |
| ------- | ------------------------------------------------------------------------- | ---------------------- | ------------ | -------------------------------- |
| SAGE    | Strategies for AI-Guided Education                                        | Educators              | Live         | <https://sage.ai-pathfinder.eu>  |
| GUARD   | Generative Universal Assistant for Resourceful Development                | Educators              | Live         | <https://guard.ai-pathfinder.eu> |
| ARTISAN | AI Readiness Training for Insightful Systematic Adaptation and Navigation | Educators and students | Coming soon  | `/artisan`                       |

SAGE provides a strategic framework for responsible AI integration in higher
education. GUARD is an educator-facing assistant for lesson planning, teaching
support, and classroom adaptation workflows. ARTISAN is planned as an AI
readiness learning journey for educators and students.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) with strict mode enabled
- [Tailwind CSS](https://tailwindcss.com/) for layout and project styling
- [Material UI](https://mui.com/) for existing form controls; shared Pathfinder navigation
- Next.js App Router metadata routes for sitemap and robots generation

## Getting Started

Use the workspace Node version in `../../.nvmrc` and pnpm. Run installation from the workspace root.

Install dependencies:

```bash
pnpm install
```

Start the local development server:

```bash
pnpm run dev
```

Open <http://localhost:3000> in a browser.

Useful local routes:

- `/` - homepage, project objective, deliverables, full consortium profiles and links at `/#consortium`
- `/about` - permanent redirect to `/#consortium`
- `/sage` - SAGE overview page, with a link to the live SAGE subdomain
- `/guard` - GUARD overview page, with a link to the live application
- `/artisan` - ARTISAN coming-soon page

## Scripts

| Command         | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `pnpm run dev`   | Start the local development server.                      |
| `pnpm run lint`  | Run ESLint with Next.js core web vitals rules.           |
| `pnpm run build` | Create a production build and regenerate sitemap output. |
| `pnpm run start` | Run the production server after a successful build.      |

`pnpm run build` prerenders `/sitemap.xml` and `/robots.txt` from the App Router
metadata routes, ready for Netlify's existing `.next` publish directory.

## Project Structure

```text
app/
  page.tsx          Homepage
  layout.tsx        Root layout, metadata, analytics, navigation, footer
  sage/page.tsx     SAGE overview page
  guard/page.tsx    GUARD overview page
  artisan/page.tsx  ARTISAN overview page
  sitemap.ts       Sitemap generated during the build
  robots.ts        Crawler rules and sitemap URL

components/
  Navigation.tsx    Responsive top navigation
  Consortium.tsx    Partner profiles and external links on the homepage
  Footer.tsx        Project footer and EU funding declaration
  Featurecard.tsx   Deliverable card component
  forms/            Form-related UI components
  svg/              Custom SVG/icon components

public/
  images/           Project, partner, and EU funding images

netlify.toml
tailwind.config.ts
tsconfig.json
```

## Working on the Site

Most content changes happen in the route files under `app/`. Shared page
elements live in `components/`. Static assets should be placed under
`public/images/` and referenced with root-relative paths such as
`/images/pathfinder.png`.

When adding, renaming, or removing routes, update the navigation if needed and
update `app/sitemap.ts` and run a production build so the sitemap stays in sync.

Before opening a pull request, verify:

```bash
pnpm run lint
pnpm run build
```

For UI changes, manually check the main routes: `/`, `/about`, `/guard`,
`/artisan`, and `/sage`.

## Deployment and SEO

The sitemap and robots routes use the canonical production URL from
`packages/brand/products.ts`, including in deploy previews. The sitemap lists
the homepage and the SAGE, GUARD and ARTISAN overview pages. `/about` redirects
to the homepage and is omitted. No `SITE_URL` environment variable is needed.

`netlify.toml` contains a redirect from the previous Netlify URL to the
production domain. Keep this redirect in place unless the deployment target
changes.

The footer includes the required European Union funding declaration. Preserve it
when changing public-facing layout or footer content.
