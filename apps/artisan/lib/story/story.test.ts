import { describe, expect, it } from "vitest";
import { modules } from "@/content/journey";
import { getMission, missions } from "@/content/missions";
import { caseStories, cast, chapters, flags, opening, places } from "@/content/story";
import type { Scene, StoryCondition } from "@/content/story/types";
import { evidenceItems } from "@/lib/evidence";
import { allLines, deriveFlags, fileOf, holds, scenesAfter, scenesBefore, unfold, type StoryBook } from "./story";

const book: StoryBook = { opening, chapters, cases: caseStories };
const scenes: Scene[] = [
  opening,
  ...chapters.flatMap((c) => [c.opener, c.closer].filter((s): s is Scene => !!s)),
  ...caseStories.flatMap((c) => [...Object.values(c.open), ...Object.values(c.close)]),
];
const moduleOf = (id: string) => modules.find((m) => m.id === id)!;
const none = { flags: {}, completed: [] };

describe("story engine", () => {
  const scene: Scene = {
    id: "s",
    place: "office",
    when: "now",
    beats: [
      { text: "one" },
      { text: "only after m1", when: { done: ["m1"] } },
      { either: [{ when: { flag: { id: "f", is: ["a"] } }, lines: [{ text: "was a" }] }, { lines: [{ text: "default" }] }] },
      { id: "q", ask: { text: "well?" }, options: [{ id: "y", label: "Yes", reply: [{ text: "yes then" }] }, { id: "n", label: "No", reply: [] }] },
      { text: "after" },
    ],
  };

  it("stops at an unanswered question and goes on once it is answered", () => {
    const first = unfold(scene, none, {});
    expect(first.lines.map((l) => l.text)).toEqual(["one", "default", "well?"]);
    expect(first.asking?.options.map((o) => o.label)).toEqual(["Yes", "No"]);
    const then = unfold(scene, none, { q: "y" });
    expect(then.lines.map((l) => l.text)).toEqual(["one", "default", "well?", "Yes", "yes then", "after"]);
    expect(then.lines[3].you).toBe(true);
    expect(then.asking).toBeNull();
  });

  it("chooses lines by what the player decided and finished", () => {
    const lines = unfold(scene, { flags: { f: "a" }, completed: ["m1"] }, { q: "n" }).lines.map((l) => l.text);
    expect(lines).toEqual(["one", "only after m1", "was a", "well?", "No", "after"]);
    expect(holds({ flag: { id: "f", is: ["a"] }, done: ["m1"] }, { flags: { f: "a" }, completed: [] })).toBe(false);
  });

  it("plays the prologue and the chapter opening once, before the first case opened", () => {
    const first = scenesBefore(book, moduleOf("M01"), "m01-foundations", []);
    expect(first.map((s) => s.id)).toEqual(["prologue", "ch1-open", "m01-open"]);
    const seen = first.map((s) => s.id);
    expect(scenesBefore(book, moduleOf("M02"), "m02-delegation", seen).map((s) => s.id)).toEqual(["m02-open"]);
    expect(scenesBefore(book, moduleOf("M01"), "m01-foundations", seen)).toEqual([]);
  });

  it("opens a case whose story isn't written yet without any scene", () => {
    const unwritten = modules.find((m) => !caseStories.some((c) => c.moduleId === m.id));
    if (unwritten) expect(scenesBefore(book, unwritten, unwritten.missionIds[0], [])).toEqual([]);
  });

  it("closes the chapter only when its last case is finished", () => {
    const early = scenesAfter(book, moduleOf("M01"), "m01-foundations", [], modules, []);
    expect(early.map((s) => s.id)).toEqual(["m01-close"]);
    const last = scenesAfter(book, moduleOf("B01"), "b01-faq", [], modules, ["m01-foundations", "m02-delegation", "m03-briefing"]);
    expect(last.map((s) => s.id)).toEqual(["b01-close", "ch1-close"]);
  });

  it("reads flags from what a mission recorded, with a default", () => {
    const blank = { choices: {}, facts: {}, evidence: {} };
    expect(deriveFlags(flags, "m01-foundations", { ...blank, choices: { initial: "a" } })).toEqual({ firstAnswer: "used" });
    expect(deriveFlags(flags, "m01-foundations", blank)).toEqual({ firstAnswer: "checked" });
    expect(deriveFlags(flags, "b01-faq", { ...blank, facts: { "roles/roles": ["themes:assisted", "answers:automated"] } })).toEqual({ faq: "unchecked" });
    expect(deriveFlags(flags, "m03-briefing", blank)).toEqual({});
  });

  it("files a clue when its case is finished, and ties it only to clues already there", () => {
    const start = fileOf(book, modules, none);
    expect(start.every((c) => !c.found)).toBe(true);
    const later = fileOf(book, modules, { flags: { faq: "unchecked" }, completed: ["m01-foundations", "b01-faq"] });
    const faq = later.find((c) => c.moduleId === "B01")!;
    expect(faq.found).toBe(true);
    expect(faq.text).toContain("invented café");
    expect(faq.ties.map((t) => t.moduleId)).toEqual(["M01"]);
  });
});

