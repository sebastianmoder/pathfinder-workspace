import type { Choice, Mission } from "../../types";

/**
 * M13 — The Citizens' Assembly.
 * All places, people, figures and the pilot are fictional. Quantities state their source and assumptions;
 * where a figure can't be compared (energy), the case says so rather than inventing precision (PRD M13).
 */

const decideQuestion = "A council could save money with an AI service desk. What should mostly decide whether it goes ahead?";
const decideChoices: Choice[] = [
  { id: "a", label: "Whether the savings are larger than what the system costs.", verdict: "weaker", explanation: "Savings matter, but they don't show who loses access, who loses work, or who answers when it's wrong." },
  { id: "b", label: "Who benefits, who bears the costs, and on what conditions it would be acceptable.", verdict: "correct", explanation: "A public service affects people unequally. Naming who gains and who pays shows what conditions would make it fair." },
  { id: "c", label: "Whether most residents say in a survey that they would use it.", verdict: "weaker", explanation: "A majority can be fine while a minority is shut out. Those are often the people with the fewest alternatives." },
];

export const m13: Mission = {
  id: "m13-assembly",
  title: "The Citizens' Assembly",
  outcome: "Weigh who benefits from an AI system and who bears its costs, and propose conditions for its use, supported by evidence.",
  scenario:
    "Riverside's town council, in a fictional town, proposes to replace half of its walk-in service desk hours with an AI assistant. You are on a citizens' panel advising the council before it votes.",
  approxMinutes: 15,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["All figures are fictional and labelled with their source and assumptions in the case. Keep the energy case general: published figures vary in what they include."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Gather evidence from several sides, say what is known and what isn't, choose conditions within a budget, and recommend what the council should do.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "Check claims against sources, and say what is still uncertain (the Newsroom). Look at who errors fall on (the Fairness Council). Keep people able to reach a person when a system fails (the Systems Workshop). A figure is only as useful as its assumptions: if they aren't stated, it can't be compared.",
    },
    { kind: "initialJudgment", id: "initial", prompt: decideQuestion, choices: decideChoices },
    {
      kind: "casefile",
      id: "assembly",
      title: "Hear the evidence",
      intro: "The panel has time for five of these seven before it reports. Hear from more than one side.",
      casefile: {
        artifact: {
          label: "Council proposal",
          title: "Replace half of the walk-in service desk hours with an AI assistant, by chat and phone, from April 2027.",
          body: "The assistant would answer questions about council tax, benefits, housing and bins, and book appointments. Staff would handle what it can't.",
          meta: "Council vote: 15 December 2026",
        },
        budget: { leads: 5, note: "The panel reports next week." },
        timeline: [{ order: 90, when: "15 December 2026", text: "Council vote on the proposal." }],
        keyLeads: ["pilot", "survey"],
        leads: [
          {
            id: "pilot",
            label: "Read the Eastfield pilot report",
            kind: "record",
            description: "A neighbouring town ran the same service for six months.",
            finding: "70% of chat enquiries were resolved without staff, and residents rated it about the same as the desk. 12 of about 9,000 conversations gave wrong benefits information.",
            timeline: { order: 10, when: "2025", text: "Eastfield's six-month pilot of the same service." },
          },
          {
            id: "survey",
            label: "Read the residents' digital access survey",
            kind: "record",
            description: "The council's own survey of 1,200 residents.",
            finding: "One in five residents over 75 has no internet at home.",
            timeline: { order: 20, when: "2026", text: "Council survey on residents' digital access." },
          },
          {
            id: "advocate",
            label: "Talk to the disability advocate",
            kind: "interview",
            description: "From Riverside Disability Forum.",
            finding: "“In Eastfield, the phone assistant often misheard people with speech impairments, and there was no quick way to reach a person.”",
          },
          {
            id: "staff",
            label: "Talk to the desk staff representative",
            kind: "interview",
            description: "Represents the eight people who staff the walk-in desk.",
            finding: "“Halving the hours means four posts go. We'd rather move to handling the complicated cases the assistant can't.”",
          },
          {
            id: "finance",
            label: "Read the finance projection",
            kind: "record",
            description: "From the council's finance team.",
            finding: "A saving of €120,000 a year, assuming walk-in hours are halved and four posts are cut.",
          },
          {
            id: "energy",
            label: "Read the provider's energy statement",
            kind: "record",
            description: "The company that would run the assistant.",
            finding: "It gives one figure for annual electricity use, but not what it includes or how it was estimated, so it can't be compared with running the desk.",
          },
          {
            id: "residents",
            label: "Talk to the residents' association",
            kind: "interview",
            description: "A volunteer group that takes up residents' complaints.",
            finding: "“When Eastfield's assistant gave wrong benefits advice, nobody could tell the family who was responsible.”",
          },
        ],
        statements: [
          { id: "routine", text: "The assistant could handle most routine enquiries.", status: "known", leadIds: ["pilot"], explanation: "Eastfield resolved 70% of chat enquiries without staff." },
          { id: "shut-out", text: "Cutting walk-in hours would shut some residents out.", status: "known", leadIds: ["survey", "advocate"], explanation: "One in five over-75s has no internet, and some people couldn't use the phone assistant." },
          { id: "carbon", text: "The service would reduce the council's carbon emissions.", status: "uncertain", leadIds: [], explanation: "No comparable figures exist: the provider's statement has no stated assumptions." },
          { id: "savings", text: "The projected saving depends on halving walk-in hours.", status: "known", leadIds: ["finance"], explanation: "The finance projection assumes it." },
          { id: "flawless", text: "The assistant gives accurate benefits information every time.", status: "contradicted", leadIds: ["pilot"], explanation: "12 of about 9,000 Eastfield conversations got it wrong. Rare, but not never, and costly for those families." },
        ],
      },
    },
    {
      kind: "allocation",
      id: "conditions",
      title: "Set conditions",
      intro: "The council will spend up to €50,000 of the first year's saving on conditions the panel recommends. Choose them, then check whose concerns your plan covers.",
      allocation: {
        budget: { amount: 50000, label: "Budget for conditions", unit: "€" },
        options: [
          { id: "walkin", label: "Keep the walk-in desk open three days a week", cost: 40000, addresses: ["offline", "access", "staff"], note: "It halves the projected saving." },
          { id: "person", label: "A “talk to a person” option in every conversation, answered within a day", cost: 15000, addresses: ["access", "accountability"], note: "It needs staff time, so part of the saving goes back into the desk." },
          { id: "phone", label: "A staffed phone line for people without internet", cost: 20000, addresses: ["offline"], note: "It covers people without internet, but not those who find phones hard." },
          { id: "retrain", label: "Retrain desk staff to handle complex cases", cost: 10000, addresses: ["staff"], note: "It keeps jobs only if complex cases fill the hours." },
          { id: "review", label: "An independent monthly review of a sample of benefits answers", cost: 10000, addresses: ["errors", "accountability"], note: "It finds errors after they happen, not before." },
          { id: "testing", label: "Test the service with disabled residents before launch", cost: 5000, addresses: ["access"], note: "It delays the launch by two months." },
          { id: "energy", label: "Require the provider to publish its energy use and the assumptions behind it", cost: 2000, addresses: ["energy"], note: "It makes figures comparable, but doesn't reduce use by itself." },
        ],
        concerns: [
          { id: "offline", stakeholder: "Older residents' group", text: "One in five residents over 75 has no internet at home.", essential: true, why: "Without an alternative, some residents lose access to council services altogether." },
          { id: "access", stakeholder: "Disability advocate", text: "The phone assistant misheard people with speech impairments.", essential: true, why: "A public service has to be usable by disabled residents." },
          { id: "errors", stakeholder: "Welfare rights adviser", text: "Wrong benefits information can cost a family money.", essential: true, why: "Errors here cause direct harm, so someone has to be checking for them." },
          { id: "accountability", stakeholder: "Residents' association", text: "Nobody could say who was responsible for a wrong answer.", why: "Important, and naming an owner costs nothing, so it belongs in the decision itself as well as in the budget." },
          { id: "staff", stakeholder: "Desk staff", text: "Four posts could go if walk-in hours are halved.", why: "A real cost to weigh and explain, but not on its own a reason to block the service." },
          { id: "energy", stakeholder: "Environmental group", text: "Nobody can compare the service's energy use.", why: "A fair, cheap request, but the decision doesn't depend on it." },
        ],
      },
    },
    {
      kind: "quiz",
      id: "decide",
      prompt: "The council asks for the panel's recommendation. Which is best supported by the evidence?",
      choices: [
        { id: "a", label: "Adopt it now as proposed, halving walk-in hours from April.", verdict: "weaker", explanation: "Known harms, to residents without internet and to disabled residents, would go unaddressed." },
        { id: "b", label: "Run it for six months with the panel's conditions, and review before any cuts become permanent.", verdict: "correct", explanation: "It takes the benefits seriously while protecting the people most at risk, and it sets a point to decide again with better evidence." },
        { id: "c", label: "Wait: test it with disabled residents and get comparable energy figures first.", verdict: "defensible", explanation: "Cautious and reasonable. The cost is delay to a service most residents could use well." },
      ],
      hints: [{ text: "Which option deals with what is known, and plans for what is still uncertain?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `Having heard the evidence, answer the first question again. ${decideQuestion}`,
      choices: decideChoices,
      withConfidence: true,
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new proposal",
      prompt: "A health centre plans an AI line for booking appointments. It has €20,000 for conditions. Choose a plan. There is no guidance this time.",
      allocation: {
        budget: { amount: 20000, label: "Budget for conditions", unit: "€" },
        options: [
          { id: "receptionist", label: "Keep one receptionist answering calls in the mornings", cost: 12000, addresses: ["offline", "urgent"], note: "Mornings only: afternoon callers still meet the automated line." },
          { id: "triage", label: "Send any mention of chest pain or breathing problems straight to a nurse", cost: 3000, addresses: ["urgent"], note: "Relies on the line recognising the words people use." },
          { id: "languages", label: "Offer the line in the five most-spoken local languages", cost: 6000, addresses: ["language"], note: "Speakers of other languages are still left out." },
          { id: "callback", label: "A staff callback within two hours for anyone who asks", cost: 8000, addresses: ["offline", "language"], note: "Two hours is a long wait for some." },
          { id: "audit", label: "A monthly check of a sample of calls", cost: 4000, addresses: ["errors"], note: "Finds problems after they happen." },
        ],
        concerns: [
          { id: "urgent", stakeholder: "Patients with urgent symptoms", text: "An automated line could delay urgent care.", essential: true, why: "A delay here can be dangerous." },
          { id: "offline", stakeholder: "Older patients", text: "Some patients can't use automated phone menus.", essential: true, why: "They would lose access to appointments." },
          { id: "language", stakeholder: "Patients who speak little English", text: "The line works only in English.", essential: true, why: "They would lose access to appointments." },
          { id: "errors", stakeholder: "Practice manager", text: "Wrong bookings waste appointments.", why: "A cost to monitor, not a reason to block." },
        ],
      },
    },
    {
      kind: "openResponse",
      id: "recommend",
      prompt: "Write the panel's recommendation to the council in a short paragraph: what to do, the evidence for it, who is affected, and what new information would change your view.",
      rubric: {
        samples: [
          { id: "weak", text: "We think the AI is a good idea because it saves money.", met: [], note: "It names one benefit and ignores who bears the costs and what is uncertain." },
          {
            id: "strong",
            text: "Run the assistant for six months, keeping a staffed phone line and a “talk to a person” option, with a monthly review of benefits answers. Eastfield's pilot shows it can handle most routine questions, but one in five over-75s has no internet and some disabled residents couldn't use it. If the review finds more wrong benefits answers than Eastfield's, or the phone line is overwhelmed, the council should think again.",
            met: ["evidence", "affected", "change"],
            note: "It recommends with evidence, names the affected groups, and says what would change the decision.",
          },
        ],
        criteria: [
          { id: "evidence", text: "Supports the recommendation with evidence from the case." },
          { id: "affected", text: "Names who benefits and who bears the costs." },
          { id: "change", text: "Says what new information would justify changing the decision." },
        ],
        examples: [
          "Don't halve the desk hours yet. The pilot shows the assistant works for routine questions, but residents without internet and disabled residents would lose out. Test it with disabled residents first. If those tests go well, start a six-month trial.",
          "Adopt it with conditions: a phone line, a person to talk to, and monthly checks of benefits answers. That keeps most of the saving while protecting those the survey and advocate identified. Comparable energy figures, or a rise in complaints, would be reasons to revisit.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Ask who benefits and who pays, set conditions that protect those with the least choice, and say what evidence would change your mind.",
      skills: [
        { id: "sides", label: "Gathering evidence from more than one side", kind: "action", items: ["assembly/lead/pilot", "assembly/lead/survey"] },
        { id: "known", label: "Separating what is known from what isn't", kind: "reasoning", items: ["assembly/routine", "assembly/shut-out", "assembly/carbon", "assembly/savings", "assembly/flawless"] },
        { id: "conditions", label: "Setting conditions that cover essential concerns", kind: "action", items: ["conditions/plan"] },
        {
          id: "decide",
          label: "Recommending a decision with a point to review it",
          kind: "knowledge",
          items: ["decide", "revision"],
          practice: {
            prompt: "A school wants AI marking for all homework next term. Teachers are split. What recommendation best fits uncertain evidence?",
            choices: [
              { id: "a", label: "Use it for all homework, since teachers will save time.", verdict: "weaker", explanation: "It acts as if the uncertainty weren't there, and the cost falls on pupils if marking is wrong." },
              { id: "b", label: "Trial it in two classes, compare with teacher marking, and review at half term.", verdict: "correct", explanation: "A limited trial with a comparison and a review date turns uncertainty into evidence." },
              { id: "c", label: "Ban it, since some teachers object.", verdict: "weaker", explanation: "Objections are worth hearing, but they aren't evidence about how it performs." },
            ],
          },
        },
        { id: "new-proposal", label: "Setting conditions for a new proposal, without guidance", kind: "transfer", items: ["transfer/plan"] },
        { id: "recommend", label: "Writing a recommendation with evidence and conditions", kind: "reasoning", items: ["recommend"] },
      ],
      nextMissionId: "c01-scope",
    },
  ],
};
