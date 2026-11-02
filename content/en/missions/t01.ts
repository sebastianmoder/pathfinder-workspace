import type { AuditSpec, Choice, Mission } from "../../types";

/**
 * T01 — The Newsletter Desk: the pilot's combined transfer case.
 * All organisations, documents and figures are fictional. A small precursor to C01, not a substitute for it.
 * Arithmetic to re-check on review: 20 of 24 respondents is 83%; 24 of 31 finishers responded; 31 of 48 enrolled finished.
 */

const approachQuestion =
  "The newsletter goes out today. An AI draft of the lead article reads well and cites its sources. What is the most useful thing to do with the time you have?";
const approachChoices: Choice[] = [
  { id: "send", label: "Send it. It reads well and it has citations.", verdict: "weaker", explanation: "Good writing and citations do not show that it is right. Several of the draft's claims did not survive a check." },
  { id: "check", label: "Check the specific claims against the sources, then keep, fix or qualify them.", verdict: "correct", explanation: "This takes less time than rewriting, and it keeps what was accurate. Some of the draft was fine, and other parts only needed qualifying." },
  { id: "scrap", label: "Scrap it and write something from memory.", verdict: "weaker", explanation: "That throws away accurate work, and writing from memory is no better checked than the draft." },
];

const audit: AuditSpec = {
  sources: [
    {
      id: "register",
      title: "Course register",
      description: "Internal record from the Commons programmes office.",
      date: "October 2026",
      passages: [
        { id: "register-numbers", text: "The autumn Digital Skills for All course enrolled 48 people. 31 attended at least six of the eight sessions." },
        { id: "register-fee", text: "There is no charge for tuition. A €15 materials fee applies, and it is waived on request." },
      ],
    },
    {
      id: "questionnaire",
      title: "End-of-course questionnaire",
      description: "Questionnaire given to people who finished the course.",
      date: "October 2026",
      passages: [
        { id: "questionnaire-result", text: "24 of the 31 people who finished returned the questionnaire. 20 of them said they felt more confident using online services." },
        { id: "questionnaire-scope", text: "The questionnaire asked how people felt. It did not test their skills." },
      ],
    },
    {
      id: "county-2023",
      title: "County digital inclusion report",
      description: "Report published by the county council.",
      date: "2023",
      passages: [{ id: "county-2023-broadband", text: "One in four adults in the county reported having no home broadband." }],
    },
    {
      id: "county-2026",
      title: "County digital inclusion report",
      description: "Report published by the county council.",
      date: "2026",
      passages: [{ id: "county-2026-broadband", text: "One in seven adults in the county reported having no home broadband." }],
    },
    {
      id: "tutor-note",
      title: "Course tutor's note",
      description: "Planning note from the course tutor to the programmes office.",
      date: "October 2026",
      passages: [{ id: "tutor-next", text: "The next course starts on 12 January 2027, with 20 places." }],
    },
  ],
  briefing: [
    [{ claimId: "enrolled" }, " ", { claimId: "confident" }, " ", { claimId: "skills" }],
    [{ claimId: "broadband" }, " ", { claimId: "free" }, " ", { claimId: "next" }],
  ],
  claims: [
    {
      id: "enrolled",
      text: "The autumn Digital Skills for All course enrolled 48 people [Course register].",
      status: "supported",
      passageIds: ["register-numbers"],
      bestAction: "retain",
      evidenceExplanation: "The register records this number.",
      statusExplanation: "The claim matches the record.",
      actionExplanation: "Nothing needs to change.",
      finalText: "The autumn Digital Skills for All course enrolled 48 people [Course register].",
    },
    {
      id: "confident",
      text: "Almost everyone who took the course now feels more confident online [Questionnaire].",
      status: "misleading",
      passageIds: ["questionnaire-result"],
      bestAction: "qualify",
      defensibleActions: ["correct"],
      evidenceExplanation: "The questionnaire result gives the numbers behind this.",
      statusExplanation: "20 of 24 is a strong result, but it covers only those who finished and answered. 48 people enrolled, so “almost everyone who took the course” goes well beyond the evidence.",
      actionExplanation: "Keep the finding and say who it describes. Rewording it as a correction is also defensible.",
      finalText: "Of the 24 people who finished the course and returned the questionnaire, 20 said they felt more confident using online services [Questionnaire].",
    },
    {
      id: "skills",
      text: "The course has been shown to improve people's digital skills [Questionnaire].",
      status: "unsupported",
      passageIds: ["questionnaire-scope"],
      citationMismatch: true,
      bestAction: "remove",
      defensibleActions: ["correct"],
      evidenceExplanation: "The questionnaire's own scope note is the passage to read: it asked how people felt and did not test skills.",
      statusExplanation: "Feeling more confident is not the same as being shown to have more skill. It might be true, but this source cannot show it.",
      actionExplanation: "The confidence finding is already stated, so this sentence adds only an unsupported claim. Replacing it with what was measured is also defensible.",
      finalText: null,
    },
    {
      id: "broadband",
      text: "One in four adults in the county has no home broadband [County report, 2023].",
      status: "outdated",
      passageIds: ["county-2026-broadband"],
      bestAction: "correct",
      evidenceExplanation: "The 2026 report is the current one. The cited 2023 report was accurate for its time.",
      statusExplanation: "The figure was true in 2023, but a newer report from the same council replaces it.",
      actionExplanation: "The current figure is available, so use it.",
      finalText: "One in seven adults in the county reported having no home broadband [County report, 2026].",
    },
    {
      id: "free",
      text: "The course is completely free [Course register].",
      status: "incorrect",
      passageIds: ["register-fee"],
      bestAction: "correct",
      evidenceExplanation: "The register sets out the fees.",
      statusExplanation: "Tuition is free, but a €15 materials fee applies unless it is waived. Someone reading “completely free” would be surprised.",
      actionExplanation: "Say what actually applies, since the waiver is useful to readers.",
      finalText: "Tuition is free, and the €15 materials fee is waived on request [Course register].",
    },
    {
      id: "next",
      text: "The next course starts on 12 January 2027, with 20 places [Tutor's note].",
      status: "supported",
      passageIds: ["tutor-next"],
      bestAction: "retain",
      evidenceExplanation: "The tutor's note gives both details.",
      statusExplanation: "The claim matches the note.",
      actionExplanation: "Nothing needs to change, and readers need this.",
      finalText: "The next course starts on 12 January 2027, with 20 places [Tutor's note].",
    },
  ],
};

