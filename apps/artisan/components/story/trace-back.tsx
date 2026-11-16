"use client";

import { useContext } from "react";
import { trace } from "@/content/story";
import { t } from "@/lib/i18n/en";
import { MatchBoard } from "../activities/match-board";
import { RankList } from "../activities/rank-list";
import { SavedScope, useSaved } from "../saved-state";
import { HowTo, StepIntro } from "../step-ui";

/**
 * "Trace it back": the story's own activity, before the review meeting. Two parts, each a pattern the player
 * already knows: put one figure's journey in order, then pin each claim to what its source showed. It is
 * checked like any activity, credits nothing, and never stands in the way of the case.
 */
export function TraceBack({ onDone }: { onDone: () => void }) {
  const scope = useContext(SavedScope);
  const [part, setPart] = useSaved<"travel" | "lost">("part", "travel");
  const nothing = () => {};
  return (
    <div>
      <p className="case-tab">{t.story.label}</p>
      <h1 className="text-3xl sm:text-4xl">{trace.title}</h1>
      <p className="mt-2 max-w-3xl">{trace.intro}</p>
      <div className="mt-6">
        {part === "travel" ? (
          <section key="travel">
            <StepIntro title={trace.travel.title} intro={trace.travel.intro} />
            <HowTo steps={t.howTo.rank} />
            <SavedScope value={scope && { ...scope, scope: "trace-travel" }}>
              <RankList stepId="trace-travel" spec={trace.travel.spec} onEvidence={nothing} onContinue={() => { setPart("lost"); window.scrollTo({ top: 0 }); }} />
            </SavedScope>
          </section>
        ) : (
          <section key="lost">
            <StepIntro title={trace.lost.title} intro={trace.lost.intro} />
            <HowTo steps={t.howTo.match} />
            <SavedScope value={scope && { ...scope, scope: "trace-lost" }}>
              <MatchBoard stepId="trace-lost" spec={trace.lost.spec} onEvidence={nothing} onContinue={onDone} />
            </SavedScope>
          </section>
        )}
      </div>
    </div>
  );
}
