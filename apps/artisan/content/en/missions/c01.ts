import type { AuditSpec, Choice, Mission, Rubric } from "../../types";

/**
 * C01 — The ARTISAN Commission, in four chapters that each restart on their own (PRD C01).
 * Every chapter carries the case pack it needs, so none depends on an earlier visit.
 * All organisations, people and figures are fictional.
 * Arithmetic to re-check on review: 950 of 1,050 is 90.5%; English 900/950 = 94.7%, Polish 40/60 = 66.7%,
 * Arabic 25/40 = 62.5%; 3 of 1,050 is 0.3%.
 */

const CASE =
  "The case: the Riverside Learning Commons and the town council, both fictional, plan “Riverside Answers”, an AI chat service where residents can ask about courses, council services and local events. A commission, which you lead, will recommend whether and how to launch it. Each chapter of the commission includes everything you need from the case.";

const META = {
  version: "1.0",
  reviewedOn: "2026-11-03",
  reviewedBy: "Claude (author self-review against PRD §7 C01 and §12; no independent subject-matter review yet)",
  sourcesToReview: ["All figures are fictional; the arithmetic is listed at the top of this file."],
};

const refresher = (focus: string) => ({
  kind: "refresher" as const,
  id: "refresher",
  title: "The case, and what this chapter uses",
  body: `${CASE} ${focus}`,
});

/* ---------- Chapter 1: Scope ---------- */

