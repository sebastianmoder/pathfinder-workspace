import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM11, cont, judgeChecklist, pickPart, recordJudgment, runIt } from "./helpers";

test("M11 is completable end to end", async ({ page }) => {
  await page.goto("/missions/m11-cocreation");
  await completeM11(page);
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Revising when the requirements change")).toBeVisible();
  await expect(shown.getByText("Applying rules on permission and disclosure")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("the studio records contributions, shows the client's change, and keeps the first poster in the tree", async ({ page }) => {
  await page.goto("/missions/m11-cocreation");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Me, and whoever approves it/);
  await runIt(page);
  const record = page.getByRole("table");
  await expect(record.getByRole("row", { name: /Image.*AI$/ })).toBeVisible();

  await pickPart(page, "Headline", /win a festival ticket/);
  await pickPart(page, "Image", /reading party/);
  await pickPart(page, "Main text", /\(festival ticket\)/);
  await runIt(page);
  await expect(record.getByRole("row", { name: /Main text.*AI draft, edited by you/ })).toBeVisible();
  await expect(record.getByRole("row", { name: /Image.*Supplied by the client/ })).toBeVisible();
  await judgeChecklist(page, [/says what the challenge is/, /what to do, where, and by when/, /one the Commons may use/, /meets the policy for the image used/], "Next round");

  await expect(page.getByText(/the festival tickets fell through/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fatima's change of plan" })).toBeFocused();
  await pickPart(page, "Headline", /win a book voucher/);
  await pickPart(page, "Main text", /\(book voucher\)/);
  await runIt(page);
  await expect(page.getByText(/Version 3 ← Version 2: Headline, Main text/)).toBeVisible();
  await expect(page.getByText(/Version 2 ← Version 1/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
