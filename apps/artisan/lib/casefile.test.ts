import { describe, expect, it } from "vitest";
import type { CasefileSpec } from "@/content/types";
import { casefileItems, expectedStatus, timelineFor } from "./casefile";

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
