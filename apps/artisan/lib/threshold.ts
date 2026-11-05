import type { ThresholdLabSpec, ThresholdView } from "@/content/types";
import { itemKey } from "./evidence";

export interface GroupOutcome {
  id: string;
  label: string;
  total: number;
  qualified: number;
  selected: number;
  /** Qualified, but below the threshold. */
  missed: number;
  /** Selected, but not qualified. */
  wrongPicks: number;
}

export function outcomes(spec: ThresholdLabSpec, view: ThresholdView): GroupOutcome[] {
  return spec.groups.map((g) => {
    const people = spec.applicants.filter((a) => a.group === g.id);
    const picked = (a: (typeof people)[number]) => a.scores[view.version] >= view.threshold;
    return {
      id: g.id,
      label: g.label,
      total: people.length,
      qualified: people.filter((a) => a.qualified).length,
      selected: people.filter(picked).length,
      missed: people.filter((a) => a.qualified && !picked(a)).length,
      wrongPicks: people.filter((a) => !a.qualified && picked(a)).length,
    };
  });
}

export const totalSelected = (o: GroupOutcome[]) => o.reduce((n, g) => n + g.selected, 0);

export function missedGap(o: GroupOutcome[]): number {
  const missed = o.map((g) => g.missed);
  return Math.max(...missed) - Math.min(...missed);
}

export const withinCapacity = (spec: ThresholdLabSpec, o: GroupOutcome[]) =>
  totalSelected(o) >= spec.capacity.min && totalSelected(o) <= spec.capacity.max;

export function thresholdGoalMet(spec: ThresholdLabSpec, goal: { maxMissedGap?: number }, view: ThresholdView): boolean {
  const o = outcomes(spec, view);
  return withinCapacity(spec, o) && (goal.maxMissedGap === undefined || missedGap(o) <= goal.maxMissedGap);
}

export const thresholdItems = (stepId: string, spec: ThresholdLabSpec) => [
  ...spec.tasks.map((t) => itemKey(stepId, t.id)),
  ...(spec.check ? [itemKey(stepId, "check")] : []),
];
