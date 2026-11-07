import type { ComposeCriterion, ComposeSpec, Contributor } from "@/content/types";
import { itemKey } from "./evidence";

export type Choices = Record<string, string>;

export interface Version {
  id: number;
  /** The version this one was edited from. Restoring an older version and changing it starts a branch. */
  parent: number | null;
  roundId: string;
  choices: Choices;
}

const optionOf = (spec: ComposeSpec, elementId: string, optionId: string | undefined) =>
  spec.elements.find((e) => e.id === elementId)?.options.find((o) => o.id === optionId);

/** The authored output for a workspace, as paragraphs. A part starting with "\n" begins a new paragraph. */
export function composeOutput(spec: ComposeSpec, choices: Choices): string[] {
  const order = spec.outputOrder ?? spec.elements.map((e) => e.id);
  const text = order
    .map((id) => optionOf(spec, id, choices[id])?.output ?? "")
    .filter((part) => part.trim() !== "")
    .join(" ")
    .replace(/ \n/g, "\n");
  return text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

const holds = (set: Record<string, string[]>, choices: Choices) =>
  Object.entries(set).every(([element, options]) => options.includes(choices[element]));

/** The option chosen for one element, for frames that place parts by element (a poster's headline, its image). */
export const partOf = (spec: ComposeSpec, choices: Choices, elementId: string) => optionOf(spec, elementId, choices[elementId]);

/** The image for the option chosen in an element, if it has one. */
export const sceneOf = (spec: ComposeSpec, choices: Choices, elementId: string) => partOf(spec, choices, elementId)?.scene;

export const criterionMet = (c: ComposeCriterion, choices: Choices) =>
  (!c.requires || holds(c.requires, choices)) && (!c.anyOf || c.anyOf.some((set) => holds(set, choices)));

export const allMet = (criteria: ComposeCriterion[], choices: Choices) => criteria.every((c) => criterionMet(c, choices));

export const changedElements = (from: Choices, to: Choices) =>
  Object.keys({ ...from, ...to }).filter((k) => from[k] !== to[k]);

export const wordCount = (paragraphs: string[]) => paragraphs.join(" ").split(/\s+/).filter(Boolean).length;

/** Who wrote each part of a version, in output order. Parts that add nothing are left out. */
export function contributions(spec: ComposeSpec, choices: Choices): { element: string; label: string; by: Contributor }[] {
  return spec.elements.flatMap((e) => {
    const o = optionOf(spec, e.id, choices[e.id]);
    return o && o.output.trim() ? [{ element: e.label, label: o.label, by: o.by ?? "you" }] : [];
  });
}

/** Depth of each version in the tree, for an indented list that reads correctly without the visual. */
export function versionDepths(versions: Version[]): Map<number, number> {
  const depth = new Map<number, number>();
  for (const v of versions) depth.set(v.id, v.parent === null ? 0 : (depth.get(v.parent) ?? 0) + 1);
  return depth;
}

/** Versions ordered so each one follows its parent, as a tree would be read. */
export function treeOrder(versions: Version[]): Version[] {
  const out: Version[] = [];
  const visit = (parent: number | null) => {
    for (const v of versions.filter((x) => x.parent === parent)) {
      out.push(v);
      visit(v.id);
    }
  };
  visit(null);
  return out;
}

/** Each round records reaching its goal unaided, and judging the checklist correctly the first time. */
export function composeItems(stepId: string, spec: ComposeSpec): string[] {
  return spec.rounds.flatMap((r) => [itemKey(stepId, r.id), itemKey(stepId, r.id, "checklist")]);
}
