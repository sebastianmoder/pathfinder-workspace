'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/stores/chatStore';
import { useLabSessionStore } from '@/stores/labSessionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { getLabConfig } from '@/content/labs';
import type { LabId } from '@/lib/types';

export function useStartNewLab() {
  const router = useRouter();

  return useCallback(
    (labId: LabId) => {
      const session = useLabSessionStore.getState().session;
      const messages = useChatStore.getState().messages;

      // Save current session to history if there's meaningful progress
      if (session && messages.length > 0) {
        const config = getLabConfig(session.labId);
        useHistoryStore
          .getState()
          .saveSession(
            config?.meta.title ?? session.labId,
            session,
            messages,
            config?.iterations.length ?? 3
          );
      }

      // Clear active state so the new lab starts completely fresh
      useChatStore.getState().clearMessages();
      useLabSessionStore.getState().resetSession();

      router.push(`/lab/${labId}`);
    },
    [router]
  );
}
