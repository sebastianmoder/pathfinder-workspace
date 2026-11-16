"use client";

import Link from "next/link";
import { modules } from "@/content/journey";
import { getMission } from "@/content/missions";
import { defaultSelection, entryMission } from "@/lib/journey-nav";
import { useSession } from "@/lib/session/session";
import { useProgress } from "@/lib/session/use-progress";
import { t } from "@/lib/i18n/en";
import { LoadSave } from "./save-controls";
import { hasTitleArt, TitleArt } from "./story/art";

const FIRST = "m01-foundations";

/**
 * The title screen: the file itself, and the way in. A new game goes straight to the first case, whose
 * opening scenes are the introduction. A returning player gets the case they were on.
 */
export function TitleScreen() {
  const session = useSession();
  const progress = useProgress();
  const returning = session.completedIds.length > 0 || modules.some((m) => m.missionIds.some(progress.inProgress));
  const target = returning ? entryMission(defaultSelection(modules, progress), progress) : FIRST;
  const title = getMission(target)?.title ?? "";
  return (
    <div className="title-screen mat full-bleed">
      <div className="title-inner">
        <div className="folder">
          <p className="folder-tab">{t.title.tab}</p>
          <div className="folder-body">
            <h1 className="title-name">{t.appName}</h1>
            <p className="title-lead">{t.title.lead}</p>
            <p className="mt-3 max-w-md">{t.title.pitch}</p>
            <p className="mt-2 max-w-md text-sm">{t.title.time}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/missions/${target}`} prefetch={true} className="btn btn-primary">
                {returning ? t.title.resume(title) : t.title.newGame}
              </Link>
              <Link href="/map" className="btn btn-secondary">{t.title.map}</Link>
            </div>
            <LoadSave className="mt-5" />
          </div>
        </div>
        {hasTitleArt && (
          <div className="title-picture">
            <TitleArt />
          </div>
        )}
      </div>
    </div>
  );
}
