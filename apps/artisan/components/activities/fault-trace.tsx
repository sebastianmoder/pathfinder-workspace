"use client";

import { useId, useState } from "react";
import type { Step } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";

type FaultStep = Extract<Step, { kind: "faultTrace" }>;

/** Each failure is traced to one stage. A wrong answer gets no explanation until asked for, so a retry takes thought. */
export function FaultTrace({
  step,
  onEvidence,
  onContinue,
}: {
  step: FaultStep;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const label = (id: string) => step.stages.find((s) => s.id === id)?.label;

  const allPicked = step.cases.every((c) => picked[c.id]);
  const anyChecked = Object.keys(checked).length > 0;

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1">{step.prompt}</p>
      <dl className="mt-3 grid gap-2 rounded-lg border border-border bg-surface p-3 text-sm sm:grid-cols-2">
        {step.stages.map((s) => (
          <div key={s.id}>
            <dt className="font-bold">{s.label}</dt>
            <dd>{s.help}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-4 space-y-3">
        {step.cases.map((c) => {
          const isChecked = checked[c.id] !== undefined && checked[c.id] === picked[c.id];
          const right = checked[c.id] === c.stageId;
          return (
            <li key={c.id} className="rounded-lg border border-border bg-surface p-3">
              <fieldset>
                <legend className="font-bold">{c.text}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {step.stages.map((s) => (
                    <label key={s.id} className="option-compact">
                      <input
                        type="radio"
                        name={`${uid}-${c.id}`}
                        checked={picked[c.id] === s.id}
                        onChange={() => setPicked((p) => ({ ...p, [c.id]: s.id }))}
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {isChecked && (
                <div role="status" className="mt-2 text-sm">
                  <p>
                    <strong><span aria-hidden="true" className={right ? "mark-yes" : "mark-no"}>{right ? "✔ " : "✖ "}</span>{right ? t.faultTrace.fits : t.faultTrace.lookAgain}</strong>
                    {(right || revealed.includes(c.id)) && <> {!right && t.faultTrace.reviewed(label(c.stageId)!)} {c.explanation}</>}
                  </p>
                  {!right && !revealed.includes(c.id) && (
                    <button type="button" onClick={() => setRevealed((r) => [...r, c.id])} className="mt-1 btn btn-secondary btn-small">
                      {t.mission.showAnswer}<span className="sr-only">: {c.text}</span>
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!allPicked}
          onClick={() => {
            for (const c of step.cases) {
              onEvidence(itemKey(step.id, c.id), { right: picked[c.id] === c.stageId, assisted: revealed.includes(c.id) });
            }
            setChecked(picked);
          }}
          className="btn btn-primary"
        >
          {t.mission.commit}
        </button>
        {anyChecked && (
          <button type="button" onClick={onContinue} className="btn btn-primary">{t.mission.next}</button>
        )}
      </div>
      {anyChecked && <p className="mt-3 text-sm">{t.faultTrace.retryNote}</p>}
    </div>
  );
}
