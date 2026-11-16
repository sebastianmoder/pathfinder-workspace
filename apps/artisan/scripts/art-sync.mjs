// Rewrites components/story/art-files.ts from the images present in assets/story, so a picture switches on
// as soon as its file is there. Run with `pnpm art:sync` after adding or removing an image.
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = readdirSync(join(root, "assets/story"))
  .filter((f) => /^[a-z0-9-]+\.(webp|png|jpe?g)$/.test(f))
  .sort();
const name = (f) => "art" + f.replace(/\.[a-z]+$/, "").replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

const lines = [
  "// Written by scripts/art-sync.mjs (`pnpm art:sync`). Don't edit by hand.",
  'import type { StaticImageData } from "next/image";',
  ...files.map((f) => `import ${name(f)} from "@/assets/story/${f}";`),
  "",
  "/** The story pictures that have been supplied, by slot id. */",
  "export const ART_FILES: Record<string, StaticImageData> = {",
  ...files.map((f) => `  ${JSON.stringify(f.replace(/\.[a-z]+$/, ""))}: ${name(f)},`),
  "};",
  "",
];
writeFileSync(join(root, "components/story/art-files.ts"), lines.join("\n"));
console.log(`${files.length} story image${files.length === 1 ? "" : "s"} found.`);
