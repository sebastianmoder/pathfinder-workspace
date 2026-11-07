import type { RankSpec } from "@/content/types";
import { itemKey } from "./evidence";
import { seededShuffle } from "./shuffle";

export interface RankVerdict {
  first: boolean;
  /** Null when the bottom isn't judged. */
  last: boolean | null;
}

export function rankVerdict(spec: RankSpec, order: string[]): RankVerdict {
  return {
    first: spec.first.includes(order[0]),
    last: spec.last ? spec.last.includes(order[order.length - 1]) : null,
  };
}

export const rankSound = (v: RankVerdict) => v.first && v.last !== false;

/** Moves one card to a new position, shifting the others. */
export function moveTo(order: string[], id: string, index: number): string[] {
  const rest = order.filter((x) => x !== id);
  const at = Math.max(0, Math.min(index, rest.length));
  return [...rest.slice(0, at), id, ...rest.slice(at)];
}

/** A shuffled starting order that never already has a sound card at the top, so the first look takes thought. */
export function startingOrder(spec: RankSpec, seed: number, salt: string): string[] {
  const order = seededShuffle(spec.items.map((i) => i.id), seed, salt);
  const firstSound = order.findIndex((id) => !spec.first.includes(id));
  return firstSound > 0 ? [...order.slice(firstSound), ...order.slice(0, firstSound)] : order;
}

export function rankItems(stepId: string, spec: RankSpec) {
  return spec.last ? [itemKey(stepId, "first"), itemKey(stepId, "last")] : [itemKey(stepId, "first")];
}
