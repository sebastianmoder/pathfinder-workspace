"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChartLabSpec, ChartView } from "@/content/types";
import { barsFor, baselineOf, goalMet, measureOf, niceMax, percentChange, valuesOf, type Bar } from "@/lib/chart";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";
import { SlideBody, Specimen } from "../artefacts/frames";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 1 });

/**
 * Adjustable chart (PRD M07): change the measure, the axis baseline or the range of data, and see the
 * chart, the table and a plain-text summary change together. Nothing depends on seeing the chart. Where an
 * authored figure is uncertain, a slider moves it across its plausible range, to test whether a conclusion
 * survives a change in the data.
 */
export function ChartLab({
  stepId,
  spec,
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: ChartLabSpec;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const [view, setView] = useState<ChartView>(spec.start);
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
  const bars = barsFor(spec, view);
  const measure = measureOf(spec, view);
  const baseline = baselineOf(spec, view);
  const set = (patch: Partial<ChartView>) => {
    setView((v) => ({ ...v, ...patch }));
    setResult(null);
  };

  const adjustable = spec.adjustable;
  const firstAdjust = spec.tasks.findIndex((x) => x.adjust);
  const showAdjust = !!adjustable && firstAdjust >= 0 && taskIndex >= firstAdjust;
  const original = adjustable ? spec.quantities.find((q) => q.id === adjustable.quantity)!.values[adjustable.category] : 0;
  const adjustValue = view.adjust ?? original;

  const controls: { key: "measure" | "baseline" | "range"; label: string; options: { id: string; label: string }[] }[] = [
    { key: "measure", label: t.chart.measure, options: spec.measures },
    { key: "baseline", label: t.chart.baseline, options: spec.baselines },
    { key: "range", label: t.chart.range, options: spec.ranges },
  ];

  return (
    <div>
      {spec.slide ? (
        <Specimen tag={t.artefact.tag.slide}>
          <SlideBody title={spec.slide.title} body={[spec.claim]} number={spec.slide.number} />
        </Specimen>
      ) : (
        <div className="rounded-lg border-l-4 border-[var(--highlighter)] bg-surface p-3">
          <p className="text-sm font-bold">{t.chart.claim}</p>
          <p className="mt-1">{spec.claim}</p>
        </div>
      )}

      <p className="mt-4 text-sm font-bold">{t.chart.task(taskIndex + 1, spec.tasks.length)}</p>
      <h3 ref={taskRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">{task.title}</h3>
      <p className="mt-1">{task.instruction}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-3">
          {controls
            .filter((c) => c.options.length > 1)
            .map((c) => (
              <fieldset key={c.key} className="rounded-lg border border-border bg-surface p-3">
                <legend className="px-1 font-bold">{c.label}</legend>
                <div className="mt-1 flex flex-wrap gap-2">
                  {c.options.map((o) => (
                    <label key={o.id} className="option-compact">
                      <input type="radio" name={`${uid}-${c.key}`} checked={view[c.key] === o.id} onChange={() => set({ [c.key]: o.id })} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          {showAdjust && adjustable && (
            <div className="rounded-lg border-2 border-[var(--highlighter)] bg-surface p-3">
              <label htmlFor={`${uid}-adjust`} className="block font-bold">{adjustable.label}</label>
              <p className="text-sm text-muted">{adjustable.note}</p>
              <input
                id={`${uid}-adjust`}
                type="range"
                min={adjustable.min}
                max={adjustable.max}
                step={adjustable.step}
                value={adjustValue}
                aria-valuetext={fmt(adjustValue)}
                onChange={(e) => set({ adjust: Number(e.target.value) })}
                className="mt-2 w-full accent-[var(--foreground)]"
              />
              <p className="mt-1 flex justify-between text-sm tabular-nums">
                <span>{fmt(adjustable.min)}</span>
                <output htmlFor={`${uid}-adjust`} className="font-bold">{fmt(adjustValue)}</output>
                <span>{fmt(adjustable.max)}</span>
              </p>
            </div>
          )}
        </div>

        <figure>
          <figcaption className="font-bold">{measure.label}, {t.chart.by} {spec.categoryLabel.toLowerCase()}</figcaption>
          <Columns bars={bars} min={baseline.min} unit={measure.unit} />
          <p className="mt-2 text-sm" aria-live="polite">{summarize(bars, baseline.min, measure.unit)}</p>
          <table className="mt-3 w-full border-collapse text-left text-sm">
            <caption className="sr-only">{t.chart.tableCaption}</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-1 pr-2">{spec.categoryLabel}</th>
                {spec.quantities.map((q) => <th key={q.id} scope="col" className="py-1 pr-2 text-right">{q.label}</th>)}
                {measure.denominator && <th scope="col" className="py-1 text-right">{measure.label}</th>}
              </tr>
            </thead>
            <tbody>
              {bars.map((b) => (
                <tr key={b.id} className="border-b border-border">
                  <th scope="row" className="py-1 pr-2 font-normal">{b.label}</th>
                  {spec.quantities.map((q) => <td key={q.id} className="py-1 pr-2 text-right tabular-nums">{fmt(valuesOf(spec, view, q.id)[b.id])}</td>)}
                  {measure.denominator && <td className="py-1 text-right font-bold tabular-nums">{fmt(b.value)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </div>

      <div ref={resultRef} className="reveal">
        {result === "notYet" && <p role="status" className="mt-3"><span aria-hidden="true" className="mark-no">✖ </span>{t.chart.notYet}</p>}
        {result === "met" && (
          <div role="status" className="mt-3 rounded-lg border-2 border-[var(--mark-yes)] p-4">
            <p><strong><span aria-hidden="true" className="mark-yes">✔ </span>{t.chart.met}</strong> {task.success}</p>
          </div>
        )}
      </div>

      <ActionBar>
        {result !== "met" && (
          <button
            type="button"
            onClick={() => {
            const met = goalMet(task.goal, view, spec);
            if (task.evidence !== false) {
              const assisted = usedSolution.includes(task.id);
              onEvidence(itemKey(stepId, task.id), { right: met && !assisted, assisted });
            }
            setResult(met ? "met" : "notYet");
            setChecks((n) => n + 1);
            }}
            className="btn btn-primary"
          >
            {t.chart.check}
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
            {t.chart.showMe}
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
            {taskIndex + 1 < spec.tasks.length ? t.chart.nextTask : t.mission.next}
          </button>
        )}
        <span className="text-sm font-bold">{t.chart.task(taskIndex + 1, spec.tasks.length)}</span>
      </ActionBar>
    </div>
  );
}

function summarize(bars: Bar[], min: number, unit: string): string {
  if (bars.length === 0) return "";
  const sorted = [...bars].sort((a, b) => b.value - a.value);
  const hi = sorted[0];
  const lo = sorted[sorted.length - 1];
  const firstBar = bars[0];
  const last = bars[bars.length - 1];
  return t.chart.summary({
    min: fmt(min),
    high: `${hi.label} (${fmt(hi.value)} ${unit})`,
    low: `${lo.label} (${fmt(lo.value)} ${unit})`,
    change: bars.length > 1 ? `${firstBar.label} ${fmt(firstBar.value)} → ${last.label} ${fmt(last.value)} (${percentChange(firstBar.value, last.value) > 0 ? "+" : ""}${fmt(percentChange(firstBar.value, last.value))}%)` : null,
  });
}

/** Single-series columns: accent fill, ≤24px wide, rounded data end, square at the baseline, value on the cap. */
function Columns({ bars, min, unit }: { bars: Bar[]; min: number; unit: string }) {
  const W = 560;
  const H = 240;
  const left = 44;
  const top = 20;
  const bottom = 28;
  const plotH = H - top - bottom;
  const max = niceMax(Math.max(...bars.map((b) => b.value)), min);
  const slot = (W - left) / Math.max(bars.length, 1);
  const width = Math.min(24, slot * 0.6);
  const y = (v: number) => top + plotH - ((Math.max(v, min) - min) / (max - min)) * plotH;
  const ticks = [min, (min + max) / 2, max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full" role="img" aria-hidden="true" focusable="false">
      {ticks.map((tk) => (
        <g key={tk}>
          <line x1={left} x2={W} y1={y(tk)} y2={y(tk)} stroke="var(--border)" strokeWidth={1} />
          <text x={left - 6} y={y(tk) + 4} textAnchor="end" fontSize={12} fill="var(--muted)">{fmt(tk)}</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const cx = left + slot * i + slot / 2;
        const x0 = cx - width / 2;
        const yTop = y(b.value);
        const yBase = y(min);
        const r = Math.min(4, (yBase - yTop) / 2, width / 2);
        const d = `M${x0},${yBase} V${yTop + r} Q${x0},${yTop} ${x0 + r},${yTop} H${x0 + width - r} Q${x0 + width},${yTop} ${x0 + width},${yTop + r} V${yBase} Z`;
        return (
          <g key={b.id}>
            <path d={d} fill="var(--accent)">
              <title>{`${b.label}: ${fmt(b.value)} ${unit}`}</title>
            </path>
            <text x={cx} y={yTop - 6} textAnchor="middle" fontSize={12} fill="var(--foreground)">{fmt(b.value)}</text>
            <text x={cx} y={H - 8} textAnchor="middle" fontSize={12} fill="var(--muted)">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
