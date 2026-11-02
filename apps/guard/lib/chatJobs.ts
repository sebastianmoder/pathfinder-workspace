import { createHash, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import type { ChatErrorInfo } from './types';

export const JOB_DEADLINE_MS = 5 * 60_000;
export const JOB_RETENTION_MS = 60 * 60_000;

export interface ChatJob {
  id: string;
  requestId: string;
  tokenHash: string;
  model: string;
  startedAt: number;
  updatedAt: number;
  expiresAt: number;
  status: 'queued' | 'running' | 'complete' | 'error';
  content: string;
  generationId?: string;
  finishReason?: string;
  error?: ChatErrorInfo;
}

export interface ChatJobSubmission {
  jobId: string;
  model: string;
  apiKey: string;
}

export interface ChatJobInput {
  messages: Array<{ role: string; content: string }>;
  expiresAt: number;
}

export function chatJobStore() {
  return getStore({ name: 'chat-jobs', consistency: 'strong' });
}

export function chatJobInputStore() {
  return getStore({ name: 'chat-job-inputs', consistency: 'strong' });
}

export function hashJobToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function tokenMatches(token: string, expectedHash: string) {
  const actual = Buffer.from(hashJobToken(token), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function publicJob(job: ChatJob) {
  const { tokenHash: _tokenHash, model: _model, ...visible } = job;
  void _tokenHash;
  void _model;
  return visible;
}
