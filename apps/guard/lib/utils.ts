import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Assemble a prompt template by replacing [SLOT_ID] placeholders with answers.
 * Returns the assembled string with unfilled slots left as their default text.
 */
export function assemblePrompt(
  templateText: string,
  answers: Record<string, string>,
  slotDefaults: Record<string, string>
): string {
  return templateText.replace(/\[([A-Z_]+)\]/g, (match, slotId) => {
    const answer = answers[slotId];
    if (answer && answer.trim()) {
      return answer.trim();
    }
    return slotDefaults[slotId] || match;
  });
}

/**
 * Get the set of filled and empty slot IDs given answers and template slots.
 */
export function getSlotStatus(
  slotIds: string[],
  answers: Record<string, string>
): { filled: Set<string>; empty: Set<string> } {
  const filled = new Set<string>();
  const empty = new Set<string>();

  for (const id of slotIds) {
    if (answers[id] && answers[id].trim()) {
      filled.add(id);
    } else {
      empty.add(id);
    }
  }

  return { filled, empty };
}
