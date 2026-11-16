import { describe, expect, it } from "vitest";
import { missions } from "@/content/missions";
import { flags } from "@/content/story";
import { decodeCode, encodeCode, type CodeShape } from "./return-code";
import { codeShape } from "@/lib/story/story";

const shape: CodeShape = codeShape(missions.map((m) => m.id), flags);
const game = { completed: ["m01-foundations", "b01-faq", "m08-newsroom"], flags: { firstAnswer: "dropped", faq: "unchecked", photo: "corrected" } };

describe("return code", () => {
  it("round-trips finished cases and the story's decisions", () => {
    const code = encodeCode(shape, game);
    expect(decodeCode(shape, code)).toEqual({ ok: true, content: game });
    expect(decodeCode(shape, encodeCode(shape, { completed: [], flags: {} }))).toEqual({ ok: true, content: { completed: [], flags: {} } });
  });

  it("is short, and reads the same however it is typed", () => {
    const code = encodeCode(shape, game);
    expect(code).toMatch(/^[0-9A-Z]{4}(-[0-9A-Z]{1,4})+$/);
    expect(code.replace(/-/g, "").length).toBeLessThanOrEqual(16);
    expect(decodeCode(shape, ` ${code.toLowerCase().replace(/-/g, " ")} `)).toEqual({ ok: true, content: game });
  });

  it("refuses a mistyped or malformed code, and says which", () => {
    const code = encodeCode(shape, game);
    const swapped = (code[0] === "2" ? "3" : "2") + code.slice(1);
    expect(decodeCode(shape, swapped)).toEqual({ ok: false, reason: "mistyped" });
    expect(decodeCode(shape, "hello")).toEqual({ ok: false, reason: "malformed" });
    expect(decodeCode(shape, code + "9")).toEqual({ ok: false, reason: "malformed" });
  });

  // The position of every mission and flag is part of the code. If this fails, a list was reordered or
  // something was removed: add new missions, flags and values at the end instead.
  it("keeps the meaning of codes already given out", () => {
    expect(encodeCode(shape, game)).toBe(PINNED);
    expect(shape.missions.slice(0, 21)).toEqual([
      "m01-foundations", "m02-delegation", "m03-briefing", "b01-faq", "m04-evidence", "m05-argument", "m06-gym", "m06-teach", "m07-numbers", "t01-transfer",
      "m08-newsroom", "m09-fairness", "m10-boundaries", "m11-cocreation", "b03-report", "m12-systems", "m13-assembly", "c01-scope", "c01-evidence", "c01-workflow", "c01-review",
    ]);
    expect(shape.flags.slice(0, 11).map((f) => `${f.id}:${f.values.join("/")}`)).toEqual([
      "firstAnswer:used/dropped/checked", "bursaries:ranked/summaries/panel", "faq:unchecked/handwritten/checked", "tuesday:measured/weekly", "forty:caught/minuted",
      "photo:corrected/held", "monthlyCheck:asked/late", "launch:staged/other", "vote:conditions/other", "benefitsReview:funded/none", "interpreter:funded/none",
    ]);
  });
});

const PINNED = "6820-110G-00QJ";
