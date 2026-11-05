import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { choose, completeM05, connectAndTest, cont, passRafael, placeCards, recordJudgment, showPassage } from "./helpers";

const axe = async (page: import("@playwright/test").Page) =>
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("the advocate opposes whichever position the learner took", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Do not adopt it/, "Fairly");
  await expect(page.getByText(/Saying no is also a decision/)).toBeVisible();
  await expect(page.getByText(/Scripted conversation/)).toBeVisible();
  await axe(page);
});

test("a learner cannot be trapped, and missed findings stay reachable", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Adopt the tutor as proposed/, "Very");
  // Shortest path: restating and conceding uncovers very little.
  await choose(page, /You have a point/);
  await choose(page, /needs a condition/);
  await passRafael(page);
  await choose(page, /Replace the drop-in as proposed/);
  await expect(page.getByRole("heading", { name: "Not uncovered on this path" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The board asks" })).toBeVisible();
  await expect(page.getByText("You had no answer.").first()).toBeVisible();
  await expect(page.getByText(/It is in the source pack: Wednesday drop-in log/)).toBeVisible();
  await axe(page);
  await page.getByRole("button", { name: "Continue to the argument map" }).click();
  await expect(page.getByRole("heading", { name: "Map the argument" })).toBeVisible();
});

test("private notes are separate from the conversation", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Try it/, "Fairly");
  await page.getByLabel("Private notes").fill("My private thought");
  await choose(page, /What evidence do we have/);
  await expect(page.getByLabel("Private notes")).toHaveValue("My private thought");
  await expect(page.locator("ol").getByText("My private thought")).toHaveCount(0);
});

test("the argument map gives card-level feedback and allows moving cards", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Try it/, "Fairly");
  await choose(page, /You have a point/);
  await choose(page, /needs a condition/);
  await passRafael(page);
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
  await connectAndTest(page);
  await expect(page.getByLabel(/Try it for a limited time/)).toBeVisible();
});

test("the map is the learner's own: connections are checked, and knocking a card out shows what falls", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Try it for a limited time/, "Fairly");
  await choose(page, /What is this proposal assuming/);
  await choose(page, /Check the log/);
  await choose(page, /Then we need to say which needs/);
  await passRafael(page);
  await choose(page, /Recruit volunteers/);
  await page.getByRole("button", { name: "Continue to the argument map" }).click();
  await placeCards(page);
  await page.getByRole("button", { name: "Check my map" }).click();

  // A wrong connection is called out, and can be changed.
  await page.getByRole("button", { name: "Connect the cards" }).click();
  await expect(page.getByRole("heading", { name: "Connect the argument" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Check my connections" })).toBeDisabled();
  for (const select of await page.getByRole("combobox").all()) await select.selectOption({ index: 3 });
  await page.getByRole("button", { name: "Check my connections" }).click();
  await expect(page.getByText(/Reviewed connection/).first()).toBeVisible();
  await page.getByLabel(/caused by the tutor/).selectOption({ label: "A tutor could help learners finish more of their homework." });
  await page.getByLabel(/visits are about homework/).selectOption({ label: "The proposal as a whole" });
  await expect(page.getByRole("button", { name: "Test the argument" })).toHaveCount(0); // a change needs checking again
  await page.getByRole("button", { name: "Check my connections" }).click();
  await page.getByRole("button", { name: "Test the argument" }).click();

  // What came before is on the map.
  await expect(page.getByRole("heading", { name: "Test the argument" })).toBeFocused();
  await expect(page.getByText(/Your position:/)).toBeVisible();
  await expect(page.getByText(/Try it for a limited time/)).toBeVisible();
  await expect(page.getByText(/Recruit volunteers and narrow/)).toBeVisible();
  await expect(page.getByText("You uncovered this in the conversation.").first()).toBeVisible();
  await axe(page);

  // Continuing waits for two tries, and the result follows the learner's own connections.
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
  await page.getByRole("checkbox", { name: /Suppose this is false.*caused by the tutor/ }).check();
  await expect(page.getByText(/This reason falls: A tutor could help learners finish/)).toBeVisible();
  await page.getByRole("checkbox", { name: /Suppose this is false.*caused by the tutor/ }).uncheck();
  await page.getByRole("checkbox", { name: /Suppose this is false.*visits are about homework/ }).check();
  await expect(page.getByText(/The proposal loses its footing/)).toBeVisible();
  await cont(page);
  await expect(page.getByLabel(/Try it for a limited time/)).toBeVisible();
});

test("questions run out, and strategy labels stay hidden until after a choice", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Try it for a limited time/, "Fairly");
  await expect(page.getByText("Questions left before the board meets: 4")).toBeVisible();
  await expect(page.getByRole("button", { name: /Restate your view|Ask for evidence|Concede a point/ })).toHaveCount(0);

  await choose(page, /What evidence do we have/);
  await expect(page.getByText("Questions left before the board meets: 3")).toBeVisible();
  await expect(page.getByText(/\(Ask for evidence\)/)).toBeVisible(); // named once it has been chosen
  await choose(page, /How were the two groups formed/);
  await choose(page, /Were its answers right/);
  await choose(page, /Who sees what learners type/);

  // The last question still gets its answer, and then moving on is the only move.
  await expect(page.getByText(/keep messages for 12 months/).first()).toBeVisible();
  await expect(page.getByText("No questions left before the board meets.")).toBeVisible();
  await expect(page.getByRole("button", { name: /different terms and consent/ })).toHaveCount(0);
  await choose(page, /The board is about to start/);
});

