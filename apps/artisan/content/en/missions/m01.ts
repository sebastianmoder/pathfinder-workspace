import type { Choice, Mission } from "../../types";

const fluencyQuestion = "An AI answer is fluent and confident. What does that tell you about whether it is correct?";
const fluencyChoices: Choice[] = [
  { id: "a", label: "It is probably correct.", verdict: "weaker", explanation: "Fluency comes from matching language patterns. Nothing in that process makes a system sound less sure when it is wrong, so wrong answers can be just as fluent." },
  { id: "b", label: "It tells me little; I need evidence.", verdict: "correct", explanation: "Confidence of tone is not evidence. Check the claim against a source." },
  { id: "c", label: "It is probably wrong, because a confident AI answer is usually made up.", verdict: "weaker", explanation: "Fluent answers are often right too. Blanket suspicion is not a method; checking is." },
];

const stages = [
  { id: "data", label: "Training data", help: "The example texts collected for training. Whatever is in them, good or bad, is what the model can learn from." },
  { id: "training", label: "Training", help: "The model is adjusted until it predicts the next words in those examples well. This happens before anyone uses it." },
  { id: "model", label: "Trained model", help: "The fixed patterns that result. They stay the same while you use the model." },
  { id: "input", label: "Your input", help: "What you type. This is using the model, not training it." },
  { id: "output", label: "Output", help: "The continuation that best fits the patterns. It reads fluently whether it is right or wrong." },
];

const LIBRARY = ["lib-1", "lib-2", "lib-3", "lib-4", "lib-5"];

/**
 * M01 — Inside the Machine.
 * All cases are fictional. The toy model is a labelled simplification.
 * Counts to re-check on review (`content/missions.test.ts` runs them): the library notices give nine 4, ten 1;
 * adding the January notice gives nine 4, ten 2.
 */
