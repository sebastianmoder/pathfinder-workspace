import { describe, expect, it } from "vitest";
import type { ComposeSpec } from "@/content/types";
import { allMet, changedElements, composeItems, composeOutput, contributions, treeOrder, versionDepths, wordCount } from "./compose";

const spec: ComposeSpec = {
  workspaceLabel: "Brief",
  outputLabel: "Output",
  elements: [
    { id: "goal", label: "Goal", help: "", options: [{ id: "vague", label: "v", output: "Generic text." }, { id: "clear", label: "c", output: "Welcome!", by: "ai" }] },
    { id: "extra", label: "Extra", help: "", options: [{ id: "none", label: "-", output: "" }, { id: "para", label: "p", output: "\nNew paragraph here." }] },
  ],
  outputOrder: ["goal", "extra"],
  start: { goal: "vague", extra: "none" },
  rounds: [{ id: "r1", title: "", instruction: "", criteria: [{ id: "c", text: "", requires: { goal: ["clear"] } }], solution: { goal: "clear", extra: "none" }, success: "" }],
};

describe("compose", () => {
  it("assembles output in order, skipping empty parts and honouring paragraph breaks", () => {
    expect(composeOutput(spec, { goal: "vague", extra: "none" })).toEqual(["Generic text."]);
    expect(composeOutput(spec, { goal: "clear", extra: "para" })).toEqual(["Welcome!", "New paragraph here."]);
    expect(wordCount(composeOutput(spec, { goal: "clear", extra: "para" }))).toBe(4);
  });

  it("checks criteria and finds what changed", () => {
    expect(allMet(spec.rounds[0].criteria, spec.start)).toBe(false);
    expect(allMet(spec.rounds[0].criteria, spec.rounds[0].solution)).toBe(true);
    expect(changedElements(spec.start, { goal: "clear", extra: "para" })).toEqual(["goal", "extra"]);
  });

  it("checks a rule that depends on another choice", () => {
    const rule = { id: "r", text: "", anyOf: [{ goal: ["clear"], extra: ["para"] }, { goal: ["vague"], extra: ["none"] }] };
    expect(allMet([rule], { goal: "clear", extra: "para" })).toBe(true);
    expect(allMet([rule], { goal: "vague", extra: "none" })).toBe(true);
    expect(allMet([rule], { goal: "clear", extra: "none" })).toBe(false);
  });

  it("records who wrote each part that appears", () => {
    expect(contributions(spec, { goal: "clear", extra: "none" })).toEqual([{ element: "Goal", label: "c", by: "ai" }]);
  });

  it("orders a branching history as a tree", () => {
    const vs = [
      { id: 1, parent: null, roundId: "r1", choices: {} },
      { id: 2, parent: 1, roundId: "r1", choices: {} },
      { id: 3, parent: 1, roundId: "r1", choices: {} },
      { id: 4, parent: 2, roundId: "r1", choices: {} },
    ];
    expect(treeOrder(vs).map((v) => v.id)).toEqual([1, 2, 4, 3]);
    expect(versionDepths(vs).get(4)).toBe(2);
    expect(composeItems("s", spec)).toEqual(["s/r1", "s/r1/checklist"]);
  });
});
