import { describe, expect, it } from "vitest";
import { askMachine, goalMet, isStale } from "./sandbox";

const sentences = [
  { id: "a", group: "g", text: "the shop opens at eight" },
  { id: "b", group: "g", text: "the bank opens at ten" },
  { id: "c", group: "g", text: "the mall opens at ten" },
];
const prompt = "the library opens at";
const ask = (trained: string[], afterSaying = false) => askMachine(sentences, trained, prompt, "ten", afterSaying);

describe("askMachine", () => {
  it("uses only the sentences it was trained on", () => {
    expect(ask(["a"]).word).toBe("eight");
    expect(ask(["a", "b", "c"]).word).toBe("ten");
  });

  it("has no answer without matching training", () => {
    expect(ask([]).word).toBeNull();
  });
});

describe("goalMet", () => {
  it("needs an ask to have happened", () => {
    expect(goalMet({}, null)).toBe(false);
    expect(goalMet({}, ask(["a"]))).toBe(true);
  });

  it("checks each part of the goal that is present", () => {
    expect(goalMet({ word: "ten" }, ask(["a"]))).toBe(false);
    expect(goalMet({ word: "ten" }, ask(["b"]))).toBe(true);
    expect(goalMet({ include: ["c"] }, ask(["b"]))).toBe(false);
    expect(goalMet({ include: ["c"] }, ask(["b", "c"]))).toBe(true);
    expect(goalMet({ afterSaying: true }, ask(["b"]))).toBe(false);
    expect(goalMet({ afterSaying: true }, ask(["b"], true))).toBe(true);
  });
});

describe("isStale", () => {
  it("is stale before training and after any change to the board, in any order", () => {
    expect(isStale(["a"], null)).toBe(true);
    expect(isStale(["a"], ["a"])).toBe(false);
    expect(isStale(["b", "a"], ["a", "b"])).toBe(false);
    expect(isStale(["a", "b"], ["a"])).toBe(true);
    expect(isStale(["b"], ["a"])).toBe(true);
  });
});
