import { describe, expect, it } from "vitest";
import { hasCycle, reachableNodes, startNodeId, walk } from "./dialogue";
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
});
