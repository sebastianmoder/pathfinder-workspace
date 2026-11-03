import type { Choice, DialogueChoice, Mission, Source } from "../../types";

/**
 * M06 — The Thinking Gym, mission 2 of 2: teach it back.
 * Arithmetic to re-check on review: €40 −50% = €20, +50% = €30; €100 −10% = €90, +10% = €99.
 */

const teachQuestion = "Someone is stuck because they believe something that isn't true. What usually helps them most?";
const teachChoices: Choice[] = [
  { id: "a", label: "Telling them the correct answer clearly, so they don't stay confused.", verdict: "weaker", explanation: "They can write the answer down and still hold the same belief, so the next problem goes wrong the same way." },
  { id: "b", label: "Finding out what they think, then giving them a case that tests it.", verdict: "correct", explanation: "A belief that a person has tested and seen fail is one they can replace. You can only choose the right test once you know what they believe." },
  { id: "c", label: "Explaining the correct idea in full before they try again.", verdict: "weaker", explanation: "An explanation that doesn't touch what they already believe often slides past it. It helps more after you've found the belief." },
];

const sources: Source[] = [
  {
    id: "sheet",
    title: "Leo's homework sheet",
    description: "Leo's percentages homework, marked by his teacher.",
    date: "This week",
    passages: [
      { id: "leo-q1", text: "Q1. A €40 bag is reduced by 50%. Then the sale price goes up by 50%. What does it cost now? Leo: €40. (Written in the margin: “app says they cancel”.)" },
      { id: "leo-q2", text: "Q2. A €100 coat is reduced by 10%, then increased by 10%. What does it cost now? Leo: €100." },
      { id: "leo-q3", text: "Q3. What is 10% of €90? Leo: €9. (Ticked.)" },
      { id: "leo-note", text: "Teacher's note: Q1 and Q2 are wrong. Show your working next time." },
    ],
  },
];

const diagnose = (right: boolean) => ({ item: "diagnose", right });
const handback = (right: boolean) => ({ item: "handback", right });
const move = (id: string, strategy: DialogueChoice["strategy"], label: string, note: string, next: string, scored?: DialogueChoice["scored"]): DialogueChoice =>
  ({ id, strategy, label, note, next, ...(scored ? { scored } : {}) });

