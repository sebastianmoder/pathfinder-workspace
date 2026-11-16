"use client";

import { useState } from "react";
import Link from "next/link";
import type { Mission } from "@/content/types";
import { modules } from "@/content/journey";
import { caseStories, chapters, opening } from "@/content/story";
import { caseNumber } from "@/lib/journey-nav";
import { fileOf } from "@/lib/story/story";
import { summarizeMission, summaryToText, type MissionSummary } from "@/lib/summary";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

const book = { opening, chapters, cases: caseStories };

/**
 * The notebook: what each case taught, in the order the cases were meant to be played. A finished case gives
 * its key learning first, then what it added to the trail the story follows, then the player's own judgments
 * and the feedback on them. It can be copied or printed. It is a note to oneself, never a grade.
 */
export function SessionSummary({ missions }: { missions: Mission[] }) {
  const session = useSession();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const rowOf = (m: Mission) => summarizeMission(m, session.progress(m.id), session.isCompleted(m.id));
  const trail = fileOf(book, modules, { flags: session.flags, completed: session.completedIds });
  const cases = modules.flatMap((mod) => {
    const rows = mod.missionIds.flatMap((id): MissionSummary[] => {
      const mission = missions.find((m) => m.id === id);
      const row = mission ? rowOf(mission) : null;
      return row ? [row] : [];
    });
    return rows.length > 0 ? [{ mod, rows, found: trail.find((c) => c.moduleId === mod.id && c.found) }] : [];
  });
  const rows = cases.flatMap((c) => c.rows);
  const confidence = (n: number | null) => (n === null ? "" : ` (${t.mission.confidence[n]})`);

  async function copy() {
    const text = summaryToText({
      heading: t.summary.title,
      note: t.summary.temporary,
      missions: rows,
      labels: {
        takeaway: t.summary.takeaway,
        shown: t.summary.shown,
        selfAssessed: t.summary.selfAssessed,
        review: t.summary.review,
        calibration: t.summary.calibration,
        calibrationText: t.audit.calibration,
        before: t.summary.before,
        after: t.summary.after,
        notFinished: t.summary.notFinished,
      },
      confidenceLabels: t.mission.confidence,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl">{t.summary.title}</h1>
      <p className="mt-2">{t.summary.contains}</p>
      <p className="mt-1 text-sm text-muted">{t.summary.temporary}</p>

      {rows.length === 0 ? (
        <p className="mt-6">
          {t.summary.empty} <Link href="/map" className="underline">{t.summary.openMap}</Link>
        </p>
      ) : (
        <>
          <div className="no-print mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="btn btn-secondary btn-small">{t.summary.copy}</button>
            <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-small">{t.summary.print}</button>
          </div>
          <p role="status" className="no-print mt-2 min-h-5 text-sm">
            {copyStatus === "copied" && t.summary.copied}
            {copyStatus === "failed" && t.summary.copyFailed}
          </p>

          <div className="mt-4 space-y-6">
            {cases.map(({ mod, rows: missionRows, found }) => (
              <section key={mod.id} className="note">
                <p className="case-tab">{t.cases.caseNumber(caseNumber(modules, mod.id))}</p>
                <h2 className="text-2xl">{mod.title}</h2>
                {missionRows.map((m) => (
                  <div key={m.id} className="note-part">
                    {missionRows.length > 1 && <h3 className="mt-3 text-lg font-bold">{m.title}</h3>}
                    {!m.completed && <p className="text-sm text-muted">{t.summary.notFinished}</p>}
                    {m.takeaway && (
                      <div className="learning">
                        <h3 className="learning-label">{t.summary.takeaway}</h3>
                        <p className="learning-text">{m.takeaway}</p>
                      </div>
                    )}
                    <dl className="mt-3 space-y-2 text-sm">
                      {m.before && (
                        <div><dt className="font-semibold">{t.summary.before}</dt><dd>{m.before.label}{confidence(m.before.confidence)}</dd></div>
                      )}
                      {m.after && (
                        <div><dt className="font-semibold">{t.summary.after}</dt><dd>{m.after.label}{confidence(m.after.confidence)}</dd></div>
                      )}
                      {m.calibration && (
                        <div><dt className="font-semibold">{t.summary.calibration}</dt><dd>{t.audit.calibration(m.calibration)}</dd></div>
                      )}
                      {([["shown", m.shown], ["selfAssessed", m.selfAssessed], ["review", m.review]] as const).map(([key, labels]) =>
                        labels.length > 0 ? (
                          <div key={key}>
                            <dt className="font-semibold">{t.summary[key]}</dt>
                            <dd><ul className="list-disc pl-5">{labels.map((s) => <li key={s}>{s}</li>)}</ul></dd>
                          </div>
                        ) : null,
                      )}
                    </dl>
                  </div>
                ))}
                {found && (
                  <div className="trail">
                    <h3 className="trail-label">{t.trail.label}</h3>
                    <p className="font-bold">{found.title}</p>
                    <p>{found.text}</p>
                    {found.ties.length > 0 && (
                      <ul className="trail-ties" aria-label={t.trail.ties}>
                        {found.ties.map((tie) => (
                          <li key={tie.moduleId}>
                            <strong>{tie.title}.</strong> {tie.why}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
