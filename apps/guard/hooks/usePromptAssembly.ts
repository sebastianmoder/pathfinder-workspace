'use client';

import { useMemo } from 'react';
import type { PromptTemplate, IterationAnswers } from '@/lib/types';
import type { ScaffoldingQuestion } from '@/lib/types';

interface PromptAssemblyResult {
  assembledPrompt: string;
  filledSlots: Set<string>;
  emptySlots: Set<string>;
}

/**
 * Build a mapping from template slot IDs to user answers,
 * using the scaffolding questions to link questionId -> templateSlot.
 */
function buildSlotAnswers(
  questions: ScaffoldingQuestion[],
  answers: IterationAnswers
): Record<string, string> {
  const slotAnswers: Record<string, string> = {};
  for (const q of questions) {
    const answer = answers[q.id] ?? q.defaultValue;
    if (answer && answer.trim()) {
      slotAnswers[q.templateSlot] = answer.trim();
    }
  }
  return slotAnswers;
}

export function usePromptAssembly(
  template: PromptTemplate | undefined,
  questions: ScaffoldingQuestion[] | undefined,
  answers: IterationAnswers
): PromptAssemblyResult {
  return useMemo(() => {
    if (!template || !questions) {
      return {
        assembledPrompt: '',
        filledSlots: new Set<string>(),
        emptySlots: new Set<string>(),
      };
    }

    const slotAnswers = buildSlotAnswers(questions, answers);
    const filledSlots = new Set<string>();
    const emptySlots = new Set<string>();

    for (const slot of template.slots) {
      if (slotAnswers[slot.id]) {
        filledSlots.add(slot.id);
      } else {
        emptySlots.add(slot.id);
      }
    }

    const assembledPrompt = template.templateText.replace(
      /\[([A-Z_]+)\]/g,
      (match, slotId) => {
        if (slotAnswers[slotId]) {
          return slotAnswers[slotId];
        }
        const slot = template.slots.find((s) => s.id === slotId);
        return slot ? `[${slot.defaultText}]` : match;
      }
    );

    return { assembledPrompt, filledSlots, emptySlots };
  }, [template, questions, answers]);
}
