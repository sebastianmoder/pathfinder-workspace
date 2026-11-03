import { PROPOSAL, type Choice, type DialogueChoice, type DialogueStrategy, type Mission, type Source } from "../../types";

/**
 * M05 — The Argument Forge.
 * All organisations, documents, people and figures are fictional.
 * Arithmetic to re-check on review: 61→74 is +13 points; 59→63 is +4 points; €6,000 is half of €12,000;
 * 7 of 50 answers wrong leaves 43 right. Rafael's "40% more homework" is deliberately false: it borrows the brochure's figure.
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
      { id: "brochure-claim", text: "Students finish homework 40% faster with Brightpath Tutor. Available 24 hours a day." },
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

const move = (id: string, strategy: DialogueStrategy, label: string, note: string, next: string): DialogueChoice => ({
  id,
  strategy,
  label,
  note,
  next,
});

/** Every opening offers the same four ways of responding; only Rafael's challenge differs. */
const openingMoves: DialogueChoice[] = [
  move("ask", "evidence", "What evidence do we have about the tutor itself?", "You moved the conversation from opinion to something that can be checked.", "evidence-trial"),
  move("assume", "assumption", "What is this proposal assuming about the drop-in?", "You looked underneath the argument instead of answering it head on.", "assumption-drop-in"),
  move("concede", "concede", "You have a point, and it counts against my view.", "Conceding a fair point costs you nothing and keeps the discussion honest.", "concede"),
  move("restate", "restate", "I've made up my mind, and that is my position.", "This adds no new reason, so Rafael has nothing to respond to except your certainty.", "pushback"),
];

