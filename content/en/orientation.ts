/**
 * P0 starting questions. DRAFT for review. These set a starting point and are deliberately not marked:
 * there are no verdicts here, and nothing depends on the answers.
 */
export interface OrientationQuestion {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
}

export const orientationQuestions: OrientationQuestion[] = [
  {
    id: "citation",
    prompt: "An AI answer includes a citation. What do you usually do?",
    choices: [
      { id: "trust", label: "Treat it as a good sign and carry on" },
      { id: "open", label: "Open the source and read the relevant part" },
      { id: "ignore", label: "I don't usually pay attention to citations" },
      { id: "new", label: "I haven't come across this" },
    ],
  },
  {
    id: "disagree",
    prompt: "An AI answer disagrees with something you believe. What is your first move?",
    choices: [
      { id: "doubt-ai", label: "Assume the AI is probably wrong" },
      { id: "doubt-me", label: "Assume I am probably wrong" },
      { id: "check", label: "Look for something that could settle it" },
      { id: "new", label: "I'm not sure" },
    ],
  },
  {
    id: "use",
    prompt: "How much have you used AI tools so far?",
    choices: [
      { id: "never", label: "Not at all, or hardly ever" },
      { id: "sometimes", label: "Now and then" },
      { id: "often", label: "Regularly" },
    ],
  },
];
