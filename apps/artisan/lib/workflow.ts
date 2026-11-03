import type { WorkflowSpec, WorkflowTest } from "@/content/types";
import { itemKey } from "./evidence";

export type Arrangement = Record<string, string>;

export interface TestResult {
  test: WorkflowTest;
  passed: boolean;
  /** The step where it failed, if it did. */
  slot: string | null;
  result: string;
}

/** Runs one test: the first failing condition, in slot order, decides where and how it fails. */
export function runTest(spec: WorkflowSpec, test: WorkflowTest, arrangement: Arrangement): TestResult {
  for (const slot of spec.slots) {
    const hit = test.failsWhen.find((f) => f.slot === slot.id && f.options.includes(arrangement[slot.id]));
    if (hit) return { test, passed: false, slot: slot.id, result: hit.result };
  }
  return { test, passed: true, slot: null, result: test.passResult };
}

export const runAll = (spec: WorkflowSpec, arrangement: Arrangement) => spec.tests.map((t) => runTest(spec, t, arrangement));

/** Tests that fail as the workflow starts: the learner diagnoses these after the first run. */
export const startFailures = (spec: WorkflowSpec) => runAll(spec, spec.start).filter((r) => !r.passed);

export function workflowItems(stepId: string, spec: WorkflowSpec): string[] {
  return [...startFailures(spec).map((r) => itemKey(stepId, "diagnose", r.test.id)), itemKey(stepId, "fixed")];
}
