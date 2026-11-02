import type { Mission } from "../../types";

const rep = (n: number, s: string) => Array<string>(n).fill(s);

/**
 * M01 — Inside the Machine. DRAFT content for review (reviewedOn: null).
 * All cases are fictional. The toy model is a labelled simplification.
 */
export const m01: Mission = {
  id: "m01-foundations",
  title: "Inside the Machine",
  outcome:
    "Explain why a fluent AI answer can still be wrong, tell training from using a model, and name common AI functions.",
  scenario:
    "You are a researcher at the Riverside Learning Commons, a fictional community learning centre. A colleague pastes an AI answer into the team chat and says, “It sounds right, so let's use it.”",
  approxMinutes: 9,
  meta: {
    version: "0.2-draft",
    reviewedOn: null,
    sourcesToReview: ["Toy model description matches how counting-based predictors work (simplification is labelled in the UI)."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Run a miniature prediction machine, see what changes its answer, and decide how much a confident-sounding answer should be trusted.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A language model is built by showing it lots of example text (training) so it learns which words tend to follow which. Later, when someone gives it a question (using it), it produces text that fits those patterns. Fitting a pattern is not the same as checking a fact.",
    },
    {
      kind: "initialJudgment",
      id: "initial",
      prompt: "An AI answer is fluent and confident. What does that tell you about whether it is correct?",
      choices: [
        { id: "a", label: "It is probably correct.", verdict: "weaker", explanation: "Fluency comes from matching language patterns. Wrong answers can be just as fluent." },
        { id: "b", label: "It tells me little; I need evidence.", verdict: "correct", explanation: "Confidence of tone is not evidence. Check the claim against a source." },
        { id: "c", label: "It is probably wrong.", verdict: "weaker", explanation: "Fluent answers are often right too. Blanket suspicion is not a method; checking is." },
      ],
      hints: [{ text: "Think about what the model was built to do: produce likely text, or verify facts?" }],
    },
    {
      kind: "flow",
      id: "data-to-output",
      title: "From data to output",
      stages: [
        { title: "Training data", text: "Many example texts are collected. Whatever is in them, good or bad, is what the model can learn from." },
        { title: "Training", text: "The model is adjusted until it gets good at predicting which words come next in those examples. This happens before you ever use it." },
        { title: "The trained model", text: "The result is a fixed set of learned patterns. It does not look anything up unless a tool is added to do so." },
        { title: "Your input", text: "You type a question or instruction. This is using the model, not training it." },
        { title: "Output", text: "The model produces the continuation that best fits its patterns. It may be right, wrong or incomplete, and it reads fluently either way." },
      ],
    },
    {
      kind: "toyModel",
      id: "toy",
      title: "Operate the prediction machine",
      promptText: "the riverside library opens at",
      intendedMeaning: "In this case, the Riverside library really opens at nine.",
      minRuns: 2,
      takeaway:
        "The machine never checked when the library opens. It continued the pattern in whatever it was shown, so different training data gave different, equally confident answers.",
      corpora: [
        {
          id: "library",
          label: "Library notices",
          description: "Sentences from library opening-time notices.",
          sentences: [...rep(4, "the library opens at nine"), "the library opens at ten", "the library closes at five"],
        },
        {
          id: "shops",
          label: "Shop and café notices",
          description: "Sentences from shops, cafés and banks.",
          sentences: [
            ...rep(3, "the shop opens at eight"),
            "the cafe opens at seven",
            "the bank opens at ten",
            "the market opens at eight",
          ],
        },
        {
          id: "night",
          label: "Night-time notices",
          description: "Sentences from clubs and late-night venues.",
          sentences: [...rep(3, "the club opens at midnight"), "the cinema opens at eight"],
        },
        {
          id: "closing",
          label: "Closing-time notices only",
          description: "Sentences that only mention closing times.",
          sentences: ["the library closes at five", "the shop closes at six", "the cafe closes at six"],
        },
      ],
    },
    {
      kind: "quiz",
      id: "why-different",
      prompt: "The machine gave different answers for the same question. What best explains that?",
      choices: [
        { id: "a", label: "It looked up the real opening time and sometimes made mistakes copying it.", verdict: "weaker", explanation: "This toy machine has no lookup at all. It only counts which words followed which in its training sentences." },
        { id: "b", label: "Its answer depends on the patterns in what it was shown, not on what is true.", verdict: "correct", explanation: "Change the examples and the pattern changes. Truth never entered the process." },
        { id: "c", label: "It was in a different mood each time.", verdict: "weaker", explanation: "The machine is deterministic: the same training data always gives the same result." },
      ],
      hints: [{ text: "Compare the Library notices result with the Shop and café result." }],
    },
    {
      kind: "quiz",
      id: "training-vs-use",
      prompt: "Which of these is the model being used rather than trained?",
      choices: [
        { id: "a", label: "Showing it millions of example sentences.", verdict: "weaker", explanation: "That is training: the model is adjusted from examples." },
        { id: "b", label: "Typing a question and reading its reply.", verdict: "correct", explanation: "Using a model means giving it an input and getting an output. It does not learn from that exchange." },
      ],
    },
    {
      kind: "sort",
      id: "functions",
      prompt: "Sort these everyday products by the main AI function they use.",
      categories: [
        { id: "recognise", label: "Recognise (images, speech)" },
        { id: "generate", label: "Generate (text, images)" },
        { id: "recommend", label: "Recommend" },
        { id: "predict", label: "Predict / forecast" },
      ],
      items: [
        { id: "face", label: "A phone unlocks when it sees your face", categoryId: "recognise", explanation: "It recognises a pattern in an image." },
        { id: "email", label: "A chatbot drafts an email for you", categoryId: "generate", explanation: "It produces new text." },
        { id: "show", label: "A streaming service suggests your next show", categoryId: "recommend", explanation: "It ranks options it expects you to like." },
        { id: "speech", label: "A voice assistant turns speech into text", categoryId: "recognise", explanation: "It recognises words in audio." },
        { id: "rain", label: "A weather app estimates rain tomorrow", categoryId: "predict", explanation: "It forecasts a future quantity from past data." },
        { id: "poster", label: "An image tool makes a poster from a description", categoryId: "generate", explanation: "It produces a new image." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: "Having run the machine, would you answer the first question differently?",
      choices: [
        { id: "keep", label: "Keep my answer. My reason is the same.", verdict: "defensible", explanation: "Fine if you can say why. Revision is not required." },
        { id: "change", label: "Change my answer. The machine showed me something new.", verdict: "defensible", explanation: "Fine if you can say what changed your mind: fluent output is not evidence by itself." },
      ],
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new example",
      prompt:
        "A model writes: “The Riverside Commons opened in 1987 and has 40 branches.” It reads smoothly and you have no records handy. What is the best next step?",
      choices: [
        { id: "a", label: "Publish it; it reads well.", verdict: "weaker", explanation: "Smooth wording says nothing about the year or the number." },
        { id: "b", label: "Treat the year and branch count as unchecked until compared with the Commons' own records.", verdict: "correct", explanation: "Specific facts are checkable. The model only continued a likely pattern." },
        { id: "c", label: "Ask the model whether it is sure.", verdict: "weaker", explanation: "Its reassurance is more generated text, not independent evidence." },
      ],
      hints: [{ text: "Which parts of the sentence could be looked up?" }],
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Fluent is not the same as correct. Treat specific claims as things to check against a source.",
      skills: [
        "Separated confidence of tone from evidence",
        "Explained how training data shapes output",
        "Told training apart from using a model",
        "Chose a checkable next step in a new example",
      ],
      nextMissionId: null,
    },
  ],
};