export const c01Scope: Mission = {
  id: "c01-scope",
  title: "The Commission, chapter 1: scope",
  outcome: "Decide what the service should do, what a person must do, and what information it should be given.",
  scenario: "You lead a commission on “Riverside Answers”, an AI chat service for residents. First, decide its scope.",
  approxMinutes: 12,
  meta: META,
  steps: [
    { kind: "brief", id: "brief", title: "Your task", body: "Assign a role for AI to each use the planners propose, and prepare the data they want to give the service. This is the capstone: there are no hints." },
    refresher("This chapter uses choosing a role for AI (the Delegation Desk) and sharing only what a task needs (the Boundary Room)."),
    {
      kind: "transfer",
      id: "uses",
      title: "Scope the service",
      prompt: "The planners propose four uses. Choose a role for AI in each.",
      delegation: {
        later: "In the six-month trial",
        support: "independent",
        tasks: [
          {
            id: "courses",
            from: "The Commons' programmes office",
            title: "Answer questions about courses",
            text: "Dates, fees and rooms, all from the published course list, which is updated weekly.",
            responsible: "The programmes office answers for course information, however it reaches residents.",
            outcomes: {
              human: { verdict: "defensible", event: "Staff answered course questions by email within two days. Accurate, but most were simple questions answered slowly.", explanation: "Sound, but the service was meant for exactly these simple, checkable questions." },
              assisted: { verdict: "defensible", event: "Staff approved each chat reply. Residents waited hours for answers to simple questions, and many gave up.", explanation: "A live chat with a person approving every reply loses most of its point for low-stakes questions." },
              automated: { verdict: "correct", event: "The service answered 2,000 course questions from the published list. A weekly sample found two out-of-date room numbers, fixed the same day.", explanation: "Public, low-stakes, easy to correct and drawn from a maintained source: this suits supervised automation." },
            },
          },
          {
            id: "benefits",
            from: "The council's benefits team",
            title: "Tell residents if they qualify for council tax support",
            text: "Residents would describe their situation, and the service would say whether they qualify.",
            responsible: "The council's benefits team answers for every eligibility decision.",
            outcomes: {
              human: { verdict: "correct", event: "The service explained the general rules and booked a call with an adviser, who made each decision.", explanation: "An eligibility decision affects money people depend on, and needs details a chat can miss. A person decides; the service helps people reach them." },
              assisted: { verdict: "defensible", event: "The service drafted an answer for an adviser to check before sending. It saved some time, but advisers often had to go back to the resident for details.", explanation: "A person still decides, but drafting from a chat description can steer the decision. Explaining the rules and booking a call worked better." },
              automated: { verdict: "weaker", event: "The service told 40 residents they didn't qualify. An audit found 6 of them did.", explanation: "Wrong refusals cost families money, and most never appeal. This decision needs a person." },
            },
          },
          {
            id: "risk",
            from: "The council's safeguarding lead",
            title: "Respond to messages suggesting someone is at risk",
            text: "Some messages may mention abuse, self-harm or a person in danger.",
            responsible: "The council's safeguarding lead answers for every response to a risk.",
            outcomes: {
              human: { verdict: "correct", event: "The service recognised risk words, gave emergency numbers immediately, and passed the conversation to the duty officer.", explanation: "The service's only job is to get a person involved fast. Everything after that is a person's work." },
              assisted: { verdict: "weaker", event: "The service drafted a reply for staff to approve. The draft waited 40 minutes in a queue.", explanation: "A queue is the wrong place for a risk. It needs an immediate handover, not an approved draft." },
              automated: { verdict: "weaker", event: "The service replied with general advice and closed the chat. Nobody followed up.", explanation: "A risk to someone's safety must never end with an automated reply." },
            },
          },
          {
            id: "events",
            from: "The council's communications team",
            title: "Translate event listings into five languages",
            text: "The weekly listings are public. Volunteers who read each language are available to check.",
            responsible: "The communications team answers for every listing in every language.",
            outcomes: {
              human: { verdict: "defensible", event: "Volunteers translated from scratch. Listings appeared a week late.", explanation: "Accurate, but the volunteers' time was better spent checking drafts." },
              assisted: { verdict: "correct", event: "Volunteers checked AI drafts in an hour a week and caught a wrong date in the Arabic listing.", explanation: "AI did the drafting, and people who can read the result checked it." },
              automated: { verdict: "weaker", event: "A wrong date went out in Polish, and a family turned up to a closed hall.", explanation: "Nobody on staff could check those languages, so nothing was supervised." },
            },
          },
        ],
      },
    },
    {
      kind: "mark",
      id: "data",
      title: "Prepare the tuning data",
      prompt: "The vendor wants a sample of past enquiries to tune the service to Riverside's questions. Remove what tuning doesn't need. Keep the questions themselves.",
      mode: "redact",
      flow: [
        { label: "The vendor", note: "Uses the sample to tune the service, and keeps it under the contract." },
        { label: "The service", note: "Learns how residents phrase their questions." },
      ],
      mark: [
        [
          "Enquiry 1. From ",
          { id: "name1", text: "Mrs Patricia Lowe", target: true, explanation: "Tuning needs the question, not who asked it." },
          " (",
          { id: "phone1", text: "07700 900812", target: true, explanation: "Contact details aren't needed for tuning." },
          "): ",
          { id: "q1", text: "“When does the Spanish beginners' course start, and how much is it?”", target: false, explanation: "This is exactly what tuning needs: how residents ask." },
        ],
        [
          "Enquiry 2. From ",
          { id: "name2", text: "D. Mensah", target: true, explanation: "A name, which tuning doesn't need." },
          ": ",
          { id: "q2", text: "“Can I pay my council tax in instalments?”", target: false, explanation: "The question itself, which is what tuning needs." },
          " ",
          { id: "case2", text: "Account 4471-22, in arrears since March, referred to enforcement.", target: true, explanation: "A financial history attached to an account: sensitive, and irrelevant to tuning." },
        ],
        [
          "Enquiry 3. ",
          { id: "q3", text: "“Is the library open on bank holidays?”", target: false, explanation: "The question." },
          " ",
          { id: "staff3", text: "Answered by Joe B.", target: false, optional: true, explanation: "A staff first name is low risk and not needed. Either is reasonable." },
        ],
      ],
    },
    {
      kind: "quiz",
      id: "owner",
      prompt: "The planners ask who should be named as responsible for the service's answers. What should the commission recommend?",
      choices: [
        { id: "a", label: "The vendor, since its system writes the answers.", verdict: "weaker", explanation: "The vendor answers for its product. Residents need someone at the council or the Commons to answer to them." },
        { id: "b", label: "A named service owner at the council, with each team owning its own content.", verdict: "correct", explanation: "One owner answers to residents for the service, and each team stays responsible for the information in its area." },
        { id: "c", label: "No one in particular, since answers are generated automatically.", verdict: "weaker", explanation: "Automation doesn't remove responsibility. If nobody owns a wrong answer, nobody fixes its cause." },
      ],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Scope the service by what a wrong answer would cost: automate the checkable, keep decisions about people with people, and share only what each task needs.",
      skills: [
        { id: "scope", label: "Scoping AI's role across a service", kind: "transfer", items: ["uses/courses", "uses/benefits", "uses/risk", "uses/events"] },
        { id: "data", label: "Minimising the data a vendor receives", kind: "transfer", items: ["data/name1", "data/phone1", "data/name2", "data/case2", "data/q1", "data/q2", "data/q3"] },
        { id: "owner", label: "Naming who answers for the service", kind: "transfer", items: ["owner"] },
      ],
      nextMissionId: "c01-evidence",
    },
  ],
};

