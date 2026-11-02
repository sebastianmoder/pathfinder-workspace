"use client";

import { useRouter } from "next/navigation";
import { useHistoryStore } from "@/stores/historyStore";
import { useLabSessionStore } from "@/stores/labSessionStore";
import { useChatStore } from "@/stores/chatStore";
import { useHasHydrated } from "@/hooks/useSessionPersistence";
import type { SessionHistoryEntry } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/constants";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface HistoryEntryCardProps {
  entry: SessionHistoryEntry;
  onResume: (entry: SessionHistoryEntry) => void;
  onDelete: (id: string) => void;
}

function HistoryEntryCard({
  entry,
  onResume,
  onDelete,
}: HistoryEntryCardProps) {
  const phaseLabel = PHASE_LABELS[entry.currentPhase] ?? entry.currentPhase;

  return (
    <div className="bg-guard-surface border border-guard-border rounded-xl p-5 flex items-start gap-4">
      {/* Status dot */}
      <div className="mt-1 shrink-0">
        <span
          className={`block w-2.5 h-2.5 rounded-full ${
            entry.isComplete ? "bg-guard-success" : "bg-guard-accent"
          }`}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-guard-blue-900 truncate">
            {entry.labTitle}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
              entry.isComplete
                ? "bg-guard-success/10 text-guard-success"
                : "bg-guard-accent/10 text-guard-accent"
            }`}
          >
            {entry.isComplete ? "Complete" : "In Progress"}
          </span>
        </div>

        <p className="text-sm text-guard-blue-500 mb-2">
          {entry.isComplete
            ? `Completed all ${entry.totalIterations} iterations`
            : `Iteration ${entry.currentIteration} of ${entry.totalIterations} · ${phaseLabel} phase`}
        </p>

        <p className="text-xs text-guard-blue-400">
          Started {formatDate(entry.startedAt)} · Last active{" "}
          {formatDate(entry.lastActivityAt)} at{" "}
          {formatTime(entry.lastActivityAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onResume(entry)}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-guard-accent text-white hover:bg-guard-accent-hover transition-colors"
        >
          {entry.isComplete ? "View" : "Resume"}
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-sm px-3 py-1.5 rounded-lg text-guard-blue-500 hover:text-guard-blue-800 hover:bg-guard-blue-50 transition-colors"
          aria-label="Delete entry"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function HistoryList() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const { entries, deleteEntry } = useHistoryStore();

  const sorted = [...entries].sort(
    (a, b) => b.lastActivityAt - a.lastActivityAt,
  );

  const handleResume = (entry: SessionHistoryEntry) => {
    useLabSessionStore.getState().restoreSession(entry.sessionSnapshot);
    useChatStore.getState().restoreMessages(entry.chatSnapshot);
    router.push(`/lab/${entry.labId}`);
  };

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-guard-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-full bg-guard-blue-50 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-guard-blue-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-guard-blue-900 mb-1">
          No sessions yet
        </h2>
        <p className="text-sm text-guard-blue-500">
          Start a lab and your progress will be saved here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((entry) => (
        <HistoryEntryCard
          key={entry.id}
          entry={entry}
          onResume={handleResume}
          onDelete={deleteEntry}
        />
      ))}
    </div>
  );
}
