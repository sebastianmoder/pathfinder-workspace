'use client';

import { Checkbox } from '@/components/ui/Checkbox';
import type { ChecklistItem, ChecklistState } from '@/lib/types';

interface QualityChecklistProps {
  items: ChecklistItem[];
  checklistState: ChecklistState;
  onToggle: (itemId: string) => void;
}

export function QualityChecklist({
  items,
  checklistState,
  onToggle,
}: QualityChecklistProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-guard-blue-500">
        Use this checklist as a guide for thinking about the output. Checking or
        unchecking items is only for your review and will not affect subsequent
        output revisions.
      </p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <Checkbox
            key={item.id}
            id={`checklist-${item.id}`}
            label={item.text}
            checked={!!checklistState[item.id]}
            onChange={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
