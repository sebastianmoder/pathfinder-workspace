export type MissionId = string;

/** Drawings that stand in for photos and images in a case. Each is labelled as a drawing wherever it appears. */
export type SceneId = "flood" | "library" | "readingParty" | "meadow" | "famousLibrary" | "groupParty" | "heart" | "thankYou";

/**
 * Something from the case, shown as what it is (a chat, an email, a post) rather than as a paragraph about it.
 * Every frame is labelled as fictional, and everything in it is real text, so nothing depends on seeing it.
 */
export type Artefact =
  | { kind: "chat"; messages: { from: string; text: string; /** A message the AI tool wrote, quoted in the chat. */ ai?: boolean }[] }
  | { kind: "email"; from: string; to: string; subject: string; body: string[] }
  | { kind: "post"; account: string; posted: string; text: string; scene?: SceneId; /** What the drawing shows. */ alt?: string; reach?: string }
  | { kind: "article"; outlet: string; date: string; headline: string; scene?: SceneId; alt?: string; caption?: string }
  | { kind: "slide"; title: string; body: string[]; number?: number }
  | { kind: "worksheet"; title: string; owner: string; lines: { question: string; answer: string; mark?: "right" | "wrong"; note?: string }[]; teacherNote?: string }
  | { kind: "document"; title: string; meta?: string; body: string[] }
  | { kind: "photo"; scene: SceneId; alt: string; caption: string };

/** The frame around text a learner marks or redacts, so it reads as the email or document it is. */
export type MarkFrame = { kind: "email"; from: string; to: string; subject: string } | { kind: "document"; title: string; meta?: string };

/** The frame around a compose workspace's output. Poster and card parts are placed by element id. */
export type ComposeFrame =
  | { kind: "email"; from: string; to: string }
  | { kind: "notice" }
  | { kind: "poster"; headline: string; image?: string; footer?: string }
  | { kind: "card"; image?: string; footer?: string };

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

/** The first five suit arguing a position (M05); the last four suit teaching someone (M06). */
export type DialogueStrategy =
  | "evidence"
  | "assumption"
  | "alternative"
  | "concede"
  | "restate"
  | "question"
  | "example"
  | "explain"
  | "tell";

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

/** How much of a task is handed to AI (PRD M02). Labels live in the interface wording so every module uses the same ones. */
export type DelegationRole = "human" | "assisted" | "automated";
export const DELEGATION_ROLES: readonly DelegationRole[] = ["human", "assisted", "automated"];

export interface DelegationOutcome {
  /** "weaker" choices are reviewed as such; "defensible" ones work, at a cost the explanation names. */
  verdict: Choice["verdict"];
  /** What happened later in the fictional case, written in advance. Shown before the verdict. */
  event: string;
  explanation: string;
}

export interface DelegationTask {
  id: string;
  /** Who asked, as it appears in the inbox. */
  from: string;
  title: string;
  /** The request in the sender's words. Everything needed to judge it is here. */
  text: string;
  /** The trade-offs in words, before any numbers (PRD M02). Left out where support has faded. */
  factors?: { stakes: string; evidence: string; sensitivity: string; reversibility: string };
  hint?: string;
  /** Who answers for the result, whatever role AI is given. */
  responsible: string;
  /** One outcome per role, and exactly one of them "correct". */
  outcomes: Record<DelegationRole, DelegationOutcome>;
}

/** A batch of requests sent together, so what happened to one batch is known before the next (PRD M02). */
export interface DelegationWave {
  taskIds: string[];
  /** Heading for this wave's outcome panel. */
  later: string;
  /** Shown above the wave's inbox when an earlier choice set this up: the consequences of earlier choices. */
  carry?: { taskId: string; roles: DelegationRole[]; note: string }[];
}

export interface DelegationSpec {
  /** Heading for the outcome panel, such as "Three weeks later". */
  later: string;
  tasks: DelegationTask[];
  /** Send in batches. Without waves, every task is sent at once. */
  waves?: DelegationWave[];
  /** "independent": no trade-offs or hints are offered. Defaults to "guided". */
  support?: "guided" | "independent";
}

