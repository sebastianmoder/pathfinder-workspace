"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CasefileSpec, CaseStatus } from "@/content/types";
import { expectedStatus, timelineFor } from "@/lib/casefile";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";

const STATUSES: CaseStatus[] = ["known", "uncertain", "contradicted"];

/**
 * Follow leads with limited time, then say what is established, contradicted or still uncertain (PRD M08).
 * Judgments are checked against what this learner found, so honest uncertainty is never marked wrong.
 */
export function Casefile({
  stepId,
  spec,
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: CasefileSpec;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const [followed, setFollowed] = useState<string[]>([]);
  const [phase, setPhase] = useState<"investigate" | "judge">("investigate");
  const [answers, setAnswers] = useState<Record<string, CaseStatus>>({});
  const [checked, setChecked] = useState<Record<string, CaseStatus> | null>(null);
  const judgeRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "judge") judgeRef.current?.focus();
  }, [phase]);

  const left = spec.budget ? spec.budget.leads - followed.length : null;
  const timeline = timelineFor(spec, followed);
  const lastPressure = [...followed].reverse().map((id) => spec.leads.find((l) => l.id === id)?.pressure).find(Boolean);
  const leadLabel = (id: string) => spec.leads.find((l) => l.id === id)?.label ?? id;
  const notFollowed = spec.leads.filter((l) => !followed.includes(l.id));
  const resultsRef = useReveal<HTMLUListElement>(checked);

  const Artifact = (
    <div className="mat p-3 sm:p-5">
      <div className="sheet p-4 sm:p-5">
        <p className="text-sm text-muted">{spec.artifact.label}</p>
        <p className="mt-1 text-lg font-bold">{spec.artifact.title}</p>
        <p className="mt-2">{spec.artifact.body}</p>
        <p className="mt-2 text-sm text-muted">{spec.artifact.meta}</p>
      </div>
    </div>
  );

  const Timeline = timeline.length > 0 && (
    <section aria-labelledby={`${uid}-tl`} className="rounded-lg border border-border bg-surface p-4">
      <h4 id={`${uid}-tl`} className="font-bold">{t.casefile.timeline}</h4>
      <ol className="mt-2 space-y-2 border-l-2 border-border pl-4">
        {timeline.map((e) => (
          <li key={`${e.order}-${e.text}`}>
            <span className="font-bold">{e.when}:</span> {e.text}
          </li>
        ))}
      </ol>
    </section>
  );

  if (phase === "investigate") {
    return (
      <div>
        {Artifact}
        <div className="mt-5 lg:grid lg:grid-cols-[3fr_2fr] lg:gap-6">
          <section aria-labelledby={`${uid}-leads`}>
            <h3 id={`${uid}-leads`} className="text-xl font-bold">{t.casefile.leads}</h3>
            {spec.budget && (
              <p role="status" className="mt-1 font-bold">{t.casefile.left(left!, spec.budget.leads)} <span className="font-normal">{spec.budget.note}</span></p>
            )}
            <ul className="mt-3 space-y-3">
              {spec.leads.map((lead) => {
                const done = followed.includes(lead.id);
                return (
                  <li key={lead.id} className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-sm text-muted">{t.casefile.kind[lead.kind]}</p>
                    <p className="font-bold">{lead.label}</p>
                    <p className="text-sm">{lead.description}</p>
                    {done ? (
                      <p className="mt-2 border-l-4 border-[var(--highlighter)] pl-3"><span className="font-bold">{t.casefile.found}:</span> {lead.finding}</p>
                    ) : (
                      <button
                        type="button"
                        disabled={left !== null && left <= 0}
                        onClick={() => setFollowed((f) => [...f, lead.id])}
                        className="mt-2 btn btn-secondary btn-small"
                      >
                        {t.casefile.follow}<span className="sr-only">: {lead.label}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <div className="mt-5 space-y-4 lg:sticky lg:top-4 lg:mt-0 lg:self-start">
            {lastPressure && (
              <p aria-live="polite" className="rounded-lg border-l-4 border-[var(--mark-no)] bg-surface p-3"><strong>{t.casefile.message}</strong> {lastPressure}</p>
            )}
            {Timeline}
          </div>
        </div>
        <ActionBar note={t.casefile.finishNote}>
          <button type="button" onClick={() => setPhase("judge")} className="btn btn-primary">{t.casefile.finish}</button>
          {spec.budget && <span className="text-sm font-bold">{t.casefile.leftShort(left!)}</span>}
        </ActionBar>
      </div>
    );
  }

  const allAnswered = spec.statements.every((s) => answers[s.id]);
  return (
    <div>
      <h3 ref={judgeRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">{t.casefile.judgeTitle}</h3>
      <p className="mt-1">{t.casefile.judgeIntro}</p>
      <details className="mt-3 rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer font-bold">{t.casefile.yourNotes(followed.length)}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {followed.map((id) => {
            const l = spec.leads.find((x) => x.id === id)!;
            return <li key={id}><strong>{l.label}:</strong> {l.finding}</li>;
          })}
        </ul>
        {timeline.length > 0 && <div className="mt-3">{Timeline}</div>}
      </details>

      <ul ref={resultsRef} className="reveal mt-4 space-y-3">
        {spec.statements.map((s) => {
          const expected = expectedStatus(s, followed);
          const verdict = checked?.[s.id];
          return (
            <li key={s.id} className="rounded-lg border border-border bg-surface p-3">
              <fieldset>
                <legend className="font-bold">{s.text}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUSES.map((st) => (
                    <label key={st} className="option-compact">
                      <input
                        type="radio"
                        name={`${uid}-${s.id}`}
                        checked={answers[s.id] === st}
                        onChange={() => setAnswers((a) => ({ ...a, [s.id]: st }))}
                      />
                      {t.casefile.status[st]}
                    </label>
                  ))}
                </div>
              </fieldset>
              {verdict && (
                <div role="status" className="mt-2 text-sm">
                  <p>
                    <strong>
                      <span aria-hidden="true" className={verdict === expected ? "mark-yes" : "mark-no"}>{verdict === expected ? "✔ " : "✖ "}</span>
                      {verdict === expected ? t.casefile.fits : t.casefile.lookAgain(t.casefile.status[expected])}
                    </strong>{" "}
                    {s.explanation}
                  </p>
                  {expected !== s.status && <p className="mt-1">{t.casefile.wouldSettle(s.leadIds.map(leadLabel).join("; "), t.casefile.status[s.status])}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {checked && notFollowed.length > 0 && (
        <section className="mt-6 border-2 border-dashed border-border p-4" aria-labelledby={`${uid}-missed`}>
          <h4 id={`${uid}-missed`} className="font-bold">{t.casefile.missedTitle}</h4>
          <p className="text-sm text-muted">{t.casefile.missedNote}</p>
          <ul className="mt-2 space-y-2 text-sm">
            {notFollowed.map((l) => <li key={l.id}><strong>{l.label}:</strong> {l.finding}</li>)}
          </ul>
        </section>
      )}

      <ActionBar note={!allAnswered ? t.mission.placeAll(spec.statements.filter((x) => !answers[x.id]).length) : undefined}>
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => {
            for (const id of spec.keyLeads ?? []) onEvidence(itemKey(stepId, "lead", id), { right: followed.includes(id) });
            for (const s of spec.statements) onEvidence(itemKey(stepId, s.id), { right: answers[s.id] === expectedStatus(s, followed) });
            setChecked(answers);
          }}
          className="btn btn-primary"
        >
          {t.mission.commit}
        </button>
        {checked && <button type="button" onClick={onContinue} className="btn btn-primary">{t.mission.next}</button>}
      </ActionBar>
    </div>
  );
}
