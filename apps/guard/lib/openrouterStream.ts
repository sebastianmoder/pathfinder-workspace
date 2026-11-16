import type OpenAI from 'openai';
import { reasoningEffortFor } from './constants';

type ContentPart = { type?: string; text?: string };

/** The subset of an OpenRouter chat-completion stream chunk that GUARD reads. */
export type OpenRouterStreamChunk = {
  error?: { code?: number | string; message?: string; metadata?: { error_type?: string } } | string;
  id?: string;
  choices?: Array<{
    delta?: {
      content?: string | ContentPart[] | null;
      reasoning?: string | null;
      reasoning_details?: unknown[] | null;
    };
    finish_reason?: string | null;
  }>;
};

type OpenRouterChatParams = OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming & {
  reasoning?: { effort: string };
};

export function openRouterStreamParams(
  model: string,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming {
  const effort = reasoningEffortFor(model);
  const params: OpenRouterChatParams = {
    model,
    messages,
    stream: true,
    ...(effort ? { reasoning: { effort } } : {}),
  };
  return params;
}

/** Visible answer text in a chunk. Reasoning text is never returned. */
export function chunkText(chunk: OpenRouterStreamChunk): string {
  const content = chunk.choices?.[0]?.delta?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('');
  }
  return '';
}

/** True when the chunk carries reasoning (thinking) output rather than answer text. */
export function chunkHasReasoning(chunk: OpenRouterStreamChunk): boolean {
  const delta = chunk.choices?.[0]?.delta;
  return Boolean(
    (typeof delta?.reasoning === 'string' && delta.reasoning.length > 0) ||
    (Array.isArray(delta?.reasoning_details) && delta.reasoning_details.length > 0)
  );
}
