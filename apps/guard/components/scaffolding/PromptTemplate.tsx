'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/Toggle';
import { PromptSlot } from './PromptSlot';
import type { PromptTemplate as PromptTemplateType, ScaffoldingQuestion, IterationAnswers } from '@/lib/types';

interface PromptTemplateProps {
  template: PromptTemplateType;
  questions: ScaffoldingQuestion[];
  answers: IterationAnswers;
  assembledPrompt: string;
  editable?: boolean;
  onPromptChange?: (prompt: string) => void;
  className?: string;
}

type ViewMode = 'Structured' | 'Raw';

export function PromptTemplate({
  template,
  questions,
  answers,
  assembledPrompt,
  editable = false,
  onPromptChange,
  className,
}: PromptTemplateProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Structured');

  // Build a mapping from slot ID to answer value
  const slotValues = useMemo(() => {
    const values: Record<string, string | null> = {};
    for (const slot of template.slots) {
      const question = questions.find((q) => q.templateSlot === slot.id);
      const answer = question ? answers[question.id] ?? question.defaultValue : undefined;
      values[slot.id] = answer && answer.trim() ? answer.trim() : null;
    }
    return values;
  }, [template.slots, questions, answers]);

  // Parse template text into segments of plain text and slots
  const segments = useMemo(() => {
    const parts: Array<{ type: 'text'; value: string } | { type: 'slot'; slotId: string }> = [];
    const regex = /\[([A-Z_]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(template.templateText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: template.templateText.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'slot', slotId: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < template.templateText.length) {
      parts.push({ type: 'text', value: template.templateText.slice(lastIndex) });
    }

    return parts;
  }, [template.templateText]);

  const handleRawChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onPromptChange?.(e.target.value);
    },
    [onPromptChange]
  );

  return (
    <div className={cn('rounded-lg border border-guard-border bg-guard-surface-elevated', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-guard-border">
        <span className="text-xs font-medium text-guard-blue-500 uppercase tracking-wide">
          Prompt Preview
        </span>
        {editable && (
          <Toggle
            options={['Structured', 'Raw']}
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
          />
        )}
      </div>
      <div className="p-4">
        {viewMode === 'Structured' ? (
          <div className="text-sm leading-relaxed text-guard-blue-700 whitespace-pre-wrap">
            {segments.map((seg, i) => {
              if (seg.type === 'text') {
                return <span key={i}>{seg.value}</span>;
              }
              const slot = template.slots.find((s) => s.id === seg.slotId);
              if (!slot) return <span key={i}>[{seg.slotId}]</span>;
              return (
                <PromptSlot
                  key={i}
                  label={slot.label}
                  value={slotValues[seg.slotId]}
                  defaultText={slot.defaultText}
                />
              );
            })}
          </div>
        ) : (
          <textarea
            value={assembledPrompt}
            onChange={handleRawChange}
            className="w-full min-h-[200px] text-sm leading-relaxed text-guard-blue-700 bg-transparent resize-y focus:outline-none"
            readOnly={!editable}
          />
        )}
      </div>
    </div>
  );
}
