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
  await expect(shown.getByText("Relying on AI where a mistake is cheap to fix")).toBeVisible();
  await expect(shown.getByText("Choosing roles for AI in a new setting, without hints")).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("the desk reveals nothing before sending, then shows outcomes, responsibility and labelled alternatives", async ({ page }) => {
  await page.goto("/missions/m02-delegation");
  await cont(page);
  await cont(page);
  await recordJudgment(page, /What a mistake would cost/, "Fairly");

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
  await assignRoles(page, roles);
  await expect(page.getByRole("heading", { name: "Three weeks into term" })).toBeFocused();
  await expect(page.getByText(/5 of 6 roles you chose held up/)).toBeVisible();
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
  await cont(page);

  await page.getByLabel(/Nobody in particular/).check();
  await check(page);
  await page.getByLabel(/Sam, who runs bookings/).check();
  await check(page);
  await cont(page);

  await page.getByLabel(/What a mistake would cost/).check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await check(page);
  await cont(page);

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
