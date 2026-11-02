import { describe, expect, it } from "vitest";
import { knockOut, type ArgumentLink } from "./argument";
import { PROPOSAL } from "@/content/types";

const links: ArgumentLink[] = [
  { cardId: "trial", kind: "supports", targetId: "completion" },
  { cardId: "other", kind: "supports", targetId: "completion" },
  { cardId: "credit", kind: "restsOn", targetId: "completion" },
  { cardId: "wrong", kind: "attacks", targetId: "completion" },
  { cardId: "homework", kind: "restsOn", targetId: PROPOSAL },
  { cardId: "terms", kind: "attacks", targetId: PROPOSAL },
];
const reasons = ["completion", "hours"];

describe("knockOut", () => {
  it("leaves everything standing when nothing is off", () => {
    expect(knockOut(reasons, links, [])).toEqual({ fallen: [], proposalUndercut: false, liveObjections: ["wrong", "terms"] });
  });

  it("drops a reason when an assumption under it goes", () => {
    expect(knockOut(reasons, links, ["credit"]).fallen).toEqual(["completion"]);
  });

  it("keeps a reason until all its evidence has gone", () => {
    expect(knockOut(reasons, links, ["trial"]).fallen).toEqual([]);
    expect(knockOut(reasons, links, ["trial", "other"]).fallen).toEqual(["completion"]);
  });

  it("does not drop a reason that never had evidence", () => {
    expect(knockOut(reasons, links, ["trial", "other"]).fallen).not.toContain("hours");
  });

  it("flags the proposal when an assumption it needs goes", () => {
    expect(knockOut(reasons, links, ["homework"]).proposalUndercut).toBe(true);
  });

  it("stops counting an objection to a reason that has already fallen", () => {
    expect(knockOut(reasons, links, ["credit"]).liveObjections).toEqual(["terms"]);
  });
});
