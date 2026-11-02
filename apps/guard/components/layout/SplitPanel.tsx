'use client';

import { cn } from '@/lib/utils';

interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export function SplitPanel({ left, right, className }: SplitPanelProps) {
  return (
    <div className={cn('flex flex-col lg:flex-row h-full', className)}>
      <div className="h-1/2 lg:h-full lg:w-[45%] border-b lg:border-b-0 lg:border-r border-guard-border overflow-hidden" role="region" aria-label="Scaffolding panel">
        {left}
      </div>
      <div className="h-1/2 lg:h-full lg:w-[55%] overflow-hidden" role="region" aria-label="Chat panel">
        {right}
      </div>
    </div>
  );
}
