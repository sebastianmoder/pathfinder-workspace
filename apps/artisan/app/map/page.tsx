import type { Metadata } from "next";
import { missions } from "@/content/missions";
import { PathMap } from "@/components/path/path-map";
import type { MissionInfoMap } from "@/components/path/mission-card";
import { ownScreen } from "@/lib/phases";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.map.title };

export default function MapPage() {
  // What each mission card says, worked out here so the map doesn't load every mission's content.
  const info: MissionInfoMap = Object.fromEntries(
    missions.map((m) => {
      const debrief = m.steps.find((s) => s.kind === "debrief");
      const steps = ownScreen(m.steps).filter((own, i) => own && !m.steps[i].showIf).length;
      return [m.id, { title: m.title, steps, skills: debrief?.kind === "debrief" ? debrief.skills.map((s) => s.label) : [] }];
    }),
  );
  return (
    <div>
      <h1 className="text-4xl">{t.map.title}</h1>
      <p className="mt-2 max-w-2xl">{t.map.intro}</p>
      <div className="mt-6">
        <PathMap info={info} />
      </div>
    </div>
  );
}
