export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-guard-blue-300 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-guard-blue-300 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-guard-blue-300 animate-bounce" />
      </div>
      <span className="text-xs text-guard-blue-400">AI is thinking...</span>
    </div>
  );
}
