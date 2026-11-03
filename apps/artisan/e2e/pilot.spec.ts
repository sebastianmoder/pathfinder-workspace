import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../content/missions";
import { passwords } from "../content/passwords";
import { modules } from "../content/journey";
import {
  completeB01, completeB03, completeC01Evidence, completeC01Review, completeC01Scope, completeC01Workflow,
  completeM01, completeM02, completeM03, completeM04, completeM05, completeM06Gym, completeM06Teach, completeM07,
  completeM08, completeM09, completeM10, completeM11, completeM12, completeM13, completeT01,
} from "./helpers";

const ROUTES = ["/", "/start", "/map", "/continue", "/summary", ...missions.map((m) => `/missions/${m.id}`)];

test("criterion 1: a new learner completes the whole journey, from the welcome page to the capstone, with no account", async ({ page, context }) => {
  test.setTimeout(300_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("link", { name: "Start", exact: true }).click();

  // P0, answered but unmarked.
  await page.getByLabel("Open the source and read the relevant part").check();
  await expect(page.getByText(/Weaker|Fits the case/)).toHaveCount(0);
  await page.getByRole("link", { name: "Start the first mission" }).click();

  await completeM01(page);
  await page.getByRole("link", { name: "The Delegation Desk", exact: true }).click();
  await completeM02(page);
  await page.getByRole("link", { name: "The Briefing Studio", exact: true }).click();
  await completeM03(page);
  await page.getByRole("link", { name: "The FAQ Project", exact: true }).click();
  await completeB01(page);
  await page.getByRole("link", { name: "The Evidence Bureau", exact: true }).click();
  await completeM04(page);
  await page.getByRole("link", { name: "The Argument Forge", exact: true }).click();
  await completeM05(page);
  await page.getByRole("link", { name: "The Thinking Gym: learning with help", exact: true }).click();
  await completeM06Gym(page);
  await page.getByRole("link", { name: "The Thinking Gym: teach it back", exact: true }).click();
  await completeM06Teach(page);
  await page.getByRole("link", { name: "The Numbers Lab", exact: true }).click();
  await completeM07(page);
  await page.getByRole("link", { name: "The Newsletter Desk", exact: true }).click();
  await completeT01(page);
  await page.getByRole("link", { name: "The Newsroom", exact: true }).click();
  await completeM08(page);
  await page.getByRole("link", { name: "The Fairness Council", exact: true }).click();
  await completeM09(page);
  await page.getByRole("link", { name: "The Boundary Room", exact: true }).click();
  await completeM10(page);
  await page.getByRole("link", { name: "The Co-Creation Studio", exact: true }).click();
  await completeM11(page);
  await page.getByRole("link", { name: "The Annual Report", exact: true }).click();
  await completeB03(page);
  await page.getByRole("link", { name: "The Systems Workshop", exact: true }).click();
  await completeM12(page);
  await page.getByRole("link", { name: "The Citizens' Assembly", exact: true }).click();
  await completeM13(page);
  for (const [title, complete] of [
    ["The Commission, chapter 1: scope", completeC01Scope],
    ["The Commission, chapter 2: evidence", completeC01Evidence],
    ["The Commission, chapter 3: workflow", completeC01Workflow],
    ["The Commission, chapter 4: the review meeting", completeC01Review],
  ] as const) {
    await page.getByRole("link", { name: title, exact: true }).click();
    await complete(page);
  }

  // End of the available journey: no next password is issued.
  await expect(page.getByText(/You have completed the currently available journey/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Recommended next mission/ })).toHaveCount(0);

  // P5.
  await page.getByRole("link", { name: "See your session summary" }).click();
  await expect(page.locator("strong", { hasText: "Open the source and read the relevant part" })).toBeVisible();
  await expect(page.getByText(/It is probably correct.*\(Very\)/)).toBeVisible();
  await expect(page.getByText(/It tells me little; I need evidence\. \(Somewhat\)/)).toBeVisible();
  for (const { code } of passwords)
    await expect(page.locator("li").getByText(code).locator("visible=true")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // What it says it contains is what it contains: no written answers on the page or when copied.
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
  await page.getByRole("button", { name: "Copy summary" }).click();
  await expect(page.getByText("Summary copied")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("BIRCH-HARBOUR-58");
  expect(copied).toContain("It tells me little; I need evidence. (Somewhat)");
  expect(copied).not.toContain("PRIVATE-");
  expect(copied).toContain("You would have relied on 7 claims"); // M04's first read, against the evidence
  // No score for the learner. (M09 is about a screening tool's score, so the word alone is fine.)
  expect(copied).not.toMatch(/\byour score\b|\bscore:|\bpoints\b|\/\s?100\b/i);
  expect(copied).not.toMatch(/demonstrated/i); // finishing a mission is not proof of a skill

  // Printing keeps the content and drops the controls.
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Copy summary" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Your session summary" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  await page.emulateMedia({ media: "screen" });

  // The map shows what this visit completed, and only for this visit.
  await page.getByRole("link", { name: "Mission map", exact: true }).click();
  await expect(page.getByText("Completed this visit")).toHaveCount(modules.filter((m) => m.status === "available").length);
});

test("criterion 1: the starting questions can be skipped", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("link", { name: "Skip these questions" }).click();
  await expect(page.getByRole("heading", { name: "Inside the Machine" })).toBeVisible();
});

// Each code is typed differently, as learners do: case, spaces and separators are ignored.
const variants = [(c: string) => c, (c: string) => c.toLowerCase().replace(/-/g, " "), (c: string) => c.replace(/-/g, ""), (c: string) => c.toLowerCase()];
for (const [i, { code: published, missionId: id }] of passwords.entries()) {
  const mission = missions.find((m) => m.id === id)!;
  const title = mission.title;
  const second = mission.steps[1];
  const secondHeading = "title" in second ? second.title : "";
  const code = variants[i % variants.length](published);
  test(`criteria 2, 6, 7: ${title} opens from its password in a fresh browser, claiming no history`, async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/continue");
    await page.getByLabel("Mission password").fill(code);
    await page.getByRole("button", { name: "Find mission" }).click();
    await expect(page.getByText(`This password opens: ${title}`)).toBeVisible();
    await page.getByRole("link", { name: "Start mission" }).click();
    await expect(page).toHaveURL(new RegExp(`/missions/${id}$`));
    await expect(page.getByText(/^Step 1 of/)).toBeVisible();
    await expect(page.getByRole("heading", { name: secondHeading })).toHaveCount(0);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("heading", { name: secondHeading })).toBeVisible();

    // Nothing was inferred from the password.
    await page.getByRole("link", { name: "Mission map", exact: true }).click();
    await expect(page.getByText("Completed this visit")).toHaveCount(0);
    await context.close();
  });
}

