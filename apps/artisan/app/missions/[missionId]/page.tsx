import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { missions, getMission } from "@/content/missions";
import { modules } from "@/content/journey";
import { passwordForMission } from "@/lib/passwords";
import { MissionRunner } from "@/components/mission-runner";
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
  const password = mission && passwordForMission(mission.id);
  if (!mission || !password) notFound();

  // Next recommended available mission, if the debrief names one.
  const debrief = mission.steps.find((s) => s.kind === "debrief");
  const nextId = debrief?.kind === "debrief" ? debrief.nextMissionId : null;
  const nextMission = nextId ? getMission(nextId) : undefined;
  const nextPassword = nextMission && passwordForMission(nextMission.id);
  const next =
    nextMission && nextPassword && modules.some((m) => m.status === "available" && m.missionIds.includes(nextMission.id))
      ? { missionId: nextMission.id, title: nextMission.title, password: nextPassword }
      : null;

  return <MissionRunner mission={mission} password={password} next={next} />;
}
