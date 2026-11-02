'use client';

import { cn } from '@/lib/utils';
import { PHASES, PHASE_LABELS } from '@/lib/constants';
import type { Phase } from '@/lib/types';

interface PhaseIndicatorProps {
  currentPhase: Phase;
  className?: string;
}

export function PhaseIndicator({ currentPhase, className }: PhaseIndicatorProps) {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className={cn('flex items-center gap-1', className)} role="navigation" aria-label="Lab phases">
      {PHASES.map((phase, index) => {
        const isComplete = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={phase} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  isComplete && 'bg-guard-phase-complete',
                  isActive && 'bg-guard-phase-active',
                  isPending && 'bg-guard-phase-pending'
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  isComplete && 'text-guard-success',
                  isActive && 'text-guard-accent',
                  isPending && 'text-guard-blue-400'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {PHASE_LABELS[phase]}
                {isComplete && <span className="sr-only"> (complete)</span>}
                {isActive && <span className="sr-only"> (current)</span>}
              </span>
            </div>
            {index < PHASES.length - 1 && (
              <div
                className={cn(
                  'w-6 h-px mx-1.5',
                  index < currentIndex
                    ? 'bg-guard-phase-complete'
                    : 'bg-guard-phase-pending'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
