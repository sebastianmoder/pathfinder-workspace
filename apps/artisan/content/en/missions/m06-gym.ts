import type { Choice, Mission } from "../../types";

/**
 * M06 — The Thinking Gym, mission 1 of 2: learning with help.
 * Arithmetic to re-check on review: €80 −25% = €60, +25% = €75; 10 km at 20 km/h + 10 km at 10 km/h = 20 km in 1.5 h ≈ 13.3 km/h;
 * €50 +20% = €60, −20% = €48; 30 km at 60 km/h + 30 km at 90 km/h = 60 km in 50 min = 72 km/h.
 */

const helpQuestion = "You're learning something new and get stuck on a problem. Which kind of AI help is most likely to leave you able to solve the next one on your own?";
const helpChoices: Choice[] = [
  {
    id: "a",
    label: "The full answer with every step, so you can see exactly how it's done.",
    verdict: "weaker",
    explanation: "Reading a finished solution feels like understanding, but you haven't produced any of it. It is the right help when you only need the answer, not when you need the skill.",
  },
  {
    id: "b",
    label: "A hint, or feedback on your own working, so you do the thinking.",
    verdict: "correct",
    explanation: "Help that leaves the working to you builds the skill you'll need without it. A worked example on different numbers does too.",
  },
  {
    id: "c",
    label: "No help at all, since any AI help stops you from really learning.",
    verdict: "weaker",
    explanation: "Being stuck for a long time teaches little. Help that keeps you thinking is useful; the question is what kind.",
  },
];