export const m01: Mission = {
  id: "m01-foundations",
  title: "Inside the Machine",
  outcome:
    "Explain why a fluent AI answer can still be wrong, tell training from using a model, and name common AI functions.",
  scenario:
    "You are a researcher at the Riverside Learning Commons, a fictional community learning centre. A colleague pastes an AI answer into the team chat and says, “It sounds right, so let's use it.”",
  approxMinutes: 12,
  meta: {
    version: "1.2",
    reviewedOn: "2026-11-02",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["Toy model description matches how counting-based predictors work (simplification is labelled in the UI).", "Whether services reuse conversations for training, or add memory features, changes over time; keep the training-vs-use explanation general.", "Case dates are set around autumn 2026; refresh them if they start to look stale."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Run a miniature prediction machine, change what it learns from, and decide how much a confident-sounding answer should be trusted.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A language model is built by showing it lots of example text, which is called training. Later, when someone gives it a question, that is called using it, and it produces text based on what it learned.",
    },
    {
      kind: "initialJudgment",
      id: "initial",
      prompt: fluencyQuestion,
      choices: fluencyChoices,
    },
    {
      kind: "sandbox",
      id: "machine",
      title: "Operate the prediction machine",
      intro: "This machine learns only from the sentences you switch on. Work through the tasks, and say what you expect before each answer.",
      promptText: "the riverside library opens at",
      replyTemplate: "The Riverside library opens at {word}.",
      words: ["nine", "ten", "eight", "seven", "midnight", "five", "six"],
      stages: [
        { id: "data", title: "Training data", text: "The sentences you switch on." },
        { id: "training", title: "Training", text: "The machine counts which words follow which." },
        { id: "model", title: "Trained model", text: "Those counts, now fixed." },
        { id: "input", title: "Your input", text: "What you ask it to continue." },
        { id: "output", title: "Output", text: "The word it counted most, stated firmly." },
      ],
      groups: [
        { id: "library", label: "Library notices" },
        { id: "shops", label: "Shop and café notices" },
        { id: "night", label: "Night-time notices" },
        { id: "closing", label: "Closing-time notices" },
        { id: "news", label: "New notice" },
      ],
      sentences: [
        { id: "lib-1", group: "library", text: "the library opens at nine" },
        { id: "lib-2", group: "library", text: "the town library opens at nine" },
        { id: "lib-3", group: "library", text: "our library opens at nine" },
        { id: "lib-4", group: "library", text: "the main library opens at nine" },
        { id: "lib-5", group: "library", text: "the school library opens at ten" },
        { id: "shop-1", group: "shops", text: "the shop opens at eight" },
        { id: "shop-2", group: "shops", text: "the market opens at eight" },
        { id: "shop-3", group: "shops", text: "the cafe opens at seven" },
        { id: "shop-4", group: "shops", text: "the bank opens at ten" },
        { id: "night-1", group: "night", text: "the club opens at midnight" },
        { id: "night-2", group: "night", text: "the bar opens at midnight" },
        { id: "night-3", group: "night", text: "the cinema opens at eight" },
        { id: "close-1", group: "closing", text: "the library closes at five" },
        { id: "close-2", group: "closing", text: "the shop closes at six" },
        { id: "new", group: "news", text: "from january the library opens at ten" },
      ],
      tasks: [
        {
          id: "first-run",
          title: "Train it and ask",
          instruction: "The library notices are switched on. Train the machine, choose the word you expect, then ask it.",
          setup: { on: LIBRARY },
          truth: { word: "nine", text: "In this case, the Riverside library opens at nine." },
          goal: {},
          success: "Compare the reply with the case, then look at the counts. All the machine did was count what came after “opens at”. Even when its reply matches the case, nothing in those counts checked when the library opens.",
        },
        {
          id: "make-ten",
          title: "Make it say ten",
          instruction: "The library still opens at nine. Change which sentences are switched on, train the machine again, and get it to say ten.",
          truth: { word: "nine", text: "In this case, the Riverside library opens at nine." },
          goal: { word: "ten" },
          solution: ["lib-5", "shop-4"],
          evidence: "firstAsk",
          success: "The reply is just as firm as before, and now it is wrong. You changed the data, and nothing about the library.",
        },
        {
          id: "make-midnight",
          title: "Make it say midnight",
          instruction: "Now get it to say midnight, using as few sentences as you can.",
          truth: { word: "nine", text: "In this case, the Riverside library opens at nine." },
          goal: { word: "midnight" },
          solution: ["night-1"],
          evidence: "firstAsk",
          showCount: true,
          success: "A single sentence is enough. Whether the machine has seen one example or hundreds, its reply reads the same, so the wording tells you nothing about what lies behind it.",
        },
        {
          id: "tell-it",
          title: "Tell it the news",
          instruction: "The library has changed its hours: from January it opens at ten. The machine has been trained on the library notices again. Tell it the new time, then ask it.",
          setup: { on: LIBRARY, train: true },
          say: "The library opens at ten now.",
          truth: { word: "ten", text: "From January, the Riverside library opens at ten." },
          goal: { afterSaying: true },
          evidence: "prediction",
          success: "Telling it changed nothing. Talking to a trained model is using it, and its learned patterns stay as they were until it is trained again. Some real services add memory or reuse conversations in later training, but those are separate steps.",
        },
        {
          id: "add-notice",
          title: "Add the new notice",
          instruction: "The January notice is now among the training sentences. Switch it on, leave the other library notices on, train the machine again and ask it.",
          setup: { on: LIBRARY, train: true, reveal: ["new"] },
          truth: { word: "ten", text: "From January, the Riverside library opens at ten." },
          goal: { include: ["new"] },
          solution: [...LIBRARY, "new"],
          evidence: "prediction",
          success: "Look at the counts. The machine has no idea which notice is newest, so when older sentences outnumber the new one, it stays out of date.",
        },
        {
          id: "fix-it",
          title: "Get the current time",
          instruction: "Get the machine to give the current opening time, by changing only its training data.",
          truth: { word: "ten", text: "From January, the Riverside library opens at ten." },
          goal: { word: "ten", include: ["new"] },
          solution: ["new"],
          success: "It says ten, but only because you already knew the answer and changed the data to match. The machine still has not checked anything.",
        },
      ],
    },
    {
      kind: "quiz",
      id: "why-different",
      prompt: "The machine gave different answers to the same question. What best explains that?",
      choices: [
        { id: "a", label: "It looked up the real opening time and sometimes made mistakes copying it.", verdict: "weaker", explanation: "This toy machine has no lookup at all. It only counts which words followed which in its training sentences." },
        { id: "b", label: "It follows the patterns in its data, not what is true.", verdict: "correct", explanation: "Change the examples and the pattern changes. Truth never entered the process, and fitting a pattern is not the same as checking a fact." },
        { id: "c", label: "It picks among the possible answers at random, so any two runs can differ.", verdict: "weaker", explanation: "Ask again without retraining and you get the same result. The answers changed because the data changed, not by chance." },
      ],
      hints: [{ text: "When did its answer change, and when did it stay the same?" }],
    },
    {
      kind: "faultTrace",
      id: "faults",
      title: "Trace the failure",
      prompt: "Each of these models went wrong. Choose the stage where the problem came in.",
      stages,
      cases: [
        {
          id: "old-advice",
          text: "A health chatbot gives advice that doctors stopped recommending years ago. All the texts it learned from were written before the advice changed.",
          stageId: "data",
          explanation: "The model learned what its examples said. Those examples were out of date, so its patterns are too.",
        },
        {
          id: "corrected",
          text: "Someone corrects a model during a chat. The model has no memory feature, and in a new chat the next day it repeats the same mistake.",
          stageId: "model",
          explanation: "The correction was input during use. The trained model's patterns stayed fixed, so nothing carried over.",
        },
        {
          id: "wrong-question",
          text: "Someone wants to know when the swimming pool closes, but asks the model when the library closes. It answers correctly about the library.",
          stageId: "input",
          explanation: "The model answered the question it was given. The problem is in what was asked.",
        },
        {
          id: "invented-quote",
          text: "A model writes a quotation that appears in none of its training texts. The words fit together well, but nobody ever said them.",
          stageId: "output",
          explanation: "The output continues likely patterns of words, and can produce something plausible that no source ever contained.",
        },
      ],
    },
    {
      kind: "sort",
      id: "functions",
      prompt: "Sort these everyday products by the main AI function they use.",
      hints: [
        { text: "Ask what the product gives you: something it identified, something new, a ranked choice, or an estimate of what will happen." },
        { text: "Two products recognise something, and two generate something." },
      ],
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
        { id: "parcel", label: "A delivery app estimates when your parcel will arrive", categoryId: "predict", explanation: "It estimates something that has not happened yet, from past deliveries and current conditions." },
        { id: "poster", label: "An image tool makes a poster from a description", categoryId: "generate", explanation: "It produces a new image." },
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `Having run the machine, answer the first question again. ${fluencyQuestion}`,
      choices: fluencyChoices,
      withConfidence: true,
    },
    {
      kind: "transfer",
      id: "transfer-mark",
      title: "A new example",
      prompt: "A model writes this about the Commons. It reads smoothly. Mark the parts that could be checked against a record.",
      mark: [
        [
          { id: "year", text: "The Riverside Commons opened in 1987", target: true, explanation: "A date can be compared with the Commons' records." },
          " ",
          { id: "branches", text: "and has 40 branches.", target: true, explanation: "A count can be compared with the Commons' records." },
          " ",
          { id: "welcoming", text: "It is a welcoming place to learn,", target: false, explanation: "This is a judgment. People could agree or disagree, but a record couldn't settle it." },
          " ",
          { id: "future", text: "and its best days are still ahead.", target: false, explanation: "This is an opinion about the future. Nothing can be looked up to check it." },
        ],
      ],
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "What next?",
      prompt:
        "You have no records handy, and the text is due to go out. What is the best next step with “opened in 1987 and has 40 branches”?",
      choices: [
        { id: "a", label: "Publish it with a note that AI helped.", verdict: "weaker", explanation: "Disclosure is honest, but it leaves readers to check facts you could have checked. Smooth wording says nothing about the year or the number." },
        { id: "b", label: "Hold both figures until you can compare them with the Commons' records.", verdict: "correct", explanation: "Specific facts are checkable. The model only continued a likely pattern." },
        { id: "c", label: "Ask the model whether it is sure.", verdict: "weaker", explanation: "Its reassurance is more generated text, not independent evidence." },
      ],
      hints: [{ text: "Which parts of the sentence could be looked up?" }],
    },
    {
      kind: "openResponse",
      id: "explain",
      prompt:
        "A model trained on old bus timetables tells someone, in confident language, that their bus leaves at 8:15. Explain one reason this could be wrong even though it sounds right, and what the person should do.",
      rubric: {
        samples: [
          { id: "partial", text: "Buses change, so the model could be wrong. They should check the timetable.", met: ["action"], note: "It names a check, but it doesn't say why a model would be wrong, or why sounding sure doesn't help." },
          { id: "full", text: "It only knows patterns from old timetables, so it hasn't looked at today's. Sounding sure isn't proof. They should check the operator's site.", met: ["pattern", "confidence", "action"], note: "It covers where the answer came from, why the tone isn't evidence, and what to do." },
        ],
        criteria: [
          { id: "pattern", text: "Says the output comes from patterns in training data, not from checking the current timetable." },
          { id: "confidence", text: "Says that confident wording is not evidence that it is right." },
          { id: "action", text: "Names a check, such as the transport operator's current timetable." },
        ],
        examples: [
          "It learned from old timetables, so 8:15 may just be the pattern from those. Sounding sure doesn't mean it checked anything. They should look at the operator's current timetable.",
          "The model continues what it saw in training and has no idea whether the times changed. I would treat 8:15 as a guess and confirm it on the bus company's site before relying on it.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Fluent is not the same as correct. Treat specific claims as things to check against a source.",
      skills: [
        {
          id: "data-shapes-output",
          label: "Working out how training data shapes output",
          kind: "action",
          items: ["machine/make-ten", "machine/make-midnight"],
          practice: {
            prompt: "A model learned only from reviews written by a shop's staff. It calls the shop “excellent”. What is the most likely reason?",
            choices: [
              { id: "a", label: "It compared the shop with others.", verdict: "weaker", explanation: "It did no comparing. It continued the pattern in what it was shown." },
              { id: "b", label: "Its training examples came from people who praised the shop.", verdict: "correct", explanation: "Its answer reflects what its training data said, and that data came from people with a reason to praise the shop." },
              { id: "c", label: "Most people would rate this shop highly.", verdict: "weaker", explanation: "It only saw staff reviews, so it has no information about what most people think." },
            ],
          },
        },
        {
          id: "training-vs-use",
          label: "Telling training apart from using a model",
          kind: "action",
          items: ["machine/tell-it", "machine/add-notice", "faults/corrected"],
          practice: {
            prompt: "A company wants its model to know about a new product. Staff have been describing the product in chats with it, but it still says it has never heard of it. What would change the model itself?",
            choices: [
              { id: "a", label: "Describing the product in more chats, more clearly, until the model picks it up.", verdict: "weaker", explanation: "Chatting is using the model. Its patterns stay as they are, however often or clearly someone tells it." },
              { id: "b", label: "Asking the model to confirm that it has understood and stored the description.", verdict: "weaker", explanation: "Its confirmation would be more generated text. It wouldn't show that anything changed." },
              { id: "c", label: "Training it again on examples that include the product.", verdict: "correct", explanation: "Training is what changes the patterns. Adding a lookup tool would be another route, but that doesn't change the model itself." },
            ],
          },
        },
        {
          id: "trace-failure",
          label: "Tracing a failure to where it came in",
          kind: "action",
          items: ["faults/old-advice", "faults/corrected", "faults/wrong-question", "faults/invented-quote"],
          practice: {
            prompt: "A model says a bridge in town is open. The person asked about the old bridge, but they meant the new one, and the model's answer is correct for the old bridge. Where did the problem come in?",
            choices: [
              { id: "a", label: "Training data, since it lacks facts about the new bridge.", verdict: "weaker", explanation: "It might help, but the model answered what it was asked, and answered correctly." },
              { id: "b", label: "Output, since the answer did not help the person.", verdict: "weaker", explanation: "The output was right for the question that was put to it." },
              { id: "c", label: "Input, because the question named the wrong bridge.", verdict: "correct", explanation: "The question named the wrong bridge. No model could know that from the words it was given." },
            ],
          },
        },
        {
          id: "ai-functions",
          label: "Naming common AI functions",
          kind: "knowledge",
          items: ["functions/face", "functions/email", "functions/show", "functions/speech", "functions/parcel", "functions/poster"],
        },
        {
          id: "tone-vs-evidence",
          label: "Separating confidence of tone from evidence",
          kind: "knowledge",
          items: ["why-different", "revision"],
          practice: {
            prompt: "Two AI replies give different dates for the same event. One is warm and certain, and the other hedges. What should decide which you rely on?",
            choices: [
              { id: "a", label: "The hedged one, since admitting doubt suggests careful weighing.", verdict: "weaker", explanation: "Hedging is also generated wording. It doesn't show that any evidence was weighed." },
              { id: "b", label: "The certain one, since it states a firm date.", verdict: "weaker", explanation: "Firm wording tells you nothing about the data behind it, as the machine showed." },
              { id: "c", label: "A record of the event, not the tone of either reply.", verdict: "correct", explanation: "Neither tone is evidence. A date is checkable, so check it." },
            ],
          },
        },
        {
          id: "checkable-next-step",
          label: "Choosing a checkable next step in a new example",
          kind: "transfer",
          items: ["transfer", "transfer-mark/year", "transfer-mark/branches", "transfer-mark/welcoming", "transfer-mark/future"],
          practice: {
            prompt: "A model writes that a local charity “helped 12,000 families last year”. You are about to quote it in a report. What is the best next step?",
            choices: [
              { id: "a", label: "Quote it with “reportedly” to signal doubt.", verdict: "weaker", explanation: "“Reportedly” implies that someone reported it. Here, a model simply produced it." },
              { id: "b", label: "Find the charity's own figures before quoting the number.", verdict: "correct", explanation: "The number is checkable, so check it at the source before relying on it." },
              { id: "c", label: "Ask a second AI system to confirm it.", verdict: "weaker", explanation: "Two models can share the same patterns and the same error. Agreement between them isn't a source." },
            ],
          },
        },
        {
          id: "explain-limit",
          label: "Explaining a limitation in your own words",
          kind: "reasoning",
          items: ["explain"],
        },
      ],
      nextMissionId: "m02-delegation",
    },
  ],
};
