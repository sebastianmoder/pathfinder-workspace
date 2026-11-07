"use client";

import { useEffect, useId, useState } from "react";
import type { ModuleEntry } from "@/content/types";
import { findModuleForMission, modules, stages } from "@/content/journey";
import { defaultSelection, moduleDone, nodeState, seals, type NodeState, type Progress } from "@/lib/journey-nav";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { Eyelet, Seal } from "./eyelet";
import { MissionCard, type MissionInfoMap } from "./mission-card";

/** Eyelet centres across a sheet, as a share of its width. The route zigzags between them; right-hand names sit to the left. */
const COLUMNS = [12, 80];
/** Where the route crosses the mat between sheets: left of centre, so a bridge's name has room beside it. */
const SEAM = 28;
const ROW = 10; // SVG units per row; a row is 5.25rem tall in CSS

const available = modules.filter((m) => m.status === "available");

export function useProgress(): Progress {
  const session = useSession();
  return {
    completed: session.completedIds,
    inProgress: (id) => !session.isCompleted(id) && session.progress(id).stepIndex > 0,
    reached: session.reached,
  };
}

/**
 * The journey as one route stitched across the cutting mat: a sheet per stage, the bridge challenges on the seams
 * between sheets, and the commission at the end. Choosing a stop shows its mission card; the card starts it.
 */
