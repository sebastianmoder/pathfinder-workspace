import { test, expect } from '@playwright/test';
for (const [i,app] of ['pathfinder','sage','guard','artisan'].entries()) {
 test(`${app} shares navigation and stores consent without preview collection`, async ({ page }) => {
  const tracking: string[] = [];
  page.on('request', req => { if (/googletagmanager|google-analytics/.test(req.url())) tracking.push(req.url()); });
  await page.goto(`http://localhost:${3200+i}`);
  await expect(page.getByRole('navigation',{name:'Pathfinder products'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Pathfinder',exact:true}).first()).toBeVisible();
  await expect(page.getByRole('button',{name:'Decline analytics'})).toBeVisible();
  await page.getByRole('button',{name:'Decline analytics'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Analytics preferences'})).toBeVisible();
  await page.getByRole('button',{name:'Analytics preferences'}).click();
  await page.getByRole('button',{name:'Allow analytics'}).click();
  expect(tracking).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 });
}

test('GUARD settings and history remain reachable', async ({ page }) => {
 await page.goto('http://localhost:3202/settings');
 await expect(page.getByRole('navigation',{name:'Pathfinder products'})).toBeVisible();
 await page.goto('http://localhost:3202/history');
 await expect(page.getByRole('navigation',{name:'Pathfinder products'})).toBeVisible();
});
test('SAGE retains its documentation search', async ({ page }) => {
 await page.goto('http://localhost:3201');
 if (test.info().project.name === 'mobile') await page.getByRole('button',{name:'Menu',exact:true}).click();
 await expect(page.locator('input[type="search"]:visible').first()).toBeVisible();
});
