import { describe, expect, it } from "vitest";
import { missions } from "./missions";
import { modules } from "./journey";
import { passwords } from "./passwords";
import type { Choice, Step } from "./types";

const REQUIRED_KINDS: Step["kind"][] = [
  "brief",
  "refresher",
  "initialJudgment",
  "revision",
  "transfer",
  "debrief",
];

const choicesOf = (s: Step): Choice[] =>
  "choices" in s ? s.choices : [];

describe.each(missions)("mission $id", (mission) => {
  it("contains every required step kind (PRD §6)", () => {
    const kinds = mission.steps.map((s) => s.kind);
    for (const k of REQUIRED_KINDS) expect(kinds).toContain(k);
    expect(kinds.some((k) => k === "quiz" || k === "openResponse")).toBe(true);
  });

  it("starts with the brief and ends with the debrief", () => {
    expect(mission.steps[0].kind).toBe("brief");
    expect(mission.steps.at(-1)?.kind).toBe("debrief");
  });

  it("has unique step ids and revision points at an existing step", () => {
    const ids = mission.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of mission.steps) if (s.kind === "revision") expect(ids).toContain(s.initialStepId);
  });

  it("explains every option and has a non-weaker option to choose", () => {
    for (const s of mission.steps) {
      const cs = choicesOf(s);
      for (const c of cs) expect(c.explanation.trim(), `${s.id}/${c.id}`).not.toBe("");
      if (cs.length && s.kind !== "revision") expect(cs.some((c) => c.verdict !== "weaker")).toBe(true);
    }
  });

  it("sort items point at real categories", () => {
    for (const s of mission.steps)
      if (s.kind === "sort") {
        const cats = s.categories.map((c) => c.id);
        for (const i of s.items) {
          expect(cats, i.id).toContain(i.categoryId);
          expect(i.explanation.trim(), i.id).not.toBe("");
        }
      }
  });

  it("toy model needs at least two training sets and a reachable minRuns", () => {
    for (const s of mission.steps)
      if (s.kind === "toyModel") {
        expect(s.corpora.length).toBeGreaterThanOrEqual(2);
        expect(s.minRuns).toBeLessThanOrEqual(s.corpora.length);
      }
  });

  it("gives open responses a rubric with at least two examples", () => {
    for (const s of mission.steps)
      if (s.kind === "openResponse") expect(s.rubric.examples.length).toBeGreaterThanOrEqual(2);
  });

  it("is registered in the journey and has a password", () => {
    expect(modules.some((m) => m.missionIds.includes(mission.id))).toBe(true);
    expect(passwords.some((p) => p.missionId === mission.id)).toBe(true);
  });
});

describe("registry consistency", () => {
  it("every mission id referenced by an available module has content", () => {
    const ids = new Set(missions.map((m) => m.id));
    for (const m of modules.filter((m) => m.status === "available"))
      for (const id of m.missionIds) expect(ids.has(id), id).toBe(true);
  });
});
