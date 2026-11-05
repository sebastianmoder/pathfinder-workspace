import { describe, expect, it } from "vitest";
import type { GymProblem } from "@/content/types";
import { gymItems, isRight, solveResult } from "./gym";

const p: GymProblem = {
  id: "p",
  title: "",
  text: "",
  choices: [
    { id: "a", label: "", explanation: "x", verdict: "weaker" },
    { id: "b", label: "", explanation: "x", verdict: "correct" },
  ],
  helps: [
    { id: "hint", label: "", provides: "", content: "" },
    { id: "answer", label: "", provides: "", content: "", givesAnswer: true },
  ],
};

describe("gym", () => {
  it("names an attempt and a solve item per problem", () => {
    expect(gymItems("g", [p])).toEqual(["g/p/attempt", "g/p"]);
  });

  it("notes help without counting it against the learner, unless the answer was shown", () => {
    expect(isRight(p, "b")).toBe(true);
    expect(solveResult(p, [])).toEqual({ right: true, assisted: false });
    expect(solveResult(p, ["hint"])).toEqual({ right: true, assisted: true });
    expect(solveResult(p, ["hint", "answer"])).toEqual({ right: false, assisted: true });
  });
});

describe("a numeric problem", () => {
  const numeric: GymProblem = { id: "n", title: "", text: "", numeric: { label: "", min: 13.2, max: 13.4, explanation: "x" }, helps: [] };

  it("accepts a typed answer within the reviewed range, however it is written", () => {
    expect(isRight(numeric, "13.3")).toBe(true);
    expect(isRight(numeric, "13.3 km/h")).toBe(true);
    expect(isRight(numeric, "15")).toBe(false);
    expect(isRight(numeric, "")).toBe(false);
  });
});
