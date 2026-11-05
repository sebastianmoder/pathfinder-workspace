import type { Choice, Mission } from "../../types";

/**
 * M06 — The Thinking Gym, mission 1 of 2: learning with help.
 * Arithmetic to re-check on review: €80 −25% = €60, +25% = €75; 10 km at 20 km/h + 10 km at 10 km/h = 20 km in 1.5 h ≈ 13.3 km/h;
 * €50 +20% = €60, −20% = €48; 30 km at 60 km/h + 30 km at 90 km/h = 60 km in 50 min = 72 km/h.
 */

const firstMove =
  "You're brushing up on averages and get stuck on the first problem. The AI tutor offers three buttons. You'll need to do problems like this on your own next week. Which do you press?";
const firstChoices: Choice[] = [
  {
    id: "a",
    label: "“Show me the answer”, then read each step until it makes sense.",
    verdict: "weaker",
    explanation: "Reading a finished solution feels like understanding, but you haven't produced any of it. It is the right help when you only need the answer, not when you need the skill.",
  },
  {
    id: "b",
    label: "“Give me a hint”, then try the next step myself.",
    verdict: "correct",
    explanation: "Help that leaves the working to you builds the skill you'll need without it. A worked example on different numbers does too.",
  },
  {
    id: "c",
    label: "None of them: keep trying alone until I get there.",
    verdict: "weaker",
    explanation: "Being stuck for a long time teaches little. Help that keeps you thinking is useful; the question is what kind.",
  },
];

export const m06Gym: Mission = {
  id: "m06-gym",
  title: "The Thinking Gym: learning with help",
  outcome: "Use AI help to learn a method, while keeping the ability to use it on your own.",
  scenario:
    "You volunteer at Homework Club at the Riverside Learning Commons, a community learning centre. Before helping learners with percentages and averages, you're brushing up yourself, with an AI tutor on hand.",
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
    { kind: "initialJudgment", id: "initial", prompt: firstMove, choices: firstChoices },
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
          numeric: {
            label: "What the jacket costs now",
            prefix: "€",
            min: 75,
            max: 75,
            explanation: "Each percentage is taken from the price at that moment: €80 − €20 = €60, then €60 + €15 = €75. Going down 25% and up 25% doesn't cancel out, because the two 25%s are of different amounts.",
          },
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
          numeric: {
            label: "Average speed for the whole trip",
            unit: "km/h",
            min: 13.2,
            max: 13.4,
            explanation: "Out takes 0.5 hours, back takes 1 hour. 20 km in 1.5 hours is about 13.3 km/h. Halfway between the speeds, 15 km/h, would only be right if you spent the same time at each.",
          },
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
      prompt:
        "A week on, you've solved three percentage problems, each with one hint. The tutor offers to switch hints off. You're not sure you're ready. What's the best way to find out?",
      choices: [
        { id: "a", label: "Try the next one with no hint, and ask only if stuck.", verdict: "correct", explanation: "You only find out what you can do by trying without the help. Asking when truly stuck is still fine: the aim is that the help fades, not that it disappears." },
        { id: "b", label: "Keep the hints on; they haven't done any harm so far.", verdict: "weaker", explanation: "Help that is always there can carry the thinking without you noticing. Three right answers with hints don't show what you can do without them." },
        { id: "c", label: "Ask the tutor whether you understand percentages now.", verdict: "weaker", explanation: "Its reply is generated text, not a test. Doing a problem unaided is the test." },
      ],
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "Without help",
      prompt: "Two problems like the ones you just did, with new numbers. There's no help this time: work them out and type the answers.",
      problems: [
        {
          id: "price",
          title: "A new price",
          text: "A concert ticket costs €50. The price rises by 20%, then the new price falls by 20%. What does it cost now?",
          numeric: {
            label: "What the ticket costs now",
            prefix: "€",
            min: 48,
            max: 48,
            explanation: "Up €10 to €60, then down 20% of €60, which is €12. The fall is the larger change, because it is taken from the higher price.",
          },
          helps: [],
        },
        {
          id: "speed",
          title: "A new trip",
          text: "A delivery van drives 30 km to a depot at 60 km/h, and drives back empty at 90 km/h. What is its average speed for the round trip?",
          numeric: {
            label: "Average speed for the round trip",
            unit: "km/h",
            min: 72,
            max: 72,
            explanation: "Out takes 30 minutes and back takes 20. 60 km in 50 minutes is 72 km/h, not the 75 km/h halfway between the speeds.",
          },
          helps: [],
        },
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
              { id: "b", label: "Ask why your answers are wrong, then try new ones.", verdict: "correct", explanation: "Feedback on your own mistakes, then practice without help, builds the skill the test checks." },
              { id: "c", label: "Re-read the chapter on that topic several times.", verdict: "weaker", explanation: "Re-reading feels productive but rarely shows you what you're getting wrong." },
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
          items: ["transfer/price/attempt", "transfer/speed/attempt"],
        },
      ],
      nextMissionId: "m06-teach",
    },
  ],
};
