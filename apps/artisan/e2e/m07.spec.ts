import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM07, cont, recordJudgment } from "./helpers";

test("M07 is completable end to end and recommends the stage bridge", async ({ page }) => {
  await page.goto("/missions/m07-numbers");
  await completeM07(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Newsletter Desk/ })).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Repairing a misleading chart")).toBeVisible();
  await expect(shown.getByText("Correcting numbers in a new case, without hints")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("the chart lab keeps chart, summary and table in step, in dark mode, and a worked view is not credited", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/missions/m07-numbers");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /How the chart is drawn/, "Fairly");

  await expect(page.getByText(/The axis starts at 85\. Highest: Jun \(101 visits\)/)).toBeVisible();
  await expect(page.getByRole("cell", { name: "92", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Check this view" }).click();
  await expect(page.getByText(/Not yet/)).toBeVisible();
  await page.getByRole("radio", { name: "At zero", exact: true }).check();
  await expect(page.getByText(/The axis starts at 0\..*First to last: Jan 92 → Jun 101 \(\+9\.8%\)/)).toBeVisible();
  await page.getByRole("button", { name: "Check this view" }).click();
  await expect(page.getByText(/rise of about 10%: real, but not a surge/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Next task" }).click();
  await expect(page.getByRole("heading", { name: "Look before the period on the slide" })).toBeFocused();

  await page.getByRole("button", { name: "Show me a way" }).click();
  await page.getByRole("button", { name: "Check this view" }).click();
  await expect(page.getByRole("rowheader", { name: "Oct" })).toBeVisible();
  await cont(page);

  await page.getByRole("radio", { name: "Visits per 1,000 residents" }).check();
  await expect(page.getByText(/Highest: Bramley \(50 per 1,000\)/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
