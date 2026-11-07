import type { MatchSpec } from "@/content/types";
import { itemKey } from "./evidence";

export type Pairs = Record<string, string>;

/** Pairs a left card with a right one, unpinning whatever either was pinned to: pairs are one to one. */
export function pair(pairs: Pairs, leftId: string, rightId: string): Pairs {
  const next: Pairs = {};
  for (const [l, r] of Object.entries(pairs)) if (l !== leftId && r !== rightId) next[l] = r;
  next[leftId] = rightId;
  return next;
}

export function unpair(pairs: Pairs, leftId: string): Pairs {
  const next = { ...pairs };
  delete next[leftId];
  return next;
}

export function matchResults(spec: MatchSpec, pairs: Pairs): Record<string, boolean> {
  return Object.fromEntries(spec.left.map((l) => [l.id, pairs[l.id] === l.matchId]));
}

/** After a check, wrong pairs come loose so they can be tried again; right ones stay pinned. */
export function keepRight(spec: MatchSpec, pairs: Pairs): Pairs {
  const results = matchResults(spec, pairs);
  return Object.fromEntries(Object.entries(pairs).filter(([l]) => results[l]));
}

export function matchItems(stepId: string, spec: MatchSpec) {
  return spec.left.map((l) => itemKey(stepId, l.id));
}
