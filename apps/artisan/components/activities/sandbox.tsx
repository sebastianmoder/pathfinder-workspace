"use client";

import { useEffect, useId, useRef } from "react";
import type { SandboxTask, Step } from "@/content/types";
import type { EvidenceResult } from "@/lib/evidence";
import { itemKey } from "@/lib/evidence";
import { askMachine, goalMet, isStale, type AskRecord } from "@/lib/sandbox";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

type SandboxStep = Extract<Step, { kind: "sandbox" }>;

interface SandboxState {
  taskIndex: number;
  /** Sentences switched on now. */
  on: string[];
  /** Sentences at the last training. The machine knows nothing else. */
  trained: string[] | null;
  revealed: string[];
  predicted: string | null;
  said: boolean;
  last: AskRecord | null;
  asks: number;
  met: boolean;
}

/** Opens a task, applying its setup. A task with no setup carries on from the board the learner left. */
function enterTask(task: SandboxTask, index: number, previous: Pick<SandboxState, "on" | "trained" | "revealed">): SandboxState {
  const on = task.setup?.on ?? previous.on;
  return {
    taskIndex: index,
    on,
    trained: task.setup?.train ? on : task.setup?.on ? null : previous.trained,
    revealed: [...previous.revealed, ...(task.setup?.reveal ?? [])],
    predicted: null,
    said: false,
    last: null,
    asks: 0,
    met: false,
  };
}

