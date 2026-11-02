import type { Metadata } from "next";
import { modules, stages } from "@/content/journey";
import { MapModule } from "@/components/map-module";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.map.title };

export default function MapPage() {
  const availableInOrder = modules.filter((m) => m.status === "available");
  return (
    <div>
      <h1 className="text-4xl">{t.map.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t.map.sessionNote}</p>
      <div className="mt-8">
        {stages.map((stage, i) => (
          <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="border-t-2 border-foreground py-6 lg:grid lg:grid-cols-[1fr_2fr] lg:gap-8">
            <div>
              <h2 id={`stage-${stage.id}`} className="text-2xl">
                {stage.id === "capstone" ? stage.title : t.map.stage(i + 1, stage.title)}
              </h2>
              <p className="mt-1 text-muted">{stage.question}</p>
            </div>
            <ul className="mt-4 space-y-2 lg:mt-0">
              {modules.filter((m) => m.stage === stage.id).map((m) => (
                <MapModule key={m.id} module={m} availableInOrder={availableInOrder} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
