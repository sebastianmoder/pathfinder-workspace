import type { PasswordEntry } from "./types";

/**
 * Append-only. Never edit or remove an existing code: learners may hold it.
 * If a mission is replaced, keep the old entry and set `supersededBy`.
 * Format: WORD-WORD-NN (digits 2–9 only, no look-alike characters).
 */
export const passwords: PasswordEntry[] = [
  { code: "HAZEL-BEACON-47", missionId: "m01-foundations" },
  { code: "CEDAR-COMPASS-37", missionId: "m04-evidence" },
  { code: "ALDER-THIMBLE-26", missionId: "m05-argument" },
  { code: "BIRCH-HARBOUR-58", missionId: "t01-transfer" },
  { code: "ROWAN-LEDGER-63", missionId: "m02-delegation" },
  { code: "WILLOW-QUILL-84", missionId: "m03-briefing" },
  { code: "MAPLE-ABACUS-29", missionId: "m07-numbers" },
  { code: "LINDEN-WHISTLE-35", missionId: "m06-gym" },
  { code: "HOLLY-LANTERN-72", missionId: "m06-teach" },
  { code: "OTTER-KEYSTONE-46", missionId: "m10-boundaries" },
  { code: "FINCH-PALETTE-53", missionId: "m11-cocreation" },
  { code: "HERON-DISPATCH-38", missionId: "m08-newsroom" },
  { code: "BRAMBLE-BALANCE-64", missionId: "m09-fairness" },
  { code: "GANNET-SPROCKET-57", missionId: "m12-systems" },
  { code: "PLOVER-FORUM-82", missionId: "m13-assembly" },
  { code: "QUARRY-BEACON-24", missionId: "b01-faq" },
  { code: "TERN-ALMANAC-93", missionId: "b03-report" },
  { code: "CORMORANT-SCOPE-25", missionId: "c01-scope" },
  { code: "KESTREL-LEDGER-48", missionId: "c01-evidence" },
  { code: "MARTIN-CIRCUIT-69", missionId: "c01-workflow" },
  { code: "OSPREY-CHARTER-87", missionId: "c01-review" },
];
