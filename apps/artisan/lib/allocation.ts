import type { AllocationSpec } from "@/content/types";
import { itemKey, type EvidenceResult } from "./evidence";

export const spent = (spec: AllocationSpec, chosen: readonly string[]) =>
  spec.options.filter((o) => chosen.includes(o.id)).reduce((n, o) => n + o.cost, 0);

/** Concern id → the chosen options that address it. */
export function coverage(spec: AllocationSpec, chosen: readonly string[]): Map<string, string[]> {
  return new Map(spec.concerns.map((c) => [c.id, spec.options.filter((o) => chosen.includes(o.id) && o.addresses.includes(c.id)).map((o) => o.id)]));
}

export function planResult(spec: AllocationSpec, chosen: readonly string[]): EvidenceResult & { overBudget: boolean; missingEssential: string[] } {
  const cov = coverage(spec, chosen);
  const overBudget = spent(spec, chosen) > spec.budget.amount;
  const missingEssential = spec.concerns.filter((c) => c.essential && cov.get(c.id)!.length === 0).map((c) => c.id);
  return { right: !overBudget && missingEssential.length === 0, overBudget, missingEssential };
}

export const allocationItems = (stepId: string) => [itemKey(stepId, "plan")];

/** Every plan within budget, as option-id lists, for content tests. */
export function plansWithinBudget(spec: AllocationSpec): string[][] {
  const out: string[][] = [];
  const go = (i: number, chosen: string[]) => {
    if (i === spec.options.length) {
      if (spent(spec, chosen) <= spec.budget.amount) out.push(chosen);
      return;
    }
    go(i + 1, chosen);
    go(i + 1, [...chosen, spec.options[i].id]);
  };
  go(0, []);
  return out;
}
