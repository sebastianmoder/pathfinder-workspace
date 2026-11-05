"use client";

import { useId, useState } from "react";
import type { Step } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";
import { useHintLadder } from "../hint-ladder";
import { ActionBar, HowTo, useReveal } from "../step-ui";

type SortStep = Extract<Step, { kind: "sort" }>;

/**
 * Select-and-place, with no dragging (PRD §8). In "bins", the learner selects an item, then places it with a
 * button in the action bar, which stays in view on a narrow screen; the bins show what is where. "toggles"
 * gives every item a row of choices, like an app's permission screen.
 */
export function SortActivity({
  step,
  onEvidence,
  onContinue,
}: {
  step: SortStep;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(step.display === "toggles" ? null : step.items[0]?.id ?? null);
  const [announcement, setAnnouncement] = useState("");
  const [checked, setChecked] = useState(false);
  const ladder = useHintLadder(step.hints ?? []);

  const allPlaced = step.items.every((i) => placed[i.id]);
  const allRight = step.items.every((i) => placed[i.id] === i.categoryId);
  const [checks, setChecks] = useState(0);
  const boardRef = useReveal<HTMLDivElement>(checks);
  const left = step.items.filter((i) => !placed[i.id]);
  const label = (id: string) => step.items.find((i) => i.id === id)?.label ?? "";
  const categoryLabel = (id: string) => step.categories.find((c) => c.id === id)?.label ?? "";

  const place = (itemId: string, categoryId: string | null) => {
    const next = { ...placed };
    if (categoryId) next[itemId] = categoryId;
    else delete next[itemId];
    setPlaced(next);
    setChecked(false);
    setAnnouncement(categoryId ? t.sort.placed(label(itemId), categoryLabel(categoryId)) : t.sort.returned(label(itemId)));
    // Move straight on to the next item still to place, so sorting a list is one select per item.
    setSelected(step.items.find((i) => !next[i.id] && i.id !== itemId)?.id ?? null);
  };

  const feedback = (itemId: string) => {
    if (!checked) return null;
    const item = step.items.find((i) => i.id === itemId)!;
    const right = placed[item.id] === item.categoryId;
    return (
      <p className="mt-1 text-sm">
        <strong><span aria-hidden="true" className={right ? "mark-yes" : "mark-no"}>{right ? "✔ " : "✖ "}</span>{right ? t.sort.fits : t.sort.tryAnother}</strong>{" "}
        {item.explanation}
      </p>
    );
  };

  const chip = (itemId: string) => {
    const right = placed[itemId] === step.items.find((i) => i.id === itemId)?.categoryId;
    return (
      <button
        type="button"
        aria-pressed={selected === itemId}
        onClick={() => setSelected(selected === itemId ? null : itemId)}
        className="chip"
      >
        {checked && <span aria-hidden="true" className={right ? "mark-yes" : "mark-no"}>{right ? "✔ " : "✖ "}</span>}
        {label(itemId)}
      </button>
    );
  };

  return (
    <div>
      <h2 className="text-2xl">{step.prompt}</h2>
      <HowTo steps={step.display === "toggles" ? t.howTo.sortToggles : t.howTo.sort} />

      <div ref={boardRef} className="reveal mt-4">
        {step.display === "toggles" ? (
          <ul className="permission-list">
            {step.items.map((item) => (
              <li key={item.id}>
                <fieldset>
                  <legend className="font-bold">{item.label}</legend>
                  <div className="segmented mt-2" role="presentation">
                    {step.categories.map((c) => (
                      <label key={c.id}>
                        <input
                          type="radio"
                          name={`${uid}-${item.id}`}
                          checked={placed[item.id] === c.id}
                          onChange={() => {
                            setPlaced((p) => ({ ...p, [item.id]: c.id }));
                            setChecked(false);
                          }}
                        />
                        <span>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {checked && <div role="status">{feedback(item.id)}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <section aria-labelledby={`${uid}-tray`} className="rounded-lg border border-border bg-surface p-3">
              <h3 id={`${uid}-tray`} className="font-bold">{t.sort.tray(left.length)}</h3>
              {left.length ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {left.map((i) => <li key={i.id}>{chip(i.id)}</li>)}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-muted">{t.sort.allPlaced}</p>
              )}
            </section>
            <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${step.categories.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {step.categories.map((c) => {
                const here = step.items.filter((i) => placed[i.id] === c.id);
                return (
                  <section key={c.id} aria-labelledby={`${uid}-${c.id}`} className="bin">
                    <h3 id={`${uid}-${c.id}`} className="font-bold">{c.label}</h3>
                    {here.length ? (
                      <ul className="mt-2 space-y-2">
                        {here.map((i) => (
                          <li key={i.id} role={checked ? "status" : undefined}>
                            {chip(i.id)}
                            {feedback(i.id)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-muted">{t.sort.empty}</p>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      {ladder.list}

      <ActionBar
        note={
          selected && step.display !== "toggles"
            ? t.sort.choosePlace(label(selected))
            : !allPlaced
              ? t.mission.placeAll(left.length)
              : checked && !allRight
                ? t.sort.fixSome
                : undefined
        }
      >
        {selected && step.display !== "toggles" ? (
          <>
            {step.categories.map((c) => (
              <button key={c.id} type="button" onClick={() => place(selected, c.id)} className="btn btn-secondary btn-small">
                <span className="sr-only">{t.sort.placeIn} </span>{c.label}
              </button>
            ))}
            {placed[selected] && (
              <button type="button" onClick={() => place(selected, null)} className="btn btn-secondary btn-small">
                {t.sort.backToTray}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={!allPlaced}
              onClick={() => {
                for (const i of step.items) {
                  onEvidence(itemKey(step.id, i.id), { right: placed[i.id] === i.categoryId, assisted: ladder.used });
                }
                setChecked(true);
                setChecks((n) => n + 1);
              }}
              className="btn btn-primary"
            >
              {t.mission.commit}
            </button>
            {!checked && ladder.button}
            {checked && (
              <button type="button" onClick={onContinue} className="btn btn-primary">
                {t.mission.next}
              </button>
            )}
          </>
        )}
      </ActionBar>
    </div>
  );
}
