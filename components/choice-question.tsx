"use client";

import { useState } from "react";
import type { Choice, Hint } from "@/content/types";
import { t } from "@/lib/i18n/en";

const VERDICT_MARK = { correct: "✔", defensible: "◆", weaker: "✖" } as const;

interface Props {
  name: string;
  prompt: string;
  choices: Choice[];
  hints?: Hint[];
  /** Show confidence check-in alongside the choice. */
  withConfidence?: boolean;
  initialChoiceId?: string;
  initialConfidence?: number;
  onCommit: (choiceId: string, confidence: number | undefined) => void;
  onContinue: () => void;
}

/** Commit first, then reveal explanations for every option. Retry is always allowed. */
export function ChoiceQuestion({
  name,
  prompt,
  choices,
  hints = [],
  withConfidence,
  initialChoiceId,
  initialConfidence,
  onCommit,
  onContinue,
}: Props) {
  const [selected, setSelected] = useState<string | undefined>(initialChoiceId);
  const [confidence, setConfidence] = useState<number | undefined>(initialConfidence);
  const [committed, setCommitted] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  const picked = choices.find((c) => c.id === selected);
  const acceptable = picked && picked.verdict !== "weaker";

  return (
    <div>
      <fieldset disabled={committed && !!acceptable}>
        <legend className="text-lg font-medium">{prompt}</legend>
        <div className="mt-4 space-y-2">
          {choices.map((c) => (
            <label key={c.id} className="flex cursor-pointer gap-3 rounded-lg border border-border bg-surface p-3 has-[:checked]:border-accent">
              <input
                type="radio"
                name={name}
                value={c.id}
                checked={selected === c.id}
                onChange={() => {
                  setSelected(c.id);
                  setCommitted(false);
                }}
                className="mt-1"
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {withConfidence && (
        <fieldset className="mt-4">
          <legend className="text-sm text-muted">{t.mission.confidenceLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.mission.confidence.map((label, i) => (
              <label key={label} className="flex cursor-pointer items-center gap-1 rounded border border-border px-2 py-1 text-sm has-[:checked]:border-accent">
                <input type="radio" name={`${name}-confidence`} checked={confidence === i} onChange={() => setConfidence(i)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!committed && (
          <button
            type="button"
            disabled={!selected || (withConfidence && confidence === undefined)}
            onClick={() => {
              setCommitted(true);
              onCommit(selected!, confidence);
            }}
            className="rounded bg-accent px-4 py-2 font-medium text-accent-foreground disabled:opacity-50"
          >
            {t.mission.commit}
          </button>
        )}
        {hints.length > 0 && !committed && (
          <button
            type="button"
            onClick={() => setHintsShown((n) => Math.min(n + 1, hints.length))}
            disabled={hintsShown >= hints.length}
            className="rounded border border-border px-3 py-2 text-sm"
          >
            {hintsShown >= hints.length && hintsShown > 0 ? t.mission.noMoreHints : t.mission.help}
          </button>
        )}
        {committed && acceptable && (
          <button type="button" onClick={onContinue} className="rounded bg-accent px-4 py-2 font-medium text-accent-foreground">
            {t.mission.next}
          </button>
        )}
      </div>

      {hintsShown > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {hints.slice(0, hintsShown).map((h) => (
            <li key={h.text}>{h.text}</li>
          ))}
        </ul>
      )}

      {committed && (
        <div role="status" className="mt-5 space-y-2">
          {choices.map((c) => (
            <p key={c.id} className="rounded border border-border p-3 text-sm">
              <strong>
                <span aria-hidden="true">{VERDICT_MARK[c.verdict]} </span>
                {c.label} — {t.mission.verdict[c.verdict]}
              </strong>
              <br />
              {c.explanation}
            </p>
          ))}
          {!acceptable && <p className="text-sm font-medium">{t.mission.retry}: choose another option above.</p>}
        </div>
      )}
    </div>
  );
}
