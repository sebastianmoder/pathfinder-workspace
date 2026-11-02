"use client";

import { useId, useState } from "react";
import type { Step } from "@/content/types";
import { t } from "@/lib/i18n/en";
import { useHintLadder } from "../hint-ladder";

type SortStep = Extract<Step, { kind: "sort" }>;

/** Select-and-place: each item gets a labelled <select>. No dragging needed. */
export function SortActivity({ step, onContinue }: { step: SortStep; onContinue: () => void }) {
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const ladder = useHintLadder(step.hints ?? []);

  const allPlaced = step.items.every((i) => placed[i.id]);
  const allRight = step.items.every((i) => placed[i.id] === i.categoryId);

  return (
    <div>
      <h2 className="text-2xl">{step.prompt}</h2>
      <ul className="mt-4 space-y-3">
        {step.items.map((item) => {
          const right = placed[item.id] === item.categoryId;
          return (
            <li key={item.id} className="rounded-lg border border-border bg-surface p-3">
              <label htmlFor={`${uid}-${item.id}`} className="font-bold">{item.label}</label>
              <select
                id={`${uid}-${item.id}`}
                value={placed[item.id] ?? ""}
                onChange={(e) => {
                  setPlaced((p) => ({ ...p, [item.id]: e.target.value }));
                  setChecked(false);
                }}
                className="mt-1 block w-full max-w-sm rounded border border-border bg-background px-2 py-1.5"
              >
                <option value="" disabled>{t.sort.choose}</option>
                {step.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              {checked && (
                <p className="mt-2 text-sm" role="status">
                  <strong><span aria-hidden="true" className={right ? "mark-yes" : "mark-no"}>{right ? "✔ " : "✖ "}</span>{right ? t.sort.fits : t.sort.tryAnother}</strong>{" "}
                  {item.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {ladder.list}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!allPlaced}
          onClick={() => setChecked(true)}
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
      </div>
      {checked && !allRight && <p className="mt-3 text-sm">{t.sort.fixSome}</p>}
    </div>
  );
}
