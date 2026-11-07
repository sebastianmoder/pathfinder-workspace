import type { NodeState } from "@/lib/journey-nav";

/**
 * A stop on the route, punched like an eyelet in the sheet. State reads from the shape as well as the colour:
 * a stamped tick when done, half filled when under way, a thick highlighter ring for next, an empty ring otherwise.
 * Bridges are diamonds, so the seams between stages stand out.
 */
export function Eyelet({ state, bridge, size = "md" }: { state: NodeState; bridge?: boolean; size?: "sm" | "md" }) {
  return (
    <svg viewBox="-12 -12 24 24" className="eyelet" data-state={state} data-size={size} aria-hidden="true" focusable="false">
      {bridge ? <rect x="-8" y="-8" width="16" height="16" rx="1.5" transform="rotate(45)" className="eyelet-ring" /> : <circle r="9.5" className="eyelet-ring" />}
      {(state === "active" || state === "reached") &&
        (bridge ? <path d="M -11.3 0 L 0 -11.3 L 11.3 0 Z" transform="rotate(180)" className="eyelet-fill" /> : <path d="M -9.5 0 A 9.5 9.5 0 0 0 9.5 0 Z" className="eyelet-fill" />)}
      {state === "done" && <path d="M -4.6 0.4 L -1.3 3.7 L 5 -3.6" className="eyelet-tick" />}
    </svg>
  );
}

/** The capstone's seal: one notch per stage, filled when that stage is finished. */
export function Seal({ filled, state }: { filled: boolean[]; state: NodeState }) {
  const notch = (i: number) => {
    const a = (-90 + i * 90) * (Math.PI / 180);
    return { cx: Math.cos(a) * 15.5, cy: Math.sin(a) * 15.5 };
  };
  return (
    <svg viewBox="-21 -21 42 42" className="seal" data-state={state} aria-hidden="true" focusable="false">
      <circle r="12" className="eyelet-ring" />
      {(state === "active" || state === "reached") && <path d="M -12 0 A 12 12 0 0 0 12 0 Z" className="eyelet-fill" />}
      {state === "done" && <path d="M -5.8 0.5 L -1.6 4.7 L 6.3 -4.5" className="eyelet-tick" />}
      {filled.map((on, i) => (
        <circle key={i} r="3.4" {...notch(i)} className="seal-notch" data-on={on} />
      ))}
    </svg>
  );
}
