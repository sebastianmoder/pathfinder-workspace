import type { Mission } from "./types";
import { m01 } from "./en/missions/m01";
import { m02 } from "./en/missions/m02";
import { m03 } from "./en/missions/m03";
import { b01 } from "./en/missions/b01";
import { m04 } from "./en/missions/m04";
import { m05 } from "./en/missions/m05";
import { t01 } from "./en/missions/t01";
import { m07 } from "./en/missions/m07";
import { m08 } from "./en/missions/m08";
import { m09 } from "./en/missions/m09";
import { m10 } from "./en/missions/m10";
import { m11 } from "./en/missions/m11";
import { b03 } from "./en/missions/b03";
import { m12 } from "./en/missions/m12";
import { m13 } from "./en/missions/m13";
import { c01Evidence, c01Review, c01Scope, c01Workflow } from "./en/missions/c01";
import { m06Gym } from "./en/missions/m06-gym";
import { m06Teach } from "./en/missions/m06-teach";

export const missions: Mission[] = [m01, m02, m03, b01, m04, m05, m06Gym, m06Teach, m07, t01, m08, m09, m10, m11, b03, m12, m13, c01Scope, c01Evidence, c01Workflow, c01Review];

export function getMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}
