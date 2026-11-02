import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-guard-border bg-guard-surface p-6',
        hoverable && 'transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
