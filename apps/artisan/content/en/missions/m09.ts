import type { Choice, Mission } from "../../types";

/**
 * M09 — The Fairness Council.
 * All people and data are fictional. The data is tuned so that, with 10–12 places, no threshold on the
 * original score brings the gap in qualified applicants rejected below 3, and the revised score reaches 0–1
 * at thresholds 71–74. `content/missions.test.ts` checks both.
 */

type Row = [number, boolean];
const noBreak: Row[] = [[92, true], [88, true], [85, true], [81, false], [78, true], [74, true], [70, false], [66, true], [61, false], [55, false], [48, false], [40, false]];
const careerBreak: Row[] = [[80, true], [72, true], [68, false], [63, true], [59, true], [56, true], [52, true], [47, false], [43, false], [38, false], [33, false], [28, false]];
/** The penalty the auditor found: about 15 points for any gap in a CV. */
const PENALTY = 15;

const applicants = [
  ...noBreak.map(([score, qualified], i) => ({ id: `a${i + 1}`, group: "continuous", qualified, scores: { original: score, revised: score } })),
  ...careerBreak.map(([score, qualified], i) => ({ id: `b${i + 1}`, group: "break", qualified, scores: { original: score, revised: Math.min(score + PENALTY, 99) } })),
];

const firstMove =
  "Martin, the programme manager, says: “The screening tool is fair. It uses the same pass mark for every applicant.” Joy, who took a career break, wasn't invited. What do you say to Martin?";
const firstChoices: Choice[] = [
  { id: "a", label: "Agreed: one pass mark for everyone is fair by definition.", verdict: "weaker", explanation: "The same pass mark applied to scores that are systematically lower for one group still produces uneven outcomes." },
  { id: "b", label: "Only if the scores are fair: check who it rejects, by group.", verdict: "correct", explanation: "A threshold is only as fair as the scores it is applied to. Uneven scores come from the data, the labels or the objective." },
  { id: "c", label: "It's only unfair if someone built it to discriminate.", verdict: "weaker", explanation: "Most unfair outcomes are unintended. They come from patterns in past data that nobody chose to include." },
];

