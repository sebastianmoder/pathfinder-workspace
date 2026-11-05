import { describe, expect, it } from "vitest";
import type { Step } from "@/content/types";
import { activityKey, ownScreen, phasesOf } from "./phases";
import { missions } from "@/content/missions";

const s = (kind: string, extra: object = {}) => ({ kind, id: kind, ...extra }) as unknown as Step;

describe("phasesOf", () => {
  it("follows the mission's rhythm and never goes backwards", () => {
    const steps = [s("brief"), s("refresher"), s("initialJudgment"), s("dialogue"), s("revision"), s("quiz"), s("openResponse"), s("transfer"), s("openResponse"), s("debrief")];
    expect(phasesOf(steps)).toEqual(["start", "start", "start", "investigate", "rethink", "rethink", "rethink", "apply", "apply", "wrapUp"]);
  });

  it("gives every mission a start and a wrap-up", () => {
    for (const m of missions) {
      const phases = phasesOf(m.steps);
      expect(phases[0]).toBe("start");
      expect(phases.at(-1)).toBe("wrapUp");
    }
  });
});

describe("ownScreen", () => {
  it("folds a refresher that follows the brief into the brief's screen", () => {
    expect(ownScreen([s("brief"), s("refresher"), s("quiz")])).toEqual([true, false, true]);
    expect(ownScreen([s("brief"), s("quiz"), s("refresher")])).toEqual([true, true, true]);
  });
});

describe("activityKey", () => {
  it("treats a transfer as the activity it uses", () => {
    expect(activityKey(s("transfer", { audit: {} }))).toBe(activityKey(s("claimAudit", { audit: {} })));
    expect(activityKey(s("transfer", { mark: [], mode: "redact" }))).toBe(activityKey(s("mark", { mark: [], mode: "redact" })));
    expect(activityKey(s("transfer", { choices: [] }))).toBe(activityKey(s("quiz", { choices: [] })));
  });
});
