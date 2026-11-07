import { describe, expect, it } from "vitest";
import { missions } from "./missions";
import { modules } from "./journey";
import { hasCycle, reachableNodes } from "@/lib/dialogue";
import { fillRepair } from "@/lib/audit";
import { citeChoiceId, walk } from "@/lib/dialogue";
import { evidenceItems } from "@/lib/evidence";
import { clockState } from "@/lib/casefile";
import { segmentsOf } from "@/lib/mark";
import { askMachine, goalMet } from "@/lib/sandbox";
import { DELEGATION_ROLES, PROPOSAL, type Artefact, type AuditSpec, type EpilogueCondition, type Choice, type DelegationSpec, type Motif, type Step } from "./types";
import { bestRole } from "@/lib/delegation";
import { allMet } from "@/lib/compose";
import { barsFor, goalMet as chartGoalMet } from "@/lib/chart";
import { missedGap, outcomes, thresholdGoalMet, withinCapacity } from "@/lib/threshold";
import { runAll, startFailures } from "@/lib/workflow";
import { planResult, plansWithinBudget } from "@/lib/allocation";

const REQUIRED_KINDS: Step["kind"][] = ["brief", "refresher", "transfer", "debrief"];

const choicesOf = (s: Step): Choice[] =>
  "choices" in s ? s.choices : [];

const auditOf = (s: Step): AuditSpec | null => ("audit" in s ? s.audit : null);

/** Every multiple-choice question a mission asks, including practice questions and audit decisions. */
function choiceSets(mission: (typeof missions)[number]): [string, Choice[]][] {
  const sets: [string, Choice[]][] = [];
  for (const s of mission.steps) {
    const cs = choicesOf(s);
    if (cs.length) sets.push([s.id, cs]);
    if (s.kind === "debrief") for (const k of s.skills) if (k.practice) sets.push([`${s.id}/${k.id}`, k.practice.choices]);
    if ("problems" in s) for (const p of s.problems) if (p.choices) sets.push([`${s.id}/${p.id}`, p.choices]);
    if (s.kind === "openResponse" && s.drafts) sets.push([`${s.id}/drafts`, s.drafts]);
    const decision = auditOf(s)?.decision;
    if (decision) sets.push([`${s.id}/decision`, decision.choices]);
  }
  return sets;
}

/** What an activity can record as a fact, so a condition on it can be checked against real values. */
function factValues(s: Step, name: string): string[] | null {
  if (name === "plan" && "allocation" in s) return s.allocation.options.map((o) => o.id);
  if (name === "leads" && "casefile" in s) return s.casefile.leads.map((l) => l.id);
  if (name === "roles" && "delegation" in s) return s.delegation.tasks.flatMap((x) => DELEGATION_ROLES.map((r) => `${x.id}:${r}`));
  if (name === "arrangement" && "workflow" in s) return s.workflow.slots.flatMap((x) => x.options.map((o) => `${x.id}:${o.id}`));
  return null;
}

/** A condition (on an epilogue beat or a conditional step) names only choices, facts and results from earlier steps. */
function expectConditionRefersBack(c: EpilogueCondition, earlier: Step[], label: string) {
  if (c.choice) {
    const step = earlier.find((x) => x.id === c.choice!.step);
    const ids = step ? choicesOf(step).map((x) => x.id) : [];
    for (const id of c.choice.ids) expect(ids, `${label}: ${c.choice.step}/${id}`).toContain(id);
  }
  if (c.fact) {
    const [stepId, name] = c.fact.key.split("/");
    const step = earlier.find((x) => x.id === stepId);
    const values = step ? factValues(step, name) : null;
    expect(values, `${label}: ${c.fact.key} is recorded by an earlier step`).not.toBeNull();
    for (const v of [...(c.fact.all ?? []), ...(c.fact.any ?? []), ...(c.fact.none ?? [])]) expect(values, `${label}: ${v}`).toContain(v);
  }
  if (c.evidence) expect(new Set(earlier.flatMap(evidenceItems)).has(c.evidence.item), `${label}: ${c.evidence.item}`).toBe(true);
}

/** How much longer the one correct option is than the mean of the others, or null without exactly one. */
function correctLengthRatio(cs: Choice[]): number | null {
  const correct = cs.filter((c) => c.verdict === "correct");
  if (correct.length !== 1 || cs.length < 2) return null;
  const others = cs.filter((c) => c !== correct[0]);
  return correct[0].label.length / (others.reduce((n, c) => n + c.label.length, 0) / others.length);
}

