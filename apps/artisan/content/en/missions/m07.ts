import type { AuditSpec, Choice, Mission } from "../../types";

/**
 * M07 — The Numbers Lab.
 * All organisations and figures are fictional.
 * Arithmetic to re-check on review: 92→101 is +9.8%; 97→101 is +4.1%; (380×40 + 20×420)/400 = 59 minutes; per 1,000
 * residents Riverside 300/15,000 = 20, Bramley 150/3,000 = 50, Hollins 210/7,000 = 30; 80→120 is +50%; 6→18 is +200%;
 * 4→2 injuries is −50% on tiny counts; 20%→30% is +10 points, a 50% rise.
 */

const firstMove =
  "The AI-made slide shows bars that look as if visits doubled, captioned “Visits soared after we introduced the AI helper.” The board meets in an hour. What do you check first?";
const firstChoices: Choice[] = [
  {
    id: "a",
    label: "That the bar labels match the register's figures.",
    verdict: "weaker",
    explanation: "Accurate numbers can still be drawn to exaggerate a change, picked from a convenient period, or used to imply a cause they can't show.",
  },
  {
    id: "b",
    label: "How the chart is drawn, and what else changed.",
    verdict: "correct",
    explanation: "The axis, the period shown and the comparison can make a small change look large, and timing alone doesn't show a cause. They are where to look first.",
  },
  {
    id: "c",
    label: "That the tool that made the slide is a reliable one.",
    verdict: "weaker",
    explanation: "A polished chart is as easy to make from a misleading choice as from a fair one. Its look and its origin are not evidence.",
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
        { id: "reg-length", text: "Visit lengths, April to June: 380 visits averaged 40 minutes, and none of them lasted more than an hour. The other 20 were all-day study sessions of about 7 hours." },
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
    ["Slide 3: How the drop-in is used. ", { claimId: "typical" }],
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
      id: "typical",
      text: "The typical visit now lasts about an hour [Register summary, July 2026].",
      status: "misleading",
      passageIds: ["reg-length"],
      bestAction: "qualify",
      defensibleActions: ["correct"],
      evidenceExplanation: "The visit-length passage gives both groups: 380 visits averaging 40 minutes, and 20 all-day sessions of about 7 hours.",
      statusExplanation: "The arithmetic behind “about an hour” is right: the mean of all 400 visits is about 59 minutes. But 20 all-day sessions pull it up. The other 380 visits averaged 40 minutes and none lasted over an hour, so “typical” describes them, not the mean.",
      actionExplanation: "Keep the finding and say what most visits look like. Rewording it as a correction is also defensible.",
      finalText: "Most visits last under an hour, averaging 40 minutes; 20 all-day study sessions raise the overall average to about an hour [Register summary, July 2026].",
      repair: ["Most visits last under an hour, averaging ", { id: "most", accept: ["40"] }, " minutes; ", { id: "long", accept: ["20"] }, " all-day study sessions raise the overall average to about an hour [Register summary, July 2026]."],
      hint: "Does the average look like most visits?",
      calculation: { prompt: "Work it out: what is the average length of all 400 visits, in minutes?", min: 57, max: 61, explanation: "380 visits of 40 minutes and 20 of about 420 minutes make 23,600 minutes over 400 visits: about 59. The average is right; it just isn't typical." },
      ifKept: "The board planned the drop-in's staffing around hour-long visits. Most visitors left within 40 minutes, and the extra cover sat idle.",
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
      id: "injury-log",
      title: "Club injury log",
      description: "Training injuries recorded by the club's first-aid volunteer.",
      date: "January 2026",
      passages: [{ id: "log-injuries", text: "Training injuries needing first aid: 4 in 2024 and 2 in 2025. Nothing about how training is run changed between the two years." }],
    },
  ],
  briefing: [
    ["Millbrook Youth Football Club: our case for a council grant. ", { decoyId: "community" }, " ", { claimId: "growth" }, " ", { claimId: "girls" }, " ", { claimId: "injuries" }],
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
      id: "injuries",
      text: "Injuries at training fell by half in 2025, thanks to the club's new focus on safety [Injury log].",
      status: "misleading",
      passageIds: ["log-injuries"],
      bestAction: "qualify",
      defensibleActions: ["correct"],
      evidenceExplanation: "The injury log gives 4 injuries in 2024 and 2 in 2025, and says nothing about training changed.",
      statusExplanation: "4 to 2 is half, but with counts this small one injury either way swings the percentage wildly. The log also says nothing changed, so “thanks to a focus on safety” has nothing behind it.",
      actionExplanation: "Give the actual counts, and drop the cause the records don't show.",
      finalText: "Training injuries needing first aid went from 4 in 2024 to 2 in 2025 [Injury log].",
      repair: ["Training injuries needing first aid went from ", { id: "from", accept: ["4", "four"] }, " in 2024 to ", { id: "to", accept: ["2", "two"] }, " in 2025 [Injury log]."],
      ifKept: "The council quoted “injuries halved” in its sport report. The next year the club recorded five, and the same report had to say injuries had more than doubled.",
    },
  ],
};

