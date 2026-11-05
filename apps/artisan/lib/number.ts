/**
 * Reads a number the way learners type one: "€75", "75.00", "13.3 km/h", "1,800" or "41%" all work.
 * Returns NaN when there is no number at the start.
 */
export function parseNumber(value: string): number {
  return Number.parseFloat(value.toLowerCase().replace(/[€%,\s]/g, ""));
}

export const inRange = (value: string, range: { min: number; max: number }) => {
  const n = parseNumber(value);
  return n >= range.min && n <= range.max;
};
