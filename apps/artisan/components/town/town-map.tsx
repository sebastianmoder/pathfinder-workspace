"use client";

import { useEffect, useId, useState } from "react";
import type { ModuleEntry } from "@/content/types";
import { findModuleForMission, modules, stages } from "@/content/journey";
import { chapters } from "@/content/story";
import { defaultSelection, nodeState, type NodeState } from "@/lib/journey-nav";
import { useSession } from "@/lib/session/session";
import { useProgress } from "@/lib/session/use-progress";
import { t } from "@/lib/i18n/en";
import { Eyelet } from "@/components/path/eyelet";
import { MissionCard, type MissionInfoMap } from "@/components/path/mission-card";
import { MAP_H, MAP_W, pinOf, spots } from "./places";

const available = modules.filter((m) => m.status === "available");
export const caseNumber = (moduleId: string) => available.findIndex((m) => m.id === moduleId) + 1;

const stateText = (state: NodeState) => {
  const text = state === "next" ? t.map.nextTag : state === "active" || state === "reached" ? t.map.resumeTag : t.map.state[state];
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Riverside, with every case pinned where it happens. The list of cases is the control: choosing one shows
 * its card, which opens it. The pins on the drawing do the same for a pointer or a finger, and are left out
 * of the accessibility tree so nothing is announced twice. No case is locked.
 */
export function TownMap({ info }: { info: MissionInfoMap }) {
  const session = useSession();
  const progress = useProgress();
  const cardId = useId();
  const [chosen, setChosen] = useState<string | null>(null);
  const selected = available.find((m) => m.id === chosen) ?? defaultSelection(modules, progress);
  const state = (m: ModuleEntry) => nodeState(m, modules, progress);

  // The one arrival moment: the pin of the case just finished is stamped.
  const arrival = session.arrival ? findModuleForMission(session.arrival)?.id ?? null : null;
  const { setArrival } = session;
  useEffect(() => {
    if (!arrival) return;
    const timer = window.setTimeout(() => setArrival(null), 1800);
    return () => window.clearTimeout(timer);
  }, [arrival, setArrival]);

  return (
    <div className="town lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-x-8 lg:gap-y-6">
      <div className="town-map lg:row-span-2" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true" focusable="false" className="town-drawing">
          <path className="town-river" d={`M -2 108 C 20 102, 44 114, 66 108 S 96 104, ${MAP_W + 2} 110 L ${MAP_W + 2} 119 C 96 113, 84 121, 66 117 S 20 111, -2 117 Z`} />
          <path className="town-road" d={`M 0 28.5 H ${MAP_W} M 0 99 H ${MAP_W} M 50 23 V 34 M 72 99 V ${MAP_H}`} />
          <path className="town-bridge" d="M 69 104 V 121 M 75 104 V 121" />
          <rect className="town-commons" x="6" y="34" width="88" height="60" />
          {spots.map((s) => (
            <rect key={s.id} className="town-room" data-current={s.cases.includes(selected.id) || undefined} x={s.x} y={s.y} width={s.w} height={s.h} />
          ))}
          <path className="town-door" d="M 22 94 h 12" />
        </svg>
        {spots.map((s) => (
          <span key={s.id} className="town-label" style={{ left: `${(s.x / MAP_W) * 100}%`, top: `${(s.y / MAP_H) * 100}%`, width: `${(s.w / MAP_W) * 100}%` }}>
            {t.town.spots[s.id]}
          </span>
        ))}
        <span className="town-name" style={{ top: `${(29.6 / MAP_H) * 100}%` }}>{t.town.commons}</span>
        <span className="town-water" style={{ top: `${(109.5 / MAP_H) * 100}%` }}>{t.town.river}</span>
        <span className="town-away" style={{ top: `${(119.5 / MAP_H) * 100}%` }}>{t.town.away}</span>
        {available.map((m) => {
          const at = pinOf(m.id);
          if (!at) return null;
          return (
            <button
              key={m.id}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="town-pin"
              data-state={state(m)}
              data-selected={selected.id === m.id || undefined}
              data-arrive={arrival === m.id || undefined}
              style={{ left: `${at.left}%`, top: `${at.top}%` }}
              onClick={() => setChosen(m.id)}
            >
              {caseNumber(m.id)}
            </button>
          );
        })}
      </div>

      <div className="case-list lg:col-start-2 lg:row-start-2">
          {stages.map((stage) => {
            const inStage = available.filter((m) => m.stage === stage.id);
            if (inStage.length === 0) return null;
            const chapter = chapters.find((c) => c.stage === stage.id);
            return (
              <section key={stage.id} aria-labelledby={`${cardId}-${stage.id}`}>
                <h2 id={`${cardId}-${stage.id}`} className="case-list-chapter">{chapter?.title ?? stage.title}</h2>
                <p className="case-list-question">{stage.question}</p>
                <ol>
                  {inStage.map((m) => {
                    const st = state(m);
                    return (
                      <li key={m.id} value={caseNumber(m.id)}>
                        <button type="button" className="case-row" aria-pressed={selected.id === m.id} aria-controls={cardId} data-state={st} onClick={() => setChosen(m.id)}>
                          <span className="case-row-number" aria-hidden="true">{caseNumber(m.id)}</span>
                          <span className="case-row-title">
                            <span className="sr-only">{t.town.caseNumber(caseNumber(m.id))}: </span>
                            {m.title}
                            <span className="sr-only">.</span>
                          </span>
                          <span className="case-row-state">
                            <Eyelet state={st} bridge={m.bridge} size="sm" />
                            <span className={st === "open" ? "sr-only" : undefined}>{stateText(st)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        <p className="mt-4 text-sm text-muted">{t.map.deviceNote}</p>
      </div>
      <MissionCard id={cardId} module={selected} info={info} progress={progress} state={state(selected)} />
    </div>
  );
}
