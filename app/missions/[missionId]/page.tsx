import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { missions, getMission } from "@/content/missions";
import { modules } from "@/content/journey";
import { passwordForMission } from "@/lib/passwords";
import { MissionRunner } from "@/components/mission-runner";

export function generateStaticParams() {
  return missions.map((m) => ({ missionId: m.id }));
}

export async function generateMetadata(props: PageProps<"/missions/[missionId]">): Promise<Metadata> {
  const { missionId } = await props.params;
  return { title: getMission(missionId)?.title ?? "Mission" };
}

export default async function MissionPage(props: PageProps<"/missions/[missionId]">) {
  const { missionId } = await props.params;
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
