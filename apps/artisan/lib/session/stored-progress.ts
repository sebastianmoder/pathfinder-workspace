/**
 * What ARTISAN keeps on this device between visits: which missions are finished, how far an unfinished one got,
 * and which kinds of activity are familiar. Nothing a learner chose or wrote is stored, so a reload can show the
 * path but can't restore a half-done mission (its later steps depend on earlier answers).
 */
export const PROGRESS_KEY = "artisan_progress";

export interface StoredProgress {
  completed: string[];
  /** Furthest step shown in an unfinished mission, as [step, total] in the learner's own numbering. */
  reached: Record<string, [number, number]>;
  seen: string[];
}

export const emptyProgress = (): StoredProgress => ({ completed: [], reached: {}, seen: [] });

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Reads a stored value defensively: anything malformed is dropped rather than trusted. */
export function parseProgress(raw: string | null): StoredProgress {
  if (!raw) return emptyProgress();
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== "object" || data.v !== 1) return emptyProgress();
    const reached: StoredProgress["reached"] = {};
    if (data.reached && typeof data.reached === "object") {
      for (const [id, pair] of Object.entries(data.reached as Record<string, unknown>)) {
        if (Array.isArray(pair) && pair.length === 2 && pair.every((n) => Number.isInteger(n) && n > 0) && pair[0] <= pair[1]) {
          reached[id] = [pair[0], pair[1]];
        }
      }
    }
    return { completed: strings(data.completed), reached, seen: strings(data.seen) };
  } catch {
    return emptyProgress();
  }
}

/** Writes only the three allowed fields, whatever else the caller holds. */
export function serializeProgress(p: StoredProgress): string {
  return JSON.stringify({ v: 1, completed: p.completed, reached: p.reached, seen: p.seen });
}

export function mergeProgress(a: StoredProgress, b: StoredProgress): StoredProgress {
  const reached = { ...a.reached };
  for (const [id, pair] of Object.entries(b.reached)) if (!reached[id] || pair[0] > reached[id][0]) reached[id] = pair;
  return {
    completed: [...new Set([...a.completed, ...b.completed])],
    reached,
    seen: [...new Set([...a.seen, ...b.seen])],
  };
}

export function readStored(): StoredProgress {
  try {
    return parseProgress(window.localStorage.getItem(PROGRESS_KEY));
  } catch {
    return emptyProgress();
  }
}

export function writeStored(p: StoredProgress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, serializeProgress(p));
  } catch {
    // Storage blocked or full: the visit still works, it just won't be remembered.
  }
}

export function clearStored() {
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // Nothing to clear.
  }
}
