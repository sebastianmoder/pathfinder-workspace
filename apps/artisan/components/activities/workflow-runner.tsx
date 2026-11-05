"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { WorkflowSpec } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { runAll, type Arrangement, type TestResult, costOf } from "@/lib/workflow";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";

/**
 * Assemble a simulated assistant and run reviewed tests (PRD M12). After the first run the learner names
 * the step behind each failure before the failure points are shown, then fixes and reruns.
 */
export function WorkflowRunner({
  stepId,
  spec,
  onEvidence,
  onContinue,
  onFact,
}: {
  stepId: string;
  spec: WorkflowSpec;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
  /** Reports what the learner settled on, for epilogues and debrief replays. */
  onFact?: (name: string, values: string[]) => void;
}) {
  const uid = useId();
  const guided = spec.support !== "independent";
  const [arrangement, setArrangement] = useState<Arrangement>(spec.start);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [ranWith, setRanWith] = useState<Arrangement | null>(null);
  const [runCount, setRunCount] = useState(0);
  const [firstFailures, setFirstFailures] = useState<TestResult[]>([]);
  const [diagnosis, setDiagnosis] = useState<Record<string, string>>({});
  const [diagnosed, setDiagnosed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [usedSolution, setUsedSolution] = useState(false);
  const [recordedFix, setRecordedFix] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (runCount > 0) resultsRef.current?.focus();
  }, [runCount]);

  const label = (slotId: string) => spec.slots.find((s) => s.id === slotId)?.label ?? slotId;
  const optionLabel = (slotId: string) => spec.slots.find((s) => s.id === slotId)?.options.find((o) => o.id === arrangement[slotId])?.label;
  const mustDiagnose = runCount > 0 && firstFailures.length > 0 && !diagnosed;
  const allPassed = !!results && results.every((r) => r.passed);
  const stale = !!ranWith && spec.slots.some((s) => ranWith[s.id] !== arrangement[s.id]);
  const shownFailure = diagnosed || firstFailures.length === 0;
  const focusResult = results?.find((r) => r.test.id === selected) ?? results?.find((r) => !r.passed) ?? null;

  const diagRef = useReveal<HTMLElement>(diagnosed);
  const note = mustDiagnose
    ? t.workflow.diagnoseFirst
    : allPassed && !stale ? undefined
    : stale ? t.workflow.stale
    : runCount === 0 ? t.workflow.firstRun
    : diagnosed || firstFailures.length === 0 ? t.workflow.nowFix
    : undefined;

  const run = () => {
    const r = runAll(spec, arrangement);
    setResults(r);
    setRanWith(arrangement);
    if (runCount === 0) setFirstFailures(r.filter((x) => !x.passed));
    setRunCount((n) => n + 1);
    setSelected(null);
    if (r.every((x) => x.passed) && !recordedFix) {
      onEvidence(itemKey(stepId, "fixed"), { right: !usedSolution, assisted: usedSolution });
      onFact?.("arrangement", Object.entries(arrangement).map(([slot, option]) => `${slot}:${option}`));
      setRecordedFix(true);
    }
  };

  const cost = costOf(spec, arrangement);

  return (
    <div>
      <section aria-labelledby={`${uid}-diagram`}>
        <h3 id={`${uid}-diagram`} className="text-lg font-bold">{t.workflow.diagram}</h3>
        <ol className="mt-2 flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-stretch">
          <Box title={t.workflow.input} text={spec.input} />
          {spec.slots.map((s) => {
            const failedHere = shownFailure && focusResult && !focusResult.passed && focusResult.slot === s.id;
            return <Box key={s.id} title={s.label} text={optionLabel(s.id) ?? ""} failed={!!failedHere} arrow />;
          })}
          <Box title={t.workflow.output} text={spec.output} arrow />
        </ol>
        {shownFailure && focusResult && !focusResult.passed && (
          <p className="mt-2 text-sm">{t.workflow.failedAt(focusResult.test.input, label(focusResult.slot!))}</p>
        )}
        {cost.shown && (
          <dl className="meters mt-3" aria-live="polite">
            <div>
              <dt>{t.workflow.staffTime}</dt>
              <dd>{t.workflow.hoursAWeek(cost.staffHours)}</dd>
            </div>
            <div>
              <dt>{t.workflow.longestWait}</dt>
              <dd>{t.workflow.wait(cost.waitHours)}</dd>
            </div>
          </dl>
        )}
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {spec.slots.map((s) => (
          <fieldset key={s.id} disabled={mustDiagnose} className="rounded-lg border border-border bg-surface p-3">
            <legend className="px-1 font-bold">{s.label}</legend>
            {guided && <p className="text-sm text-muted">{s.help}</p>}
            <div className="mt-2 space-y-1">
              {s.options.map((o) => (
                <label key={o.id} className="option">
                  <input
                    type="radio"
                    name={`${uid}-${s.id}`}
                    checked={arrangement[s.id] === o.id}
                    onChange={() => setArrangement((a) => ({ ...a, [s.id]: o.id }))}
                  />
                  <span>
                    {o.label}
                    {o.cost && (o.cost.staffHours || o.cost.waitHours) ? (
                      <span className="block text-sm text-muted">{t.workflow.optionCost(o.cost.staffHours ?? 0, o.cost.waitHours ?? 0)}</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {results && (
        <section className="mt-6" aria-labelledby={`${uid}-results`}>
          <h3 ref={resultsRef} id={`${uid}-results`} tabIndex={-1} className="text-lg font-bold outline-offset-4">{t.workflow.results(runCount)}</h3>
          <p role="status" className="text-sm">{t.workflow.passed(results.filter((r) => r.passed).length, results.length)}</p>
          <ul className="mt-2 space-y-2">
            {results.map((r) => (
              <li key={r.test.id} className="rounded-lg border border-border bg-surface p-3">
                <p className="font-bold">
                  <span aria-hidden="true" className={r.passed ? "mark-yes" : "mark-no"}>{r.passed ? "✔ " : "✖ "}</span>
                  {r.passed ? t.workflow.pass : t.workflow.fail}: {r.test.input}
                </p>
                <p className="mt-1 text-sm">{r.result}</p>
                {!r.passed && shownFailure && (
                  <button type="button" onClick={() => setSelected(r.test.id)} aria-pressed={focusResult?.test.id === r.test.id} className="mt-2 btn btn-secondary btn-small">
                    {t.workflow.showInDiagram}<span className="sr-only">: {r.test.input}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {runCount > 0 && firstFailures.length > 0 && (
        <section ref={diagRef} className="reveal mt-6 rounded-lg border-2 border-border p-4" aria-labelledby={`${uid}-diag`}>
          <h3 id={`${uid}-diag`} className="text-lg font-bold">{t.workflow.diagnoseTitle}</h3>
          <p className="text-sm">{t.workflow.diagnoseIntro}</p>
          <ul className="mt-3 space-y-3">
            {firstFailures.map((f) => {
              const right = diagnosed && diagnosis[f.test.id] === f.slot;
              return (
                <li key={f.test.id}>
                  <label htmlFor={`${uid}-d-${f.test.id}`} className="font-bold">{f.test.input}</label>
                  <p className="text-sm">{f.result}</p>
                  <select
                    id={`${uid}-d-${f.test.id}`}
                    disabled={diagnosed}
                    value={diagnosis[f.test.id] ?? ""}
                    onChange={(e) => setDiagnosis((d) => ({ ...d, [f.test.id]: e.target.value }))}
                    className="mt-1 block w-full max-w-sm rounded border border-border bg-background px-2 py-1.5"
                  >
                    <option value="" disabled>{t.workflow.whichStep}</option>
                    {spec.slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  {diagnosed && (
                    <p className="mt-1 text-sm">
                      <span aria-hidden="true" className={right ? "mark-yes" : "mark-no"}>{right ? "✔ " : "✖ "}</span>
                      {right ? t.workflow.diagnosisRight : t.workflow.diagnosisWrong(label(f.slot!))}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {allPassed && !stale && (
        <div role="status" className="mt-5 rounded-lg border-2 border-[var(--mark-yes)] p-4">
          <p><strong><span aria-hidden="true" className="mark-yes">✔ </span>{t.workflow.allPass}</strong></p>
        </div>
      )}

      <ActionBar note={note}>
        {mustDiagnose ? (
          <button
            type="button"
            disabled={firstFailures.some((f) => !diagnosis[f.test.id])}
            onClick={() => {
              for (const f of firstFailures) onEvidence(itemKey(stepId, "diagnose", f.test.id), { right: diagnosis[f.test.id] === f.slot });
              setDiagnosed(true);
            }}
            className="btn btn-primary"
          >
            {t.workflow.checkDiagnosis}
          </button>
        ) : null}
        {mustDiagnose ? (
          <button type="button" disabled className="btn btn-secondary">{t.workflow.rerun}</button>
        ) : allPassed && !stale ? (
          <button type="button" onClick={onContinue} className="btn btn-primary">{t.mission.next}</button>
        ) : (
          <>
            <button type="button" onClick={run} className="btn btn-primary">{runCount === 0 ? t.workflow.run : t.workflow.rerun}</button>
            {runCount > 0 && !allPassed && (
              <button
                type="button"
                onClick={() => {
                  setArrangement(spec.solution);
                  setUsedSolution(true);
                }}
                className="btn btn-secondary"
              >
                {t.workflow.showMe}
              </button>
            )}
          </>
        )}
      </ActionBar>
    </div>
  );
}

function Box({ title, text, failed, arrow }: { title: string; text: string; failed?: boolean; arrow?: boolean }) {
  return (
    <li className="flex flex-1 flex-col lg:min-w-[9rem] lg:flex-row lg:items-center">
      {arrow && (
        <span aria-hidden="true" className="self-center px-1 text-xl text-muted">
          <span className="lg:hidden">↓</span>
          <span className="hidden lg:inline">→</span>
        </span>
      )}
      <div className={`flex-1 rounded-lg p-2 text-sm ${failed ? "border-2 border-[var(--mark-no)] bg-surface" : "border border-border bg-surface"}`}>
        <p className="font-bold">
          {failed && <span className="mark-no"><span aria-hidden="true">✖ </span><span className="sr-only">{t.workflow.failedHere} </span></span>}
          {title}
        </p>
        <p>{text}</p>
      </div>
    </li>
  );
}
