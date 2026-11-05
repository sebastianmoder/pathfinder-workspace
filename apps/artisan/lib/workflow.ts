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

/** Running totals for an arrangement: staff hours a week, and the longest wait a member may face. */
export function costOf(spec: WorkflowSpec, arrangement: Record<string, string>) {
  const chosen = spec.slots.map((s) => s.options.find((o) => o.id === arrangement[s.id])?.cost ?? {});
  return {
    staffHours: chosen.reduce((n, c) => n + (c.staffHours ?? 0), 0),
    waitHours: Math.max(0, ...chosen.map((c) => c.waitHours ?? 0)),
    shown: spec.slots.some((s) => s.options.some((o) => o.cost)),
  };
}

export function workflowItems(stepId: string, spec: WorkflowSpec): string[] {
  return [...startFailures(spec).map((r) => itemKey(stepId, "diagnose", r.test.id)), itemKey(stepId, "fixed")];
}
