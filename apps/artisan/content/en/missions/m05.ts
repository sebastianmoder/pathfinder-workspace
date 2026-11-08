import type { Choice, DialogueChoice, DialogueStrategy, MapQuestion, Mission, Source } from "../../types";

/**
 * M05 — The Argument Forge.
 * All organisations, documents, people and figures are fictional.
 * Arithmetic to re-check on review: 61→74 is +13 points; 59→63 is +4 points; €6,000 is half of €12,000;
 * 7 of 50 answers wrong leaves 43 right. Rafael's "40% more homework" is deliberately false: it borrows the brochure's figure.
 *
 * Shape (rebuilt 2026-11-08): take the proposal memo apart one question at a time (map), then defend your own
 * position against three objections (forge), then revise and write the case. Each character has one job:
 * Nadia checks evidence, Imani asks what an argument takes for granted, Rafael objects.
 */

const positionQuestion =
  "Three of the six volunteers at the Commons' Wednesday homework drop-in are leaving in December. The proposal is to replace the drop-in with an AI tutor. What should the Commons do?";
const positionChoices: Choice[] = [
  {
    id: "adopt",
    label: "Adopt the tutor as proposed.",
    verdict: "defensible",
    explanation: "Defensible if you can answer the objections: wrong answers given without doubt, the data terms, and the visits that are not about homework. It needs reasons for why those can be managed.",
  },
  {
    id: "pilot",
    label: "Try it for a limited time, with conditions.",
    verdict: "defensible",
    explanation: "Defensible if the conditions are specific: what you would measure, who checks the answers, and what would make you stop. Without those, a pilot only postpones the decision.",
  },
  {
    id: "reject",
    label: "Do not adopt it. Find another way to keep the drop-in going.",
    verdict: "defensible",
    explanation: "Defensible if you face the cost: three volunteers are still leaving. It needs a realistic answer for what happens to the 18 learners on Wednesdays.",
  },
];

const sources: Source[] = [
  {
    id: "brochure",
    title: "Brightpath Tutor brochure",
    description: "Sales material from the company that sells the tutor.",
    date: "2026",
    passages: [
      { id: "brochure-claim", text: "Students finish homework 40% faster with Brightpath Tutor." },
      { id: "brochure-hours", text: "Available 24 hours a day, on any device." },
      { id: "brochure-price", text: "A licence for one site costs €6,000 per year." },
    ],
  },
  {
    id: "eastfield",
    title: "Eastfield Library trial report",
    description: "Report written by library staff on an eight-week trial with 40 learners aged 11 to 14.",
    date: "February 2026",
    passages: [
      { id: "eastfield-result", text: "Homework completion rose from 61% to 74% among learners using the tutor, and from 59% to 63% among those not using it. Learners chose for themselves whether to use the tutor." },
      { id: "eastfield-check", text: "In a spot check of 50 maths answers, the tutor gave 7 wrong answers. None of the wrong answers showed any sign of uncertainty." },
    ],
  },
  {
    id: "log",
    title: "Wednesday drop-in log",
    description: "Internal record kept by Commons staff.",
    date: "Autumn 2026",
    passages: [
      { id: "log-numbers", text: "The drop-in averages 18 learners per session, with six volunteers. Three volunteers leave in December." },
      { id: "log-purpose", text: "About a third of visits are for help with forms or with English rather than with homework." },
    ],
  },
  {
    id: "privacy",
    title: "Privacy officer's note",
    description: "Note from the Commons privacy officer after reading the vendor's terms.",
    date: "October 2026",
    passages: [
      { id: "privacy-terms", text: "The vendor's standard terms keep learners' messages for 12 months and allow them to be used to improve the product." },
      { id: "privacy-minors", text: "Many drop-in learners are under 16, so parental consent would be needed." },
    ],
  },
  {
    id: "budget",
    title: "Trust funding letter",
    description: "Funding letter from the Riverside Community Trust to the Commons director.",
    date: "April 2026",
    passages: [{ id: "budget-amount", text: "The Trust will provide €12,000 towards the homework programme for the 2026–27 programme year." }],
  },
];

/**
 * The map: two reasons, then the three steps the memo takes. Every "assume" question has the same three kinds of
 * wrong answer, which the how-to names: something already stated, something not needed, or the reason or
 * conclusion said again.
 */
