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
}

export function startNodeId(spec: DialogueSpec, initialChoiceId: string | undefined): string {
  return (initialChoiceId && spec.starts[initialChoiceId]) || spec.start;
}

/** Replays a list of choice ids from a start node. Scripted, so the path alone determines the outcome. */
export function walk(spec: DialogueSpec, startId: string, choiceIds: string[]): Walk {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  let current = byId.get(startId);
  if (!current) throw new Error(`Unknown dialogue node: ${startId}`);
  const turns: Turn[] = [];
  for (const id of choiceIds) {
    const choice: DialogueChoice | undefined = current.choices.find((c) => c.id === id);
    const next: DialogueNode | undefined = choice && byId.get(choice.next);
    if (!choice || !next) break;
    turns.push({ node: current, choice });
    current = next;
  }
  turns.push({ node: current });
  const discovered = [...new Set(turns.flatMap((t) => t.node.reveals ?? []))];
  return { turns, current, ended: current.choices.length === 0, discovered };
}

/** Node ids reachable from any opening. */
export function reachableNodes(spec: DialogueSpec): Set<string> {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const stack = [spec.start, ...Object.values(spec.starts)];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const c of byId.get(id)?.choices ?? []) stack.push(c.next);
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
    const looped = (byId.get(id)?.choices ?? []).some((c) => visit(c.next));
    state.set(id, "done");
    return looped;
  };
  return spec.nodes.some((n) => visit(n.id));
}
