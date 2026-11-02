'use client';

import { Accordion } from '@/components/ui/Accordion';
import { ReflectionQuestions } from './ReflectionQuestions';
import { QualityChecklist } from './QualityChecklist';
import { FailureModeAlert } from './FailureModeAlert';
import { SideBySideComparison } from './SideBySideComparison';
import type { EvaluationTools, ChecklistState } from '@/lib/types';

interface EvaluatePhaseProps {
  evaluationTools: EvaluationTools;
  checklistState: ChecklistState;
  onToggleChecklist: (itemId: string) => void;
  previousOutput?: string;
  currentOutput?: string;
  iterationNumber: number;
}

export function EvaluatePhase({
  evaluationTools,
  checklistState,
  onToggleChecklist,
  previousOutput,
  currentOutput,
  iterationNumber,
}: EvaluatePhaseProps) {
  const showComparison = iterationNumber > 1 && previousOutput && currentOutput;

  const accordionItems = [
    {
      id: 'reflection',
      title: 'Reflection Questions',
      content: (
        <ReflectionQuestions
          questions={evaluationTools.reflectionQuestions}
        />
      ),
    },
    {
      id: 'checklist',
      title: 'Quality Checklist',
      content: (
        <QualityChecklist
          items={evaluationTools.checklist}
          checklistState={checklistState}
          onToggle={onToggleChecklist}
        />
      ),
    },
    {
      id: 'failure-modes',
      title: 'Failure Mode Alerts',
      content: (
        <div className="space-y-3">
          {evaluationTools.failureModes.map((fm) => (
            <FailureModeAlert key={fm.id} failureMode={fm} />
          ))}
        </div>
      ),
    },
  ];

  if (showComparison) {
    accordionItems.splice(1, 0, {
      id: 'comparison',
      title: 'Side-by-Side Comparison',
      content: (
        <SideBySideComparison
          previousOutput={previousOutput}
          currentOutput={currentOutput}
          previousLabel={`Iteration ${iterationNumber - 1}`}
          currentLabel={`Iteration ${iterationNumber}`}
        />
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-guard-blue-800 mb-1">
          Evaluate the Response
        </h3>
        <p className="text-xs text-guard-blue-500">
          Critically examine the AI&apos;s output using the tools below. Consider
          what works, what doesn&apos;t, and what assumptions the AI made.
        </p>
      </div>

      <Accordion
        defaultOpen="reflection"
        items={accordionItems}
      />
    </div>
  );
}
