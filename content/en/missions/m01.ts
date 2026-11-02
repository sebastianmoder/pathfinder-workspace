import type { Mission } from "../../types";

/**
 * R0 PLACEHOLDER: short mission that exercises the shared shell.
 * R1 replaces the activity with the toy next-word machine and sorting task.
 * All cases are fictional.
 */
export const m01: Mission = {
  id: "m01-foundations",
  title: "Inside the Machine",
  outcome:
    "Explain why a fluent AI answer can still be wrong, and tell training apart from using a model.",
  scenario:
    "You are a researcher at the Riverside Learning Commons, a fictional community learning centre. A colleague pastes an AI answer into the team chat and says, “It sounds right, so let's use it.”",
  approxMinutes: 8,
  meta: { version: "0.1-draft", reviewedOn: null, sourcesToReview: [] },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Decide how much to trust a confident-sounding answer, then test your judgment on a new example.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A language model is trained on lots of text to predict likely continuations. When you use it, it produces text that fits the pattern of what it learned. Fitting a pattern is not the same as checking a fact.",
    },
    {
      kind: "initialJudgment",
      id: "initial",
      prompt: "An AI answer is fluent and confident. What does that tell you about whether it is correct?",
      choices: [
        { id: "a", label: "It is probably correct.", verdict: "weaker", explanation: "Fluency comes from matching language patterns. Wrong answers can be just as fluent." },
        { id: "b", label: "It tells me little; I need evidence.", verdict: "correct", explanation: "Confidence of tone is not evidence. Check the claim against a source." },
        { id: "c", label: "It is probably wrong.", verdict: "weaker", explanation: "Fluent answers are often right too. Suspicion without checking is not a method either." },
      ],
      hints: [{ text: "Think about what the model was trained to do: predict text, or verify facts?" }],
    },
    {
      kind: "quiz",
      id: "training-vs-use",
      prompt: "Which of these is the model being used rather than trained?",
      choices: [
        { id: "a", label: "Showing it millions of example sentences.", verdict: "weaker", explanation: "That is training: the model's parameters are adjusted from examples." },
        { id: "b", label: "Typing a question and reading its reply.", verdict: "correct", explanation: "Using a model means giving it an input and getting an output; it does not learn from that moment." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: "Now that you have seen the refresher, would you change your first answer?",
      choices: [
        { id: "keep", label: "Keep my answer", verdict: "defensible", explanation: "Fine if your reason is clear. Revision is not required." },
        { id: "change", label: "Change my answer", verdict: "defensible", explanation: "Fine if you can say what new reason changed your mind." },
      ],
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new example",
      prompt: "A model writes: “The Riverside Commons opened in 1987 and has 40 branches.” It reads smoothly. What is the best next step?",
      choices: [
        { id: "a", label: "Publish it; it reads well.", verdict: "weaker", explanation: "Smooth wording says nothing about the dates or numbers." },
        { id: "b", label: "Check the year and branch count against the Commons' records.", verdict: "correct", explanation: "Specific facts are checkable, so check them against a source." },
        { id: "c", label: "Ask the model if it is sure.", verdict: "weaker", explanation: "A model's reassurance is more generated text, not independent evidence." },
      ],
      hints: [{ text: "Which parts of the sentence could be looked up?" }],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Fluent is not the same as correct. Treat specific claims as things to check.",
      skills: ["Separated confidence of tone from evidence", "Chose a checkable next step"],
      nextMissionId: null,
    },
  ],
};
