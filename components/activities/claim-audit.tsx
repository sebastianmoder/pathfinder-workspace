"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import type { AuditSpec, Claim, ClaimAction, ClaimStatus, Source } from "@/content/types";
import { gradeClaim, isComplete, NO_EVIDENCE, type ClaimAnswer } from "@/lib/audit";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

type View = "briefing" | "sources" | "judgment";

interface AuditState {
  answers: Record<string, ClaimAnswer>;
  /** Claims checked at least once. Finishing never depends on being right. */
  done: string[];
  /** Claims whose feedback matches the current answers. */
  showFeedback: string[];
  selected: string | null;
  view: View;
  phase: "audit" | "final";
}

const STATUSES: ClaimStatus[] = ["supported", "unsupported", "outdated", "misleading", "incorrect"];
const ACTIONS: ClaimAction[] = ["retain", "qualify", "correct", "remove"];
const VIEWS: View[] = ["briefing", "sources", "judgment"];

const primary = "btn btn-primary";
const secondary = "btn btn-secondary btn-small";

interface Props {
  missionId: string;
  stepId: string;
  audit: AuditSpec;
  /** Show the annotated final briefing after the last claim. */
  showFinal: boolean;
  onContinue: () => void;
}

export function ClaimAudit({ missionId, stepId, audit, showFinal, onContinue }: Props) {
  const session = useSession();
  const single = audit.claims.length === 1 ? audit.claims[0].id : null;
  const state = (session.progress(missionId).stepState[stepId] as AuditState | undefined) ?? {
    answers: {},
    done: [],
    showFeedback: [],
    selected: single,
    view: "briefing" as View,
    phase: "audit" as const,
  };
  const set = (patch: Partial<AuditState>) => session.setStepState(missionId, stepId, { ...state, ...patch });

  // Narrow screens show one view at a time. When an action swaps the view, the control that was
  // used disappears, so focus moves to the new panel. Wide screens show every panel and keep focus.
  const tabsRef = useRef<HTMLDivElement>(null);
  const panels = useRef<Partial<Record<View, HTMLElement | null>>>({});
  const pendingFocus = useRef(false);
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    if (tabsRef.current?.offsetParent) panels.current[state.view]?.focus();
  }, [state.view, state.selected, state.answers]);

  const finalHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state.phase === "final") finalHeading.current?.focus();
  }, [state.phase]);

  const claim = audit.claims.find((c) => c.id === state.selected) ?? null;

  function updateAnswer(patch: Partial<ClaimAnswer>, extra: Partial<AuditState> = {}) {
    if (!claim) return;
    set({
      answers: { ...state.answers, [claim.id]: { ...state.answers[claim.id], ...patch } },
      showFeedback: state.showFeedback.filter((id) => id !== claim.id),
      ...extra,
    });
  }

  function selectClaim(id: string) {
    pendingFocus.current = true;
    set({ selected: id, view: "judgment" });
  }

  function linkPassage(id: string) {
    pendingFocus.current = true;
    updateAnswer({ evidence: id }, { view: "judgment" });
  }

  if (state.phase === "final") {
    return (
      <FinalBriefing
        audit={audit}
        answers={state.answers}
        headingRef={finalHeading}
        onContinue={onContinue}
      />
    );
  }

  const allDone = audit.claims.every((c) => state.done.includes(c.id));
  const panelClass = (v: View) => `${state.view === v ? "block" : "hidden"} lg:block`;

  return (
    <div>
      <p role="status" className="mb-3 text-sm font-bold">
        {t.audit.progress(audit.claims.filter((c) => state.done.includes(c.id)).length, audit.claims.length)}
      </p>
      <div ref={tabsRef} role="group" aria-label={t.audit.views} className="mb-4 flex flex-wrap gap-2 lg:hidden">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={state.view === v}
            onClick={() => set({ view: v })}
            className="btn btn-secondary btn-small"
          >
            {t.audit.view[v]}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="space-y-4">
          <section
            ref={(el) => { panels.current.briefing = el; }}
            tabIndex={-1}
            aria-label={t.audit.view.briefing}
            className={panelClass("briefing")}
          >
            <div className="mat p-3 sm:p-5">
            <div className="sheet p-4 sm:p-5">
              <p className="text-sm text-muted">{t.audit.aiDraft}</p>
              {audit.briefing.map((paragraph, i) => (
                <p key={i} className="mt-3">
                  {paragraph.map((segment, j) =>
                    typeof segment === "string" ? (
                      <Fragment key={j}>{segment}</Fragment>
                    ) : (
                      <ClaimButton
                        key={j}
                        claim={audit.claims.find((c) => c.id === segment.claimId)!}
                        selected={state.selected === segment.claimId}
                        done={state.done.includes(segment.claimId)}
                        onSelect={selectClaim}
                      />
                    ),
                  )}
                </p>
              ))}
            </div>
            </div>
          </section>

          <section
            ref={(el) => { panels.current.sources = el; }}
            tabIndex={-1}
            aria-label={t.audit.view.sources}
            className={panelClass("sources")}
          >
            <SourceDrawer
              sources={audit.sources}
              linked={claim ? state.answers[claim.id]?.evidence : undefined}
              hasClaim={!!claim}
              onLink={linkPassage}
            />
          </section>
        </div>

        <div>
          <section
            ref={(el) => { panels.current.judgment = el; }}
            tabIndex={-1}
            aria-label={t.audit.view.judgment}
            className={panelClass("judgment")}
          >
            {claim ? (
              <JudgmentPanel
                key={claim.id}
                claim={claim}
                sources={audit.sources}
                answer={state.answers[claim.id] ?? {}}
                showFeedback={state.showFeedback.includes(claim.id)}
                onChange={updateAnswer}
                onOpenSources={() => {
                  pendingFocus.current = true;
                  set({ view: "sources" });
                }}
                onCheck={() =>
                  set({
                    done: state.done.includes(claim.id) ? state.done : [...state.done, claim.id],
                    showFeedback: [...state.showFeedback, claim.id],
                  })
                }
              />
            ) : (
              <p className="rounded-lg border border-border bg-surface p-4">{t.audit.selectClaim}</p>
            )}
          </section>

        </div>
      </div>

      {allDone && (
        <button
          type="button"
          onClick={() => (showFinal ? set({ phase: "final" }) : onContinue())}
          className={`mt-6 ${primary}`}
        >
          {showFinal ? t.audit.finish : t.mission.next}
        </button>
      )}
    </div>
  );
}