export const m07: Mission = {
  id: "m07-numbers",
  title: "The Numbers Lab",
  outcome: "Check numerical claims, and spot misleading charts, comparisons, samples and causal conclusions.",
  scenario:
    "You are the researcher at the Riverside Learning Commons, a community learning centre. An AI tool has built a slide deck about the digital drop-in for the board, which will decide whether to renew the drop-in's AI helper. Check the numbers before the board does.",
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
    { kind: "initialJudgment", id: "initial", prompt: firstMove, choices: firstChoices, withConfidence: true },
    {
      kind: "chartLab",
      id: "trend",
      title: "Repair the visits chart",
      intro: "This is the chart from slide 2, drawn from the register. Change how it is drawn, and see what the same numbers say.",
      chart: {
        claim: "Visits to the digital drop-in have soared since the AI helper arrived in March.",
        slide: { title: "The digital drop-in in 2026", number: 2 },
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
        claim: "Riverside's drop-in reaches far more people than Bramley's or Hollins's, so the next AI helper should go to Riverside.",
        slide: { title: "Where the next AI helper should go", number: 5 },
        categoryLabel: "Branch",
        categories: [
          { id: "riverside", label: "Riverside" },
          { id: "bramley", label: "Bramley" },
          { id: "hollins", label: "Hollins" },
        ],
        quantities: [
          { id: "visits", label: "Visits (April–June)", values: { riverside: 300, bramley: 150, hollins: 210 } },
          { id: "residents", label: "Residents in the area", values: { riverside: 15000, bramley: 3000, hollins: 7000 } },
        ],
        measures: [
          { id: "count", label: "Visits", numerator: "visits", unit: "visits" },
          { id: "rate", label: "Visits per 1,000 residents", numerator: "visits", denominator: "residents", per: 1000, unit: "per 1,000" },
        ],
        baselines: [{ id: "zero", label: "At zero", min: 0 }],
        ranges: [{ id: "all", label: "All branches", categoryIds: ["riverside", "bramley", "hollins"] }],
        adjustable: {
          quantity: "residents",
          category: "bramley",
          label: "Residents in Bramley",
          note: "The council's estimate dates from before the new estate was built. The planning office says it could now be anywhere up to 6,000.",
          min: 3000,
          max: 6000,
          step: 250,
        },
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
          {
            id: "survive",
            title: "Does the conclusion survive?",
            adjust: true,
            instruction: "The rate rests on Bramley's resident figure, which may be out of date. Move it within its range and find a figure at which Bramley no longer has the highest rate.",
            goal: { measure: "rate", topIsNot: "bramley" },
            solution: { measure: "rate", baseline: "zero", range: "all", adjust: 5500 },
            success: "Above 5,000 residents, Hollins overtakes Bramley. So “Bramley's drop-in reaches people most” depends on a figure nobody has checked, and the board needs a current estimate before using the rate to decide. A rate is only as good as its denominator.",
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
      prompt: "The register shows online bookings were 20% of all bookings last year, and 30% this year. Is this slide fair?",
      artefact: { kind: "slide", title: "Online bookings", body: ["Online bookings rose by just 10%, so the new booking page made little difference."], number: 7 },
      choices: [
        { id: "a", label: "Yes: going from 20% to 30% is a rise of 10%.", verdict: "weaker", explanation: "It is a rise of 10 percentage points. Measured from where it started, that is half as much again: a 50% rise. The slide undersells it." },
        { id: "b", label: "No: 20% to 30% is half as much again, a 50% rise.", verdict: "correct", explanation: "Ten percentage points on a starting share of 20% is a 50% rise. Whether the page caused it is a separate question, which the register can't answer." },
        { id: "c", label: "It can't be judged without the total number of bookings.", verdict: "weaker", explanation: "Totals would add context, but the slide's mistake shows in the two shares alone." },
      ],
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
        "The council will fund clubs that show “evidence that training is getting safer”. Explain how the injury claim, as the AI wrote it, could mislead that decision, and what the council can fairly conclude.",
      rubric: {
        samples: [
          { id: "weak", text: "The claim is wrong, so the council shouldn't trust it.", met: [], note: "It doesn't say what is wrong with it, or what the council can conclude instead." },
          {
            id: "strong",
            text: "“Fell by half” is 4 injuries down to 2. With numbers that small, one or two injuries either way changes the percentage completely, and the log says nothing about training changed. The council can say injuries stayed low, not that training got safer.",
            met: ["base", "small", "decision"],
            note: "It gives the real counts, explains why the change says little, and states a fair conclusion.",
          },
        ],
        criteria: [
          { id: "base", text: "Gives the actual counts: 4 injuries, then 2." },
          { id: "small", text: "Explains why a change between such small numbers says little, or that nothing links it to a cause." },
          { id: "decision", text: "Says what the council can and can't conclude from it." },
        ],
        examples: [
          "“Halved” sounds like a big improvement, but it means 4 injuries became 2. A single bad week could undo that, and the club says it changed nothing. The council can see that injuries are rare, not that the club made training safer.",
          "The percentage hides how small the numbers are: two fewer injuries in a year. Nothing in the log explains the drop. If safety matters to the grant, the council should ask for several years of records, per player, before treating this as evidence.",
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
          id: "survive",
          label: "Testing whether a conclusion survives a change in the data",
          kind: "action",
          items: ["branches/survive"],
        },
        {
          id: "calculate",
          label: "Checking a calculation against the source",
          kind: "action",
          items: ["audit/rise/calc", "audit/typical/calc", "audit/cost/repair"],
        },
        {
          id: "cause",
          label: "Telling a cause apart from timing",
          kind: "reasoning",
          items: ["audit/caused/status", "matters"],
          practice: {
            prompt: "Library visits rose after a new café opened next door. What can you conclude?",
            choices: [
              { id: "a", label: "The café brought in new visitors to the library.", verdict: "weaker", explanation: "That is one possibility. The timing alone can't tell it apart from others, such as the season or a new course." },
              { id: "b", label: "It came after the café, which alone doesn't show a cause.", verdict: "correct", explanation: "Timing is a clue to investigate, such as by asking visitors, not proof of a cause." },
              { id: "c", label: "The café had nothing to do with the rise.", verdict: "weaker", explanation: "It might have helped. You don't know either way without further evidence." },
            ],
          },
        },
        {
          id: "spread",
          label: "Spotting an average pulled up by a few unusual cases",
          kind: "action",
          items: ["audit/typical/status", "audit/typical/repair"],
        },
        {
          id: "new-numbers",
          label: "Correcting numbers in a new case, without hints",
          kind: "transfer",
          items: ["transfer/girls/calc", "transfer/girls/repair", "transfer/injuries/status", "transfer/growth/action"],
        },
        { id: "effect", label: "Explaining how an error affects a decision", kind: "reasoning", items: ["effect"] },
      ],
      nextMissionId: "t01-transfer",
    },
  ],
};
