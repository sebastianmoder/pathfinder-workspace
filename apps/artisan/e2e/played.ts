import { modules } from "../content/journey";
import { missions } from "../content/missions";
import { caseStories, chapters, opening } from "../content/story";
import { scenesPlayedBy } from "../lib/story/story";

/**
 * A returning player's save in which every story scene has already been played once, so the case specs open
 * straight on each brief, as the game itself does for someone coming back. story.spec.ts starts fresh instead.
 */
const scenes = scenesPlayedBy({ opening, chapters, cases: caseStories }, modules, missions.map((m) => m.id));
export const scenesPlayed = JSON.stringify({ v: 2, story: { flags: {}, scenes } });
