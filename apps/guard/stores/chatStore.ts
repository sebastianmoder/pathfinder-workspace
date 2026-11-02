'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatErrorInfo, ChatJobReference, ChatMessage } from '@/lib/types';
import { DEFAULT_MODEL, DEFAULT_BYOK_MODEL } from '@/lib/constants';

const LEGACY_DEFAULT_MODEL = 'arcee-ai/trinity-large-preview:free';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: ChatErrorInfo | null;
  model: string;
  byokKey: string | null;

  addUserMessage: (content: string, iterationNumber: number) => string;
  startStreaming: (iterationNumber: number, inReplyToMessageId: string) => string;
  restartStreaming: (messageId: string) => void;
  appendStreamChunk: (messageId: string, chunk: string) => void;
  setActiveJob: (messageId: string, job: ChatJobReference) => void;
  setJobContent: (messageId: string, content: string) => void;
  finishStreaming: (messageId: string) => void;
  failStreaming: (messageId: string, error: ChatErrorInfo) => void;
  acceptPartialMessage: (messageId: string) => void;
  setError: (error: ChatErrorInfo | null) => void;
  setModel: (model: string) => void;
  setByokKey: (key: string | null) => void;
  clearMessages: () => void;
  restoreMessages: (messages: ChatMessage[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

function normalizeRestoredMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => {
    const wasStreaming = message.status === 'streaming' || message.isStreaming;
    if (!wasStreaming) {
      return {
        ...message,
        isStreaming: false,
        status: message.status ?? 'complete',
      };
    }

    if (message.job && message.job.startedAt + 60 * 60_000 > Date.now()) {
      return { ...message, isStreaming: true, status: 'streaming' };
    }

    return {
      ...message,
      isStreaming: false,
      status: 'incomplete',
      failure: message.failure ?? {
        code: 'connection_interrupted',
        message: 'The response was interrupted when this page was closed or reloaded.',
        retryable: true,
        requestId: `local-${generateId()}`,
        elapsedMs: Math.max(0, Date.now() - message.timestamp),
        hasPartialResponse: message.content.length > 0,
      },
      job: undefined,
    };
  });
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
  messages: [],
  isStreaming: false,
  error: null,
  model: DEFAULT_MODEL,
  byokKey: null,

  addUserMessage: (content, iterationNumber) => {
    const id = generateId();
    const message: ChatMessage = {
      id,
      role: 'user',
      content,
      timestamp: Date.now(),
      iterationNumber,
      status: 'complete',
    };
    set((state) => ({
      messages: [...state.messages, message],
    }));
    return id;
  },

  startStreaming: (iterationNumber, inReplyToMessageId) => {
    const id = generateId();
    const message: ChatMessage = {
      id,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      iterationNumber,
      isStreaming: true,
      status: 'streaming',
      inReplyToMessageId,
    };
    set((state) => ({
      messages: [...state.messages, message],
      isStreaming: true,
      error: null,
    }));
    return id;
  },

  restartStreaming: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: '',
              isStreaming: true,
              status: 'streaming',
              failure: undefined,
              job: undefined,
              animated: false,
              timestamp: Date.now(),
            }
          : m
      ),
      isStreaming: true,
      error: null,
    }));
  },

  appendStreamChunk: (messageId, chunk) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + chunk } : m
      ),
    }));
  },

  setActiveJob: (messageId, job) => {
    set((state) => ({
      messages: state.messages.map((m) => m.id === messageId ? { ...m, job, animated: true } : m),
    }));
  },

  setJobContent: (messageId, content) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId && content.length >= m.content.length ? { ...m, content } : m
      ),
    }));
  },

  finishStreaming: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              isStreaming: false,
              status: 'complete',
              failure: undefined,
              job: undefined,
            }
          : m
      ),
      isStreaming: false,
    }));
  },

  failStreaming: (messageId, error) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              isStreaming: false,
              status: 'incomplete',
              failure: error,
              job: undefined,
            }
          : m
      ),
      isStreaming: false,
      error: null,
    }));
  },

  acceptPartialMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              isStreaming: false,
              status: 'complete',
              failure: undefined,
              job: undefined,
            }
          : m
      ),
      error: null,
    }));
  },

  setError: (error) => {
    set({ error });
  },

  setModel: (model) => {
    set({ model });
  },

  setByokKey: (key) => {
    set({
      byokKey: key,
      model: key ? DEFAULT_BYOK_MODEL : DEFAULT_MODEL,
    });
  },

  clearMessages: () => {
    set({ messages: [], isStreaming: false, error: null });
  },

  restoreMessages: (messages) => {
    const restored = normalizeRestoredMessages(messages);
    set({
      messages: restored,
      isStreaming: restored.some((message) => message.status === 'streaming'),
      error: null,
    });
  },
}),
    {
      name: 'guard-chat',
      storage: createJSONStorage(() => window.sessionStorage),
      partialize: (state) => ({
        messages: state.messages,
        model: state.model,
        byokKey: state.byokKey,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<ChatStore>;
        const restored = normalizeRestoredMessages(persisted.messages ?? currentState.messages);
        const shouldUpgradeLegacyDefault =
          !persisted.byokKey && persisted.model === LEGACY_DEFAULT_MODEL;

        return {
          ...currentState,
          ...persisted,
          messages: restored,
          isStreaming: restored.some((message) => message.status === 'streaming'),
          model: shouldUpgradeLegacyDefault
            ? DEFAULT_MODEL
            : persisted.model ?? currentState.model,
        };
      },
    }
  )
);
