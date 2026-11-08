import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { answerMap, check, choose, completeM05, cont, markAndCheck, pickAndImprove, recordJudgment, revise, showPassage, writeNote } from "./helpers";

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

async function toForge(page: Page, position: RegExp) {
  await page.goto("/missions/m05-argument");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, position, "Fairly");
  await answerMap(page);
}

test("the map asks one question at a time, explains a wrong pick, and fills in only the reviewed answer", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await recordJudgment(page, /Adopt the tutor as proposed/, "Very");

  await expect(page.getByRole("heading", { name: "Take the proposal apart" })).toBeVisible();
  await expect(page.getByText("Proposal to the board: the Wednesday homework drop-in")).toBeVisible();
  await expect(page.getByText("Question 1 of 8")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Back each reason" })).toBeVisible();
  await expect(page.getByRole("region", { name: "The argument map" }).locator("[aria-current='step']")).toContainText("Backed by");
  await expect(page.getByRole("button", { name: "Next question" })).toHaveCount(0);
  await axe(page);

  // The first box under reason 2 waits; a wrong pick for it is explained, and the map keeps it empty.
  await page.getByLabel(/^Drop-in log: 18 learners/).check();
  await check(page);
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Back each reason" })).toBeFocused();
  await page.getByLabel(/^Brochure: students finish homework 40% faster/).check();
  await check(page);
  await expect(page.getByText(/the seller's own claim, and it names no study/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Next question" })).toHaveCount(0);
  await expect(page.getByText(/completion up 13 points/)).toHaveCount(0);

  // A retry with the sound answer fills the map.
  await page.getByLabel(/^Eastfield trial: completion rose/).check();
  await check(page);
  await expect(page.getByText(/Eastfield trial: completion up 13 points/)).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();

  // The next stage points at a step of the argument, not at a box of cards.
  await expect(page.getByRole("heading", { name: "Find what it takes for granted" })).toBeFocused();
  await expect(page.getByRole("region", { name: "The argument map" }).locator("[aria-current='step']")).toContainText("From the evidence to the reason");
  await page.getByLabel(/^The rise came from the tutor/).check();
  await check(page);
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Check it against the sources" })).toBeVisible();
  await page.getByLabel(/^Not settled/).check();
  await check(page);
  await expect(page.getByRole("region", { name: "The argument map" }).locator("[aria-current='step']")).toContainText("Not settled: learners chose for themselves.");
  await axe(page);
});

test("the source pack is open beside the map", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await recordJudgment(page, /Try it/, "Fairly");
  await page.locator("summary", { hasText: "Wednesday drop-in log" }).click();
  await expect(page.getByText(/About a third of visits are for help with forms/)).toBeVisible();
});

test("the finished map says what stands, what is weaker and what is open", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await recordJudgment(page, /Try it/, "Fairly");
  for (const answer of [/^Drop-in log: 18/, /^Eastfield trial: completion rose/, /^The rise came/, /^Not settled/, /^Homework is what/, /^Only partly/, /^That nothing else/, /^Nobody has checked/]) {
    await page.getByLabel(answer).check();
    await check(page);
    await page.getByRole("button", { name: /^(Next question|See what the map shows)$/ }).click();
  }
  await expect(page.getByRole("heading", { name: "What the map shows" })).toBeFocused();
  await expect(page.getByText(/three of the six volunteers really are leaving/)).toBeVisible();
  await expect(page.getByText("Not checked", { exact: true })).toBeVisible();
  await axe(page);
  await cont(page);
  await expect(page.getByRole("heading", { name: "Defend your position" })).toBeVisible();
});

