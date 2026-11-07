"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mergeEvidence, type EvidenceLedger, type EvidenceResult } from "@/lib/evidence";
import { clearStored, mergeProgress, readStored, writeStored, type StoredProgress } from "./stored-progress";

/** In-memory only. Answers are never written to storage (PRD §11); only `StoredProgress` is. */
export interface Answer {
  choiceId?: string;
  confidence?: number; // 0..4
  attempts: number;
}

interface MissionProgress {
  stepIndex: number;
  answers: Record<string, Answer>;
  /** Working state of longer activities, kept for the visit like everything else here. */
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
}

interface SessionApi {
  progress(missionId: string): MissionProgress;
  isCompleted(missionId: string): boolean;
  completedIds: string[];
  setAnswer(missionId: string, stepId: string, patch: Partial<Answer>): void;
  recordAttempt(missionId: string, stepId: string, choiceId: string): void;
  goTo(missionId: string, stepIndex: number): void;
  setStepState(missionId: string, stepId: string, value: unknown): void;
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
}

const empty: MissionProgress = { stepIndex: 0, answers: {}, stepState: {}, evidence: {}, facts: {} };
const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ missions: {}, completed: [], seen: [], reached: {}, arrival: null });
  const [orderSeed, setOrderSeed] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  // Saved progress can only be read in the browser, after the prerendered page has hydrated.
  useEffect(() => {
    const stored = readStored();
    /* eslint-disable react-hooks/set-state-in-effect -- storage can't be read during render */
    setState((s) => ({ ...s, ...mergeProgress(stored, { completed: s.completed, reached: s.reached, seen: s.seen }) }));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (hydrated) writeStored({ completed: state.completed, reached: state.reached, seen: state.seen });
  }, [hydrated, state.completed, state.reached, state.seen]);
  // Pages are prerendered, so this has to wait until the browser. Answer options only appear after a
  // learner has moved past a mission's first step, so nobody sees them reorder.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time random value can't be read during render
    setOrderSeed(Math.floor(Math.random() * 2 ** 31));
  }, []);

  const update = useCallback((missionId: string, fn: (p: MissionProgress) => MissionProgress) => {
    setState((s) => ({
      ...s,
      missions: { ...s.missions, [missionId]: fn(s.missions[missionId] ?? empty) },
    }));
  }, []);

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
        setState({ missions: {}, completed: [], seen: [], reached: {}, arrival: null });
      },
    }),
    [state, update, orderSeed, hydrated],
  );

  return <SessionContext value={api}>{children}</SessionContext>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
