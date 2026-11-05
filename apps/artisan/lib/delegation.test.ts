import { describe, expect, it } from "vitest";
import type { DelegationSpec, DelegationTask } from "@/content/types";
import { bestRole, carryNotes, delegationItems, delegationResults, isSound, wavesOf } from "./delegation";

const outcome = (verdict: "correct" | "defensible" | "weaker") => ({ verdict, event: "e", explanation: "x" });
const task = (id: string, best: "human" | "assisted" | "automated"): DelegationTask => ({
  id,
  from: "f",
  title: id,
  text: "t",
  responsible: "r",
  outcomes: {
    human: outcome(best === "human" ? "correct" : "weaker"),
    assisted: outcome(best === "assisted" ? "correct" : "defensible"),
    automated: outcome(best === "automated" ? "correct" : "weaker"),
  },
});
const spec: DelegationSpec = { later: "Later", tasks: [task("a", "human"), task("b", "automated")] };

describe("delegation", () => {
  it("finds the reviewed best role", () => {
    expect(bestRole(spec.tasks[0])).toBe("human");
    expect(bestRole(spec.tasks[1])).toBe("automated");
  });

  it("credits defensible choices as sound, and weaker ones not", () => {
    expect(isSound(spec.tasks[0], "assisted")).toBe(true);
    expect(isSound(spec.tasks[0], "automated")).toBe(false);
  });

  it("records one ledger item per task, noting hints as help rather than failure", () => {
    expect(delegationItems("desk", spec)).toEqual(["desk/a", "desk/b"]);
    expect(delegationResults("desk", spec, { a: "human", b: "human" }, ["b"])).toEqual([
      ["desk/a", { right: true, assisted: false }],
      ["desk/b", { right: false, assisted: true }],
    ]);
  });
});

describe("delegation waves", () => {
  it("sends everything at once without authored waves", () => {
    expect(wavesOf(spec)).toEqual([{ taskIds: ["a", "b"], later: "Later" }]);
  });

  it("records only the wave that was sent", () => {
    expect(delegationResults("d", spec, { a: "human", b: "human" }, [], ["b"])).toEqual([["d/b", { right: false, assisted: false }]]);
  });

  it("opens a later wave with what earlier choices set up, and nothing else", () => {
    const wave = { taskIds: ["b"], later: "", carry: [{ taskId: "a", roles: ["automated" as const], note: "fallout" }] };
    expect(carryNotes(wave, { a: "automated" })).toEqual(["fallout"]);
    expect(carryNotes(wave, { a: "human" })).toEqual([]);
    expect(carryNotes(wave, {})).toEqual([]);
  });
});