export function PathMap({ info }: { info: MissionInfoMap }) {
  const session = useSession();
  const progress = useProgress();
  const cardId = useId();
  const [chosen, setChosen] = useState<string | null>(null);
  const selected = available.find((m) => m.id === chosen) ?? defaultSelection(modules, progress);

  // The one arrival moment: the stop just finished is stamped and the route to the next one is drawn.
  const arrival = session.arrival ? findModuleForMission(session.arrival)?.id ?? null : null;
  const { setArrival } = session;
  useEffect(() => {
    if (!arrival) return;
    const timer = window.setTimeout(() => setArrival(null), 1800);
    return () => window.clearTimeout(timer);
  }, [arrival, setArrival]);

  const state = (m: ModuleEntry) => nodeState(m, modules, progress);
  const done = (m: ModuleEntry | undefined) => !!m && moduleDone(m, progress.completed);
  const node = (m: ModuleEntry, extra?: { bridge?: boolean }) => (
    <Stop
      module={m}
      state={state(m)}
      bridge={extra?.bridge}
      selected={selected.id === m.id}
      arriving={arrival === m.id}
      controls={cardId}
      onSelect={() => setChosen(m.id)}
      reached={m.missionIds.map(session.reached).find(Boolean)}
    />
  );

  const capstone = available.find((m) => m.stage === "capstone");
  const filled = seals(modules, progress.completed);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-8">
      <div className="path-mat mat">
        {stages.map((stage, si) => {
          if (stage.id === "capstone") {
            if (!capstone) return null;
            return (
              <section key="capstone" aria-labelledby="stage-capstone" className="path-sheet path-capstone sheet" data-tilt={si % 2}>
                <h2 id="stage-capstone" className="path-stage-title">{t.map.capstone}</h2>
                <p className="path-stage-question">{stage.question}</p>
                <div className="route route-capstone">
                  <svg className="route-line" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                    <Segment d={`M ${SEAM} 0 C ${SEAM} 2, 50 1, 50 3`} done={done(available.findLast((m) => m.stage === 4))} />
                  </svg>
                  <ol className="route-stops">
                    <li style={{ "--x": "50%", "--row": 0 } as React.CSSProperties} className="route-stop route-stop-center">
                      <button
                        type="button"
                        className="stop"
                        aria-pressed={selected.id === capstone.id}
                        aria-controls={cardId}
                        onClick={() => setChosen(capstone.id)}
                      >
                        <Seal filled={filled} state={state(capstone)} />
                        <span className="stop-text">
                          <span className="stop-title">{capstone.title}</span>
                          <span className="stop-state">{t.map.seals(filled.filter(Boolean).length)}</span>
                          <StateLine state={state(capstone)} />
                        </span>
                      </button>
                    </li>
                  </ol>
                  <ul className="sr-only">
                    {filled.map((on, i) => <li key={i}>{t.map.sealLabel(i + 1, on)}</li>)}
                  </ul>
                </div>
              </section>
            );
          }
          const stops = available.filter((m) => m.stage === stage.id && !m.bridge);
          const bridge = available.find((m) => m.stage === stage.id && m.bridge);
          const prevBridge = si > 0 ? available.find((m) => m.stage === stages[si - 1].id && m.bridge) : undefined;
          const prevLast = si > 0 ? available.findLast((m) => m.stage === stages[si - 1].id && !m.bridge) : undefined;
          const h = stops.length * ROW;
          const at = (i: number) => ({ x: COLUMNS[i % 2], y: i * ROW + ROW / 2 });
          const curve = (a: { x: number; y: number }, b: { x: number; y: number }) =>
            `M ${a.x} ${a.y} C ${a.x} ${a.y + ROW * 0.6}, ${b.x} ${b.y - ROW * 0.6}, ${b.x} ${b.y}`;
          const last = stops[stops.length - 1];
          return (
            <div key={stage.id} className="contents">
              <section aria-labelledby={`stage-${stage.id}`} className="path-sheet sheet" data-tilt={si % 2}>
                <h2 id={`stage-${stage.id}`} className="path-stage-title">{t.map.stage(si + 1, stage.title)}</h2>
                <p className="path-stage-question">{stage.question}</p>
                <div className="route" style={{ "--rows": stops.length } as React.CSSProperties}>
                  <svg className="route-line" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true">
                    {si > 0 && <Segment d={curve({ x: SEAM, y: 0 }, at(0))} done={done(prevBridge ?? prevLast)} />}
                    {stops.slice(1).map((m, i) => (
                      <Segment key={m.id} d={curve(at(i), at(i + 1))} done={done(stops[i])} draw={arrival === stops[i].id} />
                    ))}
                    <Segment d={curve(at(stops.length - 1), { x: SEAM, y: h })} done={done(last)} draw={arrival === last.id} />
                  </svg>
                  <ol className="route-stops">
                    {stops.map((m, i) => (
                      <li key={m.id} className="route-stop" data-side={i % 2 ? "right" : "left"} style={{ "--x": `${at(i).x}%`, "--row": i } as React.CSSProperties}>
                        {node(m)}
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
              <div className={`seam ${bridge ? "" : "seam-plain"}`}>
                <svg className="seam-line" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true">
                  <Segment d={bridge ? "M 5 0 L 5 50" : "M 5 0 L 5 100"} done={done(last)} />
                  {bridge && <Segment d="M 5 50 L 5 100" done={done(bridge)} draw={arrival === bridge.id} />}
                </svg>
                {bridge && (
                  <div className="seam-stop">
                    {node(bridge, { bridge: true })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <p className="path-note">{t.map.deviceNote}</p>
      </div>
      <MissionCard id={cardId} module={selected} info={info} progress={progress} state={state(selected)} />
    </div>
  );
}

function Segment({ d, done, draw }: { d: string; done: boolean; draw?: boolean }) {
  return <path d={d} className="route-seg" data-done={done} data-draw={draw || undefined} />;
}

function StateLine({ state, reached }: { state: NodeState; reached?: [number, number] }) {
  if (state === "open") return null;
  const text =
    state === "next" ? t.map.nextTag
    : state === "active" ? t.map.resumeTag
    : state === "reached" && reached ? t.mission.step(reached[0], reached[1])
    : t.map.state[state];
  return <span className="stop-state" data-state={state}>{text.charAt(0).toUpperCase() + text.slice(1)}</span>;
}

function Stop({
  module: m,
  state,
  bridge,
  selected,
  arriving,
  controls,
  onSelect,
  reached,
}: {
  module: ModuleEntry;
  state: NodeState;
  bridge?: boolean;
  selected: boolean;
  arriving: boolean;
  controls: string;
  onSelect: () => void;
  reached?: [number, number];
}) {
  return (
    <button type="button" className="stop" aria-pressed={selected} aria-controls={controls} data-arrive={arriving || undefined} onClick={onSelect}>
      <Eyelet state={state} bridge={bridge} />
      <span className="stop-text">
        {bridge && <span className="stop-kind">{t.map.bridge}</span>}
        <span className="stop-title">{m.title}</span>
        <StateLine state={state} reached={reached} />
        {state === "open" && <span className="sr-only">, {t.map.state.open}</span>}
      </span>
    </button>
  );
}