test("criterion 9: refreshing mid-activity gives a clear restart on every mission", async ({ page }) => {
  test.setTimeout(120_000);
  for (const { id } of missions) {
    await page.goto(`/missions/${id}`);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.reload();
    await expect(page.getByText(/^Step 1 of/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your task" })).toBeVisible();
  }
});

test("Pause explains that a refresh also restarts", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText(/ALDER-THIMBLE-26/).first()).toBeVisible();
  await expect(page.getByText(/your earlier answers are not saved/)).toBeVisible();
  await expect(page.getByText(/Refreshing the page or closing this tab/)).toBeVisible();

  // Printing from Pause prints the password, not the mission behind it.
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("dialog").locator("p.font-mono")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Argument Forge" })).toBeHidden();
  await page.emulateMedia({ media: "screen" });
});

for (const route of ROUTES) {
  test(`criterion 8: ${route} has no axe violations in dark mode or page-level overflow`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.goto(route);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("criterion 10: the pilot makes no requests to outside services", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://localhost:3100") && !r.url().startsWith("data:")) external.push(r.url());
  });
  await page.goto("/missions/m05-argument");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.goto("/summary");
  expect(external).toEqual([]);
});

test("regression: pages kept alive in the background do not interfere with the visible one", async ({ page }) => {
  // M01 and M04 share step ids ("initial", "explain"), and the orientation shares "citation" with M04.
  await page.goto("/start");
  await page.getByLabel("Open the source and read the relevant part").check();
  await page.getByRole("link", { name: "Mission map", exact: true }).click();
  await page.getByRole("link", { name: /Open mission.*Inside the Machine/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel(/It is probably correct/).check();

  await page.getByRole("link", { name: "Mission map", exact: true }).click();
  await page.getByRole("link", { name: /Open mission.*The Evidence Bureau/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const answer = page.getByRole("group", { name: /Attendance averaged/ }).getByRole("radio", { name: "Not sure" });
  await answer.check();
  await expect(answer).toBeChecked();

  // Back in M01, the earlier selection is intact, and ids in the document are unique.
  await page.getByRole("link", { name: "Mission map", exact: true }).click();
  await page.getByRole("link", { name: /Open mission.*Inside the Machine/ }).click();
  await expect(page.getByLabel(/It is probably correct/)).toBeChecked();
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(duplicates).toEqual([]);
});

test("Help reminds the learner of the method without losing their place", async ({ page }) => {
  await page.goto("/missions/t01-transfer");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText(/^Step 3 of/)).toBeVisible();
  await page.getByRole("button", { name: "Help", exact: true }).click();
  await expect(page.getByRole("dialog").getByText(/Find the passage that bears on each claim/)).toBeVisible();
  await page.getByRole("button", { name: "Back to the mission" }).click();
  await expect(page.getByText(/^Step 3 of/)).toBeVisible();
});

test("the welcome page offers a real judgment before any explanation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/about 8%/)).toHaveCount(0);
  await page.getByRole("button", { name: "It does not" }).click();
  await expect(page.getByText(/about 8%/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

