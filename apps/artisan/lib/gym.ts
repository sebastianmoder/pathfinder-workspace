import type { GymProblem } from "@/content/types";
import { itemKey, type EvidenceResult } from "./evidence";

/** Two items per problem: the unaided first attempt, and solving it, with any help noted. */
export function gymItems(stepId: string, problems: GymProblem[]): string[] {
  return problems.flatMap((p) => [itemKey(stepId, p.id, "attempt"), itemKey(stepId, p.id)]);
}

export const isRight = (p: GymProblem, choiceId: string) => p.choices.find((c) => c.id === choiceId)?.verdict === "correct";

/** Help is not failure (PRD M06): a hint or worked example is noted. Only a revealed answer goes uncredited. */
export function solveResult(p: GymProblem, helpsUsed: string[]): EvidenceResult {
  const sawAnswer = p.helps.some((h) => h.givesAnswer && helpsUsed.includes(h.id));
  return { right: !sawAnswer, assisted: helpsUsed.length > 0 };
}
