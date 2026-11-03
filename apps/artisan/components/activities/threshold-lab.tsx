"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ThresholdLabSpec, ThresholdView } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { missedGap, outcomes, thresholdGoalMet, totalSelected, withinCapacity } from "@/lib/threshold";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";

/**
 * Screening threshold with outcomes by group (PRD M09). The error table carries every number; the plot
 * repeats it with shape (filled = qualified) so nothing depends on colour or on seeing the plot.
 */
export function ThresholdLab({
  stepId,
  spec,
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: ThresholdLabSpec;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const [view, setView] = useState<ThresholdView>(spec.start);
  const [taskIndex, setTaskIndex] = useState(0);
  const [result, setResult] = useState<"met" | "notYet" | null>(null);
  const [usedSolution, setUsedSolution] = useState<string[]>([]);
  const taskRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    taskRef.current?.focus();
  }, [taskIndex]);

  const task = spec.tasks[taskIndex];
  const [checks, setChecks] = useState(0);
  const resultRef = useReveal<HTMLDivElement>(result ? checks : null);
  const o = outcomes(spec, view);
  const selected = totalSelected(o);
  const set = (patch: Partial<ThresholdView>) => {
    setView((v) => ({ ...v, ...patch, threshold: Math.min(spec.range.max, Math.max(spec.range.min, patch.threshold ?? v.threshold)) }));
    setResult(null);
  };
  const version = spec.versions.find((v) => v.id === view.version);

  return (
    <div>
      <p className="text-sm font-bold">{t.threshold.task(taskIndex + 1, spec.tasks.length)}</p>
      <h3 ref={taskRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">{task.title}</h3>
      <p className="mt-1">{task.instruction}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-4">
            {spec.versions.length > 1 && (
              <fieldset className="rounded-lg border border-border bg-surface p-3">
                <legend className="px-1 font-bold">{t.threshold.version}</legend>
                <div className="mt-1 flex flex-wrap gap-2">
                  {spec.versions.map((v) => (
                    <label key={v.id} className="option-compact">
                      <input type="radio" name={`${uid}-version`} checked={view.version === v.id} onChange={() => set({ version: v.id })} />
                      {v.label}
                    </label>
                  ))}
                </div>
                {version && <p className="mt-2 max-w-sm text-sm">{version.note}</p>}
              </fieldset>
            )}
            <div className="rounded-lg border border-border bg-surface p-3">
              <label htmlFor={`${uid}-t`} className="font-bold">{t.threshold.threshold(spec.scoreLabel)}</label>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => set({ threshold: view.threshold - 1 })} className="btn btn-secondary btn-small" aria-label={t.threshold.lower}>−</button>
                <input
                  id={`${uid}-t`}
                  type="range"
                  min={spec.range.min}
                  max={spec.range.max}
                  value={view.threshold}
                  onChange={(e) => set({ threshold: Number(e.target.value) })}
                  className="w-40 accent-[var(--accent)]"
                />
                <button type="button" onClick={() => set({ threshold: view.threshold + 1 })} className="btn btn-secondary btn-small" aria-label={t.threshold.raise}>+</button>
                <output htmlFor={`${uid}-t`} className="w-10 text-right text-lg font-bold tabular-nums">{view.threshold}</output>
              </div>
            </div>
          </div>

          <p role="status" className={`mt-3 font-bold ${withinCapacity(spec, o) ? "" : "mark-no"}`}>
            {t.threshold.selected(selected, spec.capacity)}
          </p>

          <Plot spec={spec} view={view} />
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted">
            <span><span aria-hidden="true">● </span>{spec.qualifiedLabel}</span>
            <span><span aria-hidden="true">○ </span>{t.threshold.notQualified}</span>
            <span>{t.threshold.shaded}</span>
          </p>

          <table className="mt-4 w-full border-collapse text-left text-sm">
            <caption className="text-left font-bold">{t.threshold.tableCaption}</caption>
            <thead>
              <tr className="border-b border-border align-bottom">
                <th scope="col" className="py-1 pr-2">{t.threshold.group}</th>
                <th scope="col" className="py-1 pr-2 text-right">{t.threshold.applicants}</th>
                <th scope="col" className="py-1 pr-2 text-right">{t.threshold.qualified}</th>
                <th scope="col" className="py-1 pr-2 text-right">{t.threshold.selectedCol}</th>
                <th scope="col" className="py-1 pr-2 text-right">{t.threshold.missed}</th>
                <th scope="col" className="py-1 text-right">{t.threshold.wrongPicks}</th>
              </tr>
            </thead>
            <tbody>
              {o.map((g) => (
                <tr key={g.id} className="border-b border-border">
                  <th scope="row" className="py-1 pr-2 font-normal">{g.label}</th>
                  <td className="py-1 pr-2 text-right tabular-nums">{g.total}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">{g.qualified}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">{g.selected}</td>
                  <td className="py-1 pr-2 text-right font-bold tabular-nums">{g.missed}</td>
                  <td className="py-1 text-right tabular-nums">{g.wrongPicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm">{t.threshold.gap(missedGap(o))}</p>
        </div>

        <aside aria-labelledby={`${uid}-voices`}>
          <h4 id={`${uid}-voices`} className="font-bold">{t.threshold.voices}</h4>
          <ul className="mt-2 space-y-3">
            {spec.stakeholders.map((s) => (
              <li key={s.id} className="rounded-lg border border-border bg-surface p-3">
                <p className="font-bold">{s.name}<span className="font-normal text-muted">, {s.role}</span></p>
                <p className="mt-1 text-sm">“{s.says}”</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div ref={resultRef} className="reveal">
        {result === "notYet" && <p role="status" className="mt-3"><span aria-hidden="true" className="mark-no">✖ </span>{t.threshold.notYet}</p>}
        {result === "met" && (
          <div role="status" className="mt-3 rounded-lg border-2 border-[var(--mark-yes)] p-4">
            <p><strong><span aria-hidden="true" className="mark-yes">✔ </span>{t.threshold.met}</strong> {task.success}</p>
          </div>
        )}
      </div>

      <ActionBar>
        {result !== "met" && (
          <button
            type="button"
            onClick={() => {
            const met = thresholdGoalMet(spec, task.goal, view);
            const assisted = usedSolution.includes(task.id);
            onEvidence(itemKey(stepId, task.id), { right: met && !assisted, assisted });
            setResult(met ? "met" : "notYet");
            setChecks((n) => n + 1);
            }}
            className="btn btn-primary"
          >
            {t.threshold.check}
          </button>
        )}
        {result !== "met" && (
          <button
            type="button"
            onClick={() => {
              set(task.solution);
              setUsedSolution((u) => [...u, task.id]);
            }}
            className="btn btn-secondary"
          >
            {t.threshold.showMe}
          </button>
        )}
        {result === "met" && (
          <button
            type="button"
            onClick={() => {
              if (taskIndex + 1 < spec.tasks.length) {
                setTaskIndex(taskIndex + 1);
                setResult(null);
              } else onContinue();
            }}
            className="btn btn-primary"
          >
            {taskIndex + 1 < spec.tasks.length ? t.threshold.nextTask : t.mission.next}
          </button>
        )}
        <span className="text-sm font-bold">{t.threshold.task(taskIndex + 1, spec.tasks.length)}</span>
      </ActionBar>
    </div>
  );
}

/** One row per group: applicants placed by score, filled if qualified, with the selected zone shaded. */
function Plot({ spec, view }: { spec: ThresholdLabSpec; view: ThresholdView }) {
  const W = 560;
  const left = 8;
  const right = 8;
  const rowH = 46;
  const labelH = 16;
  const H = spec.groups.length * (rowH + labelH) + 20;
  const x = (score: number) => left + ((score - spec.range.min) / (spec.range.max - spec.range.min)) * (W - left - right);
  const tx = x(view.threshold);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" aria-hidden="true" focusable="false">
      <rect x={tx} y={0} width={W - right - tx} height={H - 20} fill="var(--accent)" opacity={0.1} />
      {spec.groups.map((g, gi) => {
        const top = gi * (rowH + labelH);
        const cy = top + labelH + rowH / 2;
        const people = spec.applicants.filter((a) => a.group === g.id);
        return (
          <g key={g.id}>
            <text x={left} y={top + 12} fontSize={12} fill="var(--foreground)">{g.label}</text>
            <line x1={left} x2={W - right} y1={cy} y2={cy} stroke="var(--border)" strokeWidth={1} />
            {people.map((a, i) => (
              <circle
                key={a.id}
                cx={x(a.scores[view.version])}
                cy={cy + (i % 2 === 0 ? -7 : 7)}
                r={5}
                fill={a.qualified ? "var(--accent)" : "var(--surface)"}
                stroke={a.qualified ? "var(--surface)" : "var(--accent)"}
                strokeWidth={2}
              />
            ))}
          </g>
        );
      })}
      <line x1={tx} x2={tx} y1={0} y2={H - 20} stroke="var(--foreground)" strokeWidth={2} />
      {[spec.range.min, (spec.range.min + spec.range.max) / 2, spec.range.max].map((v) => (
        <text key={v} x={x(v)} y={H - 4} fontSize={12} textAnchor={v === spec.range.min ? "start" : v === spec.range.max ? "end" : "middle"} fill="var(--muted)">{v}</text>
      ))}
    </svg>
  );
}
