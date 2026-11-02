import type { SandboxGoal, SandboxSentence } from "@/content/types";
import { buildModel, predict, type Prediction } from "./toy-model";

export interface AskRecord extends Prediction {
  /** The top word, or null when the machine had nothing to continue with. */
  word: string | null;
  predicted: string;
  trainedIds: string[];
  afterSaying: boolean;
}

/** The model only ever sees the sentences it was last trained on, whatever the board shows now. */
export function askMachine(
  sentences: SandboxSentence[],
  trainedIds: string[],
  promptText: string,
  predicted: string,
  afterSaying: boolean,
): AskRecord {
  const trained = sentences.filter((s) => trainedIds.includes(s.id)).map((s) => s.text);
  const prediction = predict(buildModel(trained), promptText);
  return { ...prediction, word: prediction.ranked[0]?.word ?? null, predicted, trainedIds, afterSaying };
}

export function goalMet(goal: SandboxGoal, ask: AskRecord | null): boolean {
  if (!ask) return false;
  if (goal.word !== undefined && ask.word !== goal.word) return false;
  if (goal.afterSaying && !ask.afterSaying) return false;
  return (goal.include ?? []).every((id) => ask.trainedIds.includes(id));
}

/** True when the board no longer matches what the machine was trained on. */
export function isStale(on: string[], trained: string[] | null): boolean {
  if (!trained) return true;
  return on.length !== trained.length || on.some((id) => !trained.includes(id));
}
