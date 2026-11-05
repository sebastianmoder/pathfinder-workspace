"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DELEGATION_ROLES, type DelegationRole, type DelegationSpec, type DelegationTask } from "@/content/types";
import { carryNotes, delegationResults, isSound, wavesOf } from "@/lib/delegation";
import type { EvidenceResult } from "@/lib/evidence";
import { t } from "@/lib/i18n/en";
import { ActionBar } from "../step-ui";
import { CastBadge } from "../artefacts/cast-badge";

const FACTORS = ["stakes", "evidence", "sensitivity", "reversibility"] as const;
const roleLabel = (role: DelegationRole) => t.delegation.roles[role].label;

/**
 * Task inbox (PRD M02). The learner assigns a role to every request in a batch before anything is revealed,
 * then sees what happened later, why, and who answers for it. With more than one batch, the next one opens
 * with what the earlier choices led to, so later events follow from earlier decisions. Other roles can be
 * inspected afterwards, labelled as such, so a replayed outcome is never mistaken for the learner's own
 * (PRD §9, Replay).
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
  const waves = wavesOf(spec);
  const [waveIndex, setWaveIndex] = useState(0);
  // Assignments as they were when each batch was sent.
  const [sent, setSent] = useState<Record<string, DelegationRole>>({});
  const [showing, setShowing] = useState(false);
  const laterRef = useRef<HTMLHeadingElement>(null);
  const inboxRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (showing ? laterRef : inboxRef).current?.focus();
  }, [showing, waveIndex]);

  const wave = waves[waveIndex];
  const tasks = spec.tasks.filter((task) => wave.taskIds.includes(task.id));
  const count = tasks.filter((task) => assigned[task.id]).length;
  const more = waveIndex + 1 < waves.length;

  if (showing) {
    const sound = tasks.filter((task) => isSound(task, sent[task.id])).length;
    return (
      <div>
        {waves.length > 1 && <p className="text-sm font-bold">{t.delegation.wave(waveIndex + 1, waves.length)}</p>}
        <h3 ref={laterRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">{wave.later}</h3>
        <p className="text-sm text-muted">{t.delegation.laterNote}</p>
        <p className="mt-2" role="status">{t.delegation.summary(sound, tasks.length)}</p>
        <ul className="mt-4 space-y-4">
          {tasks.map((task) => (
            <Outcome key={task.id} task={task} chosen={sent[task.id]} />
          ))}
        </ul>
        <ActionBar>
          {more ? (
            <button
              type="button"
              onClick={() => {
                setWaveIndex(waveIndex + 1);
                setShowing(false);
              }}
              className="btn btn-primary"
            >
              {t.delegation.nextWave}
            </button>
          ) : (
            <button type="button" onClick={onContinue} className="btn btn-primary">{t.mission.next}</button>
          )}
        </ActionBar>
      </div>
    );
  }

  const notes = carryNotes(wave, sent);

  return (
    <div>
      <details className="rounded-lg border border-border bg-surface p-3" open={waveIndex === 0}>
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

      {waves.length > 1 && <p className="mt-5 text-sm font-bold">{t.delegation.wave(waveIndex + 1, waves.length)}</p>}
      <h3 ref={inboxRef} tabIndex={-1} className={`${waves.length > 1 ? "" : "mt-5 "}text-lg font-bold outline-offset-4`}>
        {waveIndex === 0 ? t.delegation.inbox : t.delegation.inboxLater}
      </h3>
      {notes.length > 0 && (
        <section className="mt-2 rounded-lg border-l-4 border-[var(--highlighter)] bg-surface p-3" aria-label={t.delegation.sinceThen}>
          <p className="text-sm font-bold">{t.delegation.sinceThen}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </section>
      )}
      <ul className="mt-2 space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="ticket">
            <div className="flex items-start gap-3">
              <CastBadge name={task.from} />
              <div className="min-w-0">
                <h4 className="text-lg">{task.title}</h4>
                <p className="text-sm text-muted">{t.delegation.from}: {task.from}</p>
              </div>
            </div>
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

      <ActionBar>
        <button
          type="button"
          disabled={count < tasks.length}
          onClick={() => {
            for (const [item, result] of delegationResults(stepId, spec, assigned, hinted, wave.taskIds)) onEvidence(item, result);
            setSent((s) => ({ ...s, ...Object.fromEntries(tasks.map((task) => [task.id, assigned[task.id]])) }));
            setShowing(true);
          }}
          className="btn btn-primary"
        >
          {t.delegation.send}
        </button>
        <span className="text-sm font-bold" aria-live="polite">{t.delegation.progress(count, tasks.length)}</span>
      </ActionBar>
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
