'use client';

import { useMemo } from 'react';
import { diffWords } from 'diff';
import { cn } from '@/lib/utils';

interface SideBySideComparisonProps {
  previousOutput: string;
  currentOutput: string;
  previousLabel: string;
  currentLabel: string;
}

export function SideBySideComparison({
  previousOutput,
  currentOutput,
  previousLabel,
  currentLabel,
}: SideBySideComparisonProps) {
  const diffResult = useMemo(
    () => diffWords(previousOutput, currentOutput),
    [previousOutput, currentOutput]
  );

  if (!previousOutput || !currentOutput) {
    return (
      <p className="text-sm text-guard-blue-400 italic">
        Side-by-side comparison will appear once you complete a second iteration.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-guard-blue-500">
        Changes between iterations are highlighted below. Green text was added, red text was removed.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h4 className="text-xs font-medium text-guard-blue-500 mb-2 uppercase tracking-wide">
            {previousLabel}
          </h4>
          <div className="rounded-lg border border-guard-border p-3 text-sm leading-relaxed bg-guard-surface max-h-64 overflow-y-auto">
            {diffResult.map((part, i) => {
              if (part.added) return null;
              return (
                <span
                  key={i}
                  className={cn(
                    part.removed && 'bg-red-100 text-red-700 line-through'
                  )}
                >
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-guard-blue-500 mb-2 uppercase tracking-wide">
            {currentLabel}
          </h4>
          <div className="rounded-lg border border-guard-border p-3 text-sm leading-relaxed bg-guard-surface max-h-64 overflow-y-auto">
            {diffResult.map((part, i) => {
              if (part.removed) return null;
              return (
                <span
                  key={i}
                  className={cn(
                    part.added && 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
