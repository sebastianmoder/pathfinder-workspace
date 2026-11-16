/**
 * Where each case happens, on the town map. The Commons is drawn as a floor plan because most of the year is
 * spent inside it; the Gazette and the town hall are across town. Positions are shares of the map's width and
 * height, so the pins sit on the drawing at any size.
 */
export type SpotId = "frontDesk" | "office" | "homework" | "board" | "studio" | "backOffice" | "gazette" | "townHall";

export interface Spot {
  id: SpotId;
  /** The room or building as an SVG rectangle in the map's 100 × 124 units. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Cases set here, by module id, in path order. */
  cases: string[];
}

export const MAP_W = 100;
export const MAP_H = 124;

export const spots: Spot[] = [
  { id: "townHall", x: 6, y: 6, w: 40, h: 17, cases: ["M13", "C01"] },
  { id: "gazette", x: 54, y: 6, w: 40, h: 17, cases: ["M08"] },
  { id: "homework", x: 6, y: 34, w: 44, h: 20, cases: ["M03", "M06"] },
  { id: "board", x: 50, y: 34, w: 44, h: 20, cases: ["M05", "M09"] },
  { id: "office", x: 6, y: 54, w: 44, h: 20, cases: ["M02", "M04", "M07"] },
  { id: "studio", x: 50, y: 54, w: 44, h: 20, cases: ["T01", "M11", "B03"] },
  { id: "frontDesk", x: 6, y: 74, w: 44, h: 20, cases: ["M01", "B01"] },
  { id: "backOffice", x: 50, y: 74, w: 44, h: 20, cases: ["M10", "M12"] },
];

/** Pin places inside a room, as shares of the room: up to three, kept clear of the room's name. */
const SLOTS: [number, number][][] = [
  [],
  [[0.5, 0.66]],
  [[0.3, 0.66], [0.7, 0.66]],
  [[0.2, 0.66], [0.5, 0.66], [0.8, 0.66]],
];

/** Where a case's pin goes, as percentages of the map. */
export function pinOf(moduleId: string): { left: number; top: number } | null {
  const spot = spots.find((s) => s.cases.includes(moduleId));
  if (!spot) return null;
  const [dx, dy] = SLOTS[spot.cases.length][spot.cases.indexOf(moduleId)];
  return { left: ((spot.x + spot.w * dx) / MAP_W) * 100, top: ((spot.y + spot.h * dy) / MAP_H) * 100 };
}
