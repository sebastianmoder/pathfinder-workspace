"use client";

import { useId, useState } from "react";
import type { AllocationSpec } from "@/content/types";
import { coverage, planResult, spent } from "@/lib/allocation";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";
import { ActionBar, useReveal } from "../step-ui";

/**
 * Choose conditions within a budget, then see a stakeholder map of whose concerns the plan covers (PRD M13).
 * Which concerns each option meets is shown only after checking, so the plan is the learner's reasoning.
 */
export function AllocationBoard({
  stepId,
  spec,
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: AllocationSpec;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const [chosen, setChosen] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[] | null>(null);
  const total = spent(spec, chosen);
  const over = total > spec.budget.amount;
  const money = (n: number) => `${spec.budget.unit}${n.toLocaleString("en-GB")}`;
  const isCurrent = checked !== null && checked.length === chosen.length && checked.every((id) => chosen.includes(id));
  const result = isCurrent ? planResult(spec, checked) : null;
  const cov = isCurrent ? coverage(spec, checked) : null;
  const stakeholders = [...new Set(spec.concerns.map((c) => c.stakeholder))];
  const [checks, setChecks] = useState(0);
  const mapRef = useReveal<HTMLElement>(checks);
  const optionLabel = (id: string) => spec.options.find((o) => o.id === id)?.label ?? id;

  return (
    <div>
      <section ref={mapRef} aria-labelledby={`${uid}-map`} className="reveal">
        <h3 id={`${uid}-map`} className="text-lg font-bold">{t.allocation.map}</h3>
        {result && (
          <p role="status" className={`mt-2 rounded-lg border-2 p-3 ${result.right ? "border-[var(--mark-yes)]" : "border-[var(--mark-no)]"}`}>
            <span aria-hidden="true" className={result.right ? "mark-yes" : "mark-no"}>{result.right ? "✔ " : "✖ "}</span>
            {result.overBudget ? t.allocation.overBudget : result.right ? t.allocation.sound : t.allocation.missing(result.missingEssential.length)}
          </p>
        )}
        <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stakeholders.map((s) => (
            <li key={s} className="rounded-lg border border-border bg-surface p-3">
              <p className="font-bold">{s}</p>
              <ul className="mt-1 space-y-2 text-sm">
                {spec.concerns.filter((c) => c.stakeholder === s).map((c) => {
                  const by = cov?.get(c.id) ?? [];
                  return (
                    <li key={c.id}>
                      <p>
                        {cov && <span aria-hidden="true" className={by.length ? "mark-yes" : "mark-no"}>{by.length ? "✔ " : "○ "}</span>}
                        {c.text}
                        {cov && c.essential && <strong> ({t.allocation.essential})</strong>}
                      </p>
                      {cov && (
                        <p className="text-muted">
                          {by.length ? t.allocation.coveredBy(by.map(optionLabel).join("; ")) : t.allocation.notCovered} {c.why}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <fieldset className="mt-5">
        <legend className="text-lg font-bold">{t.allocation.choose(spec.budget.label, money(spec.budget.amount))}</legend>
        <div className="mt-2 space-y-2">
          {spec.options.map((o) => (
            <label key={o.id} className="option">
              <input
                type="checkbox"
                checked={chosen.includes(o.id)}
                onChange={(e) => setChosen((c) => (e.target.checked ? [...c, o.id] : c.filter((x) => x !== o.id)))}
              />
              <span>
                <span className="font-bold">{money(o.cost)}</span> · {o.label}
                {isCurrent && chosen.includes(o.id) && <span className="block text-sm text-muted">{t.allocation.tradeoff}: {o.note}</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <ActionBar note={checked && !isCurrent ? t.allocation.changed : undefined}>
        <button
          type="button"
          disabled={chosen.length === 0}
          onClick={() => {
            const r = planResult(spec, chosen);
            onEvidence(itemKey(stepId, "plan"), { right: r.right });
            setChecked(chosen);
            setChecks((n) => n + 1);
          }}
          className="btn btn-primary"
        >
          {t.allocation.check}
        </button>
        {checked && <button type="button" onClick={onContinue} className="btn btn-primary">{t.mission.next}</button>}
        <span role="status" className={`text-sm font-bold ${over ? "mark-no" : ""}`}>{t.allocation.spent(money(total), money(spec.budget.amount), over)}</span>
      </ActionBar>
    </div>
  );
}