describe("story content", () => {
  const flagIds = new Map(flags.map((f) => [f.id, f.values.map((v) => v.value)]));
  const missionIds = new Set(missions.map((m) => m.id));
  const checkCondition = (c: StoryCondition | undefined, where: string) => {
    if (c?.flag) {
      expect(flagIds.has(c.flag.id), `${where}: unknown flag ${c.flag.id}`).toBe(true);
      for (const v of c.flag.is) expect(flagIds.get(c.flag.id), `${where}: ${c.flag.id} has no value ${v}`).toContain(v);
    }
    for (const id of c?.done ?? []) expect(missionIds.has(id), `${where}: unknown mission ${id}`).toBe(true);
  };

  it("gives every scene a unique id, a known place and known speakers", () => {
    expect(new Set(scenes.map((s) => s.id)).size).toBe(scenes.length);
    for (const s of scenes) {
      expect(places[s.place], s.id).toBeDefined();
      for (const line of s.beats.flatMap(allLines)) {
        if (line.who) expect(cast[line.who], `${s.id}: ${line.who}`).toBeDefined();
        expect(line.text.trim().length, s.id).toBeGreaterThan(0);
      }
    }
  });

  it("only branches on flags and missions that exist, and always has a default", () => {
    for (const s of scenes) {
      for (const beat of s.beats) {
        if ("either" in beat) {
          expect(beat.either[beat.either.length - 1].when, `${s.id}: the last alternative is the default`).toBeUndefined();
          beat.either.forEach((a) => checkCondition(a.when, s.id));
        } else if ("ask" in beat) {
          expect(beat.options.length, s.id).toBeGreaterThanOrEqual(2);
        } else checkCondition(beat.when, s.id);
      }
    }
    for (const c of caseStories) {
      expect(c.clue.text[c.clue.text.length - 1].when, `${c.moduleId}: the last clue text is the default`).toBeUndefined();
      c.clue.text.forEach((t) => checkCondition(t.when, c.moduleId));
    }
  });

  it("ends every scene for every player, whatever they decided", () => {
    const states = [none, ...flags.flatMap((f) => f.values.map((v) => ({ flags: { [f.id]: v.value }, completed: [] as string[] })))];
    for (const s of scenes) {
      for (const state of states) {
        const picks: Record<string, string> = {};
        let result = unfold(s, state, picks);
        while (result.asking) {
          picks[result.asking.id] = result.asking.options[0].id;
          result = unfold(s, state, picks);
        }
        expect(result.lines.length, s.id).toBeGreaterThan(0);
      }
    }
  });

  it("gives each case with a story an opening and a closing scene for every mission, and a clue", () => {
    for (const c of caseStories) {
      const m = modules.find((x) => x.id === c.moduleId);
      expect(m, c.moduleId).toBeDefined();
      expect(Object.keys(c.open).sort(), c.moduleId).toEqual([...m!.missionIds].sort());
      expect(Object.keys(c.close).sort(), c.moduleId).toEqual([...m!.missionIds].sort());
      for (const tie of c.clue.ties) {
        expect(caseStories.some((x) => x.moduleId === tie.moduleId), `${c.moduleId} ties to ${tie.moduleId}`).toBe(true);
        expect(modules.findIndex((x) => x.id === tie.moduleId), `${c.moduleId} ties back, not forward`).toBeLessThan(modules.indexOf(m!));
      }
    }
  });

  it("covers a whole chapter or none of it", () => {
    for (const chapter of chapters) {
      const inStage = modules.filter((m) => m.stage === chapter.stage);
      const written = inStage.filter((m) => caseStories.some((c) => c.moduleId === m.id));
      expect([0, inStage.length], chapter.title).toContain(written.length);
      if (written.length > 0) {
        expect(chapter.opener, chapter.title).toBeDefined();
        expect(chapter.closer, chapter.title).toBeDefined();
      }
    }
  });

  it("reads every flag from a step, fact or ledger item its mission can record", () => {
    for (const def of flags) {
      const mission = getMission(def.missionId);
      expect(mission, def.id).toBeDefined();
      expect(def.values[def.values.length - 1].when, `${def.id}: the last value is the default`).toBeUndefined();
      expect(new Set(def.values.map((v) => v.value)).size, def.id).toBe(def.values.length);
      const steps = mission!.steps;
      for (const v of def.values) {
        if (v.when?.choice) {
          const step = steps.find((s) => s.id === v.when!.choice!.step);
          expect(step && "choices" in step, `${def.id}: ${v.when.choice.step} is a question`).toBe(true);
          if (step && "choices" in step) for (const id of v.when.choice.ids) expect(step.choices.map((c) => c.id), def.id).toContain(id);
        }
        if (v.when?.fact) expect(steps.some((s) => s.id === v.when!.fact!.key.split("/")[0]), `${def.id}: ${v.when.fact.key}`).toBe(true);
        if (v.when?.evidence) expect(steps.flatMap((s) => evidenceItems(s)), def.id).toContain(v.when.evidence.item);
      }
    }
  });
});
