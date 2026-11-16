import { defineConfig, devices } from "@playwright/test";
import { scenesPlayed } from "./e2e/played";

// Another port can be given when 3100 is taken: E2E_PORT=3111 pnpm test:e2e
const port = process.env.E2E_PORT ?? "3100";
const base = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    url: base,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: {
    baseURL: base,
    reducedMotion: "reduce",
    // Specs start as a returning player who has already seen every story scene; story.spec.ts starts fresh.
    storageState: { cookies: [], origins: [{ origin: base, localStorage: [{ name: "artisan_progress", value: scenesPlayed }] }] },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-375", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 800 }, hasTouch: true } },
  ],
});
