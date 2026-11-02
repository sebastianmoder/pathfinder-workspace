'use client';

import { cn } from '@/lib/utils';
import { TextArea } from '@/components/ui/TextArea';
import type { ScaffoldingQuestion as QuestionType } from '@/lib/types';

interface ScaffoldingQuestionProps {
  question: QuestionType;
  value: string;
  onChange: (value: string) => void;
}

export function ScaffoldingQuestion({
  question,
  value,
  onChange,
}: ScaffoldingQuestionProps) {
  const inputId = `question-${question.id}`;
  const renderInput = () => {
    if (question.inputType === 'select') {
      return (
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-guard-border bg-guard-surface px-3 py-2',
            'text-sm text-foreground focus:outline-none focus:ring-2',
            'focus:ring-guard-accent focus:border-transparent transition-colors'
          )}
        >
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <TextArea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        className={cn(
          'min-h-[60px]',
          question.inputType === 'text' && 'min-h-[40px] resize-none'
        )}
      />
    );
  };

  return (
    <div className="group">
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-guard-blue-50 flex items-center justify-center mt-0.5">
          <span className="w-2 h-2 rounded-full bg-guard-blue-400" />
        </div>
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-guard-blue-800 leading-relaxed"
        >
          {question.question}
        </label>
      </div>
      <div className="ml-9">{renderInput()}</div>
    </div>
  );
}
