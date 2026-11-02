"use client";

import { useId } from "react";
import type { Step } from "@/content/types";
import type { ClaimAnswer } from "@/lib/audit";
import type { EvidenceResult } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

type OpenStep = Extract<Step, { kind: "openResponse" }>;
interface State {
  text: string;
  revealed: boolean;
  skipped: boolean;
  met: string[];
}

/** Free text is self-assessed against a visible rubric. Nothing reads or grades it (PRD §12). */
export function OpenResponse({
  missionId,
  step,
  onEvidence,
  onContinue,
}: {
  missionId: string;
  step: OpenStep;
  onEvidence: (result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const session = useSession();
  const progress = session.progress(missionId);
  const state = (progress.stepState[step.id] as State | undefined) ?? { text: "", revealed: false, skipped: false, met: [] };
  const set = (patch: Partial<State>) => session.setStepState(missionId, step.id, { ...state, ...patch });
  const fieldId = useId(); // unique across hidden kept-alive pages, which stay in the DOM

  const audit = step.priorReason && (progress.stepState[step.priorReason.stepId] as { answers?: Record<string, ClaimAnswer> } | undefined);
  const prior = step.priorReason ? audit?.answers?.[step.priorReason.claimId]?.reason?.trim() : undefined;
  const wrote = !!state.text.trim() || !!prior;

  return (
    <div>
      <h2 className="text-2xl">{step.prompt}</h2>
      <p className="mt-2 text-sm text-muted">{t.open.privacy}</p>
      {prior && (
        <div className="mt-4">
          <p className="font-bold">{t.open.prior}</p>
          <blockquote className="mt-1 whitespace-pre-wrap border-l-4 border-border pl-3">{prior}</blockquote>
          <p className="mt-2 text-sm text-muted">{t.open.priorHelp}</p>
        </div>
      )}
      <label htmlFor={fieldId} className="mt-4 block font-bold">{t.open.label}</label>
      <textarea
        id={fieldId}
        rows={5}
        value={state.text}
        onChange={(e) => set({ text: e.target.value })}
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
      />
      {!state.revealed && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={!wrote} onClick={() => set({ revealed: true })} className="btn btn-primary">
            {t.open.showCriteria}
          </button>
          {!wrote && (
            <button type="button" onClick={() => set({ revealed: true, skipped: true })} className="btn btn-secondary">
              {t.open.skip}
            </button>
          )}
        </div>
      )}
      {state.revealed && (
        <div className="mt-5">
          {state.skipped ? (
            <>
              <h3 className="font-bold">{t.open.criteriaList}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {step.rubric.criteria.map((c) => <li key={c.id}>{c.text}</li>)}
              </ul>
            </>
          ) : (
            <fieldset>
              <legend className="font-bold">{t.open.criteria}</legend>
              <div className="mt-2 space-y-2">
                {step.rubric.criteria.map((c) => (
                  <label key={c.id} className="option">
                    <input
                      type="checkbox"
                      checked={state.met.includes(c.id)}
                      onChange={(e) =>
                        set({ met: e.target.checked ? [...state.met, c.id] : state.met.filter((x) => x !== c.id) })
                      }
                      className="mt-1"
                    />
                    <span>{c.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <h3 className="mt-4 font-bold">{t.open.examples}</h3>
          <ul className="mt-1 list-disc space-y-2 pl-5 text-sm">
            {step.rubric.examples.map((e) => <li key={e}>{e}</li>)}
          </ul>
          {!state.skipped && <p className="mt-3 text-sm text-muted">{t.open.selfAssessed}</p>}
          <button
            type="button"
            onClick={() => {
              onEvidence(
                state.skipped
                  ? { right: false, skipped: true }
                  : { right: false, selfAssessed: { met: state.met.length, total: step.rubric.criteria.length } },
              );
              onContinue();
            }}
            className="mt-4 btn btn-primary"
          >
            {t.mission.next}
          </button>
        </div>
      )}
    </div>
  );
}
