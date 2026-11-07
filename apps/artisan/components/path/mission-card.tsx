"use client";

import { useState } from "react";
import Link from "next/link";
import type { ModuleEntry } from "@/content/types";
import { stages } from "@/content/journey";
import { entryMission, type NodeState, type Progress } from "@/lib/journey-nav";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

export interface MissionInfo {
  title: string;
  steps: number;
  /** What the debrief can recognise, in the learner's words. */
  skills: string[];
}
export type MissionInfoMap = Record<string, MissionInfo>;

/**
 * The selected stop: what the mission is, what it practises, and the one action that opens it. Beside the map on
 * wide screens; on narrow ones it rides along the bottom of the window, with its details folded.
 */
export function MissionCard({ id, module: m, info, progress, state }: { id: string; module: ModuleEntry; info: MissionInfoMap; progress: Progress; state: NodeState }) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const stageIndex = stages.findIndex((s) => s.id === m.stage);
  const stage = stages[stageIndex];
  const target = entryMission(m, progress);
  const parts = m.missionIds.length > 1 ? m.missionIds : [];
  const steps = m.missionIds.reduce((n, mid) => n + (info[mid]?.steps ?? 0), 0);
  const skills = [...new Set(m.missionIds.flatMap((mid) => info[mid]?.skills ?? []))].slice(0, 4);
  const targetDone = session.isCompleted(target);
  const targetActive = progress.inProgress(target);
  const reached = !targetDone && !targetActive ? session.reached(target) : undefined;
  const action = targetActive ? t.card.resume : targetDone ? t.card.replay : reached ? t.card.startAgain : t.card.start;
  const partState = (mid: string) =>
    session.isCompleted(mid) ? "done" : progress.inProgress(mid) ? "active" : session.reached(mid) ? "reached" : "open";

  return (
    <aside id={id} aria-label={t.card.label} className="mission-card sheet" data-state={state}>
      <p className="text-sm text-muted">
        {m.bridge ? `${t.map.stageShort(stageIndex + 1)}, ${t.map.bridge.toLowerCase()}` : stage.id === "capstone" ? t.map.capstone : t.map.stage(stageIndex + 1, stage.title)}
      </p>
      <h2 className="mt-0.5 text-2xl" aria-live="polite">{m.title}</h2>
      <div className={`${open ? "block" : "hidden"} lg:block`} id={`${id}-details`}>
        <p className="mt-2">{m.summary}</p>
        {skills.length > 0 && (
          <>
            <h3 className="mt-3 text-sm font-bold">{t.card.practise}</h3>
            <ul className="card-skills mt-1 space-y-0.5 text-sm">
              {skills.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </>
        )}
      </div>
      {parts.length > 0 ? (
        <>
          <p className="mt-3 text-sm text-muted">{m.stage === "capstone" ? t.card.chapters(parts.length) : t.card.parts(parts.length)}</p>
          <ol className="card-parts mt-1 space-y-1 text-sm">
            {parts.map((mid) => {
              const ps = partState(mid);
              return (
                <li key={mid} className="card-part" data-state={ps}>
                  <Link
                    href={`/missions/${mid}`}
                    prefetch={true}
                    className="underline underline-offset-4"
                    onClick={() => { if (session.isCompleted(mid)) session.restart(mid); }}
                  >
                    {info[mid]?.title}
                  </Link>
                  {ps !== "open" && <span className="text-muted"> ({t.card.partState[ps]})</span>}
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <p className="mt-3 hidden text-sm text-muted lg:block">{t.card.steps(steps)}</p>
      )}
      {reached && <p className="mt-2 text-sm">{t.card.reachedNote(reached[0], reached[1])}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href={`/missions/${target}`}
          prefetch={true}
          className="btn btn-primary"
          aria-label={`${action}: ${m.title}`}
          onClick={() => { if (targetDone) session.restart(target); }}
        >
          {action}
        </Link>
        <button
          type="button"
          className="text-sm underline underline-offset-4 lg:hidden"
          aria-expanded={open}
          aria-controls={`${id}-details`}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? t.card.hideDetails : t.card.details}
        </button>
      </div>
    </aside>
  );
}
