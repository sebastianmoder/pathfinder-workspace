import { PROPOSAL } from "@/content/types";

export interface ArgumentLink {
  cardId: string;
  kind: "supports" | "attacks" | "restsOn";
  targetId: string;
}

export interface KnockOutResult {
  /** Reasons that no longer hold with these cards switched off. */
  fallen: string[];
  /** An assumption the proposal itself needs has been switched off. */
  proposalUndercut: boolean;
  /** Objections still counting against a reason, or against the proposal. */
  liveObjections: string[];
}

/**
 * "Suppose this were false." A reason falls if it is switched off, if an assumption it rests on is off,
 * or if it has evidence and all of that evidence is off. Links come from the learner's own map.
 */
export function knockOut(reasonIds: string[], links: ArgumentLink[], off: string[]): KnockOutResult {
  const isOff = (id: string) => off.includes(id);
  const fallen = reasonIds.filter((reason) => {
    if (isOff(reason)) return true;
    const onReason = links.filter((l) => l.targetId === reason);
    if (onReason.some((l) => l.kind === "restsOn" && isOff(l.cardId))) return true;
    const support = onReason.filter((l) => l.kind === "supports");
    return support.length > 0 && support.every((l) => isOff(l.cardId));
  });
  return {
    fallen,
    proposalUndercut: links.some((l) => l.kind === "restsOn" && l.targetId === PROPOSAL && isOff(l.cardId)),
    liveObjections: links
      .filter((l) => l.kind === "attacks" && !isOff(l.cardId) && !fallen.includes(l.targetId))
      .map((l) => l.cardId),
  };
}