test("catching a misquote takes the right passage, and checking a true claim means accepting it", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Try it for a limited time/, "Fairly");
  await choose(page, /You have a point/);
  await choose(page, /needs a condition/);

  await expect(page.getByText(/Learners using the tutor finished 40% more homework/)).toBeVisible();
  await expect(page.getByText(/questions left/i)).toHaveCount(0); // the counter has done its job by now
  await expect(page.getByText(/You can also reply with evidence/)).toBeVisible();
  await showPassage(page, "brochure-claim");
  await expect(page.getByText(/That passage doesn't settle it/)).toBeVisible();
  await expect(page.getByText(/You showed Brightpath Tutor brochure/)).toBeVisible();

  await showPassage(page, "budget-amount");
  await expect(page.getByText(/You checked it, and it holds/)).toBeVisible();
  await choose(page, /Recruit volunteers/);
  await page.getByRole("button", { name: "Continue to the argument map" }).click();
  await expect(page.getByRole("heading", { name: "Map the argument" })).toBeVisible();
});

test("the right passage gets credit in the debrief, and the free-text notes stay unread", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await completeM05(page);
  await expect(page.getByRole("heading", { name: "What you showed" }).locator("..").getByText(/Checking a claim under pressure/)).toBeVisible();
});

test("the dialogue and map work by keyboard, and focus follows the conversation", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Try it/, "Fairly");

  await page.getByRole("button", { name: /You have a point/ }).focus();
  await page.keyboard.press("Enter");
  // The chosen button has gone, so focus lands on the reply.
  await expect(page.locator("ol li div[tabindex='-1']").last()).toBeFocused();
  await expect(page.locator(":focus")).toContainText("Conceding isn't losing");

  await page.getByRole("button", { name: /needs a condition/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /brochure's figure holds up/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /my argument has to account for it/ }).focus();
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
  await passRafael(page);
  await choose(page, /Recruit volunteers/);
  await expect(page.getByText("Uncovered on the replay:")).toBeVisible();
  await expect(page.getByText("Uncovered on your original path:")).toBeVisible();
  await axe(page);

  // The original path has not moved.
  expect(await page.getByText(/^Decision \d:/).allInnerTexts()).toEqual(originalDecisions);
  await page.getByRole("button", { name: "End this replay" }).click();
  await expect(page.getByRole("heading", { name: /Replay path/ })).toHaveCount(0);
});
