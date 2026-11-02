import type { AuditSpec, Choice, Mission } from "../../types";

/**
 * M04 — The Evidence Bureau. DRAFT content for review (reviewedOn: null).
 * All organisations, documents and figures are fictional.
 * Arithmetic to re-check on review: 26→34 is +30.8%; 48/63 is 76%; 63/210 is 30%; 290→410 is +41.4%.
 */

const trustQuestion = "A claim in an AI-written briefing has a citation attached. How far should that make you trust it?";
const trustChoices: Choice[] = [
  { id: "a", label: "Quite far. A cited claim can usually be relied on.", verdict: "weaker", explanation: "A citation only tells you where to look. In this briefing, a real source was attached to a claim it does not support." },
  { id: "b", label: "It tells me where to look. I still need to read the passage.", verdict: "correct", explanation: "This matches what the audit showed: some cited claims held up exactly and others did not. The passage decides, not the citation." },
  { id: "c", label: "Not at all. I should disregard AI-written briefings.", verdict: "weaker", explanation: "Several claims in this briefing were accurate and were worth keeping. Justified trust matters as much as justified doubt." },
];

const audit: AuditSpec = {
  sources: [
    {
      id: "attendance",
      title: "Attendance summary",
      description: "Internal record from the Commons programmes office.",
      date: "September 2026",
      passages: [
        { id: "attendance-avg", text: "Saturday Homework Club attendance averaged 34 learners per session from January to June 2026, compared with 26 per session in the same months of 2025." },
        { id: "attendance-sessions", text: "The club ran 22 sessions from January to June 2026. Two further sessions were cancelled because of staff illness." },
        { id: "attendance-tuesday", text: "A Tuesday trial in autumn 2025 ran for six sessions and drew an average of 11 learners." },
      ],
    },
    {
      id: "survey",
      title: "Family survey",
      description: "Survey run by Commons staff and sent to families on the club's mailing list.",
      date: "March 2026",
      passages: [
        { id: "survey-result", text: "The survey went to 210 families and 63 responded. Of those who responded, 48 said the club helped their child complete homework." },
        { id: "survey-scope", text: "The survey asked about homework completion. It did not measure grades or test results." },
      ],
    },
    {
      id: "trust-2024",
      title: "Riverside Community Trust letter",
      description: "Funding letter addressed to the Commons director.",
      date: "May 2024",
      passages: [{ id: "trust-2024-amount", text: "The Trust will provide €18,000 towards the homework programme for the 2024–25 programme year." }],
    },
    {
      id: "trust-2026",
      title: "Riverside Community Trust letter",
      description: "Funding letter addressed to the Commons director.",
      date: "April 2026",
      passages: [{ id: "trust-2026-amount", text: "The Trust will provide €12,000 towards the homework programme for the 2026–27 programme year. This replaces all earlier funding commitments." }],
    },
    {
      id: "volunteers",
      title: "Volunteer rota note",
      description: "Note from the Commons volunteer coordinator to the programmes office.",
      date: "October 2026",
      passages: [{ id: "volunteers-capacity", text: "There are nine volunteers on the Saturday rota. Five say they could cover one extra session a month. None has offered to cover an extra session every week." }],
    },
    {
      id: "review",
      title: "Regional Education Review",
      description: "Journal article studying 14 after-school clubs in one region.",
      date: "2025",
      passages: [{ id: "review-finding", text: "Pupils who attended a club at least once a week spent more time on homework than similar pupils who did not attend. The design of this study does not establish that clubs caused later changes in grades." }],
    },
  ],
  briefing: [
    ["The Saturday Homework Club is well attended. ", { claimId: "attendance" }, " ", { claimId: "growth" }],
    [{ claimId: "families" }, " ", { claimId: "research" }],
    [{ claimId: "funding" }, " ", { claimId: "demand" }, " ", { claimId: "staffing" }, " ", { claimId: "tuesday" }],
    ["The board is asked to decide whether to add a second weekly session on Tuesdays."],
  ],
  claims: [
    {
      id: "attendance",
      text: "Attendance averaged 34 learners per session in the first half of 2026 [Attendance summary, Sept 2026].",
      status: "supported",
      passageIds: ["attendance-avg"],
      bestAction: "retain",
      evidenceExplanation: "The attendance passage gives this figure for January to June 2026.",
      statusExplanation: "The claim says what the record says. Keeping a claim that checks out is good judgment, not a lack of skepticism.",
      actionExplanation: "Nothing needs to change.",
      finalText: "Attendance averaged 34 learners per session in the first half of 2026 [Attendance summary, Sept 2026].",
      hint: "Look for the source that records attendance.",
    },
    {
      id: "growth",
      text: "That is about 30% higher than in the same months of 2025 [Attendance summary, Sept 2026].",
      status: "supported",
      passageIds: ["attendance-avg"],
      bestAction: "retain",
      evidenceExplanation: "The same passage gives both numbers: 26 per session in 2025 and 34 in 2026.",
      statusExplanation: "The rise is 8 on a base of 26, which is about 31%. “About 30%” is a fair summary, so this calculation holds.",
      actionExplanation: "The rounding is fair and the comparison is like for like.",
      finalText: "That is about 30% higher than in the same months of 2025 [Attendance summary, Sept 2026].",
      hint: "Work out the change from the two figures, then compare it with the claim.",
    },
    {
      id: "families",
      text: "Three-quarters of families say the club helped their child [Family survey, March 2026].",
      status: "misleading",
      passageIds: ["survey-result"],
      bestAction: "qualify",
      defensibleActions: ["correct"],
      evidenceExplanation: "The survey result passage has the numbers: 210 families asked, 63 responded, and 48 of those said it helped.",
      statusExplanation: "The 76% is real, but only among the 30% of families who answered. “Three-quarters of families” suggests all families, and those who answered may differ from those who did not.",
      actionExplanation: "Keep the finding and state who it describes. Rewording it as a correction is also defensible.",
      finalText: "Of the 63 families who answered the March 2026 survey, out of 210 asked, 48 said the club helped their child complete homework [Family survey, March 2026].",
      hint: "Three-quarters of whom?",
    },
    {
      id: "research",
      text: "Research shows that homework clubs raise grades [Regional Education Review, 2025].",
      status: "unsupported",
      passageIds: ["review-finding"],
      citationMismatch: true,
      bestAction: "correct",
      defensibleActions: ["remove"],
      evidenceExplanation: "The Review is the cited source, so that is the passage to read. It reports more time spent on homework and says it does not establish an effect on grades.",
      statusExplanation: "The source exists and is on topic, but it does not back this claim. The survey does not help either: it did not measure grades.",
      actionExplanation: "Say what the study did find. Removing the sentence is also defensible, because the briefing does not depend on it.",
      finalText: "A 2025 regional study linked weekly club attendance with more time spent on homework, but did not establish an effect on grades [Regional Education Review, 2025].",
      hint: "Read what the cited source says about grades.",
    },
    {
      id: "funding",
      text: "The Riverside Community Trust funds the programme with €18,000 a year [Trust letter, May 2024].",
      status: "outdated",
      passageIds: ["trust-2026-amount"],
      bestAction: "correct",
      evidenceExplanation: "The April 2026 letter is the one that applies. It sets €12,000 and replaces earlier commitments. The cited May 2024 letter was accurate for 2024–25 only.",
      statusExplanation: "The figure was true for the year it covered. A newer letter replaces it, so it no longer describes the funding.",
      actionExplanation: "A board deciding on expansion needs the current figure, so qualifying or removing it would leave out something important.",
      finalText: "The Riverside Community Trust will provide €12,000 for 2026–27 [Trust letter, April 2026].",
      hint: "Compare the dates on the sources.",
    },
    {
      id: "demand",
      text: "Families have repeatedly asked for a weekday session.",
      status: "unsupported",
      passageIds: [],
      bestAction: "remove",
      defensibleActions: ["qualify"],
      evidenceExplanation: "No source in the pack mentions requests from families. Choosing “no source” is the right finding, and looking for one was worth doing.",
      statusExplanation: "It may or may not be true. Nothing provided shows it, which is different from showing that it is false.",
      actionExplanation: "Remove it unless someone can supply evidence. Keeping it marked as unverified is also defensible, if the board is told so.",
      finalText: null,
      hint: "Check whether any source mentions what families asked for.",
    },
    {
      id: "staffing",
      text: "Volunteers have confirmed they can staff a second weekly session [Volunteer rota note, Oct 2026].",
      status: "incorrect",
      passageIds: ["volunteers-capacity"],
      bestAction: "correct",
      defensibleActions: ["remove"],
      evidenceExplanation: "The rota note speaks directly to this.",
      statusExplanation: "The note says the opposite of the claim: five could cover one extra session a month, and none has offered weekly cover.",
      actionExplanation: "The board needs the true staffing position, so correcting it is more useful than deleting it.",
      finalText: "Five of the nine volunteers could cover one extra session a month, and none has offered to cover a weekly one [Volunteer rota note, Oct 2026].",
      hint: "Compare “weekly” in the claim with the wording in the note.",
    },
    {
      id: "tuesday",
      text: "A Tuesday trial in autumn 2025 drew an average of 11 learners across six sessions [Attendance summary, Sept 2026].",
      status: "supported",
      passageIds: ["attendance-tuesday"],
      bestAction: "retain",
      evidenceExplanation: "The attendance summary records the trial with these numbers.",
      statusExplanation: "The claim matches the record, including the number of sessions.",
      actionExplanation: "Nothing needs to change, and the board will want this figure.",
      finalText: "A Tuesday trial in autumn 2025 drew an average of 11 learners across six sessions [Attendance summary, Sept 2026].",
      hint: "Attendance records may cover more than Saturdays.",
    },
  ],
};

