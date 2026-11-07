import type { ModuleEntry } from "@/content/types";

export type StageId = 1 | 2 | 3 | 4 | "capstone";
export const STAGE_IDS = [1, 2, 3, 4] as const;

/** Where a module stands on the path, for the map's eyelets. Shape carries this as well as colour. */
export type NodeState = "done" | "active" | "reached" | "next" | "open";

export interface Progress {
  completed: readonly string[];
  /** Missions with work in this tab that isn't finished. */
  inProgress: (missionId: string) => boolean;
  /** Missions reached on an earlier visit and not finished. */
  reached: (missionId: string) => [number, number] | undefined;
}

const available = (modules: readonly ModuleEntry[]) => modules.filter((m) => m.status === "available");

export function moduleDone(m: ModuleEntry, completed: readonly string[]) {
  return m.missionIds.length > 0 && m.missionIds.every((id) => completed.includes(id));
}

/** Every mission in path order. The journey lists modules in curriculum order, bridges after their stage. */
export function pathMissions(modules: readonly ModuleEntry[]) {
  return available(modules).flatMap((m) => m.missionIds);
}

/** The first module on the path that isn't finished. */
export function recommendedModule(modules: readonly ModuleEntry[], completed: readonly string[]) {
  return available(modules).find((m) => !moduleDone(m, completed));
}

export function stageDone(modules: readonly ModuleEntry[], stage: StageId, completed: readonly string[]) {
  const inStage = available(modules).filter((m) => m.stage === stage);
  return inStage.length > 0 && inStage.every((m) => moduleDone(m, completed));
}

/** The capstone's four seals: one per stage, filled once every module in that stage is done. */
export function seals(modules: readonly ModuleEntry[], completed: readonly string[]) {
  return STAGE_IDS.map((stage) => stageDone(modules, stage, completed));
}

export function nodeState(m: ModuleEntry, modules: readonly ModuleEntry[], p: Progress): NodeState {
  if (moduleDone(m, p.completed)) return "done";
  if (m.missionIds.some(p.inProgress)) return "active";
  if (m.missionIds.some((id) => !p.completed.includes(id) && p.reached(id))) return "reached";
  if (recommendedModule(modules, p.completed)?.id === m.id) return "next";
  return "open";
}

/** The mission a module opens: work in hand first, then the first part not yet done, else the first part. */
export function entryMission(m: ModuleEntry, p: Progress) {
  return (
    m.missionIds.find((id) => !p.completed.includes(id) && p.inProgress(id)) ??
    m.missionIds.find((id) => !p.completed.includes(id)) ??
    m.missionIds[0]
  );
}

/** Which module the map shows first: work in hand, else the recommended next, else the first. */
export function defaultSelection(modules: readonly ModuleEntry[], p: Progress) {
  const list = available(modules);
  return (
    list.find((m) => !moduleDone(m, p.completed) && m.missionIds.some(p.inProgress)) ??
    recommendedModule(modules, p.completed) ??
    list[0]
  );
}

/**
 * The mission a debrief points to: the one its content suggests, unless that's done already, then the first
 * unfinished mission on the path. Null at the end of the path.
 */
export function nextMission(modules: readonly ModuleEntry[], currentId: string, suggested: string | null, completed: readonly string[]) {
  const done = (id: string) => id === currentId || completed.includes(id);
  const path = pathMissions(modules);
  if (suggested && path.includes(suggested) && !done(suggested)) return suggested;
  return path.find((id) => !done(id)) ?? null;
}
