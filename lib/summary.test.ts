import { describe, expect, it } from "vitest";
import { summarizeMission, summaryToText, type SummaryText } from "./summary";
import type { Mission } from "@/content/types";

const choices = [
  { id: "a", label: "First", verdict: "weaker" as const, explanation: "x" },
  { id: "b", label: "Second", verdict: "correct" as const, explanation: "x" },
];
const mission: Mission = {
  id: "m",
  title: "Mission",
  outcome: "",
  scenario: "",
  approxMinutes: 1,
  meta: { version: "1", reviewedOn: null, sourcesToReview: [] },
  steps: [
    { kind: "initialJudgment", id: "i", prompt: "q", choices },
    { kind: "revision", id: "r", initialStepId: "i", prompt: "q", choices },
    { kind: "debrief", id: "d", takeaway: "Take this", skills: ["Skill"], nextMissionId: null },
  ],
};

describe("summarizeMission", () => {
  it("leaves out missions this visit has not touched", () => {
    expect(summarizeMission(mission, { stepIndex: 0, answers: {} }, false)).toBeNull();
  });

  it("does not credit skills or takeaways before a mission is finished", () => {
    const s = summarizeMission(mission, { stepIndex: 1, answers: { i: { choiceId: "a", confidence: 3 } } }, false)!;
    expect(s.completed).toBe(false);
    expect(s.skills).toEqual([]);
    expect(s.takeaway).toBeNull();
    expect(s.before).toEqual({ label: "First", confidence: 3 });
    expect(s.after).toBeNull();
  });

  it("reports both judgments and the debrief once finished", () => {
    const s = summarizeMission(
      mission,
      { stepIndex: 2, answers: { i: { choiceId: "a", confidence: 3 }, r: { choiceId: "b", confidence: 1 } } },
      true,
    )!;
    expect(s.after).toEqual({ label: "Second", confidence: 1 });
    expect(s.skills).toEqual(["Skill"]);
    expect(s.takeaway).toBe("Take this");
  });
});

describe("summaryToText", () => {
  it("includes judgments and passwords, with no score", () => {
    const text = summaryToText({
      heading: "H",
      note: "N",
      startingPoint: [],
      startingPointLabel: "Start",
      missions: [summarizeMission(mission, { stepIndex: 2, answers: { i: { choiceId: "a", confidence: 0 } } }, true)!],
      labels: { takeaway: "T", skills: "S", before: "Before", after: "After", notFinished: "NF", passwords: "P" },
      confidenceLabels: ["Low"],
      passwords: [{ title: "Mission", code: "A-B-22" }],
    } satisfies SummaryText);
    expect(text).toContain("Before: First (Low)");
    expect(text).toContain("- Mission: A-B-22");
    expect(text).not.toMatch(/score/i);
  });
});