/** Who wrote a piece of a draft, for the contribution record (PRD M11). */
export type Contributor = "you" | "ai" | "both" | "supplied";

export interface ComposeOption {
  id: string;
  /** What the learner sees in the workspace, such as a line of the brief or a candidate headline. */
  label: string;
  /** The part of the authored output this option produces. Empty adds nothing. */
  output: string;
  by?: Contributor;
  /** A drawing shown for this option in a framed output, such as an image on a poster. */
  scene?: SceneId;
}

export interface ComposeElement {
  id: string;
  label: string;
  help: string;
  options: ComposeOption[];
}

export interface ComposeCriterion {
  id: string;
  text: string;
  /** Met when each listed element holds one of the listed options. */
  requires?: Record<string, string[]>;
  /** Met when any one of these combinations holds, for rules that depend on another choice. */
  anyOf?: Record<string, string[]>[];
}

export interface ComposeRound {
  id: string;
  title: string;
  instruction: string;
  /** A change of requirements, shown when the round opens (PRD M11). */
  event?: string;
  criteria: ComposeCriterion[];
  /** A workspace that meets every criterion, offered as "Show me a way" so nobody gets stuck. */
  solution: Record<string, string>;
  success: string;
}

/**
 * A workspace whose output is assembled from authored parts (PRD M03, M11). Every combination is
 * deterministic, so feedback can be reviewed, and the page labels the outputs as written in advance.
 */
export interface ComposeSpec {
  workspaceLabel: string;
  outputLabel: string;
  /** Show the output as the thing it is: an email, a notice, a poster or a card. */
  frame?: ComposeFrame;
  elements: ComposeElement[];
  /** Order in which elements' outputs are joined. Defaults to element order. */
  outputOrder?: string[];
  start: Record<string, string>;
  rounds: ComposeRound[];
  /** Allow one change per run, so each comparison isolates a single cause (PRD M03). */
  oneAtATime?: boolean;
  /** Show who wrote each part of the current version (PRD M11). */
  record?: boolean;
  support?: "guided" | "independent";
}

export interface ChartView {
  measure: string;
  baseline: string;
  range: string;
  /** The value of the spec's adjustable quantity, where it has one. */
  adjust?: number;
}

/**
 * Linked chart and table with adjustable views (PRD M07). Values are computed from authored quantities,
 * so every view is reproducible and the table always shows the numbers behind the bars.
 */
export interface ChartLabSpec {
  /** What the AI-generated material claims, shown above the chart for comparison. */
  claim: string;
  /** The slide the claim is on, shown as a slide. */
  slide?: { title: string; number?: number };
  categoryLabel: string;
  categories: { id: string; label: string }[];
  quantities: { id: string; label: string; values: Record<string, number> }[];
  /** A count is a numerator alone; a rate divides by a denominator and multiplies by `per`. */
  measures: { id: string; label: string; numerator: string; denominator?: string; per?: number; unit: string }[];
  baselines: { id: string; label: string; min: number }[];
  ranges: { id: string; label: string; categoryIds: string[] }[];
  /**
   * One authored figure the learner can move across its plausible range, to see whether a conclusion survives
   * a change in the data (PRD M07). Shown from the first task that asks for it.
   */
  adjustable?: { quantity: string; category: string; label: string; note: string; min: number; max: number; step: number };
  start: ChartView;
  tasks: {
    id: string;
    title: string;
    instruction: string;
    /** `topIsNot`: met when some other category has a higher value than this one. */
    goal: Partial<ChartView> & { topIsNot?: string };
    /** Show the adjustable figure from this task on. */
    adjust?: boolean;
    solution: ChartView;
    success: string;
    /** Recorded for the debrief unless false. */
    evidence?: boolean;
  }[];
}

/** A kind of help, described by what it does for the learner, not only what it is called (PRD M06). */
export interface GymHelp {
  id: string;
  label: string;
  /** What support this gives, and what it leaves for the learner to do. */
  provides: string;
  content: string;
  /** Reveals the answer outright, so solving afterwards is not credited as solving. */
  givesAnswer?: boolean;
}

