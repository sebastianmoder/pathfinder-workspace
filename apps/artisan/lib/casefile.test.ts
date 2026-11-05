import { describe, expect, it } from "vitest";
import type { CasefileSpec } from "@/content/types";
import { canFollow, casefileItems, clockState, expectedStatus, latestMessage, timelineFor } from "./casefile";

const spec: CasefileSpec = {
  artifact: { label: "", title: "", body: "", meta: "" },
  leads: [
    { id: "a", label: "", kind: "check", description: "", finding: "", timeline: { order: 1, when: "2024", text: "old" } },
    { id: "b", label: "", kind: "record", description: "", finding: "" },
  ],
  timeline: [{ order: 5, when: "today", text: "posted" }],
  statements: [
    { id: "old", text: "", status: "known", leadIds: ["a"], explanation: "" },
    { id: "seen", text: "", status: "known", leadIds: [], explanation: "" },
    { id: "flood", text: "", status: "contradicted", leadIds: ["a", "b"], explanation: "" },
  ],
  keyLeads: ["a"],
};

describe("casefile", () => {
  it("expects 'uncertain' when the settling lead wasn't followed", () => {
    expect(expectedStatus(spec.statements[0], [])).toBe("uncertain");
    expect(expectedStatus(spec.statements[0], ["a"])).toBe("known");
    expect(expectedStatus(spec.statements[1], [])).toBe("known");
    expect(expectedStatus(spec.statements[2], ["b"])).toBe("contradicted");
  });

  it("builds the timeline in order from what was followed", () => {
    expect(timelineFor(spec, []).map((x) => x.text)).toEqual(["posted"]);
    expect(timelineFor(spec, ["a"]).map((x) => x.text)).toEqual(["old", "posted"]);
  });

  it("records key leads and statements", () => {
    expect(casefileItems("c", spec)).toEqual(["c/lead/a", "c/old", "c/seen", "c/flood"]);
  });
});

describe("a casefile clock", () => {
  const spec = {
    artifact: { label: "", title: "", body: "", meta: "" },
    clock: { start: "09:10", deadline: "10:00", note: "", pressures: [{ after: 20, text: "Where are we?" }, { after: 40, text: "Ten minutes." }] },
    leads: [
      { id: "a", label: "A", kind: "check" as const, description: "", finding: "", minutes: 15, pressure: "Rosa: looks real." },
      { id: "b", label: "B", kind: "check" as const, description: "", finding: "", minutes: 25 },
      { id: "c", label: "C", kind: "check" as const, description: "", finding: "", minutes: 20 },
    ],
    statements: [],
  };

  it("moves the clock by each lead's time, and closes leads that no longer fit", () => {
    expect(clockState(spec, [])).toMatchObject({ total: 50, left: 50, now: "09:10" });
    expect(clockState(spec, ["a", "b"])).toMatchObject({ used: 40, left: 10, now: "09:50" });
    expect(canFollow(spec, ["a", "b"], "c")).toBe(false);
    expect(canFollow(spec, ["a"], "c")).toBe(true);
    expect(canFollow(spec, ["a"], "a")).toBe(false);
  });

  it("shows the newest message, from a lead or from the clock", () => {
    expect(latestMessage(spec, [])).toBeUndefined();
    expect(latestMessage(spec, ["a"])).toBe("Rosa: looks real.");
    expect(latestMessage(spec, ["a", "c"])).toBe("Where are we?");
    expect(latestMessage(spec, ["a", "b"])).toBe("Ten minutes.");
  });
});
