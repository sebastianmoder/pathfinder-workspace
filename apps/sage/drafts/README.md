# Content drafts

Files in this directory are working material and are not published by Nextra.
Keep incomplete pages here instead of hiding them with `display: 'hidden'` in a
`content/**/_meta.js` file: a hidden sidebar entry can still be routed, indexed
by Pagefind, and included in a sitemap.

Before moving a draft into `content/`:

1. remove `TODO` and "coming soon" placeholders;
2. verify factual and product-specific claims against current primary sources;
3. add the page to the relevant `_meta.js` and section overview;
4. check internal links and references;
5. run `pnpm --filter @pathfinder/sage build` from the workspace root; and
6. inspect the rendered page and search/sidebar behaviour locally.

The sitemap is generated from the same published content registry as Nextra's
page routes. Files kept here are outside that registry. See the
[SAGE README](../README.md) for local setup, content editing and hosting.
