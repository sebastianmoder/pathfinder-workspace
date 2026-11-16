"use client";

import { useId, useState } from "react";
import { modules } from "@/content/journey";
import { missions } from "@/content/missions";
import { caseStories, chapters, flags, opening } from "@/content/story";
import { moduleDone } from "@/lib/journey-nav";
import { decodeCode, encodeCode } from "@/lib/session/return-code";
import { emptyProgress } from "@/lib/session/stored-progress";
import { useSession } from "@/lib/session/session";
import { codeShape, scenesPlayedBy } from "@/lib/story/story";
import { t } from "@/lib/i18n/en";
import { ExportSave, LoadSave } from "./save-controls";

const book = { opening, chapters, cases: caseStories };
const shape = codeShape(missions.map((m) => m.id), flags);

/** Everything about the game itself, as opposed to what was learned in it: saving, moving, starting over. */
export function Settings() {
  const session = useSession();
  const codeId = useId();
  const dangerId = useId();
  const [typed, setTyped] = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "used" | "copied" | "malformed" | "mistyped" | "version">("idle");
  const [cleared, setCleared] = useState(false);
  const cases = modules.filter((m) => m.status === "available");
  const done = cases.filter((m) => moduleDone(m, session.completedIds)).length;
  const hasGame = session.completedIds.length > 0 || Object.keys(session.snapshot().missions).length > 0;
  const code = encodeCode(shape, { completed: session.completedIds, flags: session.flags });

  function applyCode() {
    const result = decodeCode(shape, typed);
    if (!result.ok) return setCodeStatus(result.reason);
    if (hasGame && !window.confirm(t.settings.codeConfirm)) return;
    const { completed, flags: storyFlags } = result.content;
    session.load({ ...emptyProgress(), completed, story: { flags: storyFlags, scenes: scenesPlayedBy(book, modules, completed) } });
    setTyped("");
    setCodeStatus("used");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl">{t.settings.title}</h1>
      <p className="mt-2">{t.settings.progress(done, cases.length)}</p>

      <section className="settings-part">
        <h2 className="text-2xl">{t.settings.saveTitle}</h2>
        <p className="mt-1 max-w-2xl">{t.settings.saveHelp}</p>
        <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-2">
          <ExportSave />
          <LoadSave />
        </div>
      </section>

      <section className="settings-part">
        <h2 className="text-2xl">{t.settings.codeTitle}</h2>
        <p className="mt-1 max-w-2xl">{t.settings.codeHelp}</p>
        <p className="mt-3">
          {t.settings.codeYours} <strong className="return-code">{code}</strong>{" "}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCodeStatus("copied");
              } catch {
                setCodeStatus("idle");
              }
            }}
          >
            {t.settings.codeCopy}
          </button>
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor={codeId} className="block text-sm font-bold">{t.settings.codeEnter}</label>
            <input
              id={codeId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="return-code mt-1 w-56 border-2 border-border bg-surface px-2 py-1.5"
            />
          </div>
          <button type="button" className="btn btn-secondary" disabled={typed.trim() === ""} onClick={applyCode}>{t.settings.codeUse}</button>
        </div>
        <p role="status" className="mt-2 min-h-5 text-sm">{codeStatus !== "idle" && t.settings.codeStatus[codeStatus]}</p>
      </section>

      <section className="settings-part" aria-labelledby={dangerId}>
        <h2 id={dangerId} className="text-2xl">{t.settings.dangerTitle}</h2>
        <div className="danger-zone mt-3">
          <div className="danger-row">
            <div className="max-w-xl">
              <h3 className="font-bold">{t.settings.clearTitle}</h3>
              <p className="mt-1 text-sm">{t.settings.clearHelp}</p>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-small shrink-0"
              onClick={() => {
                if (!window.confirm(t.summary.resetConfirm)) return;
                session.resetProgress();
                setCleared(true);
              }}
            >
              {t.summary.reset}
            </button>
          </div>
        </div>
        <p role="status" className="mt-2 min-h-5 text-sm">{cleared && t.summary.resetDone}</p>
      </section>
    </div>
  );
}
