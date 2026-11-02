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
  await check();
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
  await page.getByRole("button", { name: "Run the machine" }).click();
  await expect(page.getByRole("cell", { name: /eight/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await cont();

  await page.getByLabel("It was in a different mood each time.").check();
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
    "A weather app estimates rain tomorrow": "Recommend", // wrong on purpose
    "An image tool makes a poster from a description": "Generate (text, images)",
  };
  for (const [item, cat] of Object.entries(place)) await page.getByLabel(item).selectOption({ label: cat });
  await check();
  await expect(page.getByText("Try another.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
  await page.getByLabel("A weather app estimates rain tomorrow").selectOption({ label: "Predict / forecast" });
  await check();
  await cont();

  await expect(page.getByText("It tells me little; I need evidence.").first()).toBeVisible(); // before/after
  await page.getByLabel(/Keep my answer/).check();
  await check();
  await cont();

  await page.getByLabel(/Treat the year and branch count/).check();
  await check();
  await cont();

  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Step 1 of 11")).toBeVisible();
});

test("M01 can be driven by keyboard and focus follows each new step", async ({ page }) => {
  await page.goto("/missions/m01-foundations");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter"); // brief -> refresher
  await expect(page.getByRole("region", { name: "Step 2 of 11" })).toBeFocused();
  await page.keyboard.press("Tab"); // first control inside the step
  await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
  await page.keyboard.press("Enter"); // -> initial judgment
  await expect(page.getByRole("region", { name: "Step 3 of 11" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space"); // first radio option
  await expect(page.getByRole("button", { name: "Check my answer" })).toBeDisabled(); // confidence still required
});
