import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { auditClaim, cont, firstRead, markAndCheck, narrow } from "./helpers";

test("M04: first read, claim feedback, a learner-made briefing, and a decision with consequences", async ({ page }) => {
  await page.goto("/missions/m04-evidence");
  await cont(page); // brief, with the refresher folded in

  // No source is open yet, and starting needs a first read of every claim.
  await expect(page.getByRole("heading", { name: "Source pack" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start checking" })).toBeDisabled();
  await expect(page.getByText(/Evidence here means/)).toHaveCount(0); // no coaching before the first read
  await firstRead(page, "I would rely on it");
  await expect(page.getByText(/Evidence here means/)).toBeVisible();

  // Wrong on the first try: a real citation that does not support its claim.
  await auditClaim(page, /Research shows/, { passage: "survey-scope", status: "Supported", action: "Retain" });
  await expect(page.getByText(/Evidence: Look again/)).toBeVisible();
  await expect(page.getByText("Reviewed answer: Unsupported.")).toBeVisible();
  await expect(page.getByText(/A citation is a place to look/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // A fix has to be written: checking waits for the blanks, and a wrong one is called out.
  await auditClaim(page, /Research shows/, { passage: "review-finding", status: "Unsupported", action: "Correct", repair: ["higher grades", "grades"] });
  await expect(page.getByText(/Your fix: Look again/)).toBeVisible();
  await page.getByRole("radio", { name: /^Correct/ }).check();
  await page.getByLabel("Blank 1", { exact: true }).selectOption("time spent on homework");
  await page.getByRole("button", { name: "Check this claim" }).click();
  await expect(page.getByText(/Your fix: Fits/)).toBeVisible();

  // A defensible judgment is not marked as an error.
  await auditClaim(page, /Three-quarters/, { passage: "survey-result", status: "Misleading", action: "Correct", repair: ["63", "210", "48"] });
  await expect(page.getByText(/Decision: Defensible/)).toBeVisible();

  // The figure has to be worked out, and a wrong one is called out.
  await auditClaim(page, /Attendance averaged/, { passage: "attendance-avg", calc: "50", status: "Supported", action: "Retain" });
  await expect(page.getByText(/Your figure: Look again/)).toBeVisible();

  // Left in as written, so it should have a consequence later.
  await auditClaim(page, /funds the programme/, { passage: "trust-2026-amount", status: "Supported", action: "Retain" });
  await auditClaim(page, /repeatedly asked/, { status: "Unsupported", action: "Remove" });
  await auditClaim(page, /can staff a second/, { passage: "volunteers-capacity", status: "Incorrect", action: "Correct", repair: ["Five", "month"] });
  await expect(page.getByRole("button", { name: "See the final briefing" })).toHaveCount(0); // one claim left
  await auditClaim(page, /Tuesday trial/, { passage: "attendance-tuesday", status: "Supported", action: "Retain" });

  await page.getByRole("button", { name: "See the final briefing" }).click();
  await expect(page.getByRole("heading", { name: "Your finished text" })).toBeFocused();
  await expect(page.getByText(/€12,000 for 2026–27/)).toBeVisible(); // the reviewed version
  await expect(page.getByText(/funds the programme with €18,000/).first()).toBeVisible(); // the learner's own error is still there
  await expect(page.getByText(/You would have relied on 7 claims, and 5 of those did not hold up/)).toBeVisible();

  await page.getByRole("button", { name: "Make the decision" }).click();
  await expect(page.getByRole("heading", { name: "Use your briefing" })).toBeFocused();
  await expect(page.getByText(/The board budgeted on €18,000/)).toBeVisible();
  await expect(page.getByText(/explain that nobody had agreed/)).toHaveCount(0); // that one was fixed
  await page.getByLabel(/Add a weekly Tuesday session/).check();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await expect(page.getByText(/the rota runs out within weeks/)).toBeVisible();
  await page.getByLabel(/Run one extra session a month/).check();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await cont(page);

  // Independent: find the claims, no hints, and no feedback until the whole audit goes in.
  await expect(page.getByRole("button", { name: "Need a hint?" })).toHaveCount(0);
  await markAndCheck(page, [/Repair café visits doubled/, /repair volunteers doubled/, /largest repair café/], "Audit the claims");
  await expect(page.getByRole("button", { name: "Submit the audit" })).toHaveCount(0);
  await auditClaim(page, /Repair café visits doubled/, { passage: "report-visits", calc: "41", status: "Incorrect", action: "Correct", repair: ["290", "410", "41"], reason: "Written before feedback.", independent: true });
  await expect(page.getByText(/Evidence: Fits/)).toHaveCount(0);
  await auditClaim(page, /repair volunteers doubled/, { passage: "report-volunteers", status: "Supported", action: "Retain", independent: true });
  await auditClaim(page, /largest repair café/, { status: "Unsupported", action: "Remove", independent: true });
  await page.getByRole("button", { name: "Submit the audit" }).click();
  await expect(page.getByText(/Evidence: Fits/)).toBeVisible();
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await cont(page);

  // The reason from before the feedback comes back unchanged.
  await page.getByRole("button", { name: "Skip the practice" }).click();
  await expect(page.getByText("Written before feedback.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip writing and see the criteria" })).toHaveCount(0);
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await page.getByLabel(/Says what an accurate version would state/).selectOption({ index: 1 });
  await cont(page);

  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your own assessment" })).toBeVisible();
  await expect(page.getByText("you pointed to a sentence for 1 of 3 criteria")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Worth another look" }).locator("..").getByText("Working out a figure instead of trusting it")).toBeVisible();
});

test("finding claims does not depend on being right, and every claim is still available to audit", async ({ page }) => {
  await page.goto("/missions/t01-transfer");
  await cont(page); // brief, with the refresher folded in
  await page.getByRole("button", { name: /Everyone at the Commons can be proud/ }).click();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await expect(page.getByText("You marked 0 of 6, and 1 that does not belong.")).toBeVisible();
  await page.getByRole("button", { name: "Audit the claims" }).click();
  await firstRead(page, "I would check it first");
  await expect(page.getByRole("button", { name: /enrolled 48 people/ })).toBeAttached();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("claims and sources work by keyboard", async ({ page }) => {
  await page.goto("/missions/m04-evidence");
  await cont(page); // brief, with the refresher folded in
  await firstRead(page, "Not sure");

  if (narrow(page)) await page.getByRole("button", { name: "Briefing", exact: true }).click();
  const claim = page.getByRole("button", { name: /Attendance averaged/ });
  await claim.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Selected claim")).toBeAttached();
  if (narrow(page)) {
    // The claim's view has gone, so focus must land on the judgment panel rather than be lost.
    await expect(page.getByRole("region", { name: "Your judgment" })).toBeFocused();
  } else {
    await expect(claim).toBeFocused();
  }
});

test("selections survive switching views, and the audit survives leaving the page", async ({ page }) => {
  await page.goto("/missions/m04-evidence");
  await cont(page); // brief, with the refresher folded in
  await firstRead(page, "Not sure");

  await auditClaim(page, /Attendance averaged/, { passage: "attendance-avg", calc: "31", status: "Supported", action: "Retain" });
  await page.getByRole("link", { name: "Mission map" }).click();
  await page.getByRole("link", { name: /Open mission.*The Evidence Bureau/ }).click();
  await expect(page.getByText("Claims checked: 1 of 7")).toBeAttached();
  if (narrow(page)) await page.getByRole("button", { name: "Briefing", exact: true }).click();
  await expect(page.getByText("Claims checked: 1 of 7")).toBeVisible();
});
