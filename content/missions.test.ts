import { describe, expect, it } from "vitest";
import { missions } from "./missions";
import { modules } from "./journey";
import { passwords } from "./passwords";
import { hasCycle, reachableNodes } from "@/lib/dialogue";
import { buildModel, predict } from "@/lib/toy-model";
import type { AuditSpec, Choice, Step } from "./types";

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

const auditOf = (s: Step): AuditSpec | null => ("audit" in s ? s.audit : null);

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

  it("audits are internally consistent", () => {
    for (const s of mission.steps) {
      const audit = auditOf(s);
      if (!audit) continue;
      const passages = new Set(audit.sources.flatMap((src) => src.passages.map((p) => p.id)));
      const refs = audit.briefing.flat().flatMap((seg) => (typeof seg === "string" ? [] : [seg.claimId]));
      expect([...refs].sort()).toEqual(audit.claims.map((c) => c.id).sort()); // each claim appears exactly once
      for (const c of audit.claims) {
        for (const p of c.passageIds) expect(passages, `${c.id}/${p}`).toContain(p);
        for (const text of [c.evidenceExplanation, c.statusExplanation, c.actionExplanation])
          expect(text.trim(), c.id).not.toBe("");
        expect(c.defensibleActions ?? [], c.id).not.toContain(c.bestAction);
        expect(c.finalText === null, c.id).toBe(c.bestAction === "remove");
        if (c.status === "supported") expect(c.bestAction, c.id).toBe("retain");
        if (c.citationMismatch) expect(c.passageIds.length, c.id).toBeGreaterThan(0);
      }
    }
  });

  it("transfer audits give no hints, because support fades", () => {
    for (const s of mission.steps)
      if (s.kind === "transfer" && "audit" in s) for (const c of s.audit.claims) expect(c.hint, c.id).toBeUndefined();
  });

  it("revision re-asks the initial question, so the comparison means something", () => {
    for (const s of mission.steps)
      if (s.kind === "revision") {
        const initial = mission.steps.find((x) => x.id === s.initialStepId);
        expect(initial?.kind).toBe("initialJudgment");
        expect(s.choices.map((c) => c.id)).toEqual(choicesOf(initial!).map((c) => c.id));
        expect(s.prompt).toContain(initial && "prompt" in initial ? initial.prompt : "");
      }
  });

  it("scripted conversations can always be finished, and everything in them can be reached", () => {
    for (const s of mission.steps) {
      if (s.kind !== "dialogue") continue;
      const spec = s.dialogue;
      const ids = new Set(spec.nodes.map((n) => n.id));
      const speakers = new Set(spec.characters.map((c) => c.id));
      const discoveries = new Set(spec.discoveries.map((d) => d.id));
      expect(hasCycle(spec)).toBe(false);
      expect(reachableNodes(spec)).toEqual(ids);
      expect(ids.has(spec.start)).toBe(true);
      for (const start of Object.values(spec.starts)) expect(ids.has(start), start).toBe(true);
      expect(spec.nodes.some((n) => n.choices.length === 0)).toBe(true);
      for (const n of spec.nodes) {
        expect(speakers, n.id).toContain(n.speakerId);
        if (n.choices.length) {
          expect(n.choices.length, n.id).toBeGreaterThanOrEqual(2);
          expect(n.choices.length, n.id).toBeLessThanOrEqual(4);
        }
        for (const c of n.choices) {
          expect(ids.has(c.next), `${n.id}/${c.id}`).toBe(true);
          expect(c.note.trim(), `${n.id}/${c.id}`).not.toBe("");
        }
        for (const r of n.reveals ?? []) expect(discoveries, n.id).toContain(r);
      }
      const revealed = new Set(spec.nodes.flatMap((n) => n.reveals ?? []));
      expect(revealed).toEqual(discoveries);
      // Everything a character reveals must also be open to learners who take another path.
      const sourceTitles = s.sources.map((src) => src.title);
      for (const d of spec.discoveries) expect(sourceTitles, d.id).toContain(d.lookIn);
      // An opening exists for each position the learner can take.
      const initial = mission.steps.find((x) => x.id === s.initialStepId);
      for (const c of initial ? choicesOf(initial) : []) expect(spec.starts[c.id], c.id).toBeDefined();
    }
  });

  it("argument maps place every card somewhere that exists, with an explanation", () => {
    for (const s of mission.steps)
      if (s.kind === "argumentMap") {
        const slots = s.slots.map((x) => x.id);
        for (const c of s.cards) {
          expect(slots, c.id).toContain(c.slotId);
          for (const d of c.defensibleSlotIds ?? []) expect(slots, c.id).toContain(d);
          expect(c.explanation.trim(), c.id).not.toBe("");
        }
        for (const slot of slots) expect(s.cards.some((c) => c.slotId === slot), slot).toBe(true);
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

describe("M04 required case types (PRD §7)", () => {
  const m04 = missions.find((m) => m.id === "m04-evidence")!;
  const main = m04.steps.find((s) => s.kind === "claimAudit");
  const claims = main && "audit" in main ? main.audit.claims : [];

  it("covers every claim status, including correct claims", () => {
    expect(new Set(claims.map((c) => c.status))).toEqual(
      new Set(["supported", "unsupported", "outdated", "misleading", "incorrect"]),
    );
  });

  it("has a real citation that does not support its claim", () => {
    expect(claims.some((c) => c.citationMismatch)).toBe(true);
  });
});

describe("M01 toy model tells the story the mission tells", () => {
  const m01 = missions.find((m) => m.id === "m01-foundations")!;
  const toy = m01.steps.find((s) => s.kind === "toyModel");
  it.each([
    ["library", "nine"],
    ["shops", "eight"],
    ["night", "midnight"],
    ["closing", "six"],
  ])("%s training set predicts %s", (id, word) => {
    if (toy?.kind !== "toyModel") throw new Error("no toy step");
    const corpus = toy.corpora.find((c) => c.id === id)!;
    expect(predict(buildModel(corpus.sentences), toy.promptText).ranked[0].word).toBe(word);
  });
});

describe("review status (PRD §10, criterion 3)", () => {
  it("every available mission records a review, and who did it", () => {
    for (const id of modules.filter((m) => m.status === "available").flatMap((m) => m.missionIds)) {
      const meta = missions.find((m) => m.id === id)!.meta;
      expect(meta.reviewedOn, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(meta.reviewedBy, id).toBeTruthy();
    }
  });
});

describe("the pilot journey (PRD §10)", () => {
  it("runs M01, M04, M05, T01 through each debrief's recommendation", () => {
    const next = (id: string) => {
      const d = missions.find((m) => m.id === id)?.steps.at(-1);
      return d?.kind === "debrief" ? d.nextMissionId : undefined;
    };
    expect(next("m01-foundations")).toBe("m04-evidence");
    expect(next("m04-evidence")).toBe("m05-argument");
    expect(next("m05-argument")).toBe("t01-transfer");
    expect(next("t01-transfer")).toBeNull();
  });

  it("T01 uses its own source pack, separate from M04's", () => {
    const passagesOf = (id: string) =>
      missions
        .find((m) => m.id === id)!
        .steps.flatMap((s) => ("audit" in s ? s.audit.sources.flatMap((src) => src.passages.map((p) => p.text)) : []));
    const m04 = new Set(passagesOf("m04-evidence"));
    expect(passagesOf("t01-transfer").filter((p) => m04.has(p))).toEqual([]);
  });

  it("T01 covers supported, unsupported, misleading and incorrect claims", () => {
    const t01 = missions.find((m) => m.id === "t01-transfer")!;
    const statuses = new Set(t01.steps.flatMap((s) => ("audit" in s ? s.audit.claims.map((c) => c.status) : [])));
    for (const k of ["supported", "unsupported", "misleading", "incorrect"] as const) expect(statuses).toContain(k);
  });
});

describe("registry consistency", () => {
  it("every mission id referenced by an available module has content", () => {
    const ids = new Set(missions.map((m) => m.id));
    for (const m of modules.filter((m) => m.status === "available"))
      for (const id of m.missionIds) expect(ids.has(id), id).toBe(true);
  });
});