/** A worked-out answer, typed rather than picked, so it can't be reached by ruling options out (PRD M06). */
export interface NumericAnswer {
  label: string;
  /** Written before the input, such as "€". */
  prefix?: string;
  /** Written after the input, such as "km/h". */
  unit?: string;
  min: number;
  max: number;
  explanation: string;
}

export interface GymProblem {
  id: string;
  title: string;
  text: string;
  /** Either options to choose from, or a number to work out. */
  choices?: Choice[];
  numeric?: NumericAnswer;
  /** Empty means unaided: a transfer offers no help. */
  helps: GymHelp[];
}

/**
 * "redact" turns marking into removing (PRD M10): marked passages are shown as removed, and the check
 * shows what each party would receive.
 */
export interface MarkOptions {
  mode?: "find" | "redact";
  frame?: MarkFrame;
  /** Who receives the text once it leaves you, in order. The first receives the redacted text. */
  flow?: { label: string; note: string }[];
}

export type CaseStatus = "known" | "uncertain" | "contradicted";

export interface CaseLead {
  id: string;
  label: string;
  /** How long following it takes, against the casefile's clock. */
  minutes?: number;
  kind: "record" | "interview" | "check";
  /** Who or what this is, so the learner can judge it before following it. */
  description: string;
  finding: string;
  /** A dated entry added to the timeline when this lead is followed. Ordered by `order`. */
  timeline?: { order: number; when: string; text: string };
  /** What following the lead turns up, shown beside the case's own artefact to compare. */
  artefact?: Artefact;
  /** Who this lead shows gaining or paying, added to the stakeholder map once it is followed (PRD M13). */
  voice?: { who: string; side: "gains" | "pays" | "unclear"; text: string };
  /** A message from someone in the case, such as an editor pressing for a decision. */
  pressure?: string;
}

export interface CaseStatement {
  id: string;
  text: string;
  /** What the full evidence shows. */
  status: CaseStatus;
  /** Leads that settle it. Empty means the material in front of the learner already does. */
  leadIds: string[];
  explanation: string;
}

/**
 * An investigation with limited time (PRD M08, M13). Statements are judged against what this learner
 * found: a statement whose settling lead wasn't followed is honestly "still uncertain".
 */
export interface CasefileSpec {
  artifact: { label: string; title: string; body: string; meta: string };
  /** The artifact shown as what it is. The text version above is then left out. */
  artefact?: Artefact;
  budget?: { leads: number; note: string };
  /**
   * Time instead of a lead count: each lead costs its minutes between the start and the deadline, and
   * messages arrive as time passes (PRD M08, pressure from an editor).
   */
  clock?: { start: string; deadline: string; note: string; pressures?: { after: number; text: string }[] };
  leads: CaseLead[];
  timeline?: { order: number; when: string; text: string }[];
  statements: CaseStatement[];
  /** Leads the debrief looks at: following them is recorded. */
  keyLeads?: string[];
}

export interface ThresholdView {
  version: string;
  threshold: number;
}

/**
 * A screening score, an adjustable threshold and outcomes by group (PRD M09). Each applicant has a known
 * outcome, so every error is countable, and the page shows the numbers as a table as well as a plot.
 */
export interface ThresholdLabSpec {
  scoreLabel: string;
  /** What "qualified" means in this case, so the label itself can be questioned. */
  qualifiedLabel: string;
  groups: { id: string; label: string }[];
  versions: { id: string; label: string; note: string }[];
  applicants: { id: string; group: string; qualified: boolean; scores: Record<string, number> }[];
  /** How many can be selected, which every task must respect. */
  capacity: { label: string; min: number; max: number };
  range: { min: number; max: number };
  start: ThresholdView;
  stakeholders: { id: string; name: string; role: string; says: string }[];
  /**
   * A test the learner runs on the score itself: pairs who did equally well in the trial, one from each group.
   * The version it names stays locked until the test has been run, so the fix is found, not handed over.
   */
  check?: { label: string; intro: string; pairs: [string, string][]; finding: string; unlocks: string };
  tasks: {
    id: string;
    title: string;
    instruction: string;
    /** Beyond capacity: the largest allowed difference between groups in qualified applicants rejected. */
    goal: { maxMissedGap?: number };
    solution: ThresholdView;
    success: string;
  }[];
}

