"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** In-memory only. Deliberately never written to storage (PRD §11). */
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
}

interface SessionState {
  missions: Record<string, MissionProgress>;
  completed: string[];
}

interface SessionApi {
  progress(missionId: string): MissionProgress;
  isCompleted(missionId: string): boolean;
  completedIds: string[];
  setAnswer(missionId: string, stepId: string, patch: Partial<Answer>): void;
  recordAttempt(missionId: string, stepId: string, choiceId: string): void;
  goTo(missionId: string, stepIndex: number): void;
  setStepState(missionId: string, stepId: string, value: unknown): void;
  complete(missionId: string): void;
  restart(missionId: string): void;
}

const empty: MissionProgress = { stepIndex: 0, answers: {}, stepState: {} };
const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ missions: {}, completed: [] });

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
      complete: (id) =>
        setState((s) => (s.completed.includes(id) ? s : { ...s, completed: [...s.completed, id] })),
      restart: (id) => update(id, () => empty),
    }),
    [state, update],
  );

  return <SessionContext value={api}>{children}</SessionContext>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
