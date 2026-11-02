"use client";

import { useEffect, useId, useRef } from "react";
import type { DialogueSpec, Step } from "@/content/types";
import { startNodeId, walk, type Walk } from "@/lib/dialogue";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
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

function Conversation({
  spec,
  path,
  firstTurn = 0,
  onChoose,
}: {
  spec: DialogueSpec;
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
              <div ref={isLatest ? latest : undefined} tabIndex={-1} className="rounded-lg border border-border bg-surface p-3">
                <p className="text-sm font-semibold">
                  {who?.name} <span className="font-normal text-muted">({who?.role})</span>
                </p>
                <p className="mt-1">{turn.node.text}</p>
              </div>
              {turn.choice && (
                <div className="ml-4 mt-2 border-l-4 border-accent pl-3 sm:ml-8">
                  <p className="text-sm font-semibold">
                    {t.dialogue.youChose} <span className="font-normal text-muted">({t.dialogue.strategy[turn.choice.strategy]})</span>
                  </p>
                  <p className="mt-1">{turn.choice.label}</p>
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
            {path.current.choices.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChoose(c.id)}
                className="block w-full rounded-lg border border-border bg-surface p-3 text-left hover:border-accent"
              >
                <span className="block text-sm text-muted">{t.dialogue.strategy[c.strategy]}</span>
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
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
  onContinue,
}: {
  missionId: string;
  step: DialogueStep;
  initialChoiceId: string | undefined;
  onContinue: () => void;
}) {
  const session = useSession();
  const notesId = useId();
  const state = (session.progress(missionId).stepState[step.id] as DialogueState | undefined) ?? { choices: [], notes: "" };
  const set = (patch: Partial<DialogueState>) => session.setStepState(missionId, step.id, { ...state, ...patch });
  const spec = step.dialogue;
  const path = walk(spec, startNodeId(spec, initialChoiceId), state.choices);

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1">{step.intro}</p>
      <p className="mt-3 border-l-4 border-border pl-3 text-sm">{t.dialogue.scripted}</p>

      <details className="mt-3 rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer font-bold">{t.dialogue.cast}</summary>
        <ul className="mt-2 space-y-2 text-sm">
          {spec.characters.map((c) => (
            <li key={c.id}>
              <strong>{c.name}, {c.role}.</strong> {t.dialogue.knows}: {c.knows} {t.dialogue.wants}: {c.wants}
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <Conversation spec={spec} path={path} onChoose={(id) => set({ choices: [...state.choices, id] })} />
        <div className="mt-4 space-y-4 lg:mt-0">
          <Discoveries spec={spec} found={path.discovered} showMissed={path.ended} />
          <SourceDrawer sources={step.sources} />
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

      {path.ended && (
        <button type="button" onClick={onContinue} className={`mt-6 ${primary}`}>{t.dialogue.next}</button>
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
            <p><strong>{t.dialogue.decision(i + 1)}:</strong> {turn.choice?.label}</p>
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
  start,
  replay,
  originalFound,
  onChoose,
  onClose,
}: {
  spec: DialogueSpec;
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
        <Conversation spec={spec} path={path} firstTurn={replay.from} onChoose={onChoose} />
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
