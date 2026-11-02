'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  options: [string, string];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Toggle({ options, value, onChange, className }: ToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg bg-guard-blue-50 p-1',
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            value === option
              ? 'bg-guard-surface text-guard-blue-800 shadow-sm'
              : 'text-guard-blue-500 hover:text-guard-blue-700'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
