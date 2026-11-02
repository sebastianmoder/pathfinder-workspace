"use client";

import { useId, useState } from "react";
import type { Choice, Hint } from "@/content/types";
import { t } from "@/lib/i18n/en";
import { useHintLadder } from "./hint-ladder";

const VERDICT_MARK = { correct: "✔", defensible: "◆", weaker: "✖" } as const;

interface Props {
  name: string;
  prompt: string;
  choices: Choice[];
  hints?: Hint[];
  /** Show confidence check-in alongside the choice. */
  withConfidence?: boolean;
  /** Initial judgment: record the answer with no verdict, so it can be compared later. */
  recordOnly?: boolean;
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
  recordOnly,
  initialChoiceId,
  initialConfidence,
  onCommit,
  onContinue,
}: Props) {
  // Next keeps recent pages in the DOM while hidden, and radios with the same name interfere across them.
  const group = `${useId()}-${name}`;
  const [selected, setSelected] = useState<string | undefined>(initialChoiceId);
  const [confidence, setConfidence] = useState<number | undefined>(initialConfidence);
  const [committed, setCommitted] = useState(false);
  const ladder = useHintLadder(hints);

  const picked = choices.find((c) => c.id === selected);
  const acceptable = picked && (recordOnly || picked.verdict !== "weaker");

  return (
    <div>
      <fieldset disabled={committed && !!acceptable}>
        <legend className="text-xl font-bold">{prompt}</legend>
        <div className="mt-4 space-y-2">
          {choices.map((c) => (
            <label key={c.id} className="option">
              <input
                type="radio"
                name={group}
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
        <fieldset className="mt-4" disabled={committed && !!acceptable}>
          <legend className="text-sm text-muted">{t.mission.confidenceLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.mission.confidence.map((label, i) => (
              <label key={label} className="option-compact">
                <input type="radio" name={`${group}-confidence`} checked={confidence === i} onChange={() => setConfidence(i)} />
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
            className="btn btn-primary"
          >
            {recordOnly ? t.mission.record : t.mission.commit}
          </button>
        )}
        {!committed && ladder.button}
        {committed && acceptable && (
          <button type="button" onClick={onContinue} className="btn btn-primary">
            {t.mission.next}
          </button>
        )}
      </div>

      {ladder.list}

      {committed && recordOnly && (
        <p role="status" className="mt-4 text-sm">{t.mission.recorded}</p>
      )}

      {committed && !recordOnly && (
        <div role="status" className="mt-5 space-y-2">
          {choices.map((c) => (
            <p key={c.id} className="border-l-4 border-border py-1 pl-3">
              <strong>
                <span aria-hidden="true" className={c.verdict === "weaker" ? "mark-no" : "mark-yes"}>{VERDICT_MARK[c.verdict]} </span>
                {c.label} {t.mission.verdict[c.verdict]}.
              </strong>
              <br />
              {c.explanation}
            </p>
          ))}
          {!acceptable && <p className="font-bold">{t.mission.retryChoice}</p>}
        </div>
      )}
    </div>
  );
}
