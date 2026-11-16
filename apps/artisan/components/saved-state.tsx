"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useSession } from "@/lib/session/session";

/** Which mission and step an activity belongs to, so its working state can be kept in the save. */
export const SavedScope = createContext<{ missionId: string; scope: string } | null>(null);

/**
 * `useState` for an activity's working state, kept in the save so a reload returns to the same point inside
 * the step. The value must be plain JSON. Outside a mission step (a practice question in a debrief, say) it
 * is ordinary local state. State that is only about the pointer or the moment (a drag, an announcement, a
 * selection about to be placed) should stay with `useState`.
 */
export function useSaved<T>(name: string, initial: T | (() => T)): [T, (next: T | ((previous: T) => T)) => void] {
  const scope = useContext(SavedScope);
  const session = useSession();
  const [start] = useState(initial);
  const [local, setLocal] = useState<T>(start);
  const key = scope ? `${scope.scope}#${name}` : "";
  const missionId = scope?.missionId ?? "";
  const { updateStepState } = session;
  const setSaved = useCallback(
    (next: T | ((previous: T) => T)) =>
      updateStepState(missionId, key, (stored) => {
        const previous = stored === undefined ? start : (stored as T);
        return typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
      }),
    [updateStepState, missionId, key, start],
  );
  if (!scope) return [local, setLocal];
  const stored = session.progress(missionId).stepState[key];
  return [stored === undefined ? start : (stored as T), setSaved];
}
