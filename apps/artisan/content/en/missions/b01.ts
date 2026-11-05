import type { Choice, Mission } from "../../types";

/**
 * B01 — Stage 1 bridge: The FAQ Project. Combines M01 (fluent isn't correct), M02 (delegation) and
 * M03 (briefing) in one case, with support faded. All people and details are fictional.
 */

const firstMove =
  "Joanna forwards you the job: “Use the AI tool to get an FAQ page up by Friday.” Before you open the tool, what do you do first?";
const firstChoices: Choice[] = [
  { id: "a", label: "Ask it for the whole FAQ in one go, then tidy it up.", verdict: "weaker", explanation: "One request for everything hides decisions, like the refund policy, that a person has to make, and leaves every fact unchecked." },
  { id: "b", label: "Split the job into what AI drafts and what a person decides.", verdict: "correct", explanation: "The project is several tasks with different stakes. Deciding roles and checks first shapes every brief you write." },
  { id: "c", label: "Collect the Commons' facts, so the AI can't get any wrong.", verdict: "weaker", explanation: "Supplying facts helps a great deal, but it can't stop every error, and it doesn't settle who decides the policy wording." },
];

export const b01: Mission = {
  id: "b01-faq",
  title: "The FAQ Project",
  outcome: "Bring together delegation, briefing and checking AI output in one small project.",
  scenario:
    "The Riverside Learning Commons, a community learning centre, gets the same questions at its front desk every day. You've been asked to produce a new FAQ page, with the AI tool's help.",
  approxMinutes: 10,
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
      body: "Decide how the project is split between you and the AI, brief the AI for one answer, and check its draft before anything is published. This is a bridge challenge: there are no hints.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "AI output is fluent whether or not it is right (Inside the Machine). Choose a role for AI by what a mistake would cost and who would catch it (the Delegation Desk). Give it the objective, context, criteria and constraints, and the facts it needs (the Briefing Studio).",
    },
    { kind: "initialJudgment", id: "initial", prompt: firstMove, choices: firstChoices },
    {
      kind: "transfer",
      id: "roles",
      title: "Split the project",
      prompt: "Three tasks make up the FAQ project. Choose a role for AI in each.",
      delegation: {
        later: "Two weeks later",
        support: "independent",
        tasks: [
          {
            id: "themes",
            from: "Sam, front desk",
            title: "Find the most common questions",
            text: "We have 600 anonymised notes of questions from the front-desk log. Could the AI group them into the 20 most common topics?",
            responsible: "You answer for which questions the FAQ covers.",
            outcomes: {
              human: { verdict: "defensible", event: "Sam read all 600 notes over three days and found the 20 topics.", explanation: "Accurate, but slow for a low-stakes task where a skim of AI groupings would do." },
              assisted: { verdict: "correct", event: "The AI grouped them in minutes. Skimming 40 notes, you merged two topics it had split, and the list was ready that day.", explanation: "AI did the sorting, and a quick check caught the one problem before it shaped the page." },
              automated: { verdict: "defensible", event: "The AI's list went straight into planning. It had split “opening hours” and “holiday hours” into two topics, so one FAQ slot was wasted.", explanation: "It mostly works, and a mistake is cheap, but a five-minute skim would have caught it." },
            },
          },
          {
            id: "answers",
            from: "Priya, coordinator",
            title: "Draft the answers",
            text: "Could the AI write the answers to the 20 questions? Some are about times, fees and rules.",
            responsible: "Priya answers for every fact the FAQ states.",
            outcomes: {
              human: { verdict: "defensible", event: "Priya wrote all 20 over a week. They were accurate, and the page went up a week late.", explanation: "Sound, but drafting is where AI saves the most time, if the facts are checked." },
              assisted: { verdict: "correct", event: "The AI drafted all 20. Checking them against the handbook, Priya corrected three times and one fee.", explanation: "AI drafted; a person checked every fact against a source before publishing." },
              automated: { verdict: "weaker", event: "The drafts went live unchecked. One sent visitors to “the café on the ground floor”; the Commons has no café. Members complained.", explanation: "Published facts were never checked. Fluent wording hid the invented detail." },
            },
          },
          {
            id: "policy",
            from: "Joanna, director",
            title: "Decide the refund policy wording",
            text: "The FAQ needs to say what happens to fees when a course is cancelled. Could the AI write that?",
            responsible: "Joanna answers for the Commons' refund policy.",
            outcomes: {
              human: { verdict: "correct", event: "Joanna decided the policy with the finance officer, then wrote two sentences for the FAQ.", explanation: "This is a decision, not a drafting job. The policy has to come from the people who answer for it." },
              assisted: { verdict: "weaker", event: "The AI's draft promised “a full refund within 5 days”, a typical policy, and Joanna approved it without noticing it set a new rule.", explanation: "A draft of a policy that hasn't been decided becomes the policy. Decide first, then let AI help with wording." },
              automated: { verdict: "weaker", event: "The AI wrote that refunds were “at the Commons' discretion”. Members read it as no refunds at all.", explanation: "No one decided the policy, so a generic phrase decided it for them." },
            },
          },
        ],
      },
    },
    {
      kind: "transfer",
      id: "brief-it",
      title: "Brief one answer",
      prompt: "Brief the AI to draft the FAQ answer about opening hours.",
      compose: {
        workspaceLabel: "The brief",
        outputLabel: "The AI's draft",
        support: "independent",
        start: { objective: "vague", context: "none", criteria: "none", constraints: "none" },
        elements: [
          { id: "objective", label: "Objective", help: "", options: [
            { id: "vague", label: "Write about the Commons.", output: "The Riverside Learning Commons is a vibrant hub for learning in the heart of the community." },
            { id: "specific", label: "Write the FAQ answer to “When is the Commons open?”", output: "When is the Commons open?" },
          ] },
          { id: "context", label: "Context", help: "", options: [
            { id: "none", label: "(no context given)", output: "\nWe're open Monday to Saturday, 9:00 to 20:00, and our ground-floor café serves drinks all day." },
            { id: "hours", label: "Here are the current hours: Mon–Fri 9:00–19:00, Sat 10:00–16:00, closed Sun and bank holidays.", output: "\nMonday to Friday, 9:00 to 19:00, and Saturday, 10:00 to 16:00. We're closed on Sundays and bank holidays." },
          ] },
          { id: "criteria", label: "What it must include", help: "", options: [
            { id: "none", label: "(no requirements given)", output: "" },
            { id: "link", label: "Say where to check holiday changes: the noticeboard and the website.", output: "Holiday changes are posted on the noticeboard and the website." },
          ] },
          { id: "constraints", label: "Length and style", help: "", options: [
            { id: "none", label: "(no constraints given)", output: "\nWe look forward to welcoming you and helping you on your learning journey, whatever your goals may be!" },
            { id: "short", label: "Under 50 words, plain language.", output: "" },
          ] },
        ],
        rounds: [
          {
            id: "hours",
            title: "The opening-hours answer",
            instruction: "Get a draft that meets all four criteria, then judge it with the checklist.",
            criteria: [
              { id: "answers", text: "It answers the question asked.", requires: { objective: ["specific"] } },
              { id: "facts", text: "Its hours come from you, not from the AI.", requires: { context: ["hours"] } },
              { id: "changes", text: "It says where to check holiday changes.", requires: { criteria: ["link"] } },
              { id: "short", text: "It is short and plain.", requires: { constraints: ["short"] } },
            ],
            solution: { objective: "specific", context: "hours", criteria: "link", constraints: "short" },
            success: "The hours came from you. Compare the first draft: without them, the AI supplied typical hours, and a café that doesn't exist.",
          },
        ],
      },
    },
    {
      kind: "mark",
      id: "check",
      title: "Check another draft",
      prompt: "Here is the AI's draft for another FAQ answer, written from a brief that gave no facts. Mark every statement that must be checked against a record before it's published.",
      mark: [
        [
          "Can I bring my children? ",
          { id: "age", text: "Children under 12 are welcome when accompanied by an adult.", target: true, explanation: "An age rule is a fact about policy. It could be wrong." },
          " ",
          { id: "room", text: "The family room on the ground floor has books and games.", target: true, explanation: "A room and its contents can be checked. The AI may have invented them." },
          " ",
          { id: "welcome", text: "We love seeing families enjoy learning together!", target: false, explanation: "A friendly sentiment. Nothing to check." },
          " ",
          { id: "free", text: "All children's activities are free.", target: true, explanation: "A claim about fees. It needs checking against the fee list." },
          " ",
          { id: "ask", text: "Ask at the front desk if you'd like to know more.", target: false, optional: true, explanation: "True of any front desk. Checking it is reasonable but not essential." },
        ],
      ],
    },
    {
      kind: "quiz",
      id: "parking",
      prompt: "Your first opening-hours draft mentioned “our ground-floor café”, though your brief never mentioned a café. What is the best next step?",
      choices: [
        { id: "a", label: "Keep it, since a detail that specific is probably true.", verdict: "weaker", explanation: "Specific details are exactly what a model fills gaps with. Specific isn't the same as checked." },
        { id: "b", label: "Remove it, or check it with the facilities manager.", verdict: "correct", explanation: "The model supplied a typical detail you didn't give it. Check it, or leave it out." },
        { id: "c", label: "Ask the AI to confirm that the café is there.", verdict: "weaker", explanation: "Its confirmation is more generated text, not a record." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt:
        "With five answers left, Priya suggests: “The AI drafts have been so good. Let's skip checking the last five.” What do you say?",
      choices: [
        { id: "a", label: "Agree: the first fifteen were fine, so the risk is low.", verdict: "weaker", explanation: "Earlier drafts being right doesn't check these. Each answer states its own facts, and the invented café line looked just as good as the true ones." },
        { id: "b", label: "Check the ones that state times, fees or rules.", verdict: "correct", explanation: "Point the check at what a reader would rely on. A friendly sentence needs no record; a fee does." },
        { id: "c", label: "Check all five word by word, friendly lines included.", verdict: "defensible", explanation: "Thorough, but time spent on sentiment is time not spent on facts. Aim the check at what a reader would rely on." },
      ],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "In a real project, the stage 1 habits work together: decide AI's role, give it the facts and criteria, and check every claim in what it produces.",
      skills: [
        { id: "roles", label: "Choosing roles for AI across a project", kind: "transfer", items: ["roles/themes", "roles/answers", "roles/policy"] },
        { id: "brief", label: "Briefing AI with the facts it needs", kind: "transfer", items: ["brief-it/hours", "brief-it/hours/checklist"] },
        { id: "check", label: "Finding the claims in fluent output that need checking", kind: "transfer", items: ["check/age", "check/room", "check/welcome", "check/free", "parking"] },
      ],
      nextMissionId: "m04-evidence",
    },
  ],
};
