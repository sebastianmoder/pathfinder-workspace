"use client";

import Link from "next/link";
import { modules } from "@/content/journey";
import { getMission } from "@/content/missions";
import { defaultSelection, entryMission } from "@/lib/journey-nav";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

const FIRST = "m01-foundations";

/** Start goes straight into the first mission. A returning learner gets their next mission instead. */
export function HomeActions() {
  const session = useSession();
  const progress = {
    completed: session.completedIds,
    inProgress: (id: string) => !session.isCompleted(id) && session.progress(id).stepIndex > 0,
    reached: session.reached,
  };
  const returning = session.completedIds.length > 0 || modules.some((m) => m.missionIds.some(progress.inProgress));
  const target = returning ? entryMission(defaultSelection(modules, progress), progress) : FIRST;
  const title = getMission(target)?.title ?? "";
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link href={`/missions/${target}`} prefetch={true} className="btn btn-on-mat">
        {returning ? t.welcome.resume(title) : t.welcome.start}
      </Link>
      <Link href="/map" className="btn btn-outline-on-mat">{t.welcome.map}</Link>
    </div>
  );
}
