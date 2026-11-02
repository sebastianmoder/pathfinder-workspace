import { passwords } from "@/content/passwords";
import type { PasswordEntry } from "@/content/types";

/** Case, spacing and separators are ignored: "maple lantern 42" === "MAPLE-LANTERN-42". */
export function normalizePassword(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function lookupPassword(
  input: string,
  registry: PasswordEntry[] = passwords,
): { missionId: string; code: string } | null {
  const key = normalizePassword(input);
  if (!key) return null;
  const hit = registry.find((p) => normalizePassword(p.code) === key);
  if (!hit) return null;
  return { code: hit.code, missionId: hit.supersededBy ?? hit.missionId };
}

export function passwordForMission(
  missionId: string,
  registry: PasswordEntry[] = passwords,
): string | null {
  return registry.find((p) => p.missionId === missionId && !p.supersededBy)?.code ?? null;
}
