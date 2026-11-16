import type { CaseStory, Chapter, Scene } from "./types";
import { prologue } from "../en/story/prologue";
import { chapter1, chapter1Cases } from "../en/story/chapter-1";
import { chapter2, chapter2Cases } from "../en/story/chapter-2";
import { chapter3, chapter3Cases } from "../en/story/chapter-3";
import { chapter4, chapter4Cases } from "../en/story/chapter-4";
import { capstone, capstoneCases } from "../en/story/capstone";

export { flags } from "./flags";
export { cast, places } from "../en/story/cast";
export { trace } from "../en/story/trace";

/** The scene every new game starts with. */
export const opening: Scene = prologue;

/** Chapters follow the journey's stages. */
export const chapters: Chapter[] = [chapter1, chapter2, chapter3, chapter4, capstone];

export const caseStories: CaseStory[] = [...chapter1Cases, ...chapter2Cases, ...chapter3Cases, ...chapter4Cases, ...capstoneCases];