const transferAudit: AuditSpec = {
  sources: [
    {
      id: "annual-report",
      title: "Northgate Community Workshop annual report",
      description: "Annual report published by the workshop's management committee.",
      date: "February 2026",
      passages: [
        { id: "report-visits", text: "The repair café recorded 410 visits in 2025, compared with 290 visits in 2024." },
        { id: "report-volunteers", text: "The number of trained repair volunteers doubled during 2025, from 6 to 12." },
      ],
    },
  ],
  briefing: [["Summary for the Northgate grant application: ", { claimId: "doubled" }]],
  claims: [
    {
      id: "doubled",
      text: "Repair café visits doubled in 2025 [Annual report, Feb 2026].",
      status: "incorrect",
      passageIds: ["report-visits"],
      bestAction: "correct",
      evidenceExplanation: "The visits passage is the one that bears on this claim. The word “doubled” appears in the volunteers passage, but that is about volunteers, not visits.",
      statusExplanation: "Visits rose from 290 to 410, about 41%. That is growth, but not a doubling.",
      actionExplanation: "The real figures still make a good case, so state them.",
      finalText: "Repair café visits rose from 290 in 2024 to 410 in 2025, an increase of about 41% [Annual report, Feb 2026].",
    },
  ],
};

export const m04: Mission = {
  id: "m04-evidence",
  title: "The Evidence Bureau",
  outcome: "Identify checkable claims, assess whether sources support them, and decide what to keep, qualify, correct or remove.",
  scenario:
    "You are the researcher at the Riverside Learning Commons, a fictional community learning centre. An AI assistant has drafted a briefing for tomorrow's board meeting on the Saturday Homework Club. You have the source pack and a few minutes to audit the draft.",
  approxMinutes: 14,
  meta: {
    version: "0.1-draft",
    reviewedOn: null,
    sourcesToReview: ["All sources are fictional and authored for this case, so none depend on outside facts."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Audit the briefing claim by claim. For each one, find the passage that bears on it, say what you found, and decide what should happen to the claim. Some claims are sound, and keeping those is part of the job.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "AI systems produce text that fits patterns in what they learned, and that text reads fluently whether or not it is right. A claim is a statement that could be checked. Evidence is what lets you check it: a specific passage you have read, not just the name of a source.",
    },
    { kind: "initialJudgment", id: "initial", prompt: trustQuestion, choices: trustChoices },
    {
      kind: "claimAudit",
      id: "audit",
      title: "Audit the briefing",
      intro: "Select each underlined claim in turn. You can check as often as you like, and moving on is always allowed.",
      audit,
    },
    {
      kind: "quiz",
      id: "citation",
      prompt: "The claim about grades cited the Regional Education Review. The Review is real and is about homework clubs. What was the problem?",
      choices: [
        { id: "a", label: "Nothing. The source is real and on topic, so the citation holds.", verdict: "weaker", explanation: "Being real and on topic is not enough. The passage has to say what the claim says." },
        { id: "b", label: "The passage does not say what the claim says.", verdict: "correct", explanation: "The Review reports more time on homework and says it does not establish an effect on grades." },
        { id: "c", label: "The source is too old to use.", verdict: "weaker", explanation: "Age was the problem with the funding letter. The Review's date is not the issue here." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `Now that you have audited the briefing, answer the first question again. ${trustQuestion}`,
      choices: trustChoices,
      withConfidence: true,
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new case, with no hints",
      prompt: "A different organisation, the Northgate Community Workshop, is applying for a grant. An AI assistant summarised its annual report. Check the claim using the same method.",
      audit: transferAudit,
    },
    {
      kind: "openResponse",
      id: "explain",
      prompt: "In your own words, explain why the passage you chose does or does not support the Northgate claim, and what the application should say instead.",
      rubric: {
        criteria: [
          { id: "passage", text: "Refers to the specific passage about visits, not just to the report as a whole." },
          { id: "compare", text: "Compares the claim with the figures: 290 to 410 is not a doubling." },
          { id: "fix", text: "Says what an accurate version would state." },
        ],
        examples: [
          "The report says visits went from 290 to 410, so they rose by about 41% rather than doubling. The application should give those two numbers.",
          "“Doubled” seems to come from the line about volunteers, which went from 6 to 12. The visits line shows 290 to 410, so I would write that visits rose by about 40%.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "A citation tells you where to look. Read the passage, check the date and the numbers, then decide whether to keep, qualify, correct or remove the claim.",
      skills: [
        "Tracing claims to specific passages",
        "Keeping claims that the evidence supports",
        "Spotting a real citation that does not support its claim",
        "Applying the method to a new case without hints",
      ],
      nextMissionId: "m05-argument",
    },
  ],
};
