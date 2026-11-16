import Image from "next/image";
import { cast } from "@/content/en/story/cast";
import { castArt } from "@/content/story/art";
import type { CastId } from "@/content/story/types";
import { ART_FILES } from "@/components/story/art-files";

/**
 * A character's face, so a cast is recognisable at a glance. Someone from the story's cast is shown by their
 * portrait, the same one as in story scenes. Anyone else (or anyone whose portrait hasn't been supplied) gets
 * their initials in a coloured disc, the colour coming from the name so the same person looks the same in
 * every mission. Decorative: the name is always written beside it.
 */
const TONES = ["badge-mat", "badge-highlighter", "badge-pencil", "badge-ink"] as const;

export function initialsOf(name: string): string {
  const words = name.replace(/^@/, "").split(/[\s_,.]+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0][0], words[1][0]] : [words[0]?.[0] ?? "?"];
  return letters.join("").toUpperCase();
}

/** FNV-1a over the name, which spreads each conversation's cast across different tones. */
export function toneOf(name: string): (typeof TONES)[number] {
  let hash = 2166136261;
  for (const ch of name.split(",")[0].trim()) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return TONES[hash % TONES.length];
}

/**
 * The story cast member a name in a mission refers to: the name before any role ("Sam, front desk" is Sam),
 * matched exactly, so "Desk staff" or "@river_watcher_22" stay themselves.
 */
export function castOf(name: string): CastId | null {
  const who = name.split(",")[0].trim();
  return (Object.values(cast).find((c) => c.name === who)?.id as CastId | undefined) ?? null;
}

export function CastBadge({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const who = name.split(",")[0].trim();
  const id = castOf(name);
  const file = id ? ART_FILES[castArt[id].id] : undefined;
  const sizing = size === "sm" ? "cast-badge-sm" : "";
  if (file) {
    return (
      <span aria-hidden="true" className={`cast-badge cast-badge-photo ${sizing}`}>
        <Image src={file} alt="" sizes={size === "sm" ? "2rem" : "2.5rem"} className="cast-badge-image" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={`cast-badge ${toneOf(who)} ${sizing}`}>
      {initialsOf(who)}
    </span>
  );
}
