/**
 * A character's initials in a coloured disc, so a cast is recognisable at a glance. The colour comes from the
 * name, so the same person looks the same in every mission. Decorative: the name is always written beside it.
 */
const TONES = ["badge-mat", "badge-highlighter", "badge-pencil", "badge-ink"] as const;

export function initialsOf(name: string): string {
  const words = name.replace(/^@/, "").split(/[\s_,.]+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0][0], words[1][0]] : [words[0]?.[0] ?? "?"];
  return letters.join("").toUpperCase();
}

export function toneOf(name: string): (typeof TONES)[number] {
  let hash = 0;
  for (const ch of name.split(",")[0].trim()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

export function CastBadge({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const who = name.split(",")[0].trim();
  return (
    <span aria-hidden="true" className={`cast-badge ${toneOf(who)} ${size === "sm" ? "cast-badge-sm" : ""}`}>
      {initialsOf(who)}
    </span>
  );
}