/* ---------- Chapter 2: Evidence ---------- */

const pitch: AuditSpec = {
  support: "independent",
  reasonPrompt: "In a sentence or two, what does the evidence actually show?",
  decoys: [{ id: "future", text: "Riverside Answers will transform how residents experience public services.", explanation: "A prediction and a sales line. No record could check it." }],
  sources: [
    {
      id: "trial",
      title: "Northbrook trial evaluation",
      description: "Independent evaluation of the same service in another town, commissioned by Northbrook council.",
      date: "September 2026",
      passages: [
        { id: "trial-accuracy", text: "Of 1,050 sampled answers, reviewers judged 950 correct." },
        { id: "trial-languages", text: "English: 900 of 950 correct. Polish: 40 of 60 correct. Arabic: 25 of 40 correct." },
        { id: "trial-risk", text: "3 of the 1,050 sampled conversations mentioned a risk to someone's safety. In all 3, the service handed over to a person within one minute." },
      ],
    },
    {
      id: "brochure",
      title: "Vendor brochure",
      description: "Sales material from the company that makes the service.",
      date: "2026",
      passages: [{ id: "brochure-claim", text: "Riverside Answers delivers 95% accuracy in every language it supports." }],
    },
  ],
  briefing: [
    ["The vendor's case for Riverside Answers. ", { decoyId: "future" }, " ", { claimId: "overall" }, " ", { claimId: "languages" }, " ", { claimId: "handover" }],
  ],
  claims: [
    {
      id: "overall",
      text: "Independent evaluation found it 95% accurate [Northbrook trial evaluation].",
      status: "incorrect",
      passageIds: ["trial-accuracy"],
      bestAction: "correct",
      evidenceExplanation: "The evaluation gives 950 correct of 1,050 sampled answers.",
      statusExplanation: "950 of 1,050 is about 90%, not 95%.",
      actionExplanation: "Correct it to what the evaluation found.",
      finalText: "Independent evaluation judged 950 of 1,050 sampled answers correct, about 90% [Northbrook trial evaluation].",
      calculation: { prompt: "Work it out: what percentage of sampled answers were correct?", min: 90, max: 91, explanation: "950 of 1,050 is 90.5%." },
      repair: ["Independent evaluation judged ", { id: "correct", accept: ["950"] }, " of ", { id: "sampled", accept: ["1,050", "1050"] }, " sampled answers correct, about ", { id: "pct", accept: ["90", "91", "90.5"] }, "% [Northbrook trial evaluation]."],
      ifKept: "The council's report quoted 95%. When the evaluation was published, the council had to correct itself in public.",
    },
    {
      id: "languages",
      text: "It is equally accurate in every language it supports [Vendor brochure].",
      status: "incorrect",
      passageIds: ["trial-languages"],
      bestAction: "correct",
      defensibleActions: ["remove"],
      evidenceExplanation: "The brochure says so, but the independent evaluation breaks accuracy down by language.",
      statusExplanation: "English was 95% correct, Polish 67% and Arabic 63%. The brochure's claim is contradicted by the evaluation.",
      actionExplanation: "Replace it with the evaluation's figures. Removing it is also defensible.",
      finalText: "Accuracy varied by language: about 95% in English, 67% in Polish and 63% in Arabic [Northbrook trial evaluation].",
      repair: ["Accuracy varied by language: about 95% in English, ", { id: "polish", accept: ["67", "66.7", "66"] }, "% in Polish and ", { id: "arabic", accept: ["63", "62.5", "62"] }, "% in Arabic [Northbrook trial evaluation]."],
      ifKept: "Residents who wrote in Polish or Arabic got wrong answers a third of the time, and the council had promised otherwise.",
    },
    {
      id: "handover",
      text: "In the trial, every conversation mentioning a risk to someone's safety was handed to a person within a minute [Northbrook trial evaluation].",
      status: "supported",
      passageIds: ["trial-risk"],
      bestAction: "retain",
      evidenceExplanation: "The evaluation reports exactly this.",
      statusExplanation: "Supported, though it rests on only 3 conversations, which is worth saying in the final report.",
      actionExplanation: "Keep it.",
      finalText: "In the trial, every conversation mentioning a risk to someone's safety was handed to a person within a minute [Northbrook trial evaluation].",
      ifLost: "The commission lost the strongest evidence that the safety handover works.",
    },
  ],
};

