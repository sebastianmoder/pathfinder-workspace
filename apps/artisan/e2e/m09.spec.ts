import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM09, cont, recordJudgment, setThreshold } from "./helpers";

test("M09 is completable end to end", async ({ page }) => {
  await page.goto("/missions/m09-fairness");
  await completeM09(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Boundary Room/ })).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Tracing unfairness to the score, not the threshold")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("the threshold alone can't close the gap, the table says so, and it works by keyboard and buttons", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/missions/m09-fairness");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /systematically lower/, "Fairly");

  await expect(page.getByText(/Selected: 17\. Interview places: 10 to 12\. Too many\./)).toBeVisible();
  await setThreshold(page, 63);
  await expect(page.getByText(/Selected: 12\./)).toBeVisible();
  const breakRow = page.getByRole("row", { name: /Career break of a year or more/ });
  await expect(breakRow.getByRole("cell").nth(3)).toHaveText("3"); // qualified but rejected
  await expect(page.getByText(/qualified applicants rejected: 3\./)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Check this setting" }).click();
  await page.getByRole("button", { name: "Next task" }).click();

  // Nudging the threshold with the buttons and the keyboard never gets there on the original score.
  await page.getByRole("button", { name: "Raise the threshold by 1" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Selected: 11" })).toBeVisible();
  await page.getByLabel(/^Threshold: invite everyone/).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Check this setting" }).click();
  await expect(page.getByText(/Not yet/)).toBeVisible();

  await page.getByRole("radio", { name: "Revised score" }).check();
  await expect(page.getByText(/gaps in a CV no longer counted/)).toBeVisible();
  await setThreshold(page, 71);
  await expect(page.getByText(/qualified applicants rejected: 0\./)).toBeVisible();
  await page.getByRole("button", { name: "Check this setting" }).click();
  await expect(page.getByText(/the fix was in the score/)).toBeVisible();
});
