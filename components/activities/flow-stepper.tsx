"use client";

import { useState } from "react";
import type { Step } from "@/content/types";
import { t } from "@/lib/i18n/en";

type FlowStep = Extract<Step, { kind: "flow" }>;

/** Step-through diagram. All stages are listed as text below, so nothing depends on seeing the graphic. */
export function FlowStepper({ step, onContinue }: { step: FlowStep; onContinue: () => void }) {
  const [i, setI] = useState(0);
  const last = i === step.stages.length - 1;

  return (
    <div>
      <h2 className="text-xl font-medium">{step.title}</h2>
      <ol className="mt-4 flex flex-wrap gap-2" aria-label={step.title}>
        {step.stages.map((s, idx) => (
          <li
            key={s.title}
            aria-current={idx === i ? "step" : undefined}
            className={`rounded-lg border px-3 py-2 text-sm ${idx === i ? "border-accent bg-surface font-semibold" : "border-border"}`}
          >
            {idx + 1}. {s.title}
          </li>
        ))}
      </ol>
      <p role="status" className="mt-4 rounded-lg border border-border bg-surface p-4">
        <strong>{step.stages[i].title}.</strong> {step.stages[i].text}
      </p>
      <div className="mt-4 flex gap-3">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="rounded border border-border px-4 py-2 disabled:opacity-50">
          {t.flow.back}
        </button>
        {!last ? (
          <button type="button" onClick={() => setI(i + 1)} className="rounded bg-accent px-4 py-2 font-medium text-accent-foreground">
            {t.flow.nextStage}
          </button>
        ) : (
          <button type="button" onClick={onContinue} className="rounded bg-accent px-4 py-2 font-medium text-accent-foreground">
            {t.mission.next}
          </button>
        )}
      </div>
    </div>
  );
}
