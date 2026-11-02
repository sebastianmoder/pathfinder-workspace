import { test, expect } from '@playwright/test';
for (const [i,app] of ['pathfinder','sage','guard','artisan'].entries()) {
 test(`${app} has the intended navigation and stores consent without preview collection`, async ({ page }) => {
  const tracking: string[] = [];
  page.on('request', req => { if (/googletagmanager|google-analytics/.test(req.url())) tracking.push(req.url()); });
  await page.goto(`http://localhost:${3200+i}`);
  const projectNav = page.getByRole('navigation',{name:'Pathfinder products'});
  if (app === 'artisan') {
    await expect(projectNav).toHaveCount(0);
    await expect(page.getByRole('link',{name:'ARTISAN',exact:true})).toBeVisible();
    await expect(page.getByRole('link',{name:'Mission map',exact:true})).toBeVisible();
  } else {
    await expect(projectNav).toBeVisible();
    await expect(page.getByRole('link',{name:'Pathfinder',exact:true}).first()).toBeVisible();
  }
  for (const asset of ['/icon.svg','/favicon.ico','/apple-icon.png']) {
    const response = await page.request.get(`http://localhost:${3200+i}${asset}`);
    expect(response.ok()).toBe(true);
  }
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
 await expect(page.getByText('This site is under development', {exact:false})).toHaveCount(0);
 expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--nextra-primary-hue').trim())).toBe('188deg');
 if (test.info().project.name === 'mobile') await page.getByRole('button',{name:'Menu',exact:true}).click();
 await expect(page.locator('input[type="search"]:visible').first()).toBeVisible();
});

test('GUARD lab progresses with a mocked AI response and preserves history', async ({ page }) => {
 await page.route('**/api/chat', route => route.fulfill({ status:200, contentType:'text/event-stream', body:'data: {"type":"content","content":"Mock teaching activity: compare two explanations and discuss the evidence."}\n\ndata: {"type":"finish","finishReason":"stop"}\n\ndata: [DONE]\n\n' }));
 await page.goto('http://localhost:3202/lab/activity-planning');
 const scaffold = page.getByRole('region',{name:'Scaffolding panel'});
 await scaffold.locator('textarea').first().fill('History');
 await page.getByRole('button',{name:'Continue to Compose'}).click();
 await page.getByRole('button',{name:'Send to AI',exact:true}).click();
 await expect(page.getByRole('button',{name:'Continue to Iteration 2',exact:false})).toBeVisible();
 if (test.info().project.name === 'mobile') await page.getByRole('button',{name:'AI Chat',exact:true}).click();
 await expect(page.getByText('Mock teaching activity:',{exact:false}).first()).toBeVisible();
 if (test.info().project.name === 'mobile') await page.getByRole('button',{name:'Scaffolding',exact:true}).click();
 await expect(page.getByRole('button',{name:'Continue to Iteration 2',exact:false})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('button',{name:'Continue to Iteration 2',exact:false})).toBeVisible();
 await expect.poll(async () => page.evaluate(() => localStorage.getItem('guard-history'))).toBeTruthy();
 await page.goto('http://localhost:3202/history');
 await expect(page.getByText('Plan a Class Activity',{exact:true}).first()).toBeVisible();
});
