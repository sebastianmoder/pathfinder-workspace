import type { CaseStory, Chapter, Scene } from "./types";
import { prologue } from "../en/story/prologue";
import { chapter1, chapter1Cases } from "../en/story/chapter-1";

export { flags } from "./flags";
export { cast, places } from "../en/story/cast";

/** The scene every new game starts with. */
export const opening: Scene = prologue;

/** Chapters follow the journey's stages. Those without scenes yet still give the stage its story title. */
export const chapters: Chapter[] = [
  chapter1,
  { stage: 2, title: "Chapter 2: The figure with no source" },
  { stage: 3, title: "Chapter 3: It spreads" },
  { stage: 4, title: "Chapter 4: The vote" },
  { stage: "capstone", title: "The Commission" },
];

export const caseStories: CaseStory[] = [...chapter1Cases];
