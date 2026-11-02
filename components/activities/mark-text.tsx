"use client";

import { useState } from "react";
import type { MarkParagraph } from "@/content/types";
import { gradeMarks, segmentsOf } from "@/lib/mark";
import { t } from "@/lib/i18n/en";

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
}: {
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
                    className="claim"
                  >
                    {part.text}
                  </span>
                ),
              )}
            </p>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{t.mark.help}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            for (const s of segments) if (!s.optional) onResult(s.id, marked.includes(s.id) === s.target);
            setChecked(marked);
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
      </div>

      {result && (
        <div role="status" className="mt-4 text-sm">
          <p>
            <strong>
              <span aria-hidden="true" className={result.right ? "mark-yes" : "mark-no"}>{result.right ? "✔ " : "✖ "}</span>
              {t.mark.result(result.found, result.targets, result.extra)}
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
                    “{s.text.trim()}”: {s.optional ? t.mark.either : s.target ? t.mark.shouldMark : t.mark.shouldLeave}.
                  </strong>{" "}
                  {s.explanation || claimExplanation}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
