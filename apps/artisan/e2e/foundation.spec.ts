import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/map", "/missions/m01-foundations", "/missions/m02-delegation", "/missions/m04-evidence", "/missions/m05-argument", "/missions/t01-transfer", "/start", "/summary"];

for (const route of ROUTES) {
  test(`no axe violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("the retired intake and password pages lead somewhere useful", async ({ page }) => {
  await page.goto("/start");
  await expect(page).toHaveURL(/\/missions\/m01-foundations$/);
  await page.goto("/continue");
  await expect(page).toHaveURL(/\/map$/);
});

test("Start on the welcome page goes straight into the first mission", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start the first mission" }).click();
  await expect(page).toHaveURL(/\/missions\/m01-foundations$/);
  await expect(page.getByText("Step 1 of 11")).toBeVisible();
});
