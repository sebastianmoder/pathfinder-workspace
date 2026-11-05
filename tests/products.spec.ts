import { test, expect } from '@playwright/test';

for (const [app, port, contentPath] of [
 ['guard', 3202, '/lab/activity-planning'],
 ['artisan', 3203, '/missions/m01-foundations'],
] as const) {
 test(`${app} production build serves its sitemap and advertises it to crawlers`, async ({ request }) => {
  const origin = `http://localhost:${port}`;
  const canonical = `https://${app}.ai-pathfinder.eu`;
  const response = await request.get(`${origin}/sitemap.xml`);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/xml');
  const xml = await response.text();
  expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(locations).toContain(canonical);
  expect(locations).toContain(`${canonical}${contentPath}`);
  expect(new Set(locations).size).toBe(locations.length);
  for (const location of locations) {
   const url = new URL(location);
   expect(url.origin).toBe(canonical);
   expect((await request.get(`${origin}${url.pathname}`)).status()).toBe(200);
  }
  const robots = await request.get(`${origin}/robots.txt`);
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${canonical}/sitemap.xml`);
 });
}
for (const [i,app] of ['pathfinder','sage','guard','artisan'].entries()) {
 test(`${app} keeps navigation and funding footer without analytics preferences or preview collection`, async ({ page, context }) => {
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
  const footer = page.locator('footer.pf-footer');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText('Funded by the European Union.');
  await expect(footer).toContainText('Neither the European Union nor EACEA can be held responsible for them.');
  await expect(footer.getByRole('img',{name:'Funded by the European Union'})).toBeVisible();
  await expect(page.locator('.pf-consent')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/analytics/i})).toHaveCount(0);
  expect((await context.cookies()).find(cookie => cookie.name === 'pf_analytics')).toBeUndefined();
  await context.addCookies(['pf_analytics','_ga','_ga_TEST123'].map(name => ({name,value:name === 'pf_analytics' ? 'no' : 'existing-client',url:`http://localhost:${3200+i}`})));
  await page.reload();
  await expect(footer).toBeVisible();
  await expect(page.getByRole('button',{name:/analytics/i})).toHaveCount(0);
  expect((await context.cookies()).find(cookie => cookie.name === 'pf_analytics')?.value).toBe('no');
  await expect.poll(async () => (await context.cookies()).filter(cookie => cookie.name === '_ga' || cookie.name.startsWith('_ga_'))).toEqual([]);
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
