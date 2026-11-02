import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { cont, check, markAndCheck, nextTask, setBoard, trainAndAsk, traceFaults } from "./helpers";

test("M01 is completable end to end, keyboard-reachable, and refresh restarts cleanly", async ({ page }) => {
  await page.goto("/missions/m01-foundations");
  await cont(page); // brief
  await cont(page); // refresher

  await page.getByLabel("It tells me little; I need evidence.").check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await expect(page.getByText("Weaker fit")).toHaveCount(0); // no verdict before investigating
  await cont(page);

  // Asking waits for training and for a prediction.
  await expect(page.getByRole("button", { name: "Ask the machine" })).toBeDisabled();
  await page.getByRole("button", { name: "Train the machine" }).click();
  await expect(page.getByRole("button", { name: "Ask the machine" })).toBeDisabled();
  await trainAndAsk(page, "ten", { train: false });
  await expect(page.getByText("The Riverside library opens at nine.", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: /nine/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await nextTask(page);

  // Changing the board does nothing until the machine is trained again.
  await setBoard(page, ["the school library opens at ten", "the bank opens at ten"]);
  await expect(page.getByText(/still knows only the 5/)).toBeVisible();
  await trainAndAsk(page, "ten", { train: false });
  await expect(page.getByText("The Riverside library opens at nine.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next task" })).toHaveCount(0);
  await trainAndAsk(page, "ten");
  await expect(page.getByText("The Riverside library opens at ten.", { exact: true })).toBeVisible();
  await nextTask(page);

  // Nobody gets stuck: a worked solution is there, and it does not count as solving it unaided.
  await page.getByRole("button", { name: "Show me a way" }).click();
  await trainAndAsk(page, "midnight");
  await expect(page.getByText("You used 1 sentence.")).toBeVisible();
  await nextTask(page);

  // Telling a trained model something is not training it.
  await expect(page.getByRole("button", { name: "Ask the machine" })).toBeDisabled();
  await page.getByRole("button", { name: "Say it" }).click();
  await trainAndAsk(page, "nine", { train: false });
  await expect(page.getByText("The Riverside library opens at nine.", { exact: true })).toBeVisible();
  await nextTask(page);

  await page.getByRole("checkbox", { name: "from january the library opens at ten" }).check();
  await trainAndAsk(page, "ten"); // a wrong prediction: older notices still outnumber it
  await expect(page.getByText("The Riverside library opens at nine.", { exact: true })).toBeVisible();
  await nextTask(page);

  await setBoard(page, ["from january the library opens at ten"]);
  await trainAndAsk(page, "ten");
  await cont(page);

  // A weaker answer explains only itself until the learner asks for more, and never traps them.
  await page.getByLabel(/picks among the possible answers/).check();
  await check(page);
  await expect(page.getByText("Try again")).toBeVisible();
  await expect(page.getByText(/This toy machine has no lookup/)).toHaveCount(0);
  await page.getByRole("button", { name: "Show the answer" }).click();
  await expect(page.getByText(/This toy machine has no lookup/)).toBeVisible();
  await page.getByLabel(/It follows the patterns in its data/).check();
  await check(page);
  await cont(page);

  await traceFaults(page);

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
  await check(page);
  await expect(page.getByText("Look again.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible(); // retry is offered, not required
  await page.getByLabel("A delivery app estimates when your parcel will arrive").selectOption({ label: "Predict / forecast" });
  await check(page);
  await cont(page);

  await expect(page.getByText("It tells me little; I need evidence.").first()).toBeVisible(); // before/after
  await page.getByLabel("It tells me little; I need evidence.").check();
  await page.getByLabel("Somewhat", { exact: true }).check();
  await check(page);
  await expect(page.getByText(/Fairly at the start, Somewhat now/)).toBeVisible();
  await cont(page);

  // Marking reports how many were found, not which, until the learner asks.
  await page.getByRole("button", { name: /opened in 1987/ }).click();
  await page.getByRole("button", { name: /welcoming place/ }).click();
  await check(page);
  await expect(page.getByText("You marked 1 of 2, and 1 that does not belong.")).toBeVisible();
  await expect(page.getByText(/This is a judgment/)).toHaveCount(0);
  await page.getByRole("button", { name: "Show the answer" }).click();
  await expect(page.getByText(/This is a judgment/)).toBeVisible();
  await cont(page);

  await page.getByLabel(/Hold both figures/).check();
  await check(page);
  await cont(page);

  // Practice first: rate two sample answers, and compare with a reviewed rating.
  const pattern = page.getByRole("group", { name: "Answer 2" }).getByRole("checkbox", { name: /patterns in training data/ });
  await pattern.check();
  await page.getByRole("button", { name: "Compare my ratings" }).click();
  await expect(page.getByText(/It covers where the answer came from/)).toBeVisible();
  await page.getByRole("button", { name: "Write my own answer" }).click();

  // Self-assessment means pointing at a sentence of your own. Nothing checks it, and the page says so.
  await page.getByLabel("Your answer").fill("It learned old timetables, so it may be out of date. Check the operator.");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await page.getByLabel(/Names a check/).selectOption({ label: "Check the operator." });
  await expect(page.getByText("It has not been reviewed by anyone.")).toBeVisible();
  await cont(page);

  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Evidence Bureau/ })).toBeVisible();

  // The debrief says what happened: the worked solution and the wrong predictions are not credited.
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  const review = page.getByRole("heading", { name: "Worth another look" }).locator("..");
  await expect(review.getByText("Working out how training data shapes output")).toBeVisible();
  await expect(review.getByText("Separating confidence of tone from evidence")).toBeVisible();
  await expect(shown.getByText("Tracing a failure to where it came in")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your own assessment" }).locator("..").getByText("you pointed to a sentence for 1 of 3 criteria")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Step 1 of 12")).toBeVisible();
});

