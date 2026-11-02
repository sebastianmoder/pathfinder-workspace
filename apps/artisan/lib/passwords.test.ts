import { describe, expect, it } from "vitest";
import { lookupPassword, normalizePassword, passwordForMission } from "./passwords";
import { passwords } from "@/content/passwords";
import { modules } from "@/content/journey";

describe("normalizePassword", () => {
  it.each([
    "MAPLE-LANTERN-42",
    "maple-lantern-42",
    "  maple lantern 42  ",
    "MapleLantern42",
    "maple_lantern.42",
  ])("treats %j as the same code", (input) => {
    expect(normalizePassword(input)).toBe("MAPLELANTERN42");
  });
});

describe("lookupPassword", () => {
  it("resolves variants to the mission", () => {
    expect(lookupPassword(" hazel beacon 47 ")?.missionId).toBe("m01-foundations");
  });

  it("returns null for unknown or empty input", () => {
    expect(lookupPassword("NOPE-NOPE-22")).toBeNull();
    expect(lookupPassword("   ")).toBeNull();
  });

  it("follows supersededBy so old codes keep working", () => {
    const registry = [{ code: "OLD-CODE-22", missionId: "old", supersededBy: "new" }];
    expect(lookupPassword("old code 22", registry)?.missionId).toBe("new");
  });
});

describe("password registry", () => {
  it("has unique codes after normalization", () => {
    const keys = passwords.map((p) => normalizePassword(p.code));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses WORD-WORD-NN with digits 2-9", () => {
    for (const p of passwords) expect(p.code).toMatch(/^[A-Z]{3,}-[A-Z]{3,}-[2-9]{2}$/);
  });

  it("gives every available mission exactly one active code", () => {
    const available = modules.filter((m) => m.status === "available").flatMap((m) => m.missionIds);
    for (const id of available) {
      const active = passwords.filter((p) => p.missionId === id && !p.supersededBy);
      expect(active, id).toHaveLength(1);
      expect(passwordForMission(id)).toBe(active[0].code);
    }
  });

  it("issues no code for planned modules", () => {
    const plannedMissions = modules.filter((m) => m.status === "planned").flatMap((m) => m.missionIds);
    for (const p of passwords) expect(plannedMissions).not.toContain(p.missionId);
  });
});
