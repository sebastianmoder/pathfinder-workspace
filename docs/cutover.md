# Deployment and analytics cutover

## Preserve before reconnecting

For each existing Netlify site record site ID, current Git repository/branch, latest known-good deploy ID, domain aliases, redirects, environment names/scopes (never values in Git), build settings and runtime version. Local imported refs can be audited with `git log --all`; the subtree import commits retain all four original histories.

Create a GitHub repository for this workspace and push its full history. Do not archive the originals until all production checks below pass. Update SAGE's docsRepositoryBase to the new repository's `tree/main/apps/sage` URL once the destination exists.

## Netlify

Reconnect the existing sites individually to the new repository, retaining domains. Base directory: repository root (unset). Package directories: `apps/pathfinder`, `apps/sage`, `apps/guard`, `apps/artisan`, respectively. Each package contains netlify.toml with a root-relative filtered build command and publish directory. Do not set base to the app: workspace dependencies require the root installation. Set production branch to main and enable deploy previews. Do not add build-ignore rules yet: shared changes must deploy all consumers.

| App | Canonical hostname | Environment |
| --- | --- | --- |
| Pathfinder | ai-pathfinder.eu | SITE_URL (optional sitemap override), analytics below |
| SAGE | sage.ai-pathfinder.eu | SITE_URL (optional sitemap override), analytics below |
| GUARD | guard.ai-pathfinder.eu | OPENROUTER_API_KEY; CHAT_JOB_SIGNING_SECRET shared between Next functions and chat-worker, Functions scope; analytics below |
| ARTISAN | artisan.ai-pathfinder.eu | analytics below |

Netlify supplies CONTEXT. Set NEXT_PUBLIC_GA_MEASUREMENT_ID only in production build scope, with the same chosen stream ID for all four sites. Never override CONTEXT for previews. Confirm ARTISAN's canonical domain before enabling product links in production.

GUARD functions directory is root-relative `apps/guard/netlify/functions`. Verify chat-worker and hourly cleanup-chat-jobs appear in the deployed function inventory; complete a real hosted chat, upload, resume history and check expiry cleanup. Check that all secrets retain their scopes. Local streaming alone does not validate hosted background jobs.

## GA4

Inventory the four measurement IDs and property/stream ownership in GA Admin. Select the existing main-project property if appropriate, otherwise create a dedicated Pathfinder property. Use one web stream, keep the historical properties read-only, and record the cutover date in the analytics administration notes.

Disable automatic page-view collection from browser history changes in enhanced measurement: the shared client emits page_view on navigation and consent. Disable enhanced automatic events that collect uncontrolled URLs/form interactions; event payloads should be limited to the reviewed implementation. Set unwanted referrals/cookie configuration after verifying subdomain navigation in DebugView. Register event-scoped `product` and `item_id` custom dimensions. Build reports segmented by hostname/product and milestone events. No user IDs or answer/prompt text are sent.

Consent is stored for one year in a first-party pf_analytics cookie shared across canonical subdomains. Rejection loads no Google script. Visitors can reopen preferences; withdrawal disables collection immediately and removes GA cookies on available domain scopes. Other open product tabs synchronize consent when focused or their visibility changes; the event sender also checks the cookie on every event. Existing cookie notices/privacy text must be reviewed by the project owner against this actual behavior.

Verify before consent: no Google requests. After consent: one page_view per route change, no duplicate automatic page views, no query strings/fragments, and correct product on each hostname. Verify navigation preserves the same GA client/session across subdomains and preview visits never collect. Revoke consent and confirm events stop. Keep old properties for historical reporting; data is not merged.

## Release and rollback

Validate previews first, then cut over Pathfinder, SAGE, ARTISAN, GUARD separately. Check canonical metadata, redirects, sitemap/search URLs, funding footer, keyboard/mobile navigation, SAGE search and draft exclusion, ARTISAN mission/password/summary flow, GUARD chat/uploads/history/settings. Record deployed commit and date. Restore the previous Netlify production deploy if checks fail; retain the former repository connection settings for rollback.

After all four pass, update old READMEs with the new repository URL and archive the old repositories. This document prepares those external actions; it does not perform them.

GUARD retains its application-level 20 MB file check. An unsupported `maxRequestBodySize` route export was removed because Next.js rejects it; that export never increased Netlify transport limits. Include realistic upload sizes in the hosted preview checks before claiming the full size is supported.
