import { describe, expect, it } from "vitest";
import type { ChartLabSpec } from "@/content/types";
import { barsFor, chartItems, goalMet, niceMax, percentChange, valuesOf } from "./chart";

const spec: ChartLabSpec = {
  claim: "",
  categoryLabel: "Branch",
  categories: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
  quantities: [
    { id: "visits", label: "Visits", values: { a: 240, b: 120 } },
    { id: "people", label: "Residents", values: { a: 12000, b: 3000 } },
  ],
  measures: [
    { id: "count", label: "Visits", numerator: "visits", unit: "visits" },
    { id: "rate", label: "Visits per 1,000", numerator: "visits", denominator: "people", per: 1000, unit: "per 1,000" },
  ],
  baselines: [{ id: "zero", label: "0", min: 0 }],
  ranges: [{ id: "all", label: "All", categoryIds: ["a", "b"] }, { id: "a", label: "A only", categoryIds: ["a"] }],
  start: { measure: "count", baseline: "zero", range: "all" },
  tasks: [{ id: "t", title: "", instruction: "", goal: { measure: "rate" }, solution: { measure: "rate", baseline: "zero", range: "all" }, success: "" }],
};

describe("chart lab", () => {
  it("computes counts and rates per category, for the chosen range", () => {
    expect(barsFor(spec, spec.start).map((b) => b.value)).toEqual([240, 120]);
    expect(barsFor(spec, { ...spec.start, measure: "rate" }).map((b) => b.value)).toEqual([20, 40]);
    expect(barsFor(spec, { ...spec.start, range: "a" }).map((b) => b.id)).toEqual(["a"]);
  });

  it("finds a clean axis top and a percentage change", () => {
    expect(niceMax(101, 90)).toBe(110);
    expect(niceMax(240)).toBe(250);
    expect(niceMax(40)).toBe(50);
    expect(percentChange(92, 101)).toBe(9.8);
  });

  it("checks only the parts of the view a goal names", () => {
    expect(goalMet({ measure: "rate" }, { measure: "rate", baseline: "x", range: "y" })).toBe(true);
    expect(goalMet({ measure: "rate" }, spec.start)).toBe(false);
    expect(chartItems("s", spec)).toEqual(["s/t"]);
  });
});

describe("an adjustable figure", () => {
  const adjustable: ChartLabSpec = {
    ...spec,
    adjustable: { quantity: "people", category: "b", label: "B residents", note: "", min: 3000, max: 9000, step: 1000 },
  };

  it("replaces the authored value only where the learner has moved it", () => {
    expect(valuesOf(adjustable, adjustable.start, "people").b).toBe(3000);
    expect(valuesOf(adjustable, { ...adjustable.start, adjust: 8000 }, "people").b).toBe(8000);
    expect(valuesOf(adjustable, { ...adjustable.start, adjust: 8000 }, "visits").b).toBe(120);
    expect(barsFor(adjustable, { ...adjustable.start, measure: "rate", adjust: 8000 }).map((b) => b.value)).toEqual([20, 15]);
  });

  it("meets a “no longer on top” goal only when another bar is strictly higher", () => {
    const goal = { measure: "rate", topIsNot: "b" };
    const rate = { ...adjustable.start, measure: "rate" };
    expect(goalMet(goal, rate, adjustable)).toBe(false); // B: 40, A: 20
    expect(goalMet(goal, { ...rate, adjust: 6000 }, adjustable)).toBe(false); // a tie is not overtaking
    expect(goalMet(goal, { ...rate, adjust: 7000 }, adjustable)).toBe(true);
    expect(goalMet(goal, { ...rate, adjust: 7000 })).toBe(false); // without the spec, it can't be judged
  });
});