export const c01Evidence: Mission = {
  id: "c01-evidence",
  title: "The Commission, chapter 2: evidence",
  outcome: "Check the vendor's claims against independent evidence, and test whether the headline figure holds for everyone.",
  scenario: "You lead a commission on “Riverside Answers”, an AI chat service for residents. The vendor has made its case; check it.",
  approxMinutes: 14,
  meta: META,
  steps: [
    { kind: "brief", id: "brief", title: "Your task", body: "Audit the vendor's case against an independent evaluation, and look at what its accuracy figure hides. This is the capstone: there are no hints." },
    refresher("This chapter uses checking claims against sources (the Evidence Bureau) and comparing groups fairly with rates (the Numbers Lab, the Fairness Council)."),
    {
      kind: "transfer",
      id: "pitch",
      title: "Audit the vendor's case",
      prompt: "Find the claims in the vendor's case, and check each against the evidence pack.",
      audit: pitch,
    },
    {
      kind: "chartLab",
      id: "by-language",
      title: "Look behind the headline figure",
      intro: "The vendor's chart shows how many correct answers the service gave in each language in the Northbrook trial.",
      chart: {
        claim: "Most correct answers by far are in English, which shows the service works for the town.",
        categoryLabel: "Language",
        categories: [
          { id: "en", label: "English" },
          { id: "pl", label: "Polish" },
          { id: "ar", label: "Arabic" },
        ],
        quantities: [
          { id: "correct", label: "Correct answers", values: { en: 900, pl: 40, ar: 25 } },
          { id: "asked", label: "Questions sampled", values: { en: 950, pl: 60, ar: 40 } },
        ],
        measures: [
          { id: "count", label: "Correct answers", numerator: "correct", unit: "answers" },
          { id: "rate", label: "Correct answers per 100 questions", numerator: "correct", denominator: "asked", per: 100, unit: "per 100" },
        ],
        baselines: [{ id: "zero", label: "At zero", min: 0 }],
        ranges: [{ id: "all", label: "All languages", categoryIds: ["en", "pl", "ar"] }],
        start: { measure: "count", baseline: "zero", range: "all" },
        tasks: [
          {
            id: "rate",
            title: "Compare like with like",
            instruction: "Far more questions were asked in English. Change the chart so it shows how often the service was right in each language.",
            goal: { measure: "rate" },
            solution: { measure: "rate", baseline: "zero", range: "all" },
            success: "Per 100 questions, the service was right about 95 times in English, but only about 67 times in Polish and 63 in Arabic. The overall figure was mostly English questions.",
          },
        ],
      },
    },
    {
      kind: "quiz",
      id: "matters",
      prompt: "What does the language breakdown mean for the commission's recommendation?",
      choices: [
        { id: "a", label: "Nothing much, as long as the overall figure is about 90%.", verdict: "weaker", explanation: "The overall figure hides that residents who write in Polish or Arabic are wrong a third of the time." },
        { id: "b", label: "Launch only in English, and treat other languages as a condition to fix.", verdict: "correct", explanation: "It reflects the evidence: good in English, not yet good enough elsewhere. Those residents need another route meanwhile." },
        { id: "c", label: "Reject the service, since it isn't equally good for everyone.", verdict: "defensible", explanation: "Cautious, but it denies an English service that works well to the majority. A condition can protect the others." },
      ],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Ask what a headline figure is made of: the questions, the method and the people. An average can hide the residents who most need the service to work.",
      skills: [
        { id: "audit", label: "Checking a vendor's claims against independent evidence", kind: "transfer", items: ["pitch/overall/calc", "pitch/overall/status", "pitch/languages/status", "pitch/handover/action"] },
        { id: "rates", label: "Testing a headline figure group by group", kind: "transfer", items: ["by-language/rate", "matters"] },
        { id: "spot", label: "Finding the claims in a sales pitch", kind: "transfer", items: ["overall", "languages", "handover", "future"].map((id) => `pitch/spot/${id}`) },
      ],
      nextMissionId: "c01-workflow",
    },
  ],
};

