export type MissionId = string;

export interface ContentMeta {
  version: string;
  reviewedOn: string | null; // ISO date; null = draft not yet reviewed
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
  | { kind: "revision"; id: string; initialStepId: string; prompt: string; choices: Choice[] }
  | { kind: "transfer"; id: string; title: string; prompt: string; choices: Choice[]; hints?: Hint[] }
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
