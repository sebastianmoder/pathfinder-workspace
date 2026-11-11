"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { GymProblem } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { isRight, solveResult } from "@/lib/gym";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";

/**
 * Attempt, choose help, try again (PRD M06). Help is offered after a first attempt, each kind says what it
 * does for the learner, and nothing about using help is treated as failure. A numeric problem takes a typed
 * answer, so the help is what gets a learner there, not ruling options out. With no help on offer, the
 * same problems serve as an unaided transfer.
 */
export function HelpGym({
  stepId,
  problems,
  onEvidence,
  onContinue,
}: {
  stepId: string;
  problems: GymProblem[];
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [helpsUsed, setHelpsUsed] = useState<string[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [index]);

  const problem = problems[index];
  const unaided = problem.helps.length === 0;
  const solved = checked !== null && isRight(problem, checked);
  const explanation = problem.numeric ? problem.numeric.explanation : problem.choices?.find((c) => c.id === checked)?.explanation;

  const check = () => {
    if (!selected) return;
    const right = isRight(problem, selected);
    if (attempts === 0) onEvidence(itemKey(stepId, problem.id, "attempt"), { right });
    if (right) onEvidence(itemKey(stepId, problem.id), solveResult(problem, helpsUsed));
    setAttempts((n) => n + 1);
    setChecked(selected);
  };

  const next = () => {
    if (index + 1 < problems.length) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(null);
      setAttempts(0);
      setHelpsUsed([]);
    } else onContinue();
  };

  const feedbackRef = useReveal<HTMLDivElement>(attempts > 0 ? `${index}-${attempts}` : null);
  const usedLabels = problem.helps.filter((h) => helpsUsed.includes(h.id)).map((h) => h.label);
  const sawAnswer = problem.helps.some((h) => h.givesAnswer && helpsUsed.includes(h.id));

  return (
    <div>
      {problems.length > 1 && <p className="text-sm font-bold">{t.gym.problem(index + 1, problems.length)}</p>}
      <h3 ref={titleRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">{problem.title}</h3>
      <div className="mat mt-3 p-3 sm:p-5">
        <p className="sheet p-4 sm:p-5">{problem.text}</p>
      </div>
      {attempts === 0 && <p className="mt-3 text-sm text-muted">{unaided ? t.gym.attemptUnaided : t.gym.attemptFirst}</p>}

      {problem.numeric ? (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <label htmlFor={`${uid}-${problem.id}-answer`} className="block font-bold">{problem.numeric.label}</label>
          <div className="mt-1 flex items-center gap-2">
            {problem.numeric.prefix && <span aria-hidden="true">{problem.numeric.prefix}</span>}
            <input
              id={`${uid}-${problem.id}-answer`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={selected ?? ""}
              disabled={solved}
              onChange={(e) => {
                setSelected(e.target.value.trim() ? e.target.value : null);
                setChecked(null);
              }}
              className="w-32 rounded border border-border bg-surface px-3 py-2 tabular-nums"
            />
            {problem.numeric.unit && <span>{problem.numeric.unit}</span>}
          </div>
        </form>
      ) : (
        <fieldset className="mt-4" disabled={solved}>
          <legend className="font-bold">{t.gym.yourAnswer}</legend>
          <div className="mt-2 space-y-2">
            {(problem.choices ?? []).map((c) => (
              <label key={c.id} className="option">
                <input
                  type="radio"
                  name={`${uid}-${problem.id}`}
                  checked={selected === c.id}
                  onChange={() => {
                    setSelected(c.id);
                    setChecked(null);
                  }}
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div ref={feedbackRef} className="reveal">
        {checked && (
          <p role="status" className="mt-3">
            <strong>
              <span aria-hidden="true" className={solved ? "mark-yes" : "mark-no"}>{solved ? "✔ " : "✖ "}</span>
              {solved ? t.gym.right : t.gym.notYet}
            </strong>
            {solved && explanation && <> {explanation}</>}
            {!solved && <> {unaided ? t.gym.checkWorking : t.gym.chooseHelp}</>}
          </p>
        )}
      </div>

      {attempts > 0 && !unaided && (
        <section className="mt-5 rounded-lg border border-border bg-surface p-4" aria-labelledby={`${uid}-help`}>
          <h4 id={`${uid}-help`} className="font-bold">{t.gym.helpHeading}</h4>
          <p className="text-sm text-muted">{t.gym.helpIntro}</p>
          <ul className="mt-3 space-y-3">
            {problem.helps.map((h) => {
              const open = helpsUsed.includes(h.id);
              return (
                <li key={h.id} className="border-l-4 border-border pl-3">
                  <p className="font-bold">{h.label}</p>
                  <p className="text-sm"><span className="font-bold">{t.gym.provides}:</span> {h.provides}</p>
                  {open ? (
                    <p className="mt-2 rounded border border-border bg-background p-3">{h.content}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHelpsUsed((u) => [...u, h.id])}
                      className="mt-2 btn btn-secondary btn-small"
                    >
                      {h.label}<span className="sr-only">: {problem.title}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {solved && (
        <p className="mt-5">{usedLabels.length ? t.gym.usedSummary(usedLabels.join(", ")) : t.gym.noHelp} {sawAnswer ? t.gym.answerNote : usedLabels.length ? t.gym.methodNote : ""}</p>
      )}

      <ActionBar note={!selected && !solved ? (problem.numeric ? t.gym.typeFirst : t.mission.chooseFirst) : checked && !solved ? (unaided ? undefined : t.gym.tryHelp) : undefined}>
        {!solved && (
          <button type="button" disabled={!selected} onClick={check} className="btn btn-primary">
            {t.mission.commit}
          </button>
        )}
        {solved && (
          <button type="button" onClick={next} className="btn btn-primary">
            {index + 1 < problems.length ? t.gym.nextProblem : t.mission.next}
          </button>
        )}
        {problems.length > 1 && <span className="text-sm font-bold">{t.gym.problem(index + 1, problems.length)}</span>}
      </ActionBar>
    </div>
  );
}
