import type { Choice, Mission, Step } from "@/content/types";
import { calibrate, type Calibration, type TrustLevel } from "./audit";
import { assessSkill, type EvidenceLedger } from "./evidence";

export interface MissionInput {
  stepIndex: number;
  answers: Record<string, { choiceId?: string; confidence?: number } | undefined>;
  evidence: EvidenceLedger;
  stepState?: Record<string, unknown>;
}

export interface MissionSummary {
  id: string;
  title: string;
  completed: boolean;
  /** Only present once the mission is finished: unfinished work has not shown these. */
  takeaway: string | null;
  shown: string[];
  selfAssessed: string[];
  review: string[];
  before: { label: string; confidence: number | null } | null;
  after: { label: string; confidence: number | null } | null;
  /** First-read trust against the evidence, once an audit that asks for it is finished. */
  calibration: Calibration | null;
}

function answerOf(step: Step | undefined, answers: MissionInput["answers"]) {
  if (!step || !("choices" in step)) return null;
  const answer = answers[step.id];
  const choice: Choice | undefined = step.choices.find((c) => c.id === answer?.choiceId);
  return choice ? { label: choice.label, confidence: answer?.confidence ?? null } : null;
}

function calibrationOf(mission: Mission, input: MissionInput): Calibration | null {
  for (const step of mission.steps) {
    if (!("audit" in step) || !step.audit.trustFirst) continue;
    const state = input.stepState?.[step.id] as { trust?: Record<string, TrustLevel>; phase?: string } | undefined;
    if (state?.trust && (state.phase === "final" || state.phase === "decision")) return calibrate(step.audit.claims, state.trust);
  }
  return null;
}

export function summarizeMission(mission: Mission, input: MissionInput, completed: boolean): MissionSummary | null {
  const started = input.stepIndex > 0 || Object.keys(input.answers).length > 0;
  if (!started && !completed) return null;
  const debrief = mission.steps.find((s) => s.kind === "debrief");
  const finished = completed && debrief?.kind === "debrief";
  const skills = finished ? debrief.skills : [];
  const withStatus = (status: "shown" | "selfAssessed" | "review") =>
    skills.filter((s) => assessSkill(s, input.evidence).status === status).map((s) => s.label);
  return {
    id: mission.id,
    title: mission.title,
    completed,
    takeaway: finished ? debrief.takeaway : null,
    shown: withStatus("shown"),
    selfAssessed: withStatus("selfAssessed"),
    review: withStatus("review"),
    before: answerOf(mission.steps.find((s) => s.kind === "initialJudgment"), input.answers),
    after: answerOf(mission.steps.find((s) => s.kind === "revision"), input.answers),
    calibration: calibrationOf(mission, input),
  };
}

export interface SummaryText {
  heading: string;
  note: string;
  startingPoint: { question: string; answer: string }[];
  startingPointLabel: string;
  missions: MissionSummary[];
  labels: {
    takeaway: string;
    shown: string;
    selfAssessed: string;
    review: string;
    calibration: string;
    calibrationText: (c: Calibration) => string;
    before: string;
    after: string;
    notFinished: string;
    passwords: string;
  };
  confidenceLabels: readonly string[];
  passwords: { title: string; code: string }[];
}

/** Plain text for copying. Contains exactly what the page says it contains, and no written answers. */
export function summaryToText(s: SummaryText): string {
  const conf = (n: number | null) => (n === null ? "" : ` (${s.confidenceLabels[n]})`);
  const lines = [s.heading, s.note, ""];
  if (s.startingPoint.length) {
    lines.push(s.startingPointLabel);
    for (const a of s.startingPoint) lines.push(`- ${a.question} ${a.answer}`);
    lines.push("");
  }
  for (const m of s.missions) {
    lines.push(m.title);
    if (!m.completed) lines.push(s.labels.notFinished);
    if (m.before) lines.push(`${s.labels.before}: ${m.before.label}${conf(m.before.confidence)}`);
    if (m.after) lines.push(`${s.labels.after}: ${m.after.label}${conf(m.after.confidence)}`);
    if (m.calibration) lines.push(`${s.labels.calibration}: ${s.labels.calibrationText(m.calibration)}`);
    if (m.takeaway) lines.push(`${s.labels.takeaway}: ${m.takeaway}`);
    if (m.shown.length) lines.push(`${s.labels.shown}: ${m.shown.join("; ")}`);
    if (m.selfAssessed.length) lines.push(`${s.labels.selfAssessed}: ${m.selfAssessed.join("; ")}`);
    if (m.review.length) lines.push(`${s.labels.review}: ${m.review.join("; ")}`);
    lines.push("");
  }
  lines.push(s.labels.passwords);
  for (const p of s.passwords) lines.push(`- ${p.title}: ${p.code}`);
  return lines.join("\n");
}
