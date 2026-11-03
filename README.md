# Pathfinder workspace

Four independent apps, one shared Pathfinder identity. Imported with their complete Git histories; original checkouts remain untouched.

## Develop

Use Node from `.nvmrc` and pnpm 10.30.3 (`corepack enable`).

```
pnpm install --frozen-lockfile
pnpm dev:pathfinder  # port 3000
pnpm dev:sage        # port 3001
pnpm dev:guard       # port 3002
pnpm dev:artisan     # port 3003
pnpm check
pnpm test:e2e
pnpm test:smoke      # after pnpm build
```

Apps live in `apps/`; shared brand components, tokens, product registry, analytics, and Next configuration live in `packages/`. App-specific content and state remain in their apps. Dependencies are declared by each consumer; the workspace owns the lockfile, runtime and package-manager versions. Material UI remains for existing homepage form components. Production builds use webpack consistently; development retains the default Next.js bundler. Shared fonts are vendored with licenses, so builds do not contact Google Fonts.

The canonical emblem is `pathfinder-refined.svg` at the workspace root. After changing it, run `pnpm brand:generate` (requires `rsvg-convert` from librsvg and ImageMagick’s `magick`). This distributes the logo and generates SVG favicons, multi-size ICO fallbacks, and touch icons for all four independent apps. Pathfinder, SAGE, and GUARD share project navigation; ARTISAN keeps its local navigation and funding attribution.

Edit product URLs/status in `packages/brand/products.ts`. Navigation uses canonical production URLs so previews never silently switch products to unrelated preview deployments. SAGE retains Nextra and Pagefind; GUARD retains its runtime functions; ARTISAN retains its in-memory learning state.

See [deployment and analytics cutover](docs/cutover.md) before changing live hosting. Analytics defaults to enabled only with a production Netlify context, a measurement ID, and a canonical host. Saved `pf_analytics=no` preferences remain respected. Pages retain the main funding footer without an analytics preferences footer.

## Maintenance

Dependency updates arrive weekly through Dependabot. Review framework updates together, run all builds, then browser checks. Keep dependency changes separate from content changes. Keep SAGE's compatibility patch until its documented upstream issue is verified fixed. Do not copy shared UI into apps.

PRs should describe behavior, affected products and validation; include screenshots for visual changes. CI builds every app on shared changes. Browser checks cover the shared shell; ARTISAN also has its existing mission and accessibility suite. Hosted GUARD job execution requires a Netlify preview with its environment configured.
