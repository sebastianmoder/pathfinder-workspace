'use client';

import { useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useLabSessionStore } from '@/stores/labSessionStore';
import type { ChatErrorCode, ChatErrorInfo, ChatJobReference, ChatMessage } from '@/lib/types';

const AUTO_RETRY_CODES = new Set<ChatErrorCode>([
  'connection_interrupted',
  'provider_overloaded',
  'provider_unavailable',
  'rate_limited',
]);
const HOSTING_TIMEOUT_THRESHOLD_MS = 50_000;
const AUTO_RETRY_MIN_DELAY_MS = 750;
const AUTO_RETRY_MAX_DELAY_MS = 1_500;
const JOB_POLL_INTERVAL_MS = 1_500;
const JOB_STALE_AFTER_MS = 5 * 60_000 + 45_000;
const activeJobPolls = new Set<string>();

class ChatStreamFailure extends Error {
  info: ChatErrorInfo;

  constructor(info: ChatErrorInfo) {
    super(info.message);
    this.name = 'ChatStreamFailure';
    this.info = info;
  }
}

function isChatErrorInfo(value: unknown): value is ChatErrorInfo {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ChatErrorInfo>;
  return (
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.retryable === 'boolean' &&
    typeof candidate.requestId === 'string' &&
    typeof candidate.elapsedMs === 'number' &&
    typeof candidate.hasPartialResponse === 'boolean'
  );
}

function messageStatus(message: ChatMessage) {
  return message.status ?? (message.isStreaming ? 'streaming' : 'complete');
}

function makeInterruptedError(options: {
  requestId: string;
  generationId?: string;
  elapsedMs: number;
  hasPartialResponse: boolean;
}): ChatErrorInfo {
  const hostingTimeout = options.elapsedMs >= HOSTING_TIMEOUT_THRESHOLD_MS;
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;

  return {
    code: hostingTimeout ? 'hosting_timeout' : 'connection_interrupted',
    message: hostingTimeout
      ? options.hasPartialResponse
        ? 'This response exceeded the site’s processing limit. The partial response has been preserved.'
        : 'The model took longer than the site allows to begin responding. Please try again.'
      : offline
        ? 'Your device lost its network connection before the response finished.'
        : options.hasPartialResponse
          ? 'The connection closed before the response finished. The partial response has been preserved.'
          : 'The connection closed before the model returned a response. Please try again.',
    retryable: true,
    requestId: options.requestId,
    generationId: options.generationId,
    elapsedMs: options.elapsedMs,
    hasPartialResponse: options.hasPartialResponse,
  };
}

