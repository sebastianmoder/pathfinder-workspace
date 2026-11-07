import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { missions, getMission } from "@/content/missions";
import { findModuleForMission, modules } from "@/content/journey";
import { MissionRunner, type PathEntry } from "@/components/mission-runner";
import { t } from "@/lib/i18n/en";

export function generateStaticParams() {
  return missions.map((m) => ({ missionId: m.id }));
}

export async function generateMetadata(props: PageProps<"/missions/[missionId]">): Promise<Metadata> {
  const { missionId } = await props.params;
  return { title: getMission(missionId)?.title ?? t.mission.missionFallback };
}

/**
 * The mission depends on the URL, which the shared App Shell for client navigations can't know. Reading it
 * inside a Suspense boundary keeps that shell instant; every mission is still prerendered for direct loads,
 * and links into missions prefetch their content so the placeholder is rarely seen.
 */
export default function MissionPage(props: PageProps<"/missions/[missionId]">) {
  return (
    <Suspense fallback={<p role="status" className="text-muted">{t.mission.opening}</p>}>
      <Mission params={props.params} />
    </Suspense>
  );
}

async function Mission({ params }: { params: PageProps<"/missions/[missionId]">["params"] }) {
  const { missionId } = await params;
  const mission = getMission(missionId);
  const moduleEntry = findModuleForMission(missionId);
  if (!mission || !moduleEntry) notFound();

  // The debrief's suggestion; the runner swaps it for the first unfinished mission if it's already done.
  const debrief = mission.steps.find((s) => s.kind === "debrief");
  const suggested = debrief?.kind === "debrief" ? debrief.nextMissionId : null;
  // Titles for the path, so the runner can name any next mission without loading every mission's content.
  const path: PathEntry[] = modules.flatMap((m) =>
    m.status === "available" ? m.missionIds.map((id) => ({ missionId: id, title: getMission(id)?.title ?? m.title, moduleId: m.id })) : [],
  );

  return <MissionRunner mission={mission} module={moduleEntry} suggested={suggested} path={path} />;
}
