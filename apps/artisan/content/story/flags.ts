import type { FlagDef } from "./types";

/**
 * The decisions the story remembers. Each is read from what a finished mission already records (a choice, a
 * fact an activity reported, or how a task went), so no mission content changes to support it. None is a
 * score: a flag only chooses which lines later scenes use.
 *
 * The order of this list, and of each flag's values, is part of the return code (`lib/session/return-code.ts`).
 * Add new flags and values at the end; never reorder or remove.
 */
export const flags: FlagDef[] = [
  {
    // Sam's answer about the library's hours: used as it stood, thrown out, or checked.
    id: "firstAnswer",
    missionId: "m01-foundations",
    values: [{ value: "used", when: { choice: { step: "initial", ids: ["a"] } } }, { value: "dropped", when: { choice: { step: "initial", ids: ["c"] } } }, { value: "checked" }],
  },
  {
    // The hardship bursaries: ranked by the tool, decided from its summaries, or read by the panel.
    id: "bursaries",
    missionId: "m02-delegation",
    values: [
      { value: "ranked", when: { fact: { key: "desk/roles", any: ["bursary:automated"] } } },
      { value: "summaries", when: { fact: { key: "desk/roles", any: ["bursary:assisted"] } } },
      { value: "panel" },
    ],
  },
  {
    // The FAQ page's answers: live unchecked, written by hand, or drafted and checked.
    id: "faq",
    missionId: "b01-faq",
    values: [
      { value: "unchecked", when: { fact: { key: "roles/roles", any: ["answers:automated"] } } },
      { value: "handwritten", when: { fact: { key: "roles/roles", any: ["answers:human"] } } },
      { value: "checked" },
    ],
  },
  {
    // The recommendation on the Tuesday session: one the evidence could carry, or the weekly session it couldn't.
    id: "tuesday",
    missionId: "m04-evidence",
    values: [{ value: "measured", when: { evidence: { item: "audit/decision", right: true } } }, { value: "weekly" }],
  },
  {
    // The brochure's 40%: caught when it was passed off as Eastfield's finding, or let into the minutes.
    id: "forty",
    missionId: "m05-argument",
    values: [{ value: "caught", when: { evidence: { item: "forge/misquote", right: true } } }, { value: "minuted" }],
  },
  {
    // The flood photo: a correction published, or nothing run.
    id: "photo",
    missionId: "m08-newsroom",
    values: [{ value: "corrected", when: { choice: { step: "decide", ids: ["b"] } } }, { value: "held" }],
  },
  {
    // The screening tool: a continuing check asked for straight away, or only after taking the fix as the end.
    id: "monthlyCheck",
    missionId: "m09-fairness",
    values: [{ value: "asked", when: { evidence: { item: "limits", firstTry: true } } }, { value: "late" }],
  },
  {
    // The email assistant: launched to a small group first, or not at the first time of asking.
    id: "launch",
    missionId: "m12-systems",
    values: [{ value: "staged", when: { evidence: { item: "launch", firstTry: true } } }, { value: "other" }],
  },
  {
    // The citizens' panel: adopt with conditions, or something else.
    id: "vote",
    missionId: "m13-assembly",
    values: [{ value: "conditions", when: { choice: { step: "decide", ids: ["b"] } } }, { value: "other" }],
  },
  {
    // The panel's conditions: with or without the monthly review of benefits answers.
    id: "benefitsReview",
    missionId: "m13-assembly",
    values: [{ value: "funded", when: { fact: { key: "conditions/plan", any: ["review"] } } }, { value: "none" }],
  },
  {
    // The commission's conditions: with or without interpreter calls.
    id: "interpreter",
    missionId: "c01-review",
    values: [{ value: "funded", when: { fact: { key: "conditions/plan", any: ["interpreter"] } } }, { value: "none" }],
  },
];
