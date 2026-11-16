// Writes ART-BRIEF.md from content/story/art.ts, so the brief never drifts from the slots the game uses.
// Run with `pnpm art:brief` after changing a prompt.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ART_NEVER, ART_STYLE, artSlots, promptOf } from "../content/story/art.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kinds = { title: "Title screen", place: "Places", portrait: "People" };
const used = {
  title: "Shown beside the title on the opening screen, about 500 pixels wide.",
  place: "Shown at the start of a scene, like a photo sent into the conversation, about 640 pixels wide.",
  portrait: "Shown as a small round avatar beside what the person says, so only the middle of the square is seen.",
};

const out = [
  "# Art brief",
  "",
  "The story shows a picture for each place and each person who speaks. None of them exists yet. Until a file is supplied the game does without it: a place is named in words and a person is shown by their initials.",
  "",
  "This file is written from `content/story/art.ts` by `pnpm art:brief`. Change the descriptions there, not here.",
  "",
  "## How to add a picture",
  "",
  "1. Give an image generator the whole prompt under the slot, exactly as written. Each prompt already contains the shared style and the shared list of things to leave out.",
  "2. Generate at the size given. Check the result against the “must show” and “must not show” lists before keeping it.",
  "3. Save it in `apps/artisan/assets/story/` under the slot's file name (`.png` or `.jpg` in place of `.webp` also works).",
  "4. Run `pnpm art:sync` in `apps/artisan`. The picture is now used wherever its slot appears.",
  "",
  "Generate all the people in one sitting, and all the places in another, so each set stays consistent. If the generator allows a reference image, use the first good picture of a set as the reference for the rest.",
  "",
  "## The shared style",
  "",
  ART_STYLE,
  "",
  "## Never, in any picture",
  "",
  ...ART_NEVER.map((n) => `- ${n}`),
  "",
];

for (const kind of ["title", "place", "portrait"]) {
  const slots = artSlots.filter((s) => s.kind === kind);
  out.push(`## ${kinds[kind]} (${slots.length})`, "", used[kind], "");
  for (const s of slots) {
    out.push(
      `### ${s.alt}`,
      "",
      `- File: \`assets/story/${s.id}.webp\``,
      `- Size: ${s.width} × ${s.height} pixels`,
      `- Subject: ${s.subject}`,
      `- Composition: ${s.composition}`,
      "- Must show:",
      ...s.include.map((i) => `  - ${i}`),
      "- Must not show (as well as the shared list):",
      ...s.exclude.map((i) => `  - ${i}`),
      "",
      "Prompt to paste:",
      "",
      "```text",
      promptOf(s),
      "```",
      "",
    );
  }
}
writeFileSync(join(root, "ART-BRIEF.md"), out.join("\n"));
console.log(`ART-BRIEF.md written: ${artSlots.length} pictures.`);
