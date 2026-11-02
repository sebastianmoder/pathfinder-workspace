import type { Mission } from "./types";
import { m01 } from "./en/missions/m01";

export const missions: Mission[] = [m01];

export function getMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}
