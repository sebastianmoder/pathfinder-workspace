"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import type { Mission, Step } from "@/content/types";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { ChoiceQuestion } from "./choice-question";
import { PasswordCard } from "./password-card";
import { FlowStepper } from "./activities/flow-stepper";
import { SortActivity } from "./activities/sort-activity";
import { ToyModelActivity } from "./activities/toy-model-activity";
import { ClaimAudit } from "./activities/claim-audit";
import { OpenResponse } from "./activities/open-response";
import { DialogueActivity, DialogueReplay } from "./activities/dialogue";
import { ArgumentMap } from "./activities/argument-map";

interface Props {
  mission: Mission;
  password: string;
  next: { missionId: string; title: string; password: string } | null;
}

export function MissionRunner({ mission, password, next }: Props) {
  const session = useSession();
  const pauseRef = useRef<HTMLDialogElement>(null);
  const pauseTitleId = useId();
  const { stepIndex, answers } = session.progress(mission.id);
  const step = mission.steps[stepIndex];
  const total = mission.steps.length;

  // Move focus to the new step when it changes, so keyboard and screen-reader users keep their place.
  const stepRef = useRef<HTMLElement>(null);
  const previousIndex = useRef(stepIndex);
  useEffect(() => {
    if (previousIndex.current !== stepIndex) {
      stepRef.current?.focus({ preventScroll: true });
      previousIndex.current = stepIndex;
    }
  }, [stepIndex]);

  const advance = () => {
    if (step.kind === "debrief") return;
    session.goTo(mission.id, stepIndex + 1);
    if (mission.steps[stepIndex + 1]?.kind === "debrief") session.complete(mission.id);
    window.scrollTo({ top: 0 });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <p className="text-sm text-muted">{t.mission.fictional}</p>
          <h1 className="text-2xl font-semibold">{mission.title}</h1>
          <p className="mt-1">{mission.outcome}</p>
        </div>
        <button type="button" onClick={() => pauseRef.current?.showModal()} className="no-print rounded border border-border px-3 py-1.5 text-sm">
          {t.mission.pause}
        </button>
      </div>

      <p className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm">{mission.scenario}</p>

      <div className="mt-6">
        <p className="text-sm text-muted">
          {t.mission.step(stepIndex + 1, total)}
          <progress className="ml-3 align-middle" value={stepIndex + 1} max={total} aria-label={t.mission.step(stepIndex + 1, total)} />
        </p>
        <section key={step.id} ref={stepRef} tabIndex={-1} aria-label={t.mission.step(stepIndex + 1, total)} className="mt-4 outline-offset-8">
          <StepView
            step={step}
            mission={mission}
            answers={answers}
            onAnswer={(choiceId, confidence) => {
              session.recordAttempt(mission.id, step.id, choiceId);
              if (confidence !== undefined) session.setAnswer(mission.id, step.id, { confidence });
            }}
            onContinue={advance}
            next={next}
            replayPassword={password}
          />
        </section>
      </div>

      <dialog
        ref={pauseRef}
        aria-labelledby={pauseTitleId}
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-lg border border-border bg-background p-5 text-foreground backdrop:bg-black/50"
      >
        <h2 id={pauseTitleId} className="text-lg font-semibold">{t.pause.title}</h2>
        <p className="my-3 text-sm">{t.pause.body(password, mission.title)} {t.pause.refreshNote}</p>
        <PasswordCard code={password} />
        <form method="dialog" className="mt-4">
          <button className="rounded bg-accent px-4 py-2 font-medium text-accent-foreground">{t.pause.close}</button>
        </form>
      </dialog>
    </div>
  );
}

