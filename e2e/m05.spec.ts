import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { choose, completeM05, cont, placeCards, recordJudgment } from "./helpers";

const axe = async (page: import("@playwright/test").Page) =>
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("the advocate opposes whichever position the learner took", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Do not adopt it/, "Fairly");
  await expect(page.getByText(/Saying no is also a decision/)).toBeVisible();
  await expect(page.getByText(/Scripted conversation/)).toBeVisible();
  await axe(page);
});

test("a learner cannot be trapped, and missed findings stay reachable", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Adopt the tutor as proposed/, "Very");
  // Shortest path: restating and conceding uncovers very little.
  await choose(page, /You have a point/);
  await choose(page, /needs a condition/);
  await choose(page, /Replace the drop-in as proposed/);
  await expect(page.getByRole("heading", { name: "Not uncovered on this path" })).toBeVisible();
  await expect(page.getByText(/It is in the source pack: Wednesday drop-in log/)).toBeVisible();
  await axe(page);
  await page.getByRole("button", { name: "Continue to the argument map" }).click();
  await expect(page.getByRole("heading", { name: "Map the argument" })).toBeVisible();
});

test("private notes are separate from the conversation", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Try it/, "Fairly");
  await page.getByLabel("Private notes").fill("My private thought");
  await choose(page, /What evidence do we have/);
  await expect(page.getByLabel("Private notes")).toHaveValue("My private thought");
  await expect(page.locator("ol").getByText("My private thought")).toHaveCount(0);
});

test("the argument map gives card-level feedback and allows moving cards", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Try it/, "Fairly");
  await choose(page, /You have a point/);
  await choose(page, /needs a condition/);
  await choose(page, /Keep the remaining volunteers/);
  await page.getByRole("button", { name: "Continue to the argument map" }).click();

  // Placement controls wait for a selected card.
  await expect(page.getByRole("button", { name: /Place here.*Evidence/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Check my map" })).toBeDisabled();
  await placeCards(page);
  await axe(page);

  // Move the brochure claim to Evidence: defensible, not wrong.
  await page.getByRole("button", { name: /Take back.*Students finish homework/ }).click();
  await page.getByRole("button", { name: /Place here.*Evidence/ }).click();
  await page.getByRole("button", { name: "Check my map" }).click();
  await expect(page.getByText(/Defensible\./)).toBeVisible();
  await expect(page.getByText("Reviewed placement: Set aside.")).toBeVisible();
  await axe(page);
  await cont(page);
  await expect(page.getByLabel(/Try it for a limited time/)).toBeVisible();
});

test("the dialogue and map work by keyboard, and focus follows the conversation", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Try it/, "Fairly");

  await page.getByRole("button", { name: /You have a point/ }).focus();
  await page.keyboard.press("Enter");
  // The chosen button has gone, so focus lands on the reply.
  await expect(page.locator("ol li div[tabindex='-1']").last()).toBeFocused();
  await expect(page.locator(":focus")).toContainText("Conceding isn't losing");

  await page.getByRole("button", { name: /needs a condition/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /Keep the remaining volunteers/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Continue to the argument map" }).focus();
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: /Without another option/ }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: /Place here.*Reasons for/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Cards to place" })).toBeFocused();
  await expect(page.getByRole("button", { name: /Take back.*Without another option/ })).toBeVisible();
});

test("replaying a decision shows another path and leaves the original alone", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await completeM05(page);

  const originalDecisions = await page.getByText(/^Decision \d:/).allInnerTexts();
  expect(originalDecisions.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: /Try another choice here.*Decision 1/ }).click();
  await expect(page.getByRole("heading", { name: /Replay path/ })).toBeVisible();
  await choose(page, /You have a point/);
  await choose(page, /needs a condition/);
  await choose(page, /Recruit volunteers/);
  await expect(page.getByText("Uncovered on the replay:")).toBeVisible();
  await expect(page.getByText("Uncovered on your original path:")).toBeVisible();
  await axe(page);

  // The original path has not moved.
  expect(await page.getByText(/^Decision \d:/).allInnerTexts()).toEqual(originalDecisions);
  await page.getByRole("button", { name: "End this replay" }).click();
  await expect(page.getByRole("heading", { name: /Replay path/ })).toHaveCount(0);
});