export interface WorkflowSlot {
  id: string;
  label: string;
  help: string;
  /**
   * What an option costs to run: staff hours a week, and how long a member may wait for a reply, in hours.
   * Shown as running totals, so a safeguard's cost is visible beside its benefit.
   */
  options: { id: string; label: string; cost?: { staffHours?: number; waitHours?: number } }[];
}

export interface WorkflowTest {
  id: string;
  /** The input, as the assistant would receive it. */
  input: string;
  /** Checked in slot order; the first that holds is where the run fails. */
  failsWhen: { slot: string; options: string[]; result: string }[];
  passResult: string;
}

/**
 * A simulated assistant assembled from fixed steps and run against reviewed test cases (PRD M12).
 * Results are authored per step, so a failure always points at the step that caused it.
 */
export interface WorkflowSpec {
  /** Shown before and after the slots, so the diagram reads as a pipeline. */
  input: string;
  output: string;
  slots: WorkflowSlot[];
  start: Record<string, string>;
  /** An arrangement that passes every test, offered as "Show me a way". */
  solution: Record<string, string>;
  tests: WorkflowTest[];
  support?: "guided" | "independent";
}

/**
 * Spend a limited budget on conditions, and see whose concerns are covered (PRD M13). Any plan within
 * budget that covers every essential concern is sound, so more than one conclusion is defensible.
 */
export interface AllocationSpec {
  budget: { amount: number; label: string; unit: string };
  options: { id: string; label: string; cost: number; addresses: string[]; /** Its trade-off, shown once checked. */ note: string }[];
  concerns: { id: string; stakeholder: string; text: string; essential?: boolean; /** Why it is or isn't essential. */ why: string }[];
}

/**
 * Case devices that would feel repetitive if every mission leaned on them. Content tests cap how often
 * each appears across the core modules; "decisiveFits" marks a question where the bold or simple answer is
 * the sound one, so that caution isn't always the safe bet (PRD §16, "learners become suspicious").
 */
export type Motif = "selfSelectedSample" | "inventedDetail" | "stagedTrial" | "decisiveFits";

/** A labelled part of a structured note (open response). */
export interface ResponseField {
  id: string;
  label: string;
}

