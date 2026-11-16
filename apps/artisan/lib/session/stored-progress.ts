import type { EvidenceLedger, EvidenceRecord } from "@/lib/evidence";

/**
 * The save: everything ARTISAN keeps on this device between visits, under one key. Since version 2 it holds the
 * whole game (finished cases, the work in each case, and the story's decisions), so a reload returns the player
 * to the step they were on. It stays on the device; the only way out is a file the player exports themselves.
 */
export const PROGRESS_KEY = "artisan_progress";
export const SAVE_VERSION = 2;
/** Marks an exported file as ours. */
export const SAVE_APP = "artisan";
/** Larger than any real save by a wide margin; anything bigger isn't one. */
export const MAX_SAVE_BYTES = 2_000_000;

export interface StoredAnswer {
  choiceId?: string;
  confidence?: number;
  attempts: number;
}

export interface StoredMission {
  stepIndex: number;
  answers: Record<string, StoredAnswer>;
  /** Working state of longer activities. Plain JSON only. */
  stepState: Record<string, unknown>;
  evidence: EvidenceLedger;
  facts: Record<string, string[]>;
}

export interface StoredStory {
  /** Decisions the story remembers, by flag id. */
  flags: Record<string, string>;
  /** Scenes already played, so they aren't shown twice. */
  scenes: string[];
  /** Play cases without story scenes. */
  quiet: boolean;
}

export interface StoredProgress {
  completed: string[];
  /** Furthest step shown in an unfinished case, as [step, total] in the player's own numbering. */
  reached: Record<string, [number, number]>;
  seen: string[];
  /** Fixes the order of answer options, so a reload doesn't reshuffle them. */
  orderSeed: number | null;
  missions: Record<string, StoredMission>;
  story: StoredStory;
}

export const emptyStory = (): StoredStory => ({ flags: {}, scenes: [], quiet: false });
export const emptyProgress = (): StoredProgress => ({ completed: [], reached: {}, seen: [], orderSeed: null, missions: {}, story: emptyStory() });

type Dict = Record<string, unknown>;
const isDict = (v: unknown): v is Dict => !!v && typeof v === "object" && !Array.isArray(v);
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const unique = (list: string[]) => [...new Set(list)];
/** Keys that could reach an object's prototype are never copied from a file. */
const safeKey = (k: string) => k !== "__proto__" && k !== "constructor" && k !== "prototype" && k.length <= 200;
const entries = (v: unknown): [string, unknown][] => (isDict(v) ? Object.entries(v).filter(([k]) => safeKey(k)) : []);

function parseReached(v: unknown): StoredProgress["reached"] {
  const reached: StoredProgress["reached"] = {};
  for (const [id, pair] of entries(v)) {
    if (Array.isArray(pair) && pair.length === 2 && pair.every((n) => Number.isInteger(n) && n > 0) && pair[0] <= pair[1]) {
      reached[id] = [pair[0], pair[1]];
    }
  }
  return reached;
}

function parseEvidence(v: unknown): EvidenceLedger {
  const ledger: EvidenceLedger = {};
  for (const [item, r] of entries(v)) {
    if (!isDict(r) || typeof r.right !== "boolean" || typeof r.firstTry !== "boolean") continue;
    const record: EvidenceRecord = { firstTry: r.firstTry, right: r.right, assisted: r.assisted === true, skipped: r.skipped === true };
    const self = r.selfAssessed;
    if (isDict(self) && Number.isInteger(self.met) && Number.isInteger(self.total)) {
      record.selfAssessed = { met: self.met as number, total: self.total as number };
    }
    ledger[item] = record;
  }
  return ledger;
}

function parseMission(v: unknown): StoredMission | null {
  if (!isDict(v) || !Number.isInteger(v.stepIndex) || (v.stepIndex as number) < 0) return null;
  const answers: StoredMission["answers"] = {};
  for (const [stepId, a] of entries(v.answers)) {
    if (!isDict(a)) continue;
    const answer: StoredAnswer = { attempts: Number.isInteger(a.attempts) && (a.attempts as number) >= 0 ? (a.attempts as number) : 0 };
    if (typeof a.choiceId === "string") answer.choiceId = a.choiceId;
    if (Number.isInteger(a.confidence) && (a.confidence as number) >= 0 && (a.confidence as number) <= 4) answer.confidence = a.confidence as number;
    answers[stepId] = answer;
  }
  const facts: StoredMission["facts"] = {};
  for (const [key, values] of entries(v.facts)) facts[key] = strings(values);
  // Step state belongs to each activity, which reads it defensively; it has already been through JSON.parse.
  const stepState = Object.fromEntries(entries(v.stepState));
  return { stepIndex: v.stepIndex as number, answers, stepState, evidence: parseEvidence(v.evidence), facts };
}

