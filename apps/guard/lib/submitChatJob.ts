import { createHmac } from 'node:crypto';
import { DEFAULT_MODEL } from './constants';
import { chatJobInputStore, chatJobStore, hashJobToken, JOB_RETENTION_MS, type ChatJob, type ChatJobSubmission } from './chatJobs';
import type { ChatErrorInfo } from './types';

function failure(requestId: string, startedAt: number, code: ChatErrorInfo['code'], message: string, status: number) {
  const error: ChatErrorInfo = {
    code,
    message,
    retryable: status >= 500,
    requestId,
    elapsedMs: Date.now() - startedAt,
    hasPartialResponse: false,
  };
  return Response.json({ error }, { status });
}

export async function submitChatJob(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const body = await request.json().catch(() => null);
  const messages = body?.messages;
  const model = body?.model ?? DEFAULT_MODEL;
  const apiKey = body?.apiKey || process.env.OPENROUTER_API_KEY;
  const signingSecret = process.env.CHAT_JOB_SIGNING_SECRET;

  if (!Array.isArray(messages) || messages.length === 0 ||
      !messages.every((message) =>
        message && ['system', 'user', 'assistant'].includes(message.role) && typeof message.content === 'string'
      ) || typeof model !== 'string' || !model) {
    return failure(requestId, startedAt, 'invalid_request', 'The chat request is invalid.', 400);
  }
  if (!apiKey || typeof apiKey !== 'string') {
    return failure(requestId, startedAt, 'authentication', 'No OpenRouter API key is configured. Add one in Settings and try again.', 401);
  }
  if (!signingSecret) {
    console.error({ event: 'chat_job_configuration_error', requestId, reason: 'missing signing secret' });
    return failure(requestId, startedAt, 'unknown', 'Chat generation is temporarily unavailable. Please try again later.', 503);
  }

  const jobId = crypto.randomUUID();
  const accessToken = crypto.randomUUID();
  const job: ChatJob = {
    id: jobId,
    requestId,
    tokenHash: hashJobToken(accessToken),
    model,
    startedAt,
    updatedAt: startedAt,
    expiresAt: startedAt + JOB_RETENTION_MS,
    status: 'queued',
    content: '',
  };
  const store = chatJobStore();
  const inputStore = chatJobInputStore();

  try {
    await store.setJSON(jobId, job);
    await inputStore.setJSON(jobId, { messages, expiresAt: job.expiresAt });
    const submission: ChatJobSubmission = { jobId, model, apiKey };
    const payload = JSON.stringify(submission);
    const signature = createHmac('sha256', signingSecret).update(payload).digest('hex');
    const endpoint = new URL('/.netlify/functions/chat-worker', request.url);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Chat-Job-Signature': signature },
      body: payload,
      cache: 'no-store',
    });
    if (response.status !== 202) {
      throw new Error(`Background function invocation returned ${response.status}`);
    }
    console.info({ event: 'chat_job_submitted', jobId, requestId, model });
    return Response.json({ jobId, requestId, accessToken, startedAt }, {
      status: 202,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    await store.delete(jobId).catch(() => undefined);
    await inputStore.delete(jobId).catch(() => undefined);
    console.error({ event: 'chat_job_submission_error', jobId, requestId, error });
    return failure(requestId, startedAt, 'unknown', 'The response could not be started. Please try again.', 503);
  }
}
