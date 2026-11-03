import type { AuditSpec, Choice, Mission } from "../../types";

/**
 * M07 — The Numbers Lab.
 * All organisations and figures are fictional.
 * Arithmetic to re-check on review: 92→101 is +9.8%; 97→101 is +4.1%; 10/12 is 83.3%; per 1,000 residents
 * Riverside 300/15,000 = 20, Bramley 150/3,000 = 50, Eastfield 210/7,000 = 30; 80→120 is +50%; 6→18 is +200%; 27/30 is 90%.
 */

const chartQuestion = "An AI-made slide shows visits climbing steeply, captioned “Visits soared after we introduced the AI helper.” What would most change whether you believe it?";
const chartChoices: Choice[] = [
  {
    id: "a",
    label: "Whether the chart's numbers match the records exactly.",
    verdict: "weaker",
    explanation: "Accurate numbers can still be drawn to exaggerate a change, picked from a convenient period, or used to imply a cause they can't show.",
  },
  {
    id: "b",
    label: "How the axis, the time range and the comparison were chosen, and what else changed at the time.",
    verdict: "correct",
    explanation: "Each of those choices can make a small change look large, or a coincidence look like a cause. They are where to look first.",
  },
  {
    id: "c",
    label: "Whether the chart looks professional and comes from a tool you trust.",
    verdict: "weaker",
    explanation: "A polished chart is as easy to make from a misleading choice as from a fair one. Its look is not evidence.",
  },
];

