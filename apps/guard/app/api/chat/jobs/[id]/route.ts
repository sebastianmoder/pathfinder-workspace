import { chatJobStore, publicJob, tokenMatches, type ChatJob } from '@/lib/chatJobs';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token || !/^[\da-f-]{36}$/.test(id)) {
    return Response.json({ error: 'Job not found' }, { status: 404 });
  }

  try {
    const store = chatJobStore();
    const job = await store.get(id, { type: 'json' }) as ChatJob | null;
    if (!job || !tokenMatches(token, job.tokenHash)) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.expiresAt <= Date.now()) {
      await store.delete(id);
      return Response.json({ error: 'Job expired' }, { status: 410 });
    }
    return Response.json(publicJob(job), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error({ event: 'chat_job_poll_error', jobId: id, error });
    return Response.json({ error: 'Job status is temporarily unavailable' }, { status: 503 });
  }
}
