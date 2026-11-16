'use client';

import { useEffect, useState } from 'react';
import type { GenerationPhase } from '@/lib/types';

const PHASE_LABELS: Record<Exclude<GenerationPhase, 'writing'>, string> = {
  waiting: 'Waiting for the model…',
  reasoning: 'The model is reasoning before it answers…',
};

interface StreamingIndicatorProps {
  phase?: GenerationPhase;
  startedAt: number;
}

export function StreamingIndicator({ phase, startedAt }: StreamingIndicatorProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const label = PHASE_LABELS[phase === 'reasoning' ? 'reasoning' : 'waiting'];
  const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1_000));

  return (
    <div className="flex items-center gap-2 text-xs text-guard-blue-500" role="status">
      <div className="flex gap-1" aria-hidden="true">
        <div className="w-1.5 h-1.5 rounded-full bg-guard-blue-300 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-guard-blue-300 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-guard-blue-300 animate-bounce" />
      </div>
      <span>{label}</span>
      {elapsedSeconds >= 3 && (
        <span className="tabular-nums text-guard-blue-400" aria-hidden="true">
          {elapsedSeconds}s
        </span>
      )}
    </div>
  );
}
