import { describe, expect, it } from "vitest";
import type { RankSpec } from "@/content/types";
import { moveTo, rankSound, rankVerdict, startingOrder } from "./rank";

const spec: RankSpec = {
  top: "Most",
  bottom: "Least",
  items: ["a", "b", "c", "d"].map((id) => ({ id, label: id, explanation: "" })),
  first: ["a", "b"],
  last: ["d"],
};

describe("rank", () => {
  it("judges only the ends", () => {
    expect(rankVerdict(spec, ["b", "c", "a", "d"])).toEqual({ first: true, last: true });
    expect(rankVerdict(spec, ["c", "a", "b", "d"])).toEqual({ first: false, last: true });
    expect(rankSound(rankVerdict({ ...spec, last: undefined }, ["a", "d", "c", "b"]))).toBe(true);
  });

  it("moves a card and shifts the rest", () => {
    expect(moveTo(["a", "b", "c", "d"], "d", 0)).toEqual(["d", "a", "b", "c"]);
    expect(moveTo(["a", "b", "c", "d"], "a", 9)).toEqual(["b", "c", "d", "a"]);
  });

  it("never starts with a sound card on top", () => {
    for (let seed = 0; seed < 50; seed++) {
      const order = startingOrder(spec, seed, "k");
      expect(spec.first).not.toContain(order[0]);
      expect([...order].sort()).toEqual(["a", "b", "c", "d"]);
    }
  });
});