describe.each(missions)("mission $id", (mission) => {
  it("contains every required step kind (PRD §6)", () => {
    const kinds = mission.steps.map((s) => s.kind);
    for (const k of REQUIRED_KINDS) expect(kinds).toContain(k);
    // The initial judgment and its revision can be a position re-asked, a new case on the same idea, or trust
    // compared with the evidence. C01 is one module in four chapters (PRD §7 C01): its first three chapters build
    // the case, and the judgment and revision come once, in the review meeting, so they don't repeat four times.
    const trustFirst = mission.steps.some((s) => auditOf(s)?.trustFirst);
    const capstoneChapter = /^c01-(scope|evidence|workflow)$/.test(mission.id);
    expect(trustFirst || capstoneChapter || (kinds.includes("initialJudgment") && kinds.includes("revision")), "judgment and revision").toBe(true);
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

  it("match boards pair one to one with real cards, and explain every pair", () => {
    for (const s of mission.steps)
      if (s.kind === "match") {
        const rights = s.right.map((r) => r.id);
        const targets = s.left.map((l) => l.matchId);
        expect(new Set(rights).size, s.id).toBe(rights.length);
        expect(new Set(s.left.map((l) => l.id)).size, s.id).toBe(s.left.length);
        expect(new Set(targets).size, `${s.id}: two cards share a partner`).toBe(targets.length);
        for (const l of s.left) {
          expect(rights, `${s.id}/${l.id}`).toContain(l.matchId);
          expect(l.explanation.trim(), `${s.id}/${l.id}`).not.toBe("");
        }
        expect(s.left.length, s.id).toBeGreaterThanOrEqual(3);
      }
  });

  it("rankings judge real cards, never accept every card at an end, and explain each card", () => {
    for (const s of mission.steps)
      if (s.kind === "rank") {
        const ids = s.items.map((i) => i.id);
        expect(new Set(ids).size, s.id).toBe(ids.length);
        expect(ids.length, s.id).toBeGreaterThanOrEqual(3);
        for (const id of [...s.first, ...(s.last ?? [])]) expect(ids, `${s.id}/${id}`).toContain(id);
        expect(s.first.length, s.id).toBeLessThan(ids.length);
        expect(s.first.filter((id) => s.last?.includes(id)), s.id).toEqual([]);
        for (const i of s.items) expect(i.explanation.trim(), `${s.id}/${i.id}`).not.toBe("");
      }
  });

  it("audits are internally consistent", () => {
    for (const s of mission.steps) {
      const audit = auditOf(s);
      if (!audit) continue;
      const passages = new Set(audit.sources.flatMap((src) => src.passages.map((p) => p.id)));
      const refs = audit.briefing.flat().flatMap((seg) => (typeof seg !== "string" && "claimId" in seg ? [seg.claimId] : []));
      const decoyRefs = audit.briefing.flat().flatMap((seg) => (typeof seg !== "string" && "decoyId" in seg ? [seg.decoyId] : []));
      expect([...decoyRefs].sort()).toEqual((audit.decoys ?? []).map((d) => d.id).sort());
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

  it("a repair, filled in with its first accepted values, is the reviewed wording", () => {
    for (const s of mission.steps) {
      for (const c of auditOf(s)?.claims ?? []) {
        if (!c.repair) continue;
        const entries = Object.fromEntries(c.repair.flatMap((p) => (typeof p === "string" ? [] : [[p.id, p.accept[0]]])));
        expect(fillRepair(c, entries), c.id).toBe(c.finalText);
        expect(["qualify", "correct"], c.id).toContain(c.bestAction);
        for (const p of c.repair) if (typeof p !== "string" && p.options) expect(p.options, c.id).toContain(p.accept[0]);
      }
    }
  });

  it("every claim that should change has a repair, and a calculation accepts its own answer", () => {
    for (const s of mission.steps) {
      for (const c of auditOf(s)?.claims ?? []) {
        if (c.bestAction === "qualify" || c.bestAction === "correct") expect(c.repair, c.id).toBeDefined();
        if (c.calculation) expect(c.calculation.min, c.id).toBeLessThan(c.calculation.max);
      }
    }
  });

  it("every claim has an outcome to follow from it", () => {
    for (const s of mission.steps) {
      for (const c of auditOf(s)?.claims ?? []) {
        if (c.status === "supported") expect(c.ifLost, c.id).toBeTruthy();
        else expect(c.ifKept, c.id).toBeTruthy();
      }
    }
  });

  it("marking tasks have something to find and something to leave", () => {
    for (const s of mission.steps) {
      if (!("mark" in s)) continue;
      const segments = segmentsOf(s.mark);
      expect(segments.some((x) => x.target && !x.optional), s.id).toBe(true);
      expect(segments.some((x) => !x.target && !x.optional), s.id).toBe(true);
      for (const x of segments) expect(x.explanation.trim(), x.id).not.toBe("");
    }
  });

  it("independent audits have decoys, because finding claims needs something to leave out", () => {
    for (const s of mission.steps) {
      const audit = auditOf(s);
      if (audit?.support === "independent") expect(audit.decoys?.length, s.id).toBeGreaterThan(0);
      if (audit?.support === "independent") expect(audit.claims.some((c) => c.status === "supported"), s.id).toBe(true);
    }
  });

  it("rubric samples are rated against real criteria, with one strong and one weak answer", () => {
    for (const s of mission.steps) {
      if (s.kind !== "openResponse" || !s.rubric.samples) continue;
      const criteria = s.rubric.criteria.map((c) => c.id);
      for (const sample of s.rubric.samples) for (const m of sample.met) expect(criteria, sample.id).toContain(m);
      expect(s.rubric.samples.some((x) => x.met.length === criteria.length), s.id).toBe(true);
      expect(s.rubric.samples.some((x) => x.met.length < criteria.length), s.id).toBe(true);
    }
  });

  it("transfer audits give no hints, because support fades", () => {
    for (const s of mission.steps)
      if (s.kind === "transfer" && "audit" in s) for (const c of s.audit.claims) expect(c.hint, c.id).toBeUndefined();
  });

  it("revision tests the initial idea on a new case, or re-asks a position as it was", () => {
    for (const s of mission.steps)
      if (s.kind === "revision") {
        const initial = mission.steps.find((x) => x.id === s.initialStepId);
        expect(initial?.kind).toBe("initialJudgment");
        if (initial?.kind !== "initialJudgment") continue;
        // A position (every option defensible) is re-asked, so a changed mind shows. A question comes back as a
        // new case, because re-asking it only tests whether the learner remembers the explanation.
        const position = initial.choices.every((c) => c.verdict !== "weaker");
        if (position) {
          expect(s.choices.map((c) => c.id)).toEqual(initial.choices.map((c) => c.id));
          expect(s.prompt).toContain(initial.prompt);
        } else {
          expect(s.prompt, s.id).not.toContain(initial.prompt);
          expect(s.choices.filter((c) => c.verdict === "correct"), s.id).toHaveLength(1);
        }
        expect(!!s.withConfidence, "confidence is asked at both ends or neither").toBe(!!initial.withConfidence);
      }
  });

  it("doesn't give away the sound answer by its length", () => {
    for (const [id, cs] of choiceSets(mission)) {
      const ratio = correctLengthRatio(cs);
      if (ratio !== null) expect(ratio, `${id} (correct option ${ratio.toFixed(2)}× the others)`).toBeLessThanOrEqual(1.4);
    }
  });

  it("artefacts describe every drawing, and framed outputs place parts that exist", () => {
    const artefacts: Artefact[] = [];
    for (const s of mission.steps) {
      if ("artefact" in s && s.artefact) artefacts.push(s.artefact);
      if ("casefile" in s) {
        if (s.casefile.artefact) artefacts.push(s.casefile.artefact);
        for (const l of s.casefile.leads) if (l.artefact) artefacts.push(l.artefact);
      }
      if ("compose" in s) {
        for (const e of s.compose.elements) for (const o of e.options) if (o.scene) expect(o.alt?.trim(), `${s.id}: ${o.id} image`).toBeTruthy();
      }
      if ("compose" in s && s.compose.frame) {
        const ids = s.compose.elements.map((e) => e.id);
        const f = s.compose.frame;
        for (const id of [f.kind === "poster" ? f.headline : undefined, "image" in f ? f.image : undefined, "footer" in f ? f.footer : undefined]) {
          if (id) expect(ids, `${s.id}: frame names ${id}`).toContain(id);
        }
      }
    }
    for (const a of artefacts) {
      if ((a.kind === "post" || a.kind === "article") && a.scene) expect(a.alt?.trim(), `${a.kind} drawing`).toBeTruthy();
      if (a.kind === "photo") expect(a.alt.trim()).toBeTruthy();
      if (a.kind === "chat") expect(a.messages.length).toBeGreaterThan(0);
    }
  });

  it("epilogues always show something, and conditions only refer to what an earlier step records", () => {
    mission.steps.forEach((s, index) => {
      const earlier = mission.steps.slice(0, index);
      if (s.showIf) expectConditionRefersBack(s.showIf, earlier, `${s.id} (showIf)`);
      if (s.kind !== "epilogue") return;
      for (const line of s.lines) {
        expect(line.beats.length, line.id).toBeGreaterThan(0);
        expect(line.beats.at(-1)!.when, `${line.id}: the last beat is the default`).toBeUndefined();
        for (const beat of line.beats) if (beat.when) expectConditionRefersBack(beat.when, earlier, line.id);
      }
    });
  });

  it("open-response formats have what they need", () => {
    for (const s of mission.steps) {
      if (s.kind !== "openResponse") continue;
      if (s.format === "structured") expect(s.fields?.length ?? 0, s.id).toBeGreaterThanOrEqual(2);
      if (s.format === "pickImprove") {
        const drafts = s.drafts ?? [];
        expect(drafts.filter((d) => d.verdict === "correct"), s.id).toHaveLength(1);
        expect(drafts.some((d) => d.verdict === "weaker"), s.id).toBe(true);
        for (const d of drafts) expect(d.explanation.trim(), `${s.id}/${d.id}`).not.toBe("");
        expect(s.improvePrompt?.trim(), s.id).toBeTruthy();
        // The chosen draft is the starting point, so it should still leave something to improve.
        expect(s.rubric.samples, "the drafts are the practice").toBeUndefined();
      }
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
      const passages = new Set(s.sources.flatMap((src) => src.passages.map((p) => p.id)));
      for (const n of spec.nodes) {
        for (const r of n.cite?.responses ?? []) {
          expect(ids.has(r.next), n.id).toBe(true);
          for (const p of r.passageIds) expect(passages, n.id).toContain(p);
        }
        if (n.cite) expect(ids.has(n.cite.otherwise.next), n.id).toBe(true);
      }
      for (const q of spec.boardQuestions ?? []) expect(discoveries, q.question).toContain(q.discoveryId);
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

  it("argument maps connect real cards to real targets", () => {
    for (const s of mission.steps)
      if (s.kind === "argumentMap") {
        const cards = s.cards.map((c) => c.id);
        const reasons = s.cards.filter((c) => c.slotId === "reason").map((c) => c.id);
        for (const l of s.links) {
          expect(cards, l.cardId).toContain(l.cardId);
          for (const target of [l.targetId, ...(l.defensibleTargetIds ?? [])]) expect([...reasons, PROPOSAL], l.cardId).toContain(target);
        }
        expect(mission.steps.map((x) => x.id)).toContain(s.initialStepId);
        expect(mission.steps.find((x) => x.id === s.dialogueStepId)?.kind).toBe("dialogue");
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

  it("delegation waves send every task exactly once, and carry only what earlier waves set up", () => {
    for (const s of mission.steps) {
      if (!("delegation" in s) || !s.delegation.waves) continue;
      const ids = s.delegation.tasks.map((x) => x.id);
      const waved = s.delegation.waves.flatMap((w) => w.taskIds);
      expect([...waved].sort(), s.id).toEqual([...ids].sort());
      s.delegation.waves.forEach((w, i) => {
        const earlier = s.delegation.waves!.slice(0, i).flatMap((x) => x.taskIds);
        for (const c of w.carry ?? []) {
          expect(earlier, `${s.id}: ${c.taskId} is sent before it is carried`).toContain(c.taskId);
          for (const r of c.roles) expect(DELEGATION_ROLES).toContain(r);
        }
      });
    }
  });

  it("delegation tasks have one best role, every outcome explained, and support that matches the desk", () => {
    for (const s of mission.steps) {
      const spec: DelegationSpec | null = "delegation" in s ? s.delegation : null;
      if (!spec) continue;
      const ids = spec.tasks.map((x) => x.id);
      expect(new Set(ids).size, s.id).toBe(ids.length);
      for (const task of spec.tasks) {
        const verdicts = DELEGATION_ROLES.map((r) => task.outcomes[r].verdict);
        expect(verdicts.filter((v) => v === "correct"), task.id).toHaveLength(1);
        for (const r of DELEGATION_ROLES) {
          expect(task.outcomes[r].event.trim(), `${task.id}/${r}`).not.toBe("");
          expect(task.outcomes[r].explanation.trim(), `${task.id}/${r}`).not.toBe("");
        }
        expect(task.responsible.trim(), task.id).not.toBe("");
        if (spec.support === "independent") {
          expect(task.factors, task.id).toBeUndefined();
          expect(task.hint, task.id).toBeUndefined();
        } else {
          expect(task.factors, task.id).toBeDefined();
          expect(task.hint, task.id).toBeTruthy();
        }
      }
      // A case where not using AI is right is part of what M02 assesses, in the main desk and the transfer.
      expect(spec.tasks.some((x) => bestRole(x) === "human"), s.id).toBe(true);
    }
  });

  it("compose workspaces refer to real options, and every round can be finished", () => {
    for (const s of mission.steps) {
      if (!("compose" in s)) continue;
      const spec = s.compose;
      const options = new Map(spec.elements.map((e) => [e.id, e.options.map((o) => o.id)]));
      const valid = (choices: Record<string, string>, where: string) => {
        expect(Object.keys(choices).sort(), where).toEqual([...options.keys()].sort());
        for (const [e, o] of Object.entries(choices)) expect(options.get(e), `${where}: ${e}`).toContain(o);
      };
      valid(spec.start, `${s.id} start`);
      for (const id of spec.outputOrder ?? []) expect(options.has(id), id).toBe(true);
      for (const e of spec.elements) expect(new Set(e.options.map((o) => o.id)).size, e.id).toBe(e.options.length);
      for (const r of spec.rounds) {
        valid(r.solution, `${s.id}/${r.id} solution`);
        expect(allMet(r.criteria, r.solution), r.id).toBe(true);
        expect(allMet(r.criteria, spec.start), `${r.id} must need some work`).toBe(false);
        for (const c of r.criteria) {
          expect(c.requires || c.anyOf, `${r.id}/${c.id} needs a rule`).toBeTruthy();
          for (const set of [c.requires ?? {}, ...(c.anyOf ?? [])])
            for (const [e, os] of Object.entries(set)) for (const o of os) expect(options.get(e), `${r.id}/${c.id}`).toContain(o);
        }
      }
    }
  });

  it("chart labs compute every view, and every task can be done and isn't done already", () => {
    for (const s of mission.steps) {
      if (s.kind !== "chartLab") continue;
      const c = s.chart;
      const cats = c.categories.map((x) => x.id);
      for (const q of c.quantities) expect(Object.keys(q.values).sort(), q.id).toEqual([...cats].sort());
      for (const m of c.measures) {
        expect(c.quantities.map((q) => q.id), m.id).toContain(m.numerator);
        if (m.denominator) {
          const d = c.quantities.find((q) => q.id === m.denominator)!;
          for (const v of Object.values(d.values)) expect(v, m.id).toBeGreaterThan(0);
        }
      }
      for (const r of c.ranges) for (const id of r.categoryIds) expect(cats, r.id).toContain(id);
      const views = [c.start, ...c.tasks.map((x) => x.solution)];
      for (const v of views) {
        expect(c.measures.map((m) => m.id)).toContain(v.measure);
        expect(c.baselines.map((b) => b.id)).toContain(v.baseline);
        expect(c.ranges.map((r) => r.id)).toContain(v.range);
        for (const bar of barsFor(c, v)) expect(Number.isFinite(bar.value), bar.id).toBe(true);
      }
      for (const task of c.tasks) {
        expect(chartGoalMet(task.goal, task.solution, c), task.id).toBe(true);
        expect(chartGoalMet(task.goal, c.start, c), task.id).toBe(false);
      }
      // A figure the learner can move stays inside its stated range, starting and solved.
      if (c.adjustable) {
        const a = c.adjustable;
        expect(c.quantities.map((q) => q.id)).toContain(a.quantity);
        expect(cats).toContain(a.category);
        for (const v of views) if (v.adjust !== undefined) expect(v.adjust >= a.min && v.adjust <= a.max, `adjust ${v.adjust}`).toBe(true);
        expect(c.tasks.some((x) => x.adjust), "some task shows the adjustable figure").toBe(true);
      }
    }
  });

  it("gym problems have one right answer, explain every option, and offer help that leaves the thinking to the learner", () => {
    for (const s of mission.steps) {
      if (!("problems" in s)) continue;
      for (const p of s.problems) {
        // Either options or a number to work out, never both.
        expect(!!p.choices !== !!p.numeric, `${p.id}: choices or numeric`).toBe(true);
        if (p.choices) {
          expect(p.choices.filter((c) => c.verdict === "correct"), p.id).toHaveLength(1);
          for (const c of p.choices) expect(c.explanation.trim(), `${p.id}/${c.id}`).not.toBe("");
        }
        if (p.numeric) {
          expect(p.numeric.min, p.id).toBeLessThanOrEqual(p.numeric.max);
          expect(p.numeric.explanation.trim(), p.id).not.toBe("");
        }
        // A transfer offers no help at all, because support fades; a gym offers it.
        if (s.kind === "transfer") {
          expect(p.helps, `${p.id}: a transfer is unaided`).toEqual([]);
          continue;
        }
        expect(new Set(p.helps.map((h) => h.id)).size, p.id).toBe(p.helps.length);
        for (const h of p.helps) expect(h.provides.trim(), `${p.id}/${h.id}`).not.toBe("");
        expect(p.helps.some((h) => !h.givesAnswer), p.id).toBe(true);
        expect(p.helps.some((h) => h.givesAnswer), `${p.id}: nobody gets stuck`).toBe(true);
      }
    }
  });

  it("casefiles point at real leads, can't all be followed when time is short, and include honest uncertainty", () => {
    for (const s of mission.steps) {
      const spec = "casefile" in s ? s.casefile : null;
      if (!spec) continue;
      const leads = spec.leads.map((l) => l.id);
      expect(new Set(leads).size, s.id).toBe(leads.length);
      for (const id of spec.keyLeads ?? []) expect(leads, s.id).toContain(id);
      for (const st of spec.statements) {
        for (const id of st.leadIds) expect(leads, `${s.id}/${st.id}`).toContain(id);
        expect(st.explanation.trim(), st.id).not.toBe("");
        if (st.status === "uncertain") expect(st.leadIds, `${st.id}: nothing settles an uncertain statement`).toEqual([]);
      }
      expect(spec.statements.some((st) => st.status === "uncertain"), s.id).toBe(true);
      expect(spec.statements.some((st) => st.leadIds.length > 0), s.id).toBe(true);
      if (spec.budget) {
        expect(spec.budget.leads, s.id).toBeLessThan(spec.leads.length);
        expect(spec.budget.leads, `${s.id}: key leads must fit the budget`).toBeGreaterThanOrEqual((spec.keyLeads ?? []).length);
      }
      if (spec.clock) {
        const clock = clockState(spec, [])!;
        const minutes = (ids: string[]) => spec.leads.filter((l) => ids.includes(l.id)).reduce((n, l) => n + (l.minutes ?? 0), 0);
        for (const l of spec.leads) expect(l.minutes, `${l.id} takes some time`).toBeGreaterThan(0);
        expect(minutes(leads), `${s.id}: not everything fits before the deadline`).toBeGreaterThan(clock.total);
        expect(minutes(spec.keyLeads ?? []), `${s.id}: the key leads fit`).toBeLessThanOrEqual(clock.total);
        for (const p of spec.clock.pressures ?? []) expect(p.after, p.text).toBeLessThan(clock.total);
      }
      const orders = [...(spec.timeline ?? []), ...spec.leads.flatMap((l) => (l.timeline ? [l.timeline] : []))].map((e) => e.order);
      expect(new Set(orders).size, s.id).toBe(orders.length);
    }
  });

  it("threshold labs give every applicant a score in every version, and every task can be done", () => {
    for (const s of mission.steps) {
      if (s.kind !== "thresholdLab") continue;
      const lab = s.lab;
      const groups = lab.groups.map((g) => g.id);
      for (const a of lab.applicants) {
        expect(groups, a.id).toContain(a.group);
        for (const v of lab.versions) {
          expect(a.scores[v.id], `${a.id}/${v.id}`).toBeGreaterThanOrEqual(lab.range.min);
          expect(a.scores[v.id], `${a.id}/${v.id}`).toBeLessThanOrEqual(lab.range.max);
        }
      }
      for (const task of lab.tasks) {
        expect(thresholdGoalMet(lab, task.goal, task.solution), task.id).toBe(true);
        expect(thresholdGoalMet(lab, task.goal, lab.start), task.id).toBe(false);
      }
    }
  });

  it("workflows fail at the start, pass with the reviewed arrangement, and each failure points at a real step", () => {
    for (const s of mission.steps) {
      const spec = "workflow" in s ? s.workflow : null;
      if (!spec) continue;
      const slots = new Map(spec.slots.map((x) => [x.id, x.options.map((o) => o.id)]));
      for (const arrangement of [spec.start, spec.solution])
        for (const [slot, option] of Object.entries(arrangement)) expect(slots.get(slot), `${s.id}/${slot}`).toContain(option);
      for (const test of spec.tests)
        for (const f of test.failsWhen) for (const o of f.options) expect(slots.get(f.slot), `${test.id}/${f.slot}`).toContain(o);
      expect(runAll(spec, spec.solution).every((r) => r.passed), s.id).toBe(true);
      expect(startFailures(spec).length, s.id).toBeGreaterThan(0);
      // Every step that can fail matters to some test, so no choice is decoration.
      for (const slot of spec.slots) expect(spec.tests.some((test) => test.failsWhen.some((f) => f.slot === slot.id)), slot.id).toBe(true);
    }
  });

  it("allocations allow more than one sound plan, and no single option covers everything essential", () => {
    for (const s of mission.steps) {
      const spec = "allocation" in s ? s.allocation : null;
      if (!spec) continue;
      const concerns = spec.concerns.map((c) => c.id);
      for (const o of spec.options) {
        for (const c of o.addresses) expect(concerns, o.id).toContain(c);
        expect(o.note.trim(), o.id).not.toBe("");
      }
      for (const c of spec.concerns) {
        expect(spec.options.some((o) => o.addresses.includes(c.id)), `${c.id} can be covered`).toBe(true);
        expect(c.why.trim(), c.id).not.toBe("");
      }
      const sound = plansWithinBudget(spec).filter((p) => planResult(spec, p).right);
      expect(sound.length, `${s.id}: several defensible plans (PRD M13)`).toBeGreaterThanOrEqual(2);
      expect(planResult(spec, spec.options.map((o) => o.id)).right, `${s.id}: choosing everything must not fit`).toBe(false);
      for (const o of spec.options) expect(planResult(spec, [o.id]).right, o.id).toBe(false);
    }
  });

  it("fault traces point at real stages, with an explanation", () => {
    for (const s of mission.steps)
      if (s.kind === "faultTrace") {
        const stages = s.stages.map((x) => x.id);
        for (const c of s.cases) {
          expect(stages, c.id).toContain(c.stageId);
          expect(c.explanation.trim(), c.id).not.toBe("");
        }
      }
  });

  it("every debrief skill rests on work this mission can actually record", () => {
    const debrief = mission.steps.at(-1);
    if (debrief?.kind !== "debrief") throw new Error("no debrief");
    const possible = new Set(mission.steps.flatMap(evidenceItems));
    expect(debrief.skills.length).toBeGreaterThan(0);
    expect(new Set(debrief.skills.map((s) => s.id)).size).toBe(debrief.skills.length);
    for (const skill of debrief.skills) {
      expect(skill.items.length, skill.id).toBeGreaterThan(0);
      for (const item of skill.items) expect(possible, `${skill.id}: ${item}`).toContain(item);
      for (const c of skill.practice?.choices ?? []) expect(c.explanation.trim(), `${skill.id}/${c.id}`).not.toBe("");
      if (skill.practice) expect(skill.practice.choices.some((c) => c.verdict === "correct"), skill.id).toBe(true);
    }
  });

  it("an open response's earlier reason comes from a real audit claim that asks for one", () => {
    for (const s of mission.steps)
      if (s.kind === "openResponse" && s.priorReason) {
        const { stepId, claimId } = s.priorReason;
        const source = mission.steps.find((x) => x.id === stepId);
        const audit = source ? auditOf(source) : null;
        expect(audit?.reasonPrompt, s.id).toBeTruthy();
        expect(audit?.claims.map((c) => c.id), s.id).toContain(claimId);
      }
  });

  it("an open response's earlier version comes from an earlier open response", () => {
    for (const [i, s] of mission.steps.entries())
      if (s.kind === "openResponse" && s.priorResponse) {
        const at = mission.steps.findIndex((x) => x.id === s.priorResponse);
        expect(at, s.id).toBeGreaterThanOrEqual(0);
        expect(at, s.id).toBeLessThan(i);
        expect(mission.steps[at].kind, s.id).toBe("openResponse");
      }
  });

  it("gives open responses a rubric with at least two examples", () => {
    for (const s of mission.steps)
      if (s.kind === "openResponse") expect(s.rubric.examples.length).toBeGreaterThanOrEqual(2);
  });

  it("is registered in the journey", () => {
    expect(modules.some((m) => m.missionIds.includes(mission.id))).toBe(true);
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

describe("M05 conversation", () => {
  const m05 = missions.find((m) => m.id === "m05-argument")!;
  const step = m05.steps.find((s) => s.kind === "dialogue");
  if (step?.kind !== "dialogue") throw new Error("no dialogue");
  const spec = step.dialogue;

  /** Every path, from every opening, following the moves actually on offer. */
  function allPaths(): string[][] {
    const out: string[][] = [];
    for (const start of Object.values(spec.starts)) {
      const go = (choices: string[]) => {
        const path = walk(spec, start, choices);
        if (path.ended) out.push(choices);
        for (const c of path.options) go([...choices, c.id]);
      };
      go([]);
    }
    return out;
  }
  const finish = (choices: string[], start = spec.start) => walk(spec, start, choices);

  it("every path finishes, and passes both of Rafael's closing claims", () => {
    const paths = allPaths();
    expect(paths.length).toBeGreaterThan(10);
    for (const choices of paths) {
      for (const start of Object.values(spec.starts)) {
        const path = finish(choices, start);
        if (!path.ended) continue;
        const scored = path.turns.flatMap((t) => (t.choice?.scored ? [t.choice.scored.item] : []));
        expect(scored, choices.join(">")).toEqual(["misquote", "concede"]);
      }
    }
  });

  it("the budget forces a trade-off, while leaving the debrief's threshold reachable from every opening", () => {
    const best = (start: string) => {
      const counts: number[] = [];
      const go = (choices: string[]) => {
        const path = walk(spec, start, choices);
        if (path.ended) counts.push(path.discovered.length);
        for (const c of path.options) go([...choices, c.id]);
      };
      go([]);
      return Math.max(...counts);
    };
    for (const start of Object.values(spec.starts)) expect(best(start), start).toBeGreaterThanOrEqual(3);
    // Rafael gives an "adopt" learner the error finding in his opening. Anyone else has to choose.
    expect(best(spec.starts.pilot)).toBeLessThan(spec.discoveries.length);
    expect(best(spec.starts.reject)).toBeLessThan(spec.discoveries.length);
  });

  it("only the right passage catches the misquote", () => {
    const toMisquote = ["concede", "condition"];
    const right = finish([...toMisquote, citeChoiceId("eastfield-result")]);
    const wrong = finish([...toMisquote, citeChoiceId("brochure-claim")]);
    expect(right.turns.at(-2)?.choice?.scored).toEqual({ item: "misquote", right: true });
    expect(wrong.turns.at(-2)?.choice?.scored).toEqual({ item: "misquote", right: false });
  });

  it("Rafael's claims say what the sources do and don't support", () => {
    const passage = (id: string) => step.sources.flatMap((s) => s.passages).find((p) => p.id === id)!.text;
    expect(passage("eastfield-result")).not.toContain("40%");
    expect(passage("brochure-claim")).toContain("40%");
    expect(passage("brochure-price")).toContain("€6,000");
    expect(passage("budget-amount")).toContain("€12,000");
  });
});

describe("M02 desk rewards reliance as well as caution (PRD §4)", () => {
  const m02 = missions.find((m) => m.id === "m02-delegation")!;
  const desk = m02.steps.find((s) => s.kind === "delegation");
  const transfer = m02.steps.find((s) => s.kind === "transfer");
  if (desk?.kind !== "delegation" || !transfer || !("delegation" in transfer)) throw new Error("no desks");

  it("makes every role the best fit for at least one main task, and no role dominant", () => {
    const best = desk.delegation.tasks.map(bestRole);
    for (const r of DELEGATION_ROLES) expect(best.filter((b) => b === r).length, r).toBeGreaterThanOrEqual(1);
    for (const r of DELEGATION_ROLES) expect(best.filter((b) => b === r).length, r).toBeLessThanOrEqual(best.length / 2);
  });

  it("keeps AI out of a task without that being right every time", () => {
    const humanWeaker = desk.delegation.tasks.some((x) => x.outcomes.human.verdict === "weaker");
    expect(humanWeaker).toBe(true);
  });

  it("covers every role in the transfer, which is fresh rather than a copy of the main desk", () => {
    expect(new Set(transfer.delegation.tasks.map(bestRole))).toEqual(new Set(DELEGATION_ROLES));
    const mainTexts = new Set(desk.delegation.tasks.map((x) => x.text));
    for (const x of transfer.delegation.tasks) expect(mainTexts.has(x.text), x.id).toBe(false);
  });
});

describe("M06 teach-back", () => {
  const m = missions.find((x) => x.id === "m06-teach")!;
  const step = m.steps.find((s) => s.kind === "dialogue");
  if (step?.kind !== "dialogue") throw new Error("no dialogue");
  const spec = step.dialogue;

  it("every path records the opening move and the hand-back once each, and some path uncovers everything", () => {
    const ends: string[][] = [];
    const go = (choices: string[]) => {
      const path = walk(spec, spec.start, choices);
      if (path.ended) ends.push(choices);
      const moves = [...path.options.map((c) => c.id), ...(path.canCite ? step.sources.flatMap((s) => s.passages.map((p) => citeChoiceId(p.id))) : [])];
      for (const id of moves) go([...choices, id]);
    };
    go([]);
    expect(ends.length).toBeGreaterThan(10);
    let best = 0;
    for (const choices of ends) {
      const path = walk(spec, spec.start, choices);
      const scored = path.turns.flatMap((t) => (t.choice?.scored ? [t.choice.scored.item] : []));
      expect(scored.sort(), choices.join(">")).toEqual(["diagnose", "handback"]);
      best = Math.max(best, path.discovered.length);
    }
    expect(best).toBe(spec.discoveries.length);
  });
});

describe("M09 data tells the story the mission tells", () => {
  const m09 = missions.find((m) => m.id === "m09-fairness")!;
  const step = m09.steps.find((s) => s.kind === "thresholdLab");
  if (step?.kind !== "thresholdLab") throw new Error("no lab");
  const lab = step.lab;
  const settings = (version: string) =>
    Array.from({ length: lab.range.max - lab.range.min + 1 }, (_, i) => ({ version, threshold: lab.range.min + i })).filter((v) =>
      withinCapacity(lab, outcomes(lab, v)),
    );

  it("no threshold on the original score closes the gap within capacity", () => {
    const orig = settings("original");
    expect(orig.length).toBeGreaterThan(0);
    for (const v of orig) expect(missedGap(outcomes(lab, v)), String(v.threshold)).toBeGreaterThanOrEqual(3);
  });

  it("the revised score can, and selects no more unqualified applicants than the original does", () => {
    const fair = settings("revised").filter((v) => missedGap(outcomes(lab, v)) <= 1);
    expect(fair.length).toBeGreaterThan(0);
    const wrong = (v: { version: string; threshold: number }) => outcomes(lab, v).reduce((n, g) => n + g.wrongPicks, 0);
    const bestOriginal = Math.min(...settings("original").map(wrong));
    for (const v of fair) expect(wrong(v)).toBeLessThanOrEqual(bestOriginal);
  });

  it("both groups have the same number of qualified applicants, so the gap isn't a difference in ability", () => {
    const [a, b] = outcomes(lab, lab.start);
    expect(a.qualified).toBe(b.qualified);
  });
});

describe("M07 charts tell the story the mission tells", () => {
  const m07 = missions.find((m) => m.id === "m07-numbers")!;
  const chart = (id: string) => {
    const s = m07.steps.find((x) => x.id === id);
    if (s?.kind !== "chartLab") throw new Error(id);
    return s.chart;
  };

  it("October is above June, so the slide's range starts at a dip", () => {
    const c = chart("trend");
    const bars = barsFor(c, { measure: "visits", baseline: "zero", range: "all" });
    expect(bars[0].value).toBeGreaterThan(bars.at(-1)!.value);
  });

  it("the rate ranking reverses the count ranking", () => {
    const c = chart("branches");
    const order = (measure: string) => [...barsFor(c, { ...c.start, measure })].sort((a, b) => b.value - a.value).map((b) => b.id);
    expect(order("count")[0]).toBe("riverside");
    expect(order("rate")[0]).toBe("bramley");
    expect(order("rate").at(-1)).toBe("riverside");
  });
});

describe("M01 sandbox tells the story the mission tells", () => {
  const m01 = missions.find((m) => m.id === "m01-foundations")!;
  const step = m01.steps.find((s) => s.kind === "sandbox");
  if (step?.kind !== "sandbox") throw new Error("no sandbox step");
  const ids = new Set(step.sentences.map((s) => s.id));
  const LIBRARY = step.sentences.filter((s) => s.group === "library").map((s) => s.id);
  const ask = (trained: string[], afterSaying = false) => askMachine(step.sentences, trained, step.promptText, "nine", afterSaying);
  const task = (id: string) => step.tasks.find((x) => x.id === id)!;

  it("every id it uses exists, and every group and word is usable", () => {
    for (const s of step.sentences) expect(step.groups.map((g) => g.id), s.id).toContain(s.group);
    for (const x of step.tasks) {
      for (const id of [...(x.setup?.on ?? []), ...(x.setup?.reveal ?? []), ...(x.solution ?? []), ...(x.goal.include ?? [])])
        expect(ids, `${x.id}: ${id}`).toContain(id);
      if (x.goal.word) expect(step.words, x.id).toContain(x.goal.word);
      expect(step.words, x.id).toContain(x.truth.word);
    }
  });

  it("every word the machine can say from any single group can be predicted", () => {
    for (const g of step.groups) {
      const word = ask(step.sentences.filter((s) => s.group === g.id).map((s) => s.id)).word;
      expect(step.words, g.id).toContain(word);
    }
  });

  it("every task that asks for a particular board can be solved by its worked solution", () => {
    for (const x of step.tasks) {
      if (x.solution) expect(goalMet(x.goal, ask(x.solution, !!x.say)), x.id).toBe(true);
      else expect(x.goal.word, `${x.id} needs a worked solution`).toBeUndefined();
    }
  });

  it("the library notices give the true answer, by counting alone", () => {
    expect(ask(LIBRARY).word).toBe("nine");
    expect(ask(LIBRARY).word).toBe(task("first-run").truth.word);
  });

  it("one sentence is enough for midnight, as the task says", () => {
    expect(task("make-midnight").solution).toHaveLength(1);
    expect(ask(task("make-midnight").solution!).ranked[0].share).toBe(1);
  });

  it("the machine stays out of date after the news, and after one new notice", () => {
    const truth = task("tell-it").truth.word;
    expect(ask(LIBRARY, true).word).not.toBe(truth); // telling it changes nothing
    expect(ask([...LIBRARY, "new"]).word).not.toBe(truth); // older sentences outnumber the new one
    expect(ask(["new"]).word).toBe(truth);
  });

  it("nothing is scored against the worked solution for a task with no learner choice", () => {
    expect(task("tell-it").solution).toBeUndefined();
    expect(task("tell-it").evidence).toBe("prediction");
  });
});

describe("answer keys don't give themselves away", () => {
  // Revisions repeat their initial question, so each question counts once.
  const keyed = missions.flatMap((m) =>
    m.steps.flatMap((s) => {
      const fromDebrief = s.kind === "debrief" ? s.skills.flatMap((k) => (k.practice ? [k.practice.choices] : [])) : [];
      const own = "choices" in s && s.kind !== "revision" ? [s.choices] : [];
      return [...own, ...fromDebrief].filter((cs) => cs.some((c) => c.verdict === "correct"));
    }),
  );
  const correctLength = (cs: Choice[]) => cs.find((c) => c.verdict === "correct")!.label.length;
  const share = (test: (cs: Choice[]) => boolean) => keyed.filter(test).length / keyed.length;

  // With three options, chance puts each position at about a third. Either extreme would be a usable tell.
  it("the correct option is not reliably the longest", () => {
    expect(keyed.length).toBeGreaterThan(10);
    expect(share((cs) => correctLength(cs) === Math.max(...cs.map((c) => c.label.length)))).toBeLessThanOrEqual(0.45);
  });

  it("the correct option is not reliably the shortest", () => {
    expect(share((cs) => correctLength(cs) === Math.min(...cs.map((c) => c.label.length)))).toBeLessThanOrEqual(0.45);
  });

  it("the correct option is not reliably the one in the middle", () => {
    const middle = (cs: Choice[]) => {
      const lengths = cs.map((c) => c.label.length);
      return correctLength(cs) !== Math.max(...lengths) && correctLength(cs) !== Math.min(...lengths);
    };
    expect(share(middle)).toBeLessThanOrEqual(0.45);
  });

  it("no question offers an option that is less than a third of the length of the correct one", () => {
    for (const cs of keyed) {
      for (const c of cs) expect(c.label.length * 3, c.label).toBeGreaterThanOrEqual(correctLength(cs));
    }
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
  it("runs M01, M04, M05, T01 through each debrief's recommendation, with released modules in curriculum order", () => {
    const next = (id: string) => {
      const d = missions.find((m) => m.id === id)?.steps.at(-1);
      return d?.kind === "debrief" ? d.nextMissionId : undefined;
    };
    // M02 (R4) sits between M01 and M04, matching the map's recommended order.
    expect(next("m01-foundations")).toBe("m02-delegation");
    expect(next("m02-delegation")).toBe("m03-briefing");
    expect(next("m03-briefing")).toBe("b01-faq");
    expect(next("b01-faq")).toBe("m04-evidence");
    expect(next("m04-evidence")).toBe("m05-argument");
    expect(next("m05-argument")).toBe("m06-gym");
    expect(next("m06-gym")).toBe("m06-teach");
    expect(next("m06-teach")).toBe("m07-numbers");
    expect(next("m07-numbers")).toBe("t01-transfer");
    expect(next("t01-transfer")).toBe("m08-newsroom");
    expect(next("m08-newsroom")).toBe("m09-fairness");
    expect(next("m09-fairness")).toBe("m10-boundaries");
    expect(next("m10-boundaries")).toBe("m11-cocreation");
    expect(next("m11-cocreation")).toBe("b03-report");
    expect(next("b03-report")).toBe("m12-systems");
    expect(next("m12-systems")).toBe("m13-assembly");
    expect(next("m13-assembly")).toBe("c01-scope");
    expect(next("c01-scope")).toBe("c01-evidence");
    expect(next("c01-evidence")).toBe("c01-workflow");
    expect(next("c01-workflow")).toBe("c01-review");
    expect(next("c01-review")).toBeNull();
  });

  it("T01 uses its own source pack, separate from M04's", () => {
    const passagesOf = (id: string) =>
      missions
        .find((m) => m.id === id)!
        .steps.flatMap((s) => ("audit" in s ? s.audit.sources.flatMap((src) => src.passages.map((p) => p.text)) : []));
    const m04 = new Set(passagesOf("m04-evidence"));
    expect(passagesOf("t01-transfer").filter((p) => m04.has(p))).toEqual([]);
  });

  it("support fades: M04 is guided, and T01 is independent", () => {
    const main = missions.find((m) => m.id === "m04-evidence")!.steps.find((s) => s.kind === "claimAudit");
    const t01 = missions.find((m) => m.id === "t01-transfer")!.steps.find((s) => "audit" in s);
    expect(main && "audit" in main ? main.audit.support : "x").toBeUndefined();
    expect(t01 && "audit" in t01 ? t01.audit.support : "x").toBe("independent");
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

describe("variety across the journey", () => {
  /** Bridges and the capstone revisit earlier cases on purpose, so only the core modules are counted. */
  const core = missions.filter((m) => /^m\d/.test(m.id));
  const tagged = (motif: Motif, among = missions) => among.flatMap((m) => m.steps.filter((s) => s.motifs?.includes(motif)).map((s) => `${m.id}/${s.id}`));

  it("doesn't make the sound answer the longest one most of the time", () => {
    const sets = missions.flatMap((m) => choiceSets(m)).map(([, cs]) => cs).filter((cs) => correctLengthRatio(cs) !== null);
    const longest = sets.filter((cs) => {
      const correct = cs.find((c) => c.verdict === "correct")!;
      return cs.every((c) => c === correct || c.label.length < correct.label.length);
    });
    // With three options, chance alone makes the correct one longest about a third of the time.
    expect(longest.length / sets.length).toBeLessThanOrEqual(0.4);
  });

  it("keeps recurring case devices to two core modules each", () => {
    for (const motif of ["selfSelectedSample", "inventedDetail", "stagedTrial"] as const) {
      const where = new Set(tagged(motif, core).map((x) => x.split("/")[0]));
      expect(where.size, `${motif}: ${[...where].join(", ")}`).toBeLessThanOrEqual(2);
    }
  });

  it("has questions where the bold or simple answer is the sound one, so caution isn't always safe", () => {
    expect(tagged("decisiveFits").length).toBeGreaterThanOrEqual(3);
  });

  it("asks for confidence only where it is the point, not as a habit", () => {
    const asking = missions.filter((m) => m.steps.some((s) => s.kind === "initialJudgment" && s.withConfidence));
    expect(asking.length).toBeLessThanOrEqual(5);
  });

  it("uses more than one format for written answers", () => {
    const formats = new Set(missions.flatMap((m) => m.steps.flatMap((s) => (s.kind === "openResponse" ? [s.format ?? "free"] : []))));
    expect(formats).toEqual(new Set(["free", "structured", "pickImprove"]));
  });
});

describe("the commission's dossier", () => {
  const chapters = missions.filter((m) => m.id.startsWith("c01-"));

  it("is shared by every chapter, and each section's source is a real step of its chapter", () => {
    const dossier = chapters[0].dossier!;
    for (const m of chapters) expect(m.dossier, m.id).toBe(dossier);
    for (const section of dossier) {
      const chapter = missions.find((m) => m.id === section.missionId);
      expect(chapter, section.id).toBeDefined();
      expect(section.prepared.length, `${section.id}: a returning learner sees the case pack`).toBeGreaterThan(0);
      if (section.source) {
        const step = chapter!.steps.find((s) => s.id === section.source!.stepId);
        expect(step && factValues(step, section.source.kind), `${section.id}: ${section.source.stepId}`).toBeTruthy();
      }
    }
  });
});
