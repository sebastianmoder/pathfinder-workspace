'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ContextDocument,
  LabId,
  LabSessionState,
  IterationState,
  Phase,
} from '@/lib/types';
import { PHASES } from '@/lib/constants';

interface LabSessionStore {
  session: LabSessionState | null;

  startLab: (labId: LabId, totalIterations: number) => void;
  restoreSession: (session: LabSessionState) => void;
  setAnswer: (iterationNumber: number, questionId: string, answer: string) => void;
  setAssembledPrompt: (iterationNumber: number, prompt: string) => void;
  markPromptEdited: (iterationNumber: number) => void;
  advancePhase: () => void;
  advanceIteration: () => void;
  toggleChecklistItem: (iterationNumber: number, itemId: string) => void;
  completeIteration: (iterationNumber: number) => void;
  completeLab: () => void;
  resetSession: () => void;
  setAdditionalContext: (text: string | null, fileName: string | null) => void;
  addAdditionalContextDocument: (text: string, fileName: string) => void;
  removeAdditionalContextDocument: (documentId: string) => void;
}

function buildAdditionalContext(documents: ContextDocument[]): string | null {
  if (documents.length === 0) return null;

  return documents
    .map((document, index) =>
      `Context document ${index + 1}: ${document.fileName}\n\n${document.text}`
    )
    .join('\n\n---\n\n');
}

function buildContextFileName(documents: ContextDocument[]): string | null {
  if (documents.length === 0) return null;
  if (documents.length === 1) return documents[0].fileName;
  return `${documents.length} context documents`;
}

function getContextDocuments(session: LabSessionState): ContextDocument[] {
  if (session.additionalContextDocuments?.length) {
    return session.additionalContextDocuments;
  }

  if (!session.additionalContext) {
    return [];
  }

  return [
    {
      id: 'legacy-context-document',
      fileName: session.additionalContextFileName ?? 'Context document',
      text: session.additionalContext,
      uploadedAt: session.lastActivityAt,
    },
  ];
}

function applyContextDocuments(
  session: LabSessionState,
  documents: ContextDocument[]
): LabSessionState {
  return {
    ...session,
    lastActivityAt: Date.now(),
    additionalContext: buildAdditionalContext(documents),
    additionalContextFileName: buildContextFileName(documents),
    additionalContextDocuments: documents,
  };
}

function createIterationState(iterationNumber: number): IterationState {
  return {
    iterationNumber,
    currentPhase: 'reflect',
    answers: {},
    checklistState: {},
    assembledPrompt: '',
    promptEdited: false,
    isComplete: false,
  };
}

function getNextPhase(current: Phase): Phase | null {
  const index = PHASES.indexOf(current);
  if (index < PHASES.length - 1) {
    return PHASES[index + 1];
  }
  return null;
}

export const useLabSessionStore = create<LabSessionStore>()(
  persist(
    (set, get) => ({
  session: null,

  startLab: (labId, totalIterations) => {
    const iterations: Record<number, IterationState> = {};
    for (let i = 1; i <= totalIterations; i++) {
      iterations[i] = createIterationState(i);
    }
    set({
      session: {
        sessionId: crypto.randomUUID(),
        labId,
        currentIteration: 1,
        iterations,
        startedAt: Date.now(),
        lastActivityAt: Date.now(),
      },
    });
  },

  restoreSession: (session) => {
    set({ session });
  },

  setAnswer: (iterationNumber, questionId, answer) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        lastActivityAt: Date.now(),
        iterations: {
          ...session.iterations,
          [iterationNumber]: {
            ...session.iterations[iterationNumber],
            answers: {
              ...session.iterations[iterationNumber].answers,
              [questionId]: answer,
            },
          },
        },
      },
    });
  },

  setAssembledPrompt: (iterationNumber, prompt) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        lastActivityAt: Date.now(),
        iterations: {
          ...session.iterations,
          [iterationNumber]: {
            ...session.iterations[iterationNumber],
            assembledPrompt: prompt,
          },
        },
      },
    });
  },

  markPromptEdited: (iterationNumber) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        iterations: {
          ...session.iterations,
          [iterationNumber]: {
            ...session.iterations[iterationNumber],
            promptEdited: true,
          },
        },
      },
    });
  },

  advancePhase: () => {
    const { session } = get();
    if (!session) return;

    const currentIter = session.iterations[session.currentIteration];
    const nextPhase = getNextPhase(currentIter.currentPhase);
    if (!nextPhase) return;

    set({
      session: {
        ...session,
        lastActivityAt: Date.now(),
        iterations: {
          ...session.iterations,
          [session.currentIteration]: {
            ...currentIter,
            currentPhase: nextPhase,
          },
        },
      },
    });
  },

  advanceIteration: () => {
    const { session } = get();
    if (!session) return;

    const currentIter = session.iterations[session.currentIteration];
    const nextIterNum = session.currentIteration + 1;

    if (!session.iterations[nextIterNum]) return;

    set({
      session: {
        ...session,
        lastActivityAt: Date.now(),
        currentIteration: nextIterNum,
        iterations: {
          ...session.iterations,
          [session.currentIteration]: {
            ...currentIter,
            isComplete: true,
          },
        },
      },
    });
  },

  toggleChecklistItem: (iterationNumber, itemId) => {
    const { session } = get();
    if (!session) return;
    const currentChecklist =
      session.iterations[iterationNumber].checklistState;
    set({
      session: {
        ...session,
        iterations: {
          ...session.iterations,
          [iterationNumber]: {
            ...session.iterations[iterationNumber],
            checklistState: {
              ...currentChecklist,
              [itemId]: !currentChecklist[itemId],
            },
          },
        },
      },
    });
  },

  completeIteration: (iterationNumber) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        lastActivityAt: Date.now(),
        iterations: {
          ...session.iterations,
          [iterationNumber]: {
            ...session.iterations[iterationNumber],
            isComplete: true,
          },
        },
      },
    });
  },

  completeLab: () => {
    const { session } = get();
    if (!session) return;
    const updatedIterations = { ...session.iterations };
    updatedIterations[session.currentIteration] = {
      ...updatedIterations[session.currentIteration],
      isComplete: true,
    };
    set({
      session: {
        ...session,
        lastActivityAt: Date.now(),
        iterations: updatedIterations,
      },
    });
  },

  setAdditionalContext: (text, fileName) => {
    const { session } = get();
    if (!session) return;
    const documents =
      text && fileName
        ? [
            {
              id: crypto.randomUUID(),
              fileName,
              text,
              uploadedAt: Date.now(),
            },
          ]
        : [];
    set({
      session: applyContextDocuments(session, documents),
    });
  },

  addAdditionalContextDocument: (text, fileName) => {
    const { session } = get();
    if (!session) return;
    const documents = getContextDocuments(session);
    if (documents.length >= 5) return;

    set({
      session: applyContextDocuments(session, [
        ...documents,
        {
          id: crypto.randomUUID(),
          fileName,
          text,
          uploadedAt: Date.now(),
        },
      ]),
    });
  },

  removeAdditionalContextDocument: (documentId) => {
    const { session } = get();
    if (!session) return;
    const documents = getContextDocuments(session).filter(
      (document) => document.id !== documentId
    );

    set({
      session: applyContextDocuments(session, documents),
    });
  },

  resetSession: () => {
    set({ session: null });
  },
}),
    {
      name: 'guard-lab-session',
      storage: createJSONStorage(() => window.sessionStorage),
    }
  )
);
