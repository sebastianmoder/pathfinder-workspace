import type { FlagDef } from "./types";

/**
 * The decisions the story remembers. Each is read from what a finished mission already records (a choice, or
 * a fact an activity reported), so no mission content changes to support it. None is a score: a flag only
 * chooses which lines later scenes use.
 */
export const flags: FlagDef[] = [
  {
    id: "firstAnswer",
    missionId: "m01-foundations",
    title: "Sam's answer about the library",
    values: [
      { value: "used", label: "You were ready to print it as it stood.", when: { choice: { step: "initial", ids: ["a"] } } },
      { value: "dropped", label: "You wanted to throw it out.", when: { choice: { step: "initial", ids: ["c"] } } },
      { value: "checked", label: "You checked it against the library's own notice." },
    ],
  },
  {
    id: "bursaries",
    missionId: "m02-delegation",
    title: "The hardship bursaries",
    values: [
      { value: "ranked", label: "The AI tool ranked the applications.", when: { fact: { key: "desk/roles", any: ["bursary:automated"] } } },
      { value: "summaries", label: "The panel decided from the AI tool's summaries.", when: { fact: { key: "desk/roles", any: ["bursary:assisted"] } } },
      { value: "panel", label: "The panel read every statement themselves." },
    ],
  },
  {
    id: "faq",
    missionId: "b01-faq",
    title: "The FAQ page",
    values: [
      { value: "unchecked", label: "The AI tool's answers went live unchecked.", when: { fact: { key: "roles/roles", any: ["answers:automated"] } } },
      { value: "handwritten", label: "Priya wrote every answer herself.", when: { fact: { key: "roles/roles", any: ["answers:human"] } } },
      { value: "checked", label: "The AI tool drafted the answers and Priya checked every fact." },
    ],
  },
];
