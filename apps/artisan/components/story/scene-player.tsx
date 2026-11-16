"use client";

import { useEffect, useRef, useState } from "react";
import type { Scene } from "@/content/story/types";
import { cast, places } from "@/content/story";
import { unfold, type SaidLine, type StoryState } from "@/lib/story/story";
import { t } from "@/lib/i18n/en";
import { SceneImage, Portrait } from "./art";

/**
 * Story scenes as a running conversation: each line arrives at the bottom and the earlier ones move up, so
 * the whole exchange stays on the page to scroll back through. The player moves it on themselves (there is
 * no timing to keep up with), answers in their own bubble when asked, and can skip to the case at any point.
 * Scenes are authored and say so. An answer given inside a scene is never scored.
 */
export function ScenePlayer({ heading, scenes, state, doneLabel, onDone }: { heading: string; scenes: Scene[]; state: StoryState; doneLabel: string; onDone: () => void }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [shown, setShown] = useState(1);
  const [picks, setPicks] = useState<Record<string, string>>({});
  /** Scenes already played through in this run, kept in the conversation above the current one. */
  const [past, setPast] = useState<{ scene: Scene; lines: SaidLine[] }[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const scene = scenes[sceneIndex];
  const { lines, asking } = unfold(scene, state, picks);
  const count = Math.min(shown, lines.length);
  const atEnd = count >= lines.length;
  const choosing = atEnd && asking;
  const lastScene = sceneIndex === scenes.length - 1;

  // The page follows the conversation down: the newest line is brought to rest just above the controls, which
  // are pinned to the foot of the window. It never scrolls back up, so reading earlier lines isn't interrupted
  // until the player moves on.
  const total = past.length * 1000 + count + (choosing ? 0.5 : 0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const end = endRef.current;
    const bar = barRef.current;
    if (!end || !bar) return;
    const target = end.getBoundingClientRect().bottom + window.scrollY - (window.innerHeight - bar.offsetHeight);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (target > window.scrollY) window.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
  }, [total]);

  // After an answer the options are gone, so focus returns to the button that moves the scene on.
  const answered = Object.keys(picks).length;
  useEffect(() => {
    if (answered > 0) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  const next = () => {
    if (!atEnd) return setShown(count + 1);
    if (lastScene) return onDone();
    setPast([...past, { scene, lines }]);
    setSceneIndex(sceneIndex + 1);
    setShown(1);
    setPicks({});
  };

  return (
    <section className="chat-stage full-bleed" aria-label={t.story.label}>
      <div className="chat">
        <header className="chat-head">
          <h1 className="chat-title">{heading}</h1>
          <p className="chat-note">{t.story.note}</p>
        </header>
        <div className="chat-log" role="log" aria-live="polite" aria-label={t.story.conversation}>
          {past.map((p) => (
            <SceneLines key={p.scene.id} scene={p.scene} lines={p.lines} />
          ))}
          <SceneLines scene={scene} lines={lines.slice(0, count)} />
          <div ref={endRef} />
        </div>
        <div ref={barRef} className="chat-bar">
          {choosing ? (
            <div className="chat-options" role="group" aria-label={t.story.yourAnswer}>
              {asking.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="btn btn-on-mat"
                  onClick={() => {
                    setPicks({ ...picks, [asking.id]: o.id });
                    setShown(count + 2); // the player's own line, and the reply to it
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <button ref={nextRef} type="button" className="btn btn-on-mat" onClick={next}>
                {atEnd && lastScene ? doneLabel : t.story.next}
              </button>
              {!(atEnd && lastScene) && (
                <button type="button" className="chat-skip" onClick={onDone}>{t.story.skip}</button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** One scene in the conversation: where and when it is, then its lines. A speaker is named when they start talking. */
function SceneLines({ scene, lines }: { scene: Scene; lines: SaidLine[] }) {
  return (
    <div className="chat-scene">
      <div className="chat-where">
        {scene.title && <p className="chat-chapter">{scene.title}</p>}
        <p>
          <span className="chat-place">{places[scene.place].name}</span>
          <span className="sr-only">, </span>
          <span className="chat-when">{scene.when}</span>
        </p>
        <SceneImage place={scene.place} />
      </div>
      {lines.map((line, i) => {
        const previous = lines[i - 1];
        if (line.you) {
          return (
            <p key={i} className="chat-line chat-you">
              <span className="sr-only">{t.story.you}: </span>
              <span className="chat-bubble">{line.text}</span>
            </p>
          );
        }
        if (!line.who) {
          return (
            <p key={i} className="chat-line chat-narration">
              <span className="sr-only">{t.story.narration}: </span>
              {line.text}
            </p>
          );
        }
        const speaker = cast[line.who];
        const starts = previous?.who !== line.who || previous?.you;
        const named = !lines.slice(0, i).some((l) => l.who === line.who);
        return (
          <div key={i} className="chat-line chat-them" data-starts={starts || undefined}>
            <span className="chat-avatar">{starts && <Portrait who={speaker.id} />}</span>
            <p className="chat-bubble">
              {starts ? (
                <span className="chat-name">
                  {speaker.name}
                  {named && <span className="chat-role">, {speaker.role}</span>}
                </span>
              ) : (
                <span className="sr-only">{speaker.name}: </span>
              )}
              <span className="chat-text">{line.text}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
