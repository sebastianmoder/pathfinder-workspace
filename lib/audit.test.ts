import { describe, expect, it } from "vitest";
import { gradeClaim, isComplete, NO_EVIDENCE } from "./audit";
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
