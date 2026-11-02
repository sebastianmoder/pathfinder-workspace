import type { DialogueChoice, DialogueNode, DialogueSpec } from "@/content/types";

export interface Turn {
  node: DialogueNode;
  /** The choice the learner made at this node, if any yet. */
  choice?: DialogueChoice;
}

export interface Walk {
  turns: Turn[];
  /** The last node reached, which is where the learner is now. */
  current: DialogueNode;
  ended: boolean;
  /** Discovery ids gained so far, in the order reached, without repeats. */
  discovered: string[];
  /** The moves open now. When the questions have run out, moving on is the only one. */
  options: DialogueChoice[];
  /** Whether a passage can be shown as a reply now. */
  canCite: boolean;
  /** Null when this conversation has no limit, or has moved past the point where the limit matters. */
  questionsLeft: number | null;
}

const CITE_PREFIX = "cite:";
export const citeChoiceId = (passageId: string) => `${CITE_PREFIX}${passageId}`;

/** Turns showing a passage into an ordinary move, so the path alone still determines the outcome. */
function citeMove(node: DialogueNode, id: string): DialogueChoice | undefined {
  if (!node.cite || !id.startsWith(CITE_PREFIX)) return undefined;
  const passageId = id.slice(CITE_PREFIX.length);
  const response = node.cite.responses.find((r) => r.passageIds.includes(passageId)) ?? node.cite.otherwise;
  return { id, label: "", strategy: "evidence", note: response.note, next: response.next, scored: response.scored, citedPassage: passageId };
}

const isQuestion = (choice: DialogueChoice) => choice.strategy === "evidence" || choice.strategy === "assumption";

export function startNodeId(spec: DialogueSpec, initialChoiceId: string | undefined): string {
  return (initialChoiceId && spec.starts[initialChoiceId]) || spec.start;
}

/** Replays a list of choice ids from a start node. Scripted, so the path alone determines the outcome. */
export function walk(spec: DialogueSpec, startId: string, choiceIds: string[]): Walk {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  let current = byId.get(startId);
  if (!current) throw new Error(`Unknown dialogue node: ${startId}`);
  const budget = spec.budget;
  const turns: Turn[] = [];
  let used = 0;
  let movedOn = false;
  const outOfQuestions = (node: DialogueNode) => !!budget && !movedOn && used >= budget.questions && node.id !== budget.moveOn.next && node.choices.length > 0;
  for (const id of choiceIds) {
    const open: DialogueChoice[] = outOfQuestions(current) ? [budget!.moveOn] : current.choices;
    const choice: DialogueChoice | undefined = open.find((c) => c.id === id) ?? citeMove(current, id);
    const next: DialogueNode | undefined = choice && byId.get(choice.next);
    if (!choice || !next) break;
    turns.push({ node: current, choice });
    if (isQuestion(choice) && !movedOn) used += 1;
    if (next.id === budget?.moveOn.next) movedOn = true;
    current = next;
  }
  turns.push({ node: current });
  const discovered = [...new Set(turns.flatMap((t) => t.node.reveals ?? []))];
  const limited = outOfQuestions(current);
  return {
    turns,
    current,
    ended: current.choices.length === 0,
    discovered,
    options: limited ? [budget!.moveOn] : current.choices,
    canCite: !limited && !!current.cite,
    questionsLeft: budget && !movedOn ? Math.max(budget.questions - used, 0) : null,
  };
}

const edges = (node: DialogueNode | undefined): string[] => [
  ...(node?.choices ?? []).map((c) => c.next),
  ...(node?.cite ? [...node.cite.responses, node.cite.otherwise].map((r) => r.next) : []),
];

/** Node ids reachable from any opening. */
export function reachableNodes(spec: DialogueSpec): Set<string> {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const stack = [spec.start, ...Object.values(spec.starts), ...(spec.budget ? [spec.budget.moveOn.next] : [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...edges(byId.get(id)));
  }
  return seen;
}

/** True if some path can loop forever, which would trap a learner. */
export function hasCycle(spec: DialogueSpec): boolean {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const state = new Map<string, "active" | "done">();
  const visit = (id: string): boolean => {
    if (state.get(id) === "active") return true;
    if (state.get(id) === "done") return false;
    state.set(id, "active");
    const looped = edges(byId.get(id)).some(visit);
    state.set(id, "done");
    return looped;
  };
  return spec.nodes.some((n) => visit(n.id));
}
