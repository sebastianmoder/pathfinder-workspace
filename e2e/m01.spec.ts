import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("M01 is completable end to end, keyboard-reachable, and refresh restarts cleanly", async ({ page }) => {
  await page.goto("/missions/m01-foundations");
  const cont = () => page.getByRole("button", { name: "Continue" }).click();
  const check = () => page.getByRole("button", { name: "Check my answer" }).click();

  await cont(); // brief
  await cont(); // refresher

  await page.getByLabel("It tells me little; I need evidence.").check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await expect(page.getByText("Weaker fit")).toHaveCount(0); // no verdict before investigating
  await cont();

  // Step-through diagram: 5 stages, last one offers Continue.
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Next stage" }).click();
  await cont();

  // Toy model: must compare at least two training sets.
  await page.getByLabel("First, what word do you expect next?").fill("nine");
  await page.getByRole("button", { name: "Run the machine" }).click();
  await expect(page.getByText("Result after learning from: Library notices")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0); // gated on 2 runs
  await page.getByLabel(/Shop and café notices/).check();
  await expect(page.getByRole("button", { name: "Run the machine" })).toBeDisabled(); // a new prediction first
  await page.getByLabel("First, what word do you expect next?").fill("eight");
  await page.getByRole("button", { name: "Run the machine" }).click();
  await expect(page.getByRole("cell", { name: /eight/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await cont();

  await page.getByLabel("It was guessing at random each time.").check();
  await check();
  await expect(page.getByText("Try again")).toBeVisible(); // wrong → retry, never trapped
  await page.getByLabel("Its answer depends on the patterns in what it was shown, not on what is true.").check();
  await check();
  await cont();

  await page.getByLabel("Typing a question and reading its reply.").check();
  await check();
  await cont();

  // Sort: place everything (one deliberately wrong first).
  const place: Record<string, string> = {
    "A phone unlocks when it sees your face": "Recognise (images, speech)",
    "A chatbot drafts an email for you": "Generate (text, images)",
    "A streaming service suggests your next show": "Recommend",
    "A voice assistant turns speech into text": "Recognise (images, speech)",
    "A delivery app estimates when your parcel will arrive": "Recommend", // wrong on purpose
    "An image tool makes a poster from a description": "Generate (text, images)",
  };
  for (const [item, cat] of Object.entries(place)) await page.getByLabel(item).selectOption({ label: cat });
  await check();
  await expect(page.getByText("Look again.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible(); // retry is offered, not required
  await page.getByLabel("A delivery app estimates when your parcel will arrive").selectOption({ label: "Predict / forecast" });
  await check();
  await cont();

  await expect(page.getByText("It tells me little; I need evidence.").first()).toBeVisible(); // before/after
  await page.getByLabel("It tells me little; I need evidence.").check();
  await page.getByLabel("Somewhat", { exact: true }).check();
  await check();
  await expect(page.getByText(/Fairly at the start, Somewhat now/)).toBeVisible();
  await cont();

  await page.getByLabel(/Treat the year and branch count/).check();
  await check();
  await cont();

  // Open response: self-assessed, with the skip route also available.
  await page.getByLabel("Your answer").fill("It learned old timetables, so it may be out of date. Check the operator.");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await page.getByLabel(/Names a check/).check();
  await expect(page.getByText("It has not been reviewed by anyone.")).toBeVisible();
  await cont();

  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Evidence Bureau/ })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Step 1 of 12")).toBeVisible();
});

test("M01 can be driven by keyboard and focus follows each new step", async ({ page }) => {
  await page.goto("/missions/m01-foundations");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter"); // brief -> refresher
  await expect(page.getByRole("region", { name: "Step 2 of 12" })).toBeFocused();
  await page.keyboard.press("Tab"); // first control inside the step
  await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
  await page.keyboard.press("Enter"); // -> initial judgment
  await expect(page.getByRole("region", { name: "Step 3 of 12" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space"); // first radio option
  await expect(page.getByRole("button", { name: "Record my judgment" })).toBeDisabled(); // confidence still required
});
