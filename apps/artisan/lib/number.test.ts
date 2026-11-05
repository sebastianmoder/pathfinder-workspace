import { describe, expect, it } from "vitest";
import { inRange, parseNumber } from "./number";

describe("parseNumber", () => {
  it("reads numbers the way learners type them", () => {
    expect(parseNumber("€75")).toBe(75);
    expect(parseNumber(" 75.00 ")).toBe(75);
    expect(parseNumber("13.3 km/h")).toBe(13.3);
    expect(parseNumber("1,800")).toBe(1800);
    expect(parseNumber("41%")).toBe(41);
    expect(parseNumber("about 40")).toBeNaN();
  });

  it("checks a range inclusively, and never accepts what isn't a number", () => {
    expect(inRange("13.3", { min: 13.2, max: 13.4 })).toBe(true);
    expect(inRange("15", { min: 13.2, max: 13.4 })).toBe(false);
    expect(inRange("", { min: 0, max: 100 })).toBe(false);
  });
});
