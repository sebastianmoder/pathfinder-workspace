import { describe, expect, it } from "vitest";
import { emptyProgress, exportSave, importSave, mergeProgress, parseProgress, serializeProgress, type StoredProgress } from "./stored-progress";

const sample = (): StoredProgress => ({
  completed: ["m01-foundations"],
  reached: { "m02-delegation": [4, 11] },
  seen: ["sort"],
  orderSeed: 12345,
  missions: {
    "m02-delegation": {
      stepIndex: 3,
      answers: { initial: { choiceId: "b", confidence: 2, attempts: 1 } },
      stepState: { desk: { sent: ["bursary"] } },
      evidence: { "desk/bursary": { firstTry: true, right: true, assisted: false, skipped: false } },
      facts: { "desk/roles": ["bursary:human"] },
    },
  },
  story: { flags: { firstAnswer: "checked" }, scenes: ["prologue"], quiet: false },
});

describe("stored progress", () => {
  it("writes only the save's own fields", () => {
    const extra = { ...sample(), password: "secret" } as never;
    const data = JSON.parse(serializeProgress(extra));
    expect(Object.keys(data).sort()).toEqual(["completed", "missions", "orderSeed", "reached", "seen", "story", "v"]);
    expect(JSON.stringify(data)).not.toContain("secret");
  });

  it("round-trips", () => {
    expect(parseProgress(serializeProgress(sample()))).toEqual(sample());
  });

  it("carries a version 1 save's finished cases into version 2", () => {
    const v1 = JSON.stringify({ v: 1, completed: ["m01-foundations"], reached: { m02: [2, 9] }, seen: ["sort"] });
    expect(parseProgress(v1)).toEqual({ ...emptyProgress(), completed: ["m01-foundations"], reached: { m02: [2, 9] }, seen: ["sort"] });
  });

  it("falls back to empty for missing, corrupt or foreign data", () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress("{nope")).toEqual(emptyProgress());
    expect(parseProgress("[1,2]")).toEqual(emptyProgress());
    expect(parseProgress(JSON.stringify({ v: 3, completed: ["x"] }))).toEqual(emptyProgress());
  });

  it("drops malformed parts and keeps the rest", () => {
    const raw = JSON.stringify({
      v: 2,
      completed: [1, "m01", "m01"],
      reached: { a: [5, 3], b: "x", c: [2, 9] },
      orderSeed: "7",
      missions: {
        good: { stepIndex: 2, answers: { q: { choiceId: 4, confidence: 9, attempts: -1 }, r: "x" }, facts: { f: ["a", 2] }, evidence: { e: { right: "yes" }, ok: { right: true, firstTry: false } } },
        bad: { stepIndex: -1 },
        worse: "x",
      },
      story: { flags: { a: "x", b: 2 }, scenes: ["s", "s", 3], quiet: "yes" },
    });
    expect(parseProgress(raw)).toEqual({
      completed: ["m01"],
      reached: { c: [2, 9] },
      seen: [],
      orderSeed: null,
      missions: {
        good: {
          stepIndex: 2,
          answers: { q: { attempts: 0 } },
          stepState: {},
          facts: { f: ["a"] },
          evidence: { ok: { right: true, firstTry: false, assisted: false, skipped: false } },
        },
      },
      story: { flags: { a: "x" }, scenes: ["s"], quiet: false },
    });
  });

  it("never copies keys that reach an object's prototype", () => {
    const raw = '{"v":2,"missions":{"__proto__":{"stepIndex":1},"m":{"stepIndex":1,"facts":{"__proto__":["x"]}}},"story":{"flags":{"__proto__":"x"}}}';
    const parsed = parseProgress(raw);
    expect(Object.keys(parsed.missions)).toEqual(["m"]);
    expect(Object.keys(parsed.missions.m.facts)).toEqual([]);
    expect(({} as Record<string, unknown>).stepIndex).toBeUndefined();
  });

  it("merges without losing either side, and the tab's work wins", () => {
    const stored = sample();
    const tab: StoredProgress = {
      ...emptyProgress(),
      completed: ["m03-briefing"],
      reached: { "m02-delegation": [6, 11], y: [1, 4] },
      seen: ["match"],
      missions: { "m02-delegation": { stepIndex: 5, answers: {}, stepState: {}, evidence: {}, facts: {} } },
      story: { flags: { faq: "checked" }, scenes: ["m01-open"], quiet: false },
    };
    const merged = mergeProgress(stored, tab);
    expect(merged.completed).toEqual(["m01-foundations", "m03-briefing"]);
    expect(merged.reached).toEqual({ "m02-delegation": [6, 11], y: [1, 4] });
    expect(merged.seen).toEqual(["sort", "match"]);
    expect(merged.orderSeed).toBe(12345);
    expect(merged.missions["m02-delegation"].stepIndex).toBe(5);
    expect(merged.story).toEqual({ flags: { firstAnswer: "checked", faq: "checked" }, scenes: ["prologue", "m01-open"], quiet: false });
  });
});

describe("save files", () => {
  const now = new Date("2026-11-16T10:00:00Z");

  it("exports a file that loads back to the same save", () => {
    const result = importSave(exportSave(sample(), now));
    expect(result).toEqual({ ok: true, save: sample() });
  });

  it("labels the file", () => {
    const data = JSON.parse(exportSave(sample(), now));
    expect(data.app).toBe("artisan");
    expect(data.exportedAt).toBe("2026-11-16T10:00:00.000Z");
  });

  it("refuses files that aren't saves, and says why", () => {
    expect(importSave("not json")).toEqual({ ok: false, reason: "notJson" });
    expect(importSave(JSON.stringify({ v: 2, completed: [] }))).toEqual({ ok: false, reason: "notASave" });
    expect(importSave(JSON.stringify({ app: "artisan", v: 0 }))).toEqual({ ok: false, reason: "notASave" });
    expect(importSave(JSON.stringify({ app: "artisan", v: 3 }))).toEqual({ ok: false, reason: "newer" });
    expect(importSave("x".repeat(2_000_001))).toEqual({ ok: false, reason: "tooLarge" });
  });
});
