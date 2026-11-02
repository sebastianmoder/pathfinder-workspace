'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LabSessionState, ChatMessage, SessionHistoryEntry, Phase } from '@/lib/types';

const MAX_ENTRIES = 20;

interface HistoryStore {
  entries: SessionHistoryEntry[];
  saveSession: (
    labTitle: string,
    session: LabSessionState,
    messages: ChatMessage[],
    totalIterations: number
  ) => void;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],

      saveSession: (labTitle, session, messages, totalIterations) => {
        const { entries } = get();

        const currentIter = session.iterations[session.currentIteration];
        const currentPhase: Phase = currentIter?.currentPhase ?? 'reflect';

        const allIterations = Object.values(session.iterations);
        const isComplete =
          allIterations.length > 0 &&
          allIterations.every((it) => it.isComplete);

        const chatSnapshot: ChatMessage[] = messages.map(
          ({ id, role, content, timestamp, iterationNumber }) => ({
            id,
            role,
            content,
            timestamp,
            iterationNumber,
          })
        );

        const existingIndex = entries.findIndex(
          (e) => e.sessionSnapshot.sessionId === session.sessionId
        );

        if (existingIndex !== -1) {
          // Update existing entry in-place
          const updated = [...entries];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastActivityAt: session.lastActivityAt,
            currentIteration: session.currentIteration,
            currentPhase,
            isComplete,
            sessionSnapshot: session,
            chatSnapshot,
          };
          set({ entries: updated });
        } else {
          // Create new entry
          const newEntry: SessionHistoryEntry = {
            id: crypto.randomUUID(),
            labId: session.labId,
            labTitle,
            startedAt: session.startedAt,
            lastActivityAt: session.lastActivityAt,
            currentIteration: session.currentIteration,
            currentPhase,
            totalIterations,
            isComplete,
            sessionSnapshot: session,
            chatSnapshot,
          };

          const updated = [newEntry, ...entries];
          // Trim to max entries
          set({ entries: updated.slice(0, MAX_ENTRIES) });
        }
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      clearAll: () => {
        set({ entries: [] });
      },
    }),
    {
      name: 'guard-history',
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);
