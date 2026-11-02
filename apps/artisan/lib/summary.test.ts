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
    { kind: "debrief", id: "d", takeaway: "Take this", skills: [{ id: "s", label: "Skill", kind: "knowledge", items: ["r"] }], nextMissionId: null },
  ],
};

describe("summarizeMission", () => {
  it("leaves out missions this visit has not touched", () => {
    expect(summarizeMission(mission, { stepIndex: 0, answers: {}, evidence: {} }, false)).toBeNull();
  });

  it("does not credit skills or takeaways before a mission is finished", () => {
    const s = summarizeMission(mission, { stepIndex: 1, answers: { i: { choiceId: "a", confidence: 3 } }, evidence: {} }, false)!;
    expect(s.completed).toBe(false);
    expect(s.shown).toEqual([]);
    expect(s.review).toEqual([]);
    expect(s.takeaway).toBeNull();
    expect(s.before).toEqual({ label: "First", confidence: 3 });
    expect(s.after).toBeNull();
  });

  it("reports both judgments and the debrief once finished", () => {
    const s = summarizeMission(
      mission,
      {
        stepIndex: 2,
        answers: { i: { choiceId: "a", confidence: 3 }, r: { choiceId: "b", confidence: 1 } },
        evidence: { r: { firstTry: true, right: true, assisted: false, skipped: false } },
      },
      true,
    )!;
    expect(s.after).toEqual({ label: "Second", confidence: 1 });
    expect(s.shown).toEqual(["Skill"]);
    expect(s.takeaway).toBe("Take this");
  });

  it("does not credit a skill just because the mission was finished", () => {
    const s = summarizeMission(mission, { stepIndex: 2, answers: {}, evidence: {} }, true)!;
    expect(s.shown).toEqual([]);
    expect(s.review).toEqual(["Skill"]);
  });
});

describe("calibration", () => {
  const claim = { id: "c", text: "x", status: "misleading" as const, passageIds: [], bestAction: "qualify" as const, evidenceExplanation: "e", statusExplanation: "s", actionExplanation: "a", finalText: "y" };
  const audited: Mission = {
    ...mission,
    steps: [{ kind: "claimAudit", id: "a", title: "t", intro: "i", audit: { trustFirst: true, sources: [], briefing: [], claims: [claim] } }, ...mission.steps],
  };
  const input = (phase: string) => ({ stepIndex: 2, answers: {}, evidence: {}, stepState: { a: { phase, trust: { c: "rely" } } } });

  it("appears only once the audit is finished, so a half-done audit claims nothing", () => {
    expect(summarizeMission(audited, input("audit"), false)!.calibration).toBeNull();
    expect(summarizeMission(audited, input("final"), false)!.calibration).toEqual({ relied: 1, reliedThatFailed: 1, doubtedThatHeld: 0 });
  });
});

describe("summaryToText", () => {
  it("includes judgments and passwords, with no score", () => {
    const text = summaryToText({
      heading: "H",
      note: "N",
      startingPoint: [],
      startingPointLabel: "Start",
      missions: [summarizeMission(mission, { stepIndex: 2, answers: { i: { choiceId: "a", confidence: 0 } }, evidence: {} }, true)!],
      labels: { takeaway: "T", shown: "Shown", selfAssessed: "Self", review: "Review", calibration: "C", calibrationText: () => "", before: "Before", after: "After", notFinished: "NF", passwords: "P" },
      confidenceLabels: ["Low"],
      passwords: [{ title: "Mission", code: "A-B-22" }],
    } satisfies SummaryText);
    expect(text).toContain("Before: First (Low)");
    expect(text).toContain("- Mission: A-B-22");
    expect(text).toContain("Review: Skill");
    expect(text).not.toMatch(/score/i);
  });
});