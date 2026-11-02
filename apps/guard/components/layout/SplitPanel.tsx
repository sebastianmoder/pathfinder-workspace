'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export function SplitPanel({ left, right, className }: SplitPanelProps) {
  const [panel, setPanel] = useState<'scaffolding' | 'chat'>('scaffolding');
  return (
    <div className={cn('flex flex-col h-full min-h-0', className)}>
      <div className="flex shrink-0 gap-2 border-b border-guard-border bg-guard-surface px-4 py-2 lg:hidden" role="group" aria-label="Workspace view">
        <button type="button" aria-pressed={panel === 'scaffolding'} onClick={() => setPanel('scaffolding')} className={cn('flex-1 rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-guard-accent', panel === 'scaffolding' ? 'bg-guard-accent text-white' : 'text-guard-accent')}>Scaffolding</button>
        <button type="button" aria-pressed={panel === 'chat'} onClick={() => setPanel('chat')} className={cn('flex-1 rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-guard-accent', panel === 'chat' ? 'bg-guard-accent text-white' : 'text-guard-accent')}>AI Chat</button>
      </div>
      <div className="flex flex-1 min-h-0 lg:flex-row">
        <div className={cn('h-full w-full lg:w-[45%] lg:border-r border-guard-border overflow-hidden', panel !== 'scaffolding' && 'hidden lg:block')} role="region" aria-label="Scaffolding panel">{left}</div>
        <div className={cn('h-full w-full lg:w-[55%] overflow-hidden', panel !== 'chat' && 'hidden lg:block')} role="region" aria-label="Chat panel">{right}</div>
      </div>
    </div>
  );
}
