"use client";

import { useId, useState } from "react";
import type { ModuleEntry } from "@/content/types";
import { modules, stages } from "@/content/journey";
import { chapters } from "@/content/story";
import { caseNumber, defaultSelection, nodeState, type NodeState } from "@/lib/journey-nav";
import { useProgress } from "@/lib/session/use-progress";
import { t } from "@/lib/i18n/en";
import { Eyelet } from "@/components/path/eyelet";
import { MissionCard, type MissionInfoMap } from "@/components/path/mission-card";

const available = modules.filter((m) => m.status === "available");

const stateText = (state: NodeState) => {
  const text = state === "next" ? t.map.nextTag : state === "active" || state === "reached" ? t.map.resumeTag : t.map.state[state];
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Every case, in order, by chapter. Choosing one shows what it is and the one action that opens it: beside
 * the list on a wide screen, and directly under the chosen row on a narrow one, so nothing ever covers the
 * list. No case is locked; the order is the order of the story.
 */
export function CaseList({ info }: { info: MissionInfoMap }) {
  const progress = useProgress();
  const cardId = useId();
  const [chosen, setChosen] = useState<string | null>(null);
  const selected = available.find((m) => m.id === chosen) ?? defaultSelection(modules, progress);
  const state = (m: ModuleEntry) => nodeState(m, modules, progress);

  return (
    <div className="cases">
      <div className="case-list">
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
                  const n = caseNumber(modules, m.id);
                  const current = selected.id === m.id;
                  return (
                    <li key={m.id} value={n}>
                      <button type="button" className="case-row" aria-pressed={current} data-state={st} onClick={() => setChosen(m.id)}>
                        <span className="case-row-number" aria-hidden="true">{n}</span>
                        <span className="case-row-title">
                          <span className="sr-only">{t.cases.caseNumber(n)}: </span>
                          {m.title}
                          <span className="sr-only">.</span>
                        </span>
                        <span className="case-row-state">
                          <Eyelet state={st} bridge={m.bridge} size="sm" />
                          <span className={st === "open" ? "sr-only" : undefined}>{stateText(st)}</span>
                        </span>
                      </button>
                      {current && (
                        <div className="case-inline">
                          <MissionCard id={`${cardId}-inline`} module={m} info={info} progress={progress} state={st} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
        <p className="mt-4 text-sm text-muted">{t.map.deviceNote}</p>
      </div>
      <div className="case-aside">
        <MissionCard id={`${cardId}-aside`} module={selected} info={info} progress={progress} state={state(selected)} />
      </div>
    </div>
  );
}
