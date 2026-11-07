import { describe, expect, it } from "vitest";
import type { MatchSpec } from "@/content/types";
import { keepRight, matchResults, pair, unpair } from "./match";

const spec: MatchSpec = {
  leftLabel: "L",
  rightLabel: "R",
  left: [
    { id: "a", label: "A", matchId: "x", explanation: "" },
    { id: "b", label: "B", matchId: "y", explanation: "" },
  ],
  right: [{ id: "x", label: "X" }, { id: "y", label: "Y" }, { id: "z", label: "Z" }],
};

describe("match", () => {
  it("keeps pairs one to one", () => {
    let p = pair({}, "a", "x");
    p = pair(p, "b", "x"); // x moves to b
    expect(p).toEqual({ b: "x" });
    p = pair(p, "b", "y"); // b moves on, x is free
    expect(p).toEqual({ b: "y" });
    expect(unpair(p, "b")).toEqual({});
  });

  it("judges each pair and lets wrong ones come loose", () => {
    const p = { a: "x", b: "z" };
    expect(matchResults(spec, p)).toEqual({ a: true, b: false });
    expect(keepRight(spec, p)).toEqual({ a: "x" });
  });
});