test("the advocate opposes whichever position the learner took, and the replies answer him", async ({ page }) => {
  await toForge(page, /Do not adopt it/);
  await expect(page.getByText(/Saying no is also a decision/)).toBeVisible();
  await expect(page.getByText(/Scripted conversation/)).toBeVisible();
  await expect(page.getByRole("button", { name: /recruit volunteers and narrow the sessions/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /stop rule/ })).toHaveCount(0);
  await expect(page.getByText(/Questions left/)).toHaveCount(0);
  await axe(page);

  await page.goto("/missions/m05-argument");
  await cont(page);
  await recordJudgment(page, /Adopt the tutor as proposed/, "Fairly");
  await answerMap(page);
  await expect(page.getByText(/7 wrong maths answers out of 50/)).toBeVisible();
  await choose(page, /Where does that figure come from/);
  await expect(page.getByText(/Eastfield's own trial report/)).toBeVisible();
  await choose(page, /A volunteer would have to spot-check/);
  await expect(page.getByText(/40% more homework/)).toBeVisible();
});

test("private notes are separate from the conversation", async ({ page }) => {
  await toForge(page, /Try it/);
  await page.getByLabel("Private notes").fill("My private thought");
  await choose(page, /set the stop rule now/);
  await expect(page.getByLabel("Private notes")).toHaveValue("My private thought");
  await expect(page.locator("ol").getByText("My private thought")).toHaveCount(0);
});

test("catching a misquote takes the right passage, and checking a true claim means accepting it", async ({ page }) => {
  await toForge(page, /Try it for a limited time/);
  await choose(page, /We'll see how it goes/);

  await expect(page.getByText(/Learners using the tutor finished 40% more homework/)).toBeVisible();
  await expect(page.getByText(/You can also reply with evidence/)).toBeVisible();
  await choose(page, /Where in the report/);
  await expect(page.getByText(/Look it up if you don't believe me/)).toBeVisible();
  await showPassage(page, "brochure-claim");
  await expect(page.getByText(/That passage doesn't settle it/)).toBeVisible();
  await expect(page.getByText(/You showed Brightpath Tutor brochure/)).toBeVisible();

  await showPassage(page, "budget-amount");
  await expect(page.getByText(/You checked it, and it holds/)).toBeVisible();
  await expect(page.getByText(/tutor or nothing/)).toBeVisible();
  await choose(page, /Recruit volunteers/);
  await page.getByRole("button", { name: "Continue to your final position" }).click();
  await expect(page.getByLabel(/Try it for a limited time/)).toBeVisible();
});

test("the right passage gets credit in the debrief and at the board meeting", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await completeM05(page);
  await expect(page.getByRole("heading", { name: "What you showed" }).locator("..").getByText(/Answering objections/)).toBeVisible();
});

test("the map and dialogue work by keyboard, and focus follows them", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await cont(page);
  await recordJudgment(page, /Try it/, "Fairly");

  await page.getByLabel(/^Drop-in log: 18 learners/).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Check my answer" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Next question" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Back each reason" })).toBeFocused();
  await expect(page.getByText("Question 2 of 8")).toBeVisible();

  await page.goto("/missions/m05-argument");
  await cont(page);
  await recordJudgment(page, /Try it/, "Fairly");
  await answerMap(page);
  await page.getByRole("button", { name: /set the stop rule now/ }).focus();
  await page.keyboard.press("Enter");
  // The chosen button has gone, so focus lands on the reply.
  await expect(page.locator("ol li div[tabindex='-1']").last()).toBeFocused();
  await expect(page.locator(":focus")).toContainText("Eastfield backs the brochure");
});

test("replaying a decision shows another path and leaves the original alone", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await completeM05(page);

  const originalDecisions = await page.getByText(/^Decision \d:/).allInnerTexts();
  expect(originalDecisions.length).toBe(4);
  await page.getByRole("button", { name: /Try another choice here.*Decision 1/ }).click();
  await expect(page.getByRole("heading", { name: /Replay path/ })).toBeVisible();
  await choose(page, /We'll see how it goes/);
  await choose(page, /brochure's figure holds up/);
  await choose(page, /You would say that/);
  await choose(page, /Recruit volunteers/);
  await axe(page);

  // The original path has not moved.
  expect(await page.getByText(/^Decision \d:/).allInnerTexts()).toEqual(originalDecisions);
  await page.getByRole("button", { name: "End this replay" }).click();
  await expect(page.getByRole("heading", { name: /Replay path/ })).toHaveCount(0);
});

test("the board meeting follows what the learner did with Rafael's claims", async ({ page }) => {
  await toForge(page, /Do not adopt it/);
  await choose(page, /recruit volunteers and narrow the sessions/);
  await choose(page, /brochure's figure holds up/);
  await choose(page, /You would say that/);
  await choose(page, /Recruit volunteers/);
  await page.getByRole("button", { name: "Continue to your final position" }).click();
  await revise(page, /Do not adopt it/, "Fairly");
  await writeNote(page, [
    [/^Your position/, "Keep the drop-in"],
    [/^The strongest evidence/, "A third of visits"],
    [/^The strongest objection/, "Volunteers leaving"],
    [/^What would change your mind/, "No recruits by January"],
  ]);
  await markAndCheck(page, [/have a smartphone/, /will serve everyone/]);
  await pickAndImprove(page, /answers at any hour and on every route/, "Records of desk visits");

  await expect(page.getByRole("heading", { name: "Thursday's board meeting" })).toBeVisible();
  await expect(page.getByText(/kept the drop-in and narrowed it/)).toBeVisible();
  await expect(page.getByText(/went into the minutes as Eastfield's finding/)).toBeVisible();
  await expect(page.getByText(/Your case hadn't mentioned it/)).toBeVisible();
  await axe(page);
});
