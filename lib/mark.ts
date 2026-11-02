import type { MarkParagraph, MarkSegment } from "@/content/types";

export const segmentsOf = (paragraphs: MarkParagraph[]): MarkSegment[] =>
  paragraphs.flatMap((p) => p.filter((part): part is MarkSegment => typeof part !== "string"));

export interface MarkResult {
  found: number;
  targets: number;
  extra: number;
  right: boolean;
}

/** Optional segments never count, because either choice is reasonable. */
export function gradeMarks(segments: MarkSegment[], marked: string[]): MarkResult {
  const counted = segments.filter((s) => !s.optional);
  const targets = counted.filter((s) => s.target);
  const found = targets.filter((s) => marked.includes(s.id)).length;
  const extra = counted.filter((s) => !s.target && marked.includes(s.id)).length;
  return { found, targets: targets.length, extra, right: found === targets.length && extra === 0 };
}

export const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
