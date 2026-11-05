"use client";

import { useEffect, useId, useRef } from "react";
import type { DialogueChoice, DialogueSpec, Source, Step } from "@/content/types";
import { citeChoiceId, startNodeId, walk, type Walk } from "@/lib/dialogue";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { CastBadge } from "../artefacts/cast-badge";
import { ArtefactFrame } from "../artefacts/frames";
import { ActionBar, HowTo, useReveal } from "../step-ui";
import { SourceDrawer } from "./claim-audit";

type DialogueStep = Extract<Step, { kind: "dialogue" }>;

interface DialogueState {
  choices: string[];
  notes: string;
}

interface ReplayState {
  /** Index of the original decision being replayed, or null when no replay is open. */
  from: number | null;
  choices: string[];
}

const primary = "btn btn-primary";

/** A shown passage has no label of its own, so it reads as what was shown. */
function moveLabel(choice: DialogueChoice, sources: Source[]): string {
  if (!choice.citedPassage) return choice.label;
  const source = sources.find((s) => s.passages.some((p) => p.id === choice.citedPassage));
  const passage = source?.passages.find((p) => p.id === choice.citedPassage);
  return t.dialogue.showed(source?.title ?? "", passage?.text ?? "");
}

function Conversation({
  spec,
  sources,
  path,
  firstTurn = 0,
  onChoose,
}: {
  spec: DialogueSpec;
  sources: Source[];
  path: Walk;
  /** Earlier turns are hidden, for a replay that starts part-way through. */
  firstTurn?: number;
  onChoose: (choiceId: string) => void;
}) {
  const speaker = (id: string) => spec.characters.find((c) => c.id === id);
  const latest = useRef<HTMLDivElement>(null);
  const count = path.turns.length;
  const seen = useRef(count);
  // The chosen button disappears, so focus moves to the character's reply.
  useEffect(() => {
    if (seen.current !== count) {
      seen.current = count;
      latest.current?.focus();
    }
  }, [count]);

  return (
    <div>
      <ol className="space-y-3">
        {path.turns.slice(firstTurn).map((turn, i, shown) => {
          const who = speaker(turn.node.speakerId);
          const isLatest = i === shown.length - 1;
          return (
            <li key={`${turn.node.id}-${i}`}>
              <div ref={isLatest ? latest : undefined} tabIndex={-1} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
                {who && <CastBadge name={who.name} />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {who?.name} <span className="font-normal text-muted">({who?.role})</span>
                  </p>
                  <p className="mt-1">{turn.node.text}</p>
                </div>
              </div>
              {turn.choice && (
                <div className="ml-4 mt-2 border-l-4 border-accent pl-3 sm:ml-8">
                  <p className="text-sm font-semibold">
                    {t.dialogue.youChose} <span className="font-normal text-muted">({t.dialogue.strategy[turn.choice.strategy]})</span>
                  </p>
                  <p className="mt-1">{moveLabel(turn.choice, sources)}</p>
                  <p className="mt-2 border-t border-border pt-2 text-sm">
                    <strong>{t.dialogue.whatThisDid}:</strong> {turn.choice.note}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!path.ended && (
        <fieldset className="mt-4">
          <legend className="font-bold">{t.dialogue.respond}</legend>
          <div className="mt-2 space-y-2">
            {path.options.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChoose(c.id)}
                className="block w-full rounded-lg border border-border bg-surface p-3 text-left hover:border-accent"
              >
                {c.label}
              </button>
            ))}
          </div>
          {path.canCite && <p className="mt-2 text-sm">{t.dialogue.citeHelp}</p>}
        </fieldset>
      )}
    </div>
  );
}

function BoardQuestions({ spec, found }: { spec: DialogueSpec; found: string[] }) {
  if (!spec.boardQuestions?.length) return null;
  return (
    <section className="mt-6 rounded-lg border border-border bg-surface p-4">
      <h3 className="font-bold">{t.dialogue.boardTitle}</h3>
      <p className="text-sm text-muted">{t.dialogue.boardNote}</p>
      <ul className="mt-2 space-y-3">
        {spec.boardQuestions.map((q) => {
          const ok = found.includes(q.discoveryId);
          return (
            <li key={q.discoveryId}>
              <p className="font-semibold">{q.question}</p>
              <p className="text-sm">
                <span aria-hidden="true" className={ok ? "mark-yes" : "mark-no"}>{ok ? "✔ " : "✖ "}</span>
                <strong>{ok ? t.dialogue.couldAnswer : t.dialogue.couldNotAnswer}</strong> {ok ? q.ifFound : q.ifMissed}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Discoveries({ spec, found, showMissed }: { spec: DialogueSpec; found: string[]; showMissed: boolean }) {
  const missed = spec.discoveries.filter((d) => !found.includes(d.id));
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="font-bold">{t.dialogue.found}</h3>
      {found.length === 0 ? (
        <p className="mt-1 text-sm">{t.dialogue.foundNone}</p>
      ) : (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {found.map((id) => <li key={id}>{spec.discoveries.find((d) => d.id === id)?.label}</li>)}
        </ul>
      )}
      {showMissed && missed.length > 0 && (
        <>
          <h3 className="mt-3 font-bold">{t.dialogue.missed}</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {missed.map((d) => (
              <li key={d.id}>{d.label} {t.dialogue.lookIn(d.lookIn)}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function DialogueActivity({
  missionId,
  step,
  initialChoiceId,
  onEvidence,
  onContinue,
}: {
  missionId: string;
  step: DialogueStep;
  initialChoiceId: string | undefined;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const session = useSession();
  const notesId = useId();
  const state = (session.progress(missionId).stepState[step.id] as DialogueState | undefined) ?? { choices: [], notes: "" };
  const set = (patch: Partial<DialogueState>) => session.setStepState(missionId, step.id, { ...state, ...patch });
  const spec = step.dialogue;
  const path = walk(spec, startNodeId(spec, initialChoiceId), state.choices);
  const choose = (id: string) => set({ choices: [...state.choices, id] });
  const endRef = useReveal<HTMLDivElement>(path.ended);

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1">{step.intro}</p>
      <HowTo steps={t.howTo.dialogue} />
      <p className="mt-3 border-l-4 border-border pl-3 text-sm">{t.dialogue.scripted}</p>

      <details className="mt-3 rounded-lg border border-border bg-surface p-3" open={!path.ended && path.turns.length <= 1}>
        <summary className="cursor-pointer font-bold">{t.dialogue.cast}</summary>
        <ul className={`mt-3 grid gap-3 text-sm ${spec.characters.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
          {spec.characters.map((c) => (
            <li key={c.id} className="flex gap-3 rounded border border-border bg-background p-3">
              <CastBadge name={c.name} />
              <div>
                <p><strong>{c.name}</strong>, {c.role}</p>
                <p className="mt-1"><span className="font-bold">{t.dialogue.knows}:</span> {c.knows}</p>
                <p className="mt-1"><span className="font-bold">{t.dialogue.wants}:</span> {c.wants}</p>
              </div>
            </li>
          ))}
        </ul>
      </details>
      {step.artefact && <ArtefactFrame artefact={step.artefact} className="mt-4" />}

      <div className="mt-4 lg:grid lg:grid-cols-2 lg:gap-6">
        <div>
          {path.questionsLeft !== null && !path.ended && (
            <p role="status" className="mb-3 text-sm font-bold">{t.dialogue.questionsLeft(path.questionsLeft)}</p>
          )}
          <Conversation spec={spec} sources={step.sources} path={path} onChoose={choose} />
        </div>
        <div data-scroll-panel className="mt-4 space-y-4 lg:sticky lg:top-4 lg:mt-0 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
          <Discoveries spec={spec} found={path.discovered} showMissed={path.ended} />
          <SourceDrawer
            sources={step.sources}
            hasClaim
            onLink={path.canCite ? (id) => choose(citeChoiceId(id)) : undefined}
            linkLabel={t.dialogue.showPassage}
          />
          <div>
            <label htmlFor={notesId} className="font-bold">{t.dialogue.notesLabel}</label>
            <p className="text-sm text-muted">{t.dialogue.notesHelp} {step.reflectionPrompt}</p>
            <textarea
              id={notesId}
              rows={3}
              value={state.notes}
              onChange={(e) => set({ notes: e.target.value })}
              className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div ref={endRef} className="reveal">
        {path.ended && <BoardQuestions spec={spec} found={path.discovered} />}
      </div>

      {path.ended && (
        <ActionBar>
          <button
            type="button"
            onClick={() => {
              for (const d of spec.discoveries) onEvidence(itemKey(step.id, d.id), { right: path.discovered.includes(d.id) });
              for (const turn of path.turns) {
                if (turn.choice?.scored) onEvidence(itemKey(step.id, turn.choice.scored.item), { right: turn.choice.scored.right });
              }
              onContinue();
            }}
            className={primary}
          >
            {step.continueLabel ?? t.dialogue.next}
          </button>
        </ActionBar>
      )}
    </div>
  );
}

/** Shown after the mission. It never changes the original path or any recorded answer. */
export function DialogueReplay({
  missionId,
  step,
  initialChoiceId,
}: {
  missionId: string;
  step: DialogueStep;
  initialChoiceId: string | undefined;
}) {
  const session = useSession();
  const titleId = useId();
  const stateKey = `${step.id}:replay`;
  const progress = session.progress(missionId);
  const original = (progress.stepState[step.id] as DialogueState | undefined)?.choices ?? [];
  const replay = (progress.stepState[stateKey] as ReplayState | undefined) ?? { from: null, choices: [] };
  const set = (next: ReplayState) => session.setStepState(missionId, stateKey, next);
  const spec = step.dialogue;
  const start = startNodeId(spec, initialChoiceId);
  const originalPath = walk(spec, start, original);
  if (original.length === 0) return null;

  const decisions = originalPath.turns.filter((turn) => turn.choice);

  return (
    <section className="no-print mt-6 rounded-lg border border-border p-4" aria-labelledby={titleId}>
      <h3 id={titleId} className="font-bold">{t.dialogue.replayHeading}</h3>
      <p className="mt-1 text-sm">{t.dialogue.replayIntro}</p>
      <h4 className="mt-3 text-sm font-semibold">{t.dialogue.originalLabel}</h4>
      <ol className="mt-2 space-y-2">
        {decisions.map((turn, i) => (
          <li key={`${turn.node.id}-${i}`} className="rounded border border-border bg-surface p-3 text-sm">
            <p><strong>{t.dialogue.decision(i + 1)}:</strong> {turn.choice && moveLabel(turn.choice, step.sources)}</p>
            <button
              type="button"
              onClick={() => set({ from: i, choices: original.slice(0, i) })}
              className="mt-2 btn btn-secondary btn-small"
            >
              {t.dialogue.tryOther}<span className="sr-only">: {t.dialogue.decision(i + 1)}</span>
            </button>
          </li>
        ))}
      </ol>

      {replay.from !== null && (
        <ReplayPath
          key={replay.from}
          spec={spec}
          sources={step.sources}
          start={start}
          replay={replay as ReplayState & { from: number }}
          originalFound={originalPath.discovered}
          onChoose={(id) => set({ ...replay, choices: [...replay.choices, id] })}
          onClose={() => set({ from: null, choices: [] })}
        />
      )}
    </section>
  );
}

function ReplayPath({
  spec,
  sources,
  start,
  replay,
  originalFound,
  onChoose,
  onClose,
}: {
  spec: DialogueSpec;
  sources: Source[];
  start: string;
  replay: ReplayState & { from: number };
  originalFound: string[];
  onChoose: (id: string) => void;
  onClose: () => void;
}) {
  const path = walk(spec, start, replay.choices);
  const labels = (ids: string[]) => ids.map((id) => spec.discoveries.find((d) => d.id === id)?.label).join(" ");
  return (
    <div className="mt-4 rounded-lg border-2 border-dashed border-accent p-3">
      <h4 className="text-sm font-semibold">{t.dialogue.replayLabel}</h4>
      <div className="mt-2">
        <Conversation spec={spec} sources={sources} path={{ ...path, canCite: false }} firstTurn={replay.from} onChoose={onChoose} />
      </div>
      {path.ended && (
        <div className="mt-3 space-y-2 text-sm">
          <p><strong>{t.dialogue.replayFound}:</strong> {labels(path.discovered) || t.dialogue.foundNone}</p>
          <p><strong>{t.dialogue.originalFound}:</strong> {labels(originalFound) || t.dialogue.foundNone}</p>
        </div>
      )}
      <button type="button" onClick={onClose} className="mt-3 btn btn-secondary btn-small">{t.dialogue.closeReplay}</button>
    </div>
  );
}
