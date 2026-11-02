'use client';

import { PromptTemplate } from './PromptTemplate';
import type {
  ScaffoldingQuestion,
  PromptTemplate as TemplateType,
  IterationAnswers,
} from '@/lib/types';

interface ComposePhaseProps {
  template: TemplateType;
  questions: ScaffoldingQuestion[];
  answers: IterationAnswers;
  assembledPrompt: string;
  onPromptChange: (prompt: string) => void;
}

export function ComposePhase({
  template,
  questions,
  answers,
  assembledPrompt,
  onPromptChange,
}: ComposePhaseProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-guard-blue-800 mb-1">
          Review Your Prompt
        </h3>
        <p className="text-xs text-guard-blue-500">
          Review the assembled prompt below. You can edit it directly or switch
          to raw view for full control. When you&apos;re ready, send it to the AI.
        </p>
      </div>

      <PromptTemplate
        template={template}
        questions={questions}
        answers={answers}
        assembledPrompt={assembledPrompt}
        editable
        onPromptChange={onPromptChange}
      />
    </div>
  );
}
