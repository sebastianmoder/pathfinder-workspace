# Pathfinder workspace
Use pnpm 10.30.3 and Node from .nvmrc. Apps are independent deployables under apps/.
Shared UI, product URLs, analytics and build settings live in packages/. Change shared behavior there.
Read app-specific instructions too. SAGE uses App Router + content/, not pages/ or theme.config.jsx.
Run pnpm check and pnpm test:smoke for cross-app changes. Preserve storage keys, routes, EU funding text and GUARD functions.
Never add user answers, prompts, keys, uploads or chat text to analytics. GA defaults to enabled on canonical production hosts; honor saved pf_analytics declines. Do not render an analytics preferences footer; preserve the main footer and EU funding disclaimer.
