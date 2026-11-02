"use client";

import { useState } from "react";
import type { Hint } from "@/content/types";
import { t } from "@/lib/i18n/en";

/** Reveals one hint at a time, so help is there without giving the answer away immediately. */
export function useHintLadder(hints: Hint[]) {
  const [shown, setShown] = useState(0);
  const exhausted = shown >= hints.length;
  return {
    button:
      hints.length > 0 ? (
        <button
          type="button"
          onClick={() => setShown((n) => Math.min(n + 1, hints.length))}
          disabled={exhausted}
          className="btn btn-secondary btn-small"
        >
          {exhausted ? t.mission.noMoreHints : shown > 0 ? t.mission.anotherHint : t.mission.help}
        </button>
      ) : null,
    list:
      shown > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {hints.slice(0, shown).map((h) => (
            <li key={h.text}>{h.text}</li>
          ))}
        </ul>
      ) : null,
  };
}
