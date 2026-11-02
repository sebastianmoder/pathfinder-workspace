import { describe, expect, it } from "vitest";
import { gradeMarks, segmentsOf, splitSentences } from "./mark";
import type { MarkSegment } from "@/content/types";

const seg = (id: string, target: boolean, optional = false): MarkSegment => ({ id, text: id, target, optional, explanation: "e" });
const segments = [seg("a", true), seg("b", true), seg("c", false), seg("d", false, true)];

describe("gradeMarks", () => {
  it("needs every target and nothing extra", () => {
    expect(gradeMarks(segments, ["a", "b"]).right).toBe(true);
    expect(gradeMarks(segments, ["a"])).toEqual({ found: 1, targets: 2, extra: 0, right: false });
    expect(gradeMarks(segments, ["a", "b", "c"])).toEqual({ found: 2, targets: 2, extra: 1, right: false });
  });

  it("ignores optional segments either way", () => {
    expect(gradeMarks(segments, ["a", "b", "d"]).right).toBe(true);
  });
});

describe("segmentsOf", () => {
  it("skips plain text", () => {
    expect(segmentsOf([["plain ", seg("a", true)], [seg("b", false)]]).map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("splitSentences", () => {
  it("splits on sentence ends and new lines, dropping blanks", () => {
    expect(splitSentences("One. Two? Three!\n\nFour")).toEqual(["One.", "Two?", "Three!", "Four"]);
    expect(splitSentences("   ")).toEqual([]);
  });
});
