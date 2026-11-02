'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PromptSlotProps {
  label: string;
  value: string | null;
  defaultText: string;
}

export function PromptSlot({ label, value, defaultText }: PromptSlotProps) {
  const isFilled = value !== null && value.trim() !== '';
  const wasFilledRef = useRef(isFilled);
  const [justFilled, setJustFilled] = useState(false);

  useEffect(() => {
    const wasFilled = wasFilledRef.current;
    wasFilledRef.current = isFilled;

    if (!isFilled || wasFilled) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      setJustFilled(true);
      timeout = setTimeout(() => setJustFilled(false), 600);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isFilled]);

  return (
    <span
      className={cn(
        'inline rounded px-1 py-0.5 transition-colors duration-300',
        isFilled
          ? 'bg-guard-slot-filled text-guard-blue-800'
          : 'bg-guard-slot-empty text-guard-blue-400 italic',
        justFilled && 'animate-slot-fill'
      )}
      title={label}
    >
      {isFilled ? value : `[${defaultText}]`}
    </span>
  );
}
