"use client";

import { useEffect, useRef } from "react";
import type { Step } from "@/content/types";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { useHintLadder } from "../hint-ladder";

type MapStep = Extract<Step, { kind: "argumentMap" }>;

interface MapState {
  placed: Record<string, string>;
  selected: string | null;
  checked: boolean;
  /** Counts placements, so focus can move after the placed card leaves the pool. */
  moves: number;
}

const primary = "btn btn-primary";

/** Select-and-place: choose a card, then a slot. Nothing needs dragging. */
export function ArgumentMap({ missionId, step, onContinue }: { missionId: string; step: MapStep; onContinue: () => void }) {
  const session = useSession();
  const state = (session.progress(missionId).stepState[step.id] as MapState | undefined) ?? {
    placed: {},
    selected: null,
    checked: false,
    moves: 0,
  };
  const set = (patch: Partial<MapState>) => session.setStepState(missionId, step.id, { ...state, ...patch });

  // The placed card's button leaves the pool, so focus returns to the pool for the next card.
  const poolHeading = useRef<HTMLHeadingElement>(null);
  const seenMoves = useRef(state.moves);
  useEffect(() => {
    if (seenMoves.current !== state.moves) {
      seenMoves.current = state.moves;
      poolHeading.current?.focus();
    }
  }, [state.moves]);

  const ladder = useHintLadder(step.hints ?? []);
  const unplaced = step.cards.filter((c) => !state.placed[c.id]);
  const allPlaced = unplaced.length === 0;

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

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1">{step.prompt}</p>

      <div className="mt-4 lg:grid lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-6">
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
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 lg:mt-0">
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

      {ladder.list}
      <div className="mt-4 flex flex-wrap gap-3">
        {!state.checked && ladder.button}
        <button type="button" disabled={!allPlaced} onClick={() => set({ checked: true })} className={primary}>{t.argumentMap.check}</button>
        {state.checked && (
          <button type="button" onClick={onContinue} className={primary}>{t.mission.next}</button>
        )}
      </div>
      {state.checked && <p role="status" className="mt-2 text-sm">{t.argumentMap.continueNote}</p>}
    </div>
  );
}
