"use client";

import { useId, useState } from "react";
import type { MarkOptions, MarkParagraph } from "@/content/types";
import { gradeMarks, segmentsOf } from "@/lib/mark";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";

/**
 * Mark the parts of a text that answer a question, by click, tap or keyboard. A check reports how many
 * were found without saying which, so a second try takes thought; "Show the answer" explains everything.
 */
export function MarkText({
  paragraphs,
  claimExplanation,
  onResult,
  onContinue,
  continueLabel,
  mode = "find",
  flow,
}: MarkOptions & {
  paragraphs: MarkParagraph[];
  /** Used for a target with no explanation of its own. */
  claimExplanation?: string;
  onResult: (segmentId: string, right: boolean) => void;
  onContinue: () => void;
  continueLabel?: string;
}) {
  const segments = segmentsOf(paragraphs);
  const [marked, setMarked] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const result = checked ? gradeMarks(segments, checked) : null;
  const flowTitleId = useId();
  const redact = mode === "redact";
  const [checks, setChecks] = useState(0);
  const resultRef = useReveal<HTMLDivElement>(checks);
  const toggle = (id: string) => setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  return (
    <div>
      <div className="mat p-3 sm:p-5">
        <div className="sheet p-4 sm:p-5">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="mt-3 first:mt-0">
              {paragraph.map((part, j) =>
                typeof part === "string" ? (
                  <span key={j}>{part}</span>
                ) : (
                  <span
                    key={part.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={marked.includes(part.id)}
                    onClick={() => toggle(part.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(part.id);
                      }
                    }}
                    className={redact ? "claim redact" : "claim"}
                  >
                    {part.text}
                  </span>
                ),
              )}
            </p>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm">{redact ? t.mark.redactHelp : t.mark.help} <strong>{t.mark.count(marked.length, redact)}</strong></p>

      <div ref={resultRef} className="reveal">
        {result && (
          <div role="status" className="mt-4 text-sm">
            <p>
              <strong>
                <span aria-hidden="true" className={result.right ? "mark-yes" : "mark-no"}>{result.right ? "✔ " : "✖ "}</span>
                {redact ? t.mark.redactResult(result.found, result.targets, result.extra) : t.mark.result(result.found, result.targets, result.extra)}
              </strong>
            </p>
            {!result.right && !revealed && <p className="mt-1">{t.mark.retry}</p>}
            {!revealed && (
              <button type="button" onClick={() => setRevealed(true)} className="mt-2 btn btn-secondary btn-small">
                {t.mission.showAnswer}
              </button>
            )}
            {revealed && (
              <ul className="mt-2 space-y-2">
                {segments.map((s) => (
                  <li key={s.id} className="border-l-4 border-border pl-3">
                    <strong>
                      “{s.text.trim()}”: {s.optional ? t.mark.either : s.target ? (redact ? t.mark.shouldRemove : t.mark.shouldMark) : redact ? t.mark.shouldKeep : t.mark.shouldLeave}.
                    </strong>{" "}
                    {s.explanation || claimExplanation}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {redact && checked && flow && flow.length > 0 && (
          <section className="mt-6" aria-labelledby={flowTitleId}>
            <h3 id={flowTitleId} className="text-lg font-bold">{t.mark.receivesTitle}</h3>
            <ol className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-stretch">
              {flow.map((party, i) => (
                <li key={party.label} className="flex flex-1 flex-col lg:flex-row lg:items-center">
                  {i > 0 && <span aria-hidden="true" className="self-center px-2 text-2xl text-muted lg:py-0"><span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span></span>}
                  <div className="flex-1 rounded-lg border border-border bg-surface p-3">
                    <p className="font-bold">{party.label}</p>
                    <p className="text-sm">{party.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mat mt-3 p-3">
              <div className="sheet p-4">
                <p className="text-sm text-muted">{t.mark.receives}: {flow[0].label}, {t.mark.redactedText}</p>
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="mt-2">
                    {paragraph.map((part, j) =>
                      typeof part === "string" ? <span key={j}>{part}</span> : checked.includes(part.id) ? <span key={part.id} className="text-muted">{t.mark.removed}</span> : <span key={part.id}>{part.text}</span>,
                    )}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <ActionBar>
        <button
          type="button"
          onClick={() => {
            for (const s of segments) if (!s.optional) onResult(s.id, marked.includes(s.id) === s.target);
            setChecked(marked);
            setChecks((n) => n + 1);
          }}
          className="btn btn-primary"
        >
          {t.mission.commit}
        </button>
        {result && (
          <button type="button" onClick={onContinue} className="btn btn-primary">
            {continueLabel ?? t.mission.next}
          </button>
        )}
      </ActionBar>
    </div>
  );
}
