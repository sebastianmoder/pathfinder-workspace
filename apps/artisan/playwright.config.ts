import { defineConfig, devices } from "@playwright/test";

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
    // Specs play the cases with story scenes off (a setting in the notebook); story.spec.ts turns them back on.
    storageState: { cookies: [], origins: [{ origin: base, localStorage: [{ name: "artisan_progress", value: '{"v":2,"story":{"quiet":true}}' }] }] },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-375", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 800 }, hasTouch: true } },
  ],
});