test("a learner who skips and guesses can finish, and is not credited with what they did not show", async ({ page }) => {
  await page.goto("/missions/m01-foundations");
  await cont(page);
  await cont(page);
  await page.getByLabel(/It is probably correct/).check();
  await page.getByLabel("Very", { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await cont(page);

  await trainAndAsk(page, "seven");
  await nextTask(page);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Show me a way" }).click();
    await trainAndAsk(page, "seven");
    await nextTask(page);
  }
  await page.getByRole("button", { name: "Say it" }).click();
  await trainAndAsk(page, "seven", { train: false });
  await nextTask(page);
  await page.getByRole("button", { name: "Show me a way" }).click();
  await trainAndAsk(page, "seven");
  await nextTask(page);
  await page.getByRole("button", { name: "Show me a way" }).click();
  await trainAndAsk(page, "seven");
  await cont(page);

  await page.getByLabel(/looked up the real opening time/).check();
  await check(page);
  await page.getByLabel(/It follows the patterns in its data/).check();
  await check(page);
  await cont(page);

  for (const group of await page.getByRole("group").all()) await group.getByRole("radio").first().check();
  await check(page);
  await cont(page);

  for (const select of await page.getByRole("combobox").all()) await select.selectOption({ label: "Recommend" });
  await check(page);
  await cont(page);

  await page.getByLabel(/It is probably wrong/).check();
  await page.getByLabel("Very", { exact: true }).check();
  await check(page);
  await page.getByLabel("It tells me little; I need evidence.").check();
  await check(page);
  await cont(page);

  await markAndCheck(page, []);

  await page.getByLabel(/Publish it with a note/).check();
  await check(page);
  await page.getByLabel(/Hold both figures/).check();
  await check(page);
  await cont(page);

  await page.getByRole("button", { name: "Skip the practice" }).click();
  await page.getByRole("button", { name: "Skip writing and see the criteria" }).click();
  await cont(page);

  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What you showed" })).toHaveCount(0);
  await expect(page.getByText("you skipped this")).toBeVisible();
  await expect(page.getByText("this took more than one try").first()).toBeVisible();

  // A fresh example is on offer, and it does not reveal its answer first.
  await page.getByText("Try a fresh example").first().click();
  await expect(page.getByRole("button", { name: "Check my answer" }).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
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

test("the sandbox works by keyboard, and focus moves to each new task", async ({ page }) => {
  await page.goto("/missions/m01-foundations");
  await cont(page);
  await cont(page);
  await page.getByLabel("It tells me little; I need evidence.").check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await cont(page);

  await page.getByRole("button", { name: "Train the machine" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("radio", { name: "nine", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Ask the machine" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Next task" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Make it say ten" })).toBeFocused();
});
