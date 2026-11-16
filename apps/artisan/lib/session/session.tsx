"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mergeEvidence, type EvidenceLedger, type EvidenceResult } from "@/lib/evidence";
import { clearStored, emptyStory, mergeProgress, readStored, writeStored, type StoredProgress, type StoredStory } from "./stored-progress";

/** One answer in a case. Saved on this device with the rest of the game (PRD §11), and sent nowhere. */
export interface Answer {
  choiceId?: string;
  confidence?: number; // 0..4
  attempts: number;
}

interface MissionProgress {
  stepIndex: number;
  answers: Record<string, Answer>;
  /** Working state of longer activities. Plain JSON, so it can be saved. */
  stepState: Record<string, unknown>;
  /** What the learner did, for the debrief. A restart clears it along with everything else. */
  evidence: EvidenceLedger;
  /**
   * What an activity settled on, such as the conditions in a plan or the leads followed, keyed by step and
   * name. Epilogues and debrief replays read it; nothing grades it.
   */
  facts: Record<string, string[]>;
}

interface SessionState {
  missions: Record<string, MissionProgress>;
  completed: string[];
  /** Kinds of activity finished, so instructions for familiar ones can fade (PRD §4). */
  seen: string[];
  /** Furthest step shown per unfinished mission, kept on this device. */
  reached: StoredProgress["reached"];
  /** A mission just finished, so the map can show the route moving on. Never stored. */
  arrival: string | null;
  /** Fixes the order of answer options. Saved, so a reload doesn't reshuffle them. */
  orderSeed: number | null;
  story: StoredStory;
}

const saveOf = (s: SessionState): StoredProgress => ({
  completed: s.completed,
  reached: s.reached,
  seen: s.seen,
  orderSeed: s.orderSeed,
  missions: s.missions,
  story: s.story,
});
const blank = (): SessionState => ({ missions: {}, completed: [], seen: [], reached: {}, arrival: null, orderSeed: null, story: emptyStory() });
const newSeed = () => Math.floor(Math.random() * 2 ** 31);

interface SessionApi {
  progress(missionId: string): MissionProgress;
  isCompleted(missionId: string): boolean;
  completedIds: string[];
  setAnswer(missionId: string, stepId: string, patch: Partial<Answer>): void;
  recordAttempt(missionId: string, stepId: string, choiceId: string): void;
  goTo(missionId: string, stepIndex: number): void;
  setStepState(missionId: string, stepId: string, value: unknown): void;
  /** Changes one piece of step state from its current value. Stable, so it can be a dependency. */
  updateStepState(missionId: string, key: string, fn: (previous: unknown) => unknown): void;
  recordEvidence(missionId: string, item: string, result: EvidenceResult): void;
  setFact(missionId: string, key: string, values: string[]): void;
  /** Fixes the order of answer options for this visit. Never rendered itself. */
  orderSeed: number;
  complete(missionId: string): void;
  restart(missionId: string): void;
  hasSeen(key: string): boolean;
  markSeen(key: string): void;
  /** Step reached last time in an unfinished mission, as [step, total]. */
  reached(missionId: string): [number, number] | undefined;
  markReached(missionId: string, step: number, total: number): void;
  /** True once this device's saved progress has been read, so pages can avoid showing a blank path first. */
  hydrated: boolean;
  arrival: string | null;
  setArrival(missionId: string | null): void;
  /** Forgets everything on this device and in this tab. */
  resetProgress(): void;
  /** What the story remembers of the player's decisions, by flag id. */
  flags: Record<string, string>;
  setFlags(patch: Record<string, string>): void;
  sceneSeen(sceneId: string): boolean;
  markScenes(sceneIds: string[]): void;
  /** The whole game as it stands, for a save file. */
  snapshot(): StoredProgress;
  /** Replaces the game with a loaded save. */
  load(save: StoredProgress): void;
}

