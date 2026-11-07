"use client";

import Link from "next/link";
import type { Mission, ModuleEntry } from "@/content/types";
import { findModuleForMission, modules, stages } from "@/content/journey";
import { nextMission, nodeState, stageDone } from "@/lib/journey-nav";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { Eyelet } from "./path/eyelet";
import { useProgress } from "./path/path-map";
import type { PathEntry } from "./mission-runner";

/** The debrief's way on: this stage's stretch of the route, the next stop, and the way back to the map. */
export function NextOnPath({ mission, module: m, suggested, path }: { mission: Mission; module: ModuleEntry; suggested: string | null; path: PathEntry[] }) {
  const session = useSession();
  const progress = useProgress();
  const stageIndex = stages.findIndex((s) => s.id === m.stage);
  const stage = stages[stageIndex];
  const stretch = modules.filter((x) => x.status === "available" && x.stage === m.stage);
  const nextId = nextMission(modules, mission.id, suggested, session.completedIds);
  const next = nextId ? path.find((p) => p.missionId === nextId) : undefined;
  const nextModule = nextId ? findModuleForMission(nextId) : undefined;
  // The last chapter ends the path. Anything left unfinished is offered as still open, not as "next".
  const atEnd = suggested === null;
  const finishedStage = stage.id !== "capstone" && stageDone(modules, stage.id, session.completedIds);

  return (
    <section aria-labelledby="next-on-path" className="next-on-path mt-8">
      <h3 id="next-on-path" className="text-xl font-bold">{!next ? t.debrief.pathDone : atEnd ? t.debrief.endReached : t.debrief.next}</h3>
      {stretch.length > 1 && (
        <ol className="strip mt-3" aria-label={stage.id === "capstone" ? t.map.capstone : t.map.stage(stageIndex + 1, stage.title)}>
          {stretch.map((x) => {
            const state = nodeState(x, modules, progress);
            return (
              <li key={x.id} aria-current={x.id === m.id ? "step" : undefined} data-state={state}>
                <Eyelet state={state} bridge={x.bridge} size="sm" />
                <span className="strip-title">{x.title}</span>
                <span className="sr-only">, {t.map.state[state]}</span>
              </li>
            );
          })}
        </ol>
      )}
      {finishedStage && <p className="mt-3 font-bold">{t.debrief.stageDone(stageIndex + 1, stage.title)}</p>}
      {next && (
        <div className="mt-4 max-w-2xl">
          {atEnd && <p className="text-sm text-muted">{t.debrief.stillOpen}</p>}
          <p className="text-lg font-bold">{next.title}</p>
          {nextModule && <p className="mt-0.5">{nextModule.summary}</p>}
          <Link href={`/missions/${next.missionId}`} prefetch={true} className="mt-3 inline-block btn btn-primary">
            {t.debrief.start(next.title)}
          </Link>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href="/map" onClick={() => session.setArrival(mission.id)} className="underline underline-offset-4">{t.debrief.backToMap}</Link>
        <button type="button" onClick={() => session.restart(mission.id)} className="underline underline-offset-4">{t.debrief.replay}</button>
        <Link href="/summary" className="underline underline-offset-4">{t.debrief.summary}</Link>
      </div>
    </section>
  );
}
