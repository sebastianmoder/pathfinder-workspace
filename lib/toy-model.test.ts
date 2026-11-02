import { describe, expect, it } from "vitest";
import { buildModel, predict } from "./toy-model";

describe("toy model", () => {
  const rep = (n: number, s: string) => Array<string>(n).fill(s);

  it("ranks followers by count, ties alphabetically", () => {
    const m = buildModel([...rep(3, "the shop opens at eight"), "the bank opens at ten", "the cafe opens at seven"]);
    const p = predict(m, "the library opens at");
    expect(p.contextUsed).toBe("opens at");
    expect(p.ranked.map((r) => r.word)).toEqual(["eight", "seven", "ten"]);
    expect(p.ranked[0].share).toBeCloseTo(0.6);
  });

  it("is deterministic", () => {
    const m = buildModel(["a b c", "a b d"]);
    expect(predict(m, "a b")).toEqual(predict(m, "a b"));
  });

  it("falls back to the last word, and reports nothing when nothing matches", () => {
    const m = buildModel(["the library closes at five"]);
    expect(predict(m, "the library opens at").contextUsed).toBe("at");
    expect(predict(m, "zebra zebra").ranked).toEqual([]);
    expect(predict(m, "zebra zebra").contextUsed).toBeNull();
  });
});
