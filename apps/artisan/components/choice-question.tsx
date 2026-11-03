"use client";

import { useId, useMemo, useState } from "react";
import type { Choice, Hint } from "@/content/types";
import type { EvidenceResult } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { seededShuffle } from "@/lib/shuffle";
import { t } from "@/lib/i18n/en";
import { useHintLadder } from "./hint-ladder";
import { ActionBar, HowTo, useReveal } from "./step-ui";

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
  onEvidence?: (result: EvidenceResult) => void;
  /** Without this, no Continue button appears, for a question that sits inside another step. */
  onContinue?: () => void;
  /** The moves this question asks for, shown above it. */
  howTo?: readonly string[];
}

/**
 * Commit first, then explain. A weaker answer explains only itself, so a retry still takes thought;
 * the full comparison follows a sound answer, or at any time through "Show the answer" (PRD §8).
 */
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
  onEvidence,
  onContinue,
  howTo,
}: Props) {
  // Next keeps recent pages in the DOM while hidden, and radios with the same name interfere across them.
  const group = `${useId()}-${name}`;
  const { orderSeed } = useSession();
  const ordered = useMemo(() => seededShuffle(choices, orderSeed, name), [choices, orderSeed, name]);
  const [selected, setSelected] = useState<string | undefined>(initialChoiceId);
  const [confidence, setConfidence] = useState<number | undefined>(initialConfidence);
  const [committed, setCommitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const ladder = useHintLadder(hints);

  const picked = choices.find((c) => c.id === selected);
  const acceptable = picked && (recordOnly || picked.verdict !== "weaker");
  const showAll = !recordOnly && (revealed || (committed && !!acceptable));
  const feedbackRef = useReveal<HTMLDivElement>(committed ? `${selected}-${revealed}` : null);
  const ready = !!selected && !(withConfidence && confidence === undefined);
  const note = committed
    ? undefined
    : !ready
      ? withConfidence ? t.mission.chooseAndRate : t.mission.chooseFirst
      : undefined;

  return (
    <div>
      {howTo && <div className="mb-4"><HowTo steps={howTo} /></div>}
      <fieldset disabled={committed && !!acceptable}>
        <legend className="text-xl font-bold">{prompt}</legend>
        <div className="mt-4 space-y-2">
          {ordered.map((c) => (
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

      {ladder.list}

      <div ref={feedbackRef} className="reveal">
        {committed && recordOnly && (
          <p role="status" className="mt-4 text-sm">{t.mission.recorded}</p>
        )}
        {showAll && (
          <div role="status" className="mt-5 space-y-2">
            {ordered.map((c) => (
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

        {!showAll && committed && !recordOnly && picked && (
          <div role="status" className="mt-5 space-y-2">
            <p className="border-l-4 border-border py-1 pl-3">
              <strong>
                <span aria-hidden="true" className="mark-no">{VERDICT_MARK.weaker} </span>
                {picked.label} {t.mission.verdict.weaker}.
              </strong>
              <br />
              {picked.explanation}
            </p>
            <p className="font-bold">{t.mission.retryChoice}</p>
            <button type="button" onClick={() => setRevealed(true)} className="btn btn-secondary btn-small">
              {t.mission.showAnswer}
            </button>
          </div>
        )}
      </div>

      {(!committed || (acceptable && onContinue)) && (
        <ActionBar note={note}>
          {!committed && (
            <button
              type="button"
              disabled={!ready}
              onClick={() => {
                setCommitted(true);
                onCommit(selected!, confidence);
                if (!recordOnly) onEvidence?.({ right: picked?.verdict !== "weaker", assisted: ladder.used || revealed });
              }}
              className="btn btn-primary"
            >
              {recordOnly ? t.mission.record : t.mission.commit}
            </button>
          )}
          {!committed && ladder.button}
          {committed && acceptable && onContinue && (
            <button type="button" onClick={onContinue} className="btn btn-primary">
              {t.mission.next}
            </button>
          )}
        </ActionBar>
      )}
    </div>
  );
}
