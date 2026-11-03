import { describe, expect, it } from "vitest";
import type { ChartLabSpec } from "@/content/types";
import { barsFor, chartItems, goalMet, niceMax, percentChange } from "./chart";

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
