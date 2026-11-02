import { describe, expect, it } from "vitest";
import { citeChoiceId, hasCycle, reachableNodes, startNodeId, walk } from "./dialogue";
import type { DialogueChoice, DialogueSpec } from "@/content/types";

const choice = (id: string, next: string): DialogueChoice => ({ id, label: id, strategy: "evidence", note: "n", next });
const spec: DialogueSpec = {
  characters: [],
  start: "a",
  starts: { x: "b" },
  discoveries: [],
  nodes: [
    { id: "a", speakerId: "s", text: "", choices: [choice("toB", "b"), choice("toC", "c")] },
    { id: "b", speakerId: "s", text: "", reveals: ["r1"], choices: [choice("toC", "c")] },
    { id: "c", speakerId: "s", text: "", reveals: ["r2", "r1"], choices: [] },
    { id: "orphan", speakerId: "s", text: "", choices: [] },
  ],
};

describe("dialogue", () => {
  it("picks the opening from the initial judgment, with a fallback", () => {
    expect(startNodeId(spec, "x")).toBe("b");
    expect(startNodeId(spec, "other")).toBe("a");
    expect(startNodeId(spec, undefined)).toBe("a");
  });

  it("walks a path, collecting discoveries without repeats", () => {
    const w = walk(spec, "a", ["toB", "toC"]);
    expect(w.ended).toBe(true);
    expect(w.current.id).toBe("c");
    expect(w.turns.map((t) => t.choice?.id)).toEqual(["toB", "toC", undefined]);
    expect(w.discovered).toEqual(["r1", "r2"]);
  });

  it("stops at an unknown choice rather than failing", () => {
    const w = walk(spec, "a", ["nope", "toC"]);
    expect(w.current.id).toBe("a");
    expect(w.ended).toBe(false);
  });

  it("finds reachable nodes and cycles", () => {
    expect(reachableNodes(spec).has("orphan")).toBe(false);
    expect(hasCycle(spec)).toBe(false);
    const looped: DialogueSpec = { ...spec, nodes: [{ id: "a", speakerId: "s", text: "", choices: [choice("self", "a")] }] };
    expect(hasCycle(looped)).toBe(true);
  });

  it("takes a shown passage as a move, with a reply that depends on which one", () => {
    const cited: DialogueSpec = {
      ...spec,
      nodes: [
        {
          id: "a",
          speakerId: "s",
          text: "",
          choices: [choice("toC", "c")],
          cite: {
            responses: [{ passageIds: ["right"], note: "yes", next: "b", scored: { item: "i", right: true } }],
            otherwise: { note: "no", next: "c", scored: { item: "i", right: false } },
          },
        },
        { id: "b", speakerId: "s", text: "", choices: [] },
        { id: "c", speakerId: "s", text: "", choices: [] },
      ],
    };
    expect(walk(cited, "a", []).canCite).toBe(true);
    expect(walk(cited, "a", [citeChoiceId("right")]).current.id).toBe("b");
    const wrong = walk(cited, "a", [citeChoiceId("other")]);
    expect(wrong.current.id).toBe("c");
    expect(wrong.turns[0].choice).toMatchObject({ citedPassage: "other", note: "no", scored: { item: "i", right: false } });
    expect(hasCycle(cited)).toBe(false);
    expect(reachableNodes(cited)).toEqual(new Set(["a", "b", "c"]));
  });

  it("leaves only the move on once the questions have run out, keeping the last answer", () => {
    const limited: DialogueSpec = {
      ...spec,
      budget: { questions: 1, moveOn: choice("go", "c") },
      nodes: [
        { id: "a", speakerId: "s", text: "", choices: [choice("toB", "b"), choice("toC", "c")] },
        { id: "b", speakerId: "s", text: "", reveals: ["r1"], choices: [choice("toC", "c"), choice("toD", "d")] },
        { id: "c", speakerId: "s", text: "", choices: [choice("toD", "d")] },
        { id: "d", speakerId: "s", text: "", choices: [] },
      ],
    };
    const first = walk(limited, "a", []);
    expect(first.questionsLeft).toBe(1);
    expect(first.options.map((c) => c.id)).toEqual(["toB", "toC"]);
    const spent = walk(limited, "a", ["toB"]);
    expect(spent.discovered).toEqual(["r1"]); // the question that used the last of the budget still gets its answer
    expect(spent.questionsLeft).toBe(0);
    expect(spent.options.map((c) => c.id)).toEqual(["go"]);
    const after = walk(limited, "a", ["toB", "go"]);
    expect(after.current.id).toBe("c");
    expect(after.options.map((c) => c.id)).toEqual(["toD"]);
    expect(after.questionsLeft).toBeNull();
    expect(walk(limited, "a", ["toB", "toC"]).current.id).toBe("b"); // a closed move is not accepted
  });
});