const questions: MapQuestion[] = [
  {
    id: "back-r1",
    stage: "back",
    speakerId: "nadia",
    target: { reason: "r1", at: "evidence" },
    prompt: "The first reason is that the drop-in can't carry on as it is after December. Which passage backs that?",
    choices: [
      { id: "numbers", label: "Drop-in log: 18 learners a session, six volunteers, three leaving in December.", verdict: "correct", explanation: "This is the recorded fact behind the reason. Half the volunteers are going, and the learners aren't." },
      { id: "budget", label: "Trust letter: the Trust will give €12,000 towards the homework programme for 2026–27.", verdict: "weaker", explanation: "This says the money is there. If anything it suggests the programme could carry on in some form, so it doesn't back the reason." },
      { id: "purpose", label: "Drop-in log: about a third of visits are for forms or English.", verdict: "weaker", explanation: "This is about what learners come for, not about whether the drop-in can keep running." },
    ],
    fills: { text: "Drop-in log: three of six volunteers leave in December, with 18 learners a session." },
  },
  {
    id: "back-r2",
    stage: "back",
    speakerId: "nadia",
    target: { reason: "r2", at: "evidence" },
    prompt: "The second reason says the tutor helps learners get their homework done, and that “the evidence is clear”. Which passage is real evidence for it?",
    choices: [
      { id: "trial", label: "Eastfield trial: completion rose from 61% to 74% among tutor users, and 59% to 63% among others.", verdict: "correct", explanation: "This is a measured result from a named trial, and it bears directly on the reason. Whether it shows what the memo needs is the next question." },
      { id: "brochure", label: "Brochure: students finish homework 40% faster with Brightpath Tutor.", verdict: "weaker", explanation: "This is the seller's own claim, and it names no study. You can note it as what the vendor says, but it can't carry the reason." },
      { id: "check", label: "Eastfield trial: in a spot check, 7 of 50 maths answers were wrong, with no sign of doubt.", verdict: "weaker", explanation: "This is about accuracy, and it counts against the tutor. It doesn't show that the tutor helps learners finish." },
    ],
    fills: { text: "Eastfield trial: completion up 13 points among tutor users, and 4 among others." },
  },
  {
    id: "assume-trial",
    stage: "assume",
    speakerId: "imani",
    target: { reason: "r2", at: "evidenceLink" },
    prompt: "The Eastfield figures only back the second reason if something else is true, and the memo never says it. What is it?",
    choices: [
      { id: "cause", label: "The rise came from the tutor, not from which learners chose to use it.", verdict: "correct", explanation: "The reason needs the tutor to be the cause. The memo never says so, and if it were false the figures wouldn't back the reason." },
      { id: "ages", label: "The Eastfield trial ran for eight weeks with 40 learners aged 11 to 14.", verdict: "weaker", explanation: "The report says this openly, so it isn't hidden. And the step from the figures to the reason doesn't depend on how long the trial ran or who was in it." },
      { id: "restated", label: "The tutor helps learners get their homework done.", verdict: "weaker", explanation: "That is the reason itself. A hidden assumption is what connects the evidence to it." },
    ],
    fills: { text: "Takes for granted: the tutor caused the rise, not who chose to use it." },
  },
  {
    id: "check-trial",
    stage: "check",
    speakerId: "nadia",
    target: { reason: "r2", at: "evidenceLink" },
    prompt: "Does the source pack show that the tutor caused the rise?",
    choices: [
      { id: "unsettled", label: "Not settled: learners chose for themselves whether to use it.", verdict: "correct", explanation: "Keen learners may have picked the tutor and improved anyway. That doesn't show the tutor did nothing. It means you can't credit the whole gain to it." },
      { id: "holds", label: "Yes: tutor users gained 13 points and other learners only 4, a clear gap.", verdict: "weaker", explanation: "That gap is exactly what needs explaining. If keener learners chose the tutor, they might have gained more anyway." },
      { id: "fails", label: "No: the spot check found 7 wrong answers in 50.", verdict: "weaker", explanation: "That is about whether the answers were right, which is a separate question. It says nothing about what caused the rise in completion." },
    ],
    fills: { text: "Not settled: learners chose for themselves.", status: "unsettled" },
  },
  {
    id: "assume-purpose",
    stage: "assume",
    speakerId: "imani",
    target: { reason: "r2", at: "reasonLink" },
    prompt: "Suppose the tutor does help with homework. For that to justify replacing the whole drop-in, what else has to be true?",
    choices: [
      { id: "homework", label: "Homework is what learners come to the drop-in for.", verdict: "correct", explanation: "A homework tutor can only replace the drop-in if homework is what the drop-in does. The memo never says so." },
      { id: "hours", label: "The tutor can be used at any hour, 24 hours a day.", verdict: "weaker", explanation: "The brochure says so openly. It counts in the tutor's favour, but it doesn't connect homework help to replacing the drop-in." },
      { id: "volunteers", label: "Three of the six volunteers leave in December.", verdict: "weaker", explanation: "That is stated, and it belongs to the other reason. It doesn't bridge this step." },
    ],
    fills: { text: "Takes for granted: homework is what learners come for." },
  },
  {
    id: "check-purpose",
    stage: "check",
    speakerId: "nadia",
    target: { reason: "r2", at: "reasonLink" },
    prompt: "Does the source pack show that homework is what learners come for?",
    choices: [
      { id: "partly", label: "Only partly: about a third of visits are for forms or English.", verdict: "correct", explanation: "The log records what people actually come for. A homework tutor would leave a third of visits with nowhere to go." },
      { id: "name", label: "Yes: it is a homework drop-in, so homework is what it's for.", verdict: "weaker", explanation: "The name says what it was set up for. The log records what people actually come for, and a third of visits are something else." },
      { id: "silent", label: "The pack doesn't say what visits are for.", verdict: "weaker", explanation: "The drop-in log does: about a third of visits are for help with forms or with English." },
    ],
    fills: { text: "Only partly: a third of visits are for forms or English.", status: "fails" },
  },
  {
    id: "assume-only",
    stage: "assume",
    speakerId: "imani",
    target: { reason: "r1", at: "reasonLink" },
    prompt: "The drop-in can't carry on as it is. Why should that lead to the tutor in particular? What does the memo take for granted here?",
    choices: [
      { id: "only", label: "That nothing else could keep the drop-in going.", verdict: "correct", explanation: "The memo goes straight from “it can't carry on” to “replace it with the tutor”. That only follows if there is no other way, and it never says so." },
      { id: "rest", label: "That the other three volunteers will leave as well.", verdict: "weaker", explanation: "The argument doesn't need this. Losing three of six is already the problem it describes." },
      { id: "conclusion", label: "That the Commons should replace the drop-in with the tutor.", verdict: "weaker", explanation: "That is the conclusion. The hidden assumption is what gets you from the reason to it." },
    ],
    fills: { text: "Takes for granted: nothing else could keep the drop-in going." },
  },
  {
    id: "check-only",
    stage: "check",
    speakerId: "nadia",
    target: { reason: "r1", at: "reasonLink" },
    prompt: "Does the source pack show that nothing else could keep the drop-in going?",
    choices: [
      { id: "unchecked", label: "Nobody has checked: the pack says nothing about other options.", verdict: "correct", explanation: "There is nothing on recruiting volunteers, sharing staff or changing the sessions. The memo assumes the question is closed when nobody has asked it." },
      { id: "holds", label: "Yes: three of the six volunteers are leaving in December.", verdict: "weaker", explanation: "That shows there is a problem. It doesn't show the tutor is the only answer to it." },
      { id: "fails", label: "No: the Trust's €12,000 could pay for staff instead.", verdict: "weaker", explanation: "The Trust letter gives the amount, but not whether it could pay staff. That goes beyond what the pack says." },
    ],
    fills: { text: "Not checked: nothing in the pack on recruiting or other options.", status: "unchecked" },
  },
];

