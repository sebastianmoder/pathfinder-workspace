"use client";

import { useId } from "react";
import type { Step } from "@/content/types";
import type { ClaimAnswer } from "@/lib/audit";
import type { EvidenceResult } from "@/lib/evidence";
import { splitSentences } from "@/lib/mark";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

type OpenStep = Extract<Step, { kind: "openResponse" }>;
interface State {
  text: string;
  revealed: boolean;
  skipped: boolean;
  /** Criterion id to the index of the sentence the learner pointed at. */
  pointed: Record<string, number>;
  practiceDone: boolean;
  /** Sample id to the criteria the learner ticked. */
  ratings: Record<string, string[]>;
  compared: boolean;
}

/**
 * Free text is self-assessed against a visible rubric, and nothing reads or grades it (PRD §12).
 * Rating sample answers first makes the criteria usable, and pointing at a sentence keeps the self-rating honest.
 */
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
  const state: State = {
    text: "",
    revealed: false,
    skipped: false,
    pointed: {},
    practiceDone: false,
    ratings: {},
    compared: false,
    ...(progress.stepState[step.id] as Partial<State> | undefined),
  };
  const set = (patch: Partial<State>) => session.setStepState(missionId, step.id, { ...state, ...patch });
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const fieldId = `${uid}-answer`;

  const audit = step.priorReason && (progress.stepState[step.priorReason.stepId] as { answers?: Record<string, ClaimAnswer> } | undefined);
  const prior = step.priorReason ? audit?.answers?.[step.priorReason.claimId]?.reason?.trim() : undefined;
  const earlier = step.priorResponse ? (progress.stepState[step.priorResponse] as { text?: string } | undefined)?.text?.trim() : undefined;
  const wrote = !!state.text.trim() || !!prior;
  const sentences = splitSentences(state.text.trim() || prior || "");
  const samples = step.rubric.samples ?? [];

  if (samples.length > 0 && !state.practiceDone) {
    return (
      <div>
        <h2 className="text-2xl">{step.prompt}</h2>
        <h3 className="mt-4 text-lg font-bold">{t.open.practiceTitle}</h3>
        <p className="mt-1">{t.open.practiceIntro}</p>
        <ul className="mt-4 space-y-4">
          {samples.map((sample, i) => (
            <li key={sample.id} className="rounded-lg border border-border bg-surface p-4">
              <fieldset>
                <legend className="font-bold">{t.open.sampleLabel(i + 1)}</legend>
                <blockquote className="mt-1 border-l-4 border-border pl-3">{sample.text}</blockquote>
                <div className="mt-3 space-y-2">
                  {step.rubric.criteria.map((c) => {
                    const ticked = (state.ratings[sample.id] ?? []).includes(c.id);
                    const met = sample.met.includes(c.id);
                    return (
                      <div key={c.id}>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={ticked}
                            onChange={(e) => {
                              const current = state.ratings[sample.id] ?? [];
                              set({ ratings: { ...state.ratings, [sample.id]: e.target.checked ? [...current, c.id] : current.filter((x) => x !== c.id) }, compared: false });
                            }}
                            className="mt-1"
                          />
                          <span>{c.text}</span>
                        </label>
                        {state.compared && (
                          <p className="ml-6 text-sm">
                            <span aria-hidden="true" className={ticked === met ? "mark-yes" : "mark-no"}>{ticked === met ? "✔ " : "✖ "}</span>
                            {met ? t.open.sampleMet : t.open.sampleNotMet}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {state.compared && <p role="status" className="mt-2 text-sm"><strong>{t.open.reviewedNote}:</strong> {sample.note}</p>}
              </fieldset>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          {!state.compared ? (
            <>
              <button type="button" onClick={() => set({ compared: true })} className="btn btn-primary">{t.open.compareRatings}</button>
              <button type="button" onClick={() => set({ practiceDone: true })} className="btn btn-secondary">{t.open.skipPractice}</button>
            </>
          ) : (
            <button type="button" onClick={() => set({ practiceDone: true })} className="btn btn-primary">{t.open.writeMine}</button>
          )}
        </div>
      </div>
    );
  }

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
      {earlier && (
        <div className="mt-4">
          <p className="font-bold">{t.open.earlier}</p>
          <blockquote className="mt-1 whitespace-pre-wrap border-l-4 border-border pl-3">{earlier}</blockquote>
          {!state.text.trim() && (
            <button type="button" onClick={() => set({ text: earlier })} className="mt-2 btn btn-secondary btn-small">{t.open.startFromEarlier}</button>
          )}
        </div>
      )}
      <label htmlFor={fieldId} className="mt-4 block font-bold">{t.open.label}</label>
      <textarea
        id={fieldId}
        rows={5}
        value={state.text}
        onChange={(e) => set({ text: e.target.value, pointed: {} })}
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
            <>
              <h3 className="font-bold">{t.open.criteria}</h3>
              <p className="text-sm text-muted">{t.open.pointHelp}</p>
              <div className="mt-2 space-y-3">
                {step.rubric.criteria.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border bg-surface p-3">
                    <label htmlFor={`${uid}-${c.id}`} className="block">{c.text}</label>
                    <select
                      id={`${uid}-${c.id}`}
                      value={state.pointed[c.id] ?? ""}
                      onChange={(e) => {
                        const pointed = { ...state.pointed };
                        if (e.target.value === "") delete pointed[c.id];
                        else pointed[c.id] = Number(e.target.value);
                        set({ pointed });
                      }}
                      className="mt-1 block w-full rounded border border-border bg-background px-2 py-1.5"
                    >
                      <option value="">{t.open.noSentence}</option>
                      {sentences.map((s, i) => <option key={i} value={i}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
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
                  : { right: false, selfAssessed: { met: Object.keys(state.pointed).length, total: step.rubric.criteria.length } },
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
