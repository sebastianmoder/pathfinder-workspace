import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { assignRoles, check, completeB01, completeB03, completeC01Evidence, completeC01Review, completeC01Scope, completeC01Workflow, cont, recordJudgment } from "./helpers";

test("B01, the stage 1 bridge, is completable and leads into stage 2", async ({ page }) => {
  await page.goto("/missions/b01-faq");
  await expect(page.getByRole("button", { name: "Need a hint?" })).toHaveCount(0);
  await completeB01(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Evidence Bureau/ })).toBeVisible();
  await expect(page.getByText(/Choosing roles for AI across a project/)).toBeVisible();
});

test("B01 branches: drafts that went out unchecked come back as a complaint to put right", async ({ page }) => {
  await page.goto("/missions/b01-faq");
  await cont(page);
  await recordJudgment(page, /Ask it for the whole FAQ/);
  await assignRoles(page, [
    ["Find the most common questions", "AI-assisted"],
    ["Draft the answers", "Supervised automation"],
    ["Decide the refund policy wording", "Human-led"],
  ]);
  await cont(page);
  await expect(page.getByText(/There is no café/)).toBeVisible();
  await page.getByLabel(/Reply that the AI wrote that answer/).check();
  await check(page);
  await expect(page.getByText(/The Commons published it, so the Commons answers for it/)).toBeVisible();
  await page.getByLabel(/Fix the page, tell Marta/).check();
  await check(page);
  await cont(page);
  await expect(page.getByRole("heading", { name: "Brief one answer" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("B03, the stage 3 bridge, is completable and leads into stage 4", async ({ page }) => {
  await page.goto("/missions/b03-report");
  await completeB03(page);
  await expect(page.getByRole("heading", { name: /Recommended next mission: The Systems Workshop/ })).toBeVisible();
});

test("C01 runs through all four chapters, and the last one ends the journey", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/missions/c01-scope");
  await completeC01Scope(page);
  await page.getByRole("link", { name: "The Commission, chapter 2: evidence", exact: true }).click();
  // The dossier carries chapter 1's decisions into chapter 2, and shows the case pack for what isn't done yet.
  const dossier = page.locator("details.dossier").locator("visible=true"); // the previous chapter's page stays in the DOM, hidden
  await expect(dossier.getByText("1 of 4 chapters from your work this visit")).toBeVisible();
  await expect(dossier).not.toHaveAttribute("open"); // folded, so the brief comes first
  await dossier.locator("summary").click();
  const scope = dossier.getByRole("listitem").filter({ hasText: "Chapter 1: what the service may do" });
  await expect(scope.getByText("From your work this visit")).toBeVisible();
  await expect(scope.getByText("Answer questions about courses: Supervised automation")).toBeVisible();
  await expect(dossier.getByRole("listitem").filter({ hasText: "Chapter 3: how the service is set up" }).getByText("From the case pack")).toBeVisible();
  await completeC01Evidence(page);
  await page.getByRole("link", { name: "The Commission, chapter 3: workflow", exact: true }).click();
  await completeC01Workflow(page);
  await page.getByRole("link", { name: "The Commission, chapter 4: the review meeting", exact: true }).click();
  await completeC01Review(page);
  await expect(page.getByText(/You have completed the currently available journey/)).toBeVisible();
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0); // the debrief shows no written answers
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // The map shows the capstone's chapters and marks it done only now.
  await page.getByRole("navigation").getByRole("link", { name: "Mission map", exact: true }).click();
  const capstone = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "The ARTISAN Commission" }) });
  await expect(capstone.getByText("done this visit")).toHaveCount(4);
  await expect(capstone.getByText("Completed this visit")).toBeVisible();
});

test("a capstone chapter opens on its own from its password, with its case pack", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/continue");
  await page.getByLabel("Mission password").fill("osprey charter 87");
  await page.getByRole("button", { name: "Find mission" }).click();
  await page.getByRole("link", { name: "Start mission" }).click();
  await expect(page).toHaveURL(/\/missions\/c01-review$/);
  await expect(page.getByText(/about 90% of answers were correct overall/)).toBeVisible();
  await context.close();
});
