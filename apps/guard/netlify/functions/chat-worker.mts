import { createHmac, timingSafeEqual } from 'node:crypto';
import OpenAI from 'openai';
import type { Config } from '@netlify/functions';
import { chatJobInputStore, chatJobStore, JOB_DEADLINE_MS, type ChatJob, type ChatJobInput, type ChatJobSubmission } from '../../lib/chatJobs';
import type { ChatErrorCode, ChatErrorInfo } from '../../lib/types';

export const config: Config = { background: true };

type StreamChunk = {
  error?: { code?: string | number; message?: string } | string;
  id?: string;
  choices?: Array<{
    delta?: { content?: string | Array<{ type?: string; text?: string }> };
    finish_reason?: string | null;
  }>;
};

function signed(payload: string, signature: string | null, secret: string) {
  if (!signature || !/^[0-9a-f]{64}$/.test(signature)) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(payload).digest('hex'), 'hex');
  return timingSafeEqual(Buffer.from(signature, 'hex'), expected);
}

function classify(error: unknown, job: ChatJob, deadlineReached: boolean): ChatErrorInfo {
  const value = error && typeof error === 'object' ? error as Record<string, unknown> : null;
  const nested = value?.error && typeof value.error === 'object'
    ? value.error as Record<string, unknown> : null;
  const status = Number(value?.status ?? nested?.status ?? value?.code ?? nested?.code);
  const message = String(value?.message ?? nested?.message ?? error ?? '').toLowerCase();
  const fingerprint = `${String(value?.code ?? nested?.code ?? '')} ${message}`.toLowerCase();
  let code: ChatErrorCode = 'unknown';
  let userMessage = 'The response could not be completed. Please try again.';
  let retryable = true;

  if (deadlineReached) {
    code = 'hosting_timeout';
    userMessage = 'Generation exceeded the five minute limit. The partial response has been preserved.';
  } else if (status === 429 || fingerprint.includes('rate_limit')) {
    code = 'rate_limited';
    userMessage = 'The model provider is receiving too many requests. Please wait a moment and try again.';
  } else if (fingerprint.includes('overload')) {
    code = 'provider_overloaded';
    userMessage = 'The model provider is temporarily overloaded. Please try again.';
  } else if ([408, 502, 503, 504].includes(status) || status >= 500 || /disconnect|connection|timeout|unavailable/.test(fingerprint)) {
    code = 'provider_unavailable';
    userMessage = 'The model provider became unavailable before completing the response. Please try again.';
  } else if (status === 401 || message.includes('auth')) {
    code = 'authentication';
    userMessage = 'The OpenRouter API key was rejected. Check the key in Settings and try again.';
    retryable = false;
  } else if (status === 402 || /credit|payment/.test(message)) {
    code = 'insufficient_credits';
    userMessage = 'The OpenRouter account does not have enough credits for this request.';
    retryable = false;
  } else if (status === 403 || /moderation|content_filter|policy/.test(message)) {
    code = 'content_filter';
    userMessage = 'The model provider stopped the response because of a content policy.';
    retryable = false;
  } else if (status === 400 || /invalid|context_length/.test(message)) {
    code = 'invalid_request';
    userMessage = message.includes('context_length')
      ? 'The conversation is too long for the selected model. Remove some context and try again.'
      : 'The selected model could not process this request. Check the model and prompt, then try again.';
    retryable = false;
  }

  return {
    code,
    message: userMessage,
    retryable,
    requestId: job.requestId,
    generationId: job.generationId,
    elapsedMs: Date.now() - job.startedAt,
    hasPartialResponse: job.content.length > 0,
  };
}

