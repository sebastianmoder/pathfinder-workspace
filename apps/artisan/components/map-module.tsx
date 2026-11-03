"use client";

import Link from "next/link";
import type { ModuleEntry } from "@/content/types";
import { useSession } from "@/lib/session/session";
import { getMission } from "@/content/missions";
import { t } from "@/lib/i18n/en";

export function MapModule({ module, availableInOrder }: { module: ModuleEntry; availableInOrder: ModuleEntry[] }) {
  const { isCompleted } = useSession();
  const recommended = availableInOrder.find((m) => !m.missionIds.every(isCompleted))?.id === module.id;
  const available = module.status === "available";
  const done = available && module.missionIds.every(isCompleted);
  const nextMission = module.missionIds.find((id) => !isCompleted(id)) ?? module.missionIds[0];
  const parts = module.missionIds.length > 1 ? module.missionIds.map((id) => ({ id, title: getMission(id)?.title ?? id })) : [];

  if (!available) {
    // Planned work reads as a quiet line with no destination, so nothing looks playable.
    return (
      <li className="px-1 py-0.5 text-muted">
        <span className="font-bold">{module.title}.</span> {module.summary}{" "}
        <span className="whitespace-nowrap"><span aria-hidden="true">○ </span>{t.map.planned}</span>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 border border-border bg-surface p-4">
      <div className="min-w-0 flex-1 basis-64">
        <h3 className="text-lg">{module.title}</h3>
        <p className="mt-0.5">{module.summary}</p>
        <p className="mt-1 text-sm">
          {done && <span className="mark-yes font-bold"><span aria-hidden="true">✔ </span>{t.map.completed}</span>}
          {recommended && (
            <span className="bg-[var(--highlighter)] px-1 font-bold text-[var(--highlighter-ink)]">{t.map.recommended}</span>
          )}
        </p>
        {parts.length > 0 && (
          <ol className="mt-2 space-y-1 text-sm">
            {parts.map((p, i) => (
              <li key={p.id}>
                {t.map.part(i + 1)}{" "}
                <Link href={`/missions/${p.id}`} className="underline">{p.title}</Link>
                {isCompleted(p.id) && <span className="mark-yes"> <span aria-hidden="true">✔ </span>{t.map.partDone}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
      <Link href={`/missions/${nextMission}`} className={`btn btn-small ${recommended ? "btn-primary" : "btn-secondary"}`}>
        {t.map.play}<span className="sr-only">: {module.title}</span>
      </Link>
    </li>
  );
}
