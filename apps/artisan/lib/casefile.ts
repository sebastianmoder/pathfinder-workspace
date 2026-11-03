import type { CasefileSpec, CaseStatement, CaseStatus } from "@/content/types";
import { itemKey } from "./evidence";

/** What the learner could honestly conclude from the leads they followed. */
export function expectedStatus(s: CaseStatement, followed: readonly string[]): CaseStatus {
  if (s.leadIds.length === 0 || s.leadIds.some((id) => followed.includes(id))) return s.status;
  return "uncertain";
}

export function timelineFor(spec: CasefileSpec, followed: readonly string[]) {
  const fromLeads = spec.leads.filter((l) => l.timeline && followed.includes(l.id)).map((l) => l.timeline!);
  return [...(spec.timeline ?? []), ...fromLeads].sort((a, b) => a.order - b.order);
}

export function casefileItems(stepId: string, spec: CasefileSpec): string[] {
  return [
    ...(spec.keyLeads ?? []).map((id) => itemKey(stepId, "lead", id)),
    ...spec.statements.map((s) => itemKey(stepId, s.id)),
  ];
}
