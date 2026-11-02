'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
}

export function Accordion({ items, defaultOpen, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className={cn('divide-y divide-guard-border', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between py-3 text-left text-sm font-medium text-guard-blue-800 hover:text-guard-blue-900 transition-colors"
              aria-expanded={isOpen}
            >
              {item.title}
              <svg
                className={cn(
                  'w-4 h-4 text-guard-blue-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="pb-4 text-sm text-guard-blue-600">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