type StepUnion =
  | { kind: "brief"; id: string; title: string; body: string }
  | { kind: "refresher"; id: string; title: string; body: string }
  | {
      kind: "initialJudgment";
      id: string;
      prompt: string;
      artefact?: Artefact;
      choices: Choice[];
      hints?: Hint[];
      /** Ask how confident the learner is. Kept for missions where confidence itself is the subject (PRD §9). */
      withConfidence?: boolean;
    }
  | { kind: "quiz"; id: string; prompt: string; artefact?: Artefact; choices: Choice[]; hints?: Hint[] }
  | {
      kind: "openResponse";
      id: string;
      prompt: string;
      rubric: Rubric;
      /** Shows the reason the learner wrote in an earlier audit, before that audit's feedback. */
      priorReason?: { stepId: string; claimId: string };
      /** Shows what the learner wrote in an earlier open response, to revise after a challenge (PRD C01). */
      priorResponse?: string;
      /**
       * "structured": short labelled fields instead of one box. "pickImprove": choose the strongest of
       * authored drafts, then improve it. Defaults to "free".
       */
      format?: "free" | "structured" | "pickImprove";
      fields?: ResponseField[];
      drafts?: Choice[];
      /** What to add to the chosen draft ("pickImprove"). */
      improvePrompt?: string;
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
      /** What the failures come from, shown above them, such as the response a brief produced. */
      artifact?: { label: string; text: string };
      stages: { id: string; label: string; help: string }[];
      cases: { id: string; text: string; stageId: string; explanation: string }[];
    }
  | {
      kind: "sort";
      id: string;
      prompt: string;
      /**
       * "bins": select an item, then the category to place it in. "toggles": a row of choices per item, like a
       * permission screen. Defaults to "bins".
       */
      display?: "bins" | "toggles";
      hints?: Hint[];
      categories: { id: string; label: string }[];
      items: { id: string; label: string; categoryId: string; explanation: string }[];
    }
  | {
      kind: "revision";
      id: string;
      initialStepId: string;
      /**
       * A new case that tests the same idea as the initial judgment, so the comparison shows what transferred.
       * Where the initial judgment was a position rather than a question (every option defensible), this
       * re-asks it instead.
       */
      prompt: string;
      artefact?: Artefact;
      choices: Choice[];
      /** Ask for confidence again and show it beside the first value. */
      withConfidence?: boolean;
    }
  | { kind: "transfer"; id: string; title: string; prompt: string; choices: Choice[]; hints?: Hint[] }
  | { kind: "transfer"; id: string; title: string; prompt: string; audit: AuditSpec }
  | ({ kind: "transfer"; id: string; title: string; prompt: string; mark: MarkParagraph[] } & MarkOptions)
  | ({ kind: "mark"; id: string; title: string; prompt: string; mark: MarkParagraph[] } & MarkOptions)
  | { kind: "transfer"; id: string; title: string; prompt: string; delegation: DelegationSpec }
  | { kind: "claimAudit"; id: string; title: string; intro: string; audit: AuditSpec }
  | { kind: "delegation"; id: string; title: string; intro: string; delegation: DelegationSpec }
  | { kind: "transfer"; id: string; title: string; prompt: string; compose: ComposeSpec }
  | { kind: "compose"; id: string; title: string; intro: string; compose: ComposeSpec }
  | { kind: "chartLab"; id: string; title: string; intro: string; chart: ChartLabSpec }
  | { kind: "gym"; id: string; title: string; intro: string; problems: GymProblem[] }
  | { kind: "casefile"; id: string; title: string; intro: string; casefile: CasefileSpec }
  | { kind: "thresholdLab"; id: string; title: string; intro: string; lab: ThresholdLabSpec }
  | { kind: "workflow"; id: string; title: string; intro: string; workflow: WorkflowSpec }
  | { kind: "allocation"; id: string; title: string; intro: string; allocation: AllocationSpec }
  | { kind: "transfer"; id: string; title: string; prompt: string; allocation: AllocationSpec }
  | { kind: "transfer"; id: string; title: string; prompt: string; workflow: WorkflowSpec }
  | { kind: "transfer"; id: string; title: string; prompt: string; casefile: CasefileSpec }
  | { kind: "transfer"; id: string; title: string; prompt: string; problems: GymProblem[] }
  | {
      kind: "dialogue";
      id: string;
      title: string;
      intro: string;
      initialStepId: string;
      sources: Source[];
      /** Shown above the conversation, such as the homework being talked about. */
      artefact?: Artefact;
      reflectionPrompt: string;
      dialogue: DialogueSpec;
      /** Label for moving on once the conversation ends. Defaults to the M05 wording. */
      continueLabel?: string;
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
      kind: "epilogue";
      id: string;
      title: string;
      /** When it is, in the fictional case, such as "The first week". */
      when: string;
      intro?: string;
      lines: EpilogueLine[];
    }
  | {
      kind: "debrief";
      id: string;
      takeaway: string;
      skills: DebriefSkill[];
      nextMissionId: MissionId | null;
    };

export type Step = StepUnion & { motifs?: Motif[] };

export type StepKind = Step["kind"];

/** When a beat of an epilogue applies. Every condition present must hold. */
export interface EpilogueCondition {
  /** The answer the learner settled on in a question step. */
  choice?: { step: string; ids: string[] };
  /** What an activity recorded, such as the conditions in a plan: holds `all`, at least one of `any`, none of `none`. */
  fact?: { key: string; all?: string[]; any?: string[]; none?: string[] };
  /** How a ledger item went: right in the end, or right at the first try. */
  evidence?: { item: string; right?: boolean; firstTry?: boolean };
}

export interface EpilogueBeat {
  text: string;
  /** Someone in the case it happened to, or who says it. */
  who?: string;
  tone?: "gain" | "cost" | "harm";
  when?: EpilogueCondition;
}

/** One line of what happened next: the first beat whose conditions hold. The last beat has none, as a default. */
export interface EpilogueLine {
  id: string;
  beats: EpilogueBeat[];
}

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
