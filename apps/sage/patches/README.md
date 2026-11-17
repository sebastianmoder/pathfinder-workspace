# Dependency compatibility patches

`nextra-theme-docs@4.6.1.patch` keeps the theme compatible with the patched Zod
release. Nextra's `Layout` removes `children` before validating `themeConfig`, but
its schema still requires `children`. Newer Zod versions reject that missing key.
The patch omits `children` from configuration validation; the component continues
to render the original children normally.

The root `pnpm-workspace.yaml` registers this patch, and a workspace-root
`pnpm install --frozen-lockfile` applies it automatically. Keep the patch file
with the workspace when building or deploying SAGE.

Keep this patch until an upstream Nextra release fixes configuration validation.
When upgrading the theme, check whether it is still needed. From the workspace
root, run `pnpm --filter @pathfinder/sage build` and inspect the rendered site.
