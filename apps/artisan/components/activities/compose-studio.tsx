"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ComposeSpec } from "@/content/types";
import {
  allMet,
  changedElements,
  composeOutput,
  contributions,
  criterionMet,
  treeOrder,
  versionDepths,
  wordCount,
  type Choices,
  type Version,
} from "@/lib/compose";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";

/**
 * Workspace, comparison, checklist and version tree (PRD M03, M11). Outputs are authored per option, so
 * the page says so, and a change of one element shows exactly what that element does.
 */
export function ComposeStudio({
  stepId,
  spec,
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: ComposeSpec;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const guided = spec.support !== "independent";
  const [roundIndex, setRoundIndex] = useState(0);
  const [choices, setChoices] = useState<Choices>(spec.start);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [ticks, setTicks] = useState<string[]>([]);
  const [checkedFor, setCheckedFor] = useState<{ version: number; ticks: string[] } | null>(null);
  const [usedSolution, setUsedSolution] = useState<string[]>([]);
  const [goalRecorded, setGoalRecorded] = useState<string[]>([]);
  const roundRef = useRef<HTMLHeadingElement>(null);
  const firstRound = useRef(true);

  useEffect(() => {
    if (firstRound.current) {
      firstRound.current = false;
      return;
    }
    roundRef.current?.focus();
  }, [roundIndex]);

  const round = spec.rounds[roundIndex];
  const current = versions.find((v) => v.id === currentId) ?? null;
  const parent = current?.parent != null ? versions.find((v) => v.id === current.parent) ?? null : null;
  const base = current?.choices ?? spec.start;
  const pending = changedElements(base, choices);
  const solutionLoaded = usedSolution.includes(round.id) && changedElements(choices, round.solution).length === 0;
  const tooMany = !!spec.oneAtATime && current !== null && pending.length > 1 && !solutionLoaded;
  const canRun = (current === null || pending.length > 0) && !tooMany;
  const met = current ? allMet(round.criteria, current.choices) : false;
  const checkedNow = checkedFor && checkedFor.version === currentId ? checkedFor : null;
  const checklistRight = checkedNow
    ? round.criteria.every((c) => checkedNow.ticks.includes(c.id) === criterionMet(c, current!.choices))
    : false;
  const roundDone = met && checklistRight;
  const doneRef = useReveal<HTMLDivElement>(roundDone ? `${round.id}-${currentId}` : null);
  const note = tooMany
    ? t.compose.tooMany(pending.map((id) => spec.elements.find((e) => e.id === id)?.label ?? id).join(", "))
    : !current ? t.compose.noRun
    : roundDone ? undefined
    : met ? t.compose.checkToFinish
    : !canRun ? t.compose.nothingChanged
    : t.compose.nextChange;
  const labelOf = (id: string) => spec.elements.find((e) => e.id === id)?.label ?? id;

  const run = () => {
    const id = versions.length + 1;
    const v: Version = { id, parent: currentId, roundId: round.id, choices };
    setVersions((vs) => [...vs, v]);
    setCurrentId(id);
    setTicks([]);
    if (allMet(round.criteria, choices) && !goalRecorded.includes(round.id)) {
      const assisted = usedSolution.includes(round.id);
      onEvidence(itemKey(stepId, round.id), { right: !assisted, assisted });
      setGoalRecorded((g) => [...g, round.id]);
    }
  };

  const checkList = () => {
    if (!current) return;
    const right = round.criteria.every((c) => ticks.includes(c.id) === criterionMet(c, current.choices));
    onEvidence(itemKey(stepId, round.id, "checklist"), { right });
    setCheckedFor({ version: current.id, ticks });
  };

  const nextRound = () => {
    if (roundIndex + 1 < spec.rounds.length) {
      setRoundIndex(roundIndex + 1);
      setTicks([]);
      setCheckedFor(null);
    } else onContinue();
  };

  const output = current ? composeOutput(spec, current.choices) : [];
  const before = parent ? composeOutput(spec, parent.choices) : null;
  const changed = current && parent ? changedElements(parent.choices, current.choices) : [];

  return (
    <div>
      {spec.rounds.length > 1 && <p className="text-sm font-bold">{t.compose.round(roundIndex + 1, spec.rounds.length)}</p>}
      <h3 ref={roundRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">{round.title}</h3>
      {round.event && <p className="mt-2 border-l-4 border-[var(--highlighter)] pl-3"><strong>{t.compose.message}</strong> {round.event}</p>}
      <p className="mt-2">{round.instruction}</p>
      <p className="mt-2 text-sm text-muted">{t.compose.authoredNote}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby={`${uid}-ws`}>
          <h4 id={`${uid}-ws`} className="text-lg font-bold">{spec.workspaceLabel}</h4>
          {spec.oneAtATime && <p className="text-sm">{t.compose.oneAtATime}</p>}
          <div className="mt-2 space-y-4">
            {spec.elements.map((e) => (
              <fieldset key={e.id} className="rounded-lg border border-border bg-surface p-3">
                <legend className="px-1 font-bold">
                  {e.label}
                  {pending.includes(e.id) && current && <span className="ml-2 text-sm font-normal">({t.compose.edited})</span>}
                </legend>
                {guided && <p className="text-sm text-muted">{e.help}</p>}
                <div className="mt-2 space-y-1">
                  {e.options.map((o) => (
                    <label key={o.id} className="option">
                      <input
                        type="radio"
                        name={`${uid}-${e.id}`}
                        checked={choices[e.id] === o.id}
                        onChange={() => setChoices((c) => ({ ...c, [e.id]: o.id }))}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section aria-labelledby={`${uid}-out`}>
          <h4 id={`${uid}-out`} className="text-lg font-bold">{spec.outputLabel}</h4>
          {!current ? (
            <p className="mt-2 text-muted">{t.compose.noRun}</p>
          ) : (
            <>
              <div className="mat mt-2 p-3">
                <div className="sheet p-4">
                  <p className="text-sm text-muted">{t.compose.versionLabel(current.id)} · {t.compose.words(wordCount(output))}</p>
                  {output.map((p, i) => <p key={i} className="mt-2">{p}</p>)}
                </div>
              </div>
              {before && (
                <details className="mt-3 rounded-lg border border-border p-3" open>
                  <summary className="cursor-pointer font-bold">
                    {t.compose.compareWith(parent!.id)}
                    {changed.length > 0 && <span className="font-normal"> · {t.compose.changed(changed.map(labelOf).join(", "))}</span>}
                  </summary>
                  {before.map((p, i) => <p key={i} className="mt-2 text-sm">{p}</p>)}
                </details>
              )}

              <fieldset className="mt-4 rounded-lg border border-border bg-surface p-3">
                <legend className="px-1 font-bold">{t.compose.checklist(current.id)}</legend>
                <ul className="mt-1 space-y-2">
                  {round.criteria.map((c) => {
                    const truth = criterionMet(c, current.choices);
                    const judged = checkedNow ? checkedNow.ticks.includes(c.id) === truth : null;
                    return (
                      <li key={c.id}>
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={ticks.includes(c.id)}
                            onChange={(e) => setTicks((x) => (e.target.checked ? [...x, c.id] : x.filter((y) => y !== c.id)))}
                          />
                          <span>{c.text}</span>
                        </label>
                        {judged !== null && (
                          <p className="ml-6 text-sm">
                            <span aria-hidden="true" className={judged ? "mark-yes" : "mark-no"}>{judged ? "✔ " : "✖ "}</span>
                            {judged ? t.compose.judgedRight : t.compose.judgedWrong} {truth ? t.compose.isMet : t.compose.isNotMet}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <button type="button" onClick={checkList} className="mt-3 btn btn-secondary btn-small">{t.compose.checkList}</button>
              </fieldset>
            </>
          )}
        </section>
      </div>

      <div ref={doneRef} className="reveal">
        {roundDone && (
          <div role="status" className="mt-5 rounded-lg border-2 border-[var(--mark-yes)] p-4">
            <p><strong><span aria-hidden="true" className="mark-yes">✔ </span>{t.compose.roundDone}</strong> {round.success}</p>
          </div>
        )}
      </div>

      {spec.record && current && (
        <section className="mt-6" aria-labelledby={`${uid}-rec`}>
          <h4 id={`${uid}-rec`} className="text-lg font-bold">{t.compose.recordTitle(current.id)}</h4>
          <table className="mt-2 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-1 pr-2">{t.compose.recordPart}</th>
                <th scope="col" className="py-1 pr-2">{t.compose.recordChoice}</th>
                <th scope="col" className="py-1">{t.compose.recordBy}</th>
              </tr>
            </thead>
            <tbody>
              {contributions(spec, current.choices).map((c) => (
                <tr key={c.element} className="border-b border-border align-top">
                  <th scope="row" className="py-1 pr-2 font-bold">{c.element}</th>
                  <td className="py-1 pr-2">{c.label}</td>
                  <td className="py-1">{t.compose.by[c.by]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {versions.length > 0 && (
        <section className="mt-6" aria-labelledby={`${uid}-tree`}>
          <h4 id={`${uid}-tree`} className="text-lg font-bold">{t.compose.versions}</h4>
          <p className="text-sm text-muted">{t.compose.versionsHelp}</p>
          <ul className="mt-2 space-y-1">
            {(() => {
              const depths = versionDepths(versions);
              return treeOrder(versions).map((v) => {
                const p = v.parent != null ? versions.find((x) => x.id === v.parent) : null;
                const diff = p ? changedElements(p.choices, v.choices).map(labelOf).join(", ") : t.compose.firstVersion;
                const roundTitle = spec.rounds.find((r) => r.id === v.roundId)?.title;
                return (
                  <li key={v.id} style={{ marginLeft: `${Math.min(depths.get(v.id) ?? 0, 6) * 1}rem` }} className="flex flex-wrap items-center gap-2 border-l-2 border-border pl-2">
                    <span aria-current={v.id === currentId ? "true" : undefined} className={v.id === currentId ? "font-bold" : ""}>
                      {t.compose.versionLabel(v.id)}
                      {p && <span className="text-muted"> ← {t.compose.versionLabel(p.id)}</span>}: {diff}
                      {spec.rounds.length > 1 && roundTitle && <span className="text-muted"> ({roundTitle})</span>}
                      {v.id === currentId && <span className="font-normal"> · {t.compose.current}</span>}
                    </span>
                    {v.id !== currentId && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentId(v.id);
                          setChoices(v.choices);
                          setTicks([]);
                        }}
                        className="btn btn-secondary btn-small"
                      >
                        {t.compose.restore}<span className="sr-only"> {t.compose.versionLabel(v.id)}</span>
                      </button>
                    )}
                  </li>
                );
              });
            })()}
          </ul>
        </section>
      )}

      <ActionBar note={note}>
        {!roundDone && (
          <button type="button" disabled={!canRun} onClick={run} className="btn btn-primary">{t.compose.run}</button>
        )}
        {!met && (
          <button
            type="button"
            onClick={() => {
              setChoices(round.solution);
              setUsedSolution((u) => (u.includes(round.id) ? u : [...u, round.id]));
            }}
            className="btn btn-secondary"
          >
            {t.compose.showMe}
          </button>
        )}
        {roundDone && (
          <button type="button" onClick={nextRound} className="btn btn-primary">
            {roundIndex + 1 < spec.rounds.length ? t.compose.nextRound : t.mission.next}
          </button>
        )}
      </ActionBar>
    </div>
  );
}