export const m06Teach: Mission = {
  id: "m06-teach",
  title: "The Thinking Gym: teach it back",
  outcome: "Help someone replace a misconception by finding out what they think, testing it, and handing the thinking back to them.",
  scenario:
    "You volunteer at Homework Club at the Riverside Learning Commons, a fictional community learning centre. Leo, who is 14, has been using an AI app for his percentages homework, and two answers have come back marked wrong.",
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
      body: "Help Leo with the homework he got wrong. Your goal is not the right answers on his sheet; it is Leo being able to do the next one himself.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A percentage is always a percentage of something. When a price falls by 50% and then rises by 50%, the rise is 50% of the lower price, so it doesn't get back to where it started. Explaining an idea to someone else is a strong test of whether you understand it yourself.",
    },
    { kind: "initialJudgment", id: "initial", prompt: teachQuestion, choices: teachChoices },
    {
      kind: "dialogue",
      id: "teach",
      title: "Help Leo",
      intro: "Choose how to respond to Leo. You can also show him something from his own homework sheet.",
      initialStepId: "initial",
      sources,
      reflectionPrompt: "What do you think Leo believes, and why?",
      continueLabel: "Continue",
      dialogue: {
        characters: [
          { id: "leo", name: "Leo", role: "Homework Club learner, 14", knows: "How to find a percentage of an amount. Not why two of his answers were marked wrong.", wants: "To finish his homework, ideally by being told the answers." },
        ],
        start: "start",
        starts: { a: "start", b: "start", c: "start" },
        discoveries: [
          { id: "cancel", label: "Leo believes that a fall and a rise of the same percentage cancel out.", lookIn: "Leo's homework sheet" },
          { id: "copied", label: "Leo copied the app's answers without doing any working.", lookIn: "Leo's homework sheet" },
          { id: "can-do", label: "Leo can already work out a percentage of an amount.", lookIn: "Leo's homework sheet" },
        ],
        nodes: [
          {
            id: "start",
            speakerId: "leo",
            text: "Miss marked Q1 and Q2 wrong, but the app said €40! Fifty off, fifty on. Can you just tell me the right answer so I can fix it?",
            choices: [
              move("ask", "question", "Before the answer: how did you get €40?", "You asked about his thinking before saying anything about the answer.", "cancel", diagnose(true)),
              move("explain", "explain", "A percentage is always of something. The second 50% is of a smaller amount.", "You explained straight away, before finding out what he believes.", "explain-first", diagnose(false)),
              move("tell", "tell", "It's €30. Write that down.", "You gave the answer. His sheet will be right; his idea hasn't changed.", "told", diagnose(false)),
            ],
            cite: {
              responses: [
                { passageIds: ["leo-q1"], note: "You pointed at his own margin note. It shows where the answer came from.", next: "copied", scored: diagnose(true) },
                { passageIds: ["leo-q3"], note: "You started from something he can already do.", next: "can-do", scored: diagnose(true) },
              ],
              otherwise: { note: "That part of the sheet doesn't tell you what he's thinking yet, so you moved to explaining.", next: "explain-first", scored: diagnose(false) },
            },
          },
          {
            id: "cancel",
            speakerId: "leo",
            text: "Fifty percent down, fifty percent up. Same number, so it goes back to the start. That's what the app said too.",
            reveals: ["cancel"],
            choices: [
              move("test", "example", "Let's test that. What's 50% of €40?", "You offered a case he can work out, so he can test his own rule.", "can-do"),
              move("explain2", "explain", "The second 50% is of the sale price, not of €40.", "You explained the correct idea. It's true, but he hasn't seen his rule fail yet.", "explain-first"),
            ],
            cite: {
              responses: [{ passageIds: ["leo-q1"], note: "You showed him the margin note. Now you both know the rule came from the app.", next: "copied" }],
              otherwise: { note: "That passage doesn't bear on the rule he just stated, so the conversation drifted into explaining.", next: "explain-first" },
            },
          },
          {
            id: "copied",
            speakerId: "leo",
            text: "Yeah, I asked the app and wrote it down. It's quicker. So is the app wrong, then?",
            reveals: ["copied"],
            choices: [
              move("find-out", "example", "Let's find out together. What's 50% of €40?", "Rather than ruling on the app, you gave him a way to check it.", "can-do"),
              move("tell2", "tell", "Yes, it's wrong. The answer is €30.", "You settled it for him. Next time he still has only the app's word or yours.", "told"),
            ],
          },
          {
            id: "explain-first",
            speakerId: "leo",
            text: "Of something… but it's the same fifty percent both times. I don't get it.",
            choices: [
              move("test2", "example", "OK, let's try it with the numbers. What's 50% of €40?", "You switched to a case he can work out himself.", "can-do"),
              move("tell3", "tell", "Just trust me, it's €30.", "He has the answer, and the same belief he started with.", "told"),
            ],
          },
          {
            id: "told",
            speakerId: "leo",
            text: "€30. OK. So Q2 is €100, right? Ten off, ten on?",
            choices: [
              move("back", "example", "Let's go back to Q1 and work it out. What's 50% of €40?", "He applied the same rule to Q2, so you went back to test it.", "can-do"),
              move("tell4", "tell", "No, it's €99. Moving on.", "Both answers are now right on his sheet, and he still believes they cancel.", "end-told", handback(false)),
            ],
          },
          {
            id: "can-do",
            speakerId: "leo",
            text: "That's easy, €20. So the bag is €20 in the sale.",
            reveals: ["can-do"],
            choices: [
              move("next", "question", "And now it goes up by 50%. 50% of what?", "You asked the question that makes his rule fail, and let him find it.", "aha"),
              move("explain4", "explain", "Right. Now add 50% of €20, not of €40.", "You did the key step for him. It's correct, but he didn't have to see it.", "aha-told"),
            ],
          },
          {
            id: "aha",
            speakerId: "leo",
            text: "Of… the €20? That's €10, so it's €30! It doesn't go back, because the second fifty percent is of less money.",
            choices: [
              move("own", "question", "Exactly. Now try Q2 on your own and tell me how you did it.", "You handed the next problem back to him, which is the real test.", "end-own", handback(true)),
              move("do-q2", "tell", "Exactly. Q2 works the same way: it's €99.", "You did Q2 for him, so neither of you knows whether he could.", "end-done", handback(false)),
            ],
          },
          {
            id: "aha-told",
            speakerId: "leo",
            text: "So €20 plus €10… €30. OK, I think I see.",
            choices: [
              move("own2", "question", "Try Q2 on your own and tell me how you did it.", "You handed the next problem back to him, which is the real test.", "end-own", handback(true)),
              move("do-q2b", "tell", "Good. Q2 is €99, same idea.", "You did Q2 for him, so neither of you knows whether he could.", "end-done", handback(false)),
            ],
          },
          {
            id: "end-own",
            speakerId: "leo",
            text: "€100 down 10% is €90. 10% of €90 is €9, so it's €99! It ends up less than it started, because the second change is of a smaller number. I'm going to tell the app it's wrong.",
            choices: [],
          },
          {
            id: "end-done",
            speakerId: "leo",
            text: "€99. OK, I'll write that down. I'm still not sure I could do one on my own, though.",
            choices: [],
          },
          {
            id: "end-told",
            speakerId: "leo",
            text: "€99? Fine, I'll write it down. Thanks!",
            choices: [],
          },
        ],
      },
    },
    {
      kind: "quiz",
      id: "use-app",
      prompt: "Leo will keep using the AI app for homework. What would help him learn from it, rather than copy from it?",
      choices: [
        { id: "a", label: "Ask it to check his working, not to give the answer.", verdict: "correct", explanation: "Feedback on his own attempt keeps the thinking his, and it would have shown him where his rule broke." },
        { id: "b", label: "Stop using the app, since it gave him a wrong answer.", verdict: "weaker", explanation: "It may well be right more often than not. The problem was using its answer instead of his own working." },
        { id: "c", label: "Ask it the same question again and compare its answers.", verdict: "weaker", explanation: "Two generated answers that agree aren't a check, and comparing them still teaches him no method." },
      ],
      hints: [{ text: "What did Leo do that let a wrong idea through without anyone noticing?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `Having helped Leo, answer the first question again. ${teachQuestion}`,
      choices: teachChoices,
      withConfidence: true,
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new learner",
      prompt: "Ama, another learner, says 0.5 is smaller than 0.25, “because 5 is smaller than 25”. What is the most useful first move?",
      choices: [
        { id: "a", label: "Tell her 0.5 is bigger, and move on to the next question.", verdict: "weaker", explanation: "She'll have the right answer here and the same rule for the next decimal." },
        { id: "b", label: "Ask which is bigger, half a pizza or a quarter.", verdict: "correct", explanation: "A case she already knows tests her rule, and she gets to see it fail for herself." },
        { id: "c", label: "Explain decimal place value from the very beginning.", verdict: "weaker", explanation: "It's accurate, but it starts without touching the rule she's actually using." },
      ],
    },
    {
      kind: "openResponse",
      id: "teach-it",
      prompt: "In a few sentences, explain to Leo why a 50% fall followed by a 50% rise doesn't bring a price back to where it started.",
      rubric: {
        samples: [
          { id: "weak", text: "Because percentages don't work like that.", met: [], note: "It says that the rule fails, but not why, and it gives Leo nothing to check." },
          {
            id: "strong",
            text: "Each percentage is of the price at that moment. Half of €40 is €20, so the sale price is €20. Then the rise is half of €20, which is only €10, so you get to €30, not €40.",
            met: ["of", "numbers", "plain"],
            note: "It names the reason, shows it with numbers he can check, and stays in plain words.",
          },
        ],
        criteria: [
          { id: "of", text: "Says each percentage is of a different amount." },
          { id: "numbers", text: "Shows it with numbers a learner can check." },
          { id: "plain", text: "Uses plain words a 14-year-old could follow." },
        ],
        examples: [
          "The fall takes 50% of €40, which is €20. The rise takes 50% of the new price, €20, which is only €10. So the price goes down by more than it comes back up.",
          "Fifty percent is a share, and a share of a smaller amount is smaller. After the sale, the price is €20, and half of that is €10, so it only climbs back to €30.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "To help someone learn, find out what they think, give them a case that tests it, and hand the next step back to them, whether or not AI is involved.",
      skills: [
        { id: "diagnose", label: "Finding out what someone thinks before explaining", kind: "action", items: ["teach/diagnose"] },
        { id: "handback", label: "Handing the next step back to the learner", kind: "action", items: ["teach/handback"] },
        { id: "uncover", label: "Uncovering where a misunderstanding came from", kind: "action", items: ["teach/cancel", "teach/copied"] },
        {
          id: "learn-with-ai",
          label: "Using AI to learn rather than to copy",
          kind: "knowledge",
          items: ["use-app", "revision"],
          practice: {
            prompt: "You're learning a new spreadsheet formula with an AI assistant. Which request builds your skill most?",
            choices: [
              { id: "a", label: "“Write the formula for me so I can paste it in.”", verdict: "weaker", explanation: "That finishes the task and leaves you no better able to write the next one." },
              { id: "b", label: "“Here's my formula. Why doesn't it work?”", verdict: "correct", explanation: "Feedback on your own attempt shows you what to fix and keeps the thinking yours." },
              { id: "c", label: "“Explain every spreadsheet formula to me in detail.”", verdict: "weaker", explanation: "Broad explanations are easy to read and hard to use. Start from your actual attempt." },
            ],
          },
        },
        { id: "new-learner", label: "Choosing a first move with a new misconception", kind: "transfer", items: ["transfer"] },
        { id: "explain", label: "Explaining a concept clearly in your own words", kind: "reasoning", items: ["teach-it"] },
      ],
      nextMissionId: "m07-numbers",
    },
  ],
};
