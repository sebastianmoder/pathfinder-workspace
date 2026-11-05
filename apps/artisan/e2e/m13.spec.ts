import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { choosePlan, completeM13, cont, followLead, judgeStatements, recordJudgment } from "./helpers";

test("M13 is completable end to end", async ({ page }) => {
  await page.goto("/missions/m13-assembly");
  await completeM13(page);
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Setting conditions that cover essential concerns")).toBeVisible();
  await expect(shown.getByText("Setting conditions for a new proposal, without guidance")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("the stakeholder map shows whose concerns a plan leaves out, and a different plan can also be sound", async ({ page }) => {
  await page.goto("/missions/m13-assembly");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /First ask who gains/);
  for (const lead of ["Read the Kelmere pilot", "Read the residents' digital", "Read the provider's energy"]) await followLead(page, lead);
  await page.getByRole("button", { name: "Finish investigating" }).click();
  await judgeStatements(page, [
    [/most routine enquiries/, "Established"],
    [/shut some residents out/, "Established"],
    [/carbon emissions/, "Still uncertain"],
    [/depends on halving/, "Still uncertain"],
    [/every time/, "Contradicted"],
  ]);
  await cont(page);

  // Before checking, nothing says which option meets which concern.
  await expect(page.getByText(/Covered by:/)).toHaveCount(0);
  await choosePlan(page, [/Keep the walk-in desk/, /staffed phone line/]);
  await expect(page.getByText(/Over budget/).first()).toBeVisible();
  await page.getByRole("checkbox", { name: /staffed phone line/ }).uncheck();
  await expect(page.getByText(/changed the plan since checking/)).toBeVisible();
  await page.getByRole("button", { name: "Check my plan" }).click();
  await expect(page.getByText(/1 essential concern isn't covered/)).toBeVisible();
  await expect(page.getByText(/Trade-off: It halves the projected saving/)).toBeVisible();
  await page.getByRole("checkbox", { name: /monthly review/ }).check();
  await page.getByRole("button", { name: "Check my plan" }).click();
  await expect(page.getByText(/Every essential concern is covered, within budget/)).toBeVisible();
  await expect(page.getByText(/Covered by: Keep the walk-in desk/).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
