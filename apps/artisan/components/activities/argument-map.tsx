"use client";

import { useEffect, useId, useRef } from "react";
import type { MapQuestion, MapTarget, Mission, Step } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { ChoiceQuestion } from "../choice-question";
import { CastBadge } from "../artefacts/cast-badge";
import { ArtefactFrame } from "../artefacts/frames";
import { ActionBar, HowTo } from "../step-ui";
import { SourceDrawer } from "./claim-audit";

type MapStep = Extract<Step, { kind: "argumentMap" }>;

interface MapState {
  /** The question being asked; equal to the number of questions once the map is finished. */
  index: number;
  /** Questions answered with an acceptable choice. */
  done: string[];
}

const STATUS_TONE = { holds: "tone-gain", fails: "tone-harm", unsettled: "tone-cost", unchecked: "tone-cost" } as const;

/**
 * Take a written argument apart one question at a time (PRD M05). The map is always on screen, the box being asked
 * about is highlighted, and each answer fills its box with the reviewed answer, so nothing wrong carries forward.
 */
export function ArgumentMap({
  mission,
  step,
  onEvidence,
  onContinue,
}: {
  mission: Mission;
  step: MapStep;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const session = useSession();
  const headingId = useId();
  const state: MapState = { index: 0, done: [], ...(session.progress(mission.id).stepState[step.id] as Partial<MapState> | undefined) };
  const set = (patch: Partial<MapState>) => session.setStepState(mission.id, step.id, { ...state, ...patch });

  const total = step.questions.length;
  const finished = state.index >= total;
  const current: MapQuestion | undefined = step.questions[state.index];
  const answered = !!current && state.done.includes(current.id);

  // The answered question is replaced by the next one, so focus moves to its heading.
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const seenIndex = useRef(state.index);
  useEffect(() => {
    if (seenIndex.current !== state.index) {
      seenIndex.current = state.index;
      questionHeading.current?.focus();
    }
  }, [state.index]);

  const speaker = current && step.cast.find((c) => c.id === current.speakerId);

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1 max-w-3xl">{step.intro}</p>
      <HowTo steps={t.howTo.argumentMap} />

      <ArtefactFrame artefact={step.artefact} className="mt-4" />

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-6">
        {/* Focusable, so a keyboard user can scroll the map when it is taller than the panel. */}
        <section
          aria-labelledby={headingId}
          tabIndex={0}
          data-scroll-panel
          className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto"
        >
          <h3 id={headingId} className="font-bold">{t.argumentMap.mapHeading}</h3>
          <MapTree step={step} done={finished ? step.questions.map((q) => q.id) : state.done} current={finished ? undefined : current} />
        </section>

        <div className="mt-6 lg:mt-0">
          {finished ? (
            <section className="rounded-lg border border-border bg-surface p-4">
              <h3 ref={questionHeading} tabIndex={-1} className="text-xl font-bold">{t.argumentMap.summaryHeading}</h3>
              <dl className="mt-3 space-y-3">
                <div>
                  <dt className="font-bold"><span aria-hidden="true" className="mark-yes">✔ </span>{t.argumentMap.stands}</dt>
                  <dd>{step.summary.stands}</dd>
                </div>
                <div>
                  <dt className="font-bold"><span aria-hidden="true" className="mark-no">✖ </span>{t.argumentMap.weaker}</dt>
                  <dd>{step.summary.weaker}</dd>
                </div>
                <div>
                  <dt className="font-bold"><span aria-hidden="true">? </span>{t.argumentMap.open}</dt>
                  <dd>{step.summary.open}</dd>
                </div>
              </dl>
            </section>
          ) : current && (
            <section className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">{t.argumentMap.progress(state.index + 1, total)}</p>
              <h3 ref={questionHeading} tabIndex={-1} className="text-lg font-bold">{t.argumentMap.stage[current.stage]}</h3>
              {speaker && (
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <CastBadge name={speaker.name} size="sm" />
                  {t.argumentMap.asks(speaker.name, speaker.role)}
                </p>
              )}
              <div className="mt-3">
                <ChoiceQuestion
                  key={current.id}
                  name={`${step.id}-${current.id}`}
                  prompt={current.prompt}
                  choices={current.choices}
                  onCommit={() => {}}
                  onEvidence={(result) => {
                    onEvidence(itemKey(step.id, current.id), result);
                    if (result.right && !state.done.includes(current.id)) set({ done: [...state.done, current.id] });
                  }}
                />
              </div>
            </section>
          )}

          <div className="mt-4">
            <SourceDrawer sources={step.sources} />
          </div>
        </div>
      </div>

      <ActionBar note={!finished && !answered ? t.argumentMap.answerFirst : undefined}>
        {finished ? (
          <button type="button" onClick={onContinue} className="btn btn-primary">{t.mission.next}</button>
        ) : (
          answered && (
            <button type="button" onClick={() => set({ index: state.index + 1 })} className="btn btn-primary">
              {state.index + 1 === total ? t.argumentMap.finish : t.argumentMap.nextQuestion}
            </button>
          )
        )}
      </ActionBar>
    </div>
  );
}

