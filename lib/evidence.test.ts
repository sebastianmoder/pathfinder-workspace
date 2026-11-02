import { describe, expect, it } from "vitest";
import { assessSkill, mergeEvidence, type EvidenceLedger } from "./evidence";
import type { DebriefSkill } from "@/content/types";

const skill = (items: string[]): DebriefSkill => ({ id: "s", label: "Skill", kind: "action", items });
const record = (firstTry: boolean, extra: Partial<EvidenceLedger[string]> = {}) => ({
  firstTry,
  right: true,
  assisted: false,
  skipped: false,
  ...extra,
});

describe("mergeEvidence", () => {
  it("keeps the first attempt when a retry succeeds", () => {
    const first = mergeEvidence(undefined, { right: false });
    const second = mergeEvidence(first, { right: true });
    expect(second).toMatchObject({ firstTry: false, right: true });
  });

  it("remembers help once it has been used", () => {
    const first = mergeEvidence(undefined, { right: true, assisted: true });
    expect(mergeEvidence(first, { right: true }).assisted).toBe(true);
  });
});

describe("assessSkill", () => {
  it("does not credit work that never happened", () => {
    expect(assessSkill(skill(["a"]), {})).toEqual({ status: "review", reason: "notDone" });
    expect(assessSkill(skill(["a", "b"]), { a: record(true) })).toEqual({ status: "review", reason: "notDone" });
  });

  it("does not credit skipped work, even if the criteria were read", () => {
    expect(assessSkill(skill(["a"]), { a: record(false, { skipped: true }) })).toEqual({ status: "review", reason: "skipped" });
  });

  it("recognises work that was right first time", () => {
    expect(assessSkill(skill(["a", "b"]), { a: record(true), b: record(true) })).toEqual({ status: "shown", assisted: false });
  });

  it("allows an occasional slip across many items, but not a run of them", () => {
    const items = ["a", "b", "c", "d"];
    const ledger = (wrong: number): EvidenceLedger =>
      Object.fromEntries(items.map((id, i) => [id, record(i >= wrong)]));
    expect(assessSkill(skill(items), ledger(1)).status).toBe("shown");
    expect(assessSkill(skill(items), ledger(2))).toEqual({ status: "review", reason: "retries" });
  });

  it("notes help without treating it as failure", () => {
    expect(assessSkill(skill(["a"]), { a: record(true, { assisted: true }) })).toEqual({ status: "shown", assisted: true });
  });

  it("never presents a self-assessment as a checked result", () => {
    const ledger = { a: record(false, { selfAssessed: { met: 2, total: 3 } }) };
    expect(assessSkill(skill(["a"]), ledger)).toEqual({ status: "selfAssessed", met: 2, total: 3 });
  });
});
