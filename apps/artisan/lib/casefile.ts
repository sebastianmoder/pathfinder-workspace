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

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toClock = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Where the clock stands after the leads followed so far. */
export function clockState(spec: CasefileSpec, followed: readonly string[]) {
  if (!spec.clock) return null;
  const total = toMinutes(spec.clock.deadline) - toMinutes(spec.clock.start);
  const used = spec.leads.filter((l) => followed.includes(l.id)).reduce((n, l) => n + (l.minutes ?? 0), 0);
  return { total, used, left: total - used, now: toClock(toMinutes(spec.clock.start) + used), deadline: spec.clock.deadline };
}

/**
 * The newest message so far. Messages arrive in order: a lead's own message when it is followed, then any the
 * clock reaches as that lead's time passes.
 */
export function latestMessage(spec: CasefileSpec, followed: readonly string[]): string | undefined {
  let used = 0;
  let latest: string | undefined;
  for (const id of followed) {
    const lead = spec.leads.find((l) => l.id === id);
    if (!lead) continue;
    if (lead.pressure) latest = lead.pressure;
    const before = used;
    used += lead.minutes ?? 0;
    for (const p of spec.clock?.pressures ?? []) if (p.after > before && p.after <= used) latest = p.text;
  }
  return latest;
}

/** Whether a lead can still be followed, by count or by time. */
export function canFollow(spec: CasefileSpec, followed: readonly string[], leadId: string): boolean {
  if (followed.includes(leadId)) return false;
  const clock = clockState(spec, followed);
  if (clock) return (spec.leads.find((l) => l.id === leadId)?.minutes ?? 0) <= clock.left;
  if (spec.budget) return followed.length < spec.budget.leads;
  return true;
}

export function casefileItems(stepId: string, spec: CasefileSpec): string[] {
  return [
    ...(spec.keyLeads ?? []).map((id) => itemKey(stepId, "lead", id)),
    ...spec.statements.map((s) => itemKey(stepId, s.id)),
  ];
}
