import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM08, cont, followLead, judgeStatements, recordJudgment } from "./helpers";

test("M08 is completable end to end", async ({ page }) => {
  await page.goto("/missions/m08-newsroom");
  await completeM08(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Fairness Council/ })).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Tracing where and when an image first appeared")).toBeVisible();
  await expect(shown.getByText("Investigating a new viral post, without hints")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
});

test("time runs out, and 'still uncertain' is right when the settling lead wasn't followed", async ({ page }) => {
  await page.goto("/missions/m08-newsroom");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Find out where and when/, "Fairly");

  await followLead(page, "Examine the image closely");
  await expect(page.getByText(/Rosa: “Looks real to me/)).toBeVisible();
  await expect(page.getByText(/Nothing looks edited/)).toBeVisible();
  await followLead(page, "Message the account");
  await followLead(page, "Call the council");
  await followLead(page, "Check the river-level record");
  await expect(page.getByText("Leads you can still follow: 0 of 4.")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Follow this lead ?: Search for earlier copies/ })).toBeDisabled();
  await expect(page.getByText(/River gauge at Riverside Bridge within its normal range/)).toBeVisible(); // timeline
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Finish investigating" }).click();
  await expect(page.getByRole("heading", { name: "What do you know?" })).toBeFocused();

  await judgeStatements(page, [
    [/taken before today/, "Still uncertain"],
    [/is flooded this morning/, "Contradicted"],
    [/failed to warn/, "Contradicted"],
    [/knowing it was old/, "Established"],
    [/shared about 4,000/, "Established"],
  ]);
  const old = page.getByRole("listitem").filter({ has: page.getByRole("group", { name: /taken before today/ }) });
  await expect(old.getByText("Fits what you found.")).toBeVisible();
  await expect(old.getByText(/Following “Search for earlier copies of the photo” would settle it: established/)).toBeVisible();
  const motive = page.getByRole("listitem").filter({ has: page.getByRole("group", { name: /knowing it was old/ }) });
  await expect(motive.getByText(/Look again\. From what you found: Still uncertain/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Leads you didn't follow" })).toBeVisible();
  await expect(page.getByText(/spring floods of March 2024/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
