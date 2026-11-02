'use client';

import { useCallback, useEffect, useRef } from 'react';
import { PhaseIndicator } from './PhaseIndicator';
import { IterationIndicator } from './IterationIndicator';
import { ReflectPhase } from './ReflectPhase';
import { ComposePhase } from './ComposePhase';
import { EvaluatePhase } from './EvaluatePhase';
import { PhaseNavigation } from './PhaseNavigation';
import { ContextUploadSection } from './ContextUploadSection';
import type { ContextUploadMode } from './ContextUploadSection';
import { useLabSession } from '@/hooks/useLabSession';
import { usePromptAssembly } from '@/hooks/usePromptAssembly';
import type { ChatMessage, LabId } from '@/lib/types';

interface ScaffoldingPanelProps {
  onSendToAI: (prompt: string) => void;
  isStreaming: boolean;
  chatMessages: ChatMessage[];
}

const requiredUploadLabs: Partial<Record<LabId, { mode: ContextUploadMode; message: string }>> = {
  'assignment-ai-resilience': {
    mode: 'assignment',
    message: 'Upload the existing assignment document before continuing.',
  },
  'curriculum-revision': {
    mode: 'curriculum',
    message: 'Upload the existing curriculum document before continuing.',
  },
};

export function ScaffoldingPanel({ onSendToAI, isStreaming, chatMessages }: ScaffoldingPanelProps) {
  const {
    session,
    labConfig,
    currentIterationConfig,
    currentIterationState,
    totalIterations,
    setAnswer,
    setAssembledPrompt,
    markPromptEdited,
    advancePhase,
    advanceIteration,
    toggleChecklistItem,
    completeLab,
  } = useLabSession();

  const { assembledPrompt } = usePromptAssembly(
    currentIterationConfig?.promptTemplate,
    currentIterationConfig?.scaffoldingQuestions,
    currentIterationState?.answers ?? {}
  );

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      if (!session) return;
      setAnswer(session.currentIteration, questionId, value);
    },
    [session, setAnswer]
  );

  const handlePromptChange = useCallback(
    (prompt: string) => {
      if (!session) return;
      setAssembledPrompt(session.currentIteration, prompt);
      markPromptEdited(session.currentIteration);
    },
    [session, setAssembledPrompt, markPromptEdited]
  );

  const handleSendToAI = useCallback(() => {
    const promptToSend =
      currentIterationState?.promptEdited && currentIterationState.assembledPrompt
        ? currentIterationState.assembledPrompt
        : assembledPrompt;

    // Store the final prompt
    if (session) {
      setAssembledPrompt(session.currentIteration, promptToSend);
    }

    // Advance to generate phase
    advancePhase();

    // Send the prompt
    onSendToAI(promptToSend);
  }, [
    currentIterationState,
    assembledPrompt,
    session,
    setAssembledPrompt,
    advancePhase,
    onSendToAI,
  ]);

  // Auto-advance from Generate to Evaluate when streaming finishes
  const wasStreaming = useRef(false);
  useEffect(() => {
    if (
      currentIterationState?.currentPhase === 'generate' &&
      wasStreaming.current &&
      !isStreaming
    ) {
      advancePhase();
    }
    wasStreaming.current = isStreaming;
  }, [isStreaming, currentIterationState?.currentPhase, advancePhase]);

  if (!session || !labConfig || !currentIterationConfig || !currentIterationState) {
    return null;
  }

  const nextIteration = labConfig.iterations.find(
    (i) => i.iterationNumber === session.currentIteration + 1
  );
  const requiredUpload = requiredUploadLabs[session.labId];
  const requiredUploadMissing = !!requiredUpload && !session.additionalContext;

  return (
    <div className="h-full flex flex-col">
      <div className="pt-6 pb-0 space-y-3">
        <div className="px-6 space-y-3">
          <IterationIndicator
            currentIteration={session.currentIteration}
            totalIterations={totalIterations}
            title={currentIterationConfig.title}
            isOptional={currentIterationConfig.isOptional}
          />
          <PhaseIndicator currentPhase={currentIterationState.currentPhase} />
        </div>
        <ContextUploadSection
          key={session.labId}
          mode={requiredUpload?.mode ?? 'general'}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 animate-fade-in-up" key={`${session.currentIteration}-${currentIterationState.currentPhase}`}>
        {currentIterationState.currentPhase === 'reflect' && (
          <ReflectPhase
            questions={currentIterationConfig.scaffoldingQuestions}
            template={currentIterationConfig.promptTemplate}
            answers={currentIterationState.answers}
            onAnswerChange={handleAnswerChange}
          />
        )}

        {currentIterationState.currentPhase === 'compose' && (
          <ComposePhase
            template={currentIterationConfig.promptTemplate}
            questions={currentIterationConfig.scaffoldingQuestions}
            answers={currentIterationState.answers}
            assembledPrompt={
              currentIterationState.promptEdited
                ? currentIterationState.assembledPrompt
                : assembledPrompt
            }
            onPromptChange={handlePromptChange}
          />
        )}

        {currentIterationState.currentPhase === 'generate' && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-guard-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-guard-blue-500">
                The AI is generating a response...
              </p>
              <p className="text-xs text-guard-blue-400 mt-1">
                Check the chat panel on the right
              </p>
            </div>
          </div>
        )}

        {currentIterationState.currentPhase === 'evaluate' && (
          <EvaluatePhase
            evaluationTools={currentIterationConfig.evaluationTools}
            checklistState={currentIterationState.checklistState}
            onToggleChecklist={(itemId) =>
              toggleChecklistItem(session.currentIteration, itemId)
            }
            iterationNumber={session.currentIteration}
            previousOutput={
              session.currentIteration > 1
                ? chatMessages
                    .filter(
                      (m) =>
                        m.role === 'assistant' &&
                        m.iterationNumber === session.currentIteration - 1 &&
                        !m.isStreaming
                    )
                    .map((m) => m.content)
                    .join('\n')
                : undefined
            }
            currentOutput={
              chatMessages
                .filter(
                  (m) =>
                    m.role === 'assistant' &&
                    m.iterationNumber === session.currentIteration &&
                    !m.isStreaming
                )
                .map((m) => m.content)
                .join('\n')
            }
          />
        )}
      </div>

      <div className="px-6 pb-6">
        <PhaseNavigation
          currentPhase={currentIterationState.currentPhase}
          currentIteration={session.currentIteration}
          totalIterations={totalIterations}
          isOptionalNext={nextIteration?.isOptional ?? false}
          isStreaming={isStreaming}
          reflectBlockedReason={
            requiredUploadMissing ? requiredUpload?.message : undefined
          }
          sendBlockedReason={
            requiredUploadMissing ? requiredUpload?.message : undefined
          }
          onAdvancePhase={advancePhase}
          onSendToAI={handleSendToAI}
          onAdvanceIteration={advanceIteration}
          onCompleteLab={completeLab}
        />
      </div>
    </div>
  );
}
