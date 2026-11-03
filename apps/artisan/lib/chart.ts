import type { ChartLabSpec, ChartView } from "@/content/types";
import { itemKey } from "./evidence";

export interface Bar {
  id: string;
  label: string;
  value: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function measureOf(spec: ChartLabSpec, view: ChartView) {
  return spec.measures.find((m) => m.id === view.measure) ?? spec.measures[0];
}

export function baselineOf(spec: ChartLabSpec, view: ChartView) {
  return spec.baselines.find((b) => b.id === view.baseline) ?? spec.baselines[0];
}

/** The bars for a view: the chosen categories, with the chosen measure computed from the quantities. */
export function barsFor(spec: ChartLabSpec, view: ChartView): Bar[] {
  const m = measureOf(spec, view);
  const range = spec.ranges.find((r) => r.id === view.range) ?? spec.ranges[0];
  const q = (id: string) => spec.quantities.find((x) => x.id === id)!.values;
  return spec.categories
    .filter((c) => range.categoryIds.includes(c.id))
    .map((c) => {
      const num = q(m.numerator)[c.id];
      const value = m.denominator ? (num / q(m.denominator)[c.id]) * (m.per ?? 1) : num;
      return { id: c.id, label: c.label, value: round1(value) };
    });
}

/** A clean top for the axis: the next step of 1, 2 or 5 times a power of ten above the largest value. */
export function niceMax(max: number, min = 0): number {
  const span = Math.max(max - min, 1);
  const step = 10 ** Math.floor(Math.log10(span));
  for (const f of [1, 2, 2.5, 5, 10]) if (min + f * step >= max) return min + f * step;
  return min + 10 * step;
}

export const percentChange = (from: number, to: number) => (from === 0 ? 0 : round1(((to - from) / from) * 100));

export const goalMet = (goal: Partial<ChartView>, view: ChartView) =>
  (Object.keys(goal) as (keyof ChartView)[]).every((k) => goal[k] === view[k]);

export function chartItems(stepId: string, spec: ChartLabSpec): string[] {
  return spec.tasks.filter((t) => t.evidence !== false).map((t) => itemKey(stepId, t.id));
}