const empty: MissionProgress = { stepIndex: 0, answers: {}, stepState: {}, evidence: {}, facts: {} };
const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(blank);
  const [hydrated, setHydrated] = useState(false);
  // The save can only be read in the browser, after the prerendered page has hydrated. The order of answer
  // options is fixed here too: options only appear after a first step, so nobody sees them settle.
  useEffect(() => {
    const stored = readStored();
    /* eslint-disable react-hooks/set-state-in-effect -- storage can't be read during render */
    setState((s) => {
      const merged = mergeProgress(stored, saveOf(s));
      return { ...s, ...merged, orderSeed: merged.orderSeed ?? newSeed() };
    });
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  const save = useMemo(() => saveOf(state), [state]);
  useEffect(() => {
    if (hydrated) writeStored(save);
  }, [hydrated, save]);
  const orderSeed = state.orderSeed ?? 0;

  const update = useCallback((missionId: string, fn: (p: MissionProgress) => MissionProgress) => {
    setState((s) => {
      const current = s.missions[missionId] ?? empty;
      const next = fn(current);
      return next === current ? s : { ...s, missions: { ...s.missions, [missionId]: next } };
    });
  }, []);

  const updateStepState = useCallback(
    (id: string, key: string, fn: (previous: unknown) => unknown) =>
      update(id, (p) => {
        const next = fn(p.stepState[key]);
        return Object.is(next, p.stepState[key]) ? p : { ...p, stepState: { ...p.stepState, [key]: next } };
      }),
    [update],
  );

  const api = useMemo<SessionApi>(
    () => ({
      progress: (id) => state.missions[id] ?? empty,
      isCompleted: (id) => state.completed.includes(id),
      completedIds: state.completed,
      setAnswer: (id, stepId, patch) =>
        update(id, (p) => ({
          ...p,
          answers: {
            ...p.answers,
            [stepId]: { ...p.answers[stepId], attempts: p.answers[stepId]?.attempts ?? 0, ...patch },
          },
        })),
      recordAttempt: (id, stepId, choiceId) =>
        update(id, (p) => {
          const prev = p.answers[stepId] ?? { attempts: 0 };
          return {
            ...p,
            answers: { ...p.answers, [stepId]: { ...prev, choiceId, attempts: prev.attempts + 1 } },
          };
        }),
      goTo: (id, stepIndex) => update(id, (p) => ({ ...p, stepIndex })),
      setStepState: (id, stepId, value) =>
        update(id, (p) => ({ ...p, stepState: { ...p.stepState, [stepId]: value } })),
      updateStepState,
      recordEvidence: (id, item, result) =>
        update(id, (p) => ({ ...p, evidence: { ...p.evidence, [item]: mergeEvidence(p.evidence[item], result) } })),
      setFact: (id, key, values) => update(id, (p) => ({ ...p, facts: { ...p.facts, [key]: values } })),
      orderSeed,
      complete: (id) =>
        setState((s) => {
          if (s.completed.includes(id)) return s;
          const reached = { ...s.reached };
          delete reached[id];
          return { ...s, completed: [...s.completed, id], reached };
        }),
      restart: (id) => update(id, () => empty),
      hasSeen: (key) => state.seen.includes(key),
      markSeen: (key) => setState((s) => (s.seen.includes(key) ? s : { ...s, seen: [...s.seen, key] })),
      reached: (id) => state.reached[id],
      markReached: (id, step, total) =>
        setState((s) => {
          if (s.completed.includes(id) || (s.reached[id] && s.reached[id][0] >= step)) return s;
          return { ...s, reached: { ...s.reached, [id]: [step, total] } };
        }),
      hydrated,
      arrival: state.arrival,
      setArrival: (id) => setState((s) => (s.arrival === id ? s : { ...s, arrival: id })),
      resetProgress: () => {
        clearStored();
        setState({ ...blank(), orderSeed: newSeed() });
      },
      flags: state.story.flags,
      setFlags: (patch) =>
        setState((s) => {
          if (Object.entries(patch).every(([id, value]) => s.story.flags[id] === value)) return s;
          return { ...s, story: { ...s.story, flags: { ...s.story.flags, ...patch } } };
        }),
      sceneSeen: (id) => state.story.scenes.includes(id),
      markScenes: (ids) =>
        setState((s) => {
          const fresh = ids.filter((id) => !s.story.scenes.includes(id));
          return fresh.length === 0 ? s : { ...s, story: { ...s.story, scenes: [...s.story.scenes, ...fresh] } };
        }),
      snapshot: () => save,
      load: (loaded) => setState({ ...blank(), ...loaded, orderSeed: loaded.orderSeed ?? newSeed() }),
    }),
    [state, update, updateStepState, orderSeed, hydrated, save],
  );

  return <SessionContext value={api}>{children}</SessionContext>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