/* ---------- Chapter 3: Workflow ---------- */

export const c01Workflow: Mission = {
  id: "c01-workflow",
  title: "The Commission, chapter 3: workflow",
  outcome: "Set up and test the service's workflow so that it fails safely.",
  scenario: "You lead a commission on “Riverside Answers”, an AI chat service for residents. Test how it is set up before anyone relies on it.",
  approxMinutes: 12,
  meta: META,
  steps: [
    { kind: "brief", id: "brief", title: "Your task", body: "Configure the service from its steps, run the trial cases, diagnose the failures and fix them. This is the capstone: there are no hints." },
    refresher("This chapter uses testing a workflow (the Systems Workshop), keeping decisions about people with people (the Delegation Desk), and treating document text as content (the Boundary Room)."),
    {
      kind: "transfer",
      id: "service",
      motifs: ["inventedDetail"],
      title: "Configure and test the service",
      prompt: "Run the five trial cases, diagnose what failed, and fix it.",
      workflow: {
        input: "A resident's message",
        output: "The reply",
        support: "independent",
        start: { sources: "model", eligibility: "decide", risk: "advice", language: "translate", gaps: "guess" },
        solution: { sources: "pages", eligibility: "explain", risk: "handover", language: "english-plus", gaps: "handoff" },
        slots: [
          { id: "sources", label: "Where answers come from", help: "", options: [{ id: "model", label: "The model's own knowledge" }, { id: "pages", label: "The council's and the Commons' published pages" }] },
          { id: "eligibility", label: "Questions about entitlements", help: "", options: [{ id: "decide", label: "Tell residents whether they qualify" }, { id: "explain", label: "Explain the rules, and book a call with an adviser" }] },
          { id: "risk", label: "Messages suggesting someone is at risk", help: "", options: [{ id: "advice", label: "Reply with general advice" }, { id: "handover", label: "Give emergency numbers and hand over to the duty officer at once" }] },
          { id: "language", label: "Messages in other languages", help: "", options: [{ id: "translate", label: "Answer in the resident's language" }, { id: "english-plus", label: "Answer in English, and offer a call with an interpreter" }] },
          { id: "gaps", label: "When the pages don't cover it", help: "", options: [{ id: "guess", label: "Answer anyway" }, { id: "handoff", label: "Say it doesn't know, and pass it to staff" }] },
        ],
        tests: [
          { id: "course", input: "When does the Spanish beginners' course start?", failsWhen: [{ slot: "sources", options: ["model"], result: "It said “September”, a typical start. The course starts in January." }], passResult: "It gave the January date from the course page." },
          { id: "support", input: "I've lost my job. Do I qualify for council tax support?", failsWhen: [{ slot: "eligibility", options: ["decide"], result: "It said “No, you don't qualify.” An adviser later found that the resident did." }], passResult: "It explained the rules and booked a call with an adviser." },
          { id: "danger", input: "My neighbour's child keeps saying she's scared to go home.", failsWhen: [{ slot: "risk", options: ["advice"], result: "It replied with a list of parenting websites. Nobody was alerted." }], passResult: "It gave the emergency numbers and the duty officer called back within ten minutes." },
          { id: "polish", input: "A message in Polish about a bin collection.", failsWhen: [{ slot: "language", options: ["translate"], result: "It answered in Polish with the wrong collection day. The trial found Polish answers wrong a third of the time." }], passResult: "It answered in English and offered an interpreter call, which the resident took." },
          { id: "parking", input: "Is there parking at the new community hall?", failsWhen: [{ slot: "sources", options: ["model"], result: "It said “Yes, free parking.” There is none." }, { slot: "gaps", options: ["guess"], result: "The pages don't say, so it guessed “Yes, free parking”. There is none." }], passResult: "It said it didn't know and passed the question to staff." },
        ],
      },
    },
    {
      kind: "quiz",
      id: "ready",
      motifs: ["stagedTrial"],
      prompt: "All five trial cases now pass. What should the commission say about launch?",
      choices: [
        { id: "a", label: "Launch to everyone, since every trial case now passes.", verdict: "weaker", explanation: "Five cases are the ones someone thought of. Residents will ask others." },
        { id: "b", label: "Launch in stages, with weekly checks and a way to report bad answers.", verdict: "correct", explanation: "Staged launch with monitoring finds the failures the tests missed, while they are still few." },
        { id: "c", label: "Hold until the service is right in every language.", verdict: "defensible", explanation: "Cautious, but the English service works and the interpreter route covers other languages meanwhile." },
      ],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Design the service for the times it is wrong: reliable sources, honest gaps, decisions and risks handed to people, and monitoring after launch.",
      skills: [
        { id: "diagnose", label: "Diagnosing failures in the service's workflow", kind: "transfer", items: ["course", "support", "danger", "polish", "parking"].map((id) => `service/diagnose/${id}`) },
        { id: "fix", label: "Fixing the workflow so every trial case passes", kind: "transfer", items: ["service/fixed"] },
        { id: "launch", label: "Recommending a staged, monitored launch", kind: "transfer", items: ["ready"] },
      ],
      nextMissionId: "c01-review",
    },
  ],
};

