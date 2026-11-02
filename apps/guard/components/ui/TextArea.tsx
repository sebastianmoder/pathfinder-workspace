'use client';

import { cn } from '@/lib/utils';
import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-guard-blue-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border border-guard-border bg-guard-surface px-3 py-2',
            'text-sm text-foreground placeholder:text-guard-blue-400',
            'focus:outline-none focus:ring-2 focus:ring-guard-accent focus:border-transparent',
            'resize-y min-h-[80px] transition-colors',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };
