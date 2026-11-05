import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { check, choose, completeM06Gym, completeM06Teach, cont, recordJudgment } from "./helpers";

test("M06 gym: help is offered after an attempt, noted as help, and a revealed answer is not credited", async ({ page }) => {
  await page.goto("/missions/m06-gym");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Give me a hint/);

  await expect(page.getByRole("heading", { name: "Choose help" })).toHaveCount(0);
  // The answer is typed, so it can't be reached by ruling options out.
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByLabel("What the jacket costs now").fill("80");
  await page.getByLabel("What the jacket costs now").press("Enter");
  await expect(page.getByText(/Not yet/)).toBeVisible();
  await expect(page.getByText(/What it does/).first()).toBeVisible();
  await page.getByRole("button", { name: /^Ask the AI for the answer/ }).click();
  await expect(page.getByText(/25% of €60 is €15, so the new price is €75/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("What the jacket costs now").fill("€75");
  await check(page);
  await expect(page.getByText(/leaves the method with the AI/)).toBeVisible();
  await page.getByRole("button", { name: "Next problem" }).click();
  await expect(page.getByRole("heading", { name: "The round trip" })).toBeFocused();
});

test("M06 gym completes and leads to the teach-back", async ({ page }) => {
  await page.goto("/missions/m06-gym");
  await completeM06Gym(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Thinking Gym: teach it back/ })).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Using help to reach a solution yourself")).toBeVisible();
  await expect(shown.getByText(/with help/).first()).toBeVisible();
  await expect(shown.getByText("Solving related problems later, without help")).toBeVisible();
});

test("M06 teach-back completes, and the map marks the module done only when both missions are", async ({ page }) => {
  await page.goto("/missions/m06-teach");
  await completeM06Teach(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Numbers Lab/ })).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Finding out what someone thinks before explaining")).toBeVisible();
  await expect(shown.getByText("Handing the next step back to the learner")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
  await page.getByRole("navigation").getByRole("link", { name: "Mission map", exact: true }).click();
  const gym = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "The Thinking Gym" }) });
  await expect(gym.getByText("Completed this visit")).toHaveCount(0);
});

test("telling Leo the answer is recorded as such, and the debrief says so", async ({ page }) => {
  await page.goto("/missions/m06-teach");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Tell them it isn't always true/);
  await choose(page, /It's €30\. Write that down/);
  await expect(page.getByText(/ten off, ten on/i)).toBeVisible();
  await choose(page, /No, it's €99\. Moving on/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await cont(page);
  await page.getByLabel(/check his working/).check();
  await check(page);
  await cont(page);
  await page.getByLabel(/Reading the app's explanation/).check();
  await check(page);
  await expect(page.getByText(/A correct explanation can still slide past/)).toBeVisible();
  await page.getByLabel(/Asking him to do a new one/).check();
  await check(page);
  await cont(page);
  await page.getByLabel(/half a pizza/).check();
  await check(page);
  await cont(page);

  // Pick and improve: a weaker draft explains itself and never traps the learner; the sound one becomes the start.
  await page.getByLabel(/Percentage changes are multiplicative/).check();
  await check(page);
  await expect(page.getByText(/the wording would lose Leo/)).toBeVisible();
  await expect(page.getByLabel(/^Improve it/)).toHaveCount(0);
  await page.getByLabel(/second 50% is of a smaller amount/).check();
  await check(page);
  await expect(page.getByLabel(/^Improve it/)).toHaveValue(/second 50% is of a smaller amount/);
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  const review = page.getByRole("heading", { name: "Worth another look" }).locator("..");
  await expect(review.getByText("Finding out what someone thinks before explaining")).toBeVisible();
  await expect(review.getByText("Handing the next step back to the learner")).toBeVisible();
});
