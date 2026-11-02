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
  /** Answers to rate against the criteria before writing, compared with a reviewed rating. */
  samples?: { id: string; text: string; met: string[]; note: string }[];
}

/** A stretch of text a learner can mark, checked against the authored answer. */
export interface MarkSegment {
  id: string;
  text: string;
  target: boolean;
  /** Reasonable to mark or to leave, so it is never counted either way. */
  optional?: boolean;
  explanation: string;
}

/** Paragraphs of plain text and markable segments. */
export type MarkParagraph = (string | MarkSegment)[];

export type RepairPart = string | { id: string; accept: string[]; options?: string[] };

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
  /** Wording with blanks for "qualify" and "correct". Filled with the first accepted values, it equals finalText. */
  repair?: RepairPart[];
  /** A figure the learner works out from the passage. */
  calculation?: { prompt: string; min: number; max: number; explanation: string };
  /** Fictional outcome if the flawed wording reaches the reader. */
  ifKept?: string;
  /** Fictional outcome if the reader never sees what this claim should have told them. */
  ifLost?: string;
}

export interface AuditSpec {
  sources: Source[];
  claims: Claim[];
  /** Paragraphs of plain text, references to claims, and sentences that only look like claims. */
  briefing: (string | { claimId: string } | { decoyId: string })[][];
  /** Asks for a written reason before any feedback, so the explanation can't just repeat the feedback. */
  reasonPrompt?: string;
  /**
   * "independent": the learner finds the claims, status definitions are on request,
   * and feedback waits until the whole audit is submitted. Defaults to "guided".
   */
  support?: "guided" | "independent";
  /** Sentences for the learner to tell apart from claims when finding them. */
  decoys?: { id: string; text: string; explanation: string }[];
  /** Record trust in each claim before any source opens, and compare it with the evidence afterwards. */
  trustFirst?: boolean;
  /** A decision made with the learner's own finished briefing. */
  decision?: { prompt: string; choices: Choice[] };
}

export type EvidenceKind = "knowledge" | "action" | "reasoning" | "transfer";

/** A skill the debrief can recognise, tied to the work that would show it (PRD §9, §12). */
export interface DebriefSkill {
  id: string;
  label: string;
  kind: EvidenceKind;
  /** Ledger items that show this skill. See `evidenceItems` in lib/evidence.ts. */
  items: string[];
  /** A fresh example, offered when this skill is worth another look. */
  practice?: { prompt: string; choices: Choice[] };
}

export interface SandboxSentence {
  id: string;
  text: string;
  group: string;
}

/** Every field that is present must hold for the task's goal to be met. */
export interface SandboxGoal {
  word?: string;
  /** Sentences that must be in the data the machine was trained on. */
  include?: string[];
  afterSaying?: boolean;
}

export interface SandboxTask {
  id: string;
  title: string;
  instruction: string;
  /** Applied when the task opens. Resets the board so that each task starts from a known state. */
  setup?: { on?: string[]; train?: boolean; reveal?: string[] };
  /** A line the learner can say to the trained machine. Asking waits until it has been said. */
  say?: string;
  /** What is true in the fictional case during this task. The machine never sees it. */
  truth: { word: string; text: string };
  goal: SandboxGoal;
  success: string;
  /** A board that meets the goal, offered as "Show me a way" so nobody gets stuck. */
  solution?: string[];
  /** What the ledger records: solving on the first ask, or predicting the first answer correctly. */
  evidence?: "firstAsk" | "prediction";
  showCount?: boolean;
}

export type DialogueStrategy = "evidence" | "assumption" | "alternative" | "concede" | "restate";

export interface DialogueChoice {
  id: string;
  label: string;
  strategy: DialogueStrategy;
  /** What this move did. Shown after the choice and kept separate from the character's speech. */
  note: string;
  next: string;
  /** Recorded for the debrief when the conversation finishes. */
  scored?: { item: string; right: boolean };
  /** Set when the move was showing a passage, which takes the place of a label. */
  citedPassage?: string;
}

/** A reply the learner makes by showing a passage from the source pack. */
export interface DialogueCite {
  responses: { passageIds: string[]; note: string; next: string; scored?: DialogueChoice["scored"] }[];
  /** Used for any other passage. */
  otherwise: { note: string; next: string; scored?: DialogueChoice["scored"] };
}

export interface DialogueNode {
  id: string;
  speakerId: string;
  text: string;
  /** Ids of discoveries the learner gains by reaching this node. */
  reveals?: string[];
  /** Empty means the conversation ends here. */
  choices: DialogueChoice[];
  cite?: DialogueCite;
}

export interface DialogueSpec {
  characters: { id: string; name: string; role: string; knows: string; wants: string }[];
  /** Used when the initial judgment does not select an opening. */
  start: string;
  /** Opening node per initial-judgment choice, so a character can oppose the learner's position. */
  starts: Record<string, string>;
  nodes: DialogueNode[];
  discoveries: { id: string; label: string; lookIn: string }[];
  /** Questions available before the meeting. When they run out, moveOn is the only move left. */
  budget?: { questions: number; moveOn: DialogueChoice };
  /** Asked at the end. What the learner can answer depends on what they uncovered. */
  boardQuestions?: { question: string; discoveryId: string; ifFound: string; ifMissed: string }[];
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
  | {
      kind: "openResponse";
      id: string;
      prompt: string;
      rubric: Rubric;
      /** Shows the reason the learner wrote in an earlier audit, before that audit's feedback. */
      priorReason?: { stepId: string; claimId: string };
    }
  | {
      kind: "sandbox";
      id: string;
      title: string;
      intro: string;
      /** Text the toy machine continues. */
      promptText: string;
      /** How a word appears as an assistant reply, with {word} for the machine's answer. */
      replyTemplate: string;
      /** Words offered as predictions. */
      words: string[];
      /** The pipeline, lit up as the learner reaches each stage. Plain text, so no visual is required. */
      stages: { id: "data" | "training" | "model" | "input" | "output"; title: string; text: string }[];
      groups: { id: string; label: string }[];
      sentences: SandboxSentence[];
      tasks: SandboxTask[];
    }
  | {
      kind: "faultTrace";
      id: string;
      title: string;
      prompt: string;
      stages: { id: string; label: string; help: string }[];
      cases: { id: string; text: string; stageId: string; explanation: string }[];
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
  | { kind: "transfer"; id: string; title: string; prompt: string; mark: MarkParagraph[] }
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
      /** Where the learner's position and the conversation's outcome come from. */
      initialStepId: string;
      dialogueStepId: string;
      slots: { id: string; label: string; help: string }[];
      cards: {
        id: string;
        text: string;
        slotId: string;
        defensibleSlotIds?: string[];
        explanation: string;
        /** The discovery this card records, marked when the learner uncovered it. */
        discovery?: string;
      }[];
      /** What each card bears on. A target is a card id or PROPOSAL. */
      links: {
        cardId: string;
        kind: "supports" | "attacks" | "restsOn";
        targetId: string;
        defensibleTargetIds?: string[];
        explanation: string;
      }[];
    }
  | {
      kind: "debrief";
      id: string;
      takeaway: string;
      skills: DebriefSkill[];
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

/** Target id for a link that bears on the proposal as a whole. */
export const PROPOSAL = "proposal";
