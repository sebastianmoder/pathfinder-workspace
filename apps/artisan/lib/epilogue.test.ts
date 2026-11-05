import { describe, expect, it } from "vitest";
import type { EpilogueLine } from "@/content/types";
import { beatFor, conditionHolds, type EpilogueInput } from "./epilogue";

const input: EpilogueInput = {
  choices: { decide: "publish" },
  facts: { "plan/chosen": ["phone", "review"] },
  evidence: { "lab/gap": { firstTry: false, right: true, assisted: false, skipped: false } },
};

describe("epilogue conditions", () => {
  it("checks a chosen answer", () => {
    expect(conditionHolds({ choice: { step: "decide", ids: ["publish", "qualify"] } }, input)).toBe(true);
    expect(conditionHolds({ choice: { step: "decide", ids: ["hold"] } }, input)).toBe(false);
    expect(conditionHolds({ choice: { step: "other", ids: ["x"] } }, input)).toBe(false);
  });

  it("checks what an activity recorded", () => {
    expect(conditionHolds({ fact: { key: "plan/chosen", any: ["walkin", "phone"] } }, input)).toBe(true);
    expect(conditionHolds({ fact: { key: "plan/chosen", all: ["phone", "walkin"] } }, input)).toBe(false);
    expect(conditionHolds({ fact: { key: "plan/chosen", none: ["review"] } }, input)).toBe(false);
    expect(conditionHolds({ fact: { key: "missing", none: ["x"] } }, input)).toBe(false); // nothing recorded is not "none chosen"
  });

  it("checks how a ledger item went", () => {
    expect(conditionHolds({ evidence: { item: "lab/gap", right: true } }, input)).toBe(true);
    expect(conditionHolds({ evidence: { item: "lab/gap", firstTry: true } }, input)).toBe(false);
  });
});

describe("beatFor", () => {
  it("shows the first beat that applies, and falls back to the default", () => {
    const line: EpilogueLine = {
      id: "l",
      beats: [
        { text: "held", when: { choice: { step: "decide", ids: ["hold"] } } },
        { text: "published", when: { choice: { step: "decide", ids: ["publish"] } } },
        { text: "default" },
      ],
    };
    expect(beatFor(line, input).text).toBe("published");
    expect(beatFor(line, { ...input, choices: {} }).text).toBe("default");
  });
});