export default async function handler(request: Request) {
  const secret = process.env.CHAT_JOB_SIGNING_SECRET;
  if (!secret) return new Response('Unavailable', { status: 503 });
  const raw = await request.text();
  if (!signed(raw, request.headers.get('X-Chat-Job-Signature'), secret)) {
    return new Response('Forbidden', { status: 403 });
  }

  const submission = JSON.parse(raw) as ChatJobSubmission;
  if (!submission.jobId || !submission.apiKey || !submission.model) {
    return new Response('Invalid submission', { status: 400 });
  }
  const store = chatJobStore();
  const job = await store.get(submission.jobId, { type: 'json' }) as ChatJob | null;
  if (!job || job.status === 'complete' || job.status === 'error' || job.expiresAt <= Date.now()) {
    return new Response(null, { status: 204 });
  }
  const inputStore = chatJobInputStore();
  const input = await inputStore.get(job.id, { type: 'json' }) as ChatJobInput | null;
  if (!input || !Array.isArray(input.messages)) {
    job.status = 'error';
    job.updatedAt = Date.now();
    job.error = classify('Job input is unavailable', job, false);
    await store.setJSON(job.id, job);
    console.error({ event: 'chat_job_error', jobId: job.id, requestId: job.requestId, errorType: job.error.code });
    return new Response(null, { status: 204 });
  }

  const upstreamController = new AbortController();
  let deadlineReached = false;
  const deadline = setTimeout(() => {
    deadlineReached = true;
    upstreamController.abort();
  }, Math.max(0, job.startedAt + JOB_DEADLINE_MS - Date.now()));
  let dirty = true;
  let lastSavedAt = 0;
  let saveQueue: Promise<unknown> = Promise.resolve();
  const save = (force = false) => {
    const now = Date.now();
    if (!force && !dirty && now - lastSavedAt < 10_000) return saveQueue;
    job.updatedAt = now;
    const snapshot = { ...job };
    dirty = false;
    lastSavedAt = now;
    saveQueue = saveQueue.then(() => store.setJSON(job.id, snapshot));
    return saveQueue;
  };
  const interval = setInterval(() => { void save().catch((error) => {
    console.error({ event: 'chat_job_save_error', jobId: job.id, requestId: job.requestId, error });
    upstreamController.abort();
  }); }, 2_000);

  try {
    job.status = 'running';
    await save(true);
    const openai = new OpenAI({ apiKey: submission.apiKey, baseURL: 'https://openrouter.ai/api/v1' });
    const stream = await openai.chat.completions.create(
      { model: submission.model, messages: input.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[], stream: true },
      { signal: upstreamController.signal, maxRetries: 0 }
    );
    let finishReason: string | null = null;
    for await (const chunk of stream) {
      const item = chunk as StreamChunk;
      job.generationId = item.id ?? job.generationId;
      if (item.error) throw item.error;
      const choice = item.choices?.[0];
      if (choice?.finish_reason) finishReason = choice.finish_reason;
      const delta = choice?.delta?.content;
      const text = typeof delta === 'string' ? delta
        : Array.isArray(delta) ? delta.filter((part) => part.type === 'text' && typeof part.text === 'string').map((part) => part.text).join('')
        : '';
      if (text) {
        job.content += text;
        dirty = true;
      }
    }
    if (!finishReason || finishReason === 'error') {
      throw new Error('Provider stream disconnected before completion');
    }
    job.finishReason = finishReason;
    job.status = 'complete';
    await save(true);
    console.info({ event: 'chat_job_complete', jobId: job.id, requestId: job.requestId, generationId: job.generationId, model: job.model, elapsedMs: Date.now() - job.startedAt, finishReason });
  } catch (error) {
    job.error = classify(error, job, deadlineReached);
    job.status = 'error';
    await save(true);
    console.error({ event: 'chat_job_error', jobId: job.id, requestId: job.requestId, generationId: job.generationId, model: job.model, elapsedMs: job.error.elapsedMs, errorType: job.error.code });
  } finally {
    clearInterval(interval);
    clearTimeout(deadline);
    upstreamController.abort();
    await saveQueue;
    await inputStore.delete(job.id).catch((error) => {
      console.error({ event: 'chat_job_input_cleanup_error', jobId: job.id, requestId: job.requestId, error });
    });
  }
  return new Response(null, { status: 204 });
}