const audit: AuditSpec = {
  sources: [
    {
      id: "register",
      title: "Drop-in register summary",
      description: "Monthly totals from the Commons' digital drop-in sign-in sheets.",
      date: "July 2026",
      passages: [
        { id: "reg-visits", text: "Recorded visits, January to June 2026: 92, 95, 97, 96, 99 and 101 a month. October to December 2025: 104, 100 and 88." },
        { id: "reg-closure", text: "The Commons was closed from 22 December 2025 to 4 January 2026." },
        { id: "reg-helper", text: "The AI helper was installed on the drop-in laptops on 2 March 2026. Staff did not record which visitors used it." },
      ],
    },
    {
      id: "cards",
      title: "Visitor feedback cards",
      description: "Paper cards left at the drop-in desk for anyone to fill in.",
      date: "March–June 2026",
      passages: [
        { id: "cards-result", text: "12 feedback cards were returned between March and June. 10 rated the drop-in “good” or “very good”." },
        { id: "cards-scope", text: "Staff did not record how many visitors were offered a card." },
      ],
    },
    {
      id: "finance",
      title: "Finance note",
      description: "Note from the Commons finance officer on running costs.",
      date: "June 2026",
      passages: [{ id: "costs-helper", text: "The AI helper licence costs €1,800 a year. Supporting it takes about 2 hours of staff time a week." }],
    },
  ],
  briefing: [
    ["Slide 2: The digital drop-in in 2026. ", { claimId: "rise" }, " ", { claimId: "caused" }],
    ["Slide 3: What visitors think. ", { claimId: "satisfied" }],
    ["Slide 4: Value for money. ", { claimId: "cost" }],
  ],
  claims: [
    {
      id: "rise",
      text: "Monthly visits rose by about 10% from January to June [Register summary, July 2026].",
      status: "supported",
      passageIds: ["reg-visits"],
      bestAction: "retain",
      evidenceExplanation: "The visits passage gives 92 in January and 101 in June.",
      statusExplanation: "A rise of 9 on 92 is 9.8%, so “about 10%” is fair. The chart made it look bigger, but the claim itself is sound.",
      actionExplanation: "Keep it. A claim that checks out stays, even in a deck with problems elsewhere.",
      finalText: "Monthly visits rose by about 10% from January to June [Register summary, July 2026].",
      hint: "Find the January and June figures, then work out the change as a share of January.",
      calculation: { prompt: "Work it out: by what percentage did visits rise from January to June?", min: 9, max: 11, explanation: "The rise is 9 on a base of 92, about 9.8%." },
      ifLost: "The board never saw that visits had grown modestly, which was the honest good news.",
    },
    {
      id: "caused",
      text: "The AI helper caused the rise in visits since March [Register summary, July 2026].",
      status: "unsupported",
      passageIds: ["reg-helper"],
      citationMismatch: true,
      bestAction: "qualify",
      defensibleActions: ["remove"],
      evidenceExplanation: "The register does mention the helper: it was installed on 2 March, and nobody recorded who used it. That passage is cited, but it doesn't show a cause.",
      statusExplanation: "Visits went from 97 in March to 101 in June. Nothing links that to the helper, and visits were already recovering from December's closure. Something happening after a change isn't evidence that the change caused it.",
      actionExplanation: "State what the records show: the timing, and that use wasn't recorded. Removing the claim is also defensible.",
      finalText: "Visits rose from 97 in March to 101 in June, after the AI helper was installed. Staff did not record who used it, so the rise can't be put down to the helper [Register summary, July 2026].",
      repair: ["Visits rose from ", { id: "from", accept: ["97"] }, " in March to ", { id: "to", accept: ["101"] }, " in June, after the AI helper was installed. Staff did not record who used it, so the rise can't be put down to the helper [Register summary, July 2026]."],
      hint: "Does the register say anything about who used the helper?",
      ifKept: "The board renewed the licence because the helper “caused” the rise. A year later, visits were flat, and nobody could say whether the helper had ever made a difference.",
    },
    {
      id: "satisfied",
      text: "83% of visitors are satisfied with the drop-in [Feedback cards, spring 2026].",
      status: "misleading",
      passageIds: ["cards-result"],
      bestAction: "qualify",
      defensibleActions: ["correct"],
      evidenceExplanation: "The results passage says 10 of 12 returned cards were positive.",
      statusExplanation: "10 of 12 is 83%, but 12 cards from around 400 visits, filled in by whoever chose to, can't stand for “visitors”. The sample is tiny and self-selected.",
      actionExplanation: "Keep the finding and say whose views it is. Rewording it as a correction is also defensible.",
      finalText: "Of the 12 feedback cards returned, 10 rated the drop-in good or very good [Feedback cards, spring 2026].",
      repair: ["Of the ", { id: "returned", accept: ["12"] }, " feedback cards returned, ", { id: "positive", accept: ["10"] }, " rated the drop-in good or very good [Feedback cards, spring 2026]."],
      hint: "83% of how many?",
      calculation: { prompt: "Work it out: what percentage of returned cards were positive?", min: 83, max: 84, explanation: "10 of 12 is 83.3%. The arithmetic is right; the problem is who the 12 were." },
      ifKept: "The funder quoted “83% of visitors satisfied” in its own report, then asked for the survey method and found 12 cards.",
    },
    {
      id: "cost",
      text: "The AI helper costs just €180 a year [Finance note, June 2026].",
      status: "incorrect",
      passageIds: ["costs-helper"],
      bestAction: "correct",
      evidenceExplanation: "The finance note gives the licence cost and the staff time.",
      statusExplanation: "The licence is €1,800, ten times the figure on the slide, and the slide leaves out two hours of staff time a week.",
      actionExplanation: "Correct the figure and include the staff time, since both are costs the board is weighing.",
      finalText: "The AI helper licence costs €1,800 a year, plus about 2 hours of staff time a week [Finance note, June 2026].",
      repair: ["The AI helper licence costs €", { id: "licence", accept: ["1,800", "1800"] }, " a year, plus about ", { id: "hours", accept: ["2", "two"] }, " hours of staff time a week [Finance note, June 2026]."],
      hint: "Compare the number of zeros.",
      ifKept: "The board approved the licence as a minor expense. The invoice was for €1,800, and the budget for the summer programme was cut to cover it.",
    },
  ],
};

