import type { AuditSpec, Mission } from "../../types";

/**
 * T01 — The Newsletter Desk: the pilot's combined transfer case.
 * All organisations, documents and figures are fictional. A small precursor to C01, not a substitute for it.
 * Arithmetic to re-check on review: 20 of 24 respondents is 83%; 24 of 31 finishers responded; 31 of 48 enrolled finished.
 */

const audit: AuditSpec = {
  support: "independent",
  trustFirst: true,
  reasonPrompt: "In a sentence, why does what you found decide this claim?",
  decoys: [
    { id: "proud", text: "Everyone at the Commons can be proud of what this course has become.", explanation: "This is a sentiment. No record could confirm or contradict it." },
    { id: "matters", text: "Digital skills open doors, and we believe they should be open to all.", explanation: "This is a value. People can argue for it, but it isn't a claim a record could settle." },
  ],
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
    [{ decoyId: "proud" }, " ", { claimId: "enrolled" }, " ", { claimId: "confident" }, " ", { claimId: "skills" }],
    [{ decoyId: "matters" }, " ", { claimId: "broadband" }, " ", { claimId: "free" }, " ", { claimId: "next" }],
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
      ifLost: "Readers could not tell how many people the course had reached.",
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
      repair: ["Of the ", { id: "answered", accept: ["24"] }, " people who finished the course and returned the questionnaire, ", { id: "felt", accept: ["20"] }, " said they felt more confident using online services [Questionnaire]."],
      ifKept: "One of the 17 people who had dropped out wrote in, asking who “almost everyone” was supposed to be.",
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
      ifKept: "A local employer quoted the newsletter, saying the course improves digital skills. Nothing had ever tested that.",
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
      repair: ["One in ", { id: "share", accept: ["seven", "7"] }, " adults in the county reported having no home broadband [County report, 2026]."],
      ifKept: "A county officer wrote to point out that the newsletter was quoting a figure that the council had since replaced.",
      ifLost: "The article lost the local figure that explained why the course matters.",
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
      repair: ["Tuition is free, and the €", { id: "fee", accept: ["15"] }, " materials fee is waived on ", { id: "how", accept: ["request"], options: ["completion", "request", "enrolment"] }, " [Course register]."],
      ifKept: "A reader who signed up expecting no cost at all was asked for €15, and nobody had told them it could be waived.",
      ifLost: "Readers who were worried about cost were never told that tuition is free or that the fee can be waived.",
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
      ifLost: "Readers who wanted to sign up had no date to work from, and the 20 places filled slowly.",
    },
  ],
};