export const m06Gym: Mission = {
  id: "m06-gym",
  title: "The Thinking Gym: learning with help",
  outcome: "Use AI help to learn a method, while keeping the ability to use it on your own.",
  scenario:
    "You volunteer at Homework Club at the Riverside Learning Commons, a fictional community learning centre. Before helping learners with percentages and averages, you're brushing up yourself, with an AI tutor on hand.",
  approxMinutes: 10,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["Arithmetic is listed at the top of this file."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Try two problems. When you get stuck, choose the kind of help you want, and notice what each kind does. Later, you'll solve related problems with no help at all.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A percentage is always a percentage of something: 25% of €80 is €20. An average speed is the total distance divided by the total time. AI tutors can give hints, examples, feedback or answers; what you learn depends on which you ask for.",
    },
    { kind: "initialJudgment", id: "initial", prompt: helpQuestion, choices: helpChoices },
    {
      kind: "gym",
      id: "gym",
      title: "Two problems",
      intro: "Answer first. If you're not right, choose some help and try again. Using help is fine; what matters is what it leaves you able to do.",
      problems: [
        {
          id: "sale",
          title: "The sale price",
          text: "A jacket costs €80. In the sale, it is reduced by 25%. A week later, the sale price goes up by 25%. What does the jacket cost now?",
          choices: [
            { id: "a", label: "€80, because going down 25% and up 25% cancel out.", verdict: "weaker", explanation: "The two 25%s are of different amounts: 25% of €80 is €20, but 25% of €60 is only €15." },
            { id: "b", label: "€75: down €20 to €60, then up €15.", verdict: "correct", explanation: "Each percentage is taken from the price at that moment: €80 − €20 = €60, then €60 + €15 = €75." },
            { id: "c", label: "€70, because the price was cut and then cut again.", verdict: "weaker", explanation: "The second change was a rise. It added 25% of €60, which is €15." },
          ],
          helps: [
            { id: "hint", label: "Get a hint", provides: "A nudge towards the next step. You still do all the working.", content: "Each 25% is a percentage of something. Of what, the second time?" },
            { id: "example", label: "See a worked example", provides: "The method, shown on different numbers. You apply it to yours.", content: "A €40 bag is reduced by 50%, to €20. Then the €20 price goes up by 50%: 50% of €20 is €10, so it costs €30. Each percentage is worked out from the price at that moment." },
            { id: "check", label: "Ask the AI to check my working", provides: "Feedback on where your reasoning went wrong. You fix it yourself.", content: "Look at the second step. Which amount did you take 25% of? If you took both from €80, that is the step to redo." },
            { id: "answer", label: "Ask the AI for the answer", provides: "The answer with its steps. It finishes the problem, but it does the thinking for you.", content: "€75. 25% of €80 is €20, so the sale price is €60. 25% of €60 is €15, so the new price is €75.", givesAnswer: true },
          ],
        },
        {
          id: "trip",
          title: "The round trip",
          text: "You cycle 10 km to the Commons at 20 km/h, then the same 10 km home, uphill, at 10 km/h. What is your average speed for the whole trip?",
          choices: [
            { id: "a", label: "15 km/h, halfway between the two speeds.", verdict: "weaker", explanation: "That would be right only if you spent equal time at each speed. You spent 30 minutes going and an hour coming back." },
            { id: "b", label: "10 km/h, since the slow part sets the pace.", verdict: "weaker", explanation: "The faster half counts too. You covered 20 km in an hour and a half." },
            { id: "c", label: "About 13.3 km/h: 20 km in 1.5 hours.", verdict: "correct", explanation: "Out takes 0.5 hours, back takes 1 hour. 20 km in 1.5 hours is about 13.3 km/h." },
          ],
          helps: [
            { id: "hint", label: "Get a hint", provides: "A nudge towards the next step. You still do all the working.", content: "Average speed is total distance divided by total time. What is the total time?" },
            { id: "example", label: "See a worked example", provides: "The method, shown on different numbers. You apply it to yours.", content: "A 60 km drive out at 60 km/h takes 1 hour. The drive back at 30 km/h takes 2 hours. That is 120 km in 3 hours: 40 km/h, not 45." },
            { id: "check", label: "Ask the AI to check my working", provides: "Feedback on where your reasoning went wrong. You fix it yourself.", content: "If you averaged the two speeds, check: did you spend the same time at each? Work out each time first." },
            { id: "answer", label: "Ask the AI for the answer", provides: "The answer with its steps. It finishes the problem, but it does the thinking for you.", content: "About 13.3 km/h. Out: 10 km at 20 km/h takes 0.5 hours. Back: 10 km at 10 km/h takes 1 hour. 20 km in 1.5 hours is about 13.3 km/h.", givesAnswer: true },
          ],
        },
      ],
    },
    {
      kind: "sort",
      id: "help-fit",
      prompt: "The right help depends on what you're trying to do. Choose the help that fits each situation.",
      chooseLabel: "Choose the help",
      hints: [{ text: "First ask: do I need to be able to do this myself later, or do I only need the result?" }],
      categories: [
        { id: "hint", label: "A hint" },
        { id: "example", label: "A worked example" },
        { id: "check", label: "Feedback on my working" },
        { id: "answer", label: "The answer" },
      ],
      items: [
        { id: "rate", label: "You need today's exchange rate for an invoice due in five minutes, and you'll never need to work it out yourself.", categoryId: "answer", explanation: "Learning isn't the goal here, so an answer is the right help, checked against a reliable source." },
        { id: "essay", label: "Your essay's argument has a gap somewhere, but you can't see where.", categoryId: "check", explanation: "Feedback on your own work points at the problem and leaves the fixing to you." },
        { id: "new-type", label: "You've never seen this kind of problem before and don't know where to start.", categoryId: "example", explanation: "With no method yet, a hint has nothing to nudge. An example on different numbers shows the method." },
        { id: "one-step", label: "You know the method, but you're stuck on one step.", categoryId: "hint", explanation: "A nudge at the step you're stuck on keeps the rest of the thinking yours." },
      ],
    },
    {
      kind: "quiz",
      id: "learned",
      prompt: "You used a worked example to solve a problem. How can you tell whether you've learned the method?",
      choices: [
        { id: "a", label: "Re-read the worked example until it makes complete sense.", verdict: "weaker", explanation: "Re-reading makes it feel familiar, and familiarity is easy to mistake for being able to do it." },
        { id: "b", label: "Solve a similar problem later, without the example.", verdict: "correct", explanation: "Doing it unaided, after a gap, is the test of whether the method is yours." },
        { id: "c", label: "Ask the AI whether you understood it.", verdict: "weaker", explanation: "Its reassurance is generated text, not a test of what you can do." },
      ],
      hints: [{ text: "What would you need to be able to do without the example in front of you?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `Having used the gym, answer the first question again. ${helpQuestion}`,
      choices: helpChoices,
      withConfidence: true,
    },
    {
      kind: "transfer",
      id: "transfer-price",
      title: "Without help: a new price",
      prompt: "A concert ticket costs €50. The price rises by 20%, then the new price falls by 20%. What does it cost now?",
      choices: [
        { id: "a", label: "€50, because the rise and the fall cancel out.", verdict: "weaker", explanation: "The 20% fall is of €60, not €50, so it removes €12, more than the €10 that was added." },
        { id: "b", label: "€48: up €10 to €60, then down €12.", verdict: "correct", explanation: "Each change is a percentage of the price at that moment." },
        { id: "c", label: "€52, because the rise was applied first.", verdict: "weaker", explanation: "The order doesn't help here: the fall is the larger change, because it is taken from the higher price." },
      ],
    },
    {
      kind: "transfer",
      id: "transfer-speed",
      title: "Without help: a new trip",
      prompt: "A delivery van drives 30 km to a depot at 60 km/h, and drives back empty at 90 km/h. What is its average speed for the round trip?",
      choices: [
        { id: "a", label: "75 km/h, halfway between the two speeds.", verdict: "weaker", explanation: "The van spends longer at the slower speed: 30 minutes out and 20 minutes back." },
        { id: "b", label: "72 km/h: 60 km in 50 minutes.", verdict: "correct", explanation: "Out takes 30 minutes, back takes 20. 60 km in 50 minutes is 72 km/h." },
        { id: "c", label: "90 km/h, the speed of the faster leg.", verdict: "weaker", explanation: "Both legs count, and the slower one takes longer." },
      ],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Choose help by what it leaves you able to do. When you need the skill, ask for a hint, an example or feedback, and then test yourself without it.",
      skills: [
        {
          id: "use-help",
          label: "Using help to reach a solution yourself",
          kind: "action",
          items: ["gym/sale", "gym/trip"],
        },
        {
          id: "help-fit",
          label: "Matching the kind of help to your goal",
          kind: "knowledge",
          items: ["help-fit/rate", "help-fit/essay", "help-fit/new-type", "help-fit/one-step"],
          practice: {
            prompt: "You're preparing for a driving theory test next week and keep getting one type of question wrong. What help fits best?",
            choices: [
              { id: "a", label: "Ask the AI for the answers to those questions.", verdict: "weaker", explanation: "You'll face different questions in the test. Answers to these won't give you the method." },
              { id: "b", label: "Ask it to explain why your answers are wrong, then try new ones of that type.", verdict: "correct", explanation: "Feedback on your own mistakes, then practice without help, builds the skill the test checks." },
              { id: "c", label: "Re-read the chapter about that topic several times.", verdict: "weaker", explanation: "Re-reading feels productive but rarely shows you what you're getting wrong." },
            ],
          },
        },
        {
          id: "check-learning",
          label: "Testing whether you've really learned something",
          kind: "knowledge",
          items: ["learned", "revision"],
        },
        {
          id: "unaided",
          label: "Solving related problems later, without help",
          kind: "transfer",
          items: ["transfer-price", "transfer-speed"],
        },
      ],
      nextMissionId: "m06-teach",
    },
  ],
};
