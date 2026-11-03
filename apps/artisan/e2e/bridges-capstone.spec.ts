import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeB01, completeB03, completeC01Evidence, completeC01Review, completeC01Scope, completeC01Workflow } from "./helpers";

test("B01, the stage 1 bridge, is completable and leads into stage 2", async ({ page }) => {
  await page.goto("/missions/b01-faq");
  await expect(page.getByRole("button", { name: "Need a hint?" })).toHaveCount(0);
  await completeB01(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Evidence Bureau/ })).toBeVisible();
  await expect(page.getByText(/Choosing roles for AI across a project/)).toBeVisible();
});

test("B03, the stage 3 bridge, is completable and leads into stage 4", async ({ page }) => {
  await page.goto("/missions/b03-report");
  await completeB03(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Systems Workshop/ })).toBeVisible();
});

test("C01 runs through all four chapters, and the last one ends the journey", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/missions/c01-scope");
  await completeC01Scope(page);
  await page.getByRole("link", { name: "The Commission, chapter 2: evidence", exact: true }).click();
  await completeC01Evidence(page);
  await page.getByRole("link", { name: "The Commission, chapter 3: workflow", exact: true }).click();
  await completeC01Workflow(page);
  await page.getByRole("link", { name: "The Commission, chapter 4: the review meeting", exact: true }).click();
  await completeC01Review(page);
  await expect(page.getByText(/You have completed the currently available journey/)).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0); // the debrief shows no written answers
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // The map shows the capstone's chapters and marks it done only now.
  await page.getByRole("navigation").getByRole("link", { name: "Mission map", exact: true }).click();
  const capstone = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "The ARTISAN Commission" }) });
  await expect(capstone.getByText("done this visit")).toHaveCount(4);
  await expect(capstone.getByText("Completed this visit")).toBeVisible();
});

test("a capstone chapter opens on its own from its password, with its case pack", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/continue");
  await page.getByLabel("Mission password").fill("osprey charter 87");
  await page.getByRole("button", { name: "Find mission" }).click();
  await page.getByRole("link", { name: "Start mission" }).click();
  await expect(page).toHaveURL(/\/missions\/c01-review$/);
  await expect(page.getByText(/about 90% of answers were correct overall/)).toBeVisible();
  await context.close();
});
