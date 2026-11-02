import type { Metadata } from "next";
import { modules, stages } from "@/content/journey";
import { MapModule } from "@/components/map-module";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.map.title };

export default function MapPage() {
  const firstAvailable = modules.find((m) => m.status === "available");
  return (
    <div>
      <h1 className="text-3xl font-semibold">{t.map.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.map.sessionNote}</p>
      <div className="mt-6 space-y-8">
        {stages.map((stage) => (
          <section key={stage.id} aria-labelledby={`stage-${stage.id}`}>
            <h2 id={`stage-${stage.id}`} className="text-xl font-medium">{stage.title}</h2>
            <p className="text-sm text-muted">{stage.question}</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {modules.filter((m) => m.stage === stage.id).map((m) => (
                <MapModule key={m.id} module={m} recommended={m.id === firstAvailable?.id} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
