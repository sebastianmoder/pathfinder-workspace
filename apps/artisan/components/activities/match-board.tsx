"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Hint, MatchSpec } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { keepRight, matchResults, pair, unpair, type Pairs } from "@/lib/match";
import { seededShuffle } from "@/lib/shuffle";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { useHintLadder } from "../hint-ladder";
import { ActionBar, useReveal } from "../step-ui";

interface Thread {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  state: "pinned" | "right" | "wrong";
}

/**
 * Pin each card on the left to one on the right. Select a card, then its partner: in the right-hand column, or
 * with the buttons in the action bar, which stay in view on a narrow screen (PRD §8: no dragging needed). On wide
 * screens a thread is drawn between each pair; the label under each card says the same thing in words.
 */
export function MatchBoard({
  stepId,
  spec,
  hints = [],
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: MatchSpec;
  hints?: Hint[];
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const { orderSeed } = useSession();
  const right = useMemo(() => seededShuffle(spec.right, orderSeed, `${stepId}-right`), [spec.right, orderSeed, stepId]);
  const [pairs, setPairs] = useState<Pairs>({});
  const [selected, setSelected] = useState<string | null>(spec.left[0]?.id ?? null);
  const [checked, setChecked] = useState<Record<string, boolean> | null>(null);
  const [checks, setChecks] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const ladder = useHintLadder(hints);
  const revealRef = useReveal<HTMLDivElement>(checks);

  const leftLabel = (id: string) => spec.left.find((l) => l.id === id)?.label ?? "";
  const rightLabel = (id: string) => spec.right.find((r) => r.id === id)?.label ?? "";
  const allPaired = spec.left.every((l) => pairs[l.id]);
  const allRight = !!checked && Object.values(checked).every(Boolean);
  const pairedTo = (rightId: string) => Object.entries(pairs).find(([, r]) => r === rightId)?.[0];

  const pin = (leftId: string, rightId: string) => {
    const next = pair(pairs, leftId, rightId);
    setPairs(next);
    setChecked(null);
    setAnnouncement(t.match.pinned(leftLabel(leftId), rightLabel(rightId)));
    setSelected(spec.left.find((l) => !next[l.id] && l.id !== leftId)?.id ?? null);
  };

  const check = () => {
    const results = matchResults(spec, pairs);
    for (const l of spec.left) onEvidence(itemKey(stepId, l.id), { right: results[l.id], assisted: ladder.used });
    setChecked(results);
    setChecks((n) => n + 1);
  };

  // Threads: measured from the cards, redrawn when the layout changes. Only drawn when the columns sit side by side.
  const boardRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLElement | null>>({});
  const [threads, setThreads] = useState<Thread[]>([]);
  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const box = board.getBoundingClientRect();
    const out: Thread[] = [];
    for (const [l, r] of Object.entries(pairs)) {
      const a = leftRefs.current[l]?.getBoundingClientRect();
      const b = rightRefs.current[r]?.getBoundingClientRect();
      if (!a || !b || b.left < a.right) continue; // stacked: no room for a thread
      out.push({
        id: l,
        x1: a.right - box.left,
        y1: a.top + a.height / 2 - box.top,
        x2: b.left - box.left,
        y2: b.top + b.height / 2 - box.top,
        state: checked ? (checked[l] ? "right" : "wrong") : "pinned",
      });
    }
    setThreads(out);
  }, [pairs, checked]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const board = boardRef.current;
    if (!board || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(board);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div>
      <div ref={boardRef} className="match-board">
        <svg className="match-threads" aria-hidden="true">
          {threads.map((th) => {
            const mid = (th.x1 + th.x2) / 2;
            return (
              <path
                key={th.id}
                d={`M ${th.x1} ${th.y1} C ${mid} ${th.y1}, ${mid} ${th.y2}, ${th.x2} ${th.y2}`}
                className="match-thread"
                data-state={th.state}
              />
            );
          })}
        </svg>
        <section aria-labelledby={`${uid}-left`} className="match-col">
          <h3 id={`${uid}-left`} className="font-bold">{spec.leftLabel}</h3>
          <ul className="mt-2 space-y-2">
            {spec.left.map((l) => {
              const result = checked?.[l.id];
              return (
                <li key={l.id}>
                  <button
                    ref={(el) => { leftRefs.current[l.id] = el; }}
                    type="button"
                    aria-pressed={selected === l.id}
                    onClick={() => setSelected(selected === l.id ? null : l.id)}
                    className="match-card"
                    data-paired={!!pairs[l.id]}
                  >
                    <span className="block">
                      {result !== undefined && <span aria-hidden="true" className={result ? "mark-yes" : "mark-no"}>{result ? "✔ " : "✖ "}</span>}
                      {l.label}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {pairs[l.id] ? t.match.pairedWith(rightLabel(pairs[l.id])) : t.match.notPaired}
                    </span>
                  </button>
                  {checked && result !== undefined && (
                    <p className="mt-1 text-sm" role="status">
                      <strong>{result ? t.sort.fits : t.sort.tryAnother}</strong> {result ? l.explanation : t.match.cameLoose}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby={`${uid}-right`} className="match-col">
          <h3 id={`${uid}-right`} className="font-bold">{spec.rightLabel}</h3>
          <ul className="mt-2 space-y-2">
            {right.map((r) => {
              const owner = pairedTo(r.id);
              return (
                <li key={r.id}>
                  <button
                    ref={(el) => { rightRefs.current[r.id] = el; }}
                    type="button"
                    disabled={!selected}
                    onClick={() => selected && pin(selected, r.id)}
                    className="match-card match-target"
                    data-paired={!!owner}
                  >
                    <span className="sr-only">{selected ? t.match.pinTo(leftLabel(selected)) : ""} </span>
                    {r.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div ref={revealRef} className="reveal">
        {allRight && spec.outcome && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-3" role="status">
            <p>{spec.outcome}</p>
          </div>
        )}
      </div>
      {ladder.list}

      <ActionBar
        note={
          selected
            ? t.match.choosePartner(leftLabel(selected))
            : !allPaired
              ? t.match.pairAll(spec.left.filter((l) => !pairs[l.id]).length)
              : checked && !allRight
                ? t.match.fixSome
                : undefined
        }
      >
        {selected ? (
          <>
            {right.map((r) => (
              <button key={r.id} type="button" onClick={() => pin(selected, r.id)} className="btn btn-secondary btn-small match-bar-option">
                <span className="sr-only">{t.match.pinTo(leftLabel(selected))} </span>{r.label}
              </button>
            ))}
            {pairs[selected] && (
              <button
                type="button"
                onClick={() => {
                  setPairs(unpair(pairs, selected));
                  setChecked(null);
                  setAnnouncement(t.match.unpinned(leftLabel(selected)));
                }}
                className="btn btn-secondary btn-small"
              >
                {t.match.unpin}
              </button>
            )}
          </>
        ) : (
          <>
            {checked && !allRight ? (
              <button
                type="button"
                onClick={() => {
                  setPairs(keepRight(spec, pairs));
                  setChecked(null);
                  setSelected(spec.left.find((l) => !checked[l.id])?.id ?? null);
                }}
                className="btn btn-secondary"
              >
                {t.match.tryWrong}
              </button>
            ) : (
              <button type="button" disabled={!allPaired || !!checked} onClick={check} className="btn btn-primary">
                {t.match.check}
              </button>
            )}
            {!checked && ladder.button}
            {checked && !allRight && (
              <button
                type="button"
                onClick={() => {
                  setPairs(Object.fromEntries(spec.left.map((l) => [l.id, l.matchId])));
                  setChecked(Object.fromEntries(spec.left.map((l) => [l.id, true])));
                }}
                className="btn btn-secondary"
              >
                {t.mission.showAnswer}
              </button>
            )}
            {checked && (
              <button type="button" onClick={onContinue} className="btn btn-primary">
                {t.mission.next}
              </button>
            )}
          </>
        )}
      </ActionBar>
    </div>
  );
}
