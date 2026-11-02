import type { Config } from '@netlify/functions';
import { chatJobInputStore, chatJobStore, type ChatJob } from '../../lib/chatJobs';

export const config: Config = { schedule: '@hourly' };

export default async function handler() {
  const store = chatJobStore();
  const inputStore = chatJobInputStore();
  const startedAt = Date.now();
  let deleted = 0;
  for await (const page of store.list({ paginate: true })) {
    for (const entry of page.blobs) {
      const job = await store.get(entry.key, { type: 'json' }) as ChatJob | null;
      if (job && job.expiresAt <= Date.now()) {
        await store.delete(entry.key);
        await inputStore.delete(entry.key);
        deleted += 1;
      }
      // Scheduled functions have a 30 second limit; the next run resumes cleanup.
      if (Date.now() - startedAt > 25_000) {
        console.info({ event: 'chat_job_cleanup', deleted, partial: true });
        return;
      }
    }
  }
  // Remove orphaned inputs left by a failed submission or worker invocation.
  for await (const page of inputStore.list({ paginate: true })) {
    for (const entry of page.blobs) {
      const input = await inputStore.get(entry.key, { type: 'json' }) as { expiresAt?: number } | null;
      if (input?.expiresAt && input.expiresAt <= Date.now()) {
        await inputStore.delete(entry.key);
        deleted += 1;
      }
      if (Date.now() - startedAt > 25_000) {
        console.info({ event: 'chat_job_cleanup', deleted, partial: true });
        return;
      }
    }
  }
  console.info({ event: 'chat_job_cleanup', deleted, partial: false });
}
