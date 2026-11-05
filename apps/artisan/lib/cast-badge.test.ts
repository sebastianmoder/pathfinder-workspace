import { describe, expect, it } from "vitest";
import { initialsOf, toneOf } from "@/components/artefacts/cast-badge";
import { missions } from "@/content/missions";

describe("cast badges", () => {
  it("takes initials from the name, not the role", () => {
    expect(initialsOf("Councillor Hughes")).toBe("CH");
    expect(initialsOf("@river_watcher_22")).toBe("RW");
    expect(initialsOf("Leo")).toBe("L");
  });

  it("gives everyone in a conversation a different colour, while there are colours to go round", () => {
    for (const m of missions)
      for (const s of m.steps)
        if (s.kind === "dialogue") {
          const names = s.dialogue.characters.map((c) => c.name);
          if (names.length <= 4) expect(new Set(names.map(toneOf)).size, `${m.id}: ${names.join(", ")}`).toBe(names.length);
        }
  });
});
