import type { Step } from "@/content/types";

/**
 * Where a step sits in a mission's rhythm, shown beside the progress ruler so the shared structure reads as
 * a route rather than a repetition. Phases never go backwards: a quiz after the revision is still part of
 * rethinking, and a written answer belongs to whatever phase it follows.
 */
export const PHASES = ["start", "investigate", "rethink", "apply", "wrapUp"] as const;
export type Phase = (typeof PHASES)[number];

function own(step: Step): number | null {
  switch (step.kind) {
    case "brief":
    case "refresher":
    case "initialJudgment":
      return 0;
    case "revision":
      return 2;
    case "transfer":
      return 3;
    case "debrief":
      return 4;
    case "openResponse":
      return null;
    default:
      return 1;
  }
}

export function phasesOf(steps: Step[]): Phase[] {
  let current = 0;
  return steps.map((step) => {
    const p = own(step);
    if (p !== null) current = Math.max(current, p);
    return PHASES[current];
  });
}

/**
 * A refresher straight after the brief is shown inside the brief's screen, so the two count as one step.
 * Returns, for each step, whether it is shown on a screen of its own.
 */
export function ownScreen(steps: Step[]): boolean[] {
  return steps.map((s, i) => !(s.kind === "refresher" && steps[i - 1]?.kind === "brief"));
}

/**
 * Which activity a step uses, so a learner who has finished one this visit sees its instructions folded away.
 * Transfers use the same activities as the main steps, and count as the same kind.
 */
export function activityKey(step: Step): string {
  if (step.kind === "transfer") {
    if ("audit" in step) return "audit";
    if ("delegation" in step) return "delegation";
    if ("compose" in step) return "compose";
    if ("allocation" in step) return "allocation";
    if ("workflow" in step) return "workflow";
    if ("casefile" in step) return "casefile";
    if ("mark" in step) return step.mode === "redact" ? "markRedact" : "markFind";
    if ("problems" in step) return "gymUnaided";
    return "choice";
  }
  if (step.kind === "claimAudit") return "audit";
  if (step.kind === "mark") return step.mode === "redact" ? "markRedact" : "markFind";
  if (step.kind === "quiz") return "choice";
  if (step.kind === "openResponse") return `openResponse:${step.format ?? "free"}`;
  return step.kind;
}