export function SandboxActivity({
  missionId,
  step,
  onEvidence,
  onContinue,
}: {
  missionId: string;
  step: SandboxStep;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const session = useSession();
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const state =
    (session.progress(missionId).stepState[step.id] as SandboxState | undefined) ??
    enterTask(step.tasks[0], 0, { on: [], trained: null, revealed: [] });
  const set = (patch: Partial<SandboxState>) => session.setStepState(missionId, step.id, { ...state, ...patch });

  const task = step.tasks[state.taskIndex];
  const isLastTask = state.taskIndex === step.tasks.length - 1;
  const stale = isStale(state.on, state.trained);
  const waitingToSay = !!task.say && !state.said;
  const item = itemKey(step.id, task.id);

  // The previous task's controls have gone, so focus moves to the new task.
  const taskHeading = useRef<HTMLHeadingElement>(null);
  const seenTask = useRef(state.taskIndex);
  useEffect(() => {
    if (seenTask.current !== state.taskIndex) {
      seenTask.current = state.taskIndex;
      taskHeading.current?.focus();
    }
  }, [state.taskIndex]);

  function toggle(id: string, checked: boolean) {
    set({ on: checked ? [...state.on, id] : state.on.filter((x) => x !== id) });
  }

  function setGroup(groupId: string, checked: boolean) {
    const ids = step.sentences.filter((s) => s.group === groupId).map((s) => s.id);
    set({ on: checked ? [...new Set([...state.on, ...ids])] : state.on.filter((x) => !ids.includes(x)) });
  }

  function ask() {
    if (!state.trained || !state.predicted) return;
    const record = askMachine(step.sentences, state.trained, step.promptText, state.predicted, state.said);
    const met = goalMet(task.goal, record);
    if (task.evidence === "firstAsk") onEvidence(item, { right: met });
    if (task.evidence === "prediction" && state.asks === 0) onEvidence(item, { right: record.word === state.predicted });
    set({ last: record, predicted: null, asks: state.asks + 1, met: state.met || met });
  }

  function showSolution() {
    if (!task.solution) return;
    // Recorded as help now, so that the worked solution can't count as solving it first time.
    if (task.evidence === "firstAsk") onEvidence(item, { right: false, assisted: true });
    set({ on: task.solution });
  }

  const reached = {
    data: true,
    training: !stale,
    model: !stale,
    input: !stale && (!!state.predicted || !!state.last),
    output: !stale && !!state.last,
  };
  const groups = step.groups.filter((g) => step.sentences.some((s) => s.group === g.id && (s.group !== "news" || state.revealed.includes(s.id))));

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1">{step.intro}</p>
      <p className="mt-1 text-sm text-muted">{t.sandbox.label}</p>

      <ol className="mt-4 grid gap-2 sm:grid-cols-5" aria-label={t.sandbox.pipeline}>
        {step.stages.map((stage) => (
          <li
            key={stage.id}
            className={`rounded-lg border p-2 text-sm ${reached[stage.id] ? "border-accent bg-surface" : "border-border text-muted"}`}
          >
            <strong>
              <span aria-hidden="true">{reached[stage.id] ? "● " : "○ "}</span>
              {stage.title}
            </strong>
            <span className="sr-only"> ({reached[stage.id] ? t.sandbox.reached : t.sandbox.notReached})</span>
            <span className="mt-1 block">{stage.text}</span>
          </li>
        ))}
      </ol>

      <section className="mat mt-4 p-4 sm:p-6" aria-label={t.sandbox.taskLabel}>
        <div className="sheet p-4">
          <p className="text-sm text-muted">{t.sandbox.progress(state.taskIndex + 1, step.tasks.length)}</p>
          <h3 ref={taskHeading} tabIndex={-1} className="text-lg font-bold">{task.title}</h3>
          <p className="mt-1">{task.instruction}</p>
        </div>
      </section>

      <div className="mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div>
          <h3 className="font-bold">{t.sandbox.board}</h3>
          <div className="mt-2 space-y-3">
            {groups.map((g) => {
              const sentences = step.sentences.filter((s) => s.group === g.id && (s.group !== "news" || state.revealed.includes(s.id)));
              const allOn = sentences.every((s) => state.on.includes(s.id));
              return (
                <fieldset key={g.id} className="rounded-lg border border-border bg-surface p-3">
                  <legend className="px-1 text-sm font-bold">{g.label}</legend>
                  <button type="button" onClick={() => setGroup(g.id, !allOn)} className="btn btn-secondary btn-small">
                    {allOn ? t.sandbox.allOff : t.sandbox.allOn}<span className="sr-only">: {g.label}</span>
                  </button>
                  <div className="mt-2 space-y-1">
                    {sentences.map((s) => (
                      <label key={s.id} className="flex cursor-pointer items-start gap-2 font-mono text-sm">
                        <input type="checkbox" checked={state.on.includes(s.id)} onChange={(e) => toggle(s.id, e.target.checked)} className="mt-1" />
                        <span>{s.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={state.on.length === 0 || !stale}
              onClick={() => set({ trained: state.on, predicted: null })}
              className="btn btn-primary"
            >
              {t.sandbox.train}
            </button>
            {task.solution && !state.met && (
              <button type="button" onClick={showSolution} className="btn btn-secondary btn-small">{t.sandbox.showWay}</button>
            )}
          </div>
          <p role="status" className="mt-2 text-sm">
            {state.trained === null
              ? t.sandbox.untrained
              : stale
                ? t.sandbox.stale(state.trained.length)
                : t.sandbox.trained(state.trained.length)}
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <h3 className="font-bold">{t.sandbox.machine}</h3>
          <p className="sheet mt-2 p-3 font-mono">
            {step.promptText} <span aria-hidden="true">▁▁▁</span>
            <span className="sr-only">{t.mission.blank}</span>
          </p>

          {task.say && (
            <div className="mt-3 rounded-lg border border-border bg-surface p-3">
              <p className="text-sm font-semibold">{t.sandbox.youSay}</p>
              <p className="mt-1">{task.say}</p>
              <button type="button" disabled={state.said} onClick={() => set({ said: true })} className="mt-2 btn btn-secondary btn-small">
                {state.said ? t.sandbox.said : t.sandbox.say}
              </button>
            </div>
          )}

          <fieldset className="mt-3" disabled={state.trained === null || waitingToSay}>
            <legend className="text-sm font-bold">{t.sandbox.predict}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {step.words.map((word) => (
                <label key={word} className="option-compact">
                  <input type="radio" name={`${uid}-predict`} checked={state.predicted === word} onChange={() => set({ predicted: word })} />
                  {word}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" disabled={!state.trained || !state.predicted || waitingToSay} onClick={ask} className="mt-3 btn btn-primary">
            {t.sandbox.ask}
          </button>
          {state.trained !== null && !state.predicted && !waitingToSay && (
            <p className="mt-2 text-sm text-muted">{t.sandbox.predictFirst}</p>
          )}

          <div role="status" className="mt-4">
            {state.last && <Reply step={step} task={task} ask={state.last} />}
          </div>
        </div>
      </div>

      {state.met && (
        <div className="mt-5 rounded-lg border border-accent bg-surface p-4">
          <p role="status">
            <strong><span aria-hidden="true" className="mark-yes">✔ </span>{t.sandbox.taskDone}</strong> {task.success}
            {task.showCount && state.last && <> {t.sandbox.used(state.last.trainedIds.length)}</>}
          </p>
          <button
            type="button"
            onClick={() => {
              if (isLastTask) onContinue();
              else session.setStepState(missionId, step.id, enterTask(step.tasks[state.taskIndex + 1], state.taskIndex + 1, state));
            }}
            className="mt-3 btn btn-primary"
          >
            {isLastTask ? t.mission.next : t.sandbox.nextTask}
          </button>
        </div>
      )}
    </div>
  );
}

function Reply({ step, task, ask }: { step: SandboxStep; task: SandboxTask; ask: AskRecord }) {
  const matches = ask.word === task.truth.word;
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-semibold">{t.sandbox.replyLabel}</p>
      <p className="mt-1 text-lg">{ask.word ? step.replyTemplate.replace("{word}", ask.word) : t.sandbox.noReply}</p>
      <p className="mt-3 text-sm">
        <strong>{t.sandbox.yourPrediction}:</strong> {ask.predicted}{" "}
        <span aria-hidden="true" className={ask.predicted === ask.word ? "mark-yes" : "mark-no"}>{ask.predicted === ask.word ? "✔" : "✖"}</span>
        <span className="sr-only">({ask.predicted === ask.word ? t.sandbox.predictionRight : t.sandbox.predictionWrong})</span>
        <br />
        <strong>{t.sandbox.truth}:</strong> {task.truth.text}{" "}
        <span aria-hidden="true" className={matches ? "mark-yes" : "mark-no"}>{matches ? "✔" : "✖"}</span>
        <span className="sr-only">({matches ? t.sandbox.replyMatches : t.sandbox.replyDiffers})</span>
      </p>
      {ask.ranked.length > 0 && (
        <details className="mt-3 text-sm" open>
          <summary className="cursor-pointer font-semibold">{t.sandbox.why}</summary>
          <p className="mt-1 text-muted">{t.sandbox.context(ask.contextUsed!, ask.trainedIds.length)}</p>
          <table className="mt-2 w-full text-left">
            <caption className="sr-only">{t.sandbox.tableCaption}</caption>
            <thead>
              <tr><th className="pr-3">{t.sandbox.word}</th><th className="pr-3">{t.sandbox.count}</th><th>{t.sandbox.share}</th></tr>
            </thead>
            <tbody>
              {ask.ranked.map((r, i) => (
                <tr key={r.word}>
                  <td className="pr-3 font-mono">{i === 0 && <span aria-hidden="true">★ </span>}{r.word}{i === 0 && <span className="sr-only"> {t.sandbox.chosen}</span>}</td>
                  <td className="pr-3">{r.count}</td>
                  <td>
                    <span aria-hidden="true" className="inline-block h-2 bg-accent align-middle" style={{ width: `${Math.round(r.share * 100)}px` }} />{" "}
                    {Math.round(r.share * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
