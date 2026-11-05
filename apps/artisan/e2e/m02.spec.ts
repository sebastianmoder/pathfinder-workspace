import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { assignRoles, check, completeM02, cont, M02_DESK, M02_TRANSFER, recordJudgment } from "./helpers";

test("M02 is completable end to end and recommends the next mission", async ({ page }) => {
  await page.goto("/missions/m02-delegation");
  await completeM02(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Briefing Studio/ })).toBeVisible();
  await expect(page.getByText("ROWAN-LEDGER-63").first()).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Recognising when not to use AI")).toBeVisible();

  // The debrief offers another path through the desk, labelled so it is never mistaken for the learner's own.
  await page.getByText("Try another path: Triage the inbox").click();
  const replay = page.locator("details", { hasText: "Try another path: Triage the inbox" });
  await expect(replay.getByText(/Your roles as you chose them/)).toBeVisible();
  await expect(replay.getByText("You chose: Human-led").first()).toBeVisible();
  await expect(shown.getByText("Relying on AI where a mistake is cheap to fix")).toBeVisible();
  await expect(shown.getByText("Choosing roles for AI in a new setting, without hints")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("the desk reveals nothing before sending, then shows outcomes, responsibility and labelled alternatives", async ({ page }) => {
  await page.goto("/missions/m02-delegation");
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Yes, but a person reads and approves/);

  // Sending waits until every task has a role, and no verdict or outcome is visible beforehand.
  const send = page.getByRole("button", { name: "Send the assignments" });
  await expect(send).toBeDisabled();
  await expect(page.getByText(/Fits the case|Weaker fit/)).toHaveCount(0);
  await expect(page.getByText(/Three weeks into term/)).toHaveCount(0);

  // Trade-offs are in words and hints are on request, both reachable without hovering.
  await page.getByText("What to weigh").first().click();
  await expect(page.getByText(/A refused applicant may not be able to afford/)).toBeVisible();
  await page.getByRole("button", { name: /Need a hint\? ?: Award the hardship bursaries/ }).click();
  await expect(page.getByText(/is speed really the problem/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Keeping AI out of the reminders is reviewed as weaker: caution is not automatically right.
  const roles = M02_DESK.map(([title, role]): [string, string] => [title, title === "Send booking reminders" ? "Human-led" : role]);
  // The first batch only: its outcomes come back before the next requests arrive.
  await expect(page.getByRole("group", { name: /Role for: Reply to a parent's complaint/ })).toHaveCount(0);
  await assignRoles(page, roles.slice(0, 3));
  await expect(page.getByRole("heading", { name: "Three weeks into term" })).toBeFocused();
  await expect(page.getByText(/2 of 3 roles you chose held up/)).toBeVisible();
  await expect(page.getByText(/Sam typed every reminder/)).toBeVisible();
  await expect(page.getByText(/Keeping AI out is not automatically the safe choice/)).toBeVisible();
  await expect(page.getByText(/Sam, who runs the bookings, answers for the reminders/)).toBeVisible();

  // Replaying another role is shown as an alternative, never as the learner's own outcome.
  await page.getByRole("button", { name: /^Supervised automation ?: Send booking reminders$/ }).click();
  await expect(page.getByText("If you had chosen Supervised automation")).toBeVisible();
  await expect(page.getByText("Not your choice. Shown so you can compare.")).toBeVisible();
  await expect(page.getByText(/360 reminders went out/)).toBeVisible();
  const reminders = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Send booking reminders" }) });
  await expect(reminders.getByText("You chose: Human-led")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // The next batch opens with what the first one led to.
  await page.getByRole("button", { name: "Open the next requests" }).click();
  await expect(page.getByRole("heading", { name: "New requests" })).toBeFocused();
  await expect(page.getByText(/Sam is still typing every booking reminder by hand/)).toBeVisible();
  await expect(page.getByText(/Refused bursary applicants/)).toHaveCount(0); // the bursaries went to a person
  await assignRoles(page, roles.slice(3));
  await expect(page.getByRole("heading", { name: "By the end of term" })).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await cont(page);

  await page.getByLabel(/Nobody in particular/).check();
  await check(page);
  await page.getByLabel(/Sam, who runs bookings/).check();
  await check(page);
  await cont(page);

  await page.getByLabel(/a wrong refusal is costly/).check();
  await expect(page.getByLabel("Fairly", { exact: true })).toHaveCount(0); // confidence is asked only where it is the point
  await check(page);
  await cont(page);

  // Instructions for an activity already done this visit are folded, and still open on request.
  await expect(page.getByText("(you've done one like this already)")).toBeVisible();

  // The transfer desk fades support: no trade-offs, no hints.
  await expect(page.getByText("No trade-offs or hints this time.", { exact: false })).toBeVisible();
  await expect(page.getByText("What to weigh")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Need a hint/ })).toHaveCount(0);
  await assignRoles(page, M02_TRANSFER);
  await cont(page);

  await page.getByRole("button", { name: "Skip the practice" }).click();
  await page.getByRole("button", { name: "Skip writing and see the criteria" }).click();
  await cont(page);

  // The weaker first choice is not credited, and a hint is help rather than failure.
  const review = page.getByRole("heading", { name: "Worth another look" }).locator("..");
  await expect(review.getByText("Relying on AI where a mistake is cheap to fix")).toBeVisible();
  await expect(review.getByText("Saying who stays responsible when AI does the work")).toBeVisible();
  const shown = page.getByRole("heading", { name: "What you showed" }).locator("..");
  await expect(shown.getByText("Recognising when not to use AI")).toBeVisible();

  await page.reload();
  await expect(page.getByText(/^Step 1 of/)).toBeVisible();
});
