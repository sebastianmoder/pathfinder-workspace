import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { auditClaim, narrow } from "./helpers";


test("M04 is completable, with claim-level feedback and a real before/after", async ({ page }) => {
  await page.goto("/missions/m04-evidence");
  const cont = () => page.getByRole("button", { name: "Continue", exact: true }).click();
  await cont();
  await cont();

  await page.getByLabel(/Quite far/).check();
  await page.getByLabel("Very", { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await expect(page.getByText("Weaker fit")).toHaveCount(0);
  await cont();

  // Wrong on the first try: a real citation that does not support its claim.
  await auditClaim(page, /Research shows/, { passage: "survey-scope", status: "Supported", action: "Retain" });
  await expect(page.getByText(/Evidence: Look again/)).toBeVisible();
  await expect(page.getByText("Reviewed answer: Unsupported.")).toBeVisible();
  await expect(page.getByText(/A citation is a place to look/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Retry on the same claim, then see it accepted.
  await auditClaim(page, /Research shows/, { passage: "review-finding", status: "Unsupported", action: "Correct" });
  await expect(page.getByText(/Evidence: Fits/)).toBeVisible();

  // Defensible judgment is not marked as an error.
  await auditClaim(page, /Three-quarters/, { passage: "survey-result", status: "Misleading", action: "Correct" });
  await expect(page.getByText(/Decision: Defensible/)).toBeVisible();

  await auditClaim(page, /Attendance averaged/, { passage: "attendance-avg", status: "Supported", action: "Retain" });
  await auditClaim(page, /about 30% higher/, { passage: "attendance-avg", status: "Supported", action: "Retain" });
  await auditClaim(page, /funds the programme/, { passage: "trust-2026-amount", status: "Outdated", action: "Correct" });
  await auditClaim(page, /repeatedly asked/, { status: "Unsupported", action: "Remove" });
  await auditClaim(page, /can staff a second/, { passage: "volunteers-capacity", status: "Incorrect", action: "Correct" });
  await expect(page.getByRole("button", { name: "See the final briefing" })).toHaveCount(0); // one claim left
  await auditClaim(page, /Tuesday trial/, { passage: "attendance-tuesday", status: "Supported", action: "Retain" });

  await page.getByRole("button", { name: "See the final briefing" }).click();
  await expect(page.getByRole("heading", { name: "The final briefing" })).toBeFocused();
  await expect(page.getByText("€12,000 for 2026–27")).toBeVisible();
  await cont();

  await page.getByLabel(/does not say what the claim says/).check();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await cont();

  // The first answer is still on record, unchanged by anything since.
  await expect(page.getByText(/Your first answer:.*Quite far.*\(Very\)/)).toBeVisible();
  await page.getByLabel(/It tells me where to look/).check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await expect(page.getByText(/Very at the start, Fairly now/)).toBeVisible();
  await cont();

  // Transfer: no hints, different case; the wrong "doubled" passage is a plausible trap.
  await expect(page.getByRole("button", { name: "Need a hint?" })).toHaveCount(0);
  await auditClaim(page, /Repair café visits doubled/, { passage: "report-visits", status: "Incorrect", action: "Correct" });
  await cont();

  await page.getByRole("button", { name: "Skip writing and see the criteria" }).click();
  await cont();

  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
});

test("claims and sources work by keyboard", async ({ page }) => {
  await page.goto("/missions/m04-evidence");
  const cont = () => page.getByRole("button", { name: "Continue", exact: true }).click();
  await cont();
  await cont();
  await page.getByLabel(/It tells me where to look/).check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await cont();

  const claim = page.getByRole("button", { name: /Attendance averaged/ });
  await claim.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Selected claim")).toBeVisible();
  if (narrow(page)) {
    // The claim's view has gone, so focus must land on the judgment panel rather than be lost.
    await expect(page.getByRole("region", { name: "Your judgment" })).toBeFocused();
  } else {
    await expect(claim).toBeFocused();
  }
});

test("selections survive switching views, and the audit survives leaving the page", async ({ page }) => {
  await page.goto("/missions/m04-evidence");
  const cont = () => page.getByRole("button", { name: "Continue", exact: true }).click();
  await cont();
  await cont();
  await page.getByLabel(/It tells me where to look/).check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await cont();

  await auditClaim(page, /Attendance averaged/, { passage: "attendance-avg", status: "Supported", action: "Retain" });
  await page.getByRole("link", { name: "Mission map" }).click();
  await page.getByRole("link", { name: /Open mission.*The Evidence Bureau/ }).click();
  await expect(page.getByText("Claims checked: 1 of 8")).toBeAttached();
  if (narrow(page)) await page.getByRole("button", { name: "Briefing", exact: true }).click();
  await expect(page.getByText("Claims checked: 1 of 8")).toBeVisible();
});
