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

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  label: string;
  availability: ModelAvailability;
};

export const DEFAULT_MODEL_OPTION: ModelOption = {
  id: 'minimax/minimax-m3',
  name: 'MiniMax M3',
  provider: 'MiniMax',
  label: 'MiniMax M3 (MiniMax)',
  availability: 'Free',
};

export const DEFAULT_MODEL = DEFAULT_MODEL_OPTION.id;

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

export const MAX_ITERATIONS = 3;
