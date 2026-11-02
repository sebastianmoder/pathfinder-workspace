"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import type { AuditSpec, Claim, ClaimAction, ClaimStatus, MarkParagraph, Source } from "@/content/types";
import {
  assembleClaim,
  calibrate,
  consequences,
  gradeCalculation,
  gradeClaim,
  gradeRepair,
  isComplete,
  needsRepair,
  NO_EVIDENCE,
  type ClaimAnswer,
  type TrustLevel,
} from "@/lib/audit";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { ChoiceQuestion } from "../choice-question";
import { MarkText } from "./mark-text";

type View = "briefing" | "sources" | "judgment";
type Phase = "spot" | "trust" | "audit" | "final" | "decision";

interface AuditState {
  answers: Record<string, ClaimAnswer>;
  /** Claims checked at least once. Finishing never depends on being right. */
  done: string[];
  /** Claims whose feedback matches the current answers. */
  showFeedback: string[];
  selected: string | null;
  view: View;
  phase: Phase;
  /** First-read trust, recorded before any source opens. */
  trust: Record<string, TrustLevel>;
  /** In an independent audit, feedback waits for this. */
  submitted: boolean;
}

const STATUSES: ClaimStatus[] = ["supported", "unsupported", "outdated", "misleading", "incorrect"];
const ACTIONS: ClaimAction[] = ["retain", "qualify", "correct", "remove"];
const VIEWS: View[] = ["briefing", "sources", "judgment"];
const TRUST: TrustLevel[] = ["rely", "unsure", "check"];

const primary = "btn btn-primary";
const secondary = "btn btn-secondary btn-small";

interface Props {
  missionId: string;
  stepId: string;
  audit: AuditSpec;
  /** Instructions for checking claims. Held back until then, so they can't colour the first read. */
  intro?: string;
  /** Show the learner's finished briefing after the last claim. */
  showFinal: boolean;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}

const firstPhase = (audit: AuditSpec): Phase =>
  audit.support === "independent" ? "spot" : audit.trustFirst ? "trust" : "audit";

