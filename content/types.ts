export type MissionId = string;

export interface ContentMeta {
  version: string;
  reviewedOn: string | null; // ISO date; null = draft not yet reviewed
  /** Who reviewed it, so a self-review by the author can't be mistaken for an independent one. */
  reviewedBy?: string;
  sourcesToReview: string[];
}

export interface Choice {
  id: string;
  label: string;
  /** Why this option does or doesn't fit the case. Required for every option. */
  explanation: string;
  /** "correct" and "defensible" are both acceptable; "weaker" prompts a retry. */
  verdict: "correct" | "defensible" | "weaker";
}

export interface Rubric {
  criteria: { id: string; text: string }[];
  /** At least two acceptable example responses. */
  examples: string[];
}

export interface Hint {
  text: string;
}

export type ClaimStatus = "supported" | "unsupported" | "outdated" | "misleading" | "incorrect";
export type ClaimAction = "retain" | "qualify" | "correct" | "remove";

export interface Source {
  id: string;
  title: string;
  /** Who produced it and what kind of document it is. */
  description: string;
  /** Human-readable date, shown so learners can judge currency. */
  date: string;
  passages: { id: string; text: string }[];
}

export interface Claim {
  id: string;
  /** Exact wording as it appears in the briefing, including any citation. */
  text: string;
  status: ClaimStatus;
  /** Passages that are the right evidence. Empty means no source addresses this claim. */
  passageIds: string[];
  /** True when the claim cites a real source that does not support it (PRD M04). */
  citationMismatch?: boolean;
  bestAction: ClaimAction;
  /** Other actions that are defensible judgments rather than errors. */
  defensibleActions?: ClaimAction[];
  evidenceExplanation: string;
  statusExplanation: string;
  actionExplanation: string;
  /** Reviewed wording for the final briefing; null means the claim is removed. */
  finalText: string | null;
  /** Omitted where support has faded, such as transfer tasks. */
  hint?: string;
}

export interface AuditSpec {
  sources: Source[];
  claims: Claim[];
  /** Paragraphs of plain text and references to claims. */
  briefing: (string | { claimId: string })[][];
}

export type DialogueStrategy = "evidence" | "assumption" | "alternative" | "concede" | "restate";

export interface DialogueChoice {
  id: string;
  label: string;
  strategy: DialogueStrategy;
  /** What this move did. Shown after the choice and kept separate from the character's speech. */
  note: string;
  next: string;
}

export interface DialogueNode {
  id: string;
  speakerId: string;
  text: string;
  /** Ids of discoveries the learner gains by reaching this node. */
  reveals?: string[];
  /** Empty means the conversation ends here. */
  choices: DialogueChoice[];
}

export interface DialogueSpec {
  characters: { id: string; name: string; role: string; knows: string; wants: string }[];
  /** Used when the initial judgment does not select an opening. */
  start: string;
  /** Opening node per initial-judgment choice, so a character can oppose the learner's position. */
  starts: Record<string, string>;
  nodes: DialogueNode[];
  discoveries: { id: string; label: string; lookIn: string }[];
}

export type Step =
  | { kind: "brief"; id: string; title: string; body: string }
  | { kind: "refresher"; id: string; title: string; body: string }
  | {
      kind: "initialJudgment";
      id: string;
      prompt: string;
      choices: Choice[];
      hints?: Hint[];
    }
  | { kind: "quiz"; id: string; prompt: string; choices: Choice[]; hints?: Hint[] }
  | { kind: "openResponse"; id: string; prompt: string; rubric: Rubric }
  | {
      kind: "flow";
      id: string;
      title: string;
      /** Step-through diagram; every stage is plain text so no visual is required. */
      stages: { title: string; text: string }[];
    }
  | {
      kind: "toyModel";
      id: string;
      title: string;
      /** Text the toy machine continues. */
      promptText: string;
      /** What the fictional case actually says is true; the toy model never sees this. */
      intendedMeaning: string;
      corpora: { id: string; label: string; description: string; sentences: string[] }[];
      /** Must try at least this many training sets before continuing. */
      minRuns: number;
      takeaway: string;
    }
  | {
      kind: "sort";
      id: string;
      prompt: string;
      hints?: Hint[];
      categories: { id: string; label: string }[];
      items: { id: string; label: string; categoryId: string; explanation: string }[];
    }
  | {
      kind: "revision";
      id: string;
      initialStepId: string;
      prompt: string;
      choices: Choice[];
      /** Ask for confidence again and show it beside the first value. */
      withConfidence?: boolean;
    }
  | { kind: "transfer"; id: string; title: string; prompt: string; choices: Choice[]; hints?: Hint[] }
  | { kind: "transfer"; id: string; title: string; prompt: string; audit: AuditSpec }
  | { kind: "claimAudit"; id: string; title: string; intro: string; audit: AuditSpec }
  | {
      kind: "dialogue";
      id: string;
      title: string;
      intro: string;
      initialStepId: string;
      sources: Source[];
      reflectionPrompt: string;
      dialogue: DialogueSpec;
    }
  | {
      kind: "argumentMap";
      id: string;
      title: string;
      prompt: string;
      proposal: string;
      hints?: Hint[];
      slots: { id: string; label: string; help: string }[];
      cards: { id: string; text: string; slotId: string; defensibleSlotIds?: string[]; explanation: string }[];
    }
  | {
      kind: "debrief";
      id: string;
      takeaway: string;
      skills: string[];
      nextMissionId: MissionId | null;
    };

export type StepKind = Step["kind"];

export interface Mission {
  id: MissionId;
  title: string;
  outcome: string;
  scenario: string;
  approxMinutes: number;
  steps: Step[];
  meta: ContentMeta;
}

export type ModuleStatus = "available" | "planned";

export interface ModuleEntry {
  id: string; // e.g. "M01"
  title: string;
  summary: string;
  stage: 1 | 2 | 3 | 4 | "capstone";
  status: ModuleStatus;
  /** Mission ids that belong to this module (empty while planned). */
  missionIds: MissionId[];
  /** Advisory only; never gates access. */
  recommendedBefore: string[];
}

export interface PasswordEntry {
  code: string;
  missionId: MissionId;
  /** If the mission was replaced, the compatible successor. */
  supersededBy?: MissionId;
}
