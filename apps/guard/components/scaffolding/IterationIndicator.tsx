import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface IterationIndicatorProps {
  currentIteration: number;
  totalIterations: number;
  title: string;
  isOptional?: boolean;
  className?: string;
}

export function IterationIndicator({
  currentIteration,
  totalIterations,
  title,
  isOptional,
  className,
}: IterationIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs font-medium text-guard-blue-500">
        Iteration {currentIteration} of {totalIterations}
      </span>
      <span className="text-guard-blue-300" aria-hidden="true">—</span>
      <span className="text-xs font-medium text-guard-blue-700">{title}</span>
      {isOptional && (
        <Badge variant="default">Optional</Badge>
      )}
    </div>
  );
}
