import type { EpilogueBeat, EpilogueCondition, EpilogueLine } from "@/content/types";
import type { EvidenceLedger } from "./evidence";

export interface EpilogueInput {
  /** The answer settled on in each question step, by step id. */
  choices: Record<string, string | undefined>;
  facts: Record<string, string[]>;
  evidence: EvidenceLedger;
}

export function conditionHolds(c: EpilogueCondition | undefined, input: EpilogueInput): boolean {
  if (!c) return true;
  if (c.choice && !c.choice.ids.includes(input.choices[c.choice.step] ?? "")) return false;
  if (c.fact) {
    const values = input.facts[c.fact.key];
    if (!values) return false;
    if (c.fact.all && !c.fact.all.every((v) => values.includes(v))) return false;
    if (c.fact.any && !c.fact.any.some((v) => values.includes(v))) return false;
    if (c.fact.none && c.fact.none.some((v) => values.includes(v))) return false;
  }
  if (c.evidence) {
    const record = input.evidence[c.evidence.item];
    if (!record) return false;
    if (c.evidence.right !== undefined && record.right !== c.evidence.right) return false;
    if (c.evidence.firstTry !== undefined && record.firstTry !== c.evidence.firstTry) return false;
  }
  return true;
}

/** What epilogues and conditional steps read, from a mission's progress in the session. */
export function inputFrom(progress: { answers: Record<string, { choiceId?: string }>; facts: Record<string, string[]>; evidence: EvidenceLedger }): EpilogueInput {
  return {
    choices: Object.fromEntries(Object.entries(progress.answers).map(([id, a]) => [id, a.choiceId])),
    facts: progress.facts,
    evidence: progress.evidence,
  };
}

/** The beat a line shows for this learner: the first whose conditions hold. */
export function beatFor(line: EpilogueLine, input: EpilogueInput): EpilogueBeat {
  return line.beats.find((b) => conditionHolds(b.when, input)) ?? line.beats[line.beats.length - 1];
}
