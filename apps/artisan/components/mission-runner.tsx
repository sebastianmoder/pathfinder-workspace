"use client";

import { track } from '@pathfinder/analytics';
import { useEffect, useId, useRef, useState } from "react";
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
import { DelegationDesk, DelegationReplay } from "./activities/delegation-desk";
import { ComposeStudio } from "./activities/compose-studio";
import { ChartLab } from "./activities/chart-lab";
import { HelpGym } from "./activities/help-gym";
import { Casefile, CasefileReplay } from "./activities/casefile";
import { ThresholdLab } from "./activities/threshold-lab";
import { WorkflowRunner } from "./activities/workflow-runner";
import { AllocationBoard } from "./activities/allocation-board";
import { Epilogue } from "./activities/epilogue";
import { ActionBar, FamiliarContext, HowTo, StepIntro } from "./step-ui";
import { ArtefactFrame } from "./artefacts/frames";
import { activityKey, ownScreen, phasesOf, PHASES } from "@/lib/phases";

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
  // A refresher right after the brief shares the brief's screen, so it isn't counted as a step of its own.
  const screens = ownScreen(mission.steps);
  const total = screens.filter(Boolean).length;
  const shownIndex = screens.slice(0, stepIndex + 1).filter(Boolean).length; // 1-based
  const phases = phasesOf(mission.steps);
  const present = PHASES.filter((p) => phases.includes(p));

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
    session.markSeen(activityKey(step));
    let next = stepIndex + 1;
    while (next < mission.steps.length - 1 && !screens[next]) next++;
    session.goTo(mission.id, next);
    if (mission.steps[next]?.kind === "debrief") { if (!session.isCompleted(mission.id)) track('mission_complete', mission.id); session.complete(mission.id); }
    window.scrollTo({ top: 0 });
  };

  const first = stepIndex === 0;
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutId = useId();
  const tools = (
    <div className="no-print flex shrink-0 gap-2">
      {reminder && (
        <button type="button" onClick={() => helpRef.current?.showModal()} className="btn btn-secondary btn-small">
          {t.mission.remind}
        </button>
      )}
      <button type="button" onClick={() => pauseRef.current?.showModal()} className="btn btn-secondary btn-small">
        {t.mission.pause}
      </button>
    </div>
  );
  const progress = (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-sm font-bold">{t.mission.step(shownIndex, total)}</p>
        <div className="ruler w-full max-w-[22rem] flex-1 basis-40" aria-hidden="true">
          {mission.steps.map((s, i) => (screens[i] ? <span key={s.id} data-done={i <= stepIndex} /> : null))}
        </div>
      </div>
      <ol className="phases" aria-label={t.mission.phaseLabel}>
        {present.map((p) => (
          <li key={p} aria-current={p === phases[stepIndex] ? "step" : undefined}>{t.mission.phases[p]}</li>
        ))}
      </ol>
    </div>
  );

  return (
    <div>
      {first ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 basis-64">
              <h1 className="text-3xl sm:text-4xl">{mission.title}</h1>
              <p className="mt-1 max-w-3xl"><span className="font-bold">{t.mission.youWillLearn}</span> {mission.outcome}</p>
            </div>
            {tools}
          </div>
          <p className="mt-4 max-w-3xl border-l-4 border-border pl-3"><strong>{t.mission.fictional}</strong> {mission.scenario}</p>
          <div className="mt-6">{progress}</div>
        </>
      ) : (
        <div className="border-b border-border pb-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <h1 className="min-w-0 flex-1 basis-56 text-2xl">{mission.title}</h1>
            {tools}
          </div>
          <div className="mt-2">{progress}</div>
          {/* A button, not <details>: the case summary isn't a group of controls. */}
          <button
            type="button"
            aria-expanded={aboutOpen}
            aria-controls={aboutId}
            onClick={() => setAboutOpen((o) => !o)}
            className="no-print mt-2 text-sm text-muted underline-offset-4 hover:underline"
          >
            <span aria-hidden="true">{aboutOpen ? "▾ " : "▸ "}</span>
            {t.mission.aboutCase}
          </button>
          <div id={aboutId} hidden={!aboutOpen} className="mt-2 max-w-3xl space-y-2 border-l-4 border-border pl-3 text-sm">
            <p><span className="font-bold">{t.mission.youWillLearn}</span> {mission.outcome}</p>
            <p><strong>{t.mission.fictional}</strong> {mission.scenario}</p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <section key={step.id} ref={stepRef} tabIndex={-1} aria-label={t.mission.step(shownIndex, total)} className="mt-4 outline-offset-8">
          <FamiliarContext value={session.hasSeen(activityKey(step))}>
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
          </FamiliarContext>
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
  /** What an activity settled on, for epilogues and debrief replays. */
  const fact = (name: string, values: string[]) => session.setFact(mission.id, itemKey(step.id, name), values);

  switch (step.kind) {
    case "brief":
    case "refresher": {
      const index = mission.steps.indexOf(step);
      const folded = step.kind === "brief" ? mission.steps[index + 1] : undefined;
      return (
        <>
          <h2 className="text-2xl">{step.title}</h2>
          <p className="mt-2 max-w-3xl">{step.body}</p>
          {folded?.kind === "refresher" && (
            <details className="mt-4 max-w-3xl rounded-lg border border-border bg-surface p-3">
              <summary className="cursor-pointer font-semibold">{t.mission.refresherToggle}</summary>
              <h3 className="mt-2 font-bold">{folded.title}</h3>
              <p className="mt-1">{folded.body}</p>
            </details>
          )}
          <ActionBar>
            <button type="button" onClick={onContinue} className="btn btn-primary">
              {t.mission.next}
            </button>
          </ActionBar>
        </>
      );
    }

    case "initialJudgment":
    case "quiz":
      return (
        <>
          {step.artefact && <ArtefactFrame artefact={step.artefact} className="mb-5" />}
          <ChoiceQuestion
            howTo={step.kind === "initialJudgment" ? (step.withConfidence ? t.howTo.initialJudgment : t.howTo.initialJudgmentPlain) : undefined}
            name={step.id}
            prompt={step.prompt}
            choices={step.choices}
            hints={step.hints}
            withConfidence={step.kind === "initialJudgment" && !!step.withConfidence}
            recordOnly={step.kind === "initialJudgment"}
            onCommit={onAnswer}
            onEvidence={recordStep}
            onContinue={onContinue}
          />
        </>
      );

    case "transfer": {
      const howTo =
        "audit" in step ? t.howTo.claimAudit
        : "delegation" in step ? t.howTo.delegation
        : "allocation" in step ? t.howTo.allocation
        : "workflow" in step ? t.howTo.workflow
        : "casefile" in step ? t.howTo.casefile
        : "compose" in step ? t.howTo.compose
        : "problems" in step ? t.howTo.gymUnaided
        : "mark" in step ? (step.mode === "redact" ? t.howTo.markRedact : t.howTo.markFind)
        : undefined;
      if (!howTo && "choices" in step) {
        return (
          <>
            <StepIntro title={step.title} howTo={t.howTo.transferChoice} />
            <ChoiceQuestion name={step.id} prompt={step.prompt} choices={step.choices} hints={step.hints} onCommit={onAnswer} onEvidence={recordStep} onContinue={onContinue} />
          </>
        );
      }
      return (
        <>
          <StepIntro title={step.title} intro={step.prompt} howTo={"audit" in step ? undefined : howTo} />
          {"audit" in step ? (
            <ClaimAudit missionId={mission.id} stepId={step.id} audit={step.audit} showFinal={step.audit.claims.length > 1} onEvidence={record} onContinue={onContinue} />
          ) : "delegation" in step ? (
            <DelegationDesk stepId={step.id} spec={step.delegation} onEvidence={record} onFact={fact} onContinue={onContinue} />
          ) : "allocation" in step ? (
            <AllocationBoard stepId={step.id} spec={step.allocation} onEvidence={record} onFact={fact} onContinue={onContinue} />
          ) : "workflow" in step ? (
            <WorkflowRunner stepId={step.id} spec={step.workflow} onEvidence={record} onFact={fact} onContinue={onContinue} />
          ) : "casefile" in step ? (
            <Casefile stepId={step.id} spec={step.casefile} onEvidence={record} onFact={fact} onContinue={onContinue} />
          ) : "compose" in step ? (
            <ComposeStudio stepId={step.id} spec={step.compose} onEvidence={record} onContinue={onContinue} />
          ) : "problems" in step ? (
            <HelpGym stepId={step.id} problems={step.problems} onEvidence={record} onContinue={onContinue} />
          ) : "mark" in step ? (
            <MarkText
              paragraphs={step.mark}
              mode={step.mode}
              flow={step.flow}
              frame={step.frame}
              onResult={(id, right) => record(itemKey(step.id, id), { right })}
              onContinue={onContinue}
            />
          ) : null}
        </>
      );
    }

    case "claimAudit":
      return (
        <>
          <h2 className="mb-3 text-2xl">{step.title}</h2>
          <ClaimAudit missionId={mission.id} stepId={step.id} audit={step.audit} intro={step.intro} showFinal onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "delegation":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.delegation} />
          <DelegationDesk stepId={step.id} spec={step.delegation} onEvidence={record} onFact={fact} onContinue={onContinue} />
        </>
      );

    case "compose":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.compose} />
          <ComposeStudio stepId={step.id} spec={step.compose} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "chartLab":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.chartLab} />
          <ChartLab stepId={step.id} spec={step.chart} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "gym":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.gym} />
          <HelpGym stepId={step.id} problems={step.problems} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "mark":
      return (
        <>
          <StepIntro title={step.title} intro={step.prompt} howTo={step.mode === "redact" ? t.howTo.markRedact : t.howTo.markFind} />
          <MarkText
            paragraphs={step.mark}
            mode={step.mode}
            flow={step.flow}
            frame={step.frame}
            onResult={(id, right) => record(itemKey(step.id, id), { right })}
            onContinue={onContinue}
          />
        </>
      );

    case "casefile":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.casefile} />
          <Casefile stepId={step.id} spec={step.casefile} onEvidence={record} onFact={fact} onContinue={onContinue} />
        </>
      );

    case "thresholdLab":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.thresholdLab} />
          <ThresholdLab stepId={step.id} spec={step.lab} onEvidence={record} onContinue={onContinue} />
        </>
      );

    case "workflow":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.workflow} />
          <WorkflowRunner stepId={step.id} spec={step.workflow} onEvidence={record} onFact={fact} onContinue={onContinue} />
        </>
      );

    case "allocation":
      return (
        <>
          <StepIntro title={step.title} intro={step.intro} howTo={t.howTo.allocation} />
          <AllocationBoard stepId={step.id} spec={step.allocation} onEvidence={record} onFact={fact} onContinue={onContinue} />
        </>
      );

    case "revision": {
      const initialStep = mission.steps.find((s) => s.id === step.initialStepId);
      const initialChoices = initialStep && "choices" in initialStep ? initialStep.choices : [];
      const first = answers[step.initialStepId];
      const before = initialChoices.find((c) => c.id === first?.choiceId);
      const now = answers[step.id];
      const label = (n: number | undefined) => (n === undefined ? "—" : t.mission.confidence[n]);
      // A position is re-asked as it was. A question comes back as a new case that tests the same idea.
      const reAsk = initialStep?.kind === "initialJudgment" && step.prompt.includes(initialStep.prompt);
      return (
        <>
          <h2 className="text-2xl">{reAsk ? step.prompt : t.mission.revisitTitle}</h2>
          <HowTo steps={reAsk ? t.howTo.revision : t.howTo.revisionVariant} />
          {step.artefact && <ArtefactFrame artefact={step.artefact} className="mt-4" />}
          <p className="mt-3 rounded border border-border bg-surface p-3 text-sm">
            <strong>{reAsk ? t.mission.before : t.mission.firstMove}:</strong> {before?.label ?? "—"}
            {first?.confidence !== undefined && <> ({label(first.confidence)})</>}
          </p>
          <ChoiceQuestion
            name={step.id}
            prompt={reAsk ? t.mission.after : step.prompt}
            choices={step.choices}
            withConfidence={step.withConfidence}
            onCommit={onAnswer}
            onEvidence={recordStep}
            onContinue={onContinue}
          />
          {step.withConfidence && now?.confidence !== undefined && first?.confidence !== undefined && (
            <p className="mt-3 text-sm">{t.mission.confidenceChange(label(first.confidence), label(now.confidence))}</p>
          )}
          {!reAsk && now?.choiceId && before && (
            <div className="mt-4 rounded-lg border border-border bg-surface p-3" role="status">
              <h3 className="font-bold">{t.mission.lookBack}</h3>
              <p className="mt-1">
                <strong>
                  <span aria-hidden="true" className={before.verdict === "weaker" ? "mark-no" : "mark-yes"}>{before.verdict === "weaker" ? "✖ " : before.verdict === "correct" ? "✔ " : "◆ "}</span>
                  {before.label} {t.mission.verdict[before.verdict]}.
                </strong>{" "}
                {before.explanation}
              </p>
            </div>
          )}
        </>
      );
    }

    case "openResponse":
      return <OpenResponse missionId={mission.id} step={step} onEvidence={recordStep} onItemEvidence={record} onContinue={onContinue} />;

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

    case "epilogue":
      return <Epilogue missionId={mission.id} step={step} onContinue={onContinue} />;

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
          {mission.steps.map((s) =>
            "delegation" in s ? (
              <DelegationReplay key={s.id} title={s.title} spec={s.delegation} roles={session.progress(mission.id).facts[itemKey(s.id, "roles")]} />
            ) : "casefile" in s ? (
              <CasefileReplay key={s.id} title={s.title} spec={s.casefile} followed={session.progress(mission.id).facts[itemKey(s.id, "leads")]} />
            ) : null,
          )}
          <div className="mt-6 space-y-4">
            {next ? (
              <div>
                <h3 className="font-bold">{t.debrief.next}: {next.title}</h3>
                <PasswordCard code={next.password} />
                <Link href={`/missions/${next.missionId}`} prefetch={true} className="mt-3 inline-block btn btn-primary">{next.title}</Link>
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
