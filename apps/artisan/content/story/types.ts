import type { EpilogueCondition, MissionId } from "../types";
import type { StageId } from "@/lib/journey-nav";

/**
 * The story that runs through the cases ("The Riverside File"). It wraps missions and never changes them: a
 * scene plays before a case's brief and after its last task, and what the player decided in earlier cases
 * chooses between lines. Everything here is authored and fictional; nothing is generated.
 */

export type CastId = "joanna" | "sam" | "priya";
export type PlaceId = "street" | "frontDesk" | "office" | "homeworkRoom";

export interface CastMember {
  id: CastId;
  name: string;
  role: string;
}

export interface Place {
  id: PlaceId;
  name: string;
}

/** When a line applies. Every condition present must hold. */
export interface StoryCondition {
  /** A decision the story remembers has one of these values. */
  flag?: { id: string; is: string[] };
  /** Cases finished, all of them. */
  done?: MissionId[];
}

/** One line: spoken by a character, or narration when nobody is named. */
export interface Line {
  who?: CastId;
  text: string;
}

export type Beat =
  | (Line & { when?: StoryCondition })
  /** Alternatives: the first whose condition holds. The last has no condition, as the default. */
  | { either: { when?: StoryCondition; lines: Line[] }[] }
  /** A question put to the player inside the scene. Never scored; each answer has its own reply. */
  | { ask: Line; id: string; options: { id: string; label: string; reply: Line[] }[] };

export interface Scene {
  id: string;
  place: PlaceId;
  /** When it is, in the story, such as "Tuesday, 9:05". */
  when: string;
  /** A heading shown over the scene, used for chapter openings. */
  title?: string;
  beats: Beat[];
}

/** Something that goes into the Riverside file when a case is finished. */
export interface Clue {
  title: string;
  /** What the card says: the first text whose condition holds. The last has no condition. */
  text: { when?: StoryCondition; text: string }[];
  /** Modules whose clues this one ties to. A tie is shown once both are in the file. */
  ties: { moduleId: string; why: string }[];
}

/** The story around one module (a case): scenes per mission, and the clue the case leaves. */
export interface CaseStory {
  moduleId: string;
  /** Scenes before a mission's brief, by mission id. */
  open: Record<MissionId, Scene>;
  /** Scenes after a mission's last task, before its debrief. */
  close: Record<MissionId, Scene>;
  clue: Clue;
}

export interface Chapter {
  stage: StageId;
  title: string;
  opener?: Scene;
  /** Plays once every case in the chapter is finished. */
  closer?: Scene;
}

/** A decision the story remembers, worked out from a finished mission. */
export interface FlagDef {
  id: string;
  missionId: MissionId;
  /** What was decided, for the notebook. */
  title: string;
  /** The first value whose condition holds for what the player did. The last has no condition. */
  values: { value: string; label: string; when?: EpilogueCondition }[];
}
