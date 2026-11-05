"use client";

import type { Step } from "@/content/types";
import { beatFor } from "@/lib/epilogue";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { CastBadge } from "../artefacts/cast-badge";
import { ActionBar } from "../step-ui";

type EpilogueStep = Extract<Step, { kind: "epilogue" }>;

const TONE_MARK = { gain: "✔", cost: "◆", harm: "✖" } as const;

/**
 * What happened next (PRD §4, "consequences"): each line follows from what this learner chose, written in
 * advance and labelled as fictional. Nothing here is graded; it shows where the choices led.
 */
export function Epilogue({ missionId, step, onContinue }: { missionId: string; step: EpilogueStep; onContinue: () => void }) {
  const session = useSession();
  const progress = session.progress(missionId);
  const input = {
    choices: Object.fromEntries(Object.entries(progress.answers).map(([id, a]) => [id, a.choiceId])),
    facts: progress.facts,
    evidence: progress.evidence,
  };

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1 text-sm text-muted">{t.epilogue.note}</p>
      {step.intro && <p className="mt-2 max-w-3xl">{step.intro}</p>}
      <div className="mat mt-4 p-3 sm:p-5">
        <div className="sheet max-w-3xl p-4 sm:p-6">
          <p className="epilogue-when">{step.when}</p>
          <ol className="mt-3 space-y-4">
            {step.lines.map((line) => {
              const beat = beatFor(line, input);
              return (
                <li key={line.id} className="flex gap-3">
                  {beat.who ? (
                    <CastBadge name={beat.who} />
                  ) : (
                    <span aria-hidden="true" className={`epilogue-mark ${beat.tone ? `tone-${beat.tone}` : ""}`}>{beat.tone ? TONE_MARK[beat.tone] : "•"}</span>
                  )}
                  <div className="min-w-0">
                    {beat.who && <p className="text-sm font-bold">{beat.who}</p>}
                    <p>
                      {beat.tone && <span className="sr-only">{t.epilogue.tone[beat.tone]}: </span>}
                      {beat.who && beat.tone && <span aria-hidden="true" className={`mr-1 font-bold tone-${beat.tone}`}>{TONE_MARK[beat.tone]}</span>}
                      {beat.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <ActionBar>
        <button type="button" onClick={onContinue} className="btn btn-primary">{t.mission.next}</button>
      </ActionBar>
    </div>
  );
}
