import type { Choice, Mission } from "../../types";

/**
 * M13 — The Citizens' Assembly.
 * All places, people, figures and the pilot are fictional. Quantities state their source and assumptions;
 * where a figure can't be compared (energy), the case says so rather than inventing precision (PRD M13).
 */

const firstMove =
  "At the panel's first meeting, a councillor says: “The AI desk saves €120,000 a year. Surely that settles it.” What do you say?";
const firstChoices: Choice[] = [
  { id: "a", label: "Agreed, as long as the saving is more than it costs to run.", verdict: "weaker", explanation: "Savings matter, but they don't show who loses access, who loses work, or who answers when it's wrong." },
  { id: "b", label: "First ask who gains, who pays, and on what conditions.", verdict: "correct", explanation: "A public service affects people unequally. Naming who gains and who pays shows what conditions would make it fair." },
  { id: "c", label: "Let's see what most residents say in a survey first.", verdict: "weaker", explanation: "A majority can be fine while a minority is shut out. Those are often the people with the fewest alternatives." },
];

export const m13: Mission = {
  id: "m13-assembly",
  title: "The Citizens' Assembly",
  outcome: "Weigh who benefits from an AI system and who bears its costs, and propose conditions for its use, supported by evidence.",
  scenario:
    "Riverside's town council proposes to replace half of its walk-in service desk hours with an AI assistant. You are on a citizens' panel advising the council before it votes.",
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
    { kind: "initialJudgment", id: "initial", prompt: firstMove, choices: firstChoices },
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
        artefact: {
          kind: "document",
          title: "Proposal: replace half of the walk-in service desk hours with an AI assistant",
          meta: "Riverside town council. For the council vote on 15 December 2026.",
          body: [
            "From April 2027, an AI assistant would answer questions about council tax, benefits, housing and bins, by chat and phone, and book appointments. Staff would handle what it can't.",
          ],
        },
        budget: { leads: 5, note: "The panel reports next week." },
        timeline: [{ order: 90, when: "15 December 2026", text: "Council vote on the proposal." }],
        keyLeads: ["pilot", "survey"],
        leads: [
          {
            id: "pilot",
            label: "Read the Kelmere pilot report",
            kind: "record",
            description: "A neighbouring town ran the same service for six months.",
            finding: "70% of chat enquiries were resolved without staff, and residents rated it about the same as the desk. 12 of about 9,000 conversations gave wrong benefits information.",
            timeline: { order: 10, when: "2025", text: "Kelmere's six-month pilot of the same service." },
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
            finding: "“In Kelmere, the phone assistant often misheard people with speech impairments, and there was no quick way to reach a person.”",
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
            finding: "“When Kelmere's assistant gave wrong benefits advice, nobody could tell the family who was responsible.”",
          },
        ],
        statements: [
          { id: "routine", text: "The assistant could handle most routine enquiries.", status: "known", leadIds: ["pilot"], explanation: "Kelmere resolved 70% of chat enquiries without staff." },
          { id: "shut-out", text: "Cutting walk-in hours would shut some residents out.", status: "known", leadIds: ["survey", "advocate"], explanation: "One in five over-75s has no internet, and some people couldn't use the phone assistant." },
          { id: "carbon", text: "The service would reduce the council's carbon emissions.", status: "uncertain", leadIds: [], explanation: "No comparable figures exist: the provider's statement has no stated assumptions." },
          { id: "savings", text: "The projected saving depends on halving walk-in hours.", status: "known", leadIds: ["finance"], explanation: "The finance projection assumes it." },
          { id: "flawless", text: "The assistant gives accurate benefits information every time.", status: "contradicted", leadIds: ["pilot"], explanation: "12 of about 9,000 Kelmere conversations got it wrong. Rare, but not never, and costly for those families." },
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
      motifs: ["decisiveFits"],
      prompt: "The council asks for the panel's recommendation. Which is best supported by the evidence?",
      choices: [
        { id: "a", label: "Adopt it as proposed, halving walk-in hours from April.", verdict: "weaker", explanation: "Known harms, to residents without internet and to disabled residents, would go unaddressed." },
        { id: "b", label: "Adopt it from April, with the panel's conditions in place.", verdict: "correct", explanation: "Kelmere has already run the same service for six months, so the main risks are known, and the conditions protect the people most at risk. Most residents gain now. Review it as you would any service." },
        { id: "c", label: "Run a six-month trial of its own before deciding anything.", verdict: "defensible", explanation: "Cautious, but Kelmere's six months already answer most of what a trial would. It mostly delays a service most residents could use well." },
      ],
      hints: [{ text: "What does the panel already know from Kelmere, and do the conditions deal with it?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt:
        "A neighbouring council says: “Our AI parking-permit service went well: 90% of applicants used it happily.” Before copying it, what would you ask first?",
      choices: [
        { id: "a", label: "Whether the 90% figure came from an independent survey.", verdict: "weaker", explanation: "Worth knowing, but even an accurate 90% says nothing about the 10% who couldn't or didn't use it." },
        { id: "b", label: "Who the other 10% were, and how they got a permit.", verdict: "correct", explanation: "The people a service doesn't suit are often those with the fewest alternatives. Whether they still got a permit decides whether it is fair." },
        { id: "c", label: "How much money the service saved the council each year.", verdict: "weaker", explanation: "Savings matter, but they don't show who lost access, or who answers when it goes wrong." },
      ],
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
      prompt: "Write the panel's recommendation to the council.",
      format: "structured",
      fields: [
        { id: "do", label: "What the council should do" },
        { id: "evidence", label: "The evidence for it" },
        { id: "affected", label: "Who gains, and who bears the costs" },
        { id: "change", label: "What new information would change your view" },
      ],
      rubric: {
        samples: [
          { id: "weak", text: "We think the AI is a good idea because it saves money.", met: [], note: "It names one benefit and ignores who bears the costs and what is uncertain." },
          {
            id: "strong",
            text: "Run the assistant for six months, keeping a staffed phone line and a “talk to a person” option, with a monthly review of benefits answers. Kelmere's pilot shows it can handle most routine questions, but one in five over-75s has no internet and some disabled residents couldn't use it. If the review finds more wrong benefits answers than Kelmere's, or the phone line is overwhelmed, the council should think again.",
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
              { id: "b", label: "Trial it in two classes against teacher marking.", verdict: "correct", explanation: "A limited trial with a comparison and a review date turns uncertainty into evidence." },
              { id: "c", label: "Ban it for now, since a number of teachers object.", verdict: "weaker", explanation: "Objections are worth hearing, but they aren't evidence about how it performs." },
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
