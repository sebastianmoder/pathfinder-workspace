import { describe, expect, it } from "vitest";
import type { AllocationSpec } from "@/content/types";
import { allocationItems, coverage, planResult, plansWithinBudget, spent } from "./allocation";

const spec: AllocationSpec = {
  budget: { amount: 30, label: "Budget", unit: "k" },
  options: [
    { id: "a", label: "", cost: 20, addresses: ["x"], note: "" },
    { id: "b", label: "", cost: 15, addresses: ["x", "y"], note: "" },
    { id: "c", label: "", cost: 10, addresses: ["z"], note: "" },
  ],
  concerns: [
    { id: "x", stakeholder: "", text: "", essential: true, why: "" },
    { id: "y", stakeholder: "", text: "", why: "" },
    { id: "z", stakeholder: "", text: "", essential: true, why: "" },
  ],
};

describe("allocation", () => {
  it("adds up costs and maps coverage", () => {
    expect(spent(spec, ["a", "c"])).toBe(30);
    expect(coverage(spec, ["b"]).get("x")).toEqual(["b"]);
    expect(coverage(spec, ["b"]).get("z")).toEqual([]);
  });

  it("accepts any plan within budget that covers every essential concern", () => {
    expect(planResult(spec, ["a", "c"]).right).toBe(true);
    expect(planResult(spec, ["b", "c"]).right).toBe(true);
    expect(planResult(spec, ["a", "b"])).toMatchObject({ right: false, overBudget: true });
    expect(planResult(spec, ["b"])).toMatchObject({ right: false, missingEssential: ["z"] });
    expect(plansWithinBudget(spec).filter((p) => planResult(spec, p).right)).toHaveLength(2);
    expect(allocationItems("s")).toEqual(["s/plan"]);
  });
});
