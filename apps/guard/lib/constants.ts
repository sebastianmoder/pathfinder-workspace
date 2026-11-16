import type { Phase } from './types';

export const PHASES: Phase[] = ['reflect', 'compose', 'generate', 'evaluate'];

export const PHASE_LABELS: Record<Phase, string> = {
  reflect: 'Reflect',
  compose: 'Compose',
  generate: 'Generate',
  evaluate: 'Evaluate',
};

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  reflect: 'Answer scaffolding questions to clarify your intent',
  compose: 'Review and edit the assembled prompt',
  generate: 'Send the prompt to the AI',
  evaluate: 'Critically evaluate the AI response',
};

export type ModelAvailability = 'Free' | 'Paid';

export type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  label: string;
  availability: ModelAvailability;
  /** Sent to OpenRouter as `reasoning.effort`. Omit to use the provider default. */
  reasoningEffort?: ReasoningEffort;
};

export const DEFAULT_MODEL_OPTION: ModelOption = {
  id: 'anthropic/claude-haiku-5.5',
  name: 'Claude Haiku 5.5',
  provider: 'Anthropic',
  label: 'Claude Haiku 5.5 (Anthropic)',
  availability: 'Free',
  // Lower to 'low' if time to first token is still too long.
  reasoningEffort: 'medium',
};

export const DEFAULT_MODEL = DEFAULT_MODEL_OPTION.id;

/** Earlier built-in defaults; sessions still holding one are moved to DEFAULT_MODEL. */
export const PREVIOUS_DEFAULT_MODELS = [
  'arcee-ai/trinity-large-preview:free',
  'minimax/minimax-m3',
];

export const BYOK_MODELS: ModelOption[] = [
  DEFAULT_MODEL_OPTION,
  {
    id: 'mistralai/ministral-14b-2512',
    name: 'Ministral 14B 2512',
    provider: 'Mistral AI',
    label: 'Ministral 14B 2512 (Mistral AI)',
    availability: 'Paid',
  },
  {
    id: 'openai/gpt-6-sol',
    name: 'GPT-6 Sol',
    provider: 'OpenAI',
    label: 'GPT-6 Sol (OpenAI)',
    availability: 'Paid',
  },
  {
    id: 'anthropic/claude-opus-5.5',
    name: 'Claude Opus 5.5',
    provider: 'Anthropic',
    label: 'Claude Opus 5.5 (Anthropic)',
    availability: 'Paid',
  },
  {
    id: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    provider: 'Anthropic',
    label: 'Claude Sonnet 5 (Anthropic)',
    availability: 'Paid',
  },
  {
    id: 'google/gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google',
    label: 'Gemini 3.8 Flash (Google)',
    availability: 'Paid',
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    label: 'Llama 4 Maverick (Meta)',
    availability: 'Paid',
  },
];
export const DEFAULT_BYOK_MODEL = DEFAULT_MODEL;

export function reasoningEffortFor(model: string): ReasoningEffort | undefined {
  return BYOK_MODELS.find((option) => option.id === model)?.reasoningEffort;
}

export const MAX_ITERATIONS = 3;
