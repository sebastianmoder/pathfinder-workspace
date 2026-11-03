"use client";

import { useEffect, useId, useRef } from "react";
import { PROPOSAL, type Mission, type Step } from "@/content/types";
import { knockOut } from "@/lib/argument";
import { startNodeId, walk } from "@/lib/dialogue";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { ActionBar, HowTo, useReveal } from "../step-ui";
import { useHintLadder } from "../hint-ladder";

type MapStep = Extract<Step, { kind: "argumentMap" }>;

interface MapState {
  placed: Record<string, string>;
  selected: string | null;
  checked: boolean;
  /** Counts placements, so focus can move after the placed card leaves the pool. */
  moves: number;
  phase: "place" | "connect" | "test";
  /** Where the learner connected each card. */
  targets: Record<string, string>;
  linksChecked: boolean;
  /** Cards supposed false in the test. */
  off: string[];
  tried: string[];
}

const primary = "btn btn-primary";
const MIN_TRIED = 2;

/** Select-and-place: choose a card, then a slot. Nothing needs dragging. Then connect it and test it. */
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
  const progress = session.progress(mission.id);
  const state: MapState = {
    placed: {},
    selected: null,
    checked: false,
    moves: 0,
    phase: "place",
    targets: {},
    linksChecked: false,
    off: [],
    tried: [],
    ...(progress.stepState[step.id] as Partial<MapState> | undefined),
  };
  const set = (patch: Partial<MapState>) => session.setStepState(mission.id, step.id, { ...state, ...patch });

  // The placed card's button leaves the pool, so focus returns to the pool for the next card.
  const poolHeading = useRef<HTMLHeadingElement>(null);
  const seenMoves = useRef(state.moves);
  useEffect(() => {
    if (seenMoves.current !== state.moves) {
      seenMoves.current = state.moves;
      poolHeading.current?.focus();
    }
  }, [state.moves]);

  const phaseHeading = useRef<HTMLHeadingElement>(null);
  const seenPhase = useRef(state.phase);
  useEffect(() => {
    if (seenPhase.current !== state.phase) {
      seenPhase.current = state.phase;
      phaseHeading.current?.focus();
    }
  }, [state.phase]);

  const ladder = useHintLadder(step.hints ?? []);
  const unplaced = step.cards.filter((c) => !state.placed[c.id]);
  const allPlaced = unplaced.length === 0;

  // What the rest of the mission brings to the map: the position, the condition and the findings.
  const initial = mission.steps.find((s) => s.id === step.initialStepId);
  const initialChoice = progress.answers[step.initialStepId]?.choiceId;
  const position = initial && "choices" in initial ? initial.choices.find((c) => c.id === initialChoice)?.label : undefined;
  const dialogueStep = mission.steps.find((s) => s.id === step.dialogueStepId);
  const path =
    dialogueStep?.kind === "dialogue"
      ? walk(
          dialogueStep.dialogue,
          startNodeId(dialogueStep.dialogue, initialChoice),
          (progress.stepState[step.dialogueStepId] as { choices?: string[] } | undefined)?.choices ?? [],
        )
      : null;
  const condition = path?.ended ? path.turns.findLast((turn) => turn.choice)?.choice?.label : undefined;
  const uncovered = path?.discovered ?? [];

  function place(slotId: string) {
    if (!state.selected) return;
    set({
      placed: { ...state.placed, [state.selected]: slotId },
      selected: null,
      checked: false,
      moves: state.moves + 1,
    });
  }

  function takeBack(cardId: string) {
    const placed = { ...state.placed };
    delete placed[cardId];
    set({ placed, selected: cardId, checked: false, moves: state.moves + 1 });
  }

  if (state.phase === "connect") {
    return <ConnectPhase step={step} state={state} set={set} headingRef={phaseHeading} onEvidence={onEvidence} />;
  }
  if (state.phase === "test") {
    return (
      <TestPhase
        step={step}
        state={state}
        set={set}
        headingRef={phaseHeading}
        position={position}
        condition={condition}
        uncovered={uncovered}
        onContinue={onContinue}
      />
    );
  }

  return (
    <div>
      <h2 ref={phaseHeading} tabIndex={-1} className="text-2xl">{step.title}</h2>
      <p className="mt-1">{step.prompt}</p>
      <HowTo steps={t.howTo.argumentMap} />

      <div className="mt-4 lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6">
        <div>
          <h3 ref={poolHeading} tabIndex={-1} className="font-bold">{t.argumentMap.cards}</h3>
          {allPlaced ? (
            <p className="mt-2 text-sm">{t.argumentMap.allPlaced}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {unplaced.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={state.selected === c.id}
                    onClick={() => set({ selected: state.selected === c.id ? null : c.id })}
                    className="w-full rounded-lg border border-border bg-surface p-3 text-left text-sm aria-pressed:border-2 aria-pressed:border-accent aria-pressed:font-bold"
                  >
                    {state.selected === c.id && <span aria-hidden="true">▶ </span>}
                    {c.text}
                    {c.discovery && uncovered.includes(c.discovery) && <span className="mt-1 block font-normal text-muted">{t.argumentMap.uncovered}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 lg:mt-0">
          <div data-scroll-panel className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <div className="mat p-3">
            <p className="sheet p-3">
              <span className="text-sm text-muted">{t.argumentMap.proposal}: </span>
              <strong>{step.proposal}</strong>
            </p>
          </div>
          <ul className="ml-4 border-l-2 border-border pl-4">
            {step.slots.map((slot) => (
              <li key={slot.id} className="mt-3 rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{slot.label}</h3>
                    <p className="text-sm text-muted">{slot.help}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!state.selected}
                    onClick={() => place(slot.id)}
                    className="btn btn-secondary btn-small"
                  >
                    {t.argumentMap.placeHere}<span className="sr-only">: {slot.label}</span>
                  </button>
                </div>
                <ul className="mt-2 space-y-2">
                  {step.cards.filter((c) => state.placed[c.id] === slot.id).map((c) => {
                    const verdict = c.slotId === slot.id ? "best" : c.defensibleSlotIds?.includes(slot.id) ? "defensible" : "weaker";
                    return (
                      <li key={c.id} className="rounded border border-border bg-surface p-2 text-sm">
                        <p>{c.text}</p>
                        {state.checked && (
                          <p className="mt-1">
                            <strong>
                              <span aria-hidden="true" className={verdict === "weaker" ? "mark-no" : "mark-yes"}>{verdict === "weaker" ? "✖ " : verdict === "best" ? "✔ " : "◆ "}</span>
                              {t.argumentMap[verdict]}.
                            </strong>{" "}
                            {verdict !== "best" && <>{t.argumentMap.reviewed(step.slots.find((s) => s.id === c.slotId)!.label)} </>}
                            {c.explanation}
                          </p>
                        )}
                        <button type="button" onClick={() => takeBack(c.id)} className="mt-1 underline">
                          {t.argumentMap.moveBack}<span className="sr-only">: {c.text}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>

      {ladder.list}
      <ActionBar
        note={
          state.selected
            ? t.argumentMap.nowPlace(step.cards.find((c) => c.id === state.selected)!.text)
            : !allPlaced ? t.argumentMap.pickCard(unplaced.length)
            : state.checked ? t.argumentMap.continueNote
            : undefined
        }
      >
        {!state.checked && ladder.button}
        <button
          type="button"
          disabled={!allPlaced}
          onClick={() => {
            for (const c of step.cards) {
              const slot = state.placed[c.id];
              onEvidence(itemKey(step.id, c.id), { right: slot === c.slotId || !!c.defensibleSlotIds?.includes(slot), assisted: ladder.used });
            }
            set({ checked: true });
          }}
          className={primary}
        >
          {t.argumentMap.check}
        </button>
        {state.checked && (
          <button type="button" onClick={() => set({ phase: "connect" })} className={primary}>{t.argumentMap.toConnect}</button>
        )}
      </ActionBar>
    </div>
  );
}

function ConnectPhase({
  step,
  state,
  set,
  headingRef,
  onEvidence,
}: {
  step: MapStep;
  state: MapState;
  set: (patch: Partial<MapState>) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onEvidence: (item: string, result: EvidenceResult) => void;
}) {
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const reasons = step.cards.filter((c) => c.slotId === "reason");
  const label = (id: string) => (id === PROPOSAL ? t.argumentMap.wholeProposal : step.cards.find((c) => c.id === id)!.text);
  const fits = (link: MapStep["links"][number]) =>
    state.targets[link.cardId] === link.targetId || !!link.defensibleTargetIds?.includes(state.targets[link.cardId]);
  const allSet = step.links.every((l) => state.targets[l.cardId]);
  const linksRef = useReveal<HTMLUListElement>(state.linksChecked);

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl">{t.argumentMap.connectTitle}</h2>
      <p className="mt-1">{t.argumentMap.connectIntro}</p>
      <ul ref={linksRef} className="reveal mt-4 space-y-3">
        {step.links.map((link) => {
          const card = step.cards.find((c) => c.id === link.cardId)!;
          const right = fits(link);
          return (
            <li key={link.cardId} className="rounded-lg border border-border bg-surface p-3">
              <label htmlFor={`${uid}-${link.cardId}`} className="block">
                <span className="font-bold">{card.text}</span>
                <span className="mt-1 block text-sm">{t.argumentMap.linkKind[link.kind]}</span>
              </label>
              <select
                id={`${uid}-${link.cardId}`}
                value={state.targets[link.cardId] ?? ""}
                onChange={(e) => set({ targets: { ...state.targets, [link.cardId]: e.target.value }, linksChecked: false })}
                className="mt-1 block w-full rounded border border-border bg-background px-2 py-1.5"
              >
                <option value="" disabled>{t.argumentMap.chooseTarget}</option>
                {reasons.map((r) => <option key={r.id} value={r.id}>{r.text}</option>)}
                <option value={PROPOSAL}>{t.argumentMap.wholeProposal}</option>
              </select>
              {state.linksChecked && (
                <p role="status" className="mt-2 text-sm">
                  <strong><span aria-hidden="true" className={right ? "mark-yes" : "mark-no"}>{right ? "✔ " : "✖ "}</span>{right ? t.argumentMap.best : t.argumentMap.weaker}.</strong>{" "}
                  {!right && <>{t.argumentMap.reviewedLink(label(link.targetId))} </>}
                  {link.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <ActionBar note={!allSet ? t.mission.placeAll(step.links.filter((l) => !state.targets[l.cardId]).length) : undefined}>
        <button
          type="button"
          disabled={!allSet}
          onClick={() => {
            for (const link of step.links) onEvidence(itemKey(step.id, "link", link.cardId), { right: fits(link) });
            set({ linksChecked: true });
          }}
          className={primary}
        >
          {t.argumentMap.checkLinks}
        </button>
        {state.linksChecked && (
          <button type="button" onClick={() => set({ phase: "test" })} className={primary}>{t.argumentMap.toTest}</button>
        )}
      </ActionBar>
    </div>
  );
}

function TestPhase({
  step,
  state,
  set,
  headingRef,
  position,
  condition,
  uncovered,
  onContinue,
}: {
  step: MapStep;
  state: MapState;
  set: (patch: Partial<MapState>) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  position: string | undefined;
  condition: string | undefined;
  uncovered: string[];
  onContinue: () => void;
}) {
  const reasons = step.cards.filter((c) => c.slotId === "reason");
  const links = step.links.map((l) => ({ cardId: l.cardId, kind: l.kind, targetId: state.targets[l.cardId] ?? l.targetId }));
  const result = knockOut(reasons.map((r) => r.id), links, state.off);
  const linked = (targetId: string) => links.filter((l) => l.targetId === targetId);
  const text = (id: string) => step.cards.find((c) => c.id === id)!.text;

  function toggle(id: string, on: boolean) {
    set({
      off: on ? [...state.off, id] : state.off.filter((x) => x !== id),
      tried: state.tried.includes(id) ? state.tried : [...state.tried, id],
    });
  }

  const renderCard = (id: string, kind?: keyof typeof t.argumentMap.linkShort) => {
    const card = step.cards.find((c) => c.id === id)!;
    return (
      <li key={id} className="rounded border border-border bg-surface p-2 text-sm">
        {kind && <span className="block text-muted">{t.argumentMap.linkShort[kind]}</span>}
        <span className={state.off.includes(id) ? "line-through" : undefined}>{card.text}</span>
        {card.discovery && uncovered.includes(card.discovery) && <span className="block text-muted">{t.argumentMap.uncovered}</span>}
        <label className="mt-1 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={state.off.includes(id)} onChange={(e) => toggle(id, e.target.checked)} />
          {t.argumentMap.suppose}<span className="sr-only">: {card.text}</span>
        </label>
      </li>
    );
  };

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl">{t.argumentMap.testTitle}</h2>
      <p className="mt-1">{t.argumentMap.testIntro}</p>

      <div className="mat mt-4 p-3">
        <div className="sheet p-3">
          <p><span className="text-sm text-muted">{t.argumentMap.proposal}: </span><strong>{step.proposal}</strong></p>
          {position && <p className="mt-2"><span className="text-sm text-muted">{t.argumentMap.yourPosition}: </span>{position}</p>}
          {condition && <p className="mt-2"><span className="text-sm text-muted">{t.argumentMap.yourCondition}: </span>{condition}</p>}
        </div>
      </div>

      <div role="status" className="mt-3 rounded-lg border border-border bg-surface p-3">
        <p className="font-bold">{t.argumentMap.resultHeading}</p>
        {state.off.length === 0 ? (
          <p className="text-sm">{t.argumentMap.nothingOff}</p>
        ) : (
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {result.proposalUndercut && <li><strong>{t.argumentMap.undercut}</strong></li>}
            {result.fallen.map((id) => <li key={id}>{t.argumentMap.falls(text(id))}</li>)}
            {!result.proposalUndercut && result.fallen.length === 0 && <li>{t.argumentMap.stillStands}</li>}
            <li>{t.argumentMap.objectionsLeft(result.liveObjections.length)}</li>
          </ul>
        )}
      </div>

      <ul className="mt-3 space-y-4">
        {reasons.map((reason) => (
          <li key={reason.id} className="rounded-lg border border-border p-3">
            <p className="text-sm font-bold">
              {result.fallen.includes(reason.id) ? t.argumentMap.fallenLabel : t.argumentMap.reasonLabel}
            </p>
            <ul className="mt-1 space-y-2">
              {renderCard(reason.id)}
              {linked(reason.id).map((l) => renderCard(l.cardId, l.kind))}
            </ul>
          </li>
        ))}
        <li className="rounded-lg border border-border p-3">
          <p className="text-sm font-bold">{t.argumentMap.onProposal}</p>
          <ul className="mt-1 space-y-2">
            {linked(PROPOSAL).map((l) => renderCard(l.cardId, l.kind))}
            {linked(PROPOSAL).length === 0 && <li className="text-sm text-muted">{t.argumentMap.nothingOnProposal}</li>}
          </ul>
        </li>
      </ul>

      <ActionBar note={state.tried.length >= MIN_TRIED ? undefined : t.argumentMap.tryMore(MIN_TRIED)}>
        {state.tried.length >= MIN_TRIED && <button type="button" onClick={onContinue} className={primary}>{t.mission.next}</button>}
      </ActionBar>
    </div>
  );
}
