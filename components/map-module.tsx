"use client";

import Link from "next/link";
import type { ModuleEntry } from "@/content/types";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

export function MapModule({ module, availableInOrder }: { module: ModuleEntry; availableInOrder: ModuleEntry[] }) {
  const { isCompleted } = useSession();
  const recommended = availableInOrder.find((m) => !m.missionIds.every(isCompleted))?.id === module.id;
  const available = module.status === "available";
  const done = available && module.missionIds.every(isCompleted);

  return (
    <li className={`rounded-lg border p-4 ${available ? "border-border bg-surface" : "border-dashed border-border"}`}>
      <p className="text-xs font-mono text-muted">{module.id}</p>
      <h3 className="font-medium">{module.title}</h3>
      <p className="mt-1 text-sm">{module.summary}</p>
      <p className="mt-2 text-sm">
        {/* Status uses text + symbol, never colour alone. */}
        <span aria-hidden="true">{available ? "●" : "○"} </span>
        {available ? t.map.available : t.map.planned}
        {done && <> · <span aria-hidden="true">✔ </span>{t.map.completed}</>}
        {recommended && !done && <> · {t.map.recommended}</>}
      </p>
      {available && (
        <Link href={`/missions/${module.missionIds[0]}`} className="mt-3 inline-block rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
          {t.map.play}<span className="sr-only">: {module.title}</span>
        </Link>
      )}
    </li>
  );
}