export const m09: Mission = {
  id: "m09-fairness",
  title: "The Fairness Council",
  outcome: "Recognise how data, labels, objectives and deployment choices can produce uneven outcomes, propose a change, and name its trade-offs.",
  scenario:
    "The Riverside Learning Commons, a community learning centre, is recruiting tutors. A screening tool scores 24 applicants, and the top scorers get interviews. You sit on the panel that reviews the tool.",
  approxMinutes: 14,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["The data is synthetic and tuned; the comment at the top of this file says what it must show, and the content tests check it."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Set the tool's threshold to fill the interview places, look at who it gets wrong, and find out whether the problem can be fixed by the threshold or lies somewhere else.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A screening tool turns each applicant into a score, and everyone above a threshold is selected. It makes two kinds of error: rejecting someone who would have done well, and selecting someone who wouldn't. A score learned from past decisions can repeat what those decisions favoured (the Numbers Lab showed how much depends on what you compare).",
    },
    { kind: "initialJudgment", id: "initial", prompt: firstMove, choices: firstChoices },
    {
      kind: "thresholdLab",
      id: "council",
      title: "Review the screening tool",
      intro: "Each dot is an applicant. Everyone took a trial tutoring session, so you know who met the standard. The tool didn't see those results.",
      lab: {
        scoreLabel: "Screening score",
        qualifiedLabel: "Met the standard in the trial session",
        groups: [
          { id: "continuous", label: "No career break" },
          { id: "break", label: "Career break of a year or more" },
        ],
        versions: [
          { id: "original", label: "Original score", note: "Learned from the Commons' past tutor hires." },
          { id: "revised", label: "Revised score", note: "The same score, with gaps in a CV no longer counted against applicants." },
        ],
        applicants,
        capacity: { label: "Interview places", min: 10, max: 12 },
        range: { min: 20, max: 99 },
        start: { version: "original", threshold: 50 },
        stakeholders: [
          { id: "joy", name: "Joy", role: "applicant, who took two years out to care for a parent", says: "I've tutored maths for years. The tool never asked about that. It only saw the gap." },
          { id: "martin", name: "Martin", role: "programme manager", says: "We need twelve good tutors by September, and we can't interview everyone." },
          { id: "kwame", name: "Kwame", role: "independent auditor", says: "The score learned from past hires, who nearly all had unbroken CVs, and it marks down any gap. A revised version without that penalty is ready to test." },
        ],
        tasks: [
          {
            id: "fill",
            title: "Fill the interview places",
            instruction: "Set the threshold so that between 10 and 12 applicants are invited. Then read the error table.",
            goal: {},
            solution: { version: "original", threshold: 63 },
            success: "Look at the “rejected” column. Several qualified applicants with a career break miss out, against none or one without. The threshold is the same for everyone; the scores aren't.",
          },
          {
            id: "gap",
            title: "Narrow the gap",
            instruction: "Still inviting 10 to 12, find a setting where the two groups differ by no more than one in qualified applicants rejected. If the threshold can't do it, read what people say.",
            goal: { maxMissedGap: 1 },
            solution: { version: "revised", threshold: 72 },
            success: "Moving the threshold could only trade one error for another. The problem was in what the score had learned from past hires, so the fix was in the score.",
          },
        ],
      },
    },
    {
      kind: "sort",
      id: "fact-or-choice",
      prompt: "Some questions about the tool can be settled with evidence; others are choices that need a justification. Sort them.",
      hints: [{ text: "Could a count, a test or a record answer it, or does it depend on what you value?" }],
      categories: [
        { id: "fact", label: "Evidence can settle it" },
        { id: "choice", label: "A choice that needs justifying" },
      ],
      items: [
        { id: "count", label: "How many qualified applicants with a career break were rejected", categoryId: "fact", explanation: "It's a count in the error table." },
        { id: "penalty", label: "Whether the score marks people down for a career break", categoryId: "fact", explanation: "It can be tested: compare scores for similar applicants with and without a gap." },
        { id: "worse", label: "Whether rejecting a good applicant is worse than inviting a weak one", categoryId: "choice", explanation: "The data shows both errors. Which matters more depends on what the Commons values." },
        { id: "equal", label: "Whether equal error rates across groups matter more than picking the highest scores", categoryId: "choice", explanation: "This is a choice about fairness, which the panel has to justify in words." },
        { id: "use", label: "Whether to use an automated screen at all", categoryId: "choice", explanation: "Evidence informs it, but the decision weighs time, fairness and accountability." },
      ],
    },
    {
      kind: "quiz",
      id: "limits",
      prompt: "The revised score narrows the gap. What limitation remains?",
      choices: [
        { id: "a", label: "None, because the problem is solved now that the penalty is gone.", verdict: "weaker", explanation: "You checked one difference between two groups. Others may exist, and the data may change." },
        { id: "b", label: "Other groups weren't checked, so outcomes still need monitoring.", verdict: "correct", explanation: "A fix for one known problem isn't proof of fairness. Keep checking outcomes as new applicants come through." },
        { id: "c", label: "It makes the tool less accurate for everyone, so it's worse.", verdict: "weaker", explanation: "Check the table: the revised score selects no more applicants who missed the standard than the original did." },
      ],
      hints: [{ text: "What did the panel actually check, and what didn't it?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt:
        "A library's tool ranks volunteers for the most popular shifts. It never sees anyone's age. Older volunteers still get those shifts less often. How could that happen?",
      choices: [
        { id: "a", label: "It can't: a tool that never sees age can't be unfair by age.", verdict: "weaker", explanation: "Other inputs can stand in for age, such as years since a qualification, or the hours people say they're free." },
        { id: "b", label: "Something it does see, or learned from, tracks age.", verdict: "correct", explanation: "Leaving a field out doesn't remove the pattern. If past choices or other inputs track age, the scores will too." },
        { id: "c", label: "By chance: with small numbers, groups always differ.", verdict: "weaker", explanation: "Chance could explain a small gap that comes and goes. A steady pattern calls for checking what the scores learned." },
      ],
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new system",
      prompt:
        "A clinic's tool predicts which patients will miss appointments, and double-books their slots. It learned from “missed an appointment before”. Patients who rely on buses miss more often, so they are double-booked more and wait longer. Where does the unfairness mainly come from?",
      choices: [
        { id: "a", label: "The cut-off for double-booking is set too high.", verdict: "weaker", explanation: "Moving the cut-off changes how many are double-booked, not who. The pattern comes from what the tool learned." },
        { id: "b", label: "The label reflects transport, not reliability.", verdict: "correct", explanation: "“Missed before” partly measures bus access. The tool learns that pattern, and the double-booking then makes those patients' experience worse." },
        { id: "c", label: "Random errors that affect every patient equally.", verdict: "weaker", explanation: "The errors fall more on one group, so they aren't random in their effect." },
      ],
    },
    {
      kind: "openResponse",
      id: "propose",
      prompt: "The clinic asks for one change to its tool, or to how it is used. Which proposal goes furthest, and what does it still leave out?",
      format: "pickImprove",
      drafts: [
        {
          id: "use",
          label: "Stop double-booking on the prediction, and use it to offer reminder calls and bus-friendly times.",
          verdict: "correct",
          explanation: "It changes how the prediction is used, so the patients it flags get help rather than longer waits. It doesn't yet say where the problem came from or what the change costs.",
        },
        {
          id: "cutoff",
          label: "Raise the cut-off for double-booking, so that fewer patients are double-booked than now.",
          verdict: "weaker",
          explanation: "Fewer would be double-booked, but the same patients would still be picked first, because the label still reflects bus access.",
        },
        {
          id: "earlier",
          label: "Tell patients who rely on buses to leave home earlier, so they stop missing appointments.",
          verdict: "weaker",
          explanation: "It puts the fix on the people bearing the harm, and leaves the tool learning the same pattern.",
        },
      ],
      improvePrompt: "Improve it: say where the unfairness comes from, and add one trade-off or limitation.",
      rubric: {
        criteria: [
          { id: "source", text: "Names where the unfairness comes from." },
          { id: "change", text: "Proposes a specific change to the data, the label, the objective or how the tool is used." },
          { id: "tradeoff", text: "Describes a trade-off or limitation of the change." },
        ],
        examples: [
          "Stop double-booking on the prediction, and use it to offer reminders and flexible times instead, because the label partly measures bus access. It costs staff time, and the clinic may lose some slots.",
          "Retrain the tool without patterns that stand in for transport, such as postcode, and check outcomes by group each month. The limitation is that other stand-ins may remain, so the monitoring has to continue.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "The same rule for everyone isn't fair if the scores behind it aren't. Look at who each error falls on, and fix the source, not just the threshold.",
      skills: [
        { id: "see-gap", label: "Finding an uneven outcome in an error table", kind: "action", items: ["council/fill"] },
        { id: "fix-source", label: "Tracing unfairness to the score, not the threshold", kind: "action", items: ["council/gap"] },
        {
          id: "fact-choice",
          label: "Telling factual questions apart from choices that need justifying",
          kind: "knowledge",
          items: ["fact-or-choice/count", "fact-or-choice/penalty", "fact-or-choice/worse", "fact-or-choice/equal", "fact-or-choice/use"],
          practice: {
            prompt: "Which of these is a choice that needs justifying, rather than a question evidence can settle?",
            choices: [
              { id: "a", label: "Whether the tool's errors fall more on older applicants.", verdict: "weaker", explanation: "That is countable, given outcomes by age." },
              { id: "b", label: "Whether a 5% higher error rate for one group is acceptable.", verdict: "correct", explanation: "The rate is a fact; whether it is acceptable depends on values the panel has to argue for." },
              { id: "c", label: "Whether the score uses postcode as an input.", verdict: "weaker", explanation: "That can be checked in the system's design." },
            ],
          },
        },
        { id: "limits", label: "Naming the limits of a fix", kind: "knowledge", items: ["limits", "revision"] },
        { id: "new-system", label: "Finding the source of unfairness in a new system", kind: "transfer", items: ["transfer"] },
        { id: "choose-change", label: "Choosing a change that tackles the harm, not just its size", kind: "action", items: ["propose/pick"] },
        { id: "propose", label: "Proposing a change and its trade-off", kind: "reasoning", items: ["propose"] },
      ],
      nextMissionId: "m10-boundaries",
    },
  ],
};
