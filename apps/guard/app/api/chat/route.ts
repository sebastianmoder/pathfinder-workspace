import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { DEFAULT_MODEL } from '@/lib/constants';
import { submitChatJob } from '@/lib/submitChatJob';
import type { ChatErrorCode, ChatErrorInfo, ChatStreamEvent } from '@/lib/types';

export const maxDuration = 60;

const STREAM_DEADLINE_MS = 55_000;
const HEARTBEAT_INTERVAL_MS = 10_000;

type OpenRouterError = {
  code?: number | string;
  message?: string;
  metadata?: {
    error_type?: string;
  };
};

type StreamChunk = {
  error?: OpenRouterError | string;
  id?: string;
  choices?: Array<{
    delta?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
    finish_reason?: string | null;
  }>;
};

type FailureContext = {
  requestId: string;
  generationId?: string;
  elapsedMs: number;
  hasPartialResponse: boolean;
  deadlineReached?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

function classifyError(error: unknown, context: FailureContext): ChatErrorInfo {
  const record = asRecord(error);
  const nestedError = asRecord(record?.error);
  const metadata = asRecord(record?.metadata) ?? asRecord(nestedError?.metadata);
  const codeValue = record?.code ?? nestedError?.code;
  const statusValue = record?.status ?? nestedError?.status ?? codeValue;
  const status = typeof statusValue === 'number'
    ? statusValue
    : typeof statusValue === 'string' && /^\d+$/.test(statusValue)
      ? Number(statusValue)
      : undefined;
  const rawType = metadata?.error_type ?? codeValue ?? record?.name;
  const errorType = typeof rawType === 'string' ? rawType.toLowerCase() : '';
  const rawMessage =
    typeof error === 'string'
      ? error
      : typeof record?.message === 'string'
        ? record.message
        : typeof nestedError?.message === 'string'
          ? nestedError.message
          : '';
  const errorFingerprint = `${errorType} ${rawMessage}`.toLowerCase();

  let code: ChatErrorCode = 'unknown';
  let message = 'The response could not be completed. Please try again.';
  let retryable = true;

  if (context.deadlineReached) {
    code = 'hosting_timeout';
    message = context.hasPartialResponse
      ? 'This response exceeded the site’s processing limit. The partial response has been preserved.'
      : 'The model took longer than the site allows to begin responding. Please try again.';
  } else if (status === 429 || errorFingerprint.includes('rate_limit')) {
    code = 'rate_limited';
    message = 'The model provider is receiving too many requests. Please wait a moment and try again.';
  } else if (
    errorFingerprint.includes('provider_overloaded') ||
    errorFingerprint.includes('overloaded')
  ) {
    code = 'provider_overloaded';
    message = 'The model provider is temporarily overloaded. Please try again.';
  } else if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === 408 ||
    (status !== undefined && status >= 500) ||
    errorFingerprint.includes('provider_unavailable') ||
    errorFingerprint.includes('server_error') ||
    errorFingerprint.includes('internal_server') ||
    errorFingerprint.includes('disconnect') ||
    errorFingerprint.includes('connection') ||
    errorFingerprint.includes('timeout')
  ) {
    code = 'provider_unavailable';
    message = 'The model provider became unavailable before completing the response. Please try again.';
  } else if (status === 401 || errorFingerprint.includes('auth')) {
    code = 'authentication';
    message = 'The OpenRouter API key was rejected. Check the key in Settings and try again.';
    retryable = false;
  } else if (
    status === 402 ||
    errorFingerprint.includes('credit') ||
    errorFingerprint.includes('payment')
  ) {
    code = 'insufficient_credits';
    message = 'The OpenRouter account does not have enough credits for this request.';
    retryable = false;
  } else if (
    status === 403 ||
    errorFingerprint.includes('moderation') ||
    errorFingerprint.includes('content_filter') ||
    errorFingerprint.includes('policy')
  ) {
    code = 'content_filter';
    message = 'The model provider stopped the response because of a content policy.';
    retryable = false;
  } else if (
    status === 400 ||
    errorFingerprint.includes('invalid') ||
    errorFingerprint.includes('context_length')
  ) {
    code = 'invalid_request';
    message = errorFingerprint.includes('context_length')
      ? 'The conversation is too long for the selected model. Remove some context and try again.'
      : 'The selected model could not process this request. Check the model and prompt, then try again.';
    retryable = false;
  }

  return {
    code,
    message,
    retryable,
    requestId: context.requestId,
    generationId: context.generationId,
    elapsedMs: context.elapsedMs,
    hasPartialResponse: context.hasPartialResponse,
  };
}

function statusForFailure(error: ChatErrorInfo): number {
  switch (error.code) {
    case 'authentication':
      return 401;
    case 'insufficient_credits':
      return 402;
    case 'content_filter':
      return 403;
    case 'invalid_request':
      return 400;
    case 'rate_limited':
      return 429;
    case 'hosting_timeout':
      return 504;
    case 'provider_overloaded':
    case 'provider_unavailable':
      return 503;
    default:
      return 500;
  }
}

function logStreamResult(
  outcome: 'complete' | 'error',
  details: {
    requestId: string;
    generationId?: string;
    model: string;
    elapsedMs: number;
    contentReceived: boolean;
    finishReason?: string;
    errorType?: ChatErrorCode;
  }
) {
  const entry = { event: `chat_stream_${outcome}`, ...details };
  if (outcome === 'error') {
    console.error(entry);
  } else {
    console.info(entry);
  }
}