/* ---------- Chapter 4: Review meeting ---------- */

const memoRubric = (extra?: { id: string; text: string }): Rubric => ({
  criteria: [
    { id: "benefits", text: "States the benefits, with evidence." },
    { id: "limits", text: "States the limitations, with evidence." },
    { id: "safeguards", text: "Recommends specific safeguards or conditions." },
    { id: "open", text: "Names at least one question that is still unresolved." },
    ...(extra ? [extra] : []),
  ],
  samples: [
    {
      id: "weak",
      text: "We recommend launching Riverside Answers. It is 95% accurate and will save time.",
      met: ["benefits"],
      note: "It repeats the vendor's figure, which the evaluation contradicts, and says nothing about limits, safeguards or open questions.",
    },
    {
      id: "strong",
      text: "Launch in English for course and event questions, which the Northbrook trial answered correctly about 95% of the time. Accuracy in Polish and Arabic was about two-thirds, so those residents should be offered an interpreter call. Eligibility decisions stay with advisers, and risks go straight to the duty officer. Conditions: a named service owner, a weekly sample check, and a review at six months. Still unresolved: whether accuracy holds for Riverside's own questions.",
      met: ["benefits", "limits", "safeguards", "open", ...(extra ? [extra.id] : [])],
      note: "Every part rests on the evidence, the conditions are specific, and the open question is honest.",
    },
  ],
  examples: [
    "Recommend a six-month staged launch. Benefits: routine questions answered instantly, at about 95% accuracy in English. Limitations: much lower accuracy in Polish and Arabic, and the trial checked only three risk conversations. Safeguards: adviser decisions on entitlements, immediate handover on risk, interpreter calls, a named owner and weekly checks. Open: how it performs on Riverside's questions.",
    "Launch for courses and events only, in English, with a weekly review of a sample of answers and a report button. Keep entitlement decisions and anything about safety with staff. The evidence for other languages isn't good enough yet. We don't yet know how residents without internet will be affected, so the walk-in desk stays as it is during the trial.",
  ],
});

