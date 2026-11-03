"use client";

import { track } from '@pathfinder/analytics';
import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import type { Mission, Step } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { ChoiceQuestion } from "./choice-question";
import { PasswordCard } from "./password-card";
import { DebriefSkills } from "./debrief-skills";
import { SortActivity } from "./activities/sort-activity";
import { SandboxActivity } from "./activities/sandbox";
import { FaultTrace } from "./activities/fault-trace";
import { ClaimAudit } from "./activities/claim-audit";
import { OpenResponse } from "./activities/open-response";
import { DialogueActivity, DialogueReplay } from "./activities/dialogue";
import { ArgumentMap } from "./activities/argument-map";
import { MarkText } from "./activities/mark-text";
import { DelegationDesk } from "./activities/delegation-desk";
import { ComposeStudio } from "./activities/compose-studio";
import { ChartLab } from "./activities/chart-lab";
import { HelpGym } from "./activities/help-gym";
import { Casefile } from "./activities/casefile";
import { ThresholdLab } from "./activities/threshold-lab";
import { WorkflowRunner } from "./activities/workflow-runner";
import { AllocationBoard } from "./activities/allocation-board";

interface Props {
  mission: Mission;
  password: string;
  next: { missionId: string; title: string; password: string } | null;
}

export function MissionRunner({ mission, password, next }: Props) {
  const session = useSession();
  const pauseRef = useRef<HTMLDialogElement>(null);
  const helpRef = useRef<HTMLDialogElement>(null);
  const helpTitleId = useId();
  const reminder = mission.steps.find((s) => s.kind === "refresher");
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
    if (stepIndex === 0) track('mission_start', mission.id);
    session.goTo(mission.id, stepIndex + 1);
    if (mission.steps[stepIndex + 1]?.kind === "debrief") { if (!session.isCompleted(mission.id)) track('mission_complete', mission.id); session.complete(mission.id); }
    window.scrollTo({ top: 0 });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <h1 className="text-3xl sm:text-4xl">{mission.title}</h1>
          <p className="mt-1 max-w-3xl">{mission.outcome}</p>
        </div>
        <div className="no-print flex gap-2">
          {reminder && (
            <button type="button" onClick={() => helpRef.current?.showModal()} className="btn btn-secondary btn-small">
              {t.mission.remind}
            </button>
          )}
          <button type="button" onClick={() => pauseRef.current?.showModal()} className="btn btn-secondary btn-small">
            {t.mission.pause}
          </button>
        </div>
      </div>

      <p className="mt-4 max-w-3xl border-l-4 border-border pl-3"><strong>{t.mission.fictional}</strong> {mission.scenario}</p>

      <div className="mt-6">
        <p className="text-sm font-bold">{t.mission.step(stepIndex + 1, total)}</p>
        <div className="ruler mt-1" aria-hidden="true">
          {mission.steps.map((s, i) => (
            <span key={s.id} data-done={i <= stepIndex} />
          ))}
        </div>
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

      {reminder?.kind === "refresher" && (
        <dialog
          ref={helpRef}
          aria-labelledby={helpTitleId}
          className="m-auto w-[min(32rem,calc(100%-2rem))] border border-border bg-background p-5 text-foreground backdrop:bg-black/50"
        >
          <h2 id={helpTitleId} className="text-2xl">{t.mission.remindTitle}</h2>
          <p className="my-3">{reminder.body}</p>
          <form method="dialog">
            <button className="btn btn-primary">{t.mission.remindClose}</button>
          </form>
        </dialog>
      )}

      <dialog
        ref={pauseRef}
        aria-labelledby={pauseTitleId}
        className="m-auto w-[min(32rem,calc(100%-2rem))] border border-border bg-background p-5 text-foreground backdrop:bg-black/50"
      >
        <h2 id={pauseTitleId} className="text-2xl">{t.pause.title}</h2>
        <p className="my-3 text-sm">{t.pause.body(password, mission.title)} {t.pause.refreshNote}</p>
        <PasswordCard code={password} />
        <form method="dialog" className="mt-4">
          <button className="btn btn-primary">{t.pause.close}</button>
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
  const record = (item: string, result: EvidenceResult) => session.recordEvidence(mission.id, item, result);
  const recordStep = (result: EvidenceResult) => record(step.id, result);

  switch (step.kind) {
    case "brief":
    case "refresher":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-2">{step.body}</p>
          <button type="button" onClick={onContinue} className="mt-5 btn btn-primary">
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
          onEvidence={recordStep}
          onContinue={onContinue}
        />
      );

    case "transfer":
      return (
        <>
          <h2 className="mb-2 text-2xl">{step.title}</h2>
          {"audit" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <ClaimAudit missionId={mission.id} stepId={step.id} audit={step.audit} showFinal={step.audit.claims.length > 1} onEvidence={record} onContinue={onContinue} />
            </>
          ) : "delegation" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <DelegationDesk stepId={step.id} spec={step.delegation} onEvidence={record} onContinue={onContinue} />
            </>
          ) : "allocation" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <AllocationBoard stepId={step.id} spec={step.allocation} onEvidence={record} onContinue={onContinue} />
            </>
          ) : "workflow" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <WorkflowRunner stepId={step.id} spec={step.workflow} onEvidence={record} onContinue={onContinue} />
            </>
          ) : "casefile" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <Casefile stepId={step.id} spec={step.casefile} onEvidence={record} onContinue={onContinue} />
            </>
          ) : "compose" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <ComposeStudio stepId={step.id} spec={step.compose} onEvidence={record} onContinue={onContinue} />
            </>
          ) : "mark" in step ? (
            <>
              <p className="mb-4">{step.prompt}</p>
              <MarkText
                paragraphs={step.mark}
                mode={step.mode}
                flow={step.flow}
                onResult={(id, right) => record(itemKey(step.id, id), { right })}
                onContinue={onContinue}
              />
            </>
          ) : (
            <ChoiceQuestion name={step.id} prompt={step.prompt} choices={step.choices} hints={step.hints} onCommit={onAnswer} onEvidence={recordStep} onContinue={onContinue} />
          )}
        </>
      );

    case "claimAudit":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <ClaimAudit missionId={mission.id} stepId={step.id} audit={step.audit} intro={step.intro} showFinal onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "delegation":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <DelegationDesk stepId={step.id} spec={step.delegation} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "compose":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <ComposeStudio stepId={step.id} spec={step.compose} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "chartLab":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <ChartLab stepId={step.id} spec={step.chart} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "gym":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <HelpGym stepId={step.id} problems={step.problems} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "mark":
      return (
        <>
          <h2 className="mb-2 text-2xl">{step.title}</h2>
          <p className="mb-4">{step.prompt}</p>
          <MarkText
            paragraphs={step.mark}
            mode={step.mode}
            flow={step.flow}
            onResult={(id, right) => record(itemKey(step.id, id), { right })}
            onContinue={onContinue}
          />
        </>
      );

    case "casefile":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <Casefile stepId={step.id} spec={step.casefile} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "thresholdLab":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <ThresholdLab stepId={step.id} spec={step.lab} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "workflow":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <WorkflowRunner stepId={step.id} spec={step.workflow} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "allocation":
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-1 mb-4">{step.intro}</p>
          <AllocationBoard stepId={step.id} spec={step.allocation} onEvidence={record} onContinue={onContinue} />
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
          <h2 className="text-2xl">{step.prompt}</h2>
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
            onEvidence={recordStep}
            onContinue={onContinue}
          />
          {step.withConfidence && now?.confidence !== undefined && first?.confidence !== undefined && (
            <p className="mt-3 text-sm">{t.mission.confidenceChange(label(first.confidence), label(now.confidence))}</p>
          )}
        </>
      );
    }

    case "openResponse":
      return <OpenResponse missionId={mission.id} step={step} onEvidence={recordStep} onContinue={onContinue} />;

    case "sandbox":
      return <SandboxActivity missionId={mission.id} step={step} onEvidence={record} onContinue={onContinue} />;

    case "faultTrace":
      return <FaultTrace step={step} onEvidence={record} onContinue={onContinue} />;

    case "dialogue":
      return (
        <DialogueActivity
          missionId={mission.id}
          step={step}
          initialChoiceId={answers[step.initialStepId]?.choiceId}
          onEvidence={record}
          onContinue={onContinue}
        />
      );

    case "argumentMap":
      return <ArgumentMap mission={mission} step={step} onEvidence={record} onContinue={onContinue} />;

    case "sort":
      return <SortActivity step={step} onEvidence={record} onContinue={onContinue} />;

    case "debrief":
      return (
        <>
          <h2 className="text-2xl">{t.debrief.title}</h2>
          <div className="mat mt-3 p-5 sm:p-8">
            <h3 className="text-sm font-normal">{t.debrief.takeaway}</h3>
            <p className="mt-1 max-w-3xl font-[family-name:var(--font-zilla)] text-2xl font-semibold leading-tight sm:text-3xl">{step.takeaway}</p>
          </div>
          <DebriefSkills missionId={mission.id} skills={step.skills} />
          {mission.steps.map((s) =>
            s.kind === "dialogue" ? (
              <DialogueReplay key={s.id} missionId={mission.id} step={s} initialChoiceId={answers[s.initialStepId]?.choiceId} />
            ) : null,
          )}
          <div className="mt-6 space-y-4">
            {next ? (
              <div>
                <h3 className="font-bold">{t.debrief.next}: {next.title}</h3>
                <PasswordCard code={next.password} />
                <Link href={`/missions/${next.missionId}`} className="mt-3 inline-block btn btn-primary">{next.title}</Link>
              </div>
            ) : (
              <p>{t.debrief.endOfContent}</p>
            )}
            <div>
              <h3 className="font-bold">{t.debrief.thisMission}</h3>
              <PasswordCard code={replayPassword} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => session.restart(mission.id)} className="btn btn-secondary">
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
