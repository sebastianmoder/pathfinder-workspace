import { describe, expect, it } from "vitest";
import type { DelegationSpec, DelegationTask } from "@/content/types";
import { bestRole, delegationItems, delegationResults, isSound } from "./delegation";

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
