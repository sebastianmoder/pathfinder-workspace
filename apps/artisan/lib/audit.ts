import { inRange } from "./number";
import type { AuditSpec, Claim, ClaimAction, ClaimStatus } from "@/content/types";
import { itemKey } from "./evidence";

export const NO_EVIDENCE = "none";

export type TrustLevel = "rely" | "unsure" | "check";

export interface ClaimAnswer {
  /** A passage id, or NO_EVIDENCE when the learner finds that no source addresses the claim. */
  evidence?: string;
  status?: ClaimStatus;
  action?: ClaimAction;
  /** Written before any feedback, where the audit asks for it. Never graded. */
  reason?: string;
  /** The figure worked out from the passage, as typed. */
  calc?: string;
  /** Entries for the repair's blanks, by blank id. */
  repair?: Record<string, string>;
}

export interface ClaimGrade {
  evidence: boolean;
  status: boolean;
  /** Actions are judgments: a defensible choice is not marked as an error. */
  action: "best" | "defensible" | "weaker";
}

/** A repair is only asked for when the learner decided to change the wording. */
export function needsRepair(claim: Claim, answer: ClaimAnswer | undefined): boolean {
  return !!claim.repair && (answer?.action === "qualify" || answer?.action === "correct");
}

const blanksOf = (claim: Claim) => (claim.repair ?? []).flatMap((part) => (typeof part === "string" ? [] : [part]));

/** Ignores the differences that don't change a figure: case, spacing, thousands commas and symbols. */
const normalize = (value: string) => value.toLowerCase().replace(/[€%,\s]/g, "");

export function isComplete(a: ClaimAnswer | undefined, claim?: Claim): boolean {
  if (!a?.evidence || !a.status || !a.action) return false;
  if (claim?.calculation && !a.calc?.trim()) return false;
  if (claim && needsRepair(claim, a) && blanksOf(claim).some((b) => !a.repair?.[b.id]?.trim())) return false;
  return true;
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

export function gradeCalculation(claim: Claim, answer: ClaimAnswer): boolean {
  if (!claim.calculation) return true;
  return inRange(answer.calc ?? "", claim.calculation);
}

export function gradeRepair(claim: Claim, answer: ClaimAnswer): boolean {
  return blanksOf(claim).every((b) => b.accept.some((a) => normalize(a) === normalize(answer.repair?.[b.id] ?? "")));
}

export function fillRepair(claim: Claim, entries: Record<string, string> | undefined): string {
  return (claim.repair ?? []).map((part) => (typeof part === "string" ? part : (entries?.[part.id] ?? ""))).join("");
}

export type ClaimOutcome = "kept" | "removed" | "repaired" | "repairedWrong" | "flagged";

/** What the learner's own decision does to the claim in their finished briefing. */
export function assembleClaim(claim: Claim, answer: ClaimAnswer | undefined): { text: string | null; outcome: ClaimOutcome } {
  if (answer?.action === "remove") return { text: null, outcome: "removed" };
  if (answer && needsRepair(claim, answer)) {
    return gradeRepair(claim, answer)
      ? { text: claim.finalText, outcome: "repaired" }
      : { text: fillRepair(claim, answer.repair), outcome: "repairedWrong" };
  }
  if (answer?.action === "qualify" || answer?.action === "correct") return { text: claim.text, outcome: "flagged" };
  return { text: claim.text, outcome: "kept" };
}

/** Fictional outcomes that follow from the finished briefing, flawed wording first. */
export function consequences(claims: Claim[], answers: Record<string, ClaimAnswer>): string[] {
  const out: string[] = [];
  for (const c of claims) {
    const answer = answers[c.id];
    const { outcome } = assembleClaim(c, answer);
    const sound = c.status === "supported";
    if (!sound && outcome !== "removed" && outcome !== "repaired" && c.ifKept) out.push(c.ifKept);
  }
  for (const c of claims) {
    const action = answers[c.id]?.action;
    const sound = c.status === "supported";
    const lostSound = sound && action === "remove";
    const lostNeeded = !sound && action === "remove" && c.bestAction !== "remove" && !c.defensibleActions?.includes("remove");
    if ((lostSound || lostNeeded) && c.ifLost) out.push(c.ifLost);
  }
  return out;
}

export interface Calibration {
  relied: number;
  reliedThatFailed: number;
  doubtedThatHeld: number;
}

/** Compares first-read trust with the evidence. Never scored, so there is no reason to misreport it (PRD §9). */
export function calibrate(claims: Claim[], trust: Record<string, TrustLevel>): Calibration {
  const relied = claims.filter((c) => trust[c.id] === "rely");
  return {
    relied: relied.length,
    reliedThatFailed: relied.filter((c) => c.status !== "supported").length,
    doubtedThatHeld: claims.filter((c) => trust[c.id] === "check" && c.status === "supported").length,
  };
}

/** Ledger items an audit can produce. */
export function auditItems(stepId: string, audit: AuditSpec): string[] {
  const spot = audit.support === "independent" ? [...audit.claims, ...(audit.decoys ?? [])].map((x) => itemKey(stepId, "spot", x.id)) : [];
  const claims = audit.claims.flatMap((c) =>
    [
      "evidence",
      "status",
      "action",
      ...(c.calculation ? ["calc"] : []),
      ...(c.repair ? ["repair"] : []),
    ].map((field) => itemKey(stepId, c.id, field)),
  );
  return [...spot, ...claims, ...(audit.decision ? [itemKey(stepId, "decision")] : [])];
}
