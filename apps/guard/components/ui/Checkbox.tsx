'use client';

import { cn } from '@/lib/utils';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ id, label, checked, onChange, className }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-start gap-3 cursor-pointer group',
        className
      )}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={cn(
            'w-5 h-5 rounded border-2 transition-colors flex items-center justify-center',
            checked
              ? 'bg-guard-accent border-guard-accent'
              : 'border-guard-blue-300 group-hover:border-guard-blue-400'
          )}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span
        className={cn(
          'text-sm leading-relaxed transition-colors',
          checked ? 'text-guard-blue-500 line-through' : 'text-guard-blue-800'
        )}
      >
        {label}
      </span>
    </label>
  );
}