const transferAudit: AuditSpec = {
  support: "independent",
  reasonPrompt: "In a sentence or two, what do the numbers actually show?",
  decoys: [{ id: "community", text: "Football brings the whole community together.", explanation: "This is a view. No record could confirm or contradict it." }],
  sources: [
    {
      id: "membership",
      title: "Club membership records",
      description: "Registration totals kept by the club secretary.",
      date: "January 2026",
      passages: [
        { id: "mem-total", text: "Registered players: 80 in 2024 and 120 in 2025." },
        { id: "mem-girls", text: "Players in girls' teams: 6 in 2024 and 18 in 2025." },
      ],
    },
    {
      id: "survey",
      title: "Parent survey",
      description: "Online survey emailed by the club to every registered family.",
      date: "December 2025",
      passages: [{ id: "survey-active", text: "The survey went to all 120 families, and 30 replied. Of those, 27 said their child had become more active." }],
    },
  ],
  briefing: [
    ["Eastfield Youth Football Club: our case for a council grant. ", { decoyId: "community" }, " ", { claimId: "growth" }, " ", { claimId: "girls" }, " ", { claimId: "active" }],
  ],
  claims: [
    {
      id: "growth",
      text: "Membership grew by 50% in 2025 [Membership records].",
      status: "supported",
      passageIds: ["mem-total"],
      bestAction: "retain",
      evidenceExplanation: "The totals passage gives 80 and 120.",
      statusExplanation: "A rise of 40 on 80 is exactly 50%.",
      actionExplanation: "Keep it.",
      finalText: "Membership grew by 50% in 2025 [Membership records].",
      calculation: { prompt: "Work it out: by what percentage did membership grow?", min: 49, max: 51, explanation: "40 more players on a base of 80 is 50%." },
      ifLost: "The application left out its clearest evidence of growth.",
    },
    {
      id: "girls",
      text: "The number of girls playing rose by 300% [Membership records].",
      status: "incorrect",
      passageIds: ["mem-girls"],
      bestAction: "correct",
      evidenceExplanation: "The girls' teams passage gives 6 and 18.",
      statusExplanation: "From 6 to 18 is three times as many, which is a rise of 200%, not 300%. “Tripled” and “rose by 300%” are not the same.",
      actionExplanation: "Correct the percentage. The real figure is still impressive.",
      finalText: "The number of girls playing rose from 6 to 18, an increase of 200% [Membership records].",
      calculation: { prompt: "Work it out: by what percentage did the number of girls rise?", min: 199, max: 201, explanation: "A rise of 12 on a base of 6 is 200%." },
      repair: ["The number of girls playing rose from ", { id: "from", accept: ["6"] }, " to ", { id: "to", accept: ["18"] }, ", an increase of ", { id: "pct", accept: ["200"] }, "% [Membership records]."],
      ifKept: "A council officer checked the arithmetic and marked the whole application down for accuracy.",
    },
    {
      id: "active",
      text: "Nine in ten parents say their child is more active [Parent survey].",
      status: "misleading",
      passageIds: ["survey-active"],
      bestAction: "qualify",
      defensibleActions: ["correct"],
      evidenceExplanation: "The survey passage gives 27 of 30 replies, from 120 families asked.",
      statusExplanation: "27 of 30 is 90%, but only a quarter of families replied, and the happiest parents may be the likeliest to answer.",
      actionExplanation: "Keep the finding and say who it describes.",
      finalText: "Of the 30 parents who replied, out of 120 asked, 27 said their child had become more active [Parent survey].",
      repair: ["Of the ", { id: "replied", accept: ["30"] }, " parents who replied, out of ", { id: "asked", accept: ["120"] }, " asked, ", { id: "said", accept: ["27"] }, " said their child had become more active [Parent survey]."],
      ifKept: "The council funded the club as having “clear evidence” of more active children, then found that three-quarters of families had not answered.",
    },
  ],
};

