import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/map", "/continue", "/missions/m01-foundations", "/missions/m02-delegation", "/missions/m04-evidence", "/missions/m05-argument", "/missions/t01-transfer", "/start", "/summary"];

for (const route of ROUTES) {
  test(`no axe violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("password returns to the mission in a fresh browser context", async ({ browser }) => {
  // Visit 1: pause, read the password.
  const first = await browser.newContext();
  const p1 = await first.newPage();
  await p1.goto("/missions/m01-foundations");
  await p1.getByRole("button", { name: "Pause" }).click();
  const code = (await p1.getByRole("dialog").locator("p.font-mono").innerText()).trim();
  expect(code).toMatch(/^[A-Z]+-[A-Z]+-\d\d$/);
  await first.close();

  // Visit 2: brand-new context (no cookies/storage), messy input.
  const second = await browser.newContext();
  const p2 = await second.newPage();
  await p2.goto("/continue");
  await p2.getByLabel("Mission password").fill(`  ${code.toLowerCase().replace(/-/g, " ")} `);
  await p2.getByRole("button", { name: "Find mission" }).click();
  await expect(p2.getByText("This password opens: Inside the Machine")).toBeVisible();
  await p2.getByRole("link", { name: "Start mission" }).click();
  await expect(p2).toHaveURL(/\/missions\/m01-foundations$/);
  await expect(p2.getByText("Step 1 of 12")).toBeVisible();
  await second.close();
});

test("invalid password keeps the entry and offers the map", async ({ page }) => {
  await page.goto("/continue");
  const field = page.getByLabel("Mission password");
  await field.fill("nope-nope-22");
  await page.getByRole("button", { name: "Find mission" }).click();
  await expect(field).toHaveValue("nope-nope-22");
  await expect(page.getByRole("status").getByRole("link", { name: "Mission map" })).toBeVisible();
});

test("a password opens the mission from the beginning even mid-visit", async ({ page }) => {
  await page.goto("/missions/m01-foundations");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 2 of 12")).toBeVisible();
  await page.getByRole("link", { name: "Continue" }).click(); // client-side navigation keeps the visit's state
  await page.getByLabel("Mission password").fill("hazel beacon 47");
  await page.getByRole("button", { name: "Find mission" }).click();
  await page.getByRole("link", { name: "Start mission" }).click();
  await expect(page.getByText("Step 1 of 12")).toBeVisible();
});
