import { describe, expect, it } from "vitest";
import { emptyProgress, mergeProgress, parseProgress, serializeProgress } from "./stored-progress";

describe("stored progress", () => {
  it("writes only completion, steps reached and familiar activities", () => {
    const extra = { ...emptyProgress(), completed: ["m01"], answers: { a: "secret" }, notes: "my words" } as never;
    const data = JSON.parse(serializeProgress(extra));
    expect(Object.keys(data).sort()).toEqual(["completed", "reached", "seen", "v"]);
    expect(JSON.stringify(data)).not.toContain("secret");
  });

  it("round-trips", () => {
    const p = { completed: ["m01"], reached: { m02: [4, 11] as [number, number] }, seen: ["sort"] };
    expect(parseProgress(serializeProgress(p))).toEqual(p);
  });

  it("falls back to empty for missing, corrupt or foreign data", () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress("{nope")).toEqual(emptyProgress());
    expect(parseProgress(JSON.stringify({ v: 2, completed: ["x"] }))).toEqual(emptyProgress());
    expect(parseProgress(JSON.stringify({ v: 1, completed: [1, "m01"], reached: { a: [5, 3], b: "x", c: [2, 9] } }))).toEqual({
      completed: ["m01"],
      reached: { c: [2, 9] },
      seen: [],
    });
  });

  it("merges without losing either side", () => {
    const merged = mergeProgress(
      { completed: ["a"], reached: { x: [2, 9] }, seen: ["s"] },
      { completed: ["a", "b"], reached: { x: [5, 9], y: [1, 4] }, seen: ["t"] },
    );
    expect(merged).toEqual({ completed: ["a", "b"], reached: { x: [5, 9], y: [1, 4] }, seen: ["s", "t"] });
  });
});
