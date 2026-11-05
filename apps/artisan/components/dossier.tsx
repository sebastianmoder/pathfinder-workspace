"use client";

import type { DossierSection, Step } from "@/content/types";
import { getMission } from "@/content/missions";
import { itemKey } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

/** The lines a section shows from what its chapter recorded this visit, or null if nothing was recorded. */
function fromSession(section: DossierSection, facts: Record<string, string[]>): string[] | null {
  if (!section.source) return null;
  const step: Step | undefined = getMission(section.missionId)?.steps.find((s) => s.id === section.source!.stepId);
  if (!step) return null;
  const { kind } = section.source;
  const values = facts[itemKey(step.id, kind === "roles" ? "roles" : kind === "arrangement" ? "arrangement" : "plan")];
  if (!values?.length) return null;
  if (kind === "roles" && "delegation" in step) {
    return values.map((v) => {
      const [taskId, role] = v.split(":") as [string, keyof typeof t.delegation.roles];
      const task = step.delegation.tasks.find((x) => x.id === taskId);
      return `${task?.title}: ${t.delegation.roles[role].label}`;
    });
  }
  if (kind === "arrangement" && "workflow" in step) {
    return values.map((v) => {
      const [slotId, optionId] = v.split(":");
      const slot = step.workflow.slots.find((x) => x.id === slotId);
      return `${slot?.label}: ${slot?.options.find((o) => o.id === optionId)?.label}`;
    });
  }
  if (kind === "plan" && "allocation" in step) {
    return values.map((id) => step.allocation.options.find((o) => o.id === id)?.label ?? id);
  }
  return null;
}

/**
 * The commission's shared workspace (PRD C01): each chapter's result as this learner reached it, or the case
 * pack's version when that chapter hasn't been done this visit. Nothing here is a learner's written text.
 */
export function Dossier({ sections, currentMissionId, open }: { sections: DossierSection[]; currentMissionId: string; open: boolean }) {
  const session = useSession();
  const yours = sections.filter((s) => fromSession(s, session.progress(s.missionId).facts) || session.isCompleted(s.missionId)).length;
  return (
    <details className="no-print dossier mt-3" open={open}>
      <summary className="cursor-pointer">
        <span className="font-bold">{t.dossier.title}</span> <span className="text-sm text-muted">{t.dossier.count(yours, sections.length)}</span>
      </summary>
      <p className="mt-1 text-sm text-muted">{t.dossier.intro}</p>
      <ol className="mt-3 grid gap-3 md:grid-cols-2">
        {sections.map((section) => {
          const progress = session.progress(section.missionId);
          const own = fromSession(section, progress.facts);
          const done = session.isCompleted(section.missionId);
          const here = section.missionId === currentMissionId;
          const lines = own ?? section.prepared;
          const status = own ? t.dossier.yours : done ? t.dossier.checked : here ? t.dossier.thisChapter : t.dossier.prepared;
          return (
            <li key={section.id} className={`dossier-section ${own || done ? "dossier-own" : ""}`}>
              <p className="font-bold">{section.title}</p>
              <p className="text-sm text-muted">{status}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {lines.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
