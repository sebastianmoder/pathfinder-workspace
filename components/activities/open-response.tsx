"use client";

import type { Step } from "@/content/types";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

type OpenStep = Extract<Step, { kind: "openResponse" }>;
interface State {
  text: string;
  revealed: boolean;
  met: string[];
}

/** Free text is self-assessed against a visible rubric. Nothing reads or grades it (PRD §12). */
export function OpenResponse({ missionId, step, onContinue }: { missionId: string; step: OpenStep; onContinue: () => void }) {
  const session = useSession();
  const state = (session.progress(missionId).stepState[step.id] as State | undefined) ?? { text: "", revealed: false, met: [] };
  const set = (patch: Partial<State>) => session.setStepState(missionId, step.id, { ...state, ...patch });
  const fieldId = `open-${step.id}`;

  return (
    <div>
      <h2 className="text-xl font-medium">{step.prompt}</h2>
      <p className="mt-2 text-sm text-muted">{t.open.privacy}</p>
      <label htmlFor={fieldId} className="mt-4 block font-medium">{t.open.label}</label>
      <textarea
        id={fieldId}
        rows={5}
        value={state.text}
        onChange={(e) => set({ text: e.target.value })}
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
      />
      {!state.revealed && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!state.text.trim()}
            onClick={() => set({ revealed: true })}
            className="rounded bg-accent px-4 py-2 font-medium text-accent-foreground disabled:opacity-50"
          >
            {t.open.showCriteria}
          </button>
          <button type="button" onClick={() => set({ revealed: true })} className="rounded border border-border px-4 py-2">
            {t.open.skip}
          </button>
        </div>
      )}
      {state.revealed && (
        <div className="mt-5">
          <fieldset>
            <legend className="font-medium">{t.open.criteria}</legend>
            <div className="mt-2 space-y-2">
              {step.rubric.criteria.map((c) => (
                <label key={c.id} className="flex cursor-pointer gap-3 rounded-lg border border-border bg-surface p-3">
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
          <h3 className="mt-4 font-medium">{t.open.examples}</h3>
          <ul className="mt-1 list-disc space-y-2 pl-5 text-sm">
            {step.rubric.examples.map((e) => <li key={e}>{e}</li>)}
          </ul>
          <p className="mt-3 text-sm text-muted">{t.open.selfAssessed}</p>
          <button type="button" onClick={onContinue} className="mt-4 rounded bg-accent px-4 py-2 font-medium text-accent-foreground">
            {t.mission.next}
          </button>
        </div>
      )}
    </div>
  );
}