const move = (id: string, strategy: DialogueStrategy, label: string, note: string, next: string): DialogueChoice => ({
  id,
  strategy,
  label,
  note,
  next,
});
const scored = (choice: DialogueChoice, item: string, right: boolean): DialogueChoice => ({ ...choice, scored: { item, right } });

// Round 1: each opening's replies answer that opening. The objection holds in every case.
const checkAnswers = scored(
  move("check", "concede", "That holds. A volunteer would have to spot-check its answers, so I'll make that a condition.", "His point was true, so you conceded it and turned it into a condition. That makes your position stronger, not weaker.", "misquote"),
  "answer-objection",
  true,
);
const stillRose = scored(
  move("completion", "restate", "Completion still went up, so a few wrong answers don't matter much.", "Finishing homework and getting it right are different things. The objection still stands, and you haven't answered it.", "misquote"),
  "answer-objection",
  false,
);
const recruitPlan = scored(
  move("plan", "concede", "That's a real cost. I'd recruit volunteers and narrow the sessions until we have them.", "You accepted the cost of your own position and said how you would meet it. That is what answering an objection looks like.", "misquote"),
  "answer-objection",
  true,
);
const notMine = scored(
  move("notmine", "restate", "The tutor's risks are bigger, so that isn't my problem.", "Saying no still leaves 18 learners with fewer helpers. Brushing that cost aside leaves the objection unanswered.", "misquote"),
  "answer-objection",
  false,
);

