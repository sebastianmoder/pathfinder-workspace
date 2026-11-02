import type { Mission } from "./types";
import { m01 } from "./en/missions/m01";
import { m04 } from "./en/missions/m04";
import { m05 } from "./en/missions/m05";
import { t01 } from "./en/missions/t01";

export const missions: Mission[] = [m01, m04, m05, t01];

export function getMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}
