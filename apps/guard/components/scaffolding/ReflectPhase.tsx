'use client';

import { ScaffoldingQuestion } from './ScaffoldingQuestion';
import { PromptTemplate } from './PromptTemplate';
import { usePromptAssembly } from '@/hooks/usePromptAssembly';
import type {
  ScaffoldingQuestion as QuestionType,
  PromptTemplate as TemplateType,
  IterationAnswers,
} from '@/lib/types';

interface ReflectPhaseProps {
  questions: QuestionType[];
  template: TemplateType;
  answers: IterationAnswers;
  onAnswerChange: (questionId: string, value: string) => void;
}

export function ReflectPhase({
  questions,
  template,
  answers,
  onAnswerChange,
}: ReflectPhaseProps) {
  const { assembledPrompt } = usePromptAssembly(template, questions, answers);

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        {questions.map((question) => (
          <ScaffoldingQuestion
            key={question.id}
            question={question}
            value={answers[question.id] ?? question.defaultValue ?? ''}
            onChange={(value) => onAnswerChange(question.id, value)}
          />
        ))}
      </div>

      <div>
        <h3 className="text-xs font-medium text-guard-blue-500 uppercase tracking-wide mb-3">
          Your prompt is building...
        </h3>
        <PromptTemplate
          template={template}
          questions={questions}
          answers={answers}
          assembledPrompt={assembledPrompt}
        />
      </div>
    </div>
  );
}
