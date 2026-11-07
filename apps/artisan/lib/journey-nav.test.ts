import { describe, expect, it } from "vitest";
import { modules } from "@/content/journey";
import { defaultSelection, entryMission, nextMission, nodeState, pathMissions, recommendedModule, seals, stageDone } from "./journey-nav";

const none = { inProgress: () => false, reached: () => undefined };
const get = (id: string) => modules.find((m) => m.id === id)!;

describe("journey navigation", () => {
  it("lists missions in path order, bridges after their stage and the capstone last", () => {
    const path = pathMissions(modules);
    expect(path[0]).toBe("m01-foundations");
    expect(path.indexOf("b01-faq")).toBe(path.indexOf("m03-briefing") + 1);
    expect(path.indexOf("t01-transfer")).toBeGreaterThan(path.indexOf("m07-numbers"));
    expect(path.slice(-4)).toEqual(["c01-scope", "c01-evidence", "c01-workflow", "c01-review"]);
  });

  it("marks only one bridge per stage 1–3", () => {
    const bridges = modules.filter((m) => m.bridge);
    expect(bridges.map((m) => m.stage)).toEqual([1, 2, 3]);
  });

  it("follows the suggested next mission unless it is done", () => {
    expect(nextMission(modules, "m01-foundations", "m02-delegation", [])).toBe("m02-delegation");
    expect(nextMission(modules, "m01-foundations", "m02-delegation", ["m02-delegation"])).toBe("m03-briefing");
    expect(nextMission(modules, "c01-review", null, pathMissions(modules))).toBeNull();
    expect(nextMission(modules, "c01-review", null, [])).toBe("m01-foundations");
  });

  it("recommends the first unfinished module, with work in hand selected first", () => {
    expect(recommendedModule(modules, ["m01-foundations"])?.id).toBe("M02");
    const busy = { ...none, inProgress: (id: string) => id === "m05-argument" };
    expect(defaultSelection(modules, { ...busy, completed: [] }).id).toBe("M05");
    expect(defaultSelection(modules, { ...none, completed: [] }).id).toBe("M01");
  });

  it("gives each node a state", () => {
    const p = { completed: ["m01-foundations", "m06-gym"], inProgress: (id: string) => id === "m04-evidence", reached: (id: string) => (id === "m07-numbers" ? ([3, 9] as [number, number]) : undefined) };
    expect(nodeState(get("M01"), modules, p)).toBe("done");
    expect(nodeState(get("M02"), modules, p)).toBe("next");
    expect(nodeState(get("M04"), modules, p)).toBe("active");
    expect(nodeState(get("M06"), modules, p)).toBe("open"); // one of two parts done
    expect(nodeState(get("M07"), modules, p)).toBe("reached");
    expect(entryMission(get("M06"), p)).toBe("m06-teach");
  });

  it("fills a stage's seal only when every module in it, bridge included, is done", () => {
    const stage1 = ["m01-foundations", "m02-delegation", "m03-briefing"];
    expect(stageDone(modules, 1, stage1)).toBe(false);
    expect(seals(modules, [...stage1, "b01-faq"])).toEqual([true, false, false, false]);
  });
});
