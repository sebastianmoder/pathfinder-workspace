"use client";

import type { Progress } from "@/lib/journey-nav";
import { useSession } from "./session";

/** The player's progress in the shape the map and the debrief read it. */
export function useProgress(): Progress {
  const session = useSession();
  return {
    completed: session.completedIds,
    inProgress: (id) => !session.isCompleted(id) && session.progress(id).stepIndex > 0,
    reached: session.reached,
  };
}
