"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { Hint, RankSpec } from "@/content/types";
import { itemKey, type EvidenceResult } from "@/lib/evidence";
import { moveTo, rankSound, rankVerdict, startingOrder, type RankVerdict } from "@/lib/rank";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { useHintLadder } from "../hint-ladder";
import { ActionBar, useReveal } from "../step-ui";

/**
 * Put the cards in order between two labelled ends. Three equal ways to move one: its up and down buttons; select
 * it, then select the card whose place it should take; or drag it by its grip (PRD §8: dragging is never the only
 * way). Only the ends are judged.
 */
export function RankList({
  stepId,
  spec,
  hints = [],
  onEvidence,
  onContinue,
}: {
  stepId: string;
  spec: RankSpec;
  hints?: Hint[];
  onEvidence: (item: string, result: EvidenceResult) => void;
  onContinue: () => void;
}) {
  const uid = useId();
  const { orderSeed } = useSession();
  const initial = useMemo(() => startingOrder(spec, orderSeed, stepId), [spec, orderSeed, stepId]);
  const [moved, setMoved] = useState<string[] | null>(null);
  const order = moved ?? initial;
  const [selected, setSelected] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<RankVerdict | null>(null);
  const [checks, setChecks] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [drag, setDrag] = useState<{ id: string; startY: number; dy: number } | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const ladder = useHintLadder(hints);
  const revealRef = useReveal<HTMLDivElement>(checks);
  const item = (id: string) => spec.items.find((i) => i.id === id)!;

  const place = (id: string, index: number) => {
    const next = moveTo(order, id, index);
    setMoved(next);
    setVerdict(null);
    setAnnouncement(t.rank.moved(item(id).label, next.indexOf(id) + 1, next.length));
  };

  // Dragging: the card follows the pointer; on release it takes the place of the card it was dropped over.
  const dropIndex = (id: string, dy: number) => {
    const cards = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-rank-card]") ?? [])];
    const from = order.indexOf(id);
    const rect = cards[from]?.getBoundingClientRect();
    if (!rect) return from;
    const centre = rect.top + rect.height / 2 + dy;
    let index = 0;
    cards.forEach((c, i) => {
      if (i === from) return;
      const r = c.getBoundingClientRect();
      if (centre > r.top + r.height / 2) index++;
    });
    return index;
  };

  const sound = verdict ? rankSound(verdict) : false;
  const endMark = (pos: "first" | "last") => {
    if (!verdict) return null;
    const ok = pos === "first" ? verdict.first : verdict.last;
    if (ok === null) return null;
    return <span aria-hidden="true" className={ok ? "mark-yes" : "mark-no"}>{ok ? "✔ " : "✖ "}</span>;
  };

  return (
    <div>
      <div className="rank">
        <p className="rank-end" id={`${uid}-top`}>{spec.top}</p>
        <ol ref={listRef} className="rank-list" aria-labelledby={`${uid}-top`}>
          {order.map((id, i) => {
            const it = item(id);
            const pos = i === 0 ? "first" : i === order.length - 1 ? "last" : null;
            const dragging = drag?.id === id;
            return (
              <li
                key={id}
                data-rank-card
                className="rank-card"
                data-selected={selected === id || undefined}
                data-dragging={dragging || undefined}
                style={dragging ? { transform: `translateY(${drag.dy}px)` } : undefined}
              >
                <span
                  className="rank-grip"
                  aria-hidden="true"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDrag({ id, startY: e.clientY, dy: 0 });
                  }}
                  onPointerMove={(e) => drag?.id === id && setDrag({ ...drag, dy: e.clientY - drag.startY })}
                  onPointerUp={() => {
                    if (drag?.id !== id) return;
                    const to = dropIndex(id, drag.dy);
                    setDrag(null);
                    if (to !== i) place(id, to);
                  }}
                  onPointerCancel={() => setDrag(null)}
                >
                  <svg viewBox="0 0 10 16" width="10" height="16"><g fill="currentColor"><circle cx="2.5" cy="3" r="1.4" /><circle cx="7.5" cy="3" r="1.4" /><circle cx="2.5" cy="8" r="1.4" /><circle cx="7.5" cy="8" r="1.4" /><circle cx="2.5" cy="13" r="1.4" /><circle cx="7.5" cy="13" r="1.4" /></g></svg>
                </span>
                <span className="rank-pos" aria-hidden="true">{i + 1}</span>
                <button
                  type="button"
                  className="rank-label"
                  aria-pressed={selected === id}
                  onClick={() => {
                    if (selected && selected !== id) {
                      place(selected, i);
                      setSelected(null);
                    } else setSelected(selected === id ? null : id);
                  }}
                >
                  <span className="sr-only">{t.rank.position(i + 1, order.length)} </span>
                  {pos && endMark(pos)}
                  {it.label}
                  {selected && selected !== id && <span className="sr-only">. {t.rank.putHere(item(selected).label)}</span>}
                </button>
                <span className="rank-moves">
                  <button type="button" className="rank-move" disabled={i === 0} onClick={() => place(id, i - 1)}>
                    <span aria-hidden="true">▲</span><span className="sr-only">{t.rank.up(it.label)}</span>
                  </button>
                  <button type="button" className="rank-move" disabled={i === order.length - 1} onClick={() => place(id, i + 1)}>
                    <span aria-hidden="true">▼</span><span className="sr-only">{t.rank.down(it.label)}</span>
                  </button>
                </span>
                {verdict && <p className="rank-why text-sm">{it.explanation}</p>}
              </li>
            );
          })}
        </ol>
        <p className="rank-end">{spec.bottom}</p>
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div ref={revealRef} className="reveal">
        {verdict && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-3" role="status">
            <p className="font-bold">
              <span aria-hidden="true" className={sound ? "mark-yes" : "mark-no"}>{sound ? "✔ " : "✖ "}</span>
              {sound ? t.rank.sound : !verdict.first ? t.rank.topWrong : t.rank.bottomWrong}
            </p>
            {sound && spec.takeaway && <p className="mt-1">{spec.takeaway}</p>}
          </div>
        )}
      </div>
      {ladder.list}

      <ActionBar note={selected ? t.rank.chooseSpot(item(selected).label) : verdict && !sound ? t.rank.tryAgain : undefined}>
        <button
          type="button"
          disabled={!!verdict}
          onClick={() => {
            const v = rankVerdict(spec, order);
            onEvidence(itemKey(stepId, "first"), { right: v.first, assisted: ladder.used });
            if (v.last !== null) onEvidence(itemKey(stepId, "last"), { right: v.last, assisted: ladder.used });
            setVerdict(v);
            setSelected(null);
            setChecks((n) => n + 1);
          }}
          className="btn btn-primary"
        >
          {t.rank.check}
        </button>
        {!verdict && ladder.button}
        {verdict && (
          <button type="button" onClick={onContinue} className="btn btn-primary">
            {t.mission.next}
          </button>
        )}
      </ActionBar>
    </div>
  );
}
