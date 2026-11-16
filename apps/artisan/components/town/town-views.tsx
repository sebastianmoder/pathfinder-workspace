"use client";

import { useState } from "react";
import { t } from "@/lib/i18n/en";
import type { MissionInfoMap } from "@/components/path/mission-card";
import { CaseFile } from "./case-file";
import { TownMap } from "./town-map";

/** The two ways of looking at the year so far: where the cases are, and what they have left in the file. */
export function TownViews({ info }: { info: MissionInfoMap }) {
  const [view, setView] = useState<"map" | "file">("map");
  return (
    <>
      <div className="view-tabs mt-5" role="group" aria-label={t.town.views}>
        <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>{t.town.viewMap}</button>
        <button type="button" aria-pressed={view === "file"} onClick={() => setView("file")}>{t.town.viewFile}</button>
      </div>
      <div className="mt-5">{view === "map" ? <TownMap info={info} /> : <CaseFile />}</div>
    </>
  );
}
