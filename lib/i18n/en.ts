/** All learner-facing UI chrome lives here so another locale can replace this file. */
export const en = {
  appName: "ARTISAN",
  promise: "Learn to think better with AI.",
  skipToContent: "Skip to main content",
  nav: { map: "Mission map", continue: "Continue" },

  welcome: {
    intro:
      "Practise understanding, evaluating and using AI through short investigations, experiments and roleplay. No account needed.",
    example: "Example: you are handed an AI-written briefing. Which claims does the evidence really support?",
    time: "About 8–15 minutes per mission.",
    start: "Start",
    continue: "Continue with a mission password",
    map: "Open the mission map",
  },

  map: {
    title: "Mission map",
    recommended: "Recommended next",
    available: "Available",
    planned: "Planned — not available yet",
    completed: "Completed this visit",
    play: "Open mission",
    sessionNote: "Completion marks last only for this visit. ARTISAN does not keep a learner record.",
  },

  mission: {
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    pause: "Pause",
    help: "Need a hint?",
    noMoreHints: "No more hints.",
    commit: "Check my answer",
    next: "Continue",
    retry: "Try again",
    confidenceLabel: "How confident are you?",
    confidence: ["Not at all", "A little", "Somewhat", "Fairly", "Very"],
    before: "Your first answer",
    after: "Your answer now",
    restart: "Restart this mission",
    verdict: { correct: "Fits the case", defensible: "Defensible", weaker: "Weaker fit" },
    fictional: "Fictional case",
  },

  pause: {
    title: "Pause this mission",
    body: (code: string, title: string) =>
      `Keep this mission password if you want to return later: ${code}. Enter it on the ARTISAN welcome page to start ${title}. It opens the mission from the beginning; your earlier answers are not saved.`,
    close: "Keep working",
  },

  password: {
    label: "Mission password",
    copy: "Copy",
    copied: "Copied to clipboard",
    copyFailed: "Copying isn't available here. Select the password and copy it yourself.",
    print: "Print",
  },

  continuePage: {
    title: "Continue with a mission password",
    help: "Enter the password you noted. It opens that mission from the beginning.",
    field: "Mission password",
    submit: "Find mission",
    invalid: "That password doesn't match a mission. Check it and try again, or open the mission map.",
    found: (title: string) => `This password opens: ${title}`,
    start: "Start mission",
    restartNote: "The mission starts from the beginning. Earlier answers are not saved.",
  },

  toy: {
    label: "Simplified toy model: it only counts which words followed the same words in its training sentences. Real AI systems are far more complex.",
    chooseData: "Choose what the machine learns from",
    seeSentences: (label: string) => `See the training sentences: ${label}`,
    predictFirst: "First, what word do you expect next?",
    run: "Run the machine",
    result: (label: string) => `Result after learning from: ${label}`,
    nothing: "No training sentence matched, so the machine has nothing to predict.",
    context: (c: string) => `It matched the words “${c}” in its training sentences.`,
    tableCaption: "Words that followed, with counts and share",
    word: "Next word",
    count: "Times seen",
    share: "Share",
    yourGuess: "Your guess",
    intended: "What the case says is true",
    tried: (n: number, min: number) => `Training sets tried: ${n} of at least ${min}.`,
    needMore: (min: number) => `Try at least ${min} different training sets to compare.`,
  },
  sort: { choose: "Choose a function", fits: "Fits.", tryAnother: "Try another.", fixSome: "Change the items marked and check again." },
  flow: { back: "Back", nextStage: "Next stage" },

  debrief: {
    title: "Debrief",
    takeaway: "Practical takeaway",
    skills: "What you demonstrated",
    next: "Recommended next mission",
    replay: "Replay this mission",
    thisMission: "Replay password for this mission",
    endOfContent: "You have completed the currently available journey. You can replay any mission.",
    summary: "See session summary",
  },

  notFound: { title: "We couldn't find that page", map: "Go to the mission map" },
} as const;

export const t = en;
