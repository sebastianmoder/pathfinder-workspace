import { DELEGATION_ROLES, type DelegationRole, type DelegationSpec, type DelegationTask } from "@/content/types";
import { itemKey, type EvidenceResult } from "./evidence";

/** The role whose outcome is reviewed as the best fit. Content tests guarantee there is exactly one. */
export function bestRole(task: DelegationTask): DelegationRole {
  return DELEGATION_ROLES.find((r) => task.outcomes[r].verdict === "correct")!;
}

/** "Defensible" counts as sound: it works, at a cost the feedback names. Only "weaker" is not credited. */
export function isSound(task: DelegationTask, role: DelegationRole): boolean {
  return task.outcomes[role].verdict !== "weaker";
}

export function delegationItems(stepId: string, spec: DelegationSpec): string[] {
  return spec.tasks.map((task) => itemKey(stepId, task.id));
}

/** Ledger entries for one set of assignments. A hint is help, which is noted but never counted against anyone. */
export function delegationResults(
  stepId: string,
  spec: DelegationSpec,
  assigned: Record<string, DelegationRole>,
  hinted: readonly string[] = [],
): [string, EvidenceResult][] {
  return spec.tasks.map((task) => [
    itemKey(stepId, task.id),
    { right: isSound(task, assigned[task.id]), assisted: hinted.includes(task.id) },
  ]);
}