export const t01: Mission = {
  id: "t01-transfer",
  title: "The Newsletter Desk",
  outcome: "Use claim checking and assumption spotting together on a new case, with less help.",
  scenario:
    "You are the editor of the newsletter at the Riverside Learning Commons, a fictional community learning centre. An AI assistant has drafted the lead article about a digital skills course, and a colleague has added an argument for expanding it.",
  approxMinutes: 13,
  meta: {
    version: "1.2",
    reviewedOn: "2026-11-02",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["All sources are fictional and authored for this case, so none depend on outside facts.", "Case dates are set around autumn 2026; refresh them if they start to look stale.", "The next-course date (12 January 2027) is in the fictional case; move it forward if the pilot runs past that date."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Find the claims in the draft, audit them, and then look at the argument built on them. This time there are no hints, and feedback waits until you submit the whole audit.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "Find the passage that bears on each claim, and read it rather than trusting the citation. Claims may be supported, unsupported, outdated, misleading or incorrect. An assumption is something an argument needs to be true but does not say.",
    },
    {
      kind: "transfer",
      id: "audit",
      title: "Audit the draft",
      prompt: "The newsletter goes out today, and the draft reads well. Check what it says before it goes.",
      audit,
    },
    {
      kind: "transfer",
      id: "assumption",
      title: "Check the argument",
      prompt: "Your colleague adds an argument for a bigger course. Mark the words that go further than the evidence you have just checked.",
      mark: [
        [
          { id: "people", text: "People", target: true, explanation: "The evidence covers only those who finished and answered: 24 of the 48 who enrolled." },
          " ",
          { id: "felt", text: "felt more confident", target: false, explanation: "This is what the questionnaire found, and the sentence says “felt”, not “became skilled”." },
          " ",
          { id: "after", text: "after the course,", target: false, optional: true, explanation: "“After” is accurate. It could be read as suggesting the course caused the change, so marking it is also reasonable." },
          " so ",
          { id: "should", text: "we should", target: false, optional: true, explanation: "This signals a recommendation. The gap is in what is being recommended." },
          " ",
          { id: "double", text: "double its size", target: true, explanation: "One course's result doesn't show that twice the size would work, or that enough learners and tutors exist." },
          " ",
          { id: "year", text: "next year.", target: false, explanation: "The timing isn't where the argument overreaches." },
        ],
      ],
    },
    {
      kind: "openResponse",
      id: "note",
      prompt: "Write a short note to your colleague: what would you publish about the course, and what would you need to know before supporting a bigger one?",
      rubric: {
        samples: [
          { id: "loose", text: "The course went really well. Almost everyone felt more confident, so let's publish that and grow it.", met: [], note: "It repeats the draft's overstatement, and names nothing to find out first." },
          { id: "careful", text: "I'd publish that 20 of the 24 finishers who answered felt more confident. That isn't a test of skills. I'd want to know why only 31 of 48 finished.", met: ["accurate", "distinguish", "needed"], note: "It says who the result covers, separates feeling from skill, and asks a specific question." },
        ],
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
        {
          id: "audit-new-draft",
          label: "Auditing a new draft without hints",
          kind: "transfer",
          items: audit.claims.flatMap((c) => [`audit/${c.id}/evidence`, `audit/${c.id}/status`]),
          practice: {
            prompt: "A draft says “Everyone who joined the walking group now walks every day [Group survey]”. The survey says 18 of the 25 members who replied, out of 60, walk most days. What is the claim's status?",
            choices: [
              { id: "a", label: "Unsupported, because a survey can't say anything about members.", verdict: "weaker", explanation: "A survey can support claims about those who answered. The trouble is how far this claim goes beyond them." },
              { id: "b", label: "Misleading: the finding is real, but “everyone” and “every day” overstate it.", verdict: "correct", explanation: "There is a real finding behind it, but “everyone” and “every day” go well beyond the 18 of 25 who replied and said “most days”." },
              { id: "c", label: "Outdated, since habits may have changed since then.", verdict: "weaker", explanation: "Nothing newer replaces the survey. The problem is what the claim says about it." },
            ],
          },
        },
        {
          id: "keep-supported",
          label: "Keeping what the evidence supported",
          kind: "transfer",
          items: ["enrolled", "next"].map((id) => `audit/${id}/action`),
          practice: {
            prompt: "An AI draft says “The hall holds 120 people [Fire certificate, 2026]”. The 2026 certificate says the hall's maximum capacity is 120. What should happen to the claim?",
            choices: [
              { id: "a", label: "Qualify it by adding that the figure came from an AI draft.", verdict: "weaker", explanation: "You have checked it, and it holds. A warning would suggest a doubt that the evidence doesn't support." },
              { id: "b", label: "Remove it, as readers can contact the hall themselves.", verdict: "weaker", explanation: "The claim is accurate and useful, so there's no reason to lose it." },
              { id: "c", label: "Retain it, as the current certificate says exactly this.", verdict: "correct", explanation: "The current source says exactly this. Justified trust matters as much as justified doubt." },
            ],
          },
        },
        {
          id: "find-assumption",
          label: "Finding the assumption behind an argument",
          kind: "transfer",
          items: ["people", "felt", "double", "year"].map((id) => `assumption/${id}`),
          practice: {
            prompt: "A manager says: “The evening class was full last term, so we should run three of them next term.” Which assumption matters most?",
            choices: [
              { id: "a", label: "That the evening class was full last term, with a waiting list for places.", verdict: "weaker", explanation: "That the class was full is stated. A waiting list would be useful to know, but tripling needs much more." },
              { id: "b", label: "That demand and staffing would stretch to three classes.", verdict: "correct", explanation: "One full class doesn't show that there are enough learners or tutors for three, and the argument never says so." },
              { id: "c", label: "That the building will be open in the evenings during the whole of next term.", verdict: "weaker", explanation: "This needs checking, but it applies to one class as much as three, so it isn't what the jump depends on." },
            ],
          },
        },
        {
          id: "find-claims",
          label: "Finding the checkable claims in a draft",
          kind: "transfer",
          items: [...audit.claims, ...audit.decoys!].map((x) => `audit/spot/${x.id}`),
        },
        {
          id: "write-fix",
          label: "Writing an accurate fix from the source",
          kind: "transfer",
          items: ["confident", "broadband", "free"].map((id) => `audit/${id}/repair`),
        },
        {
          id: "note-to-colleague",
          label: "Separating what evidence shows from what it does not",
          kind: "reasoning",
          items: ["note"],
        },
      ],
      nextMissionId: null,
    },
  ],
};
