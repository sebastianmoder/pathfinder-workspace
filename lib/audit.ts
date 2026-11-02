import type { Claim, ClaimAction, ClaimStatus } from "@/content/types";

export const NO_EVIDENCE = "none";

export interface ClaimAnswer {
  /** A passage id, or NO_EVIDENCE when the learner finds that no source addresses the claim. */
  evidence?: string;
  status?: ClaimStatus;
  action?: ClaimAction;
  /** Written before any feedback, where the audit asks for it. Never graded. */
  reason?: string;
}

export interface ClaimGrade {
  evidence: boolean;
  status: boolean;
  /** Actions are judgments: a defensible choice is not marked as an error. */
  action: "best" | "defensible" | "weaker";
}

export function isComplete(a: ClaimAnswer | undefined): boolean {
  return !!a?.evidence && !!a.status && !!a.action;
}

export function gradeClaim(claim: Claim, answer: ClaimAnswer): ClaimGrade {
  const evidence =
    claim.passageIds.length === 0
      ? answer.evidence === NO_EVIDENCE
      : !!answer.evidence && claim.passageIds.includes(answer.evidence);
  const action =
    answer.action === claim.bestAction
      ? "best"
      : answer.action && claim.defensibleActions?.includes(answer.action)
        ? "defensible"
        : "weaker";
  return { evidence, status: answer.status === claim.status, action };
}
