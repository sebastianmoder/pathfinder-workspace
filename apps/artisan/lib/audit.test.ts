import { describe, expect, it } from "vitest";
import { assembleClaim, calibrate, consequences, gradeCalculation, gradeClaim, gradeRepair, isComplete, NO_EVIDENCE } from "./audit";
import type { Claim } from "@/content/types";

const base: Claim = {
  id: "c",
  text: "x",
  status: "misleading",
  passageIds: ["p1"],
  bestAction: "qualify",
  defensibleActions: ["correct"],
  evidenceExplanation: "e",
  statusExplanation: "s",
  actionExplanation: "a",
  finalText: "y",
};

describe("gradeClaim", () => {
  it("accepts the right passage, status and best action", () => {
    expect(gradeClaim(base, { evidence: "p1", status: "misleading", action: "qualify" })).toEqual({
      evidence: true,
      status: true,
      action: "best",
    });
  });

  it("marks a defensible action as defensible, not wrong", () => {
    expect(gradeClaim(base, { evidence: "p1", status: "misleading", action: "correct" }).action).toBe("defensible");
  });

  it("grades each part independently", () => {
    expect(gradeClaim(base, { evidence: "p2", status: "misleading", action: "remove" })).toEqual({
      evidence: false,
      status: true,
      action: "weaker",
    });
  });

  it("requires 'no source' when no passage addresses the claim", () => {
    const none: Claim = { ...base, passageIds: [] };
    expect(gradeClaim(none, { evidence: NO_EVIDENCE }).evidence).toBe(true);
    expect(gradeClaim(none, { evidence: "p1" }).evidence).toBe(false);
  });

  it("does not treat 'no source' as right when a passage exists", () => {
    expect(gradeClaim(base, { evidence: NO_EVIDENCE }).evidence).toBe(false);
  });
});

describe("isComplete", () => {
  it("needs evidence, status and action", () => {
    expect(isComplete({ evidence: "p1", status: "supported" })).toBe(false);
    expect(isComplete({ evidence: "p1", status: "supported", action: "retain" })).toBe(true);
    expect(isComplete(undefined)).toBe(false);
  });
});

const repairable: Claim = {
  ...base,
  repair: ["Of ", { id: "n", accept: ["63"] }, " in ", { id: "w", accept: ["March"], options: ["March", "May"] }, "."],
  finalText: "Of 63 in March.",
  ifKept: "kept outcome",
  ifLost: "lost outcome",
};
const full = { evidence: "p1", status: "misleading" as const, action: "qualify" as const };

describe("repairs", () => {
  it("are only required for a decision to change the wording", () => {
    expect(isComplete(full, repairable)).toBe(false);
    expect(isComplete({ ...full, repair: { n: "63", w: "March" } }, repairable)).toBe(true);
    expect(isComplete({ ...full, action: "retain" }, repairable)).toBe(true);
  });

  it("accept harmless differences in how a value is typed", () => {
    expect(gradeRepair(repairable, { repair: { n: " 63 ", w: "march" } })).toBe(true);
    expect(gradeRepair(repairable, { repair: { n: "48", w: "March" } })).toBe(false);
  });
});

describe("assembleClaim", () => {
  it("follows the learner's decision, including mistakes", () => {
    expect(assembleClaim(repairable, { action: "remove" })).toEqual({ text: null, outcome: "removed" });
    expect(assembleClaim(repairable, { action: "retain" })).toEqual({ text: "x", outcome: "kept" });
    expect(assembleClaim(repairable, { action: "correct", repair: { n: "63", w: "March" } })).toEqual({ text: "Of 63 in March.", outcome: "repaired" });
    expect(assembleClaim(repairable, { action: "correct", repair: { n: "48", w: "May" } })).toEqual({ text: "Of 48 in May.", outcome: "repairedWrong" });
    expect(assembleClaim({ ...base, repair: undefined }, { action: "correct" })).toEqual({ text: "x", outcome: "flagged" });
  });
});

describe("consequences", () => {
  it("follow flawed wording that reaches the reader, and not fixed wording", () => {
    expect(consequences([repairable], { c: { action: "retain" } })).toEqual(["kept outcome"]);
    expect(consequences([repairable], { c: { action: "correct", repair: { n: "48", w: "May" } } })).toEqual(["kept outcome"]);
    expect(consequences([repairable], { c: { action: "correct", repair: { n: "63", w: "March" } } })).toEqual([]);
  });

  it("follow removing something the reader needed, but not a defensible removal", () => {
    expect(consequences([repairable], { c: { action: "remove" } })).toEqual(["lost outcome"]);
    expect(consequences([{ ...repairable, defensibleActions: ["remove"] }], { c: { action: "remove" } })).toEqual([]);
    const sound: Claim = { ...repairable, status: "supported", bestAction: "retain" };
    expect(consequences([sound], { c: { action: "remove" } })).toEqual(["lost outcome"]);
    expect(consequences([sound], { c: { action: "retain" } })).toEqual([]);
  });
});

describe("gradeCalculation", () => {
  const calc: Claim = { ...base, calculation: { prompt: "p", min: 29, max: 32, explanation: "e" } };
  it("accepts a range, with or without a percent sign", () => {
    expect(gradeCalculation(calc, { calc: "31%" })).toBe(true);
    expect(gradeCalculation(calc, { calc: "50" })).toBe(false);
    expect(gradeCalculation(calc, { calc: "about" })).toBe(false);
    expect(gradeCalculation(base, {})).toBe(true);
  });
});

describe("calibrate", () => {
  it("compares first-read trust with what the evidence showed", () => {
    const sound: Claim = { ...base, id: "s", status: "supported" };
    const flawed: Claim = { ...base, id: "f" };
    const doubted: Claim = { ...base, id: "d", status: "supported" };
    expect(calibrate([sound, flawed, doubted], { s: "rely", f: "rely", d: "check" })).toEqual({ relied: 2, reliedThatFailed: 1, doubtedThatHeld: 1 });
  });
});