export const m05: Mission = {
  id: "m05-argument",
  title: "The Argument Forge",
  outcome: "Identify assumptions, test objections, consider alternatives, and revise a position for evidence-based reasons.",
  scenario:
    "You are advising the Riverside Learning Commons, a fictional community learning centre, on a proposal to replace a volunteer homework drop-in with an AI tutor. You will take a position, test it in a conversation, and then decide whether it still stands.",
  approxMinutes: 18,
  meta: {
    version: "1.2",
    reviewedOn: "2026-11-02",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["All sources are fictional and authored for this case, so none depend on outside facts.", "Case dates are set around autumn 2026; refresh them if they start to look stale."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Take a position, talk it through with three characters, and map the argument. You do not have to change your mind. You do have to be able to say why your position still holds, or why it no longer does.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A claim is a statement that could be checked. Evidence is a specific passage that bears on it, and a citation is only a place to look. An assumption is something an argument needs to be true but does not say. The source pack in this mission is complete, so you do not need anything from an earlier mission.",
    },
    { kind: "initialJudgment", id: "initial", prompt: positionQuestion, choices: positionChoices },
    {
      kind: "dialogue",
      id: "forge",
      title: "Test your position",
      intro: "You have four questions before the board meets, so choose them with care. There is no winning move, but different moves uncover different things, and not everyone here is always right.",
      initialStepId: "initial",
      sources,
      reflectionPrompt: "What is on your mind about this so far?",
      dialogue: {
        characters: [
          { id: "imani", name: "Imani", role: "Socratic coach", knows: "How to question an argument, but not the answer here.", wants: "You to say why you think what you think." },
          { id: "rafael", name: "Rafael", role: "Opposing advocate", knows: "The case against whichever position you took. He sometimes overstates it, and he is sometimes right.", wants: "To find the weakest part of your argument." },
          { id: "nadia", name: "Nadia", role: "Evidence critic", knows: "Only what is in the source pack.", wants: "Claims to match what the sources actually say." },
        ],
        budget: {
          questions: 4,
          moveOn: move("board-time", "alternative", "The board is about to start. Let's go in.", "You have used your questions. What you didn't ask, you don't know yet, unless you read it in the source pack.", "rafael-misquote"),
        },
        boardQuestions: [
          { question: "“How good is the evidence that the tutor made the difference at Eastfield?”", discoveryId: "selection", ifFound: "Learners chose for themselves, so the whole gain can't be credited to the tutor.", ifMissed: "The trial report says learners chose for themselves, so the gain may not all be the tutor's." },
          { question: "“What happens when it gets an answer wrong?”", discoveryId: "errors", ifFound: "7 of 50 checked answers were wrong, with no sign of doubt, so somebody has to check.", ifMissed: "The trial report's spot check found 7 of 50 wrong, with no sign of doubt." },
          { question: "“Does this cover everyone who comes on Wednesdays?”", discoveryId: "purpose", ifFound: "About a third of visits are for forms or English, which a homework tutor wouldn't cover.", ifMissed: "The drop-in log says about a third of visits are not about homework." },
          { question: "“Who sees what the children type?”", discoveryId: "privacy", ifFound: "Standard terms keep messages for 12 months, and many learners are under 16, so consent and new terms are needed.", ifMissed: "The privacy officer's note covers this: 12 months' retention, and many learners under 16." },
        ],
        start: "open-pilot",
        starts: { adopt: "open-against", pilot: "open-pilot", reject: "open-for" },
        discoveries: [
          { id: "selection", label: "Learners in the Eastfield trial chose for themselves whether to use the tutor.", lookIn: "Eastfield Library trial report" },
          { id: "errors", label: "The tutor gave 7 wrong maths answers out of 50, with no sign of uncertainty.", lookIn: "Eastfield Library trial report" },
          { id: "purpose", label: "About a third of drop-in visits are not about homework at all.", lookIn: "Wednesday drop-in log" },
          { id: "privacy", label: "Standard terms keep learners' messages for 12 months, and many learners are under 16.", lookIn: "Privacy officer's note" },
        ],
        nodes: [
          {
            id: "open-against",
            speakerId: "rafael",
            text: "You'd put this in front of children? A spot check found 7 wrong maths answers out of 50, and the tutor sounded just as sure about those. Who catches them when the volunteers have gone?",
            reveals: ["errors"],
            choices: openingMoves,
          },
          {
            id: "open-for",
            speakerId: "rafael",
            text: "Three of six volunteers leave in December. If you turn the tutor down, the session may shrink or close, and that has a cost for 18 learners too. Saying no is also a decision. What is your plan for them?",
            choices: openingMoves,
          },
          {
            id: "open-pilot",
            speakerId: "rafael",
            text: "A trial sounds careful, but it can be a way of avoiding the decision. The volunteers leave in December either way. What exactly would you test, and what result would make you stop?",
            choices: openingMoves,
          },
          {
            id: "concede",
            speakerId: "rafael",
            text: "Fair enough. Conceding isn't losing, but it should change something. What does it change for you?",
            choices: [
              move("look", "evidence", "I should look at the evidence before holding this view any more firmly.", "You treated the concession as a reason to check, not as the end of the matter.", "evidence-trial"),
              move("condition", "alternative", "My position needs a condition attached to it.", "You turned a concession into a change to your position.", "rafael-misquote"),
            ],
          },
          {
            id: "pushback",
            speakerId: "rafael",
            text: "You've told me what you think, but not why. I can't argue with that, and neither can the board. Give me something that could turn out to be wrong.",
            choices: [
              move("ask", "evidence", "All right. What does the evidence on the tutor say?", "Asking now gets you what the restated position could not: something to test.", "evidence-trial"),
              move("assume", "assumption", "All right. What does the proposal take for granted about the drop-in?", "You moved from defending your view to examining the proposal.", "assumption-drop-in"),
            ],
          },
          {
            id: "evidence-trial",
            speakerId: "nadia",
            text: "The best evidence is Eastfield Library's eight-week trial. Homework completion rose from 61% to 74% among tutor users, and from 59% to 63% among others. The brochure says “40% faster”, but it names no study.",
            choices: [
              move("groups", "assumption", "How were the two groups formed?", "A comparison only means something if the groups were comparable, so this was the right thing to ask.", "trial-selfselect"),
              move("settled", "restate", "Thirteen points against four. That settles it.", "The gap is real, but you treated it as proof before asking what could explain it.", "trial-accept"),
              move("correct", "evidence", "Were the tutor's answers actually right?", "Completing homework and getting it right are different things, and you noticed.", "trial-errors"),
            ],
          },
          {
            id: "trial-selfselect",
            speakerId: "nadia",
            text: "The report says learners chose for themselves. Keen learners might have improved anyway. That doesn't show the tutor did nothing. It means you can't credit the whole gain to the tutor.",
            reveals: ["selection"],
            choices: [
              move("correct", "evidence", "Were its answers right, though?", "You kept going rather than stopping at the first problem.", "trial-errors"),
              move("purpose", "assumption", "Do our learners even come for homework?", "You asked whether a trial elsewhere fits the situation here.", "drop-in-log"),
            ],
          },
          {
            id: "trial-accept",
            speakerId: "nadia",
            text: "It might point that way. But the report counts completed homework, not correct homework, and it doesn't say the two groups were alike to begin with.",
            choices: [
              move("groups", "assumption", "Then how were the groups formed?", "You went back and tested what you had taken for granted. That is a useful revision.", "trial-selfselect"),
              move("correct", "evidence", "Then were the answers correct?", "You went back and asked what the number actually measured.", "trial-errors"),
            ],
          },
          {
            id: "trial-errors",
            speakerId: "nadia",
            text: "In a spot check of 50 maths answers, 43 were right and 7 were wrong. None of the wrong ones showed any sign of doubt. So it is often right, and its wording gives a learner no signal when it isn't.",
            reveals: ["errors"],
            choices: [
              move("data", "evidence", "Who sees what learners type into it?", "You widened the question from whether it works to what else it does.", "privacy-check"),
              move("safe", "alternative", "What would make this safe enough to use?", "You turned a problem into a condition that could be met or missed.", "rafael-misquote"),
            ],
          },
          {
            id: "assumption-drop-in",
            speakerId: "imani",
            text: "That's a good place to look. The proposal treats the drop-in as homework help. Is that what it is? What could you check?",
            choices: [
              move("log", "evidence", "Check the log for what people actually come for.", "You tested the assumption instead of arguing about it.", "drop-in-log"),
              move("skip", "restate", "Let's assume it's homework and look at the tutor.", "You moved on, but the assumption is still untested. You can see in the source pack what the log says.", "evidence-trial"),
            ],
          },
          {
            id: "drop-in-log",
            speakerId: "nadia",
            text: "The log says about a third of visits are for help with forms or with English. A homework tutor wouldn't replace those. So what is really being replaced?",
            reveals: ["purpose"],
            choices: [
              move("correct", "evidence", "Is the tutor at least reliable for the homework part?", "You checked the part of the proposal that still stands.", "trial-errors"),
              move("data", "evidence", "What happens to what learners type into it?", "You kept checking what the proposal leaves unsaid.", "privacy-check"),
              move("conditions", "alternative", "Then we need to say which needs a tutor could meet.", "You narrowed the proposal to what the evidence fits.", "rafael-misquote"),
            ],
          },
          {
            id: "privacy-check",
            speakerId: "nadia",
            text: "The privacy officer's note says the standard terms keep messages for 12 months and allow them to be used to improve the product. Many drop-in learners are under 16, so parental consent would be needed.",
            reveals: ["privacy"],
            choices: [
              move("terms", "alternative", "Then different terms and consent become conditions.", "You turned a finding into something the Commons could require.", "rafael-misquote"),
              move("ignore", "restate", "That isn't our concern if the tutor works.", "The Commons is responsible for learners' data whether or not the tutor works, so this leaves a problem unanswered.", "rafael-misquote"),
            ],
          },
          {
            id: "rafael-misquote",
            speakerId: "rafael",
            text: "Before you go in, you should know Eastfield backs up the brochure. Learners using the tutor finished 40% more homework. It's in their report.",
            choices: [
              { ...move("accept", "concede", "Then the brochure's figure holds up.", "You took his word for it. The Eastfield report gives 61% to 74% against 59% to 63%. The 40% appears only in the brochure, which names no study.", "rafael-right"), scored: { item: "misquote", right: false } },
              { ...move("dispute", "restate", "That sounds too high to me.", "You doubted it, which is a start, but doubt alone doesn't answer him. The Eastfield report gives 61% to 74% against 59% to 63%. The 40% appears only in the brochure.", "rafael-right"), scored: { item: "misquote", right: false } },
            ],
            cite: {
              responses: [
                {
                  passageIds: ["eastfield-result"],
                  note: "You checked the report he named and showed it. It says 61% to 74% against 59% to 63%. The 40% appears only in the brochure, so he has no answer.",
                  next: "rafael-right",
                  scored: { item: "misquote", right: true },
                },
              ],
              otherwise: {
                note: "That passage doesn't settle it. He named the Eastfield report, and its result passage says 61% to 74% against 59% to 63%. The 40% appears only in the brochure.",
                next: "rafael-right",
                scored: { item: "misquote", right: false },
              },
            },
          },
          {
            id: "rafael-right",
            speakerId: "rafael",
            text: "Here's a number nobody has mentioned. A licence costs €6,000 a year, which is half of what the Trust gives the homework programme this year.",
            choices: [
              { ...move("accept-cost", "concede", "That's right, and my argument has to account for it.", "He is right: the brochure gives €6,000 and the Trust letter €12,000. Conceding what holds up is part of arguing well.", "conditions"), scored: { item: "concede", right: true } },
              { ...move("reject-cost", "restate", "He would say that. I don't accept the figure.", "The figure comes from the sources: €6,000 in the brochure, €12,000 in the Trust letter. Being on the other side doesn't make someone wrong.", "conditions"), scored: { item: "concede", right: false } },
            ],
            cite: {
              responses: [
                {
                  passageIds: ["brochure-price", "budget-amount"],
                  note: "You checked it, and it holds. Going to the source and then accepting what you find is the same habit as catching a misquote.",
                  next: "conditions",
                  scored: { item: "concede", right: true },
                },
              ],
              otherwise: {
                note: "That passage doesn't bear on the cost. The brochure gives €6,000 and the Trust letter €12,000, so his figure holds.",
                next: "conditions",
                scored: { item: "concede", right: false },
              },
            },
          },
          {
            id: "conditions",
            speakerId: "imani",
            text: "Whatever you decide, name what would have to be true. Which of these comes closest to what you would put to the board?",
            choices: [
              move("alongside", "alternative", "Keep the remaining volunteers and add the tutor under supervision, with answer checks and new data terms.", "This keeps people in the loop, but three volunteers would be doing more. Your argument should say how.", "closing"),
              move("recruit", "alternative", "Recruit volunteers and narrow the drop-in for now, with no tutor.", "This avoids the risks of the tutor, but it needs a realistic recruitment plan and an answer for learners in the meantime.", "closing"),
              move("review", "alternative", "Replace the drop-in as proposed, and review it after one term.", "This acts on the December deadline, but a review only helps if you decide now what you would measure and what would stop it.", "closing"),
            ],
          },
          {
            id: "closing",
            speakerId: "imani",
            text: "That gives you something to work with. Next, lay the argument out and see how it holds together.",
            choices: [],
          },
        ],
      },
    },
    {
      kind: "argumentMap",
      id: "map",
      title: "Map the argument",
      prompt: "Select a card, then choose where it belongs. The map is about the proposal, whatever your own position is.",
      proposal: "The Commons should replace its Wednesday drop-in with an AI tutor.",
      initialStepId: "initial",
      dialogueStepId: "forge",
      hints: [
        { text: "Ask of each card: is it a recorded finding, or a reason someone would give?" },
        { text: "If a card must be true for the proposal to work, but the proposal never says so, it is an assumption." },
        { text: "Check who wrote the source behind a card, and whether it names any study." },
      ],
      slots: [
        { id: "reason", label: "Reasons for", help: "Why someone would support the proposal." },
        { id: "evidence", label: "Evidence", help: "A specific finding that a reason can rest on." },
        { id: "objection", label: "Objections", help: "Findings or points that count against the proposal." },
        { id: "assumption", label: "Unstated assumptions", help: "What the proposal needs to be true but does not say." },
        { id: "aside", label: "Set aside", help: "Not reliable enough to carry weight here." },
      ],
      cards: [
        { id: "shrink", text: "Without another option, the session may shrink when the volunteers leave.", slotId: "reason", explanation: "This is the main reason behind the proposal. The log gives it its factual footing." },
        { id: "completion", text: "A tutor could help learners finish more of their homework.", slotId: "reason", explanation: "This is the benefit the trial is usually cited for. It needs the trial to mean what it seems to mean." },
        { id: "hours", text: "A tutor could help at any hour, not only on Wednesdays.", slotId: "reason", explanation: "This is a reason someone could give for the tutor. It rests on availability, and it says nothing about accuracy." },
        { id: "trial", text: "Homework completion rose from 61% to 74% among tutor users, and from 59% to 63% among others.", slotId: "evidence", explanation: "This is the strongest finding in favour, though learners chose for themselves which group to be in." },
        { id: "numbers", text: "The drop-in averages 18 learners, and three of its six volunteers leave in December.", slotId: "evidence", explanation: "This is a recorded fact that supports the reason about the session shrinking." },
        { id: "wrong", text: "In a spot check, 7 of 50 maths answers were wrong, with no sign of uncertainty.", slotId: "objection", defensibleSlotIds: ["evidence"], discovery: "errors", explanation: "This counts against the proposal. Filing it as evidence is also defensible, since it is a specific finding, but its role here is to object." },
        { id: "terms", text: "The vendor's standard terms keep learners' messages for 12 months.", slotId: "objection", defensibleSlotIds: ["evidence"], discovery: "privacy", explanation: "This is a cost the proposal does not mention, particularly with learners under 16." },
        { id: "credit", text: "The rise in completion was caused by the tutor, not by which learners chose to use it.", slotId: "assumption", discovery: "selection", explanation: "The argument needs this to be true, but the trial does not establish it." },
        { id: "homework", text: "Drop-in visits are about homework.", slotId: "assumption", discovery: "purpose", explanation: "Replacing the drop-in with a homework tutor assumes this. The log says about a third of visits are not." },
        { id: "faster", text: "Students finish homework 40% faster with the tutor.", slotId: "aside", defensibleSlotIds: ["evidence"], explanation: "This comes from a sales brochure that names no study. It can be noted as the vendor's claim, but it should not carry weight." },
      ],
      links: [
        { cardId: "trial", kind: "supports", targetId: "completion", explanation: "Completion is what the trial measured." },
        { cardId: "numbers", kind: "supports", targetId: "shrink", explanation: "The log's numbers are why the session might shrink." },
        { cardId: "wrong", kind: "attacks", targetId: "completion", defensibleTargetIds: [PROPOSAL], explanation: "Finishing homework helps less if the answers are wrong. It also counts against the proposal more widely." },
        { cardId: "terms", kind: "attacks", targetId: PROPOSAL, explanation: "The data terms apply however well the tutor works, so this bears on the whole proposal." },
        { cardId: "credit", kind: "restsOn", targetId: "completion", explanation: "If keen learners would have improved anyway, the trial no longer supports this reason." },
        { cardId: "homework", kind: "restsOn", targetId: PROPOSAL, defensibleTargetIds: ["shrink"], explanation: "A homework tutor can only replace the drop-in if the drop-in is about homework." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `You have tested your position. Answer the first question again. Keeping your answer is fine if your reasons hold. ${positionQuestion}`,
      choices: positionChoices,
      withConfidence: true,
    },
    {
      kind: "quiz",
      id: "weigh",
      prompt: "Which finding did the most work in deciding your position just now, or in testing it?",
      choices: [
        { id: "selection", label: "Learners in the Eastfield trial chose for themselves.", verdict: "defensible", explanation: "This limits how much of the gain can be credited to the tutor. It weakens the main evidence in favour without showing that the tutor doesn't work." },
        { id: "errors", label: "7 of 50 checked answers were wrong, with no sign of doubt.", verdict: "defensible", explanation: "This is about accuracy and how a learner could tell. It makes a case for supervision more than a case against any use." },
        { id: "purpose", label: "About a third of visits are not about homework.", verdict: "defensible", explanation: "This shows that the proposal replaces more than a tutor can do, whichever way the evidence on the tutor falls." },
        { id: "privacy", label: "Standard terms keep messages for 12 months, and many learners are under 16.", verdict: "defensible", explanation: "This applies however well the tutor works, so it sets conditions rather than deciding the matter." },
      ],
    },
    {
      kind: "openResponse",
      id: "argument",
      prompt: "Write your revised argument for the board in three or four sentences: your position, your strongest evidence, and how you answer the strongest objection.",
      rubric: {
        samples: [
          { id: "thin", text: "We should try the tutor, because AI is the future and something has to be done before December.", met: ["position"], note: "It takes a position, but it rests on opinion and answers no objection." },
          { id: "full", text: "Trial it for a term with a volunteer checking answers. Eastfield's completion rose from 61% to 74%, though learners chose for themselves. The 7 wrong answers out of 50 are why a person checks. We would stop if errors stay at that level.", met: ["position", "evidence", "objection", "limits"], note: "It takes a position, rests on findings, answers the error objection and says when it would stop." },
        ],
        criteria: [
          { id: "position", text: "States a clear position." },
          { id: "evidence", text: "Rests on a specific finding from the source pack, not only on opinion." },
          { id: "objection", text: "Answers a real objection rather than ignoring it." },
          { id: "limits", text: "Says what is still uncertain, or under what conditions the position holds." },
        ],
        examples: [
          "Trial the tutor for one term alongside the remaining volunteers. Completion rose more among tutor users at Eastfield, but learners chose for themselves and 7 of 50 checked answers were wrong, so a volunteer should spot-check answers. We should require new data terms and parental consent, and stop if checked errors stay at that level.",
          "Do not replace the drop-in. A third of visits are for forms or English, which a homework tutor would not cover, and the licence would take half of this year's €12,000. The cost is real, since three volunteers are leaving, so we should narrow the sessions and recruit. We don't yet know whether recruitment will work, and we should review that in January.",
        ],
      },
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new case, with no hints",
      prompt: "A town's transport office argues for replacing its bus information desk. Mark the words where the argument claims more than its reason shows.",
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
      prompt: "Back to the transport office. First, give the strongest version of the case for the chatbot. Then name what evidence would change your own view of it.",
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
      kind: "debrief",
      id: "debrief",
      takeaway: "A position is only as strong as what it assumes and what it can answer. Ask what would have to be true, and what would change your mind.",
      skills: [
        {
          id: "question-the-case",
          label: "Uncovering what a case leaves out by questioning it",
          kind: "action",
          items: ["selection", "errors", "purpose", "privacy"].map((id) => `forge/${id}`),
        },
        {
          id: "under-pressure",
          label: "Checking a claim under pressure, and conceding when it holds",
          kind: "action",
          items: ["forge/misquote", "forge/concede"],
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
          id: "connect-argument",
          label: "Connecting evidence and objections to what they bear on",
          kind: "action",
          items: ["trial", "numbers", "wrong", "terms", "credit", "homework"].map((id) => `map/link/${id}`),
        },
        {
          id: "argument-parts",
          label: "Separating reasons, evidence, objections and assumptions",
          kind: "action",
          items: ["shrink", "completion", "hours", "trial", "numbers", "wrong", "terms", "credit", "homework", "faster"].map((id) => `map/${id}`),
          practice: {
            prompt: "Someone argues: “The new timetable will cut queues, because the pilot branch's queues fell by a third.” Which of these is an unstated assumption of that argument?",
            choices: [
              { id: "a", label: "That the pilot's queues fell by a third.", verdict: "weaker", explanation: "The argument states this openly. It is the evidence, so it isn't unstated." },
              { id: "b", label: "That other branches would respond as the pilot branch did.", verdict: "correct", explanation: "The argument needs this to get from one branch to all of them, and it never says so." },
              { id: "c", label: "That the new timetable will cut queues.", verdict: "weaker", explanation: "This is the conclusion. The assumption is what connects the evidence to it." },
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
