import type { Choice, Mission, Step } from "@/content/types";

export interface MissionInput {
  stepIndex: number;
  answers: Record<string, { choiceId?: string; confidence?: number } | undefined>;
}

export interface MissionSummary {
  id: string;
  title: string;
  completed: boolean;
  /** Only present once the mission is finished: unfinished work has not shown these. */
  takeaway: string | null;
  skills: string[];
  before: { label: string; confidence: number | null } | null;
  after: { label: string; confidence: number | null } | null;
}

function answerOf(step: Step | undefined, answers: MissionInput["answers"]) {
  if (!step || !("choices" in step)) return null;
  const answer = answers[step.id];
  const choice: Choice | undefined = step.choices.find((c) => c.id === answer?.choiceId);
  return choice ? { label: choice.label, confidence: answer?.confidence ?? null } : null;
}

export function summarizeMission(mission: Mission, input: MissionInput, completed: boolean): MissionSummary | null {
  const started = input.stepIndex > 0 || Object.keys(input.answers).length > 0;
  if (!started && !completed) return null;
  const debrief = mission.steps.find((s) => s.kind === "debrief");
  const finished = completed && debrief?.kind === "debrief";
  return {
    id: mission.id,
    title: mission.title,
    completed,
    takeaway: finished ? debrief.takeaway : null,
    skills: finished ? debrief.skills : [],
    before: answerOf(mission.steps.find((s) => s.kind === "initialJudgment"), input.answers),
    after: answerOf(mission.steps.find((s) => s.kind === "revision"), input.answers),
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
    skills: string;
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
    if (m.takeaway) lines.push(`${s.labels.takeaway}: ${m.takeaway}`);
    if (m.skills.length) lines.push(`${s.labels.skills}: ${m.skills.join("; ")}`);
    lines.push("");
  }
  lines.push(s.labels.passwords);
  for (const p of s.passwords) lines.push(`- ${p.title}: ${p.code}`);
  return lines.join("\n");
}