const firstMove =
  "Before the council meeting, a colleague advises: “If they push back, just sound certain. Councillors respect confidence.” What is your plan instead?";
const firstChoices: Choice[] = [
  { id: "a", label: "Sound certain anyway, and don't give ground on anything.", verdict: "weaker", explanation: "Confidence persuades some people briefly. Evidence persuades, and survives being checked." },
  { id: "b", label: "Bring the evidence for each point, and say what's unknown.", verdict: "correct", explanation: "A recommendation that shows its evidence and its limits can be challenged without collapsing." },
  { id: "c", label: "Agree with whoever has the most authority in the room.", verdict: "weaker", explanation: "Authority isn't evidence. Changing your view should come from a better reason." },
];

export const c01Review: Mission = {
  id: "c01-review",
  title: "The Commission, chapter 4: the review meeting",
  outcome: "Set conditions, write an evidence-based recommendation, and revise it after a challenge.",
  scenario: "You lead a commission on “Riverside Answers”, an AI chat service for residents. The council meets to hear your recommendation.",
  approxMinutes: 15,
  meta: META,
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task and the case pack",
      body: "The findings so far: in an independent trial, about 90% of answers were correct overall, about 95% in English, and about two-thirds in Polish and Arabic. All three risk conversations were handed to a person within a minute. Eligibility decisions and risks must stay with people. Set conditions, write your recommendation, and defend it.",
    },
    refresher("This chapter brings together everything: evidence, fairness, boundaries, workflow and the views of the people affected (the Citizens' Assembly)."),
    { kind: "initialJudgment", id: "initial", prompt: firstMove, choices: firstChoices },
    {
      kind: "transfer",
      id: "conditions",
      title: "Set the conditions",
      prompt: "The council will fund up to €30,000 of conditions for the first year. Choose them.",
      allocation: {
        budget: { amount: 30000, label: "Budget for conditions", unit: "€" },
        options: [
          { id: "interpreter", label: "Interpreter calls for residents writing in other languages", cost: 10000, addresses: ["language"], note: "Slower than chat, and it depends on interpreters being available." },
          { id: "owner", label: "A named service owner, with time to handle complaints", cost: 8000, addresses: ["accountability"], note: "One person's time; complaints may outgrow it." },
          { id: "sample", label: "A weekly independent check of a sample of answers", cost: 8000, addresses: ["errors", "accountability"], note: "Finds errors after they happen." },
          { id: "desk", label: "Keep the walk-in desk's hours unchanged during the trial", cost: 15000, addresses: ["offline"], note: "Delays the savings until after the trial." },
          { id: "phone", label: "A staffed phone line for residents without internet, in place of half the desk hours", cost: 10000, addresses: ["offline"], note: "Reaches people without internet, but not those who need to come in person." },
          { id: "report", label: "A “report a wrong answer” button in every chat", cost: 2000, addresses: ["errors"], note: "Relies on residents noticing the error." },
          { id: "local", label: "A test of 500 Riverside questions before launch", cost: 6000, addresses: ["errors", "unknown"], note: "Delays launch by a month." },
        ],
        concerns: [
          { id: "language", stakeholder: "Polish and Arabic speakers", text: "Answers in their languages were wrong a third of the time.", essential: true, why: "Without another route, they get a much worse service." },
          { id: "offline", stakeholder: "Residents without internet", text: "A chat service doesn't reach them at all.", essential: true, why: "They must not lose the access they have now." },
          { id: "errors", stakeholder: "Welfare rights adviser", text: "Wrong answers will happen, and someone needs to find them.", essential: true, why: "Undetected errors repeat." },
          { id: "accountability", stakeholder: "Residents' association", text: "Residents need someone to answer to when it's wrong.", why: "Important; the planners can name an owner at no cost, but time for complaints costs money." },
          { id: "unknown", stakeholder: "The commission's own analyst", text: "The trial was in another town, with other questions.", why: "A real uncertainty, which monitoring after launch also addresses." },
        ],
      },
    },
    {
      kind: "openResponse",
      id: "memo",
      prompt: "Write the commission's recommendation to the council: whether and how to launch Riverside Answers, with its benefits, limitations, safeguards and unresolved questions.",
      rubric: memoRubric(),
    },
    {
      kind: "quiz",
      id: "challenge",
      prompt: "A councillor challenges you: “The vendor says it's 95% accurate in every language. Your conditions cost €30,000. Why not just trust the vendor?” What is the strongest reply?",
      choices: [
        { id: "a", label: "“The independent trial found Polish and Arabic far lower.”", verdict: "correct", explanation: "It answers the challenge with the specific evidence, and shows why the conditions follow from it." },
        { id: "b", label: "“AI vendors always exaggerate, so we shouldn't believe them.”", verdict: "weaker", explanation: "A generalisation, not evidence. It invites the councillor to dismiss your view the same way." },
        { id: "c", label: "“You may be right; perhaps we could drop the conditions.”", verdict: "weaker", explanation: "Changing your view is good when there's a better reason. Here the evidence is on your side." },
      ],
    },
    {
      kind: "openResponse",
      id: "memo-revised",
      priorResponse: "memo",
      prompt: "Revise your recommendation so it answers the councillor's challenge directly. You can start from your first version.",
      rubric: memoRubric({ id: "challenge", text: "Answers the challenge with specific evidence." }),
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: "A week after the meeting, a councillor emails: “New figures from Northbrook: Polish answers are now right 90% of the time.” What should happen to your recommendation?",
      choices: [
        { id: "a", label: "Nothing: the council has heard it, and changing would look weak.", verdict: "weaker", explanation: "Changing your view for a better reason is a strength. Holding on to save face is how recommendations go stale." },
        { id: "b", label: "Check the new figures, and revise the language condition if they hold.", verdict: "correct", explanation: "A recommendation built on evidence should move when the evidence does, once you know where the new figures come from and what they measured." },
        { id: "c", label: "Drop the interpreter condition now, since the problem is fixed.", verdict: "weaker", explanation: "One email isn't yet evidence. Check where the figures come from and what they measured, then decide." },
      ],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "A recommendation worth making shows its evidence, protects the people most at risk, names who answers for it, and is honest about what is still unknown.",
      skills: [
        { id: "conditions", label: "Setting conditions that protect the people most at risk", kind: "transfer", items: ["conditions/plan"] },
        { id: "memo", label: "Writing an evidence-based recommendation", kind: "reasoning", items: ["memo"] },
        { id: "defend", label: "Answering a challenge with evidence", kind: "reasoning", items: ["challenge", "revision"] },
        { id: "revise", label: "Revising a recommendation after a challenge", kind: "reasoning", items: ["memo-revised"] },
      ],
      nextMissionId: null,
    },
  ],
};
