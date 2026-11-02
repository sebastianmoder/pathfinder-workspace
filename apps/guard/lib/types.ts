// ============================================================
// PHASE & ITERATION ENUMS
// ============================================================

export type Phase = 'reflect' | 'compose' | 'generate' | 'evaluate';

export type LabId =
  | 'activity-planning'
  | 'assessment-creation'
  | 'rubric-design'
  | 'curriculum-revision'
  | 'assignment-ai-resilience';

// ============================================================
// LAB CONTENT TYPES (static config, not runtime state)
// ============================================================

export interface ScaffoldingQuestion {
  id: string;
  question: string;
  placeholder?: string;
  templateSlot: string;
  inputType: 'text' | 'textarea' | 'select';
  options?: ScaffoldingQuestionOption[];
  defaultValue?: string;
}

export interface ScaffoldingQuestionOption {
  value: string;
  label: string;
}

export interface TemplateSlot {
  id: string;
  label: string;
  defaultText: string;
}

export interface PromptTemplate {
  templateText: string;
  slots: TemplateSlot[];
}

export interface EvaluationReflection {
  id: string;
  question: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
}

export interface FailureMode {
  id: string;
  title: string;
  description: string;
}

export interface EvaluationTools {
  reflectionQuestions: EvaluationReflection[];
  checklist: ChecklistItem[];
  failureModes: FailureMode[];
}

export interface IterationConfig {
  iterationNumber: number;
  title: string;
  focus: string;
  isOptional: boolean;
  scaffoldingQuestions: ScaffoldingQuestion[];
  promptTemplate: PromptTemplate;
  evaluationTools: EvaluationTools;
}

export interface LabMeta {
  id: LabId;
  title: string;
  description: string;
  estimatedTime: string;
  learningOutcome: string;
  coreSkill: string;
  icon: string;
}

export interface LabConfig {
  meta: LabMeta;
  iterations: IterationConfig[];
}

// ============================================================
// RUNTIME STATE TYPES
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  iterationNumber: number;
  isStreaming?: boolean;
  status?: ChatMessageStatus;
  inReplyToMessageId?: string;
  failure?: ChatErrorInfo;
  job?: ChatJobReference;
  animated?: boolean;
}

export interface ChatJobReference {
  id: string;
  accessToken: string;
  requestId: string;
  startedAt: number;
}

export type ChatMessageStatus = 'streaming' | 'complete' | 'incomplete';

export type ChatErrorCode =
  | 'hosting_timeout'
  | 'connection_interrupted'
  | 'provider_overloaded'
  | 'provider_unavailable'
  | 'rate_limited'
  | 'authentication'
  | 'insufficient_credits'
  | 'invalid_request'
  | 'content_filter'
  | 'output_limit'
  | 'unknown';

export interface ChatErrorInfo {
  code: ChatErrorCode;
  message: string;
  retryable: boolean;
  requestId: string;
  generationId?: string;
  elapsedMs: number;
  hasPartialResponse: boolean;
}

export type ChatStreamEvent =
  | {
      type: 'start';
      requestId: string;
      startedAt: number;
    }
  | {
      type: 'content';
      content: string;
      generationId?: string;
    }
  | {
      type: 'finish';
      finishReason: string;
      generationId?: string;
      elapsedMs: number;
    }
  | {
      type: 'error';
      error: ChatErrorInfo;
    };

export interface IterationAnswers {
  [questionId: string]: string;
}

export interface ChecklistState {
  [checklistItemId: string]: boolean;
}

export interface ContextDocument {
  id: string;
  fileName: string;
  text: string;
  uploadedAt: number;
}

export interface IterationState {
  iterationNumber: number;
  currentPhase: Phase;
  answers: IterationAnswers;
  checklistState: ChecklistState;
  assembledPrompt: string;
  promptEdited: boolean;
  isComplete: boolean;
}

export interface LabSessionState {
  sessionId: string;
  labId: LabId;
  currentIteration: number;
  iterations: Record<number, IterationState>;
  startedAt: number;
  lastActivityAt: number;
  additionalContext?: string | null;
  additionalContextFileName?: string | null;
  additionalContextDocuments?: ContextDocument[];
}

export interface SessionHistoryEntry {
  id: string;
  labId: LabId;
  labTitle: string;
  startedAt: number;
  lastActivityAt: number;
  currentIteration: number;
  currentPhase: Phase;
  totalIterations: number;
  isComplete: boolean;
  sessionSnapshot: LabSessionState;
  chatSnapshot: ChatMessage[];
}

export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: ChatErrorInfo | null;
  model: string;
}

export interface ApiKeySettings {
  openaiKey: string | null;
  preferredModel: string;
}