export function ClaimAudit({ missionId, stepId, audit, intro, showFinal, onEvidence, onContinue }: Props) {
  const session = useSession();
  const independent = audit.support === "independent";
  const state = (session.progress(missionId).stepState[stepId] as AuditState | undefined) ?? {
    answers: {},
    done: [],
    showFeedback: [],
    selected: null,
    view: "briefing" as View,
    phase: firstPhase(audit),
    trust: {},
    submitted: false,
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

  // A new phase replaces the controls that led to it, so focus moves to its heading.
  const phaseHeading = useRef<HTMLHeadingElement>(null);
  const seenPhase = useRef(state.phase);
  useEffect(() => {
    if (seenPhase.current !== state.phase) {
      seenPhase.current = state.phase;
      phaseHeading.current?.focus();
    }
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

  function recordClaim(c: Claim, assisted: boolean) {
    const answer = state.answers[c.id] ?? {};
    const grade = gradeClaim(c, answer);
    const key = (field: string) => itemKey(stepId, c.id, field);
    onEvidence(key("evidence"), { right: grade.evidence, assisted });
    onEvidence(key("status"), { right: grade.status, assisted });
    onEvidence(key("action"), { right: grade.action !== "weaker", assisted });
    if (c.calculation) onEvidence(key("calc"), { right: gradeCalculation(c, answer), assisted });
    if (needsRepair(c, answer)) onEvidence(key("repair"), { right: gradeRepair(c, answer), assisted });
  }

  if (state.phase === "spot") {
    const paragraphs: MarkParagraph[] = audit.briefing.map((paragraph) =>
      paragraph.map((segment) => {
        if (typeof segment === "string") return segment;
        if ("claimId" in segment) {
          const c = audit.claims.find((x) => x.id === segment.claimId)!;
          return { id: c.id, text: c.text, target: true, explanation: "" };
        }
        const d = audit.decoys!.find((x) => x.id === segment.decoyId)!;
        return { id: d.id, text: d.text, target: false, explanation: d.explanation };
      }),
    );
    return (
      <div>
        <h3 ref={phaseHeading} tabIndex={-1} className="text-lg font-bold">{t.audit.spotTitle}</h3>
        <p className="mb-3 mt-1">{t.audit.spotIntro}</p>
        <MarkText
          paragraphs={paragraphs}
          claimExplanation={t.audit.spotClaim}
          continueLabel={t.audit.spotDone}
          onResult={(id, right) => onEvidence(itemKey(stepId, "spot", id), { right })}
          onContinue={() => set({ phase: audit.trustFirst ? "trust" : "audit" })}
        />
      </div>
    );
  }

  if (state.phase === "trust") {
    return (
      <TrustPass
        audit={audit}
        trust={state.trust}
        headingRef={phaseHeading}
        onChange={(id, level) => set({ trust: { ...state.trust, [id]: level } })}
        onDone={() => set({ phase: "audit" })}
      />
    );
  }

  if (state.phase === "final" || state.phase === "decision") {
    return (
      <FinalBriefing
        audit={audit}
        answers={state.answers}
        trust={state.trust}
        phase={state.phase}
        headingRef={phaseHeading}
        onDecide={() => set({ phase: "decision" })}
        onDecision={(result) => onEvidence(itemKey(stepId, "decision"), result)}
        onContinue={onContinue}
      />
    );
  }

  const allDone = audit.claims.every((c) => state.done.includes(c.id));
  const feedbackOpen = !independent || state.submitted;
  const panelClass = (v: View) => `${state.view === v ? "block" : "hidden"} lg:block`;
  const finished = audit.claims.filter((c) => state.done.includes(c.id)).length;

  return (
    <div>
      <h3 ref={phaseHeading} tabIndex={-1} className="sr-only">{t.audit.auditHeading}</h3>
      {intro && <p className="mb-4 mt-1">{intro}</p>}
      <p role="status" className="mb-3 text-sm font-bold">
        {feedbackOpen ? t.audit.progress(finished, audit.claims.length) : t.audit.progressSaved(finished, audit.claims.length)}
      </p>
      {!feedbackOpen && <p className="mb-3 text-sm">{t.audit.independentNote}</p>}
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
                  {paragraph.map((segment, j) => {
                    if (typeof segment === "string") return <Fragment key={j}>{segment}</Fragment>;
                    if ("decoyId" in segment) return <Fragment key={j}>{audit.decoys!.find((d) => d.id === segment.decoyId)!.text}</Fragment>;
                    return (
                      <ClaimButton
                        key={j}
                        claim={audit.claims.find((c) => c.id === segment.claimId)!}
                        selected={state.selected === segment.claimId}
                        done={state.done.includes(segment.claimId)}
                        onSelect={selectClaim}
                      />
                    );
                  })}
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
                independent={independent}
                feedbackOpen={feedbackOpen}
                reasonPrompt={audit.reasonPrompt}
                reasonLocked={feedbackOpen && state.done.includes(claim.id)}
                onChange={updateAnswer}
                onOpenSources={() => {
                  pendingFocus.current = true;
                  set({ view: "sources" });
                }}
                onCheck={(assisted) => {
                  if (feedbackOpen) recordClaim(claim, assisted);
                  set({
                    done: state.done.includes(claim.id) ? state.done : [...state.done, claim.id],
                    showFeedback: feedbackOpen ? [...state.showFeedback, claim.id] : state.showFeedback,
                  });
                }}
              />
            ) : (
              <p className="rounded-lg border border-border bg-surface p-4">{t.audit.selectClaim}</p>
            )}
          </section>
        </div>
      </div>

      {allDone && !feedbackOpen && (
        <button
          type="button"
          onClick={() => {
            for (const c of audit.claims) recordClaim(c, false);
            set({ submitted: true, showFeedback: audit.claims.map((c) => c.id) });
          }}
          className={`mt-6 ${primary}`}
        >
          {t.audit.submit}
        </button>
      )}
      {allDone && feedbackOpen && (
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

function TrustPass({
  audit,
  trust,
  headingRef,
  onChange,
  onDone,
}: {
  audit: AuditSpec;
  trust: Record<string, TrustLevel>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onChange: (id: string, level: TrustLevel) => void;
  onDone: () => void;
}) {
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  return (
    <div>
      <h3 ref={headingRef} tabIndex={-1} className="text-lg font-bold">{t.audit.trustTitle}</h3>
      <p className="mt-1">{t.audit.trustIntro}</p>
      <ul className="mt-4 space-y-3">
        {audit.claims.map((c) => (
          <li key={c.id} className="rounded-lg border border-border bg-surface p-3">
            <fieldset>
              <legend className="font-bold">{c.text}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TRUST.map((level) => (
                  <label key={level} className="option-compact">
                    <input type="radio" name={`${uid}-${c.id}`} checked={trust[c.id] === level} onChange={() => onChange(c.id, level)} />
                    {t.audit.trust[level]}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">{t.audit.trustNote}</p>
      <button
        type="button"
        disabled={audit.claims.some((c) => !trust[c.id])}
        onClick={onDone}
        className={`mt-4 ${primary}`}
      >
        {t.audit.trustDone}
      </button>
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
  independent,
  feedbackOpen,
  reasonPrompt,
  reasonLocked,
  onChange,
  onOpenSources,
  onCheck,
}: {
  claim: Claim;
  sources: Source[];
  answer: ClaimAnswer;
  showFeedback: boolean;
  independent: boolean;
  feedbackOpen: boolean;
  reasonPrompt?: string;
  /** Once feedback has been seen, the reason stays as it was written before it. */
  reasonLocked: boolean;
  onChange: (patch: Partial<ClaimAnswer>) => void;
  onOpenSources: () => void;
  onCheck: (assisted: boolean) => void;
}) {
  const group = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const [hintShown, setHintShown] = useState(false);
  const needsReason = !!reasonPrompt && !reasonLocked;
  const complete = isComplete(answer, claim);
  const linked = sources.flatMap((s) => s.passages.map((p) => ({ ...p, source: s }))).find((p) => p.id === answer.evidence);
  const checkLabel = feedbackOpen ? t.audit.checkClaim : t.audit.saveClaim;

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

      {claim.calculation && (
        <div className="mt-4">
          <label htmlFor={`${group}-calc`} className="font-bold">{claim.calculation.prompt}</label>
          <input
            id={`${group}-calc`}
            inputMode="decimal"
            autoComplete="off"
            value={answer.calc ?? ""}
            onChange={(e) => onChange({ calc: e.target.value })}
            className="mt-1 block w-32 rounded border border-border bg-background px-3 py-2"
          />
        </div>
      )}

      <fieldset className="mt-4">
        <legend className="font-bold">{t.audit.statusHeading}</legend>
        <div className="mt-2 space-y-1">
          {STATUSES.map((s) => (
            <label key={s} className="flex cursor-pointer gap-2 text-sm">
              <input type="radio" name={`${group}-status`} checked={answer.status === s} onChange={() => onChange({ status: s })} className="mt-1" />
              <span><strong>{t.audit.status[s].label}.</strong>{!independent && <> {t.audit.status[s].help}</>}</span>
            </label>
          ))}
        </div>
        {independent && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">{t.audit.definitions}</summary>
            <ul className="mt-1 space-y-1">
              {STATUSES.map((s) => <li key={s}><strong>{t.audit.status[s].label}:</strong> {t.audit.status[s].help}</li>)}
            </ul>
          </details>
        )}
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

      {needsRepair(claim, answer) && <RepairField claim={claim} answer={answer} onChange={onChange} />}
      {(answer.action === "qualify" || answer.action === "correct") && !claim.repair && (
        <p className="mt-3 text-sm text-muted">{t.audit.noRepairNeeded}</p>
      )}

      {reasonPrompt && (
        <div className="mt-4">
          <label htmlFor={`${group}-reason`} className="font-bold">{t.audit.reasonHeading}: {reasonPrompt}</label>
          <textarea
            id={`${group}-reason`}
            rows={2}
            value={answer.reason ?? ""}
            readOnly={reasonLocked}
            onChange={(e) => onChange({ reason: e.target.value })}
            className="mt-1 w-full rounded border border-border bg-background px-3 py-2"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!complete || (needsReason && !answer.reason?.trim())}
          onClick={() => onCheck(hintShown)}
          className={primary}
        >
          {checkLabel}
        </button>
        {needsReason && (
          <button type="button" disabled={!complete} onClick={() => onCheck(hintShown)} className={secondary}>{feedbackOpen ? t.audit.checkWithoutReason : t.audit.saveWithoutReason}</button>
        )}
        {claim.hint && !hintShown && (
          <button type="button" onClick={() => setHintShown(true)} className={secondary}>{t.audit.hint}</button>
        )}
      </div>
      {!complete && <p className="mt-2 text-sm text-muted">{t.audit.missing}</p>}
      {hintShown && <p className="mt-2 text-sm">{claim.hint}</p>}
      {showFeedback && <ClaimFeedback claim={claim} answer={answer} />}
    </div>
  );
}

function RepairField({ claim, answer, onChange }: { claim: Claim; answer: ClaimAnswer; onChange: (patch: Partial<ClaimAnswer>) => void }) {
  const uid = useId();
  const setBlank = (id: string, value: string) => onChange({ repair: { ...answer.repair, [id]: value } });
  return (
    <div className="mt-4">
      <p className="font-bold">{t.audit.repairHeading}</p>
      <p className="text-sm text-muted">{t.audit.repairHelp}</p>
      <p className="mt-2 leading-loose">
        {claim.repair!.map((part, i) => {
          if (typeof part === "string") return <Fragment key={i}>{part}</Fragment>;
          const label = t.audit.repairBlank(claim.repair!.slice(0, i).filter((p) => typeof p !== "string").length + 1);
          return part.options ? (
            <select
              key={part.id}
              aria-label={label}
              id={`${uid}-${part.id}`}
              value={answer.repair?.[part.id] ?? ""}
              onChange={(e) => setBlank(part.id, e.target.value)}
              className="rounded border border-border bg-background px-1 py-0.5"
            >
              <option value="" disabled>{t.audit.repairChoose}</option>
              {part.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              key={part.id}
              aria-label={label}
              id={`${uid}-${part.id}`}
              autoComplete="off"
              value={answer.repair?.[part.id] ?? ""}
              onChange={(e) => setBlank(part.id, e.target.value)}
              className="w-20 rounded border border-border bg-background px-2 py-0.5"
            />
          );
        })}
      </p>
    </div>
  );
}

function ClaimFeedback({ claim, answer }: { claim: Claim; answer: ClaimAnswer }) {
  const grade = gradeClaim(claim, answer);
  const mark = (ok: boolean) => <span aria-hidden="true" className={ok ? "mark-yes" : "mark-no"}>{ok ? "✔ " : "✖ "}</span>;
  const calcRight = gradeCalculation(claim, answer);
  const repairRight = gradeRepair(claim, answer);
  return (
    <div role="status" className="mt-4 space-y-3 border-t border-border pt-3 text-sm">
      <p>
        <strong>{mark(grade.evidence)}{t.audit.feedbackEvidence}: {grade.evidence ? t.audit.right : t.audit.notRight}.</strong>{" "}
        {claim.evidenceExplanation}
      </p>
      {claim.calculation && (
        <p>
          <strong>{mark(calcRight)}{t.audit.feedbackCalc}: {calcRight ? t.audit.right : t.audit.notRight}.</strong>{" "}
          {claim.calculation.explanation}
        </p>
      )}
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
      {needsRepair(claim, answer) && (
        <p>
          <strong>{mark(repairRight)}{t.audit.feedbackRepair}: {repairRight ? t.audit.right : t.audit.notRight}.</strong>{" "}
          {!repairRight && t.audit.repairRetry}
        </p>
      )}
      <p className="text-muted">{t.audit.retryNote}</p>
    </div>
  );
}

/** Without `onLink` it is a read-only source pack. */
export function SourceDrawer({
  sources,
  linked,
  hasClaim,
  onLink,
  linkLabel,
}: {
  sources: Source[];
  linked?: string;
  hasClaim?: boolean;
  onLink?: (id: string) => void;
  /** Replaces the audit's wording, for showing a passage in conversation. */
  linkLabel?: string;
}) {
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
                    {linkLabel ?? (!hasClaim ? t.audit.selectFirst : linked === p.id ? t.audit.linkedPassage : t.audit.linkPassage)}
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

/** The learner's decisions, carried through to a document, and what follows from it. */
function FinalBriefing({
  audit,
  answers,
  trust,
  phase,
  headingRef,
  onDecide,
  onDecision,
  onContinue,
}: {
  audit: AuditSpec;
  answers: Record<string, ClaimAnswer>;
  trust: Record<string, TrustLevel>;
  phase: "final" | "decision";
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onDecide: () => void;
  onDecision: (result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const render = (claimText: (c: Claim) => string | null) =>
    audit.briefing.flatMap((paragraph, i) => {
      const text = paragraph
        .map((seg) => {
          if (typeof seg === "string") return seg;
          if ("decoyId" in seg) return audit.decoys!.find((d) => d.id === seg.decoyId)!.text;
          return claimText(audit.claims.find((c) => c.id === seg.claimId)!) ?? "";
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      return text ? [<p key={i} className="mt-2 first:mt-0">{text}</p>] : [];
    });
  const outcomes = consequences(audit.claims, answers);
  const Consequences = outcomes.length > 0 ? (
    <section className="mt-6 rounded-lg border border-border p-4">
      <h4 className="font-bold">{t.audit.consequencesTitle}</h4>
      <p className="text-sm text-muted">{t.audit.consequencesNote}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {outcomes.map((o) => <li key={o}>{o}</li>)}
      </ul>
    </section>
  ) : (
    <p className="mt-6 text-sm">{t.audit.noConsequences}</p>
  );

  if (phase === "decision" && audit.decision) {
    return (
      <div>
        <h3 ref={headingRef} tabIndex={-1} className="text-lg font-bold">{t.audit.decisionTitle}</h3>
        <div className="mat mt-3 p-3 sm:p-5">
          <div className="sheet p-4 sm:p-5">
            <p className="text-sm text-muted">{t.audit.yourBriefing}</p>
            <div className="mt-2">{render((c) => assembleClaim(c, answers[c.id]).text)}</div>
          </div>
        </div>
        <div className="mt-4">
          <ChoiceQuestion
            name="decision"
            prompt={audit.decision.prompt}
            choices={audit.decision.choices}
            onCommit={() => {}}
            onEvidence={onDecision}
            onContinue={onContinue}
          />
        </div>
        {Consequences}
      </div>
    );
  }

  const calibration = audit.trustFirst ? calibrate(audit.claims, trust) : null;

  return (
    <div>
      <h3 ref={headingRef} tabIndex={-1} className="text-lg font-bold">{t.audit.finalTitle}</h3>
      <p className="mt-1 text-sm text-muted">{t.audit.finalIntro}</p>
      <div className="mt-3 lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="mat p-3 sm:p-5">
          <div className="sheet h-full p-4 sm:p-5">
            <h4 className="text-sm font-bold">{t.audit.yourBriefing}</h4>
            <div className="mt-2">{render((c) => assembleClaim(c, answers[c.id]).text)}</div>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4 sm:p-5 lg:mt-0">
          <h4 className="text-sm font-bold">{t.audit.reviewedBriefing}</h4>
          <div className="mt-2">{render((c) => c.finalText)}</div>
        </div>
      </div>

      {calibration && (
        <section className="mt-6 rounded-lg border border-border bg-surface p-4">
          <h4 className="font-bold">{t.audit.calibrationTitle}</h4>
          <p className="mt-1">{t.audit.calibration(calibration)}</p>
          <p className="mt-1 text-sm text-muted">{t.audit.calibrationNote}</p>
        </section>
      )}

      <h4 className="mt-6 font-bold">{t.audit.decisions}</h4>
      <ul className="mt-2 space-y-3">
        {audit.claims.map((c) => {
          const answer = answers[c.id];
          const { outcome } = assembleClaim(c, answer);
          return (
            <li key={c.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
              <p>{c.text}</p>
              <p className="mt-1">
                {audit.trustFirst && trust[c.id] && <><strong>{t.audit.firstRead}:</strong> {t.audit.trust[trust[c.id]]}<br /></>}
                <strong>{t.audit.yourDecision}:</strong> {answer?.action ? t.audit.action[answer.action] : "—"}
                <br />
                <strong>{t.audit.reviewed}:</strong> {t.audit.action[c.bestAction]} ({t.audit.status[c.status].label})
              </p>
              {outcome === "flagged" && <p className="mt-1 text-muted">{t.audit.flagged}</p>}
              {outcome === "repairedWrong" && <p className="mt-1 text-muted">{t.audit.repairedWrong}</p>}
            </li>
          );
        })}
      </ul>

      {!audit.decision && Consequences}
      <button type="button" onClick={audit.decision ? onDecide : onContinue} className={`mt-6 ${primary}`}>
        {audit.decision ? t.audit.toDecision : t.mission.next}
      </button>
    </div>
  );
}
