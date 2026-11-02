import { expect, type Page } from "@playwright/test";

export const narrow = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;
export const cont = (page: Page) => page.getByRole("button", { name: "Continue", exact: true }).click();
export const check = (page: Page) => page.getByRole("button", { name: "Check my answer" }).click();

export async function recordJudgment(page: Page, answer: RegExp | string, confidence: string) {
  await page.getByLabel(answer).check();
  await page.getByLabel(confidence, { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await expect(page.getByText("Weaker fit")).toHaveCount(0); // no verdict before investigating
  await cont(page);
}

/** Audits one claim, working through the labelled views that narrow screens use. */
export async function auditClaim(
  page: Page,
  claim: RegExp,
  opts: { passage?: string; status: string; action: string; reason?: string },
) {
  if (narrow(page)) await page.getByRole("button", { name: "Briefing", exact: true }).click();
  await page.getByRole("button", { name: claim }).click();
  if (opts.passage) {
    if (narrow(page)) await page.getByRole("button", { name: "Open sources" }).click();
    const details = page.locator("details", { has: page.locator(`[data-passage="${opts.passage}"]`) });
    if (!(await details.evaluate((d: HTMLDetailsElement) => d.open))) await details.locator("summary").click();
    await page.locator(`[data-passage="${opts.passage}"]`).click();
  } else {
    await page.getByRole("button", { name: "No source addresses this claim" }).click();
  }
  await page.getByRole("radio", { name: new RegExp(`^${opts.status}\\.`) }).check();
  await page.getByRole("radio", { name: new RegExp(`^${opts.action}`) }).check();
  if (opts.reason) await page.getByLabel(/Before you check/).fill(opts.reason);
  await page.getByRole("button", { name: "Check this claim" }).click();
}

/** Trains the machine on the board as it stands, then predicts and asks. */
export async function trainAndAsk(page: Page, expected: string, opts: { train?: boolean } = {}) {
  if (opts.train !== false) await page.getByRole("button", { name: "Train the machine" }).click();
  await page.getByRole("radio", { name: expected, exact: true }).check();
  await page.getByRole("button", { name: "Ask the machine" }).click();
}

export const nextTask = (page: Page) => page.getByRole("button", { name: "Next task" }).click();

/** Switches off every sentence, then on only the ones named. */
export async function setBoard(page: Page, sentences: string[]) {
  for (const box of await page.getByRole("checkbox").all()) await box.uncheck();
  for (const sentence of sentences) await page.getByRole("checkbox", { name: sentence, exact: true }).check();
}

export async function runMachine(page: Page) {
  await trainAndAsk(page, "nine");
  await nextTask(page);
  await setBoard(page, ["the school library opens at ten", "the bank opens at ten"]);
  await trainAndAsk(page, "ten");
  await nextTask(page);
  await setBoard(page, ["the club opens at midnight"]);
  await trainAndAsk(page, "midnight");
  await nextTask(page);
  await page.getByRole("button", { name: "Say it" }).click();
  await trainAndAsk(page, "nine", { train: false });
  await nextTask(page);
  await page.getByRole("checkbox", { name: "from january the library opens at ten" }).check();
  await trainAndAsk(page, "nine");
  await nextTask(page);
  await setBoard(page, ["from january the library opens at ten"]);
  await trainAndAsk(page, "ten");
  await cont(page);
}

export const FAULTS: [RegExp, string][] = [
  [/health chatbot/, "Training data"],
  [/corrects a model/, "Trained model"],
  [/swimming pool/, "Your input"],
  [/quotation/, "Output"],
];

export async function traceFaults(page: Page) {
  for (const [text, stage] of FAULTS) {
    await page.getByRole("group", { name: text }).getByRole("radio", { name: stage, exact: true }).check();
  }
  await check(page);
  await cont(page);
}

export async function completeM01(page: Page) {
  await cont(page);
  await cont(page);
  await recordJudgment(page, /It is probably correct/, "Very");
  await runMachine(page);
  await page.getByLabel(/It follows the patterns in its data/).check();
  await check(page);
  await cont(page);
  await traceFaults(page);
  const place: Record<string, string> = {
    "A phone unlocks when it sees your face": "Recognise (images, speech)",
    "A chatbot drafts an email for you": "Generate (text, images)",
    "A streaming service suggests your next show": "Recommend",
    "A voice assistant turns speech into text": "Recognise (images, speech)",
    "A delivery app estimates when your parcel will arrive": "Predict / forecast",
    "An image tool makes a poster from a description": "Generate (text, images)",
  };
  for (const [item, cat] of Object.entries(place)) await page.getByLabel(item).selectOption({ label: cat });
  await check(page);
  await cont(page);
  await page.getByLabel("It tells me little; I need evidence.").check();
  await page.getByLabel("Somewhat", { exact: true }).check();
  await check(page);
  await cont(page);
  await page.getByLabel(/Hold both figures/).check();
  await check(page);
  await cont(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M01-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeM04(page: Page) {
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Quite far/, "Very");
  await auditClaim(page, /Attendance averaged/, { passage: "attendance-avg", status: "Supported", action: "Retain" });
  await auditClaim(page, /about 30% higher/, { passage: "attendance-avg", status: "Supported", action: "Retain" });
  await auditClaim(page, /Three-quarters/, { passage: "survey-result", status: "Misleading", action: "Qualify" });
  await auditClaim(page, /Research shows/, { passage: "review-finding", status: "Unsupported", action: "Correct" });
  await auditClaim(page, /funds the programme/, { passage: "trust-2026-amount", status: "Outdated", action: "Correct" });
  await auditClaim(page, /repeatedly asked/, { status: "Unsupported", action: "Remove" });
  await auditClaim(page, /can staff a second/, { passage: "volunteers-capacity", status: "Incorrect", action: "Correct" });
  await auditClaim(page, /Tuesday trial/, { passage: "attendance-tuesday", status: "Supported", action: "Retain" });
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await cont(page);
  await page.getByLabel(/It tells me where to look/).check();
  await page.getByLabel("Fairly", { exact: true }).check();
  await check(page);
  await cont(page);
  await auditClaim(page, /Repair café visits doubled/, { passage: "report-visits", status: "Incorrect", action: "Correct", reason: "PRIVATE-M04-REASON" });
  await cont(page);
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export const choose = (page: Page, label: RegExp) => page.getByRole("button", { name: label }).click();

export const MAP_PLACEMENT: [RegExp, string][] = [
  [/Without another option/, "Reasons for"],
  [/at any hour/, "Reasons for"],
  [/rose from 61%/, "Evidence"],
  [/averages 18 learners/, "Evidence"],
  [/7 of 50 maths answers/, "Objections"],
  [/standard terms keep/, "Objections"],
  [/caused by the tutor/, "Unstated assumptions"],
  [/visits are about homework/, "Unstated assumptions"],
  [/40% faster/, "Set aside"],
];

export async function placeCards(page: Page) {
  for (const [card, slot] of MAP_PLACEMENT) {
    await page.getByRole("button", { name: card }).click();
    await page.getByRole("button", { name: new RegExp(`Place here.*${slot}`) }).click();
  }
}

export async function completeM05(page: Page) {
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Try it for a limited time/, "Fairly");
  await choose(page, /What evidence do we have/);
  await choose(page, /How were the two groups formed/);
  await choose(page, /Were its answers right/);
  await choose(page, /Who sees what learners type/);
  await choose(page, /different terms and consent/);
  await choose(page, /Keep the remaining volunteers/);
  await page.getByRole("button", { name: "Continue to the argument map" }).click();
  await placeCards(page);
  await page.getByRole("button", { name: "Check my map" }).click();
  await cont(page);
  await page.getByLabel(/Try it for a limited time/).check();
  await page.getByLabel("Somewhat", { exact: true }).check();
  await check(page);
  await cont(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M05-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await page.getByLabel(/having a smartphone means/).check();
  await check(page);
  await cont(page);
  await page.getByRole("button", { name: "Skip writing and see the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeT01(page: Page) {
  await cont(page);
  await cont(page);
  await recordJudgment(page, /Send it/, "Fairly");
  await expect(page.getByRole("button", { name: "Need a hint?" })).toHaveCount(0);
  await auditClaim(page, /enrolled 48 people/, { passage: "register-numbers", status: "Supported", action: "Retain" });
  await auditClaim(page, /Almost everyone/, { passage: "questionnaire-result", status: "Misleading", action: "Qualify" });
  await auditClaim(page, /shown to improve/, { passage: "questionnaire-scope", status: "Unsupported", action: "Remove" });
  await auditClaim(page, /One in four/, { passage: "county-2026-broadband", status: "Outdated", action: "Correct" });
  await auditClaim(page, /completely free/, { passage: "register-fee", status: "Incorrect", action: "Correct" });
  await auditClaim(page, /next course starts/i, { passage: "tutor-next", status: "Supported", action: "Retain" });
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await expect(page.getByText(/One in seven adults/)).toBeVisible();
  await cont(page);
  await page.getByLabel(/a course twice the size/).check();
  await check(page);
  await cont(page);
  await page.getByLabel(/Check its claims against the sources/).check();
  await page.getByLabel("Very", { exact: true }).check();
  await check(page);
  await cont(page);
  await page.getByLabel("Your answer").fill("PRIVATE-T01-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}
