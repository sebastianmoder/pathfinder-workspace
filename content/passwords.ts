import type { PasswordEntry } from "./types";

/**
 * Append-only. Never edit or remove an existing code: learners may hold it.
 * If a mission is replaced, keep the old entry and set `supersededBy`.
 * Format: WORD-WORD-NN (digits 2–9 only, no look-alike characters).
 */
export const passwords: PasswordEntry[] = [
  { code: "MAPLE-LANTERN-42", missionId: "m01-foundations" },
  { code: "CEDAR-COMPASS-37", missionId: "m04-evidence" },
];
