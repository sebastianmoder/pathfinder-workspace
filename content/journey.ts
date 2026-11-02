import type { ModuleEntry } from "./types";

export const stages = [
  { id: 1, title: "Understand and choose", question: "What is AI, and how should I work with it?" },
  { id: 2, title: "Investigate and think", question: "How do I evaluate outputs and improve my thinking?" },
  { id: 3, title: "Create and act responsibly", question: "How do I work with AI in a way I can justify?" },
  { id: 4, title: "Design and participate", question: "How do AI systems affect people beyond one conversation?" },
  { id: "capstone", title: "Capstone", question: "Can I bring these skills together?" },
] as const;

const planned = (
  id: string,
  title: string,
  summary: string,
  stage: ModuleEntry["stage"],
  recommendedBefore: string[] = [],
): ModuleEntry => ({ id, title, summary, stage, status: "planned", missionIds: [], recommendedBefore });

export const modules: ModuleEntry[] = [
  {
    id: "M01",
    title: "Inside the Machine",
    summary: "Operate a toy prediction machine and see why plausible output can be wrong.",
    stage: 1,
    status: "available",
    missionIds: ["m01-foundations"],
    recommendedBefore: [],
  },
  planned("M02", "The Delegation Desk", "Choose an appropriate role for AI and who stays responsible.", 1, ["M01"]),
  planned("M03", "The Briefing Studio", "Write a brief that produces a useful response.", 1, ["M02"]),
  planned("M04", "The Evidence Bureau", "Check claims against sources.", 2, ["M01"]),
  planned("M05", "The Argument Forge", "Test assumptions and revise a position.", 2, ["M04"]),
  planned("M06", "The Thinking Gym", "Learn with AI help while keeping your own skill.", 2, ["M05"]),
  planned("M07", "The Numbers Lab", "Check numbers, charts and causal claims.", 2, ["M04"]),
  planned("M08", "The Newsroom", "Evaluate provenance of potentially manipulated media.", 3),
  planned("M09", "The Fairness Council", "Find where an AI system produces uneven outcomes.", 3, ["M07"]),
  planned("M10", "The Boundary Room", "Protect sensitive information and spot embedded instructions.", 3, ["M01", "M04"]),
  planned("M11", "The Co-Creation Studio", "Create with AI while keeping editorial responsibility.", 3, ["M03", "M10"]),
  planned("M12", "The Systems Workshop", "Assemble and test a supervised AI workflow.", 4, ["M02", "M04", "M09", "M10"]),
  planned("M13", "The Citizens' Assembly", "Weigh who benefits and who bears the costs.", 4, ["M09", "M12"]),
  planned("C01", "The ARTISAN Commission", "Combine every skill in one defended recommendation.", "capstone"),
];

export function getModule(id: string) {
  return modules.find((m) => m.id === id);
}

export function findModuleForMission(missionId: string) {
  return modules.find((m) => m.missionIds.includes(missionId));
}