/** The conclusion at the top, and under it each reason with the steps that hold it up. Read top to bottom. */
function MapTree({ step, done, current }: { step: MapStep; done: string[]; current: MapQuestion | undefined }) {
  const at = (reason: string, where: MapTarget) => step.questions.filter((q) => q.target.reason === reason && q.target.at === where);
  const isCurrent = (reason: string, where: MapTarget) => current?.target.reason === reason && current.target.at === where;

  return (
    <div className="mt-2">
      <div className="mat p-3">
        <p className="sheet p-3">
          <span className="block text-sm text-muted">{t.argumentMap.conclusion}</span>
          <strong>{step.conclusion}</strong>
        </p>
      </div>
      <ol className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {step.reasons.map((reason, i) => (
          <li key={reason.id} className="ml-3 border-l-2 border-border pl-3">
            <ol className="space-y-2">
              {(["reasonLink", "reason", "evidenceLink", "evidence"] as const).map((where) => {
                if (where === "reason") {
                  return (
                    <li key={where} className="rounded-lg border border-border bg-surface p-2 text-sm">
                      <span className="block font-bold">{t.argumentMap.reason(i + 1)}</span>
                      {reason.text}
                    </li>
                  );
                }
                const qs = at(reason.id, where);
                if (qs.length === 0) return null;
                return (
                  <MapBox
                    key={where}
                    label={where === "evidence" ? t.argumentMap.evidence : t.argumentMap[where]}
                    link={where !== "evidence"}
                    questions={qs}
                    done={done}
                    current={isCurrent(reason.id, where)}
                  />
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MapBox({ label, link, questions, done, current }: { label: string; link: boolean; questions: MapQuestion[]; done: string[]; current: boolean }) {
  const filled = questions.filter((q) => done.includes(q.id));
  return (
    <li
      aria-current={current ? "step" : undefined}
      className={`rounded-lg p-2 text-sm ${link ? "border-dashed" : ""} ${current ? "border-2 border-accent bg-background" : "border border-border"}`}
    >
      {current && <span className="block text-xs font-bold uppercase tracking-wide">{t.argumentMap.current}</span>}
      <span className="block text-muted">{label}</span>
      {filled.length === 0 ? (
        <span className="italic text-muted">{t.argumentMap.empty}</span>
      ) : (
        filled.map((q) => (
          <span key={q.id} className="mt-1 block">
            {q.fills.status && (
              <strong className={`mr-1 inline-block rounded border px-1 text-xs ${STATUS_TONE[q.fills.status]}`}>{t.argumentMap.status[q.fills.status]}</strong>
            )}
            {q.fills.text}
          </span>
        ))
      )}
    </li>
  );
}
