import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM01, cont, matchPairs, rankInto } from "./helpers";

// The other specs start as a player who has seen every scene. These start as a new player does, with nothing saved.
test.use({ storageState: { cookies: [], origins: [] } });

const next = (page: Page) => page.getByRole("button", { name: "Next", exact: true }).click();
const scene = (page: Page) => page.getByRole("region", { name: "Story scene" });
/** Plays the scene through to its last button, answering anything asked with the first option. */
async function playScene(page: Page, done: string) {
  const finish = page.getByRole("button", { name: done });
  while (!(await finish.count())) {
    const answers = page.getByRole("group", { name: "Your answer" }).getByRole("button");
    if (await answers.count()) await answers.first().click();
    else await next(page);
  }
  await finish.click();
}
const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("a new game opens on a conversation that asks for a judgment before explaining anything", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ARTISAN", level: 1 })).toBeVisible();
  await axe(page);
  await page.getByRole("link", { name: "New game" }).click();
  await expect(scene(page).getByRole("heading", { name: "Inside the Machine" })).toBeVisible();
  await expect(scene(page).getByText(/It is your first day as its researcher/)).toHaveCount(0);
  await axe(page);

  while (!(await page.getByRole("button", { name: "It does not" }).count())) await next(page);
  await expect(page.getByText(/about 8%/)).toHaveCount(0);
  await page.getByRole("button", { name: "It does not" }).click();
  // The answer appears as the player's own line, with the reply under it, and every earlier line is still there.
  await expect(scene(page).locator(".chat-you")).toHaveText(/It does not/);
  await expect(scene(page).getByText(/about 8%/)).toBeVisible();
  await expect(scene(page).getByText(/You find out whether they are/)).toBeAttached();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await axe(page);

  // The prologue leads into the chapter and the case's own scene, in one conversation, then the case.
  while (!(await page.getByRole("button", { name: "Open the case" }).count())) await next(page);
  await expect(scene(page).getByText("Chapter 1: Something reads well")).toBeAttached();
  await expect(scene(page).getByText(/already pasting it into the layout/)).toBeInViewport();
  await page.getByRole("button", { name: "Open the case" }).click();
  await expect(page.getByText("Step 1 of 11")).toBeVisible();
  await expect(page.getByRole("region", { name: "Step 1 of 11" })).toBeFocused();

  // Scenes play once.
  await page.reload();
  await expect(page.getByText("Step 1 of 11")).toBeVisible();
  await expect(scene(page)).toHaveCount(0);
});

test("a scene is played through to the case, with no way around it, and starting over sits in the danger zone", async ({ page }) => {
  await page.goto("/missions/m03-briefing");
  await expect(scene(page)).toBeVisible();
  await expect(page.getByRole("button", { name: /skip/i })).toHaveCount(0);
  await playScene(page, "Open the case");
  await expect(page.getByText(/^Step 1 of/)).toBeVisible();

  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  const danger = page.getByRole("region", { name: "Danger zone" });
  await expect(danger.getByRole("button", { name: /start over|clear|erase/i })).toBeVisible();
  await axe(page);
});

test("what the player decided comes back in later scenes, and the notebook keeps what the case taught", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/missions/m01-foundations");
  await playScene(page, "Open the case");
  await completeM01(page, false); // opens by being ready to use Sam's answer as it stands
  // After the last task, the closing scene answers to that first move.
  await expect(scene(page).getByText(/You were going to let me print it/)).toBeVisible();
  while (!(await page.getByRole("button", { name: "Go to the debrief" }).count())) await next(page);
  await page.getByRole("button", { name: "Go to the debrief" }).click();
  await expect(page.getByText("Added to your notebook")).toBeVisible();
  await expect(page.getByText("The opening time")).toBeVisible();
  await axe(page);

  // The next case's opening remembers it.
  await page.getByRole("link", { name: "Start The Delegation Desk", exact: true }).click();
  await next(page);
  await next(page);
  await expect(scene(page).getByText(/you'd have printed the library's hours unchecked/)).toBeVisible();

  // The notebook leads with the key learning, then what the case added to the trail.
  await page.goto("/summary");
  await expect(page.getByRole("heading", { name: "Inside the Machine" })).toBeVisible();
  await expect(page.getByText("Fluent is not the same as correct. Treat specific claims as things to check against a source.")).toBeVisible();
  await expect(page.getByText(/It happened to be right/)).toBeVisible();
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.reload(); // so colours are settled in the new scheme before they are measured
    await expect(page.getByRole("heading", { name: "Inside the Machine" })).toBeVisible();
    await axe(page);
  }
});

