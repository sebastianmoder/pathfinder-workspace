import { notFound } from 'next/navigation';
import { LabHeader } from '@/components/layout/LabHeader';
import { LabWorkspace } from '@/components/lab/LabWorkspace';
import { getLabMeta } from '@/content/labs';
import type { LabId } from '@/lib/types';

const validLabIds: LabId[] = [
  'activity-planning',
  'assessment-creation',
  'rubric-design',
  'curriculum-revision',
  'assignment-ai-resilience',
];

interface LabPageProps {
  params: Promise<{ labId: string }>;
}

export default async function LabPage({ params }: LabPageProps) {
  const { labId } = await params;

  if (!validLabIds.includes(labId as LabId)) {
    notFound();
  }

  const labMeta = getLabMeta(labId);
  if (!labMeta) {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <LabHeader labTitle={labMeta.title} />
      <div className="flex-1 overflow-hidden">
        <LabWorkspace labId={labId as LabId} />
      </div>
    </div>
  );
}