function parseStory(v: unknown): StoredStory {
  if (!isDict(v)) return emptyStory();
  const flags: Record<string, string> = {};
  for (const [id, value] of entries(v.flags)) if (typeof value === "string") flags[id] = value;
  return { flags, scenes: unique(strings(v.scenes)), quiet: v.quiet === true };
}

function fromData(data: Dict): StoredProgress | null {
  if (data.v !== 1 && data.v !== SAVE_VERSION) return null;
  const base = { completed: unique(strings(data.completed)), reached: parseReached(data.reached), seen: unique(strings(data.seen)) };
  // Version 1 kept only these three lists. Its finished cases carry over; the story starts from the beginning.
  if (data.v === 1) return { ...emptyProgress(), ...base };
  const missions: StoredProgress["missions"] = {};
  for (const [id, m] of entries(data.missions)) {
    const mission = parseMission(m);
    if (mission) missions[id] = mission;
  }
  const seed = data.orderSeed;
  return { ...base, orderSeed: Number.isInteger(seed) && (seed as number) >= 0 ? (seed as number) : null, missions, story: parseStory(data.story) };
}

/** Reads a stored value defensively: anything malformed is dropped rather than trusted. */
export function parseProgress(raw: string | null): StoredProgress {
  if (!raw) return emptyProgress();
  try {
    const data = JSON.parse(raw) as unknown;
    return (isDict(data) && fromData(data)) || emptyProgress();
  } catch {
    return emptyProgress();
  }
}

/** Writes only the save's own fields, whatever else the caller holds. */
export function serializeProgress(p: StoredProgress): string {
  return JSON.stringify({
    v: SAVE_VERSION,
    completed: p.completed,
    reached: p.reached,
    seen: p.seen,
    orderSeed: p.orderSeed,
    missions: p.missions,
    story: p.story,
  });
}

/** A save as a file the player keeps: the same data, labelled so it can be recognised when loaded. */
export function exportSave(p: StoredProgress, now: Date): string {
  return JSON.stringify({ app: SAVE_APP, exportedAt: now.toISOString(), ...(JSON.parse(serializeProgress(p)) as Dict) }, null, 1);
}

export type ImportResult = { ok: true; save: StoredProgress } | { ok: false; reason: "tooLarge" | "notJson" | "notASave" | "newer" };

/** Reads a file someone chose. Unlike the stored value, a file that isn't a save is refused, not silently emptied. */
export function importSave(text: string): ImportResult {
  if (text.length > MAX_SAVE_BYTES) return { ok: false, reason: "tooLarge" };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, reason: "notJson" };
  }
  if (!isDict(data) || data.app !== SAVE_APP) return { ok: false, reason: "notASave" };
  if (typeof data.v === "number" && data.v > SAVE_VERSION) return { ok: false, reason: "newer" };
  const save = fromData(data);
  return save ? { ok: true, save } : { ok: false, reason: "notASave" };
}

/** Joins what the device holds with what this tab has done since the page loaded. The tab's work wins. */
export function mergeProgress(stored: StoredProgress, tab: StoredProgress): StoredProgress {
  const reached = { ...stored.reached };
  for (const [id, pair] of Object.entries(tab.reached)) if (!reached[id] || pair[0] > reached[id][0]) reached[id] = pair;
  return {
    completed: unique([...stored.completed, ...tab.completed]),
    reached,
    seen: unique([...stored.seen, ...tab.seen]),
    orderSeed: stored.orderSeed ?? tab.orderSeed,
    missions: { ...stored.missions, ...tab.missions },
    story: {
      flags: { ...stored.story.flags, ...tab.story.flags },
      scenes: unique([...stored.story.scenes, ...tab.story.scenes]),
      quiet: stored.story.quiet || tab.story.quiet,
    },
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