export const t01: Mission = {
  id: "t01-transfer",
  title: "The Newsletter Desk",
  outcome: "Use claim checking and assumption spotting together on a new case, with less help.",
  scenario:
    "You are the editor of the newsletter at the Riverside Learning Commons, a fictional community learning centre. An AI assistant has drafted the lead article about a digital skills course, and a colleague has added an argument for expanding it.",
  approxMinutes: 9,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-02",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["All sources are fictional and authored for this case, so none depend on outside facts.", "Case dates are set around autumn 2026; refresh them if they start to look stale.", "The next-course date (12 January 2027) is in the fictional case; move it forward if the pilot runs past that date."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Audit the draft, then look at the argument built on it. This time there are no hints: use the method your own way.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "Find the passage that bears on each claim, and read it rather than trusting the citation. Claims may be supported, unsupported, outdated, misleading or incorrect. An assumption is something an argument needs to be true but does not say.",
    },
    { kind: "initialJudgment", id: "initial", prompt: approachQuestion, choices: approachChoices },
    {
      kind: "transfer",
      id: "audit",
      title: "Audit the draft",
      prompt: "Select each underlined claim, check it against the source pack, and decide what should happen to it.",
      audit,
    },
    {
      kind: "transfer",
      id: "assumption",
      title: "Check the argument",
      prompt: "Your colleague adds: “People felt more confident after the course, so we should double its size next year.” Which unstated assumption matters most?",
      choices: [
        { id: "a", label: "That a course twice the size would get the same result, and that enough people want it and enough tutors can run it.", verdict: "correct", explanation: "The evidence is about one course, and only about those who finished and answered. Doubling needs all of this to hold, and the argument states none of it." },
        { id: "b", label: "That the newsletter will be read by people who want to enrol.", verdict: "weaker", explanation: "This matters for publicity, but the argument for doubling does not rest on it." },
        { id: "c", label: "That confidence can never be measured.", verdict: "weaker", explanation: "Self-reported confidence was measured. The argument's gap is in going from that result to a larger course." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `You have been through the draft. Answer the first question again. ${approachQuestion}`,
      choices: approachChoices,
      withConfidence: true,
    },
    {
      kind: "openResponse",
      id: "note",
      prompt: "Write a short note to your colleague: what would you publish about the course, and what would you need to know before supporting a bigger one?",
      rubric: {
        criteria: [
          { id: "accurate", text: "Describes the course result accurately, including who it covers." },
          { id: "distinguish", text: "Separates what the evidence shows from what it does not, such as confidence versus skill." },
          { id: "needed", text: "Names something specific you would need to know before expanding." },
        ],
        examples: [
          "I'd publish that 20 of the 24 finishers who answered felt more confident, and not that skills improved, since that wasn't tested. Only 31 of 48 finished, so before doubling I'd want to know why people dropped out and whether we have tutors.",
          "We can say that most people who finished and responded felt more confident. Before supporting a bigger course I would want to see the waiting list and the tutor's capacity, and some test of whether skills changed.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Check the claims and then check the argument built on them. An accurate fact can still be asked to carry more than it can bear.",
      skills: [
        "Auditing a new draft without hints",
        "Keeping what the evidence supported",
        "Finding the assumption behind an argument",
      ],
      nextMissionId: null,
    },
  ],
};
