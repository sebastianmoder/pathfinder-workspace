import type { ModuleEntry } from "@/content/types";
import type { Beat, CaseStory, Chapter, Clue, FlagDef, Line, Scene, StoryCondition } from "@/content/story/types";
import { conditionHolds, type EpilogueInput } from "@/lib/epilogue";
import { moduleDone, stageDone } from "@/lib/journey-nav";

/** What the story knows about the player: the decisions it remembers and the cases finished. */
export interface StoryState {
  flags: Record<string, string>;
  completed: readonly string[];
}

export function holds(c: StoryCondition | undefined, state: StoryState): boolean {
  if (!c) return true;
  if (c.flag && !c.flag.is.includes(state.flags[c.flag.id] ?? "")) return false;
  if (c.done && !c.done.every((id) => state.completed.includes(id))) return false;
  return true;
}

/** A line as it appears in the conversation: someone's, the narration's, or the player's own answer. */
export type SaidLine = Line & { you?: boolean };

export interface Asked {
  id: string;
  options: { id: string; label: string }[];
}

/**
 * The lines of a scene for this player, up to the first question they haven't answered. `asking` is that
 * question; once it is answered (in `picks`), the player's answer, its reply and the lines after it follow.
 */
export function unfold(scene: Scene, state: StoryState, picks: Record<string, string>): { lines: SaidLine[]; asking: Asked | null } {
  const lines: SaidLine[] = [];
  for (const beat of scene.beats) {
    if ("either" in beat) {
      const alternative = beat.either.find((a) => holds(a.when, state)) ?? beat.either[beat.either.length - 1];
      lines.push(...alternative.lines);
    } else if ("ask" in beat) {
      lines.push(beat.ask);
      const picked = beat.options.find((o) => o.id === picks[beat.id]);
      if (!picked) return { lines, asking: { id: beat.id, options: beat.options.map(({ id, label }) => ({ id, label })) } };
      lines.push({ you: true, text: picked.label }, ...picked.reply);
    } else if (holds(beat.when, state)) {
      lines.push({ who: beat.who, text: beat.text });
    }
  }
  return { lines, asking: null };
}

export interface StoryBook {
  opening: Scene;
  chapters: Chapter[];
  cases: CaseStory[];
}

const caseOf = (book: StoryBook, moduleId: string) => book.cases.find((c) => c.moduleId === moduleId);
const chapterOf = (book: StoryBook, m: ModuleEntry) => book.chapters.find((c) => c.stage === m.stage);
const unseen = (seen: readonly string[]) => (scene: Scene | undefined): scene is Scene => !!scene && !seen.includes(scene.id);

/**
 * The scenes that play before a mission's brief: the prologue on a first visit, the chapter's opening the
 * first time one of its cases is opened, then the case's own. A mission without a scene of its own plays
 * none, so cases whose story isn't written yet open as they always did.
 */
export function scenesBefore(book: StoryBook, m: ModuleEntry, missionId: string, seen: readonly string[]): Scene[] {
  const own = caseOf(book, m.id)?.open[missionId];
  if (!own || seen.includes(own.id)) return [];
  return [book.opening, chapterOf(book, m)?.opener, own].filter(unseen(seen));
}

/** The scenes after a mission's last task: the case's own, then the chapter's close once the chapter is finished. */
export function scenesAfter(book: StoryBook, m: ModuleEntry, missionId: string, seen: readonly string[], modules: readonly ModuleEntry[], completed: readonly string[]): Scene[] {
  const own = caseOf(book, m.id)?.close[missionId];
  const finished = [...completed, missionId];
  const closer = stageDone(modules, m.stage, finished) ? chapterOf(book, m)?.closer : undefined;
  return [own, closer].filter(unseen(seen));
}

/** The activity, if any, that comes between a mission's opening scene and its brief. */
export function interludeOf(book: StoryBook, m: ModuleEntry, missionId: string) {
  return caseOf(book, m.id)?.interlude?.[missionId] ?? null;
}

/** The values a finished mission gives the story's flags. */
export function deriveFlags(defs: readonly FlagDef[], missionId: string, input: EpilogueInput): Record<string, string> {
  const out: Record<string, string> = {};
  for (const def of defs) {
    if (def.missionId !== missionId) continue;
    const value = def.values.find((v) => conditionHolds(v.when, input)) ?? def.values[def.values.length - 1];
    out[def.id] = value.value;
  }
  return out;
}

export function clueText(clue: Clue, state: StoryState): string {
  return (clue.text.find((t) => holds(t.when, state)) ?? clue.text[clue.text.length - 1]).text;
}

export interface FiledClue {
  moduleId: string;
  /** In the file once every mission of the case is finished. */
  found: boolean;
  title: string;
  text: string;
  /** Ties to other clues already in the file. */
  ties: { moduleId: string; title: string; why: string }[];
}

/** The Riverside file as it stands: one entry per case that has a clue, in path order. */
export function fileOf(book: StoryBook, modules: readonly ModuleEntry[], state: StoryState): FiledClue[] {
  const found = (id: string) => {
    const m = modules.find((x) => x.id === id);
    return !!m && moduleDone(m, state.completed);
  };
  return modules.flatMap((m) => {
    const story = caseOf(book, m.id);
    if (!story) return [];
    return [{
      moduleId: m.id,
      found: found(m.id),
      title: story.clue.title,
      text: clueText(story.clue, state),
      ties: story.clue.ties
        .filter((tie) => found(tie.moduleId) && caseOf(book, tie.moduleId))
        .map((tie) => ({ moduleId: tie.moduleId, title: caseOf(book, tie.moduleId)!.clue.title, why: tie.why })),
    }];
  });
}

/** Every line a beat could produce, for checks on the content. */
export function allLines(beat: Beat): Line[] {
  if ("either" in beat) return beat.either.flatMap((a) => a.lines);
  if ("ask" in beat) return [beat.ask, ...beat.options.flatMap((o) => o.reply)];
  return [beat];
}

/** The lists that fix the meaning of a return code: missions and flags, each in its declared order. */
export function codeShape(missionIds: readonly string[], defs: readonly FlagDef[]) {
  return { missions: missionIds, flags: defs.map((d) => ({ id: d.id, values: d.values.map((v) => v.value) })) };
}

/**
 * The scenes someone with these finished missions has been through, so that a game restored from a return
 * code doesn't replay them.
 */
export function scenesPlayedBy(book: StoryBook, modules: readonly ModuleEntry[], completed: readonly string[]): string[] {
  if (completed.length === 0) return [];
  const ids = [book.opening.id];
  for (const m of modules) {
    const done = m.missionIds.filter((id) => completed.includes(id));
    if (done.length === 0) continue;
    const chapter = chapterOf(book, m);
    if (chapter?.opener) ids.push(chapter.opener.id);
    if (chapter?.closer && stageDone(modules, m.stage, completed)) ids.push(chapter.closer.id);
    const story = caseOf(book, m.id);
    for (const id of done) {
      if (story?.open[id]) ids.push(story.open[id].id);
      if (story?.close[id]) ids.push(story.close[id].id);
      if (story?.interlude?.[id]) ids.push(`${story.interlude[id]}:${id}`);
    }
  }
  return [...new Set(ids)];
}
