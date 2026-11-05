import { expect, type Page } from "@playwright/test";

export const narrow = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;
export const cont = (page: Page) => page.getByRole("button", { name: "Continue", exact: true }).click();
export const check = (page: Page) => page.getByRole("button", { name: "Check my answer" }).click();

export async function recordJudgment(page: Page, answer: RegExp | string, confidence?: string) {
  await page.getByLabel(answer).check();
  if (confidence) await page.getByLabel(confidence, { exact: true }).check();
  await page.getByRole("button", { name: "Record my judgment" }).click();
  await expect(page.getByText("Weaker fit")).toHaveCount(0); // no verdict before investigating
  await cont(page);
}

/** Practice at rating sample answers is offered until a learner has done or declined it once this visit. */
export async function skipPractice(page: Page) {
  const skip = page.getByRole("button", { name: "Skip the practice" });
  if (await skip.count()) await skip.click();
}

/** Answers a revision (a new case on the opening idea), with confidence where the mission asks for it. */
export async function revise(page: Page, answer: RegExp, confidence?: string) {
  await page.getByLabel(answer).check();
  if (confidence) await page.getByLabel(confidence, { exact: true }).check();
  await check(page);
  await expect(page.getByRole("heading", { name: "Looking back at your first move" }).or(page.getByText(/^Your confidence:/)).first()).toBeVisible();
  await cont(page);
}

/** Chooses the strongest draft, improves it, and compares it with the criteria. */
export async function pickAndImprove(page: Page, draft: RegExp, addition: string) {
  await page.getByLabel(draft).check();
  await check(page);
  const box = page.getByLabel(/^Improve it/);
  await expect(box).not.toHaveValue("");
  await box.fill(`${await box.inputValue()} ${addition}`);
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
}

/** Fills the labelled parts of a structured note, then compares it with the criteria. */
export async function writeNote(page: Page, parts: [RegExp, string][]) {
  await skipPractice(page);
  for (const [label, text] of parts) await page.getByLabel(label).fill(text);
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
}

/** Audits one claim, working through the labelled views that narrow screens use. */
export async function auditClaim(
  page: Page,
  claim: RegExp,
  opts: { passage?: string; status: string; action: string; calc?: string; repair?: string[]; reason?: string; independent?: boolean },
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
  if (opts.calc) await page.getByLabel(/^Work it out/).fill(opts.calc);
  await page.getByRole("radio", { name: new RegExp(`^${opts.status}\\.`) }).check();
  await page.getByRole("radio", { name: new RegExp(`^${opts.action}`) }).check();
  for (const [i, value] of (opts.repair ?? []).entries()) {
    const blank = page.getByLabel(`Blank ${i + 1}`, { exact: true });
    if ((await blank.evaluate((el) => el.tagName)) === "SELECT") await blank.selectOption(value);
    else await blank.fill(value);
  }
  if (opts.reason) await page.getByLabel(/Before you check/).fill(opts.reason);
  const withoutReason = page.getByRole("button", { name: /without explaining/ });
  if (!opts.reason && (await withoutReason.count())) await withoutReason.click();
  else await page.getByRole("button", { name: opts.independent ? "Save my judgment" : "Check this claim" }).click();
}

/** Marks every statement in the list, then checks and moves on with the given button. */
export async function markAndCheck(page: Page, parts: RegExp[], nextButton = "Continue") {
  for (const part of parts) await page.getByRole("button", { name: part }).click();
  await check(page);
  await page.getByRole("button", { name: nextButton, exact: true }).click();
}

/** Records the same first read for every claim. */
export async function firstRead(page: Page, level: string) {
  for (const group of await page.getByRole("group").all()) await group.getByRole("radio", { name: level }).check();
  await page.getByRole("button", { name: "Start checking" }).click();
}

/** Opens the source holding a passage, and shows that passage as a reply. */
export async function showPassage(page: Page, passage: string) {
  const details = page.locator("details", { has: page.locator(`[data-passage="${passage}"]`) });
  if (!(await details.evaluate((d: HTMLDetailsElement) => d.open))) await details.locator("summary").click();
  await page.locator(`[data-passage="${passage}"]`).click();
}

