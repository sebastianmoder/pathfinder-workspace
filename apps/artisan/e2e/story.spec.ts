import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeM01 } from "./helpers";

// The other specs play with story scenes off. These start as a new player does, with nothing saved.
test.use({ storageState: { cookies: [], origins: [] } });

const next = (page: Page) => page.getByRole("button", { name: "Next", exact: true }).click();
const scene = (page: Page) => page.getByRole("region", { name: "Story scene" });

test("a new game opens on the prologue, which asks for a judgment before explaining anything", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "New game" }).click();
  await expect(scene(page).getByRole("heading", { name: "The Riverside File" })).toBeVisible();
  await expect(scene(page).getByText(/first day as its researcher/)).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  while (!(await page.getByRole("button", { name: "It does not" }).count())) await next(page);
  await expect(page.getByText(/about 8%/)).toHaveCount(0);
  await page.getByRole("button", { name: "It does not" }).click();
  await expect(scene(page).getByText(/about 8%/)).toBeVisible();
  // The lines so far can be read back.
  await scene(page).getByText("Earlier in this scene").click();
  await expect(scene(page).getByText(/You find out whether they are/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // The prologue leads into the chapter and the case's own scene, then the case.
  while (!(await page.getByRole("button", { name: "Open the case" }).count())) await next(page);
  await expect(scene(page).getByText(/already pasting it into the layout/)).toBeVisible();
  await page.getByRole("button", { name: "Open the case" }).click();
  await expect(page.getByText("Step 1 of 11")).toBeVisible();
  await expect(page.getByRole("region", { name: "Step 1 of 11" })).toBeFocused();

  // Scenes play once.
  await page.reload();
  await expect(page.getByText("Step 1 of 11")).toBeVisible();
  await expect(scene(page)).toHaveCount(0);
});

test("a scene can be skipped at any point", async ({ page }) => {
  await page.goto("/missions/m03-briefing");
  await expect(scene(page)).toBeVisible();
  await page.getByRole("button", { name: "Skip scene" }).click();
  await expect(page.getByText(/^Step 1 of/)).toBeVisible();
});

test("what the player decided comes back in later scenes, and the case goes into the file", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/missions/m01-foundations");
  await page.getByRole("button", { name: "Skip scene" }).click();
  await completeM01(page, false); // opens by being ready to use Sam's answer as it stands
  // After the last task, the closing scene answers to that first move.
  await expect(scene(page).getByText(/You were going to let me print it/)).toBeVisible();
  while (!(await page.getByRole("button", { name: "Go to the debrief" }).count())) await next(page);
  await page.getByRole("button", { name: "Go to the debrief" }).click();
  await expect(page.getByText("Added to the Riverside file")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The opening time" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // The next case's opening remembers it.
  await page.getByRole("link", { name: "Start The Delegation Desk", exact: true }).click();
  await next(page);
  await next(page);
  await expect(scene(page).getByText(/you'd have printed the library's hours unchecked/)).toBeVisible();

  // The file holds the clue, and the notebook the decision.
  await page.goto("/map");
  await page.getByRole("button", { name: "The Riverside file" }).click();
  await expect(page.getByText("1 of 4 in the file so far.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The opening time" })).toBeVisible();
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.goto("/summary");
  await expect(page.getByText("You were ready to print it as it stood.")).toBeVisible();
});

test("a save file carries the game to another browser", async ({ page, browser }) => {
  await page.goto("/missions/m05-argument");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText(/^Step 2 of/)).toBeVisible();
  await page.goto("/summary");
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
  await other.goto("/summary");
  await other.locator("input[type=file]").setInputFiles({ name: "notes.json", mimeType: "application/json", buffer: Buffer.from('{"hello":1}') });
  await expect(other.getByText("That file isn't an ARTISAN save.")).toBeVisible();
  await context.close();
});
