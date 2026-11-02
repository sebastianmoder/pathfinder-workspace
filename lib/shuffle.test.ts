import { describe, expect, it } from "vitest";
import { seededShuffle } from "./shuffle";

describe("seededShuffle", () => {
  const items = ["a", "b", "c"];

  it("keeps every item", () => {
    expect([...seededShuffle(items, 7, "q")].sort()).toEqual(items);
  });

  it("is stable for one seed and key", () => {
    expect(seededShuffle(items, 7, "q")).toEqual(seededShuffle(items, 7, "q"));
  });

  it("does not modify the authored order", () => {
    seededShuffle(items, 7, "q");
    expect(items).toEqual(["a", "b", "c"]);
  });

  it("puts each option first about equally often across sessions", () => {
    const firsts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let seed = 0; seed < 3000; seed++) firsts[seededShuffle(items, seed, "q")[0]]++;
    for (const n of Object.values(firsts)) expect(n).toBeGreaterThan(800);
  });
});