/** Takes Rafael's two closing claims at face value. */
export async function passRafael(page: Page) {
  await choose(page, /brochure's figure holds up/);
  await choose(page, /my argument has to account for it/);
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
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Use it\. It is specific/, "Very");
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
  await revise(page, /Whether the café's own records/, "Somewhat");
  await markAndCheck(page, [/opened in 1987/, /40 branches/]);
  await page.getByLabel(/Hold both figures/).check();
  await check(page);
  await cont(page);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M01-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeM04(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await firstRead(page, "I would rely on it");
  await auditClaim(page, /Attendance averaged/, { passage: "attendance-avg", calc: "31", status: "Supported", action: "Retain" });
  await auditClaim(page, /Three-quarters/, { passage: "survey-result", status: "Misleading", action: "Qualify", repair: ["63", "210", "48"] });
  await auditClaim(page, /Research shows/, { passage: "review-finding", status: "Unsupported", action: "Correct", repair: ["time spent on homework", "grades"] });
  await auditClaim(page, /funds the programme/, { passage: "trust-2026-amount", status: "Outdated", action: "Correct", repair: ["12,000", "2026–27"] });
  await auditClaim(page, /repeatedly asked/, { status: "Unsupported", action: "Remove" });
  await auditClaim(page, /can staff a second/, { passage: "volunteers-capacity", status: "Incorrect", action: "Correct", repair: ["Five", "month"] });
  await auditClaim(page, /Tuesday trial/, { passage: "attendance-tuesday", status: "Supported", action: "Retain" });
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await page.getByRole("button", { name: "Make the decision" }).click();
  await page.getByLabel(/Run one extra session a month/).check();
  await check(page);
  await cont(page);
  await completeNorthgate(page);
  await skipPractice(page);
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeNorthgate(page: Page) {
  await markAndCheck(page, [/Repair café visits doubled/, /repair volunteers doubled/, /largest repair café/], "Audit the claims");
  await auditClaim(page, /Repair café visits doubled/, { passage: "report-visits", calc: "41", status: "Incorrect", action: "Correct", repair: ["290", "410", "41"], reason: "PRIVATE-M04-REASON", independent: true });
  await auditClaim(page, /repair volunteers doubled/, { passage: "report-volunteers", status: "Supported", action: "Retain", independent: true });
  await auditClaim(page, /largest repair café/, { status: "Unsupported", action: "Remove", independent: true });
  await page.getByRole("button", { name: "Submit the audit" }).click();
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await cont(page);
}

export const choose = (page: Page, label: RegExp) => page.getByRole("button", { name: label }).click();

export const MAP_PLACEMENT: [RegExp, string][] = [
  [/Without another option/, "Reasons for"],
  [/finish more of their homework/, "Reasons for"],
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

export const CONNECTIONS: [RegExp, RegExp][] = [
  [/rose from 61%/, /finish more of their homework/],
  [/averages 18 learners/, /Without another option/],
  [/7 of 50 maths answers/, /finish more of their homework/],
  [/standard terms keep/, /The proposal as a whole/],
  [/caused by the tutor/, /finish more of their homework/],
  [/visits are about homework/, /The proposal as a whole/],
];

export async function connectAndTest(page: Page) {
  await page.getByRole("button", { name: "Connect the cards" }).click();
  for (const [card, target] of CONNECTIONS) {
    const select = page.getByLabel(card);
    const value = await select.locator("option").filter({ hasText: target }).getAttribute("value");
    await select.selectOption(value!);
  }
  await page.getByRole("button", { name: "Check my connections" }).click();
  await page.getByRole("button", { name: "Test the argument" }).click();
  await page.getByRole("checkbox", { name: /Suppose this is false.*caused by the tutor/ }).check();
  await page.getByRole("checkbox", { name: /Suppose this is false.*visits are about homework/ }).check();
  await cont(page);
}

export async function completeM05(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Try it for a limited time/, "Fairly");
  await choose(page, /What evidence do we have/);
  await choose(page, /How were the two groups formed/);
  await choose(page, /Were its answers right/);
  await choose(page, /Who sees what learners type/);
  await choose(page, /The board is about to start/);
  await showPassage(page, "eastfield-result");
  await choose(page, /my argument has to account for it/);
  await choose(page, /Keep the remaining volunteers/);
  await page.getByRole("button", { name: "Continue to the argument map" }).click();
  await placeCards(page);
  await page.getByRole("button", { name: "Check my map" }).click();
  await connectAndTest(page);
  await revise(page, /Try it for a limited time/, "Somewhat");
  await page.getByLabel(/About a third of visits/).check();
  await check(page);
  await cont(page);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M05-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await markAndCheck(page, [/have a smartphone/, /will serve everyone/]);
  await pickAndImprove(page, /answers at any hour and on every route/, "PRIVATE-M05-STEELMAN");
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeT01(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await expect(page.getByRole("button", { name: "Need a hint?" })).toHaveCount(0);
  await markAndCheck(page, [/enrolled 48 people/, /Almost everyone/, /shown to improve/, /One in four/, /completely free/, /next course starts/i], "Audit the claims");
  await firstRead(page, "Not sure");
  const save = { independent: true };
  await auditClaim(page, /enrolled 48 people/, { ...save, passage: "register-numbers", status: "Supported", action: "Retain" });
  await auditClaim(page, /Almost everyone/, { ...save, passage: "questionnaire-result", status: "Misleading", action: "Qualify", repair: ["24", "20"] });
  await auditClaim(page, /shown to improve/, { ...save, passage: "questionnaire-scope", status: "Unsupported", action: "Remove" });
  await auditClaim(page, /One in four/, { ...save, passage: "county-2026-broadband", status: "Outdated", action: "Correct", repair: ["seven"] });
  await auditClaim(page, /completely free/, { ...save, passage: "register-fee", status: "Incorrect", action: "Correct", repair: ["15", "request"] });
  await auditClaim(page, /next course starts/i, { ...save, passage: "tutor-next", status: "Supported", action: "Retain" });
  await page.getByRole("button", { name: "Submit the audit" }).click();
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await expect(page.getByText(/One in seven adults/).first()).toBeVisible();
  await cont(page);
  await markAndCheck(page, [/^People$/, /double its size/]);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-T01-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

/** Assigns a role to each task in a delegation desk, then sends them. */
export async function assignRoles(page: Page, roles: [string, string][]) {
  for (const [title, role] of roles) {
    await page.getByRole("group", { name: `Role for: ${title}` }).getByRole("radio", { name: role, exact: true }).check();
  }
  await page.getByRole("button", { name: "Send the assignments" }).click();
}

export const M02_DESK: [string, string][] = [
  ["Award the hardship bursaries", "Human-led"],
  ["Send booking reminders", "Supervised automation"],
  ["Translate the term newsletter", "AI-assisted"],
  ["Reply to a parent's complaint", "Human-led"],
  ["Tag the donated books", "Supervised automation"],
  ["Summarise the course feedback", "AI-assisted"],
];

export const M02_TRANSFER: [string, string][] = [
  ["Sort the volunteer sign-ups", "Supervised automation"],
  ["Decide on extra visits", "Human-led"],
  ["Draft the council grant letter", "AI-assisted"],
];

export async function completeM02(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Yes, but a person reads and approves/);
  await assignRoles(page, M02_DESK);
  await cont(page);
  await page.getByLabel(/Sam, who runs bookings/).check();
  await check(page);
  await cont(page);
  await revise(page, /a wrong refusal is costly/);
  await assignRoles(page, M02_TRANSFER);
  await cont(page);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M02-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

/** Picks an option in a compose workspace. The legend can carry a "changed" note, so it is matched by its start. */
export async function pickPart(page: Page, part: string, option: RegExp) {
  await page.getByRole("group", { name: new RegExp(`^${part}`) }).getByRole("radio", { name: option }).check();
}

export const runIt = (page: Page) => page.getByRole("button", { name: "Run it" }).click();

/** Ticks the criteria the latest version meets, checks the checklist, and moves on. */
export async function judgeChecklist(page: Page, criteria: RegExp[], next = "Continue") {
  for (const c of criteria) await page.getByRole("checkbox", { name: c }).check();
  await page.getByRole("button", { name: "Check my checklist" }).click();
  await page.getByRole("button", { name: next, exact: true }).click();
}

export const M03_CRITERIA = [/written to new Homework Club/, /right date, time and room/, /what to bring/, /short, plain and friendly/];

export async function completeM03(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Yes\. Some tools are much better/);
  await runIt(page);
  for (const [part, option] of [
    ["Objective", /welcome email/],
    ["Context", /most new to tutoring/],
    ["What it must include", /photo ID/],
    ["Length and style", /Under 120 words/],
  ] as const) {
    await pickPart(page, part, option);
    await runIt(page);
  }
  await judgeChecklist(page, M03_CRITERIA);
  const place: [RegExp, string][] = [
    [/exact deadline/, "Find evidence"],
    [/600-word essay/, "Improve the brief"],
    [/quick note to parents/, "Ask a clarifying question"],
    [/wrong opening hours/, "Improve the brief"],
    [/80% of costs/, "Find evidence"],
    [/aimed at teenagers/, "Ask a clarifying question"],
  ];
  for (const [item, cat] of place) await page.getByLabel(item).selectOption({ label: cat });
  await check(page);
  await cont(page);
  await page.getByLabel(/The audience and its must-haves/).check();
  await check(page);
  await cont(page);
  await revise(page, /Check every date, time and number/);
  await pickPart(page, "Objective", /announcing the repair café's new hours/);
  await pickPart(page, "Context", /first Saturday/);
  await pickPart(page, "What it must include", /small electricals/);
  await pickPart(page, "Length and style", /Under 60 words/);
  await runIt(page);
  await judgeChecklist(page, [/notice about the new hours/, /new day, time and place/, /what can be repaired/, /easy to read from a distance/]);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M03-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

/** Sets a chart lab control by its option label, then checks the view. */
export async function chartView(page: Page, options: string[], next: string) {
  for (const o of options) await page.getByRole("radio", { name: o, exact: true }).check();
  await page.getByRole("button", { name: "Check this view" }).click();
  await page.getByRole("button", { name: next, exact: true }).click();
}

export async function completeM07(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /That the bar labels match/, "Fairly");
  await chartView(page, ["At zero"], "Next task");
  await chartView(page, ["Every month on record"], "Continue");
  await chartView(page, ["Visits per 1,000 residents"], "Continue");
  await auditClaim(page, /Monthly visits rose/, { passage: "reg-visits", calc: "9.8", status: "Supported", action: "Retain" });
  await auditClaim(page, /AI helper caused/, { passage: "reg-helper", status: "Unsupported", action: "Qualify", repair: ["97", "101"] });
  await auditClaim(page, /typical visit now lasts/, { passage: "reg-length", calc: "59", status: "Misleading", action: "Qualify", repair: ["40", "20"] });
  await auditClaim(page, /costs just/, { passage: "costs-helper", status: "Incorrect", action: "Correct", repair: ["1,800", "2"] });
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await cont(page);
  await page.getByLabel(/Treating the rise since March/).check();
  await check(page);
  await cont(page);
  await revise(page, /No: 20% to 30% is half as much again/, "Somewhat");
  await markAndCheck(page, [/Membership grew/, /girls playing/, /Injuries at training/], "Audit the claims");
  const save = { independent: true };
  await auditClaim(page, /Membership grew/, { ...save, passage: "mem-total", calc: "50", status: "Supported", action: "Retain", reason: "PRIVATE-M07-REASON" });
  await auditClaim(page, /girls playing/, { ...save, passage: "mem-girls", calc: "200", status: "Incorrect", action: "Correct", repair: ["6", "18", "200"] });
  await auditClaim(page, /Injuries at training/, { ...save, passage: "log-injuries", status: "Misleading", action: "Qualify", repair: ["4", "2"] });
  await page.getByRole("button", { name: "Submit the audit" }).click();
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await cont(page);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M07-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeM06Gym(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Show me the answer/);
  await page.getByLabel(/^€80, because/).check();
  await check(page);
  await page.getByRole("button", { name: /^Get a hint/ }).click();
  await page.getByLabel(/^€75/).check();
  await check(page);
  await page.getByRole("button", { name: "Next problem" }).click();
  await page.getByLabel(/About 13\.3 km\/h/).check();
  await check(page);
  await cont(page);
  const place: [RegExp, string][] = [
    [/exchange rate/, "The answer"],
    [/essay's argument/, "Feedback on my working"],
    [/never seen this kind/, "A worked example"],
    [/stuck on one step/, "A hint"],
  ];
  for (const [item, cat] of place) await page.getByLabel(item).selectOption({ label: cat });
  await check(page);
  await cont(page);
  await page.getByLabel(/Solve a similar problem later/).check();
  await check(page);
  await cont(page);
  await revise(page, /Try the next one with no hint/);
  await page.getByLabel(/^€48/).check();
  await check(page);
  await cont(page);
  await page.getByLabel(/^72 km\/h/).check();
  await check(page);
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeM06Teach(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Tell them it isn't always true/);
  await choose(page, /how did you get €40/);
  await choose(page, /Let's test that/);
  await choose(page, /50% of what\?/);
  await choose(page, /Now try Q2 on your own/);
  await cont(page);
  await page.getByLabel(/check his working/).check();
  await check(page);
  await cont(page);
  await revise(page, /Asking him to do a new one/);
  await page.getByLabel(/half a pizza/).check();
  await check(page);
  await cont(page);
  await pickAndImprove(page, /second 50% is of a smaller amount/, "PRIVATE-M06-ANSWER");
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeM10(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /The whole email/);
  await markAndCheck(page, [/diagnosed with ADHD/, /07700 900461/, /14 Mill Lane/, /account 41-22-07/]);
  const place: [RegExp, string][] = [
    [/Read the room-booking calendar/, "Allow"],
    [/Draft replies to booking emails/, "Allow"],
    [/Send emails to members/, "Ask a person first"],
    [/Cancel bookings/, "Ask a person first"],
    [/staff personnel files/, "Don't allow"],
    [/Issue refunds/, "Don't allow"],
  ];
  for (const [item, cat] of place) await page.getByLabel(item).selectOption({ label: cat });
  await check(page);
  await cont(page);
  await markAndCheck(page, [/Note to AI assistants/, /do not mention the price increase/]);
  await page.getByLabel(/Treat it as text in the document/).check();
  await check(page);
  await cont(page);
  await revise(page, /with the treatment removed/);
  await markAndCheck(page, [/Date of birth/, /heart operation/, /AI reviewer/]);
  await pickAndImprove(page, /leaves our hands and may be stored/, "PRIVATE-M10-ANSWER");
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeM11(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /The company behind the AI tool/);
  await pickPart(page, "Headline", /win a festival ticket/);
  await pickPart(page, "Image", /reading party/);
  await pickPart(page, "Main text", /\(festival ticket\)/);
  await pickPart(page, "Footer", /used with consent/);
  await runIt(page);
  await judgeChecklist(page, [/says what the challenge is/, /what to do, where, and by when/, /one the Commons may use/, /meets the policy for the image used/], "Next round");
  await pickPart(page, "Headline", /win a book voucher/);
  await pickPart(page, "Main text", /\(book voucher\)/);
  await runIt(page);
  await judgeChecklist(page, [/names the new prize/, /doesn't promise the old prize/, /board's new rule/, /fits the image used/]);
  const place: [RegExp, string][] = [
    [/picked from three AI suggestions/, "Fine as it is"],
    [/newsletter cover/, "Needs an AI disclosure"],
    [/no consent form on file/, "Needs permission first"],
    [/word for word/, "Needs an AI disclosure"],
    [/published novel/, "Needs permission first"],
    [/own figures/, "Fine as it is"],
  ];
  for (const [item, cat] of place) await page.getByLabel(item).selectOption({ label: cat });
  await check(page);
  await cont(page);
  await page.getByLabel(/I made it, with an AI headline/).check();
  await check(page);
  await cont(page);
  await revise(page, /You look into it and fix it/);
  await pickPart(page, "Message", /this year's facts/);
  await pickPart(page, "Image", /Stock photo/);
  await runIt(page);
  await judgeChecklist(page, [/what they actually did/, /one the Commons may use/, /meets the policy/]);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M11-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export const followLead = (page: Page, lead: string) =>
  page.getByRole("button", { name: new RegExp(`^Follow this lead ?: ${lead}`) }).click();

/** Answers each statement in a casefile by its group, then checks. */
export async function judgeStatements(page: Page, answers: [RegExp, string][]) {
  for (const [statement, status] of answers) await page.getByRole("group", { name: statement }).getByRole("radio", { name: status }).check();
  await check(page);
}

export async function completeM08(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Zoom in and look/, "Fairly");
  for (const lead of ["Search for earlier copies", "Check the river-level record", "Phone the café", "Message the account"]) await followLead(page, lead);
  await page.getByRole("button", { name: "Finish investigating" }).click();
  await judgeStatements(page, [
    [/taken before today/, "Established"],
    [/is flooded this morning/, "Contradicted"],
    [/failed to warn/, "Contradicted"],
    [/knowing it was old/, "Still uncertain"],
    [/shared about 4,000/, "Established"],
  ]);
  await cont(page);
  await page.getByLabel(/Little: an unedited photo/).check();
  await check(page);
  await cont(page);
  await page.getByLabel(/Publish a short report/).check();
  await check(page);
  await cont(page);
  await revise(page, /It backs up the gauge/, "Somewhat");
  for (const lead of ["Read the transcript", "Search for where the wording", "Look at the account"]) await followLead(page, lead);
  await page.getByRole("button", { name: "Finish investigating" }).click();
  await judgeStatements(page, [
    [/in her 3 May speech/, "Contradicted"],
    [/first appeared as satire/, "Established"],
    [/meant to deceive/, "Still uncertain"],
    [/shared about 2,000/, "Established"],
  ]);
  await cont(page);
  await writeNote(page, [
    [/^What is established/, "PRIVATE-M08-ANSWER. The line isn't in the transcript."],
    [/^What is still uncertain/, "Who made the screenshot."],
    [/^What the paper should do/, "Publish a short correction."],
  ]);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export const setThreshold = (page: Page, value: number) => page.getByLabel(/^Threshold: invite everyone/).fill(String(value));

export async function completeM09(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Agreed: one pass mark/);
  await setThreshold(page, 63);
  await page.getByRole("button", { name: "Check this setting" }).click();
  await page.getByRole("button", { name: "Next task" }).click();
  await page.getByRole("radio", { name: "Revised score" }).check();
  await setThreshold(page, 72);
  await page.getByRole("button", { name: "Check this setting" }).click();
  await cont(page);
  const place: [RegExp, string][] = [
    [/How many qualified applicants/, "Evidence can settle it"],
    [/marks people down/, "Evidence can settle it"],
    [/worse than inviting a weak one/, "A choice that needs justifying"],
    [/equal error rates/, "A choice that needs justifying"],
    [/automated screen at all/, "A choice that needs justifying"],
  ];
  for (const [item, cat] of place) await page.getByLabel(item).selectOption({ label: cat });
  await check(page);
  await cont(page);
  await page.getByLabel(/Other groups weren't checked/).check();
  await check(page);
  await cont(page);
  await revise(page, /Something it does see/);
  await page.getByLabel(/label reflects transport/).check();
  await check(page);
  await cont(page);
  await pickAndImprove(page, /Stop double-booking on the prediction/, "PRIVATE-M09-ANSWER");
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function setStep(page: Page, step: string, option: RegExp) {
  await page.getByRole("group", { name: step, exact: true }).getByRole("radio", { name: option }).check();
}

export async function diagnose(page: Page, answers: [RegExp, string][]) {
  for (const [test, step] of answers) await page.getByLabel(test).selectOption({ label: step });
  await page.getByRole("button", { name: "Check my diagnosis" }).click();
}

export async function completeM12(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Good idea: a more capable model/);
  await page.getByRole("button", { name: "Run the tests" }).click();
  await diagnose(page, [
    [/library open on Saturday/, "Where answers come from"],
    [/parking for the new pottery/, "Where answers come from"],
    [/forwards a flyer/, "Text inside attachments"],
    [/Tuesday's IT class/, "When the booking system is down"],
    [/charged twice/, "Sending replies"],
  ]);
  await setStep(page, "Where answers come from", /Commons handbook/);
  await setStep(page, "When the sources don't cover it", /pass the email to staff/);
  await setStep(page, "Text inside attachments", /Treat it as content/);
  await setStep(page, "Sending replies", /money or complaints/);
  await setStep(page, "When the booking system is down", /Tell the member/);
  await page.getByRole("button", { name: "Run the tests again" }).click();
  await cont(page);
  await page.getByLabel(/Start with a small group/).check();
  await check(page);
  await cont(page);
  await revise(page, /In the workflow: keep the copy/);
  await page.getByRole("button", { name: "Run the tests" }).click();
  await diagnose(page, [
    [/recycling collected/, "Where answers come from"],
    [/bank holiday/, "Where answers come from"],
    [/wasn't emptied/, "Missed collections"],
  ]);
  await setStep(page, "Where answers come from", /collection calendar/);
  await setStep(page, "Holiday changes", /service-change notices/);
  await setStep(page, "Missed collections", /Log it/);
  await page.getByRole("button", { name: "Run the tests again" }).click();
  await cont(page);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-M12-ANSWER");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function choosePlan(page: Page, options: RegExp[]) {
  for (const o of options) await page.getByRole("checkbox", { name: o }).check();
  await page.getByRole("button", { name: "Check my plan" }).click();
}

export async function completeM13(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Agreed, as long as the saving/);
  for (const lead of ["Read the Kelmere pilot", "Read the residents' digital", "Talk to the disability", "Read the finance", "Talk to the residents' association"]) await followLead(page, lead);
  await page.getByRole("button", { name: "Finish investigating" }).click();
  await judgeStatements(page, [
    [/most routine enquiries/, "Established"],
    [/shut some residents out/, "Established"],
    [/carbon emissions/, "Still uncertain"],
    [/depends on halving/, "Established"],
    [/every time/, "Contradicted"],
  ]);
  await cont(page);
  await choosePlan(page, [/staffed phone line/, /talk to a person/, /monthly review/]);
  await cont(page);
  await page.getByLabel(/Adopt it from April, with the panel's/).check();
  await check(page);
  await cont(page);
  await revise(page, /Who the other 10% were/);
  await choosePlan(page, [/chest pain/, /callback/, /five most-spoken/]);
  await cont(page);
  await writeNote(page, [
    [/^What the council should do/, "PRIVATE-M13-ANSWER. Adopt it with the conditions."],
    [/^The evidence for it/, "Kelmere resolved 70% of chat enquiries."],
    [/^Who gains/, "Most residents gain; residents without internet bear the costs."],
    [/^What new information/, "More wrong benefits answers than Kelmere's."],
  ]);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

async function reviseAndFinish(page: Page, answer: RegExp) {
  await revise(page, answer);
}

export async function completeB01(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Ask it for the whole FAQ/);
  await assignRoles(page, [
    ["Find the most common questions", "AI-assisted"],
    ["Draft the answers", "AI-assisted"],
    ["Decide the refund policy wording", "Human-led"],
  ]);
  await cont(page);
  await pickPart(page, "Objective", /When is the Commons open/);
  await pickPart(page, "Context", /current hours/);
  await pickPart(page, "What it must include", /noticeboard/);
  await pickPart(page, "Length and style", /Under 50 words/);
  await runIt(page);
  await judgeChecklist(page, [/answers the question asked/, /hours come from you/, /holiday changes/, /short and plain/]);
  await markAndCheck(page, [/Children under 12/, /family room/, /children's activities are free/]);
  await page.getByLabel(/Remove it, or check it/).check();
  await check(page);
  await cont(page);
  await reviseAndFinish(page, /Check the ones that state times/);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeB03(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /On spelling and layout/);
  await markAndCheck(page, [/^Haddad,$/, /asylum case/, /Canal Street/, /Note for the AI/]);
  await followLead(page, "Check the file's history");
  await followLead(page, "Look for consent forms");
  await page.getByRole("button", { name: "Finish investigating" }).click();
  await judgeStatements(page, [
    [/opening night/, "Contradicted"],
    [/consent to show/, "Contradicted"],
    [/meant to mislead/, "Still uncertain"],
  ]);
  await cont(page);
  await page.getByLabel(/State what was checked/).check();
  await check(page);
  await cont(page);
  await page.getByLabel(/A note saying it was written with AI/).check();
  await check(page);
  await cont(page);
  await reviseAndFinish(page, /How many were asked and answered/);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeC01Scope(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await assignRoles(page, [
    ["Answer questions about courses", "Supervised automation"],
    ["Tell residents if they qualify for council tax support", "Human-led"],
    ["Respond to messages suggesting someone is at risk", "Human-led"],
    ["Translate event listings into five languages", "AI-assisted"],
  ]);
  await cont(page);
  await markAndCheck(page, [/Mrs Patricia Lowe/, /07700 900812/, /D\. Mensah/, /Account 4471-22/]);
  await page.getByLabel(/A named service owner/).check();
  await check(page);
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeC01Evidence(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await markAndCheck(page, [/found it 95% accurate/, /equally accurate/, /every conversation mentioning/], "Audit the claims");
  const save = { independent: true };
  await auditClaim(page, /found it 95% accurate/, { ...save, passage: "trial-accuracy", calc: "90.5", status: "Incorrect", action: "Correct", repair: ["950", "1,050", "90"], reason: "PRIVATE-C01-REASON" });
  await auditClaim(page, /equally accurate/, { ...save, passage: "trial-languages", status: "Incorrect", action: "Correct", repair: ["67", "63"] });
  await auditClaim(page, /every conversation mentioning/, { ...save, passage: "trial-risk", status: "Supported", action: "Retain" });
  await page.getByRole("button", { name: "Submit the audit" }).click();
  await page.getByRole("button", { name: "See the final briefing" }).click();
  await cont(page);
  await chartView(page, ["Correct answers per 100 questions"], "Continue");
  await page.getByLabel(/Launch only in English/).check();
  await check(page);
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeC01Workflow(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await page.getByRole("button", { name: "Run the tests" }).click();
  await diagnose(page, [
    [/Spanish beginners/, "Where answers come from"],
    [/lost my job/, "Questions about entitlements"],
    [/scared to go home/, "Messages suggesting someone is at risk"],
    [/message in Polish/, "Messages in other languages"],
    [/new community hall/, "Where answers come from"],
  ]);
  await setStep(page, "Where answers come from", /published pages/);
  await setStep(page, "Questions about entitlements", /book a call/);
  await setStep(page, "Messages suggesting someone is at risk", /hand over to the duty officer/);
  await setStep(page, "Messages in other languages", /interpreter/);
  await setStep(page, "When the pages don't cover it", /pass it to staff/);
  await page.getByRole("button", { name: "Run the tests again" }).click();
  await cont(page);
  await page.getByLabel(/Launch in stages/).check();
  await check(page);
  await cont(page);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}

export async function completeC01Review(page: Page) {
  await cont(page); // brief, with the refresher folded in
  await recordJudgment(page, /Sound certain anyway/);
  await choosePlan(page, [/Interpreter calls/, /staffed phone line/, /weekly independent check/]);
  await cont(page);
  await skipPractice(page);
  await page.getByLabel("Your answer").fill("PRIVATE-C01-MEMO: launch in English with interpreter calls.");
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await page.getByLabel(/The independent trial found/).check();
  await check(page);
  await cont(page);
  await skipPractice(page);
  await expect(page.getByText(/PRIVATE-C01-MEMO: launch in English/)).toBeVisible();
  await page.getByRole("button", { name: "Start from your first version" }).click();
  await expect(page.getByLabel("Your answer")).toHaveValue(/PRIVATE-C01-MEMO/);
  await page.getByRole("button", { name: "Compare with the criteria" }).click();
  await cont(page);
  await reviseAndFinish(page, /Check the new figures/);
  await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
}