const acceptMisquote = scored(
  move("accept", "concede", "Then the brochure's figure holds up.", "You took his word for it. The Eastfield report gives 61% to 74% against 59% to 63%. The 40% comes only from the brochure, which names no study.", "cost"),
  "misquote",
  false,
);
const misquoteCite = {
  responses: [
    {
      passageIds: ["eastfield-result"],
      note: "You showed the passage he named. It gives 61% to 74% against 59% to 63%. The 40% comes from the brochure, so he has no answer.",
      next: "cost",
      scored: { item: "misquote", right: true },
    },
  ],
  otherwise: {
    note: "That passage doesn't settle it. He named the Eastfield report, and its result passage gives 61% to 74% against 59% to 63%. The 40% is only in the brochure.",
    next: "cost",
    scored: { item: "misquote", right: false },
  },
};

export const m05: Mission = {
  id: "m05-argument",
  title: "The Argument Forge",
  outcome: "Identify assumptions, test objections, consider alternatives, and revise a position for evidence-based reasons.",
  scenario:
    "You are advising the Riverside Learning Commons, a community learning centre, on a proposal to replace a volunteer homework drop-in with an AI tutor. You will take the proposal apart, defend your own position against objections, and then decide whether it still stands.",
  approxMinutes: 16,
  meta: {
    version: "2.0",
    reviewedOn: "2026-11-08",
    reviewedBy: "Claude (rebuilt after the author's play-through found the five-bin map ambiguous; checked against PRD §7 M05; no independent subject-matter review yet)",
    sourcesToReview: ["All sources are fictional and authored for this case, so none depend on outside facts.", "Case dates are set around autumn 2026; refresh them if they start to look stale."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "The Commons board meets on Thursday to decide on a proposal: replace the Wednesday homework drop-in with an AI tutor. You will do three things. First, take the proposal apart: find what backs it and what it takes for granted. Second, defend your own position against Rafael's objections. Third, write the case you would put to the board. You don't have to change your mind, but you do have to say why your position holds.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "Four words you will need",
      body: "A reason says why someone should accept a conclusion. Evidence is a specific passage that backs a reason. A hidden assumption is something an argument needs but never says: if it were false, the step would fail. An objection is a point against a position, and it can hold up or be overstated. The source pack in this mission is complete, so you don't need anything from an earlier mission.",
    },
    { kind: "initialJudgment", id: "initial", prompt: positionQuestion, choices: positionChoices, withConfidence: true },
    {
      kind: "argumentMap",
      id: "map",
      title: "Take the proposal apart",
      intro: "Before you defend your own view, look at the proposal itself. Nadia and Imani will ask you about one part of it at a time. The map fills in as you go.",
      motifs: ["selfSelectedSample"],
      artefact: {
        kind: "document",
        title: "Proposal to the board: the Wednesday homework drop-in",
        meta: "From Dana Okafor, programmes lead · 3 November 2026",
        body: [
          "I propose that we replace the Wednesday homework drop-in with Brightpath Tutor from January.",
          "First, the drop-in can't carry on as it is after December.",
          "Second, the tutor helps learners get their homework done. The evidence is clear.",
          "I recommend we sign the licence before the volunteers leave.",
        ],
      },
      sources,
      cast: [
        { id: "nadia", name: "Nadia", role: "Evidence critic" },
        { id: "imani", name: "Imani", role: "Socratic coach" },
      ],
      conclusion: "Replace the Wednesday homework drop-in with Brightpath Tutor from January.",
      reasons: [
        { id: "r1", text: "The drop-in can't carry on as it is after December." },
        { id: "r2", text: "The tutor helps learners get their homework done." },
      ],
      questions,
      summary: {
        stands: "The first reason stands: three of the six volunteers really are leaving.",
        weaker: "The second reason is weaker than it looks. The trial can't credit the tutor, and homework is only about two-thirds of what the drop-in does.",
        open: "Nobody has asked whether anything other than the tutor could keep the drop-in going.",
      },
    },
    {
      kind: "dialogue",
      id: "forge",
      title: "Defend your position",
      intro: "Rafael argues against whichever position you took. He will raise three points. For each one, decide whether it holds. If it does, concede it and say what changes. If it doesn't, show the passage that answers it.",
      initialStepId: "initial",
      sources,
      reflectionPrompt: "What would you say to the board right now?",
      continueLabel: "Continue to your final position",
      dialogue: {
        characters: [
          { id: "rafael", name: "Rafael", role: "Opposing advocate", knows: "The case against whichever position you took. He is sometimes right, and he sometimes overstates it.", wants: "To find the weakest part of your argument." },
          { id: "imani", name: "Imani", role: "Socratic coach", knows: "What the map turned up, but not the answer here.", wants: "You to say what would have to be true for your plan to work." },
        ],
        start: "open-pilot",
        starts: { adopt: "open-against", pilot: "open-pilot", reject: "open-for" },
        discoveries: [],
        nodes: [
          {
            id: "open-against",
            speakerId: "rafael",
            text: "You'd put this in front of children? Eastfield's spot check found 7 wrong maths answers out of 50, and the tutor sounded just as sure about those. Who catches them once the volunteers have gone?",
            choices: [checkAnswers, stillRose, move("source", "evidence", "Where does that figure come from?", "Asking for the source is a fair move before you concede anything.", "against-source")],
          },
          {
            id: "against-source",
            speakerId: "rafael",
            text: "Eastfield's own trial report. It's in your source pack: 7 wrong out of 50, and none of them flagged as uncertain. So, who catches them?",
            choices: [checkAnswers, stillRose],
          },
          {
            id: "open-for",
            speakerId: "rafael",
            text: "Three of six volunteers leave in December. If you turn the tutor down, the session may shrink or close, and 18 learners lose out too. Saying no is also a decision. What's your plan for them?",
            choices: [recruitPlan, notMine, move("source", "evidence", "How do you know it's 18 learners?", "Checking his numbers before you answer is fair.", "for-source")],
          },
          {
            id: "for-source",
            speakerId: "rafael",
            text: "The drop-in log: 18 learners a session on average, six volunteers, three leaving in December. So what's your plan?",
            choices: [recruitPlan, notMine],
          },
          {
            id: "open-pilot",
            speakerId: "rafael",
            text: "A trial sounds careful, but it can be a way of putting off the decision. The volunteers leave in December either way. What result would make you stop?",
            choices: [
              scored(move("stop", "alternative", "Fair point. I'd set the stop rule now: if checked answers are still wrong as often as 7 in 50, we stop.", "You answered his question with something that could turn out to be wrong. A trial with a stop rule is a decision, not a delay.", "misquote"), "answer-objection", true),
              scored(move("see", "restate", "We'll see how it goes and decide at the end.", "That is what he warned about. A trial with no stop rule only puts the decision off.", "misquote"), "answer-objection", false),
              scored(move("careful", "restate", "Trying something first is always the careful choice.", "That restates your view without answering him. He asked what would make you stop, and you still haven't said.", "misquote"), "answer-objection", false),
            ],
          },
          {
            id: "misquote",
            speakerId: "rafael",
            text: "Before you go in, you should know Eastfield backs the brochure. Learners using the tutor finished 40% more homework. It's in their report.",
            choices: [
              acceptMisquote,
              scored(move("doubt", "restate", "That sounds too high to me.", "Your doubt is well placed, but doubt alone doesn't answer him. The report was in the source pack: 61% to 74% against 59% to 63%.", "cost"), "misquote", false),
              move("where", "evidence", "Where in the report does it say that?", "Asking where a figure comes from is the right instinct. Now check it.", "misquote-where"),
            ],
            cite: misquoteCite,
          },
          {
            id: "misquote-where",
            speakerId: "rafael",
            text: "In the results. Look it up if you don't believe me.",
            choices: [
              { ...acceptMisquote, label: "Fine, I'll take your word for it." },
              scored(move("doubt", "restate", "I still think it sounds too high.", "He told you where to look, and the passage was in the source pack: 61% to 74% against 59% to 63%. Doubt without the passage leaves him unanswered.", "cost"), "misquote", false),
            ],
            cite: misquoteCite,
          },
          {
            id: "cost",
            speakerId: "rafael",
            text: "Here's a number nobody has mentioned. A licence costs €6,000 a year. That's half of what the Trust gives the whole homework programme this year.",
            choices: [
              scored(move("accept-cost", "concede", "That's right, and my case has to account for it.", "He is right: the brochure gives €6,000 and the Trust letter €12,000. Conceding what holds up is part of arguing well.", "alternatives"), "concede", true),
              scored(move("reject-cost", "restate", "You would say that. I don't accept the figure.", "The figure comes from the sources: €6,000 in the brochure, €12,000 in the Trust letter. Being on the other side doesn't make someone wrong.", "alternatives"), "concede", false),
            ],
            cite: {
              responses: [
                {
                  passageIds: ["brochure-price", "budget-amount"],
                  note: "You checked it, and it holds. Going to the source and then accepting what you find is the same habit as catching a misquote.",
                  next: "alternatives",
                  scored: { item: "concede", right: true },
                },
              ],
              otherwise: {
                note: "That passage doesn't bear on the cost. The brochure gives €6,000 and the Trust letter €12,000, so his figure holds.",
                next: "alternatives",
                scored: { item: "concede", right: false },
              },
            },
          },
          {
            id: "alternatives",
            speakerId: "imani",
            text: "The map showed the memo takes for granted that it's the tutor or nothing. Nadia has also flagged the data terms: messages kept for 12 months, and many learners under 16. So what will you put to the board?",
            choices: [
              move("alongside", "alternative", "Keep the remaining volunteers and add the tutor under supervision, with answer checks and new data terms.", "This keeps people in the loop and covers the forms and English visits, but three volunteers would be doing more. Your case should say how.", "closing"),
              move("recruit", "alternative", "Recruit volunteers and narrow the drop-in for now, with no tutor.", "This avoids the tutor's risks and its €6,000, but it needs a realistic recruitment plan and an answer for learners in the meantime.", "closing"),
              move("review", "alternative", "Replace the drop-in as proposed, and review it after one term.", "This acts before December, but the data terms and the third of visits that aren't homework are still unanswered. A review only helps if you decide now what would stop it.", "closing"),
            ],
          },
          {
            id: "closing",
            speakerId: "imani",
            text: "Good. You've heard the strongest points against you, and you know what the proposal takes for granted. Now answer the first question again.",
            choices: [],
          },
        ],
      },
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `You have taken the proposal apart and tested your position. Answer the first question again. Keeping your answer is fine if your reasons hold. ${positionQuestion}`,
      choices: positionChoices,
      withConfidence: true,
    },
    {
      kind: "openResponse",
      id: "argument",
      prompt: "Write the case you would put to the board, one part in each box.",
      format: "structured",
      fields: [
        { id: "position", label: "Your position" },
        { id: "evidence", label: "The strongest evidence for it" },
        { id: "objection", label: "The strongest objection, and your answer to it" },
        { id: "change", label: "What would change your mind" },
      ],
      rubric: {
        samples: [
          { id: "thin", text: "We should try the tutor, because AI is the future and something has to be done before December.", met: ["position"], note: "It takes a position, but it rests on opinion, answers no objection and says nothing that could change it." },
          {
            id: "full",
            text: "Trial the tutor for one term, with a volunteer checking answers. Eastfield's completion rose from 61% to 74%, though learners chose for themselves. The 7 wrong answers in 50 are why a person checks. If checked errors stay at that level, we stop.",
            met: ["position", "evidence", "objection", "change"],
            note: "It takes a position, rests on a finding and admits its limit, answers the error objection, and says what result would stop it.",
          },
        ],
        criteria: [
          { id: "position", text: "States a clear position." },
          { id: "evidence", text: "Rests on a specific finding from the source pack, and doesn't claim more than it shows." },
          { id: "objection", text: "Answers a real objection instead of ignoring it." },
          { id: "change", text: "Names a result or finding that would change the position." },
        ],
        examples: [
          "Trial the tutor for one term alongside the remaining volunteers. Completion rose more among tutor users at Eastfield, though learners chose for themselves. The strongest objection is the 7 wrong answers in 50, so a volunteer spot-checks answers, and we need new data terms and parental consent. If checked errors stay at that level, we stop.",
          "Don't replace the drop-in. A third of visits are for forms or English, which a homework tutor wouldn't cover, and the licence would take half of this year's €12,000. The strongest objection is that three volunteers are leaving, so we narrow the sessions and recruit. If recruitment brings in nobody by January, I'd look at the tutor again.",
        ],
      },
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new case, with no hints",
      prompt: "A town's transport office argues for replacing its bus information desk. Mark the words where the argument takes more for granted than its reason shows.",
      mark: [
        [
          "“",
          { id: "most", text: "Most riders", target: false, optional: true, explanation: "“Most” is fine on its own. It matters because the conclusion says “everyone”, so marking it is also reasonable." },
          " ",
          { id: "phone", text: "have a smartphone,", target: true, explanation: "Owning a phone isn't the same as being able and willing to use a chatbot on it. The argument treats them as the same." },
          " so ",
          { id: "chatbot", text: "an AI chatbot", target: false, explanation: "Naming the proposal isn't a leap. The leaps are in what it is said to do." },
          " ",
          { id: "replace", text: "can replace the bus information desk", target: false, optional: true, explanation: "This is the conclusion. It does depend on the chatbot being good enough, so marking it is also reasonable." },
          " and ",
          { id: "everyone", text: "will serve everyone.", target: true, explanation: "The reason covers most riders, and the conclusion says everyone. Nothing bridges that gap." },
          "”",
        ],
      ],
    },
    {
      kind: "openResponse",
      id: "strengthen",
      prompt: "Back to the transport office. Find the strongest version of the case for the chatbot, then say what evidence would change your own view of it.",
      format: "pickImprove",
      drafts: [
        {
          id: "hours",
          label: "A chatbot answers at any hour and on every route, and frees desk staff for riders with harder problems.",
          verdict: "correct",
          explanation: "It gives the case its best reasons, availability and staff time, without the leap you just marked. It doesn't yet say what would change your mind.",
        },
        {
          id: "phones",
          label: "Most riders have a smartphone now, so a chatbot is simply the modern way to give bus information.",
          verdict: "weaker",
          explanation: "This rests on the very leap you marked, from owning a phone to being served by a chatbot, so it is the easiest version to knock down.",
        },
        {
          id: "cost",
          label: "Chatbots cost less than staff, and the technology is getting better every year, so it will only improve.",
          verdict: "weaker",
          explanation: "Cost and progress are reasons of a kind, but nothing here is about this service or these riders, so it is weaker than it sounds.",
        },
      ],
      improvePrompt: "Improve it: add the evidence that would change your own view, and in which direction.",
      rubric: {
        criteria: [
          { id: "steelman", text: "Gives the chatbot case a fair reason, such as longer hours or staff time, instead of a weak version that is easy to dismiss." },
          { id: "evidence", text: "Names specific evidence that could be collected, such as who uses the desk and why." },
          { id: "change", text: "Says what result would change the view, and in which direction." },
        ],
        examples: [
          "The best case is that a chatbot answers at any hour and frees staff for harder problems. I would change my view if records showed that most desk visits are simple questions from people who already use their phones for travel.",
          "A chatbot could serve far more riders than a desk open a few hours a day. I am doubtful, but a trial showing that older riders and riders without smartphones still got answers some other way would persuade me.",
        ],
      },
    },
    {
      kind: "epilogue",
      id: "board",
      title: "Thursday's board meeting",
      when: "Thursday evening, and the term after",
      lines: [
        {
          id: "decision",
          beats: [
            { tone: "cost", when: { choice: { step: "revision", ids: ["adopt"] } }, text: "The board adopted the tutor from January. Learners used it most in the evenings, when the Commons is closed. The forms and English help had nowhere to go until two volunteers started a Saturday slot in March." },
            { tone: "gain", when: { choice: { step: "revision", ids: ["pilot"] } }, text: "The board agreed a one-term trial, with a volunteer checking answers and a stop rule written into the minutes. The forms and English help stayed with the remaining volunteers." },
            { tone: "gain", text: "The board kept the drop-in and narrowed it to two rooms. A recruitment drive found two new volunteers by February. The third gap took until spring to fill." },
          ],
        },
        {
          id: "misquote",
          beats: [
            { who: "Nadia, evidence critic", tone: "gain", when: { evidence: { item: "forge/misquote", right: true } }, text: "“When a trustee repeated the 40% figure, you had the Eastfield passage ready. It never made it into the minutes.”" },
            { who: "Nadia, evidence critic", tone: "harm", text: "“The 40% figure went into the minutes as Eastfield's finding. I had to send a correction a week later, and two trustees had already quoted it.”" },
          ],
        },
        {
          id: "cost",
          beats: [
            { tone: "gain", when: { evidence: { item: "forge/concede", right: true } }, text: "The treasurer asked about the €6,000 licence. Your case had already counted it against the Trust's €12,000." },
            { tone: "cost", text: "The treasurer raised the €6,000 licence, half of this year's grant. Your case hadn't mentioned it, and the vote was put off for a week." },
          ],
        },
      ],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "An argument is only as strong as what it takes for granted. Find the step it never states, check it against the evidence, and concede what holds.",
      skills: [
        {
          id: "back-reasons",
          label: "Matching each reason to the evidence that actually backs it",
          kind: "action",
          items: ["back-r1", "back-r2"].map((id) => `map/${id}`),
        },
        {
          id: "hidden-assumptions",
          label: "Finding what an argument takes for granted",
          kind: "action",
          items: ["assume-trial", "assume-purpose", "assume-only"].map((id) => `map/${id}`),
          practice: {
            prompt: "Someone argues: “The new timetable will cut queues, because the pilot branch's queues fell by a third.” Which of these is an unstated assumption of that argument?",
            choices: [
              { id: "a", label: "That the pilot branch's queues fell by a third.", verdict: "weaker", explanation: "The argument states this openly. It is the evidence, so it isn't unstated." },
              { id: "b", label: "That other branches would respond as the pilot did.", verdict: "correct", explanation: "The argument needs this to get from one branch to all of them, and it never says so." },
              { id: "c", label: "That the new timetable will cut queues everywhere.", verdict: "weaker", explanation: "This is the conclusion. The assumption is what connects the evidence to it." },
            ],
          },
        },
        {
          id: "test-assumptions",
          label: "Checking an assumption against the sources, without claiming more than they say",
          kind: "action",
          items: ["check-trial", "check-purpose", "check-only"].map((id) => `map/${id}`),
        },
        {
          id: "under-pressure",
          label: "Answering objections: conceding what holds and checking what doesn't",
          kind: "action",
          items: ["forge/answer-objection", "forge/misquote", "forge/concede"],
          practice: {
            prompt: "In a meeting, a colleague says, “The survey shows that most members want later opening.” You have the survey, and it says 41 of 90 respondents do. What is the most useful reply?",
            choices: [
              { id: "a", label: "“The survey says 41 of 90, which is just under half.”", verdict: "correct", explanation: "Bringing the passage into the conversation answers the claim, and doesn't turn it into a contest of opinions." },
              { id: "b", label: "“I don't think that's right, and I doubt most members want that.”", verdict: "weaker", explanation: "The doubt is well placed, but it gives your colleague nothing to respond to. You have the figure, so use it." },
              { id: "c", label: "“OK, if that's what the survey shows.”", verdict: "weaker", explanation: "Letting it go means the meeting decides on a figure that you know is wrong." },
            ],
          },
        },
        {
          id: "own-argument",
          label: "Writing a position that answers its strongest objection",
          kind: "reasoning",
          items: ["argument"],
        },
        {
          id: "missing-premise",
          label: "Finding a missing premise in a new case without hints",
          kind: "transfer",
          items: ["phone", "chatbot", "everyone"].map((id) => `transfer/${id}`),
          practice: {
            prompt: "A school says: “Pupils who use the homework app get better marks, so giving it to every pupil will raise marks across the school.” Which missing premise does this depend on most?",
            choices: [
              { id: "a", label: "That the app causes the better marks.", verdict: "correct", explanation: "Pupils who choose the app may already do better. The argument needs the app to be the cause, and it never shows that." },
              { id: "b", label: "That teachers will all set homework through the app.", verdict: "weaker", explanation: "This could matter in practice, but the argument is about marks rising, and it doesn't rest on this first." },
              { id: "c", label: "That licences are affordable.", verdict: "weaker", explanation: "Cost is a fair question to ask about the plan, but it isn't the gap in the reasoning." },
            ],
          },
        },
        {
          id: "steelman",
          label: "Recognising the strongest version of the other side",
          kind: "action",
          items: ["strengthen/pick"],
        },
        {
          id: "change-your-mind",
          label: "Stating what evidence would change your view",
          kind: "reasoning",
          items: ["strengthen"],
        },
      ],
      nextMissionId: "m06-gym",
    },
  ],
};