export async function POST(request: Request) {
  if (process.env.SITE_ID) {
    return submitChatJob(request);
  }

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let model = DEFAULT_MODEL;
  let generationId: string | undefined;
  let hasPartialResponse = false;
  let deadlineReached = false;

  const upstreamController = new AbortController();
  const deadlineTimer = setTimeout(() => {
    deadlineReached = true;
    upstreamController.abort();
  }, STREAM_DEADLINE_MS);

  const abortForDisconnectedClient = () => upstreamController.abort();
  request.signal.addEventListener('abort', abortForDisconnectedClient, { once: true });

  const cleanup = () => {
    clearTimeout(deadlineTimer);
    request.signal.removeEventListener('abort', abortForDisconnectedClient);
  };

  try {
    const body = await request.json();
    const messages = body.messages;
    model = body.model ?? DEFAULT_MODEL;
    const apiKey = body.apiKey;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      cleanup();
      return NextResponse.json(
        {
          error: classifyError(
            { status: 400, code: 'invalid_request' },
            { requestId, elapsedMs: Date.now() - startedAt, hasPartialResponse: false }
          ),
        },
        { status: 400 }
      );
    }

    const key = apiKey || process.env.OPENROUTER_API_KEY;
    if (!key) {
      cleanup();
      const error: ChatErrorInfo = {
        code: 'authentication',
        message: 'No OpenRouter API key is configured. Add one in Settings and try again.',
        retryable: false,
        requestId,
        elapsedMs: Date.now() - startedAt,
        hasPartialResponse: false,
      };
      return NextResponse.json({ error }, { status: statusForFailure(error) });
    }

    const openai = new OpenAI({
      apiKey: key,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const stream = await openai.chat.completions.create(
      {
        model,
        messages,
        stream: true,
      },
      { signal: upstreamController.signal, maxRetries: 0 }
    );

    const encoder = new TextEncoder();
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
    let streamClosed = false;

    const readable = new ReadableStream({
      async start(controller) {
        const enqueueRaw = (value: string) => {
          if (!streamClosed) {
            controller.enqueue(encoder.encode(value));
          }
        };
        const enqueueEvent = (event: ChatStreamEvent) => {
          enqueueRaw(`data: ${JSON.stringify(event)}\n\n`);
        };
        const closeStream = () => {
          if (!streamClosed) {
            streamClosed = true;
            controller.close();
          }
        };

        enqueueEvent({ type: 'start', requestId, startedAt });
        heartbeatTimer = setInterval(() => {
          enqueueRaw(': keep-alive\n\n');
        }, HEARTBEAT_INTERVAL_MS);

        try {
          let finishReason: string | null = null;

          for await (const chunk of stream) {
            const streamChunk = chunk as StreamChunk;
            generationId = streamChunk.id ?? generationId;
            const upstreamError = streamChunk.error;

            if (upstreamError) {
              const error = classifyError(upstreamError, {
                requestId,
                generationId,
                elapsedMs: Date.now() - startedAt,
                hasPartialResponse,
              });
              enqueueEvent({ type: 'error', error });
              logStreamResult('error', {
                requestId,
                generationId,
                model,
                elapsedMs: error.elapsedMs,
                contentReceived: hasPartialResponse,
                errorType: error.code,
              });
              closeStream();
              return;
            }

            const choice = streamChunk.choices?.[0];
            if (choice?.finish_reason) {
              finishReason = choice.finish_reason;
            }

            const deltaContent = choice?.delta?.content;
            const content =
              typeof deltaContent === 'string'
                ? deltaContent
                : Array.isArray(deltaContent)
                  ? deltaContent
                      .filter((part) => part.type === 'text' && typeof part.text === 'string')
                      .map((part) => part.text)
                      .join('')
                  : '';

            if (content) {
              hasPartialResponse = true;
              enqueueEvent({ type: 'content', content, generationId });
            }
          }

          const elapsedMs = Date.now() - startedAt;
          if (!finishReason) {
            const error = classifyError('Provider stream disconnected before completion', {
              requestId,
              generationId,
              elapsedMs,
              hasPartialResponse,
            });
            enqueueEvent({ type: 'error', error });
            logStreamResult('error', {
              requestId,
              generationId,
              model,
              elapsedMs,
              contentReceived: hasPartialResponse,
              errorType: error.code,
            });
            closeStream();
            return;
          }

          enqueueEvent({ type: 'finish', finishReason, generationId, elapsedMs });
          enqueueRaw('data: [DONE]\n\n');
          logStreamResult('complete', {
            requestId,
            generationId,
            model,
            elapsedMs,
            contentReceived: hasPartialResponse,
            finishReason,
          });
          closeStream();
        } catch (err) {
          if (streamClosed) return;

          const error = classifyError(err, {
            requestId,
            generationId,
            elapsedMs: Date.now() - startedAt,
            hasPartialResponse,
            deadlineReached,
          });
          enqueueEvent({ type: 'error', error });
          logStreamResult('error', {
            requestId,
            generationId,
            model,
            elapsedMs: error.elapsedMs,
            contentReceived: hasPartialResponse,
            errorType: error.code,
          });
          closeStream();
        } finally {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          cleanup();
        }
      },
      cancel() {
        streamClosed = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        upstreamController.abort();
        cleanup();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Request-Id': requestId,
      },
    });
  } catch (err) {
    cleanup();
    const error = classifyError(err, {
      requestId,
      generationId,
      elapsedMs: Date.now() - startedAt,
      hasPartialResponse,
      deadlineReached,
    });
    logStreamResult('error', {
      requestId,
      generationId,
      model,
      elapsedMs: error.elapsedMs,
      contentReceived: hasPartialResponse,
      errorType: error.code,
    });
    return NextResponse.json({ error }, { status: statusForFailure(error) });
  }
}
