import { describe, expect, it } from "vitest";
import type { ThresholdLabSpec } from "@/content/types";
import { missedGap, outcomes, thresholdGoalMet, thresholdItems, totalSelected } from "./threshold";

const spec: ThresholdLabSpec = {
  scoreLabel: "Score",
  qualifiedLabel: "Qualified",
  groups: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
  versions: [{ id: "v1", label: "v1", note: "" }, { id: "v2", label: "v2", note: "" }],
  applicants: [
    { id: "a1", group: "a", qualified: true, scores: { v1: 90, v2: 90 } },
    { id: "a2", group: "a", qualified: false, scores: { v1: 70, v2: 70 } },
    { id: "b1", group: "b", qualified: true, scores: { v1: 60, v2: 80 } },
    { id: "b2", group: "b", qualified: false, scores: { v1: 40, v2: 55 } },
  ],
  capacity: { label: "places", min: 1, max: 2 },
  range: { min: 0, max: 100 },
  start: { version: "v1", threshold: 65 },
  stakeholders: [],
  tasks: [{ id: "t", title: "", instruction: "", goal: { maxMissedGap: 0 }, solution: { version: "v2", threshold: 75 }, success: "" }],
};

describe("threshold lab", () => {
  it("counts selections and both kinds of error per group", () => {
    const o = outcomes(spec, spec.start);
    expect(o.map((g) => [g.selected, g.missed, g.wrongPicks])).toEqual([[2, 0, 1], [0, 1, 0]]);
    expect(totalSelected(o)).toBe(2);
    expect(missedGap(o)).toBe(1);
  });

  it("meets a goal only within capacity", () => {
    expect(thresholdGoalMet(spec, spec.tasks[0].goal, spec.start)).toBe(false);
    expect(thresholdGoalMet(spec, spec.tasks[0].goal, { version: "v2", threshold: 75 })).toBe(true);
    expect(thresholdGoalMet(spec, {}, { version: "v1", threshold: 0 })).toBe(false); // everyone selected: over capacity
    expect(thresholdItems("s", spec)).toEqual(["s/t"]);
  });
});