function shouldAutoRetry(error: ChatErrorInfo, attempt: number) {
  return (
    attempt === 0 &&
    error.retryable &&
    !error.hasPartialResponse &&
    error.elapsedMs < HOSTING_TIMEOUT_THRESHOLD_MS &&
    AUTO_RETRY_CODES.has(error.code) &&
    (typeof navigator === 'undefined' || navigator.onLine)
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type JobSnapshot = {
  id: string;
  requestId: string;
  startedAt: number;
  status: 'queued' | 'running' | 'complete' | 'error';
  content: string;
  generationId?: string;
  finishReason?: string;
  error?: ChatErrorInfo;
};

function jobConnectionError(job: ChatJobReference, hasPartialResponse: boolean): ChatErrorInfo {
  return {
    code: 'connection_interrupted',
    message: hasPartialResponse
      ? 'The job status could not be reached. The partial response has been preserved.'
      : 'The job status could not be reached. Please try again.',
    retryable: true,
    requestId: job.requestId,
    elapsedMs: Date.now() - job.startedAt,
    hasPartialResponse,
  };
}

async function pollChatJob(assistantId: string, job: ChatJobReference) {
  if (activeJobPolls.has(job.id)) return;
  activeJobPolls.add(job.id);
  let failures = 0;

  try {
    while (true) {
      const current = useChatStore.getState().messages.find((item) => item.id === assistantId);
      if (!current || current.job?.id !== job.id || messageStatus(current) !== 'streaming') return;

      if (Date.now() - job.startedAt > JOB_STALE_AFTER_MS) {
        throw new ChatStreamFailure({
          code: 'hosting_timeout',
          message: 'Generation did not finish within the five minute limit. The partial response has been preserved.',
          retryable: true,
          requestId: job.requestId,
          elapsedMs: Date.now() - job.startedAt,
          hasPartialResponse: current.content.length > 0,
        });
      }

      try {
        const response = await fetch(`/api/chat/jobs/${job.id}`, {
          headers: { Authorization: `Bearer ${job.accessToken}` },
          cache: 'no-store',
        });
        if (response.status === 404 || response.status === 410) {
          throw new ChatStreamFailure(jobConnectionError(job, current.content.length > 0));
        }
        if (!response.ok) throw new Error(`Job polling returned ${response.status}`);
        const snapshot = await response.json() as JobSnapshot;
        if (snapshot.id !== job.id || typeof snapshot.content !== 'string') {
          throw new Error('Invalid job status');
        }
        failures = 0;
        useChatStore.getState().setJobContent(assistantId, snapshot.content);

        if (snapshot.status === 'error') {
          throw new ChatStreamFailure(snapshot.error ?? jobConnectionError(job, snapshot.content.length > 0));
        }
        if (snapshot.status === 'complete') {
          useChatStore.getState().finishStreaming(assistantId);
          if (snapshot.finishReason === 'length' || snapshot.finishReason === 'content_filter') {
            useChatStore.getState().setError({
              code: snapshot.finishReason === 'length' ? 'output_limit' : 'content_filter',
              message: snapshot.finishReason === 'length'
                ? 'The model reached its output limit, so the response may be truncated.'
                : 'The model stopped its output because of a content policy.',
              retryable: false,
              requestId: job.requestId,
              generationId: snapshot.generationId,
              elapsedMs: Date.now() - job.startedAt,
              hasPartialResponse: snapshot.content.length > 0,
            });
          }
          return;
        }
      } catch (error) {
        if (error instanceof ChatStreamFailure) throw error;
        failures += 1;
        if (failures >= 10 && navigator.onLine) throw error;
      }
      await delay(JOB_POLL_INTERVAL_MS);
    }
  } catch (error) {
    const current = useChatStore.getState().messages.find((item) => item.id === assistantId);
    if (!current || current.job?.id !== job.id) return;
    useChatStore.getState().failStreaming(assistantId, error instanceof ChatStreamFailure
      ? error.info
      : jobConnectionError(job, current.content.length > 0));
  } finally {
    activeJobPolls.delete(job.id);
  }
}

export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const model = useChatStore((s) => s.model);
  const byokKey = useChatStore((s) => s.byokKey);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const startStreaming = useChatStore((s) => s.startStreaming);
  const restartStreaming = useChatStore((s) => s.restartStreaming);
  const appendStreamChunk = useChatStore((s) => s.appendStreamChunk);
  const setActiveJob = useChatStore((s) => s.setActiveJob);
  const finishStreaming = useChatStore((s) => s.finishStreaming);
  const failStreaming = useChatStore((s) => s.failStreaming);
  const acceptPartialMessage = useChatStore((s) => s.acceptPartialMessage);
  const setError = useChatStore((s) => s.setError);

  useEffect(() => {
    for (const message of useChatStore.getState().messages) {
      if (message.status === 'streaming' && message.job) {
        void pollChatJob(message.id, message.job);
      }
    }
  }, [messages]);

  const runCompletion = useCallback(
    async (assistantId: string) => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const attemptStartedAt = Date.now();
        let requestId = crypto.randomUUID();
        let generationId: string | undefined;
        let receivedContent = false;
        let finishReason: string | null = null;
        let didReceiveTerminalEvent = false;

        try {
          const allMessages = useChatStore.getState().messages;
          const assistantMessage = allMessages.find((message) => message.id === assistantId);
          const repliedToIndex = allMessages.findIndex(
            (message) => message.id === assistantMessage?.inReplyToMessageId
          );
          const attemptHistory = repliedToIndex >= 0
            ? allMessages.slice(0, repliedToIndex + 1)
            : allMessages;
          const apiMessages = attemptHistory
            .filter(
              (message) =>
                message.role === 'user' || messageStatus(message) === 'complete'
            )
            .map((message) => ({ role: message.role, content: message.content }));

          const additionalContext = useLabSessionStore.getState().session?.additionalContext;
          const systemMessages = additionalContext
            ? [{
                role: 'system',
                content: `Additional course context provided by the educator:\n\n${additionalContext}`,
              }]
            : [];

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...systemMessages, ...apiMessages],
              model,
              ...(byokKey ? { apiKey: byokKey } : {}),
            }),
          });

          requestId = response.headers.get('x-request-id') ?? requestId;

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (isChatErrorInfo(errorData?.error)) {
              throw new ChatStreamFailure(errorData.error);
            }
            throw new ChatStreamFailure({
              code: 'unknown',
              message: `The chat request failed with status ${response.status}. Please try again.`,
              retryable: response.status >= 500,
              requestId,
              elapsedMs: Date.now() - attemptStartedAt,
              hasPartialResponse: false,
            });
          }

          if (response.status === 202) {
            const submitted = await response.json() as {
              jobId?: string;
              accessToken?: string;
              requestId?: string;
              startedAt?: number;
            };
            if (!submitted.jobId || !submitted.accessToken || !submitted.requestId ||
                typeof submitted.startedAt !== 'number') {
              throw new Error('Invalid job submission response');
            }
            const job: ChatJobReference = {
              id: submitted.jobId,
              accessToken: submitted.accessToken,
              requestId: submitted.requestId,
              startedAt: submitted.startedAt,
            };
            setActiveJob(assistantId, job);
            await pollChatJob(assistantId, job);
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new ChatStreamFailure({
              code: 'connection_interrupted',
              message: 'The server returned no response stream. Please try again.',
              retryable: true,
              requestId,
              elapsedMs: Date.now() - attemptStartedAt,
              hasPartialResponse: false,
            });
          }

          const decoder = new TextDecoder();
          let buffer = '';

          const processLine = (line: string) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':') || !trimmed.startsWith('data: ')) {
              return;
            }

            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              didReceiveTerminalEvent = true;
              return;
            }

            let parsed: Record<string, unknown>;
            try {
              parsed = JSON.parse(data) as Record<string, unknown>;
            } catch {
              return;
            }

            if (parsed.type === 'start') {
              if (typeof parsed.requestId === 'string') requestId = parsed.requestId;
              return;
            }

            if (parsed.type === 'error' && isChatErrorInfo(parsed.error)) {
              throw new ChatStreamFailure(parsed.error);
            }

            if (parsed.type === 'content' && typeof parsed.content === 'string') {
              if (typeof parsed.generationId === 'string') generationId = parsed.generationId;
              if (parsed.content) {
                receivedContent = true;
                appendStreamChunk(assistantId, parsed.content);
              }
              return;
            }

            if (parsed.type === 'finish') {
              if (typeof parsed.generationId === 'string') generationId = parsed.generationId;
              if (typeof parsed.finishReason === 'string') finishReason = parsed.finishReason;
              didReceiveTerminalEvent = true;
              if (finishReason === 'error') {
                throw new ChatStreamFailure({
                  code: 'provider_unavailable',
                  message: 'The model provider reported an error before completing the response.',
                  retryable: true,
                  requestId,
                  generationId,
                  elapsedMs: Date.now() - attemptStartedAt,
                  hasPartialResponse: receivedContent,
                });
              }
              return;
            }

            // Backward-compatible parsing for streams created before typed events.
            if (typeof parsed.error === 'string') {
              throw new ChatStreamFailure({
                code: 'provider_unavailable',
                message: parsed.error,
                retryable: true,
                requestId,
                generationId,
                elapsedMs: Date.now() - attemptStartedAt,
                hasPartialResponse: receivedContent,
              });
            }
            if (typeof parsed.content === 'string' && parsed.content) {
              receivedContent = true;
              appendStreamChunk(assistantId, parsed.content);
            }
            if (typeof parsed.finishReason === 'string') {
              finishReason = parsed.finishReason;
            }
          };

          const processBuffer = (flush = false) => {
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) processLine(line);

            if (flush) {
              const trailing = buffer.trim();
              if (trailing) processLine(trailing);
              buffer = '';
            }
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            processBuffer();
          }

          buffer += decoder.decode();
          processBuffer(true);

          if (!didReceiveTerminalEvent) {
            throw new ChatStreamFailure(makeInterruptedError({
              requestId,
              generationId,
              elapsedMs: Date.now() - attemptStartedAt,
              hasPartialResponse: receivedContent,
            }));
          }

          finishStreaming(assistantId);
          setError(null);

          if (finishReason === 'length') {
            setError({
              code: 'output_limit',
              message: 'The model reached its output limit, so the response may be truncated.',
              retryable: false,
              requestId,
              generationId,
              elapsedMs: Date.now() - attemptStartedAt,
              hasPartialResponse: receivedContent,
            });
          } else if (finishReason === 'content_filter') {
            setError({
              code: 'content_filter',
              message: 'The model stopped its output because of a content policy.',
              retryable: false,
              requestId,
              generationId,
              elapsedMs: Date.now() - attemptStartedAt,
              hasPartialResponse: receivedContent,
            });
          }
          return;
        } catch (err) {
          const failure = err instanceof ChatStreamFailure
            ? err.info
            : makeInterruptedError({
                requestId,
                generationId,
                elapsedMs: Date.now() - attemptStartedAt,
                hasPartialResponse: receivedContent,
              });

          if (shouldAutoRetry(failure, attempt)) {
            const retryDelay =
              AUTO_RETRY_MIN_DELAY_MS +
              Math.random() * (AUTO_RETRY_MAX_DELAY_MS - AUTO_RETRY_MIN_DELAY_MS);
            await delay(retryDelay);
            restartStreaming(assistantId);
            continue;
          }

          failStreaming(assistantId, failure);
          return;
        }
      }
    },
    [
      model,
      byokKey,
      appendStreamChunk,
      setActiveJob,
      finishStreaming,
      failStreaming,
      restartStreaming,
      setError,
    ]
  );

  const sendMessage = useCallback(
    async (prompt: string, iterationNumber: number) => {
      if (useChatStore.getState().isStreaming) return;

      const userMessageId = addUserMessage(prompt, iterationNumber);
      const assistantId = startStreaming(iterationNumber, userMessageId);
      await runCompletion(assistantId);
    },
    [addUserMessage, startStreaming, runCompletion]
  );

  const retryMessage = useCallback(
    async (assistantId: string) => {
      if (useChatStore.getState().isStreaming) return;

      const message = useChatStore.getState().messages.find((item) => item.id === assistantId);
      if (!message || message.role !== 'assistant' || messageStatus(message) !== 'incomplete') {
        return;
      }

      restartStreaming(assistantId);
      await runCompletion(assistantId);
    },
    [restartStreaming, runCompletion]
  );

  const keepPartialMessage = useCallback(
    (assistantId: string) => {
      acceptPartialMessage(assistantId);
    },
    [acceptPartialMessage]
  );

  return {
    messages,
    isStreaming,
    error,
    model,
    sendMessage,
    retryMessage,
    keepPartialMessage,
  };
}
