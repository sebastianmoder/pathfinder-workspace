import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM03, cont, judgeChecklist, M03_CRITERIA, pickPart, recordJudgment, runIt } from "./helpers";

test("M03 is completable end to end and recommends the next mission", async ({ page }) => {
  await page.goto("/missions/m03-briefing");
  await completeM03(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The FAQ Project/ })).toBeVisible();
  await expect(page.getByText("WILLOW-QUILL-84").first()).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Improving a brief one element at a time")).toBeVisible();
  await expect(shown.getByText("Building a brief for a new task without guidance")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("the studio isolates one change per run, compares versions, and lets the learner branch", async ({ page }) => {
  await page.goto("/missions/m03-briefing");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /The request left out/, "Fairly");

  await expect(page.getByText(/written in advance for each option/)).toBeVisible();
  await runIt(page);
  await expect(page.getByText(/studies suggest it can improve wellbeing/)).toBeVisible();

  // Two changes at once are refused, so each comparison has a single cause.
  await pickPart(page, "Objective", /welcome email/);
  await pickPart(page, "Context", /experienced teachers/);
  await expect(page.getByText(/You have changed more than one element/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Run it" })).toBeDisabled();
  await pickPart(page, "Objective", /something about volunteering/);
  await runIt(page);
  await expect(page.getByText(/As experienced teachers/)).toBeVisible();
  await expect(page.getByText(/Compare with version 1.*changed: Context/)).toBeVisible();

  // Judging the checklist wrongly is pointed out, without blocking.
  await page.getByRole("checkbox", { name: /right date, time and room/ }).check();
  await page.getByRole("button", { name: "Check my checklist" }).click();
  await expect(page.getByText(/Look again\. This version does not meet it\./)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Open version 1 and branch from it: the tree keeps both paths.
  await page.getByRole("button", { name: /^Open Version 1$/ }).click();
  await pickPart(page, "Context", /most new to tutoring/);
  await runIt(page);
  await expect(page.getByText(/Version 3 ← Version 1: Context/)).toBeVisible();
  await expect(page.getByText(/Version 2 ← Version 1: Context/)).toBeVisible();

  for (const [part, option] of [
    ["Objective", /welcome email/],
    ["What it must include", /photo ID/],
    ["Length and style", /Under 120 words/],
  ] as const) {
    await pickPart(page, part, option);
    await runIt(page);
  }
  await expect(page.getByText(/This version meets every criterion. Judge it/)).toBeVisible();
  await judgeChecklist(page, M03_CRITERIA);
  await expect(page.getByRole("heading", { name: /A better brief isn't always the answer/ })).toBeVisible();
});
