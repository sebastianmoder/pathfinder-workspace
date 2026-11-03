import { describe, expect, it } from "vitest";
import type { WorkflowSpec } from "@/content/types";
import { runAll, runTest, startFailures, workflowItems } from "./workflow";

const spec: WorkflowSpec = {
  input: "Q",
  output: "A",
  slots: [
    { id: "src", label: "Sources", help: "", options: [{ id: "none", label: "" }, { id: "doc", label: "" }] },
    { id: "send", label: "Send", help: "", options: [{ id: "auto", label: "" }, { id: "review", label: "" }] },
  ],
  start: { src: "none", send: "auto" },
  solution: { src: "doc", send: "auto" },
  tests: [
    { id: "t1", input: "", failsWhen: [{ slot: "send", options: ["auto"], result: "sent" }, { slot: "src", options: ["none"], result: "guessed" }], passResult: "ok" },
    { id: "t2", input: "", failsWhen: [{ slot: "send", options: ["review"], result: "slow" }], passResult: "ok" },
  ],
};

describe("workflow", () => {
  it("fails at the earliest step in the pipeline, whatever order the conditions are written in", () => {
    expect(runTest(spec, spec.tests[0], spec.start)).toMatchObject({ passed: false, slot: "src", result: "guessed" });
    expect(runTest(spec, spec.tests[0], { src: "doc", send: "auto" })).toMatchObject({ slot: "send" });
    expect(runAll(spec, { src: "doc", send: "review" }).map((r) => r.passed)).toEqual([true, false]);
  });

  it("asks for a diagnosis of each test that fails at the start, and records the fix", () => {
    expect(startFailures(spec).map((r) => r.test.id)).toEqual(["t1"]);
    expect(workflowItems("w", spec)).toEqual(["w/diagnose/t1", "w/fixed"]);
  });
});