export const m07: Mission = {
  id: "m07-numbers",
  title: "The Numbers Lab",
  outcome: "Check numerical claims, and spot misleading charts, comparisons, samples and causal conclusions.",
  scenario:
    "You are the researcher at the Riverside Learning Commons, a fictional community learning centre. An AI tool has built a slide deck about the digital drop-in for the board, which will decide whether to renew the drop-in's AI helper. Check the numbers before the board does.",
  approxMinutes: 16,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["All arithmetic is listed at the top of this file; content tests recompute the chart values."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Repair two misleading charts, check the deck's figures against the records, and decide which error matters most to the board's decision.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A claim that cites a source still needs checking against it (the method from the Evidence Bureau). With numbers, also ask: compared with what, out of how many, over which period, and does the evidence show a cause or only that two things happened together? A percentage change is the difference divided by the starting value.",
    },
    { kind: "initialJudgment", id: "initial", prompt: chartQuestion, choices: chartChoices },
    {
      kind: "chartLab",
      id: "trend",
      title: "Repair the visits chart",
      intro: "This is the chart from slide 2, drawn from the register. Change how it is drawn, and see what the same numbers say.",
      chart: {
        claim: "Visits to the digital drop-in have soared since the AI helper arrived in March.",
        categoryLabel: "Month",
        categories: [
          { id: "oct", label: "Oct" },
          { id: "nov", label: "Nov" },
          { id: "dec", label: "Dec" },
          { id: "jan", label: "Jan" },
          { id: "feb", label: "Feb" },
          { id: "mar", label: "Mar" },
          { id: "apr", label: "Apr" },
          { id: "may", label: "May" },
          { id: "jun", label: "Jun" },
        ],
        quantities: [{ id: "visits", label: "Visits", values: { oct: 104, nov: 100, dec: 88, jan: 92, feb: 95, mar: 97, apr: 96, may: 99, jun: 101 } }],
        measures: [{ id: "visits", label: "Visits per month", numerator: "visits", unit: "visits" }],
        baselines: [
          { id: "slide", label: "At 85, as on the slide", min: 85 },
          { id: "zero", label: "At zero", min: 0 },
        ],
        ranges: [
          { id: "slide", label: "January to June, as on the slide", categoryIds: ["jan", "feb", "mar", "apr", "may", "jun"] },
          { id: "all", label: "Every month on record", categoryIds: ["oct", "nov", "dec", "jan", "feb", "mar", "apr", "may", "jun"] },
        ],
        start: { measure: "visits", baseline: "slide", range: "slide" },
        tasks: [
          {
            id: "axis",
            title: "Draw the size of the change fairly",
            instruction: "The bars on the slide look as if visits more than doubled. Change the chart so the height of each bar is in proportion to its value.",
            goal: { baseline: "zero" },
            solution: { measure: "visits", baseline: "zero", range: "slide" },
            success: "From zero, the bars are nearly the same height. January's 92 to June's 101 is a rise of about 10%: real, but not a surge. Cutting the axis at 85 made it look several times bigger.",
          },
          {
            id: "range",
            title: "Look before the period on the slide",
            instruction: "The slide starts in January. Show every month the register has, and compare the start of the slide with what came before.",
            goal: { range: "all" },
            solution: { measure: "visits", baseline: "zero", range: "all" },
            success: "October had 104 visits, more than June. The Commons was closed for two weeks over December, so January's low starting point is a dip and recovery, not the start of a boom.",
          },
        ],
      },
    },
    {
      kind: "chartLab",
      id: "branches",
      title: "Compare the branches fairly",
      intro: "Slide 5 compares the three branches' drop-ins in the last quarter, and recommends where the next AI helper should go.",
      chart: {
        claim: "Riverside's drop-in reaches far more people than Bramley's or Eastfield's, so the next AI helper should go to Riverside.",
        categoryLabel: "Branch",
        categories: [
          { id: "riverside", label: "Riverside" },
          { id: "bramley", label: "Bramley" },
          { id: "eastfield", label: "Eastfield" },
        ],
        quantities: [
          { id: "visits", label: "Visits (April–June)", values: { riverside: 300, bramley: 150, eastfield: 210 } },
          { id: "residents", label: "Residents in the area", values: { riverside: 15000, bramley: 3000, eastfield: 7000 } },
        ],
        measures: [
          { id: "count", label: "Visits", numerator: "visits", unit: "visits" },
          { id: "rate", label: "Visits per 1,000 residents", numerator: "visits", denominator: "residents", per: 1000, unit: "per 1,000" },
        ],
        baselines: [{ id: "zero", label: "At zero", min: 0 }],
        ranges: [{ id: "all", label: "All branches", categoryIds: ["riverside", "bramley", "eastfield"] }],
        start: { measure: "count", baseline: "zero", range: "all" },
        tasks: [
          {
            id: "rate",
            title: "Compare like with like",
            instruction: "The branches serve areas of very different sizes. Change what the chart shows so it compares how much each drop-in is used relative to the people it serves.",
            goal: { measure: "rate" },
            solution: { measure: "rate", baseline: "zero", range: "all" },
            success: "Per 1,000 residents, Bramley's drop-in is used two and a half times as much as Riverside's. Counts mostly follow the size of the area; a rate shows reach. Both are still visits, not people: one person who comes every week counts twelve times.",
          },
        ],
      },
    },
    {
      kind: "claimAudit",
      id: "audit",
      title: "Check the deck's figures",
      intro: "Each highlighted figure cites a source in the pack. Work out the numbers yourself, then decide what the slide should say.",
      audit,
    },
    {
      kind: "quiz",
      id: "matters",
      prompt: "The board will decide whether to renew the AI helper's licence. Which problem in the deck matters most to that decision?",
      choices: [
        { id: "a", label: "The slide's axis starting at 85, which exaggerates the change.", verdict: "weaker", explanation: "It made a 10% rise look bigger, but the board could still see the numbers. It doesn't change what the helper did." },
        { id: "b", label: "Treating the rise since March as caused by the helper.", verdict: "correct", explanation: "Renewal rests on what the helper achieved. The records can't show it achieved anything, so that is the claim the decision depends on." },
        { id: "c", label: "Rounding a 9.8% rise up to “about 10%” in the summary.", verdict: "weaker", explanation: "That rounding is fair, and changes nothing about the decision." },
      ],
      hints: [{ text: "What would the board need to believe in order to renew the licence?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `Having worked through the deck, answer the first question again. ${chartQuestion}`,
      choices: chartChoices,
      withConfidence: true,
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new set of numbers",
      prompt: "A local football club used an AI tool to draft its case for a council grant. Find the claims, check them against the club's records, and fix what needs fixing. There are no hints this time.",
      audit: transferAudit,
    },
    {
      kind: "openResponse",
      id: "effect",
      prompt:
        "The council will fund clubs that show “clear evidence that children became more active”. Explain how the parent survey claim, as the AI wrote it, could mislead that decision, and what the council can fairly conclude.",
      rubric: {
        samples: [
          { id: "weak", text: "The claim is wrong, so the council shouldn't trust it.", met: [], note: "It doesn't say what is wrong with it, or what the council can conclude instead." },
          {
            id: "strong",
            text: "It says nine in ten parents, but only 30 of 120 families replied, and keen parents are the likeliest to answer. So it looks like clear evidence when it is a small, self-selected sample. The council can say some parents noticed a change, not that children in general became more active.",
            met: ["base", "bias", "decision"],
            note: "It gives the real base, explains why the replies may not be typical, and states a fair conclusion.",
          },
        ],
        criteria: [
          { id: "base", text: "Says that only 30 of 120 families replied." },
          { id: "bias", text: "Explains why those who replied may not be typical." },
          { id: "decision", text: "Says what the council can and can't conclude from it." },
        ],
        examples: [
          "“Nine in ten” sounds like most parents, but it is 27 of the 30 who answered out of 120. Parents who were pleased are more likely to reply. That is encouraging, but it isn't clear evidence, so the council shouldn't treat it as meeting the condition on its own.",
          "Three-quarters of families didn't answer, so we don't know what they think. The 90% only describes the quarter who chose to reply. The council could ask for activity records or a better survey before deciding.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Before trusting a number, ask: compared with what, out of how many, over which period, and does it show a cause?",
      skills: [
        {
          id: "repair-chart",
          label: "Repairing a misleading chart",
          kind: "action",
          items: ["trend/axis", "trend/range"],
          practice: {
            prompt: "A chart of exam passes shows 70% and 74% as bars, one twice the height of the other. What is the most likely cause?",
            choices: [
              { id: "a", label: "The bars were drawn from the wrong figures in the data.", verdict: "weaker", explanation: "The labels can be right while the drawing misleads. Check where the axis starts first." },
              { id: "b", label: "The vertical axis doesn't start at zero.", verdict: "correct", explanation: "If the axis starts at, say, 66%, a 4-point difference fills most of the height." },
              { id: "c", label: "The second year had twice as many pupils sitting the exam.", verdict: "weaker", explanation: "Bar heights show the plotted values, here percentages, not the number of pupils." },
            ],
          },
        },
        {
          id: "rates",
          label: "Comparing groups of different sizes with rates",
          kind: "action",
          items: ["branches/rate"],
          practice: {
            prompt: "Town A had 50 cycling accidents last year, and town B had 20. Town A has 100,000 people, and town B has 20,000. Which is safer for cyclists, on these figures?",
            choices: [
              { id: "a", label: "Town B, because it had fewer accidents.", verdict: "weaker", explanation: "Fewer accidents in a much smaller town can still be a higher rate. Here B has 1 per 1,000 people, A has 0.5." },
              { id: "b", label: "They're equally safe once you round the figures.", verdict: "weaker", explanation: "Per 1,000 people, B's rate is twice A's. Even this is rough: it counts residents, not how much they cycle." },
              { id: "c", label: "Town A, which has half B's accidents per person.", verdict: "correct", explanation: "A has 0.5 per 1,000 people and B has 1. A better comparison would use cycling journeys, if you had them." },
            ],
          },
        },
        {
          id: "calculate",
          label: "Checking a calculation against the source",
          kind: "action",
          items: ["audit/rise/calc", "audit/satisfied/calc", "audit/cost/repair"],
        },
        {
          id: "cause",
          label: "Telling a cause apart from timing",
          kind: "reasoning",
          items: ["audit/caused/status", "matters"],
          practice: {
            prompt: "Library visits rose after a new café opened next door. What can you conclude?",
            choices: [
              { id: "a", label: "The café brought in new library visitors.", verdict: "weaker", explanation: "That is one possibility. The timing alone can't tell it apart from others, such as the season or a new course." },
              { id: "b", label: "The rise came after the café; on its own that doesn't show the café caused it.", verdict: "correct", explanation: "Timing is a clue to investigate, such as by asking visitors, not proof of a cause." },
              { id: "c", label: "The café had nothing to do with it, since the two are separate businesses.", verdict: "weaker", explanation: "It might have helped. You don't know either way without further evidence." },
            ],
          },
        },
        {
          id: "sample",
          label: "Spotting a small or self-selected sample",
          kind: "action",
          items: ["audit/satisfied/status", "audit/satisfied/repair"],
        },
        {
          id: "new-numbers",
          label: "Correcting numbers in a new case, without hints",
          kind: "transfer",
          items: ["transfer/girls/calc", "transfer/girls/repair", "transfer/active/status", "transfer/growth/action"],
        },
        { id: "effect", label: "Explaining how an error affects a decision", kind: "reasoning", items: ["effect"] },
      ],
      nextMissionId: "t01-transfer",
    },
  ],
};
