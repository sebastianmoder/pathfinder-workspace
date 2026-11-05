import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { check, completeM10, cont, recordJudgment } from "./helpers";

test("M10 is completable end to end", async ({ page }) => {
  await page.goto("/missions/m10-boundaries");
  await completeM10(page);
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Removing details a task doesn't need")).toBeVisible();
  await expect(shown.getByText("Spotting instructions hidden in a document")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("redacting shows what each party receives, and over-redacting is pointed out", async ({ page }) => {
  await page.goto("/missions/m10-boundaries");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /What the reply needs/);

  const condition = page.getByRole("button", { name: /diagnosed with ADHD/ });
  await condition.click();
  await expect(condition).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^4pm$/ }).click(); // the reply needs this
  await check(page);
  await expect(page.getByText("You removed 1 of 4 details that should go, and 1 that the task needs.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What leaves your hands" })).toBeVisible();
  await expect(page.getByText(/keeps a log of everything the assistant reads for 30 days/)).toBeVisible();
  const preview = page.locator(".sheet").last();
  await expect(preview.getByText("[removed]").first()).toBeVisible();
  await expect(preview.getByText(/07700 900461/)).toBeVisible(); // still there: not removed
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Show the answer" }).click();
  await expect(page.getByText(/“4pm”: keep this/)).toBeVisible();
});

test("redacted text stays legible in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/missions/m10-boundaries");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /What the reply needs/);
  await page.getByRole("button", { name: /diagnosed with ADHD/ }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
