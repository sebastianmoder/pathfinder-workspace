"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { t } from "@/lib/i18n/en";

/**
 * The buttons that move an activity on. Sticky to the bottom of the window while the activity is on screen,
 * so the next action never sits out of sight below the material. `note` says what is still needed.
 */
export function ActionBar({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="action-bar">
      <div className="flex flex-wrap items-center gap-3">{children}</div>
      {note ? <p className="mt-1.5 text-sm text-muted" aria-live="polite">{note}</p> : null}
    </div>
  );
}

/** "How to do this": the moves the learner makes in this step, in order. */
export function HowTo({ steps }: { steps: readonly string[] | undefined }) {
  if (!steps || steps.length === 0) return null;
  return (
    <section className="howto mt-3" aria-label={t.howTo.label}>
      <p className="text-sm font-bold">{t.howTo.label}</p>
      <ol>
        {steps.map((s) => (
          <li key={s}>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A step's heading, what it is about, and how to do it. */
export function StepIntro({
  title,
  intro,
  howTo,
  as: Heading = "h2",
  headingRef,
}: {
  title: ReactNode;
  intro?: ReactNode;
  howTo?: readonly string[];
  as?: "h2" | "h3";
  headingRef?: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="mb-5">
      <Heading ref={headingRef} tabIndex={headingRef ? -1 : undefined} className={Heading === "h2" ? "text-2xl" : "text-xl font-bold"}>
        {title}
      </Heading>
      {intro ? <p className="mt-1 max-w-3xl">{intro}</p> : null}
      <HowTo steps={howTo} />
    </div>
  );
}

/**
 * When `key` changes to a truthy value, brings the element into view if it is off screen or hidden behind the
 * action bar, so feedback that appears after an action is never missed. It never scrolls content that is
 * already visible, and it respects reduced motion.
 */
export function useReveal<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  const seen = useRef(key);
  useEffect(() => {
    if (key === seen.current) return;
    seen.current = key;
    if (!key) return;
    const el = ref.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Inside a panel with its own scrolling (the audit's judgment panel), scroll that panel instead.
      const panel = el.closest<HTMLElement>("[data-scroll-panel]");
      if (panel && panel.scrollHeight > panel.clientHeight) {
        el.scrollIntoView({ block: "nearest", behavior: smooth ? "smooth" : "auto" });
        return;
      }
      const r = el.getBoundingClientRect();
      const bar = 96; // room for the sticky action bar
      const viewBottom = window.innerHeight - bar;
      if (r.top >= 0 && r.bottom <= viewBottom) return;
      // Show the top of the feedback, and as much of it as fits above the action bar.
      const delta = r.height > viewBottom - 80 || r.top < 0 ? r.top - 80 : r.bottom - viewBottom;
      window.scrollBy({ top: delta, behavior: smooth ? "smooth" : "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [key]);
  return ref;
}