test("the list of cases is in order, and choosing one never hides the list", async ({ page }) => {
  await page.goto("/map");
  const rows = page.locator(".case-row");
  await expect(rows).toHaveCount(17);
  await expect(rows.first()).toHaveAccessibleName(/Case 1: Inside the Machine/);
  await expect(rows.last()).toHaveAccessibleName(/Case 17: The ARTISAN Commission/);
  await page.getByRole("button", { name: /Case 6: The Argument Forge/ }).click();
  const card = page.getByRole("complementary", { name: "Selected case" });
  await expect(card).toHaveCount(1);
  await expect(card.getByRole("link", { name: "Open case: The Argument Forge" })).toBeVisible();
  // Every row is still in the page's flow, with nothing fixed over it.
  for (const title of ["The Evidence Bureau", "The Thinking Gym", "The ARTISAN Commission"]) {
    const row = page.getByRole("button", { name: new RegExp(title) });
    await row.scrollIntoViewIfNeeded();
    const covered = await row.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !(top && el.contains(top));
    });
    expect(covered, title).toBe(false);
  }
  await axe(page);
});

test("before the review meeting, the trail is laid out and then the case opens", async ({ page }) => {
  await page.goto("/missions/c01-review");
  await playScene(page, "Open the case");
  await expect(page.getByRole("heading", { name: "Trace it back" })).toBeVisible();
  await axe(page);
  await rankInto(page, [/Northbrook evaluation/, /vendor's case/, /vendor's brochure/, /council chamber/]);
  await expect(page.getByText(/At no point did anyone invent a number/)).toBeVisible();
  // A reload comes back to the same point inside the activity: the order and its result are in the save.
  await page.reload();
  await expect(page.getByText(/At no point did anyone invent a number/)).toBeVisible();
  await expect(page.locator(".rank-label").first()).toHaveText(/Northbrook evaluation/);
  await cont(page);
  await matchPairs(page, [
    [/40% faster/, "A trial in another town: homework completion rose from 61% to 74% among tutor users."],
    [/95% accuracy in every language/, "An evaluation in another town: English 900 of 950 correct, Polish 40 of 60, Arabic 25 of 40."],
    [/Flooding at Riverside Bridge/, "The Gazette's own photo of the 2024 flood."],
    [/The library opens at 9:00/, "The library's notice, which changed the opening time to ten from January."],
  ]);
  await expect(page.getByText(/None of the four was made up/)).toBeVisible();
  await cont(page);
  await expect(page.getByText(/^Step 1 of/)).toBeVisible();
});

test("a save file carries the game to another browser, and a return code carries the story", async ({ page, browser }) => {
  await page.goto("/missions/m05-argument");
  await playScene(page, "Open the case");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText(/^Step 2 of/)).toBeVisible();
  await page.goto("/settings");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export a save file" }).click();
  const file = await (await download).path();

  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const other = await context.newPage();
  await other.goto("/");
  await other.locator("input[type=file]").setInputFiles(file);
  await expect(other.getByText("Save loaded.")).toBeVisible();
  await other.getByRole("link", { name: "Continue: The Argument Forge" }).click();
  await expect(other.getByText(/^Step 2 of/)).toBeVisible();

  // A file that isn't a save is refused, and the game is left as it was.
  await other.goto("/settings");
  await other.locator("input[type=file]").setInputFiles({ name: "notes.json", mimeType: "application/json", buffer: Buffer.from('{"hello":1}') });
  await expect(other.getByText("That file isn't an ARTISAN save.")).toBeVisible();

  // A return code for someone who finished the first case and used Sam's answer restores both.
  await other.getByLabel("Enter a return code").fill("not a code");
  await other.getByRole("button", { name: "Use this code" }).click();
  await expect(other.getByText(/That isn't a return code/)).toBeVisible();
  const code = await page.evaluate(() => document.querySelector("strong.return-code")?.textContent ?? "");
  expect(code).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  other.once("dialog", (d) => d.accept());
  await other.getByLabel("Enter a return code").fill(code.toLowerCase());
  await other.getByRole("button", { name: "Use this code" }).click();
  await expect(other.getByText("Code accepted. Your finished cases are restored.")).toBeVisible();
  await context.close();
});
