'use client';

import { useMemo } from 'react';
import { useLabSessionStore } from '@/stores/labSessionStore';
import { getLabConfig } from '@/content/labs';
import type { IterationConfig, IterationState } from '@/lib/types';

export function useLabSession() {
  const session = useLabSessionStore((s) => s.session);
  const startLab = useLabSessionStore((s) => s.startLab);
  const setAnswer = useLabSessionStore((s) => s.setAnswer);
  const setAssembledPrompt = useLabSessionStore((s) => s.setAssembledPrompt);
  const markPromptEdited = useLabSessionStore((s) => s.markPromptEdited);
  const advancePhase = useLabSessionStore((s) => s.advancePhase);
  const advanceIteration = useLabSessionStore((s) => s.advanceIteration);
  const toggleChecklistItem = useLabSessionStore((s) => s.toggleChecklistItem);
  const completeIteration = useLabSessionStore((s) => s.completeIteration);
  const completeLab = useLabSessionStore((s) => s.completeLab);
  const resetSession = useLabSessionStore((s) => s.resetSession);
  const setAdditionalContext = useLabSessionStore((s) => s.setAdditionalContext);

  const labConfig = useMemo(() => {
    if (!session) return undefined;
    return getLabConfig(session.labId);
  }, [session]);

  const currentIterationConfig: IterationConfig | undefined = useMemo(() => {
    if (!labConfig || !session) return undefined;
    return labConfig.iterations.find(
      (i) => i.iterationNumber === session.currentIteration
    );
  }, [labConfig, session]);

  const currentIterationState: IterationState | undefined = useMemo(() => {
    if (!session) return undefined;
    return session.iterations[session.currentIteration];
  }, [session]);

  const totalIterations = labConfig?.iterations.length ?? 0;

  const isLabComplete = useMemo(() => {
    if (!session || !labConfig) return false;
    // Lab is complete if the current iteration is marked complete
    // and there's no next non-optional iteration
    const currentState = session.iterations[session.currentIteration];
    if (!currentState?.isComplete) return false;

    const nextIter = labConfig.iterations.find(
      (i) => i.iterationNumber === session.currentIteration + 1
    );
    // If no next iteration, or it's optional and current is done
    return !nextIter || nextIter.isOptional;
  }, [session, labConfig]);

  return {
    session,
    labConfig,
    currentIterationConfig,
    currentIterationState,
    totalIterations,
    isLabComplete,
    startLab,
    setAnswer,
    setAssembledPrompt,
    markPromptEdited,
    advancePhase,
    advanceIteration,
    toggleChecklistItem,
    completeIteration,
    completeLab,
    resetSession,
    setAdditionalContext,
  };
}
