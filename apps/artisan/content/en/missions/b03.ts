import type { Choice, Mission } from "../../types";

/**
 * B03 — Stage 3 bridge: The Annual Report. Combines M08 (provenance), M09 (fairness), M10 (boundaries)
 * and M11 (disclosure) in one case, with support faded. All people, records and the policy are fictional.
 */

const firstMove =
  "Joanna wants the annual report at the printers by Friday. The AI drafted most of it, and it reads beautifully. Where do you spend your checking time?";
const firstChoices: Choice[] = [
  { id: "a", label: "On spelling and layout, since those are what readers notice.", verdict: "weaker", explanation: "Those are easy to see and easy to fix. The risky problems look fine on the page." },
  { id: "b", label: "On names, photos and claims that could be wrong underneath.", verdict: "correct", explanation: "Personal details, an image's origin and a fairness claim all look fine in a finished report. Only checking finds them." },
  { id: "c", label: "On any sections the AI refused to write, since those are gaps.", verdict: "weaker", explanation: "A refusal is visible. You'll notice it and work around it." },
];

export const b03: Mission = {
  id: "b03-report",
  title: "The Annual Report",
  outcome: "Bring together boundaries, provenance, fairness and disclosure while preparing a public report.",
  scenario:
    "The Riverside Learning Commons, a community learning centre, is publishing its annual report. You're preparing three parts of it with the AI tool's help, under the Commons' publishing policy.",
  approxMinutes: 12,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §6 bridge challenges; no independent subject-matter review yet)",
    sourcesToReview: [],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Proof a page of the report before it goes to the printer, check where its cover photo came from, and decide how to fix each problem. This is a bridge challenge: there are no hints.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "Give AI only what a task needs (the Boundary Room). Check where an image came from before trusting its caption (the Newsroom). The same rule for everyone isn't fair if the scores behind it aren't (the Fairness Council). The Commons' policy: say when AI generated an image or wrote text published largely unchanged, and use photos of people only with signed consent (the Co-Creation Studio).",
    },
    { kind: "initialJudgment", id: "initial", prompt: firstMove, choices: firstChoices },
    {
      kind: "transfer",
      id: "proof",
      title: "Proof the page",
      prompt:
        "The production notes say: Amira agreed to be named by her first name only. The cover photo came from the shared photo folder. The figures have been checked against the register. The tutor-screening paragraph was drafted by the AI tool from the vendor's description. The director's foreword is the AI's draft, unchanged. Mark every passage that can't be printed as it is.",
      frame: { kind: "document", title: "Annual report 2026, page 4: Learning together", meta: "Draft for the printer" },
      mark: [
        [
          { id: "photo", text: "Cover: “Packed library on our opening night, March 2026.”", target: true, explanation: "Nobody knows where this photo came from or who is in it. A shared folder isn't a record of what the Commons owns, so it can't go on the cover until that is checked." },
        ],
        [
          { id: "name", text: "Amira Haddad", target: true, explanation: "She agreed to be named by her first name only." },
          ", ",
          { id: "age", text: "34,", target: false, optional: true, explanation: "Low risk, and it may help the story. Either is reasonable." },
          " joined the English conversation class in January. ",
          { id: "progress", text: "She now helps run the Thursday group.", target: false, explanation: "The heart of her story, which she agreed to share." },
          " ",
          { id: "status", text: "Her asylum case is still being decided.", target: true, explanation: "Highly sensitive, and nothing the story needs. It should never have reached the draft." },
        ],
        [
          { id: "courses", text: "This year the Commons ran 412 courses for 3,900 learners.", target: false, explanation: "The notes say the figures were checked against the register, so this can stand." },
          " ",
          { id: "fair", text: "Our new tutor screening is fair to everyone, because it applies one pass mark to all applicants.", target: true, explanation: "One pass mark doesn't make a screen fair: outcomes by group decide that. And this came from the vendor's description, not from any check." },
          " ",
          { id: "tutors", text: "Twelve new tutors joined in September.", target: false, explanation: "A checked figure about recruitment, with no claim about fairness attached." },
        ],
        [
          "From the director: ",
          { id: "foreword", text: "“Every word of this report was written by our team, who share my pride in a remarkable year.”", target: true, explanation: "The foreword is the AI's draft, published unchanged. The policy asks for a note saying so, and this line says the opposite." },
        ],
      ],
    },
    {
      kind: "casefile",
      id: "cover",
      title: "Check the cover photo",
      intro: "A volunteer has suggested a photo for the cover. You have time to follow two of the three leads.",
      casefile: {
        artifact: {
          label: "Suggested cover photo",
          title: "“Packed library on our opening night, March 2026”",
          body: "[Photo: a crowded, brightly lit library, people of all ages at tables of books.]",
          meta: "Suggested by a volunteer, Tomasz, who found it in the shared photo folder.",
        },
        artefact: {
          kind: "photo",
          scene: "library",
          alt: "A crowded, brightly lit library, people of all ages at tables of books.",
          caption: "“Packed library on our opening night, March 2026.” Suggested for the cover by Tomasz, a volunteer, who found it in the shared photo folder.",
        },
        budget: { leads: 2, note: "The designer needs it today." },
        keyLeads: ["folder"],
        leads: [
          {
            id: "folder",
            label: "Check the file's history in the shared folder",
            kind: "record",
            description: "The folder records who added each file and when.",
            finding: "Added in 2025 by a staff member, with the note “stock photo, for the funding bid mock-up”. It isn't the Commons at all.",
            timeline: { order: 10, when: "2025", text: "Photo added to the folder as a stock image for a mock-up." },
          },
          {
            id: "consent",
            label: "Look for consent forms for the people pictured",
            kind: "record",
            description: "The Commons keeps consent forms for every photo of people.",
            finding: "There are no consent forms for anyone in this photo.",
          },
          {
            id: "ask",
            label: "Ask Tomasz where it came from",
            kind: "interview",
            description: "The volunteer who suggested it.",
            finding: "“It was in the folder with the opening-night photos, so I assumed it was ours.”",
          },
        ],
        statements: [
          { id: "ours", text: "The photo shows the Commons' opening night.", status: "contradicted", leadIds: ["folder"], explanation: "The folder records it as a stock image added a year earlier." },
          { id: "consent-ok", text: "The Commons has consent to show the people in it.", status: "contradicted", leadIds: ["consent"], explanation: "There are no consent forms." },
          { id: "tomasz", text: "Tomasz meant to mislead anyone.", status: "uncertain", leadIds: [], explanation: "He says he assumed it was theirs, and nothing suggests otherwise. Intent isn't something you can establish here, and you don't need to." },
        ],
      },
    },
    {
      kind: "sort",
      id: "fixes",
      prompt: "Now decide how to fix each problem you found before the page goes to the printer.",
      categories: [
        { id: "remove", label: "Take it out" },
        { id: "replace", label: "Replace it with one the Commons may use" },
        { id: "checked", label: "Say only what was actually checked" },
        { id: "disclose", label: "Say that AI wrote it" },
      ],
      items: [
        { id: "name", label: "Amira's surname", categoryId: "remove", explanation: "She agreed to her first name only, so the surname comes out." },
        { id: "status", label: "Amira's asylum case", categoryId: "remove", explanation: "It is private, highly sensitive and adds nothing to her story." },
        { id: "photo", label: "The cover photo", categoryId: "replace", explanation: "It's a stock image with no consent forms. Use a Commons photo whose subjects have signed consent." },
        { id: "fair", label: "“Fair to everyone, because one pass mark”", categoryId: "checked", explanation: "Report what was checked, such as outcomes by group and what changed after, not a claim about the rule." },
        { id: "foreword", label: "The foreword's line about who wrote it", categoryId: "disclose", explanation: "The policy asks for a disclosure when AI-written text is published largely unchanged. The director still approves it and answers for it." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      motifs: ["selfSelectedSample"],
      prompt:
        "A last page arrives: a chart titled “Learners love our AI study helper: 9 in 10 rate it highly”. The figures come from the helper's own pop-up, which asks learners to rate it. What does the page need before printing?",
      choices: [
        { id: "a", label: "Nothing: figures from the tool's own data are accurate.", verdict: "weaker", explanation: "The count may be accurate, but a pop-up answered by whoever chooses to can't stand for “learners”. It looks as finished as a checked claim." },
        { id: "b", label: "How many were asked and answered, and who chose to.", verdict: "correct", explanation: "A finished chart can still overstate who it describes. Say how many answered out of how many asked, or don't print the claim." },
        { id: "c", label: "An AI disclosure, since the chart is about an AI tool.", verdict: "weaker", explanation: "The policy asks for disclosure when AI made an image or wrote text published largely unchanged. The problem here is the evidence." },
      ],
    },
    {
      kind: "openResponse",
      id: "note",
      prompt: "Leave Joanna a note about page 4 before it goes to the printer.",
      format: "structured",
      fields: [
        { id: "changed", label: "What you changed" },
        { id: "why", label: "Why each change was needed" },
        { id: "open", label: "What still has to happen before printing" },
      ],
      rubric: {
        criteria: [
          { id: "changes", text: "Names the changes: Amira's details, the cover photo, the screening claim and the foreword." },
          { id: "reasons", text: "Ties each change to a reason: her consent, the photo's origin, the lack of evidence, the disclosure rule." },
          { id: "open", text: "Says what still needs doing, such as finding a consented photo or what the screening check actually found." },
        ],
        examples: [
          "Changed: took out Amira's surname and her asylum case, pulled the cover photo, rewrote the screening line and added an AI note to the foreword. Why: she agreed to her first name only; the photo is a stock image with no consent; one pass mark isn't evidence of fairness; the foreword is the AI's text unchanged. Still to do: choose a cover from our consented photos, and get the outcomes-by-group figures for the screening paragraph.",
          "I removed two details about Amira that she never agreed to share, replaced the cover because it isn't our photo, cut the fairness claim to what we actually checked, and added a disclosure to the foreword under the policy. Before printing we need a new cover photo with consent forms, and Joanna should approve the foreword with its note.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "A finished report can look right and still carry someone's private details, a borrowed photo or an unchecked claim. Check what leaves your hands, where it came from, and who it affects.",
      skills: [
        { id: "boundaries", label: "Keeping private details out of what is published", kind: "transfer", items: ["proof/name", "proof/status", "fixes/name", "fixes/status"] },
        { id: "provenance", label: "Checking an image's origin and consent", kind: "transfer", items: ["proof/photo", "cover/lead/folder", "cover/ours", "cover/consent-ok", "cover/tomasz", "fixes/photo"] },
        { id: "fairness", label: "Asking for evidence behind a fairness claim", kind: "transfer", items: ["proof/fair", "fixes/fair"] },
        { id: "disclosure", label: "Applying a disclosure rule", kind: "transfer", items: ["proof/foreword", "fixes/foreword"] },
        { id: "leave", label: "Leaving what is sound as it is", kind: "transfer", items: ["proof/progress", "proof/courses", "proof/tutors"] },
        { id: "note", label: "Explaining what you changed and why", kind: "reasoning", items: ["note"] },
        { id: "who-answered", label: "Asking who a finished chart actually describes", kind: "transfer", items: ["revision"] },
      ],
      nextMissionId: "m12-systems",
    },
  ],
};
