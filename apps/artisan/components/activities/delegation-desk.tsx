"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DELEGATION_ROLES, type DelegationRole, type DelegationSpec, type DelegationTask } from "@/content/types";
import { delegationResults, isSound } from "@/lib/delegation";
import type { EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";

const FACTORS = ["stakes", "evidence", "sensitivity", "reversibility"] as const;
const roleLabel = (role: DelegationRole) => t.delegation.roles[role].label;

/**
 * Task inbox (PRD M02). The learner assigns a role to every request before anything is revealed, then sees
 * what happened later, why, and who answers for it. Other roles can be inspected afterwards, labelled as such,
 * so a replayed outcome is never mistaken for the learner's own (PRD §9, Replay).
 */
export function DelegationDesk({
  stepId,
  spec,
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: DelegationSpec;
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const guided = spec.support !== "independent";
  const [assigned, setAssigned] = useState<Record<string, DelegationRole>>({});
  const [hinted, setHinted] = useState<string[]>([]);
  const [sent, setSent] = useState<Record<string, DelegationRole> | null>(null);
  const laterRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) laterRef.current?.focus();
  }, [sent]);

  const count = spec.tasks.filter((task) => assigned[task.id]).length;

  if (sent) {
    const sound = spec.tasks.filter((task) => isSound(task, sent[task.id])).length;
    return (
      <div>
        <h3 ref={laterRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">{spec.later}</h3>
        <p className="text-sm text-muted">{t.delegation.laterNote}</p>
        <p className="mt-2" role="status">{t.delegation.summary(sound, spec.tasks.length)}</p>
        <ul className="mt-4 space-y-4">
          {spec.tasks.map((task) => (
            <Outcome key={task.id} task={task} chosen={sent[task.id]} />
          ))}
        </ul>
        <button type="button" onClick={onContinue} className="mt-5 btn btn-primary">{t.mission.next}</button>
      </div>
    );
  }

  return (
    <div>
      <details className="rounded-lg border border-border bg-surface p-3" open>
        <summary className="cursor-pointer font-bold">{t.delegation.rolesHeading}</summary>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
          {DELEGATION_ROLES.map((role) => (
            <div key={role}>
              <dt className="font-bold">{roleLabel(role)}</dt>
              <dd>{t.delegation.roles[role].help}</dd>
            </div>
          ))}
        </dl>
      </details>
      {!guided && <p className="mt-3 text-sm">{t.delegation.independentNote}</p>}

      <h3 className="mt-5 text-lg font-bold">{t.delegation.inbox}</h3>
      <ul className="mt-2 space-y-4">
        {spec.tasks.map((task) => (
          <li key={task.id} className="ticket">
            <h4 className="text-lg">{task.title}</h4>
            <p className="text-sm text-muted">{t.delegation.from}: {task.from}</p>
            <p className="mt-2">{task.text}</p>
            {guided && task.factors && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold">
                  {t.delegation.weigh}<span className="sr-only">: {task.title}</span>
                </summary>
                <dl className="mt-1 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  {FACTORS.map((f) => (
                    <div key={f}>
                      <dt className="font-bold">{t.delegation.factor[f]}</dt>
                      <dd>{task.factors![f]}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            <fieldset className="mt-3">
              <legend className="text-sm font-bold">{t.delegation.assign(task.title)}</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {DELEGATION_ROLES.map((role) => (
                  <label key={role} className="option-compact">
                    <input
                      type="radio"
                      name={`${uid}-${task.id}`}
                      checked={assigned[task.id] === role}
                      onChange={() => setAssigned((a) => ({ ...a, [task.id]: role }))}
                    />
                    {roleLabel(role)}
                  </label>
                ))}
              </div>
            </fieldset>
            {guided && task.hint && (
              hinted.includes(task.id) ? (
                <p className="mt-2 text-sm" role="status"><strong>{t.delegation.hint}</strong> {task.hint}</p>
              ) : (
                <button type="button" onClick={() => setHinted((h) => [...h, task.id])} className="mt-2 btn btn-secondary btn-small">
                  {t.delegation.hint}<span className="sr-only">: {task.title}</span>
                </button>
              )
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm" aria-live="polite">{t.delegation.progress(count, spec.tasks.length)}</p>
      <button
        type="button"
        disabled={count < spec.tasks.length}
        onClick={() => {
          for (const [item, result] of delegationResults(stepId, spec, assigned, hinted)) onEvidence(item, result);
          setSent(assigned);
        }}
        className="mt-2 btn btn-primary"
      >
        {t.delegation.send}
      </button>
    </div>
  );
}

function Verdict({ task, role }: { task: DelegationTask; role: DelegationRole }) {
  const outcome = task.outcomes[role];
  const sound = outcome.verdict !== "weaker";
  return (
    <p className="mt-2 text-sm">
      <strong>
        <span aria-hidden="true" className={sound ? "mark-yes" : "mark-no"}>{sound ? "✔ " : "✖ "}</span>
        {t.mission.verdict[outcome.verdict]}.
      </strong>{" "}
      {outcome.explanation}
    </p>
  );
}

function Outcome({ task, chosen }: { task: DelegationTask; chosen: DelegationRole }) {
  const [shown, setShown] = useState<DelegationRole[]>([]);
  const others = DELEGATION_ROLES.filter((r) => r !== chosen);
  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <h4 className="text-lg">{task.title}</h4>
      <p className="text-sm font-bold">{t.delegation.yourChoice(roleLabel(chosen))}</p>
      <p className="mt-2 border-l-4 border-border pl-3">{task.outcomes[chosen].event}</p>
      <Verdict task={task} role={chosen} />
      <p className="mt-2 text-sm"><strong>{t.delegation.responsible}:</strong> {task.responsible}</p>

      <div className="no-print mt-3">
        <p className="text-sm font-bold">{t.delegation.whatIf}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {others.map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={shown.includes(role)}
              onClick={() => setShown((s) => (s.includes(role) ? s.filter((x) => x !== role) : [...s, role]))}
              className="btn btn-secondary btn-small"
            >
              {roleLabel(role)}<span className="sr-only">: {task.title}</span>
            </button>
          ))}
        </div>
        {others.filter((role) => shown.includes(role)).map((role) => (
          <div key={role} className="mt-3 border-2 border-dashed border-border p-3">
            <p className="text-sm font-bold">{t.delegation.whatIfLabel(roleLabel(role))}</p>
            <p className="text-sm text-muted">{t.delegation.notYourChoice}</p>
            <p className="mt-2">{task.outcomes[role].event}</p>
            <Verdict task={task} role={role} />
          </div>
        ))}
      </div>
    </li>
  );
}
