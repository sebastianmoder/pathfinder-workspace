# Local migration validation

Validated with Node 22.22.0 and pnpm 10.30.3:

- All four production webpack builds passed, including TypeScript checks.
- SAGE Pagefind indexed 29 published pages. Drafts remain outside the content tree.
- Workspace shared-package/app lint and TypeScript checks passed.
- 178 existing ARTISAN tests and three analytics policy tests passed.
- A frozen-lockfile install passed using the local package store.
- Git subtree imports retained 442 commits before implementation changes. Original checkouts remain clean.

Browser smoke checks could not start: this execution environment denies local listening sockets (`listen EPERM` on port 3200). Desktop/mobile layout, browser accessibility, ARTISAN end-to-end flows, and live consent/GA request behavior require the included CI/browser checks before release. No visual approval is claimed.

SAGE emits Git timestamp warnings during builds; these do not prevent generation or search indexing. A production build does not verify Netlify's runtime integration: GUARD's hosted background jobs, upload transport limits and cleanup require the cutover checks.

No GitHub remote has been created for the new workspace. No live Netlify site, GA property/stream, domain or existing repository has been changed or archived. Analytics stays disabled until a selected measurement ID is configured at production build time.
