import type { DebriefSkill, Step } from "@/content/types";
import { auditItems } from "./audit";
import { delegationItems } from "./delegation";
import { composeItems } from "./compose";
import { chartItems } from "./chart";
import { gymItems } from "./gym";
import { casefileItems } from "./casefile";
import { thresholdItems } from "./threshold";
import { workflowItems } from "./workflow";
import { allocationItems } from "./allocation";
import { segmentsOf } from "./mark";

/**
 * What a learner actually did, step by step, for the active visit only (PRD §11).
 * The debrief reads this so that it recognises work that happened (PRD §9) and never gives an overall score.
 */
export interface EvidenceResult {
  right: boolean;
  /** A hint or a worked solution was used. Using help is not a failure (PRD §7, M06), so it is only noted. */
  assisted?: boolean;
  /** The learner chose not to do this. Nothing is inferred about what they know. */
  skipped?: boolean;
  /** Criteria the learner ticked for themselves. Nothing has checked this. */
  selfAssessed?: { met: number; total: number };
}

export interface EvidenceRecord {
  /** Set by the first attempt and never changed, so a retry can't rewrite it. */
  firstTry: boolean;
  right: boolean;
  assisted: boolean;
  skipped: boolean;
  selfAssessed?: { met: number; total: number };
}

export type EvidenceLedger = Record<string, EvidenceRecord>;

export const itemKey = (...parts: string[]) => parts.join("/");

export function mergeEvidence(previous: EvidenceRecord | undefined, next: EvidenceResult): EvidenceRecord {
  return {
    firstTry: previous ? previous.firstTry : next.right,
    right: next.right,
    assisted: (previous?.assisted ?? false) || !!next.assisted,
    skipped: !!next.skipped,
    selfAssessed: next.selfAssessed ?? previous?.selfAssessed,
  };
}

export type SkillAssessment =
  | { status: "shown"; assisted: boolean }
  | { status: "selfAssessed"; met: number; total: number }
  | { status: "review"; reason: "notDone" | "skipped" | "retries" };

/** At least this share of a skill's items must be right first time. */
const SHOWN_SHARE = 0.75;

export function assessSkill(skill: DebriefSkill, ledger: EvidenceLedger): SkillAssessment {
  const records = skill.items.map((id) => ledger[id]);
  if (records.some((r) => !r)) return { status: "review", reason: "notDone" };
  const done = records as EvidenceRecord[];
  if (done.some((r) => r.skipped)) return { status: "review", reason: "skipped" };
  const self = done.filter((r) => r.selfAssessed);
  if (self.length > 0) {
    return {
      status: "selfAssessed",
      met: self.reduce((n, r) => n + r.selfAssessed!.met, 0),
      total: self.reduce((n, r) => n + r.selfAssessed!.total, 0),
    };
  }
  const share = done.filter((r) => r.firstTry).length / done.length;
  if (share < SHOWN_SHARE) return { status: "review", reason: "retries" };
  return { status: "shown", assisted: done.some((r) => r.assisted) };
}

/** Every ledger item a step can produce. Content tests use this to catch a skill pointing at nothing. */
export function evidenceItems(step: Step): string[] {
  switch (step.kind) {
    case "quiz":
    case "revision":
      return [step.id];
    case "openResponse":
      return step.format === "pickImprove" ? [step.id, itemKey(step.id, "pick")] : [step.id];
    case "transfer":
      if ("audit" in step) return auditItems(step.id, step.audit);
      if ("mark" in step) return segmentsOf(step.mark).filter((s) => !s.optional).map((s) => itemKey(step.id, s.id));
      if ("delegation" in step) return delegationItems(step.id, step.delegation);
      if ("compose" in step) return composeItems(step.id, step.compose);
      if ("casefile" in step) return casefileItems(step.id, step.casefile);
      if ("workflow" in step) return workflowItems(step.id, step.workflow);
      if ("allocation" in step) return allocationItems(step.id);
      if ("problems" in step) return gymItems(step.id, step.problems);
      return [step.id];
    case "claimAudit":
      return auditItems(step.id, step.audit);
    case "delegation":
      return delegationItems(step.id, step.delegation);
    case "compose":
      return composeItems(step.id, step.compose);
    case "chartLab":
      return chartItems(step.id, step.chart);
    case "gym":
      return gymItems(step.id, step.problems);
    case "casefile":
      return casefileItems(step.id, step.casefile);
    case "allocation":
      return allocationItems(step.id);
    case "workflow":
      return workflowItems(step.id, step.workflow);
    case "thresholdLab":
      return thresholdItems(step.id, step.lab);
    case "mark":
      return segmentsOf(step.mark).filter((s) => !s.optional).map((s) => itemKey(step.id, s.id));
    case "sort":
      return step.items.map((i) => itemKey(step.id, i.id));
    case "argumentMap":
      return [
        ...step.cards.map((c) => itemKey(step.id, c.id)),
        ...step.links.map((l) => itemKey(step.id, "link", l.cardId)),
      ];
    case "dialogue":
      return [
        ...step.dialogue.discoveries.map((d) => itemKey(step.id, d.id)),
        ...[
          ...new Set(
            step.dialogue.nodes.flatMap((n) => [
              ...n.choices.flatMap((c) => (c.scored ? [c.scored.item] : [])),
              ...(n.cite ? [...n.cite.responses, n.cite.otherwise].flatMap((r) => (r.scored ? [r.scored.item] : [])) : []),
            ]),
          ),
        ].map((item) => itemKey(step.id, item)),
      ];
    case "faultTrace":
      return step.cases.map((c) => itemKey(step.id, c.id));
    case "sandbox":
      return step.tasks.filter((task) => task.evidence).map((task) => itemKey(step.id, task.id));
    default:
      return [];
  }
}
