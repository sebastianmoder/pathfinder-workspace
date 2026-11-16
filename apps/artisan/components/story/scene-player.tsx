"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Scene } from "@/content/story/types";
import { cast, places } from "@/content/story";
import { unfold, type StoryState } from "@/lib/story/story";
import { t } from "@/lib/i18n/en";
import { Backdrop, Portrait } from "./art";

/**
 * Plays story scenes one line at a time: a place, whoever is speaking, and what they say. The player moves it
 * on themselves, so there is no timing to keep up with, and can skip to the case at any point. Scenes are
 * authored and say so. A question inside a scene is never scored.
 */
export function ScenePlayer({ scenes, state, doneLabel, onDone }: { scenes: Scene[]; state: StoryState; doneLabel: string; onDone: () => void }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [shown, setShown] = useState(1);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const logId = useId();
  const nextRef = useRef<HTMLButtonElement>(null);
  const scene = scenes[sceneIndex];
  const { lines, asking } = unfold(scene, state, picks);
  const count = Math.min(shown, lines.length);
  const line = lines[count - 1];
  const atEnd = count >= lines.length;
  const choosing = atEnd && asking;
  const lastScene = sceneIndex === scenes.length - 1;
  const speaker = line.who ? cast[line.who] : null;

  // After an answer the options are gone, so focus returns to the button that moves the scene on.
  const answered = Object.keys(picks).length;
  useEffect(() => {
    if (answered > 0) nextRef.current?.focus();
  }, [answered]);

  const next = () => {
    if (!atEnd) return setShown(count + 1);
    if (lastScene) return onDone();
    setSceneIndex(sceneIndex + 1);
    setShown(1);
    setPicks({});
    window.scrollTo({ top: 0 });
  };

  return (
    <section className="scene-stage full-bleed" aria-label={t.story.label}>
      <div className="scene-frame">
        <div className="scene-set">
          <Backdrop place={scene.place} />
          <p className="scene-where">
            <span className="scene-place">{places[scene.place].name}</span>
            <span className="scene-when">{scene.when}</span>
          </p>
          {scene.title && count === 1 && <h1 className="scene-title">{scene.title}</h1>}
          {speaker && <Portrait key={speaker.id} who={speaker.id} />}
        </div>

        <div className="scene-slip" data-voice={speaker ? "spoken" : "narration"}>
          <div aria-live="polite" aria-atomic="true">
            {speaker ? (
              <p className="scene-speaker">
                {speaker.name}
                <span className="scene-role">, {speaker.role}</span>
              </p>
            ) : (
              <p className="sr-only">{t.story.narration}</p>
            )}
            <p key={`${sceneIndex}-${count}`} className="scene-line">{line.text}</p>
          </div>

          {choosing ? (
            <div className="scene-options" role="group" aria-label={t.story.yourAnswer}>
              {asking.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setPicks({ ...picks, [asking.id]: o.id });
                    setShown(count + 1);
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="scene-actions">
              <button ref={nextRef} type="button" className="btn btn-primary" onClick={next}>
                {atEnd && lastScene ? doneLabel : t.story.next}
              </button>
              {!(atEnd && lastScene) && (
                <button type="button" className="scene-skip" onClick={onDone}>{t.story.skip}</button>
              )}
            </div>
          )}

          {count > 1 && (
            <details className="scene-log">
              <summary>{t.story.earlier}</summary>
              <ol id={logId}>
                {lines.slice(0, count - 1).map((l, i) => (
                  <li key={i}>
                    {l.who && <strong>{cast[l.who].name}: </strong>}
                    {l.text}
                  </li>
                ))}
              </ol>
            </details>
          )}
          <p className="scene-note">{t.story.note}</p>
        </div>
      </div>
    </section>
  );
}