function StepView({
  step,
  mission,
  answers,
  onAnswer,
  onContinue,
  next,
  replayPassword,
}: {
  step: Step;
  mission: Mission;
  answers: ReturnType<ReturnType<typeof useSession>["progress"]>["answers"];
  onAnswer: (choiceId: string, confidence: number | undefined) => void;
  onContinue: () => void;
  next: Props["next"];
  replayPassword: string;
}) {
  const session = useSession();

  switch (step.kind) {
    case "brief":
    case "refresher":
      return (
        <>
          <h2 className="text-xl font-medium">{step.title}</h2>
          <p className="mt-2">{step.body}</p>
          <button type="button" onClick={onContinue} className="mt-5 rounded bg-accent px-4 py-2 font-medium text-accent-foreground">
            {t.mission.next}
          </button>
        </>
      );

    case "initialJudgment":
    case "quiz":
      return (
        <ChoiceQuestion
          name={step.id}
          prompt={step.prompt}
          choices={step.choices}
          hints={step.hints}
          withConfidence={step.kind === "initialJudgment"}
          recordOnly={step.kind === "initialJudgment"}
          onCommit={onAnswer}
          onContinue={onContinue}
        />
      );

    case "transfer":
      return (
        <>
          <h2 className="mb-2 text-xl font-medium">{step.title}</h2>
          {"audit" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <ClaimAudit missionId={mission.id} stepId={step.id} audit={step.audit} showFinal={step.audit.claims.length > 1} onContinue={onContinue} />
            </>
          ) : (
            <ChoiceQuestion name={step.id} prompt={step.prompt} choices={step.choices} hints={step.hints} onCommit={onAnswer} onContinue={onContinue} />
          )}
        </>
      );

    case "claimAudit":
      return (
        <>
          <h2 className="text-xl font-medium">{step.title}</h2>
          <p className="mb-4 mt-1">{step.intro}</p>
          <ClaimAudit missionId={mission.id} stepId={step.id} audit={step.audit} showFinal onContinue={onContinue} />
        </>
      );

    case "revision": {
      const initialStep = mission.steps.find((s) => s.id === step.initialStepId);
      const initialChoices = initialStep && "choices" in initialStep ? initialStep.choices : [];
      const first = answers[step.initialStepId];
      const before = initialChoices.find((c) => c.id === first?.choiceId);
      const now = answers[step.id];
      const label = (n: number | undefined) => (n === undefined ? "—" : t.mission.confidence[n]);
      return (
        <>
          <h2 className="text-xl font-medium">{step.prompt}</h2>
          <p className="mt-3 rounded border border-border bg-surface p-3 text-sm">
            <strong>{t.mission.before}:</strong> {before?.label ?? "—"}
            {first?.confidence !== undefined && <> ({label(first.confidence)})</>}
          </p>
          <ChoiceQuestion
            name={step.id}
            prompt={t.mission.after}
            choices={step.choices}
            withConfidence={step.withConfidence}
            onCommit={onAnswer}
            onContinue={onContinue}
          />
          {step.withConfidence && now?.confidence !== undefined && first?.confidence !== undefined && (
            <p className="mt-3 text-sm">{t.mission.confidenceChange(label(first.confidence), label(now.confidence))}</p>
          )}
        </>
      );
    }

    case "openResponse":
      return <OpenResponse missionId={mission.id} step={step} onContinue={onContinue} />;

    case "flow":
      return <FlowStepper step={step} onContinue={onContinue} />;

    case "toyModel":
      return <ToyModelActivity step={step} onContinue={onContinue} />;

    case "dialogue":
      return (
        <DialogueActivity
          missionId={mission.id}
          step={step}
          initialChoiceId={answers[step.initialStepId]?.choiceId}
          onContinue={onContinue}
        />
      );

    case "argumentMap":
      return <ArgumentMap missionId={mission.id} step={step} onContinue={onContinue} />;

    case "sort":
      return <SortActivity step={step} onContinue={onContinue} />;

    case "debrief":
      return (
        <>
          <h2 className="text-xl font-medium">{t.debrief.title}</h2>
          <h3 className="mt-4 font-medium">{t.debrief.takeaway}</h3>
          <p>{step.takeaway}</p>
          <h3 className="mt-4 font-medium">{t.debrief.skills}</h3>
          <ul className="list-disc pl-5">
            {step.skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
          {mission.steps.map((s) =>
            s.kind === "dialogue" ? (
              <DialogueReplay key={s.id} missionId={mission.id} step={s} initialChoiceId={answers[s.initialStepId]?.choiceId} />
            ) : null,
          )}
          <div className="mt-6 space-y-4">
            {next ? (
              <div>
                <h3 className="font-medium">{t.debrief.next}: {next.title}</h3>
                <PasswordCard code={next.password} />
                <Link href={`/missions/${next.missionId}`} className="mt-3 inline-block rounded bg-accent px-4 py-2 font-medium text-accent-foreground">{next.title}</Link>
              </div>
            ) : (
              <p>{t.debrief.endOfContent}</p>
            )}
            <div>
              <h3 className="font-medium">{t.debrief.thisMission}</h3>
              <PasswordCard code={replayPassword} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => session.restart(mission.id)} className="rounded border border-border px-4 py-2">
                {t.debrief.replay}
              </button>
              <Link href="/map" className="underline">{t.map.title}</Link>
              <Link href="/summary" className="underline">{t.debrief.summary}</Link>
            </div>
          </div>
        </>
      );
  }
}