/**
 * A span with the button role, because a real <button> can't wrap as inline text and the briefing has
 * to read as prose. It keeps full button behaviour: focusable, and activated by Enter or Space.
 */
function ClaimButton({ claim, selected, done, onSelect }: { claim: Claim; selected: boolean; done: boolean; onSelect: (id: string) => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(claim.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(claim.id);
        }
      }}
      className="claim"
    >
      {claim.text}{" "}
      <span aria-hidden="true">{done ? "✔" : "○"}</span>
      <span className="sr-only"> ({done ? t.audit.checkedMark : t.audit.unchecked})</span>
    </span>
  );
}

function JudgmentPanel({
  claim,
  sources,
  answer,
  showFeedback,
  onChange,
  onOpenSources,
  onCheck,
}: {
  claim: Claim;
  sources: Source[];
  answer: ClaimAnswer;
  showFeedback: boolean;
  onChange: (patch: Partial<ClaimAnswer>) => void;
  onOpenSources: () => void;
  onCheck: () => void;
}) {
  const group = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const [hintShown, setHintShown] = useState(false);
  const linked = sources.flatMap((s) => s.passages.map((p) => ({ ...p, source: s }))).find((p) => p.id === answer.evidence);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-sm text-muted">{t.audit.selectedClaim}</p>
      <p className="font-bold">{claim.text}</p>

      <h3 className="mt-4 font-bold">{t.audit.evidenceHeading}</h3>
      {linked ? (
        <blockquote className="mt-1 border-l-4 border-border pl-3 text-sm">
          <strong>{t.audit.linked} ({linked.source.title}):</strong> {linked.text}
        </blockquote>
      ) : (
        answer.evidence !== NO_EVIDENCE && <p className="mt-1 text-sm">{t.audit.noEvidenceYet}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={onOpenSources} className={`${secondary} lg:hidden`}>{t.audit.openSources}</button>
        <button type="button" aria-pressed={answer.evidence === NO_EVIDENCE} onClick={() => onChange({ evidence: NO_EVIDENCE })} className={`${secondary}`}>
          {answer.evidence === NO_EVIDENCE && <span aria-hidden="true">✔ </span>}
          {t.audit.noSource}
        </button>
      </div>

      <fieldset className="mt-4">
        <legend className="font-bold">{t.audit.statusHeading}</legend>
        <div className="mt-2 space-y-1">
          {STATUSES.map((s) => (
            <label key={s} className="flex cursor-pointer gap-2 text-sm">
              <input type="radio" name={`${group}-status`} checked={answer.status === s} onChange={() => onChange({ status: s })} className="mt-1" />
              <span><strong>{t.audit.status[s].label}.</strong> {t.audit.status[s].help}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="font-bold">{t.audit.actionHeading}</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {ACTIONS.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name={`${group}-action`} checked={answer.action === a} onChange={() => onChange({ action: a })} />
              {t.audit.action[a]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!isComplete(answer)} onClick={onCheck} className={primary}>{t.audit.checkClaim}</button>
        {claim.hint && !hintShown && (
          <button type="button" onClick={() => setHintShown(true)} className={secondary}>{t.audit.hint}</button>
        )}
      </div>
      {!isComplete(answer) && <p className="mt-2 text-sm text-muted">{t.audit.missing}</p>}
      {hintShown && <p className="mt-2 text-sm">{claim.hint}</p>}
      {showFeedback && <ClaimFeedback claim={claim} answer={answer} />}
    </div>
  );
}

function ClaimFeedback({ claim, answer }: { claim: Claim; answer: ClaimAnswer }) {
  const grade = gradeClaim(claim, answer);
  const mark = (ok: boolean) => <span aria-hidden="true" className={ok ? "mark-yes" : "mark-no"}>{ok ? "✔ " : "✖ "}</span>;
  return (
    <div role="status" className="mt-4 space-y-3 border-t border-border pt-3 text-sm">
      <p>
        <strong>{mark(grade.evidence)}{t.audit.feedbackEvidence}: {grade.evidence ? t.audit.right : t.audit.notRight}.</strong>{" "}
        {claim.evidenceExplanation}
      </p>
      <p>
        <strong>{mark(grade.status)}{t.audit.feedbackStatus}: {grade.status ? t.audit.right : t.audit.notRight}.</strong>{" "}
        {!grade.status && <>{t.audit.reviewedStatus(t.audit.status[claim.status].label)} </>}
        {claim.statusExplanation}
      </p>
      {claim.citationMismatch && <p>{t.audit.citationMismatch}</p>}
      <p>
        <strong>{mark(grade.action !== "weaker")}{t.audit.feedbackAction}: {t.audit.actionVerdict[grade.action]}.</strong>{" "}
        {grade.action !== "best" && <>{t.audit.reviewedAction(t.audit.action[claim.bestAction])} </>}
        {claim.actionExplanation}
      </p>
      <p className="text-muted">{t.audit.retryNote}</p>
    </div>
  );
}

/** Without `onLink` it is a read-only source pack. */
export function SourceDrawer({ sources, linked, hasClaim, onLink }: { sources: Source[]; linked?: string; hasClaim?: boolean; onLink?: (id: string) => void }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="font-bold">{t.audit.sourcesHeading}</h3>
      <div className="mt-2 space-y-2">
        {sources.map((s) => (
          <details key={s.id} className="border border-border bg-surface p-3">
            <summary className="cursor-pointer font-bold">{s.title}, <span className="font-normal">{s.date}</span></summary>
            <p className="mt-2 text-sm text-muted">{s.description}</p>
            <ul className="mt-2 space-y-3">
              {s.passages.map((p, i) => (
                <li key={p.id} className="text-sm">
                  <p>{p.text}</p>
                  {onLink && <button
                    type="button"
                    disabled={!hasClaim}
                    aria-pressed={linked === p.id}
                    data-passage={p.id}
                    onClick={() => onLink(p.id)}
                    className={`mt-1 ${secondary}`}
                  >
                    {linked === p.id && <span aria-hidden="true">✔ </span>}
                    {!hasClaim ? t.audit.selectFirst : linked === p.id ? t.audit.linkedPassage : t.audit.linkPassage}
                    <span className="sr-only">: {t.audit.passage(s.title, s.date, i + 1)}</span>
                  </button>}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function FinalBriefing({
  audit,
  answers,
  headingRef,
  onContinue,
}: {
  audit: AuditSpec;
  answers: Record<string, ClaimAnswer>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onContinue: () => void;
}) {
  return (
    <div>
      <h3 ref={headingRef} tabIndex={-1} className="text-lg font-bold">{t.audit.finalTitle}</h3>
      <p className="mt-1 text-sm text-muted">{t.audit.finalIntro}</p>
      <div className="mat mt-3 p-3 sm:p-5">
      <div className="sheet p-4 sm:p-5">
        {audit.briefing.map((paragraph, i) => {
          const text = paragraph
            .map((seg) => (typeof seg === "string" ? seg : (audit.claims.find((c) => c.id === seg.claimId)?.finalText ?? "")))
            .join("")
            .replace(/\s+/g, " ")
            .trim();
          return text ? <p key={i} className="mt-2 first:mt-0">{text}</p> : null;
        })}
      </div>
      </div>
      <h3 className="mt-6 font-bold">{t.audit.decisions}</h3>
      <ul className="mt-2 space-y-3">
        {audit.claims.map((c) => {
          const answer = answers[c.id];
          return (
            <li key={c.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
              <p>{c.text}</p>
              <p className="mt-1">
                <strong>{t.audit.yourDecision}:</strong> {answer?.action ? t.audit.action[answer.action] : "—"}
                <br />
                <strong>{t.audit.reviewed}:</strong> {t.audit.action[c.bestAction]} ({t.audit.status[c.status].label})
              </p>
              {c.finalText === null && <p className="mt-1 text-muted">{t.audit.removed}</p>}
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={onContinue} className={`mt-6 ${primary}`}>{t.mission.next}</button>
    </div>
  );
}
