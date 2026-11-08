import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../content/missions";
import { modules } from "../content/journey";
import {
  completeB01, completeB03, completeC01Evidence, completeC01Review, completeC01Scope, completeC01Workflow,
  completeM01, completeM02, completeM03, completeM04, completeM05, completeM06Gym, completeM06Teach, completeM07,
  completeM08, completeM09, completeM10, completeM11, completeM12, completeM13, completeT01, cont, openFromMap,
} from "./helpers";

const ROUTES = ["/", "/map", "/summary", ...missions.map((m) => `/missions/${m.id}`)];

test("criterion 1: a new learner completes the whole journey, from the welcome page to the capstone, with no account", async ({ page, context }) => {
  test.setTimeout(300_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("link", { name: "Start the first mission" }).click();

  await completeM01(page);
  await page.getByRole("link", { name: "Start The Delegation Desk", exact: true }).click();
  await completeM02(page);
  await page.getByRole("link", { name: "Start The Prompt Studio", exact: true }).click();
  await completeM03(page);
  await page.getByRole("link", { name: "Start The FAQ Project", exact: true }).click();
  await completeB01(page);
  await page.getByRole("link", { name: "Start The Evidence Bureau", exact: true }).click();
  await completeM04(page);
  await page.getByRole("link", { name: "Start The Argument Forge", exact: true }).click();
  await completeM05(page);
  await page.getByRole("link", { name: "Start The Thinking Gym: learning with help", exact: true }).click();
  await completeM06Gym(page);
  await page.getByRole("link", { name: "Start The Thinking Gym: teach it back", exact: true }).click();
  await completeM06Teach(page);
  await page.getByRole("link", { name: "Start The Numbers Lab", exact: true }).click();
  await completeM07(page);
  await page.getByRole("link", { name: "Start The Newsletter Desk", exact: true }).click();
  await completeT01(page);
  await page.getByRole("link", { name: "Start The Newsroom", exact: true }).click();
  await completeM08(page);
  await page.getByRole("link", { name: "Start The Fairness Council", exact: true }).click();
  await completeM09(page);
  await page.getByRole("link", { name: "Start The Boundary Room", exact: true }).click();
  await completeM10(page);
  await page.getByRole("link", { name: "Start The Co-Creation Studio", exact: true }).click();
  await completeM11(page);
  await page.getByRole("link", { name: "Start The Annual Report", exact: true }).click();
  await completeB03(page);
  await page.getByRole("link", { name: "Start The Systems Workshop", exact: true }).click();
  await completeM12(page);
  await page.getByRole("link", { name: "Start The Citizens' Assembly", exact: true }).click();
  await completeM13(page);
  for (const [title, complete] of [
    ["The Commission, chapter 1: scope", completeC01Scope],
    ["The Commission, chapter 2: evidence", completeC01Evidence],
    ["The Commission, chapter 3: workflow", completeC01Workflow],
    ["The Commission, chapter 4: the review meeting", completeC01Review],
  ] as const) {
    await page.getByRole("link", { name: `Start ${title}`, exact: true }).click();
    await complete(page);
  }

  // End of the path: nothing further is offered.
  await expect(page.getByRole("heading", { name: /You've finished every mission on the path/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Start / })).toHaveCount(0);

  // P5.
  await page.getByRole("link", { name: "See your session summary" }).click();
  await expect(page.getByText(/Use it\. It is specific.*\(Very\)/)).toBeVisible();
  await expect(page.getByText(/Whether the café's own records say the same thing\. \(Somewhat\)/)).toBeVisible();
  await expect(page.getByText(/finished 21 of 21 missions/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // What it says it contains is what it contains: no written answers on the page or when copied.
  await expect(page.getByText(/PRIVATE-/)).toHaveCount(0);
  await page.getByRole("button", { name: "Copy summary" }).click();
  await expect(page.getByText("Summary copied")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Whether the café's own records say the same thing. (Somewhat)");
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

  // The map shows every stop finished, and the capstone's four seals filled.
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Mission map", exact: true }).click();
  await expect(page.locator(".stop-state[data-state=done]")).toHaveCount(modules.filter((m) => m.status === "available").length);
  await expect(page.getByText("All four stages finished")).toBeVisible();
});

test("this device remembers finished missions and how far others got, and nothing a learner chose or wrote", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await page.getByRole("link", { name: "Start the first mission" }).click();
  await completeM01(page);
  await page.getByRole("link", { name: "Back to the mission map" }).click();
  await expect(page.getByRole("button", { name: /Inside the Machine.*Finished/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /The Delegation Desk.*Next/ })).toBeVisible();

  // Part-way through another mission, then a new visit.
  await openFromMap(page, "The Argument Forge");
  await cont(page);
  await expect(page.getByText(/^Step 2 of/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/^Step 1 of/)).toBeVisible(); // answers aren't kept, so the mission starts again
  await page.goto("/map");
  await expect(page.getByRole("button", { name: /Inside the Machine.*Finished/ })).toBeVisible();
  await page.getByRole("button", { name: /The Argument Forge.*Step 2 of/ }).click();
  await expect(page.getByText(/You reached step 2 of \d+ last time/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Start again: The Argument Forge" })).toBeVisible();

  // What is stored: three lists, no answers.
  const stored = await page.evaluate(() => localStorage.getItem("artisan_progress"));
  const data = JSON.parse(stored!);
  expect(Object.keys(data).sort()).toEqual(["completed", "reached", "seen", "v"]);
  expect(data.completed).toEqual(["m01-foundations"]);
  expect(stored).not.toMatch(/PRIVATE-|choiceId|confidence/);

  // The welcome page offers the way back in.
  await page.goto("/");
  await expect(page.getByRole("link", { name: /^Continue: / })).toBeVisible();

  // Clearing it empties the map.
  await page.goto("/summary");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Clear my progress on this device" }).click();
  await expect(page.getByText("Progress cleared.")).toBeVisible();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Mission map", exact: true }).click();
  await expect(page.locator(".stop-state[data-state=done]")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("artisan_progress"))).not.toContain("m01-foundations");
});

test("criterion 9: refreshing mid-activity gives a clear restart on every mission", async ({ page }) => {
  test.setTimeout(120_000);
  for (const { id } of missions) {
    await page.goto(`/missions/${id}`);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByText(/^Step 2 of/)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/^Step 1 of/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your task" })).toBeVisible();
  }
});

test("leaving a mission by the breadcrumb keeps its place, and the map offers to resume it", async ({ page }) => {
  await page.goto("/missions/m05-argument");
  await expect(page.getByRole("button", { name: "Pause" })).toHaveCount(0);
  await cont(page);
  await expect(page.getByText(/^Step 2 of/)).toBeVisible();
  await page.getByRole("navigation", { name: "Where you are" }).getByRole("link", { name: "Mission map" }).click();
  await expect(page.getByRole("button", { name: /The Argument Forge.*Resume/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Resume mission: The Argument Forge" }).click();
  await expect(page.getByText(/^Step 2 of/)).toBeVisible();
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
  // M01 and M04 share step ids ("initial", "explain").
  await page.goto("/map");
  await openFromMap(page, "Inside the Machine");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel(/Use it\. It is specific/).check();

  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Mission map", exact: true }).click();
  await openFromMap(page, "The Evidence Bureau");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const answer = page.getByRole("group", { name: /Attendance averaged/ }).getByRole("radio", { name: "Not sure" });
  await answer.check();
  await expect(answer).toBeChecked();

  // Back in M01, the earlier selection is intact, and ids in the document are unique.
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Mission map", exact: true }).click();
  await openFromMap(page, "Inside the Machine");
  await expect(page.getByLabel(/Use it\. It is specific/)).toBeChecked();
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(duplicates).toEqual([]);
});

test("Help reminds the learner of the method without losing their place", async ({ page }) => {
  await page.goto("/missions/t01-transfer");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText(/^Step 2 of/)).toBeVisible();
  await page.getByRole("button", { name: "Help", exact: true }).click();
  await expect(page.getByRole("dialog").getByText(/Find the passage that bears on each claim/)).toBeVisible();
  await page.getByRole("button", { name: "Back to the mission" }).click();
  await expect(page.getByText(/^Step 2 of/)).toBeVisible();
});

test("the welcome page offers a real judgment before any explanation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/about 8%/)).toHaveCount(0);
  await page.getByRole("button", { name: "It does not" }).click();
  await expect(page.getByText(/about 8%/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

