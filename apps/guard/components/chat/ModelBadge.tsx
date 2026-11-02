interface ModelBadgeProps {
  model: string;
}

export function ModelBadge({ model }: ModelBadgeProps) {
  return (
    <span className="text-xs text-guard-blue-400 bg-guard-blue-50 px-2 py-1 rounded-full">
      {model}
    </span>
  );
}
