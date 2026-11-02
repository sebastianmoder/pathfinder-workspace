import { defineConfig, devices } from '@playwright/test';
const apps = ['pathfinder','sage','guard','artisan'];
export default defineConfig({
 testDir: './tests', timeout: 30000,
 webServer: apps.map((app,i) => ({ command: `pnpm --filter @pathfinder/${app} start --port ${3200+i}`, url:`http://localhost:${3200+i}`, reuseExistingServer:!process.env.CI, timeout:120000 })),
 use: { ...devices['Desktop Chrome'] },
 projects: [{ name:'desktop' },{ name:'mobile',use:{viewport:{width:375,height:812}} }],
});
