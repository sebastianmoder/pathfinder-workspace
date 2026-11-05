import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM12, cont, diagnose, recordJudgment, setStep } from "./helpers";

test("M12 is completable end to end", async ({ page }) => {
  await page.goto("/missions/m12-systems");
  await completeM12(page);
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Finding the step that caused a failure")).toBeVisible();
  await expect(shown.getByText("Changing the workflow and rerunning the tests")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("failure points stay hidden until diagnosed, then show in the diagram; changes need a rerun", async ({ page }) => {
  await page.goto("/missions/m12-systems");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /First check where its answers come from/);
  await page.getByRole("button", { name: "Run the tests" }).click();
  await expect(page.getByRole("heading", { name: "Test results, run 1" })).toBeFocused();
  await expect(page.getByText("1 of 6 tests passed.")).toBeVisible();
  await expect(page.getByText(/went wrong at/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run the tests again" })).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await diagnose(page, [
    [/library open on Saturday/, "Where answers come from"],
    [/parking for the new pottery/, "When the sources don't cover it"],
    [/forwards a flyer/, "Text inside attachments"],
    [/Tuesday's IT class/, "When the booking system is down"],
    [/charged twice/, "Sending replies"],
  ]);
  await expect(page.getByText("It failed at: Where answers come from.")).toBeVisible(); // parking: the model guessed before any gap step
  await expect(page.getByText(/“What time does the library open on Saturday\?” went wrong at: Where answers come from\./)).toBeVisible();
  await page.getByRole("button", { name: /^Show where it failed ?: Please book me/ }).click();
  await expect(page.getByText(/went wrong at: When the booking system is down/)).toBeVisible();

  // Sending everything for review fails a different test: there is a cost to over-checking.
  await setStep(page, "Sending replies", /Staff approve every reply/);
  await expect(page.getByText(/changed the assistant since the last run/)).toBeVisible();
  await page.getByRole("button", { name: "Run the tests again" }).click();
  await expect(page.getByText(/Members waited three days/)).toBeVisible();
  await page.getByRole("button", { name: "Show me a way" }).click();
  await page.getByRole("button", { name: "Run the tests again" }).click();
  await expect(page.getByText("6 of 6 tests passed.")).toBeVisible();
  await expect(page.getByText(/That covers the cases you tested, which is not every case/)).toBeVisible();
});
